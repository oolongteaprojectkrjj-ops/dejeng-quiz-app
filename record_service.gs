/**
 * Official record service for the Dejeng quiz.
 * Deploy this file as an Apps Script web app from the challenge response
 * spreadsheet. It creates locked session rows and has no user-editable time
 * input. Install the two spreadsheet form-submit triggers below after deploy.
 */
const QUIZ_RECORD_SPREADSHEET_ID = '1kIlcPLr0GPp3yZkpoc9xEFrIBkKSvJLFVLHYMLnJmwk';
const EVENT_RESPONSE_SPREADSHEET_ID = '1ut1hGO5bF2dx2bI_70V924uLDzsbmOjr-d_981a0FZw';
const LOCKED_RECORDS_SHEET = '퀴즈_잠금기록';
const OFFICIAL_CHALLENGE_SHEET = '공식_도전기록';
const OFFICIAL_EVENT_SHEET = '공식_이벤트응모';
const SESSION_TTL_MINUTES = 30;

function doGet(e) {
  const action = String(e?.parameter?.action || '');
  if (!action) return ContentService.createTextOutput('{}').setMimeType(ContentService.MimeType.JSON);
  try {
    const result = action === 'challenge_start'
      ? startChallengeRecord_(e.parameter)
      : action === 'challenge_finish'
        ? finishChallengeRecord_(e.parameter)
        : action === 'event_lock'
          ? lockEventPrediction_(e.parameter)
          : { ok: false, error: '지원하지 않는 요청입니다.' };
    return jsonp_(e.parameter.callback, result);
  } catch (error) {
    return jsonp_(e.parameter.callback, { ok: false, error: error.message || '기록 처리 중 오류가 발생했습니다.' });
  }
}

function startChallengeRecord_(params) {
  const sessionId = validSessionId_(params.sessionId);
  const sheet = sessionSheet_();
  const existing = findSessionRow_(sheet, sessionId);
  if (existing) return { ok: true, sessionId: sessionId, reused: true };
  const now = new Date();
  sheet.appendRow([sessionId, 'challenge', now, '', '', '', '', 'started', '', '']);
  return { ok: true, sessionId: sessionId };
}

function finishChallengeRecord_(params) {
  const sessionId = validSessionId_(params.sessionId);
  const sheet = sessionSheet_();
  const row = findSessionRow_(sheet, sessionId);
  if (!row || row.values[1] !== 'challenge') throw new Error('유효하지 않은 도전 기록입니다.');
  if (row.values[7] !== 'started') return { ok: row.values[7] === 'locked', sessionId: sessionId };
  const startedAt = new Date(row.values[2]);
  const now = new Date();
  if (now - startedAt > SESSION_TTL_MINUTES * 60 * 1000) throw new Error('기록 제출 가능 시간이 지났습니다. 다시 도전해 주세요.');
  const correct = boundedInt_(params.correctBlanks, 0, 200, '정답 빈칸 수');
  const wrong = boundedInt_(params.wrongBlanks, 0, 200, '오답 빈칸 수');
  const elapsedSeconds = Math.max(1, Math.floor((now - startedAt) / 1000));
  sheet.getRange(row.rowNumber, 4, 1, 5).setValues([[now, elapsedSeconds, correct, wrong, 'locked']]);
  return { ok: true, sessionId: sessionId, elapsedSeconds: elapsedSeconds };
}

function lockEventPrediction_(params) {
  const sessionId = validSessionId_(params.sessionId);
  const employee = String(params.employee || '').trim();
  if (!employee) throw new Error('직원명을 선택해 주세요.');
  const seconds = boundedInt_(params.seconds, 0, 59, '예측 초');
  const centiseconds = boundedInt_(params.centiseconds, 0, 99, '예측 1/100초');
  const sheet = sessionSheet_();
  const existing = findSessionRow_(sheet, sessionId);
  if (existing) return { ok: true, sessionId: sessionId, reused: true };
  const now = new Date();
  sheet.appendRow([sessionId, 'event', now, now, '', seconds, centiseconds, 'locked', employee, '']);
  return { ok: true, sessionId: sessionId };
}

/** Install as a spreadsheet trigger on the challenge Form response sheet. */
function onChallengeFormSubmit(e) {
  const values = e.namedValues || {};
  const sessionId = firstValue_(values, ['자동 확인 코드']) || sessionCodeFromValues_(values);
  const employee = firstValue_(values, ['직원명', '본인 이름']);
  const email = firstValue_(values, ['이메일 주소', '이메일']);
  finalizeChallenge_(sessionId, employee, email, new Date());
}

