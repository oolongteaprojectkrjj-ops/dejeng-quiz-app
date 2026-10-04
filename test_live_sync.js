const https = require("https");

const SPREADSHEET_ID = "1kIlcPLr0GPp3yZkpoc9xEFrIBkKSvJLFVLHYMLnJmwk";
const GIDS = {
  original: "2027326776",
  fruit: "0",
  milk: "1779471103",
  latte: "1310235048",
  cheese: "1122583649"
};

function fetchCsv(gid) {
  return new Promise((resolve, reject) => {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${gid}&_t=${Date.now()}`;
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, (res2) => {
          let data = "";
          res2.on("data", c => data += c);
          res2.on("end", () => resolve(data));
        }).on("error", reject);
      } else {
        let data = "";
        res.on("data", c => data += c);
        res.on("end", () => resolve(data));
      }
    }).on("error", reject);
  });
}

function parseCSV(text) {
  const lines = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (c === "\"" && next === "\"") { cell += "\""; i++; }
      else if (c === "\"") { inQuotes = false; }
      else { cell += c; }
    } else {
      if (c === "\"") { inQuotes = true; }
      else if (c === ",") { row.push(cell.trim()); cell = ""; }
      else if (c === "\r") {}
      else if (c === "\n") { row.push(cell.trim()); lines.push(row); row = []; cell = ""; }
      else { cell += c; }
    }
  }
  if (cell || row.length > 0) { row.push(cell.trim()); lines.push(row); }
  return lines;
}

function parseNum(val) {
  if (val === undefined || val === null || val === "" || val === "-") return 0;
  if (typeof val === "string" && val.toLowerCase() === "x") return "x";
  const n = Number(val);
  return isNaN(n) ? val : n;
}

function parseSyrup(str) {
  if (!str) return [0, 0, 0, 0];
  const parts = str.toString().trim().split(/\s+/).map(Number);
  while (parts.length < 4) parts.push(0);
  return parts.slice(0, 4);
}

function compileDatabase(sheets) {
  const origRows = sheets.original;
  const milkRows = sheets.milk;
  const latteRows = sheets.latte;
  const fruitRows = sheets.fruit;
  const cheeseRows = sheets.cheese;
  const iceCols = ["보통", "적게", "매우적게", "없이", "뜨겁게"];

  // 1. Original
  const original = {};
  function extOrig(startR, hasWater) {
    const res = { 보통: {}, 적게: {}, 매우적게: {}, 없이: {}, 뜨겁게: {} };
    const iceR = origRows[startR], sR = origRows[startR + 1], tR = origRows[startR + 2];
    const wR = hasWater ? origRows[startR + 3] : null;
    const sBotong = parseSyrup(sR[3]);
    const sJeokge = sR[4] ? parseSyrup(sR[4]) : sBotong;
    const sMaeu = parseSyrup(sR[5]);
    const sEopsi = sR[6] ? parseSyrup(sR[6]) : sMaeu;
    const sHot = sR[7] ? parseSyrup(sR[7]) : sMaeu;
    const sMap = { 보통: sBotong, 적게: sJeokge, 매우적게: sMaeu, 없이: sEopsi, 뜨겁게: sHot };

    iceCols.forEach((k, idx) => {
      const col = 3 + idx;
      res[k] = { ice: parseNum(iceR[col]), syrup: sMap[k], tea: parseNum(tR[col]) };
      if (hasWater && wR) res[k].hotwater = parseNum(wR[col]);
    });
    return res;
  }
  original["black_M"] = extOrig(9, true);
  original["black_L"] = extOrig(13, true);
  original["green_M"] = extOrig(17, false);
  original["green_L"] = extOrig(20, false);
  original["spring_M"] = extOrig(23, false);
  original["spring_L"] = extOrig(26, false);

  // 2. Milk
  const milk = {};
  function extMilkStandard(startR) {
    const res = { 보통: {}, 적게: {}, 매우적게: {}, 없이: {}, 뜨겁게: {} };
    const iceR = milkRows[startR], sR = milkRows[startR + 1], cR = milkRows[startR + 2], tR = milkRows[startR + 3];
    const sBotong = parseSyrup(sR[3]);
    const sJeokge = sR[4] ? parseSyrup(sR[4]) : sBotong;
    const sMaeu = parseSyrup(sR[5]);
    const sEopsi = sR[6] ? parseSyrup(sR[6]) : sMaeu;
    const sHot = sR[7] ? parseSyrup(sR[7]) : sMaeu;
    const sMap = { 보통: sBotong, 적게: sJeokge, 매우적게: sMaeu, 없이: sEopsi, 뜨겁게: sHot };

    iceCols.forEach((k, idx) => {
      const col = 3 + idx;
      res[k] = { ice: parseNum(iceR[col]), syrup: sMap[k], creamer: parseNum(cR[col]), tea: parseNum(tR[col]) };
    });
    return res;
  }
  function extMilkHojicha(startR) {
    const res = { 보통: {}, 적게: {}, 매우적게: {}, 없이: {}, 뜨겁게: {} };
    const iceR = milkRows[startR], sR = milkRows[startR + 1], hR = milkRows[startR + 2], cR = milkRows[startR + 3], wR = milkRows[startR + 4];
    const sBotong = parseSyrup(sR[3]);
    const sJeokge = sR[4] ? parseSyrup(sR[4]) : sBotong;
    const sMaeu = parseSyrup(sR[5]);
    const sEopsi = sR[6] ? parseSyrup(sR[6]) : sMaeu;
    const sHot = sR[7] ? parseSyrup(sR[7]) : sMaeu;
    const sMap = { 보통: sBotong, 적게: sJeokge, 매우적게: sMaeu, 없이: sEopsi, 뜨겁게: sHot };

    iceCols.forEach((k, idx) => {
      const col = 3 + idx;
      res[k] = { ice: parseNum(iceR[col]), syrup: sMap[k], hojicha: parseNum(hR[col]), creamer: parseNum(cR[col]), hotwater: parseNum(wR[col]) };
    });
    return res;
  }
  milk["black_M"] = extMilkStandard(3);
  milk["black_L"] = extMilkStandard(7);
  milk["hojicha_M"] = extMilkHojicha(11);
  milk["hojicha_L"] = extMilkHojicha(16);
  milk["black_topping_M"] = extMilkStandard(22);
  milk["black_topping_L"] = extMilkStandard(26);

  // 3. Latte
  const latte = {};
  function extLatteStandard(startR) {
    const res = { 보통: {}, 적게: {}, 매우적게: {}, 없이: {}, 뜨겁게: {} };
    const iceR = latteRows[startR], sR = latteRows[startR + 1], tR = latteRows[startR + 2], mR = latteRows[startR + 3];
    const sBotong = parseSyrup(sR[3]);
    const sJeokge = sR[4] ? parseSyrup(sR[4]) : sBotong;
    const sMaeu = parseSyrup(sR[5]);
    const sEopsi = sR[6] ? parseSyrup(sR[6]) : sMaeu;
    const sHot = sR[7] ? parseSyrup(sR[7]) : sBotong;
    const sMap = { 보통: sBotong, 적게: sJeokge, 매우적게: sMaeu, 없이: sEopsi, 뜨겁게: sHot };

    iceCols.forEach((k, idx) => {
      const col = 3 + idx;
      res[k] = { ice: parseNum(iceR[col] || (k === "뜨겁게" ? "x" : iceR[3])), syrup: sMap[k], tea: parseNum(tR[col]), milk: parseNum(mR[col]) };
    });
    return res;
  }
  function extLatteHojicha(startR) {
    const res = { 보통: {}, 적게: {}, 매우적게: {}, 없이: {}, 뜨겁게: {} };
    const iceR = latteRows[startR], sR = latteRows[startR + 1], hR = latteRows[startR + 2], wR = latteRows[startR + 3], mR = latteRows[startR + 4];
    const sBotong = parseSyrup(sR[3]);
    const sJeokge = sR[4] ? parseSyrup(sR[4]) : sBotong;
    const sMaeu = parseSyrup(sR[5]);
    const sEopsi = sR[6] ? parseSyrup(sR[6]) : sMaeu;
    const sHot = sR[7] ? parseSyrup(sR[7]) : sBotong;
    const sMap = { 보통: sBotong, 적게: sJeokge, 매우적게: sMaeu, 없이: sEopsi, 뜨겁게: sHot };

    iceCols.forEach((k, idx) => {
      const col = 3 + idx;
      res[k] = { ice: parseNum(iceR[col] || (k === "뜨겁게" ? "x" : iceR[3])), syrup: sMap[k], hojicha: parseNum(hR[col]), hotwater: parseNum(wR[col]), milk: parseNum(mR[col]) };
    });
    return res;
  }
  latte["black_M"] = extLatteStandard(3);
  latte["black_L"] = extLatteStandard(7);
  latte["hojicha_M"] = extLatteHojicha(12);
  latte["hojicha_L"] = extLatteHojicha(17);

  // 4. Fruit
  const fruit = {};
  const fruitIce = ["보통", "적게", "매우적게", "없이"];
  function extGrape(startR) {
    const res = { 보통: {}, 적게: {}, 매우적게: {}, 없이: {} };
    const iceR = fruitRows[startR], sR = fruitRows[startR + 1], gR = fruitRows[startR + 2], pR = fruitRows[startR + 3], dR = fruitRows[startR + 4];
    const sBotong = parseSyrup(sR[3]);
    const sJeokge = sR[4] ? parseSyrup(sR[4]) : sBotong;
    const sMaeu = parseSyrup(sR[5]);
    const sEopsi = sR[6] ? parseSyrup(sR[6]) : sMaeu;
    const sMap = { 보통: sBotong, 적게: sJeokge, 매우적게: sMaeu, 없이: sEopsi };

    fruitIce.forEach((k, idx) => {
      const col = 3 + idx;
      res[k] = {
        ice: parseNum(iceR[col] || (col === 6 ? iceR[5] : iceR[3])),
        syrup: sMap[k],
        grapefruit: parseNum(gR[col] || (col === 6 ? (gR[5] || gR[3]) : gR[3])),
        pomelo: parseNum(pR[col] || (col === 6 ? (pR[5] || pR[3]) : pR[3])),
        dark: parseNum(dR[col] || (col === 6 ? (dR[5] || dR[3]) : dR[3]))
      };
    });
    return res;
  }
  function extOrange(startR) {
    const res = { 보통: {}, 적게: {}, 매우적게: {}, 없이: {} };
    const iceR = fruitRows[startR], sR = fruitRows[startR + 1], oR = fruitRows[startR + 2], spR = fruitRows[startR + 3], dR = fruitRows[startR + 5];
    const sBotong = parseSyrup(sR[3]);
    const sJeokge = sR[4] ? parseSyrup(sR[4]) : sBotong;
    const sMaeu = parseSyrup(sR[5]);
    const sEopsi = sR[6] ? parseSyrup(sR[6]) : sMaeu;
    const sMap = { 보통: sBotong, 적게: sJeokge, 매우적게: sMaeu, 없이: sEopsi };

    fruitIce.forEach((k, idx) => {
      const col = 3 + idx;
      res[k] = {
        ice: parseNum(iceR[col] || (col === 6 ? iceR[5] : iceR[3])),
        syrup: sMap[k],
        orange: parseNum(oR[col] || (col === 6 ? (oR[5] || oR[3]) : oR[3])),
        spring: parseNum(spR[col] || (col === 6 ? (spR[5] || spR[3]) : spR[3])),
        dark: parseNum(dR[col] || (col === 6 ? (dR[5] || dR[3]) : dR[3]))
      };
    });
    return res;
  }
  function extLemon(startR) {
    const res = { 보통: {}, 적게: {}, 매우적게: {}, 없이: {} };
    const iceR = fruitRows[startR], sR = fruitRows[startR + 1], lR = fruitRows[startR + 2], spR = fruitRows[startR + 3], dR = fruitRows[startR + 4];
    const sBotong = parseSyrup(sR[3]);
    const sJeokge = sR[4] ? parseSyrup(sR[4]) : sBotong;
    const sMaeu = parseSyrup(sR[5]);
    const sEopsi = sR[6] ? parseSyrup(sR[6]) : sMaeu;
    const sMap = { 보통: sBotong, 적게: sJeokge, 매우적게: sMaeu, 없이: sEopsi };

    fruitIce.forEach((k, idx) => {
      const col = 3 + idx;
      res[k] = {
        ice: parseNum(iceR[col] || (col === 6 ? iceR[5] : iceR[3])),
        syrup: sMap[k],
        lemon: parseNum(lR[col] || (col === 6 ? (lR[5] || lR[3]) : lR[3])),
        spring: parseNum(spR[col] || (col === 6 ? (spR[5] || spR[3]) : spR[3])),
        dark: parseNum(dR[col] || (col === 6 ? (dR[5] || dR[3]) : dR[3]))
      };
    });
    return res;
  }
  fruit["grapefruit_M"] = extGrape(3);
  fruit["grapefruit_L"] = extGrape(8);
  fruit["orange_M"] = extOrange(14);
  fruit["orange_L"] = extOrange(20);
  fruit["lemon_M"] = extLemon(27);
  fruit["lemon_L"] = extLemon(33);

  // 5. Cheese
  const cheese = {
    black_M: { ice: parseNum(cheeseRows[3][3]), syrup: parseSyrup(cheeseRows[4][3]), tea: parseNum(cheeseRows[5][3]), hotwater: parseNum(cheeseRows[6][3]) },
    black_L: { ice: parseNum(cheeseRows[7][3]), syrup: parseSyrup(cheeseRows[8][3]), tea: parseNum(cheeseRows[9][3]), hotwater: parseNum(cheeseRows[10][3]) },
    green_M: { ice: parseNum(cheeseRows[11][3]), syrup: parseSyrup(cheeseRows[12][3]), tea: parseNum(cheeseRows[13][3]) },
    green_L: { ice: parseNum(cheeseRows[15][3]), syrup: parseSyrup(cheeseRows[16][3]), tea: parseNum(cheeseRows[17][3]) },
    spring_M: { ice: parseNum(cheeseRows[11][3]), syrup: parseSyrup(cheeseRows[12][3]), tea: parseNum(cheeseRows[14][3]) },
    spring_L: { ice: parseNum(cheeseRows[15][3]), syrup: parseSyrup(cheeseRows[16][3]), tea: parseNum(cheeseRows[18][3]) },
    hojicha_M: { ice: parseNum(cheeseRows[27][3]), syrup: parseSyrup(cheeseRows[28][3]), hojicha: parseNum(cheeseRows[29][3]), creamer: parseNum(cheeseRows[30][3]), hotwater: parseNum(cheeseRows[31][3]) },
    hojicha_L: { ice: parseNum(cheeseRows[32][3]), syrup: parseSyrup(cheeseRows[33][3]), hojicha: parseNum(cheeseRows[34][3]), creamer: parseNum(cheeseRows[35][3]), hotwater: parseNum(cheeseRows[36][3]) }
  };

  return { original, milk, latte, fruit, cheese };
}

(async () => {
  const start = Date.now();
  const entries = Object.entries(GIDS);
  const csvs = await Promise.all(entries.map(([_, gid]) => fetchCsv(gid)));
  const sheets = {};
  entries.forEach(([name], idx) => {
    sheets[name] = parseCSV(csvs[idx]);
  });
  const db = compileDatabase(sheets);
  const elapsed = Date.now() - start;
  console.log(`Live sync completed in ${elapsed}ms!`);
  console.log("Lemon M:", db.fruit.lemon_M.보통);
  console.log("Cheese Spring M:", db.cheese.spring_M);
})();
