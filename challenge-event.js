(() => {
  const STORAGE_KEY = 'dejeng-challenge-event-predictions';
  const CHALLENGE_RECORDS_KEY = 'dejeng-challenge-rankings';
  const PROFILE_KEY = 'dejeng-challenge-event-profile';
  const EVENT_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSf7inAh55gJLJX37prw9YTVG-r3142MYm_VpukRrIWF6UibWQ/viewform?usp=pp_url';
  const EVENT_FORM_FIELDS = {
    employee: 'entry.1881930434',
    seconds: 'entry.1953810195',
    centiseconds: 'entry.674009828'
  };

  function buildEventFormUrl(employee, seconds, centiseconds) {
    const url = new URL(EVENT_FORM_URL);
    url.searchParams.set(EVENT_FORM_FIELDS.employee, employee);
    url.searchParams.set(EVENT_FORM_FIELDS.seconds, seconds);
    url.searchParams.set(EVENT_FORM_FIELDS.centiseconds, centiseconds);
    return url.toString();
  }

  function predictionValue() {
    const seconds = document.getElementById('challengePredictionSeconds').value.padStart(2, '0');
    const centiseconds = document.getElementById('challengePredictionCentiseconds').value.padStart(2, '0');
    return `${seconds}.${centiseconds}`;
  }

  function normalizeTimeInput(input, maximum) {
    const digits = input.value.replace(/\D/g, '').slice(0, 2);
    const numericValue = Number(digits || 0);
    input.value = String(Math.min(numericValue, maximum)).padStart(2, '0');
  }

  function savePreviewPrediction(employee, value) {
    const records = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    records[employee] = { value, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  function getProfileEmployee() {
    try {
      return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}').employee || '';
    } catch (_) {
      return '';
    }
  }

  function rememberEmployee(employee) {
    if (!employee) return;
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ employee, updatedAt: new Date().toISOString() }));
    renderPersonalSummary();
  }

  function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  function renderPersonalBest(employee) {
    const centerSlot = document.getElementById('challengeEventMyRecord');
    if (!centerSlot) return;
    const records = JSON.parse(localStorage.getItem(CHALLENGE_RECORDS_KEY) || '[]');
    const best = records
      .filter((record) => record.employee === employee && Number.isFinite(Number(record.elapsedSeconds)))
      .sort((left, right) => Number(left.elapsedSeconds) - Number(right.elapsedSeconds))[0];
    centerSlot.textContent = best ? formatDuration(Number(best.elapsedSeconds)) : '???';
    centerSlot.classList.toggle('has-record', Boolean(best));
  }

  function renderPersonalSummary() {
    const employee = getProfileEmployee();
    const name = document.getElementById('challengePersonalName');
    const quizRecord = document.getElementById('challengePersonalQuizRecord');
    const prediction = document.getElementById('challengePersonalPrediction');
    const hint = document.getElementById('challengePersonalHint');
    const savedNotice = document.getElementById('challengePredictionSaved');
    if (!name || !quizRecord || !prediction || !hint) return;

    const records = JSON.parse(localStorage.getItem(CHALLENGE_RECORDS_KEY) || '[]');
    const best = records
      .filter((record) => record.employee === employee && Number.isFinite(Number(record.elapsedSeconds)))
      .sort((left, right) => Number(left.elapsedSeconds) - Number(right.elapsedSeconds))[0];
    const predictions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const savedPrediction = employee ? predictions[employee]?.value : '';

    name.textContent = employee ? `${employee}의 기록` : '내 기록';
    quizRecord.textContent = best ? formatDuration(Number(best.elapsedSeconds)) : '아직 기록 없음';
    prediction.textContent = savedPrediction ? `${savedPrediction}초` : '아직 제출 전';
    hint.textContent = employee
      ? '이 휴대폰에 저장된 개인 기록입니다.'
      : '도전 기록 또는 예측을 제출하면 이 휴대폰에 자동 저장됩니다.';
    savedNotice.textContent = savedPrediction
      ? `${savedPrediction}초 예측이 저장되어 있습니다. 다시 제출하면 예측을 수정할 수 있습니다.`
      : '';
    renderPersonalBest(employee);
  }

  window.ChallengeEvent = {
    init(employees) {
      const form = document.getElementById('challengePredictionForm');
      if (!form || form.dataset.ready === 'true') return;
      form.dataset.ready = 'true';
      const employeeSelect = document.getElementById('challengePredictionEmployee');
      const modal = document.getElementById('challengePredictionModal');
      const openButton = document.getElementById('btnOpenPredictionModal');
      const closeButton = document.getElementById('btnClosePredictionModal');
      employees.forEach((employee) => {
        const option = document.createElement('option');
        option.value = employee;
        option.textContent = employee;
        employeeSelect.append(option);
      });
      const secondsInput = document.getElementById('challengePredictionSeconds');
      const centisecondsInput = document.getElementById('challengePredictionCentiseconds');
      employeeSelect.value = getProfileEmployee();
      [[secondsInput, 59], [centisecondsInput, 99]]
        .forEach(([input, maximum]) => {
          input.addEventListener('input', () => { input.value = input.value.replace(/\D/g, '').slice(0, 2); });
          input.addEventListener('blur', () => normalizeTimeInput(input, maximum));
        });

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!employeeSelect.value) return;
        normalizeTimeInput(secondsInput, 59);
        normalizeTimeInput(centisecondsInput, 99);
        const value = predictionValue();
        savePreviewPrediction(employeeSelect.value, value);
        rememberEmployee(employeeSelect.value);
        modal?.classList.add('hidden');
        window.open(buildEventFormUrl(employeeSelect.value, secondsInput.value, centisecondsInput.value), '_blank', 'noopener');
      });
      openButton?.addEventListener('click', () => modal?.classList.remove('hidden'));
      closeButton?.addEventListener('click', () => modal?.classList.add('hidden'));
      modal?.addEventListener('click', (event) => {
        if (event.target === modal) modal.classList.add('hidden');
      });
      employeeSelect.addEventListener('change', () => renderPersonalBest(employeeSelect.value));
      renderPersonalSummary();
      renderPersonalBest(employeeSelect.value);
    }
    ,
    rememberEmployee
  };
})();
