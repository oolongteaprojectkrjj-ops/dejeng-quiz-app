/**
 * 得正 (Dejeng) 퀴즈 앱 - 구글 스프레드시트 -> 퀴즈 앱(링크) 원클릭 업데이트 스크립트
 * 
 * 퀴즈 앱 링크: https://oolongteaprojectkrjj-ops.github.io/dejeng-quiz-app/
 * 
 * [최초 1회 설치 방법]
 * 1. 구글 스프레드시트 상단 메뉴에서 [확장 프로그램] -> [Apps Script] 클릭
 * 2. 기존 코드가 있다면 모두 지우고, 이 파일의 전체 코드를 복사하여 붙여넣기
 * 3. 상단 [저장 (디스크 아이콘 💾)] 클릭
 * 4. 스프레드시트 화면으로 돌아와 새로고침(F5)을 누르면 상단 메뉴바 맨 오른쪽에 [🚀 퀴즈 앱 링크 업데이트] 메뉴가 생성됩니다!
 * 
 * [사용 방법 - 시트에서 링크로 업데이트하기]
 * • 방법 1 (상단 메뉴):
 *   시트 상단 [🚀 퀴즈 앱 링크 업데이트] -> [🚀 [지금 클릭] 최신 레시피를 퀴즈 앱 링크로 즉시 반영] 클릭!
 * 
 * • 방법 2 (시트 안에 전용 버튼 만들기):
 *   1) 시트 상단 메뉴 [삽입] -> [그림] 클릭
 *   2) 도형(둥근 사각형)을 그리고 "🚀 퀴즈 앱 링크로 업데이트" 입력 후 [저장 후 닫기]
 *   3) 생성된 버튼 우측 상단 점 3개(⋮) 클릭 -> [스크립트 할당] 선택
 *   4) sendRecipesToQuizApp 입력 후 확인!
 *   -> 이제 시트에서 해당 버튼을 누르기만 하면 링크로 즉시 최신 레시피가 업데이트됩니다!
 */

const QUIZ_APP_URL = "https://oolongteaprojectkrjj-ops.github.io/dejeng-quiz-app/";

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🚀 퀴즈 앱 링크 업데이트')
    .addItem('🚀 [지금 클릭] 최신 레시피를 퀴즈 앱 링크로 즉시 반영', 'sendRecipesToQuizApp')
    .addSeparator()
    .addItem('🔗 퀴즈 앱 링크 열기', 'openQuizAppLink')
    .addItem('📌 시트 안에 원클릭 [업데이트 버튼] 만들기 안내', 'showButtonHelp')
    .addToUi();
}

/**
 * 시트의 모든 레시피를 읽어 파싱한 뒤 배포 데이터로 변환하여 퀴즈 앱 링크로 업데이트합니다.
 */
