/*
 * Official quiz record transport.
 *
 * The static GitHub Pages app has no private credential. Requests therefore use
 * a one-time session id and JSONP to the Apps Script web app. The web app owns
 * all timestamps, locks the record, and later joins the form response by this
 * opaque id. A participant never submits elapsed time through Google Forms.
 */
(() => {
  const SERVICE_URL = 'https://script.google.com/macros/s/AKfycby2hXr6wJunOkYVXu15DWJ5HdLzhY1pKc9HvRAI3ddhm3vbQmxbrXE5iwVivlYqRBUE/exec';
  const REQUEST_TIMEOUT_MS = 12000;

  function isConfigured() {
    return SERVICE_URL.startsWith('https://script.google.com/macros/s/');
  }

  function createSessionId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID().replace(/-/g, '');
    const values = new Uint32Array(4);
    window.crypto?.getRandomValues?.(values);
    return Array.from(values, (value) => value.toString(16).padStart(8, '0')).join('') || `${Date.now()}${Math.random()}`;
  }

  function request(action, payload = {}) {
    if (!isConfigured()) return Promise.reject(new Error('공식 기록 서버가 아직 연결되지 않았습니다.'));
    return new Promise((resolve, reject) => {
      const callback = `quizRecordCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const url = new URL(SERVICE_URL);
      url.searchParams.set('action', action);
      url.searchParams.set('callback', callback);
      Object.entries(payload).forEach(([key, value]) => url.searchParams.set(key, String(value)));
      const script = document.createElement('script');
      const cleanup = () => {
        window.clearTimeout(timeout);
        delete window[callback];
        script.remove();
      };
      const timeout = window.setTimeout(() => {
        cleanup();
        reject(new Error('기록 서버 응답 시간이 초과되었습니다.'));
      }, REQUEST_TIMEOUT_MS);
      window[callback] = (response) => {
        cleanup();
        if (!response?.ok) {
          reject(new Error(response?.error || '공식 기록을 잠그지 못했습니다.'));
          return;
        }
        resolve(response);
      };
      script.onerror = () => {
        cleanup();
        reject(new Error('기록 서버에 연결하지 못했습니다.'));
      };
      script.src = url.toString();
      document.head.append(script);
    });
  }

  window.QuizRecordService = {
    isConfigured,
    createSessionId,
    startChallenge(sessionId) {
      return request('challenge_start', { sessionId });
    },
    finishChallenge(sessionId, correctBlanks, wrongBlanks) {
      return request('challenge_finish', { sessionId, correctBlanks, wrongBlanks });
    },
    lockPrediction(sessionId, employee, seconds, centiseconds) {
      return request('event_lock', { sessionId, employee, seconds, centiseconds });
    }
  };
})();