/** Install as a spreadsheet trigger on the event Form response sheet. */
function onEventFormSubmit(e) {
  const values = e.namedValues || {};
  const sessionId = firstValue_(values, ['자동 확인 코드']) || sessionCodeFromValues_(values);
  const employee = firstValue_(values, ['본인 이름', '직원명']);
  const email = firstValue_(values, ['이메일 주소', '이메일']);
  finalizeEvent_(sessionId, employee, email, new Date());
}

function finalizeChallenge_(sessionId, employee, email, submittedAt) {
  const sheet = sessionSheet_();
  const row = findSessionRow_(sheet, sessionId);
  if (!row || row.values[1] !== 'challenge' || row.values[7] !== 'locked') return;
  const official = officialSheet_(OFFICIAL_CHALLENGE_SHEET, ['확정시각', '기록코드', '직원명', 'Google 이메일', '소요시간(초)', '정답 빈칸', '오답 빈칸', '검토상태']);
  official.appendRow([submittedAt, sessionId, employee, email, row.values[4], row.values[5], row.values[6], '이메일·이름 관리자 확인 대기']);
  sheet.getRange(row.rowNumber, 8, 1, 3).setValues([['confirmed', employee, email]]);
}

function finalizeEvent_(sessionId, employee, email, submittedAt) {
  const sheet = sessionSheet_();
  const row = findSessionRow_(sheet, sessionId);
  if (!row || row.values[1] !== 'event' || row.values[7] !== 'locked') return;
  const official = officialSheet_(OFFICIAL_EVENT_SHEET, ['확정시각', '기록코드', '직원명', 'Google 이메일', '예측 초', '예측 1/100초', '검토상태']);
  official.appendRow([submittedAt, sessionId, employee, email, row.values[5], row.values[6], '이메일·이름 관리자 확인 대기']);
  sheet.getRange(row.rowNumber, 8, 1, 3).setValues([['confirmed', employee, email]]);
}

function sessionSheet_() {
  return officialSheet_(LOCKED_RECORDS_SHEET, ['기록코드', '유형', '시작시각', '완료시각', '소요시간(초)', '값1', '값2', '상태', '직원명', 'Google 이메일']);
}

function officialSheet_(name, headers) {
  const spreadsheet = SpreadsheetApp.openById(QUIZ_RECORD_SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function findSessionRow_(sheet, sessionId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return null;
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  const index = ids.lastIndexOf(sessionId);
  if (index < 0) return null;
  const rowNumber = index + 2;
  return { rowNumber: rowNumber, values: sheet.getRange(rowNumber, 1, 1, 10).getValues()[0] };
}

function validSessionId_(value) {
  const id = String(value || '');
  if (!/^[a-f0-9]{24,80}$/i.test(id)) throw new Error('유효하지 않은 기록 코드입니다.');
  return id;
}

function boundedInt_(value, min, max, label) {
  if (!/^\d+$/.test(String(value ?? ''))) throw new Error(label + ' 값이 올바르지 않습니다.');
  const numeric = Number(value);
  if (numeric < min || numeric > max) throw new Error(label + ' 범위를 벗어났습니다.');
  return numeric;
}

function firstValue_(namedValues, names) {
  for (const name of names) {
    const value = namedValues[name];
    if (Array.isArray(value) && value[0]) return String(value[0]).trim();
  }
  return '';
}

// Form question labels can be renamed later. The code's strict random-token
// shape lets the submission trigger still find it without trusting any other
// user-entered field.
function sessionCodeFromValues_(namedValues) {
  for (const values of Object.values(namedValues)) {
    const value = Array.isArray(values) ? values[0] : values;
    if (/^[a-f0-9]{24,80}$/i.test(String(value || '').trim())) return String(value).trim();
  }
  return '';
}

// Run once from the Apps Script editor after pasting this source. It installs
// the two form-submit triggers that join identity-only Form responses to the
// server-locked record, including the separate event response spreadsheet.
function setupSubmissionTriggers() {
  ScriptApp.newTrigger('onChallengeFormSubmit')
    .forSpreadsheet(SpreadsheetApp.openById(QUIZ_RECORD_SPREADSHEET_ID))
    .onFormSubmit()
    .create();
  ScriptApp.newTrigger('onEventFormSubmit')
    .forSpreadsheet(SpreadsheetApp.openById(EVENT_RESPONSE_SPREADSHEET_ID))
    .onFormSubmit()
    .create();
}

function jsonp_(callback, payload) {
  const safeCallback = /^[A-Za-z_$][\w$]*$/.test(String(callback || '')) ? callback : '';
  const text = safeCallback ? `${safeCallback}(${JSON.stringify(payload)});` : JSON.stringify(payload);
  return ContentService.createTextOutput(text).setMimeType(safeCallback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}
