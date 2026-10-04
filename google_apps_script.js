/**
 * 得正 (Dejeng) 퀴즈 앱 - 구글 스프레드시트 연동 스크립트 (Google Apps Script)
 * 
 * [사용 방법]
 * 1. 스프레드시트 상단 메뉴에서 [확장 프로그램] -> [Apps Script] 클릭
 * 2. 기존 코드를 모두 지우고 이 파일의 내용을 전체 복사하여 붙여넣기
 * 3. 상단 [저장 (디스크 아이콘)] 클릭
 * 4. 스프레드시트 새로고침(F5)을 하면 상단에 [🚀 퀴즈 앱 관리] 메뉴가 생성됩니다.
 * 5. 레시피 수정 후 [🚀 퀴즈 앱 관리] -> [🚀 퀴즈 앱으로 최신 레시피 전송] 클릭!
 *    (또는 시트 내에 사각형 버튼/그림을 삽입한 뒤 '스크립트 할당'에 sendRecipesToQuizApp 입력)
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🚀 퀴즈 앱 반영하기')
    .addItem('🚀 현재 시트 레시피를 퀴즈 앱에 즉시 반영', 'sendRecipesToQuizApp')
    .addToUi();
}

function sendRecipesToQuizApp() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    // 1. 필요한 모든 시트 데이터 읽기
    const sheetNames = ["오리지널 티", "밀크티", "라떼", "과일티", "치즈 밀크폼"];
    const sheetsData = {};

    for (let name of sheetNames) {
      const sheet = ss.getSheetByName(name);
      if (!sheet) {
        ui.alert('⚠️ 오류 발생', `"${name}" 시트를 찾을 수 없습니다. 시트 이름을 확인해 주세요.`, ui.ButtonSet.OK);
        return;
      }
      sheetsData[name] = sheet.getDataRange().getValues();
    }

    // 2. 레시피 데이터 파싱 및 검증
    const compiledData = compileDatabase(sheetsData);

    // 3. '배포_레시피' 탭 생성 또는 선택
    let pubSheet = ss.getSheetByName("배포_레시피");
    if (!pubSheet) {
      pubSheet = ss.insertSheet("배포_레시피");
    }

    // 4. 배포 데이터 저장 (A1: JSON 문자열, B1: 전송 일시)
    const nowStr = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    pubSheet.getRange("A1").setValue(JSON.stringify(compiledData));
    pubSheet.getRange("B1").setValue(nowStr);

    // 5. 완료 알림
    ui.alert(
      '🎉 퀴즈 앱 전송 완료',
      `최신 레시피 데이터가 퀴즈 앱으로 성공적으로 전송(배포)되었습니다!\n\n` +
      `• 전송 일시: ${nowStr}\n` +
      `• 이제 퀴즈 앱에서 수정한 레시피로 즉시 출제됩니다.`,
      ui.ButtonSet.OK
    );

  } catch (err) {
    ui.alert('❌ 전송 실패', `오류가 발생했습니다:\n${err.message}`, ui.ButtonSet.OK);
  }
}

// 웹 앱(GET 요청) 배포 지원
function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const pubSheet = ss.getSheetByName("배포_레시피");
  let jsonStr = "{}";
  if (pubSheet) {
    jsonStr = pubSheet.getRange("A1").getValue() || "{}";
  }
  return ContentService.createTextOutput(jsonStr)
    .setMimeType(ContentService.MimeType.JSON);
}

// --- 내부 헬퍼 함수 ---
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

function compileDatabase(sheetsData) {
  const origRows = sheetsData["오리지널 티"];
  const milkRows = sheetsData["밀크티"];
  const latteRows = sheetsData["라떼"];
  const fruitRows = sheetsData["과일티"];
  const cheeseRows = sheetsData["치즈 밀크폼"];

  const iceCols = ["보통", "적게", "매우적게", "없이", "뜨겁게"];

  // 1. 오리지널 티
  const original = {};
  function extOrig(startR, hasWater) {
    const res = { 보통: {}, 적게: {}, 매우적게: {}, 없이: {}, 뜨겁게: {} };
    const iceR = origRows[startR];
    const sR = origRows[startR + 1];
    const tR = origRows[startR + 2];
    const wR = hasWater ? origRows[startR + 3] : null;

    const sBotong = parseSyrup(sR[3]);
    const sJeokge = sR[4] ? parseSyrup(sR[4]) : sBotong;
    const sMaeu = parseSyrup(sR[5]);
    const sEopsi = sR[6] ? parseSyrup(sR[6]) : sMaeu;
    const sHot = sR[7] ? parseSyrup(sR[7]) : sMaeu;
    const sMap = { 보통: sBotong, 적게: sJeokge, 매우적게: sMaeu, 없이: sEopsi, 뜨겁게: sHot };

    iceCols.forEach((k, idx) => {
      const col = 3 + idx;
      res[k] = {
        ice: parseNum(iceR[col]),
        syrup: sMap[k],
        tea: parseNum(tR[col])
      };
      if (hasWater && wR) {
        res[k].hotwater = parseNum(wR[col]);
      }
    });
    return res;
  }
  original["black_M"] = extOrig(9, true);
  original["black_L"] = extOrig(13, true);
  original["green_M"] = extOrig(17, false);
  original["green_L"] = extOrig(20, false);
  original["spring_M"] = extOrig(23, false);
  original["spring_L"] = extOrig(26, false);

  // 2. 밀크티
  const milk = {};
  function extMilkStandard(startR) {
    const res = { 보통: {}, 적게: {}, 매우적게: {}, 없이: {}, 뜨겁게: {} };
    const iceR = milkRows[startR];
    const sR = milkRows[startR + 1];
    const cR = milkRows[startR + 2];
    const tR = milkRows[startR + 3];

    const sBotong = parseSyrup(sR[3]);
    const sJeokge = sR[4] ? parseSyrup(sR[4]) : sBotong;
    const sMaeu = parseSyrup(sR[5]);
    const sEopsi = sR[6] ? parseSyrup(sR[6]) : sMaeu;
    const sHot = sR[7] ? parseSyrup(sR[7]) : sMaeu;
    const sMap = { 보통: sBotong, 적게: sJeokge, 매우적게: sMaeu, 없이: sEopsi, 뜨겁게: sHot };

    iceCols.forEach((k, idx) => {
      const col = 3 + idx;
      res[k] = {
        ice: parseNum(iceR[col]),
        syrup: sMap[k],
        creamer: parseNum(cR[col]),
        tea: parseNum(tR[col])
      };
    });
    return res;
  }
  function extMilkHojicha(startR) {
    const res = { 보통: {}, 적게: {}, 매우적게: {}, 없이: {}, 뜨겁게: {} };
    const iceR = milkRows[startR];
    const sR = milkRows[startR + 1];
    const hR = milkRows[startR + 2];
    const cR = milkRows[startR + 3];
    const wR = milkRows[startR + 4];

    const sBotong = parseSyrup(sR[3]);
    const sJeokge = sR[4] ? parseSyrup(sR[4]) : sBotong;
    const sMaeu = parseSyrup(sR[5]);
    const sEopsi = sR[6] ? parseSyrup(sR[6]) : sMaeu;
    const sHot = sR[7] ? parseSyrup(sR[7]) : sMaeu;
    const sMap = { 보통: sBotong, 적게: sJeokge, 매우적게: sMaeu, 없이: sEopsi, 뜨겁게: sHot };

    iceCols.forEach((k, idx) => {
      const col = 3 + idx;
      res[k] = {
        ice: parseNum(iceR[col]),
        syrup: sMap[k],
        hojicha: parseNum(hR[col]),
        creamer: parseNum(cR[col]),
        hotwater: parseNum(wR[col])
      };
    });
    return res;
  }
  milk["black_M"] = extMilkStandard(3);
  milk["black_L"] = extMilkStandard(7);
  milk["hojicha_M"] = extMilkHojicha(11);
  milk["hojicha_L"] = extMilkHojicha(16);
  milk["black_topping_M"] = extMilkStandard(22);
  milk["black_topping_L"] = extMilkStandard(26);

  // 3. 라떼
  const latte = {};
  function extLatteStandard(startR) {
    const res = { 보통: {}, 적게: {}, 매우적게: {}, 없이: {}, 뜨겁게: {} };
    const iceR = latteRows[startR];
    const sR = latteRows[startR + 1];
    const tR = latteRows[startR + 2];
    const mR = latteRows[startR + 3];

    const sBotong = parseSyrup(sR[3]);
    const sJeokge = sR[4] ? parseSyrup(sR[4]) : sBotong;
    const sMaeu = parseSyrup(sR[5]);
    const sEopsi = sR[6] ? parseSyrup(sR[6]) : sMaeu;
    const sHot = sR[7] ? parseSyrup(sR[7]) : sBotong;
    const sMap = { 보통: sBotong, 적게: sJeokge, 매우적게: sMaeu, 없이: sEopsi, 뜨겁게: sHot };

    iceCols.forEach((k, idx) => {
      const col = 3 + idx;
      res[k] = {
        ice: parseNum(iceR[col] || (k === "뜨겁게" ? "x" : iceR[3])),
        syrup: sMap[k],
        tea: parseNum(tR[col]),
        milk: parseNum(mR[col])
      };
    });
    return res;
  }
  function extLatteHojicha(startR) {
    const res = { 보통: {}, 적게: {}, 매우적게: {}, 없이: {}, 뜨겁게: {} };
    const iceR = latteRows[startR];
    const sR = latteRows[startR + 1];
    const hR = latteRows[startR + 2];
    const wR = latteRows[startR + 3];
    const mR = latteRows[startR + 4];

    const sBotong = parseSyrup(sR[3]);
    const sJeokge = sR[4] ? parseSyrup(sR[4]) : sBotong;
    const sMaeu = parseSyrup(sR[5]);
    const sEopsi = sR[6] ? parseSyrup(sR[6]) : sMaeu;
    const sHot = sR[7] ? parseSyrup(sR[7]) : sBotong;
    const sMap = { 보통: sBotong, 적게: sJeokge, 매우적게: sMaeu, 없이: sEopsi, 뜨겁게: sHot };

    iceCols.forEach((k, idx) => {
      const col = 3 + idx;
      res[k] = {
        ice: parseNum(iceR[col] || (k === "뜨겁게" ? "x" : iceR[3])),
        syrup: sMap[k],
        hojicha: parseNum(hR[col]),
        hotwater: parseNum(wR[col]),
        milk: parseNum(mR[col])
      };
    });
    return res;
  }
  latte["black_M"] = extLatteStandard(3);
  latte["black_L"] = extLatteStandard(7);
  latte["hojicha_M"] = extLatteHojicha(12);
  latte["hojicha_L"] = extLatteHojicha(17);

  // 4. 과일티
  const fruit = {};
  const fruitIce = ["보통", "적게", "매우적게", "없이"];
  function extGrape(startR) {
    const res = { 보통: {}, 적게: {}, 매우적게: {}, 없이: {} };
    const iceR = fruitRows[startR];
    const sR = fruitRows[startR + 1];
    const gR = fruitRows[startR + 2];
    const pR = fruitRows[startR + 3];
    const dR = fruitRows[startR + 4];

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
    const iceR = fruitRows[startR];
    const sR = fruitRows[startR + 1];
    const oR = fruitRows[startR + 2];
    const spR = fruitRows[startR + 3];
    const dR = fruitRows[startR + 5];

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
    const iceR = fruitRows[startR];
    const sR = fruitRows[startR + 1];
    const lR = fruitRows[startR + 2];
    const spR = fruitRows[startR + 3];
    const dR = fruitRows[startR + 4];

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

  // 5. 치즈 밀크폼
  const cheese = {
    black_M: {
      ice: parseNum(cheeseRows[3][3]),
      syrup: parseSyrup(cheeseRows[4][3]),
      tea: parseNum(cheeseRows[5][3]),
      hotwater: parseNum(cheeseRows[6][3])
    },
    black_L: {
      ice: parseNum(cheeseRows[7][3]),
      syrup: parseSyrup(cheeseRows[8][3]),
      tea: parseNum(cheeseRows[9][3]),
      hotwater: parseNum(cheeseRows[10][3])
    },
    green_M: {
      ice: parseNum(cheeseRows[11][3]),
      syrup: parseSyrup(cheeseRows[12][3]),
      tea: parseNum(cheeseRows[13][3])
    },
    green_L: {
      ice: parseNum(cheeseRows[15][3]),
      syrup: parseSyrup(cheeseRows[16][3]),
      tea: parseNum(cheeseRows[17][3])
    },
    spring_M: {
      ice: parseNum(cheeseRows[11][3]),
      syrup: parseSyrup(cheeseRows[12][3]),
      tea: parseNum(cheeseRows[14][3])
    },
    spring_L: {
      ice: parseNum(cheeseRows[15][3]),
      syrup: parseSyrup(cheeseRows[16][3]),
      tea: parseNum(cheeseRows[18][3])
    },
    hojicha_M: {
      ice: parseNum(cheeseRows[27][3]),
      syrup: parseSyrup(cheeseRows[28][3]),
      hojicha: parseNum(cheeseRows[29][3]),
      creamer: parseNum(cheeseRows[30][3]),
      hotwater: parseNum(cheeseRows[31][3])
    },
    hojicha_L: {
      ice: parseNum(cheeseRows[32][3]),
      syrup: parseSyrup(cheeseRows[33][3]),
      hojicha: parseNum(cheeseRows[34][3]),
      creamer: parseNum(cheeseRows[35][3]),
      hotwater: parseNum(cheeseRows[36][3])
    }
  };

  return { original, milk, latte, fruit, cheese };
}
