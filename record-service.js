/* Browser transport and Google identity prompt for official quiz records. */
(() => {
  const SERVICE_URL = 'https://script.google.com/macros/s/AKfycby2hXr6wJunOkYVXu15DWJ5HdLzhY1pKc9HvRAI3ddhm3vbQmxbrXE5iwVivlYqRBUE/exec';
  const CLIENT_ID = '183416031967-ckr632jlvitdvg7m0vqmp1or9jpu4s9p.apps.googleusercontent.com';
  const REQUEST_TIMEOUT_MS = 15000;
  // Memory only: reuse a successfully verified account while this page stays open.
  // Expiry here is only a UX check; the server still validates every ID token.
  let verifiedAccount = null;
  function credentialExpiry(credential) {
    try {
      const payload = credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return Number(JSON.parse(atob(payload)).exp) * 1000 || 0;
    } catch (_) { return 0; }
  }
  async function submitAuthenticated(action, payload) {
    if (verifiedAccount && (verifiedAccount.employee !== payload.employee || verifiedAccount.expiresAt <= Date.now() + 60000)) verifiedAccount = null;
    const credential = verifiedAccount?.credential || await requireGoogleCredential();
    try {
      const response = await request(action, { ...payload, credential });
      verifiedAccount = { employee: payload.employee, credential, expiresAt: credentialExpiry(credential) };
      return response;
    } catch (error) {
      verifiedAccount = null;
      throw error;
    }
  }
  const isConfigured = () => SERVICE_URL.includes('/macros/s/') && CLIENT_ID.endsWith('.apps.googleusercontent.com');
  const createSessionId = () => crypto?.randomUUID ? crypto.randomUUID().replace(/-/g, '') : `${Date.now()}${Math.random()}`.replace(/\D/g, '').slice(0, 48);
  function request(action, payload = {}) {
    if (!isConfigured()) return Promise.reject(new Error('공식 기록 서버가 아직 연결되지 않았습니다.'));
    return new Promise((resolve, reject) => {
      const callback = `quizRecordCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const url = new URL(SERVICE_URL); url.searchParams.set('action', action); url.searchParams.set('callback', callback);
      Object.entries(payload).forEach(([key, value]) => url.searchParams.set(key, String(value)));
      const script = document.createElement('script');
      const cleanup = () => { clearTimeout(timeout); delete window[callback]; script.remove(); };
      const timeout = setTimeout(() => { cleanup(); reject(new Error('기록 서버 응답 시간이 초과되었습니다.')); }, REQUEST_TIMEOUT_MS);
      window[callback] = (response) => { cleanup(); response?.ok ? resolve(response) : reject(new Error(response?.error || '기록 처리에 실패했습니다.')); };
      script.onerror = () => { cleanup(); reject(new Error('기록 서버에 연결하지 못했습니다.')); };
      script.src = url.toString(); document.head.append(script);
    });
  }
  function waitForGoogle() { return new Promise((resolve, reject) => { const until = Date.now() + 10000; const tick = () => window.google?.accounts?.id ? resolve() : Date.now() > until ? reject(new Error('Google 로그인을 불러오지 못했습니다.')) : setTimeout(tick, 100); tick(); }); }
  async function requireGoogleCredential() {
    await waitForGoogle();
    return new Promise((resolve, reject) => {
      const overlay = document.createElement('div');
      overlay.className = 'quiz-google-auth-overlay';
      overlay.innerHTML = '<section class="quiz-google-auth-card" role="dialog" aria-modal="true"><button type="button" aria-label="닫기">×</button><p>공식 기록 제출</p><h2>Google 계정으로 본인 인증</h2><small>선택한 이름과 로그인 이메일은 관리자 확인용으로만 저장됩니다.</small><div class="quiz-google-auth-button"></div></section>';
      let settled = false;
      const finish = (callback) => (value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        overlay.remove();
        callback(value);
      };
      const close = finish(() => reject(new Error('Google 로그인이 취소되었습니다.')));
      const timeout = setTimeout(finish(() => reject(new Error('Google 로그인 창을 열지 못했습니다. 다시 시도해 주세요.'))), 20000);
      overlay.querySelector('button').addEventListener('click', close); overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); }); document.body.append(overlay);
      try {
        google.accounts.id.initialize({ client_id: CLIENT_ID, auto_select: false, cancel_on_tap_outside: false, callback: ({ credential }) => credential ? finish(resolve)(credential) : finish(reject)(new Error('Google 인증을 확인하지 못했습니다.')) });
        google.accounts.id.renderButton(overlay.querySelector('.quiz-google-auth-button'), { theme: 'outline', size: 'large', shape: 'pill', text: 'signin_with', width: 280 });
      } catch (_) {
        finish(reject)(new Error('Google 로그인 창을 열지 못했습니다. 다시 시도해 주세요.'));
      }
    });
  }
  window.QuizRecordService = {
    isConfigured, createSessionId,
    startChallenge: (sessionId) => request('challenge_start', { sessionId }),
    finishChallenge: (sessionId, correctBlanks, wrongBlanks) => request('challenge_finish', { sessionId, correctBlanks, wrongBlanks }),
    submitChallenge: (sessionId, employee) => submitAuthenticated('challenge_submit', { sessionId, employee }),
    submitPrediction: (sessionId, employee, seconds, centiseconds) => submitAuthenticated('event_submit', { sessionId, employee, seconds, centiseconds })
  };
})();