function sendRecipesToQuizApp() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    // 1. 필요한 모든 5개 시트 데이터 읽기
    const sheetNames = ["오리지널 티", "밀크티", "라떼", "과일티", "치즈 밀크폼"];
    const sheetsData = {};

    for (let name of sheetNames) {
      const sheet = ss.getSheetByName(name);
      if (!sheet) {
        ui.alert(
          '⚠️ 시트 확인 필요',
          `"${name}" 시트를 찾을 수 없습니다.\n시트 탭 이름이 정확한지 확인해 주세요.`,
          ui.ButtonSet.OK
        );
        return;
      }
      sheetsData[name] = sheet.getDataRange().getValues();
    }

    // 2. 레시피 데이터 파싱 및 정밀 검증
    const compiledData = compileDatabase(sheetsData);
    if (!compiledData || !compiledData.original || !compiledData.milk) {
      throw new Error("레시피 데이터를 파싱하는 중 유효한 데이터를 추출하지 못했습니다.");
    }

    // 3. '배포_레시피' 탭 생성 또는 선택
    let pubSheet = ss.getSheetByName("배포_레시피");
    if (!pubSheet) {
      pubSheet = ss.insertSheet("배포_레시피");
    }

    // 4. 배포 데이터 저장
    const nowStr = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");
    
    // A1: JSON 문자열 (웹앱이 읽어들이는 데이터 소스)
    // B1: 업데이트 타임스탬프
    // C1: 퀴즈 웹앱 URL
    pubSheet.getRange("A1").setValue(JSON.stringify(compiledData));
    pubSheet.getRange("B1").setValue(nowStr);
    pubSheet.getRange("C1").setValue(QUIZ_APP_URL);

    // 사용자가 '배포_레시피' 시트를 볼 때도 상태를 알기 쉽도록 안내 정보 기록
    pubSheet.getRange("A3").setValue("✅ 상태");
    pubSheet.getRange("B3").setValue("퀴즈 앱 링크 정상 반영 완료");
    pubSheet.getRange("A4").setValue("🕒 마지막 업데이트");
    pubSheet.getRange("B4").setValue(nowStr);
    pubSheet.getRange("A5").setValue("🔗 퀴즈 앱 링크");
    pubSheet.getRange("B5").setValue(QUIZ_APP_URL);
    pubSheet.getRange("A6").setValue("📋 반영 항목");
    pubSheet.getRange("B6").setValue("오리지널 티 (6종), 밀크티 (6종), 라떼 (4종), 과일티 (6종), 치즈 밀크폼 (8종)");

    // 5. 완료 알림 팝업 (링크 포함)
    ui.alert(
      '🎉 퀴즈 앱 링크 업데이트 완료!',
      `스프레드시트의 최신 레시피가 퀴즈 앱 링크에 성공적으로 반영되었습니다!\n\n` +
      `• 반영 일시: ${nowStr}\n` +
      `• 반영 항목: 오리지널 티, 밀크티, 라떼, 과일티, 치즈 밀크폼\n\n` +
      `🔗 퀴즈 앱 링크:\n${QUIZ_APP_URL}\n\n` +
      `💡 이제 위 링크에 접속하면 방금 수정한 레시피로 즉시 문제가 출제됩니다!`,
      ui.ButtonSet.OK
    );

  } catch (err) {
    ui.alert('❌ 업데이트 실패', `오류가 발생했습니다:\n${err.message}`, ui.ButtonSet.OK);
  }
}

/**
 * 퀴즈 앱 링크 바로 열기 안내 모달
 */
function openQuizAppLink() {
  const htmlOutput = HtmlService.createHtmlOutput(`
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 15px; text-align: center;">
      <h3 style="margin-top:0; color: #1e293b;">🚀 得正(Dejeng) 퀴즈 앱 바로가기</h3>
      <p style="color: #64748b; font-size: 13px; line-height: 1.6;">
        스프레드시트에서 업데이트한 최신 레시피가 링크에 즉시 적용됩니다.
      </p>
      <div style="margin: 20px 0;">
        <a href="${QUIZ_APP_URL}" target="_blank" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          👉 퀴즈 앱 링크 새 탭으로 열기
        </a>
      </div>
      <p style="color: #94a3b8; font-size: 11px; word-break: break-all;">
        ${QUIZ_APP_URL}
      </p>
    </div>
  `).setWidth(380).setHeight(220);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, '퀴즈 앱 링크 열기');
}

/**
 * 시트 안에 클릭 버튼을 만드는 방법 안내
 */
function showButtonHelp() {
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    '📌 시트에 원클릭 업데이트 버튼 만드는 방법',
    `스프레드시트 화면에 예쁜 버튼을 만들어 클릭 한 번으로 업데이트할 수 있습니다:\n\n` +
    `1. 상단 메뉴 [삽입] -> [그림(Drawing)] 클릭\n` +
    `2. 도형 도구에서 둥근 모서리 사각형을 그리고 "🚀 퀴즈 앱 링크로 업데이트" 텍스트 입력\n` +
    `3. 초록색이나 파란색 배경을 지정한 후 우측 상단 [저장 후 닫기] 클릭\n` +
    `4. 시트에 생성된 버튼을 클릭하고, 우측 상단 점 3개(⋮)를 눌러 [스크립트 할당] 선택\n` +
    `5. 입력창에 아래 함수 이름을 정확히 입력:\n` +
    `   sendRecipesToQuizApp\n\n` +
    `이제 시트에서 해당 버튼을 누르기만 하면 퀴즈 앱 링크로 즉시 업데이트됩니다!`,
    ui.ButtonSet.OK
  );
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
