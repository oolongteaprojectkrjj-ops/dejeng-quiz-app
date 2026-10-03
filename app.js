/**
 * 得正 (Dejeng) Oolong Tea Project - Recipe Quiz & Training App
 * Mobile-First Fill-in-the-Blank Test with Virtual Number Pad (. included)
 * No units (스쿱, ml, cc removed), Pure Numeric Calculation
 */

class SoundFX {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  playPrintSound() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.26);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, now);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {
      // AudioContext policy
    }
  }

  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  playWrong() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(170, now + 0.12);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch (e) {}
  }
}

const sfx = new SoundFX();

// App State
const state = {
  categoryFilter: 'all',
  toppingFilter: 'all',
  currentQuestion: null,
  activeInputIdx: 0,
  stepInputs: [],
  isGraded: false
};

const TOPPING_OPTIONS = [
  '공백',
  '블랙펄',
  '골든버블',
  '우롱티 젤리',
  '블랙펄+골든버블',
  '블랙펄+우롱티 젤리',
  '골든버블+우롱티 젤리'
];

/**
 * Shorten Form Value Converter
 */
function shortenValue(val, type) {
  if (val === 0 || !val) return { shortened: 0, changed: false };
  const num = parseFloat(val);
  const key = num.toFixed(1);
  const db = window.RECIPE_DATABASE;

  if (type === 'ice') {
    if (db.shorten.ice[key] !== undefined) {
      return { shortened: db.shorten.ice[key], changed: true };
    }
    if (num <= 0.5) return { shortened: 0.5, changed: false };
    return { shortened: Math.round(num * 0.75 * 10) / 10, changed: true };
  } else if (type === 'powder') {
    if (db.shorten.powder[key] !== undefined) {
      return { shortened: db.shorten.powder[key], changed: true };
    }
    return { shortened: Math.round(num * 0.75 * 10) / 10, changed: true };
  } else if (type === 'liquid') {
    if (db.shorten.liquid[key] !== undefined) {
      return { shortened: db.shorten.liquid[key], changed: true };
    }
    return { shortened: Math.round(num * 0.75), changed: true };
  }
  return { shortened: num, changed: false };
}

/**
 * Calculate Recipe based on Sheet Logic & User's Topping Rules
 */
function calculateRecipe(categoryName, drinkName, size, ice, sugar, topping) {
  const db = window.RECIPE_DATABASE;
  const category = db.categories[categoryName];
  if (!category) return null;
  const drink = category.items[drinkName];
  if (!drink) return null;

  const hasTopping = (topping && topping !== '공백' && topping !== '없음');

  let targetSize = size;
  let applyShorten = false;
  let ruleBadge = '';
  let ruleText = '';
  let ruleClass = '';

  if (hasTopping) {
    if (size === 'L') {
      targetSize = 'M';
      applyShorten = false;
      ruleBadge = 'L사이즈 + 토핑';
      ruleText = 'L사이즈에 토핑이 추가되어 M사이즈 기본 레시피를 따릅니다.';
      ruleClass = 'm-applied';
    } else {
      targetSize = 'M';
      applyShorten = true;
      ruleBadge = 'M사이즈 + 토핑 (쇼튼 폼 적용)';
      ruleText = 'M사이즈에 토핑이 추가되어 기본 레시피 용량을 쇼튼 폼(검정숫자 ➔ 하단 빨간숫자)으로 변환합니다.';
      ruleClass = 'shorten-applied';
    }
  } else {
    ruleBadge = '정규 레시피 (토핑 없음)';
    ruleText = '토핑이 없으므로 해당 사이즈의 정규 레시피를 그대로 적용합니다.';
    ruleClass = '';
  }

  const baseRecipe = drink.recipes[targetSize][ice];
  if (!baseRecipe) return null;

  const steps = [];
  const shortenBreakdown = [];

  baseRecipe.steps.forEach(step => {
    const s = { ...step };
    let amount = 0;

    if (s.amount_by_sugar) {
      amount = s.amount_by_sugar[sugar] !== undefined ? s.amount_by_sugar[sugar] : 0;
    } else {
      amount = s.amount !== undefined ? s.amount : 0;
    }

    if (sugar === '0%' && s.zero_sugar_extra) {
      amount += s.zero_sugar_extra;
      s.note = (s.note ? s.note + ', ' : '') + `당도 0% 보정 (+${s.zero_sugar_extra})`;
    }

    const origAmount = amount;
    let isShortened = false;

    if (applyShorten && amount > 0 && ['ice', 'liquid', 'powder'].includes(s.type)) {
      const res = shortenValue(amount, s.type);
      amount = res.shortened;
      isShortened = res.changed;

      shortenBreakdown.push({
        name: s.name,
        orig: origAmount,
        shortened: amount
      });
    }

    s.finalAmount = amount;
    s.origAmount = origAmount;
    s.isShortened = isShortened;
    steps.push(s);
  });

  return {
    categoryName,
    drinkName,
    lineBreakHtml: drink.line_break || drinkName,
    size,
    ice,
    sugar,
    topping,
    hasTopping,
    targetSizeUsed: targetSize,
    applyShorten,
    ruleBadge,
    ruleText,
    ruleClass,
    sheetOrderRule: category.order_rule,
    steps,
    shortenBreakdown
  };
}

/**
 * Official Store Frequency Distribution Weights (from Spreadsheet 확률분포도)
 */
const FREQUENCY_WEIGHTS = {
  // Category & Drink Weights (22,075 orders total)
  drinks: {
    // 클래식 밀크티 (10,175건, 46.09%)
    '다크 로스티드 우롱 밀크티': 6463,
    '라이트 로스티드 우롱 밀크티': 1252,
    '블랙 밀크티': 1044,
    '그린 밀크티': 836,
    '호지차 밀크티': 580,

    // 치즈 밀크폼 (5,012건, 22.70%)
    '치즈 밀크폼 다크 로스티드 우롱티': 2093,
    '치즈 밀크폼 스프링 우롱티': 1883,
    '치즈 밀크폼 라이트 로스티드 우롱티': 386,
    '치즈 밀크폼 초콜렛': 298,
    '치즈 밀크폼 호지차': 237,

    // 더블 과일티 (3,279건, 14.85%)
    '레몬 스프링 우롱티': 2351,
    '자몽 시트러스 우롱티': 772,
    '오렌지 스프링 우롱티': 156,

    // 오리지널 티 (2,266건, 10.26%)
    '스프링 우롱티': 994,
    '다크 로스티드 우롱티': 454,
    '라이트 로스티드 우롱티': 338,
    '메밀 그린 루이보스티': 233,
    '블랙티': 127,
    '그린티': 120,

    // 신선한 우유 (1,343건, 6.08%)
    '다크 로스티드 우롱티 라떼': 470,
    '라이트 로스티드 우롱티 라떼': 259,
    '호지차 라떼': 222,
    '블랙티 라떼': 221,
    '그린티 라떼': 171
  },

  // Size Weights (20,566건: M 57.17%, L 42.83%)
  sizes: {
    'M': 11758,
    'L': 8808
  },

  // Sugar Weights (22,075건)
  sugar: {
    '30%': 10261, // 46.48%
    '50%': 5219,  // 23.64%
    '0%': 2797,   // 12.67%
    '10%': 2760,  // 12.50%
    '100%': 1038  // 4.70%
  },

  // Ice / Temperature Weights (22,075건)
  ice: {
    '얼음 적게': 9564,     // 43.33%
    '얼음 보통': 9545,     // 43.24% (9409 + 136)
    '얼음 없이': 1240,     // 5.62%
    '매우적게': 1094,       // 4.96%
    '뜨겁게': 632          // 2.86% (432 + 97 + 103)
  },

  // Topping Weights (22,075건)
  toppings: {
    '공백': 12630,                 // 57.21% (토핑 없음)
    '블랙펄': 4270,                // 19.34%
    '우롱티 젤리': 2501,           // 11.33%
    '골든버블': 2185,              // 9.90%
    '블랙펄+골든버블': 194,        // 0.88%
    '골든버블+우롱티 젤리': 150,   // 0.68%
    '블랙펄+우롱티 젤리': 145     // 0.66%
  }
};

/**
 * Weighted Random Selection
 */
function weightedChoice(weightMap) {
  const entries = Object.entries(weightMap);
  if (entries.length === 0) return null;
  const totalWeight = entries.reduce((acc, [, w]) => acc + w, 0);
  let random = Math.random() * totalWeight;
  for (const [item, w] of entries) {
    if (random < w) return item;
    random -= w;
  }
  return entries[entries.length - 1][0];
}

/**
 * Generate Next Single Question (Frequency-Weighted)
 */
function nextQuestion() {
  const db = window.RECIPE_DATABASE;

  // 1. Choose Drink using Weighted Distribution
  let drinkCandidates = {};
  if (state.categoryFilter !== 'all') {
    const cat = db.categories[state.categoryFilter];
    if (cat) {
      Object.keys(cat.items).forEach(dName => {
        drinkCandidates[dName] = FREQUENCY_WEIGHTS.drinks[dName] || 100;
      });
    }
  } else {
    drinkCandidates = { ...FREQUENCY_WEIGHTS.drinks };
  }

  const chosenDrinkName = weightedChoice(drinkCandidates);

  // Find Category for chosen drink
  let chosenCatName = '';
  for (const [cName, cObj] of Object.entries(db.categories)) {
    if (cObj.items[chosenDrinkName]) {
      chosenCatName = cName;
      break;
    }
  }
  const cat = db.categories[chosenCatName];

  // 2. Choose Size using Weights
  const chosenSize = weightedChoice(FREQUENCY_WEIGHTS.sizes) || 'M';

  // 3. Choose Ice using Weights, constrained by Category options
  const iceCandidates = {};
  cat.ice_options.forEach(opt => {
    iceCandidates[opt] = FREQUENCY_WEIGHTS.ice[opt] || 100;
  });
  const chosenIce = weightedChoice(iceCandidates) || cat.ice_options[0];

  // 4. Choose Sugar using Weights, constrained by Category options
  const sugarCandidates = {};
  cat.sugar_options.forEach(opt => {
    sugarCandidates[opt] = FREQUENCY_WEIGHTS.sugar[opt] || 100;
  });
  const chosenSugar = weightedChoice(sugarCandidates) || cat.sugar_options[0];

  // 5. Choose Topping using Weights and Topping Filter
  let chosenTopping = '공백';
  if (state.toppingFilter === 'with') {
    const nonBlankToppings = { ...FREQUENCY_WEIGHTS.toppings };
    delete nonBlankToppings['공백'];
    chosenTopping = weightedChoice(nonBlankToppings);
  } else if (state.toppingFilter === 'without') {
    chosenTopping = '공백';
  } else {
    chosenTopping = weightedChoice(FREQUENCY_WEIGHTS.toppings);
  }

  const q = calculateRecipe(chosenCatName, chosenDrinkName, chosenSize, chosenIce, chosenSugar, chosenTopping);

  // 5-digit store order number (matching media_1791044325110.png e.g. 11234)
  q.orderNo = Math.floor(Math.random() * 89999) + 10000;
  const now = new Date();
  q.timestamp = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const totalItems = Math.floor(Math.random() * 3) + 1;
  const itemSeq = Math.floor(Math.random() * totalItems) + 1;
  q.seq = `${itemSeq}/${totalItems}`;

  state.currentQuestion = q;
  state.isGraded = false;

  renderSticker(q);
  renderQuizForm(q);
  sfx.playPrintSound();
}

/**
 * Render text directly on the photo sticker template
 */
function renderSticker(q) {
  const stickerEl = document.getElementById('dejengPhotoSticker');
  if (!stickerEl) return;

  if (window.DEJENG_STICKER_TEMPLATE_B64) {
    stickerEl.style.backgroundImage = `url("${window.DEJENG_STICKER_TEMPLATE_B64}")`;
  }

  // Drink title with official store line breaks
  const titleEl = document.getElementById('stDrinkTitle');
  titleEl.innerHTML = q.lineBreakHtml;

  // Auto adjust font size if title is long
  if (q.drinkName.length > 15) {
    titleEl.style.fontSize = '1.20rem';
    titleEl.style.lineHeight = '1.2';
  } else if (q.drinkName.length > 10) {
    titleEl.style.fontSize = '1.30rem';
    titleEl.style.lineHeight = '1.22';
  } else {
    titleEl.style.fontSize = '1.35rem';
    titleEl.style.lineHeight = '1.25';
  }

  // Specs (matching media_1791044325110.png)
  document.getElementById('stSize').textContent = q.size;
  document.getElementById('stSugar').textContent = `당도 ${q.sugar}`;
  document.getElementById('stIce').textContent = q.ice;

  const toppingEl = document.getElementById('stTopping');
  if (q.topping && q.topping !== '공백' && q.topping !== '없음') {
    toppingEl.textContent = `토핑 ${q.topping}`;
    toppingEl.style.display = 'block';
  } else {
    toppingEl.textContent = '';
    toppingEl.style.display = 'none';
  }

  // 5-digit Order Number
  document.getElementById('stOrderNo').textContent = q.orderNo;
  document.getElementById('stTimestamp').textContent = q.timestamp;
  document.getElementById('stSeq').textContent = q.seq;

  // Drop animation
  stickerEl.style.animation = 'none';
  stickerEl.offsetHeight;
  stickerEl.style.animation = 'stickerDrop 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.15)';
}

/**
 * Render Fill-in-the-Blank Quiz Form (No units!)
 */
function renderQuizForm(q) {
  // Hint Banner
  const hintEl = document.getElementById('quizSequenceHint');
  if (hintEl) {
    hintEl.textContent = q.sheetOrderRule || '시트 제조 순서대로 정확한 수량을 입력하세요.';
  }

  // Clear Result Banner & Detailed Card
  const resultBanner = document.getElementById('quizResultBanner');
  resultBanner.className = 'quiz-result-banner hidden';
  resultBanner.innerHTML = '';

  const detailedCard = document.getElementById('detailedAnswerCard');
  detailedCard.classList.add('hidden');

  // Populate Input List
  const listEl = document.getElementById('quizInputsList');
  listEl.innerHTML = '';
  state.stepInputs = [];

  q.steps.forEach((step, idx) => {
    const row = document.createElement('div');
    row.className = 'quiz-step-row';
    row.id = `quizStepRow_${idx}`;
    row.dataset.stepIndex = idx;

    const isAction = (step.type === 'action');

    const leftHtml = `
      <div class="step-left-info">
        <span class="step-idx-badge">${idx + 1}</span>
        <div class="step-text-wrap">
          <span class="step-name-text">${step.name}</span>
          ${step.note ? `<span class="step-action-note">💡 ${step.note}</span>` : ''}
          ${step.action ? `<span class="step-action-note">👉 ${step.action}</span>` : ''}
        </div>
      </div>
    `;

    let rightHtml = '';
    if (isAction) {
      rightHtml = `
        <div class="step-input-wrap">
          <span class="step-action-note">${step.note || step.action || '조리 과정'}</span>
        </div>
      `;
    } else {
      rightHtml = `
        <div class="step-input-wrap">
          <input type="text"
                 inputmode="decimal"
                 pattern="[0-9]*\\.?[0-9]*"
                 class="quiz-step-input"
                 id="quizInput_${idx}"
                 data-idx="${idx}"
                 data-name="${step.name}"
                 placeholder="수량 입력"
                 autocomplete="off"
                 autocorrect="off"
                 spellcheck="false">
          <div class="step-feedback-msg" id="stepFeedback_${idx}"></div>
        </div>
      `;
    }

    row.innerHTML = leftHtml + rightHtml;
    listEl.appendChild(row);

    if (!isAction) {
      const inputEl = row.querySelector('.quiz-step-input');
      state.stepInputs.push({
        idx: idx,
        inputEl: inputEl,
        step: step
      });

      // Events for input focus and active keypad tracking
      inputEl.addEventListener('focus', () => {
        setActiveInput(idx);
      });

      inputEl.addEventListener('click', () => {
        setActiveInput(idx);
      });

      // Enter key moves to next or submits
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const currentPos = state.stepInputs.findIndex(item => item.idx === idx);
          if (currentPos < state.stepInputs.length - 1) {
            state.stepInputs[currentPos + 1].inputEl.focus();
          } else {
            gradeQuiz();
          }
        }
      });
    }
  });

  // Focus the first input field
  if (state.stepInputs.length > 0) {
    setActiveInput(state.stepInputs[0].idx);
  }
}

/**
 * Set Active Input for Virtual Number Pad
 */
function setActiveInput(idx) {
  state.activeInputIdx = idx;

  // Highlight row
  document.querySelectorAll('.quiz-step-row').forEach(r => r.classList.remove('is-active-step'));
  const activeRow = document.getElementById(`quizStepRow_${idx}`);
  if (activeRow) {
    activeRow.classList.add('is-active-step');
  }

  // Update Pad Target Name
  const targetStep = state.currentQuestion.steps[idx];
  const padLabel = document.getElementById('padTargetName');
  if (padLabel && targetStep) {
    padLabel.textContent = `${idx + 1}. ${targetStep.name}`;
  }

  // Ensure pad is visible on mobile
  const padEl = document.getElementById('mobileNumberPad');
  if (padEl && padEl.classList.contains('is-collapsed')) {
    padEl.classList.remove('is-collapsed');
  }
}

/**
 * Setup Mobile On-Screen Number Pad
 */
function setupNumberPad() {
  const pad = document.getElementById('mobileNumberPad');
  if (!pad) return;

  // Number & Dot Keys
  pad.querySelectorAll('.pad-key').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const key = btn.dataset.key;
      handlePadInput(key);
    });
  });

  // Action Buttons
  document.getElementById('btnPadClear').addEventListener('click', (e) => {
    e.preventDefault();
    handlePadInput('clear');
  });

  document.getElementById('btnPadPrev').addEventListener('click', (e) => {
    e.preventDefault();
    navInput(-1);
  });

  document.getElementById('btnPadNext').addEventListener('click', (e) => {
    e.preventDefault();
    navInput(1);
  });

  document.getElementById('btnPadClose').addEventListener('click', (e) => {
    e.preventDefault();
    pad.classList.add('is-collapsed');
  });

  document.getElementById('btnToggleKeypad').addEventListener('click', () => {
    pad.classList.toggle('is-collapsed');
    if (!pad.classList.contains('is-collapsed') && state.stepInputs.length > 0) {
      const activeObj = state.stepInputs.find(item => item.idx === state.activeInputIdx) || state.stepInputs[0];
      if (activeObj) activeObj.inputEl.focus();
    }
  });

  document.getElementById('btnPadGrade').addEventListener('click', (e) => {
    e.preventDefault();
    gradeQuiz();
  });
}

/**
 * Handle Virtual Keypad Actions
 */
function handlePadInput(action) {
  const currentObj = state.stepInputs.find(item => item.idx === state.activeInputIdx);
  if (!currentObj) return;

  const input = currentObj.inputEl;
  let val = input.value;

  if (action === 'clear') {
    input.value = '';
  } else if (action === 'backspace') {
    input.value = val.slice(0, -1);
  } else if (action === '.') {
    if (val === '') {
      input.value = '0.';
    } else if (!val.includes('.')) {
      input.value = val + '.';
    }
  } else {
    // Digits 0-9
    input.value = val + action;
  }

  // Trigger input event
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Navigate to Prev/Next Input
 */
function navInput(delta) {
  if (state.stepInputs.length === 0) return;
  const currentPos = state.stepInputs.findIndex(item => item.idx === state.activeInputIdx);
  let nextPos = currentPos + delta;

  if (nextPos < 0) nextPos = 0;
  if (nextPos >= state.stepInputs.length) nextPos = state.stepInputs.length - 1;

  const nextObj = state.stepInputs[nextPos];
  if (nextObj) {
    nextObj.inputEl.focus();
    setActiveInput(nextObj.idx);
  }
}

/**
 * Grade the Current Quiz Inputs
 */
function gradeQuiz() {
  if (!state.currentQuestion) return;
  state.isGraded = true;

  let totalNumericCount = state.stepInputs.length;
  let correctCount = 0;

  state.stepInputs.forEach(item => {
    const input = item.inputEl;
    const step = item.step;
    const feedbackEl = document.getElementById(`stepFeedback_${item.idx}`);

    const rawVal = input.value.trim();
    const userVal = parseFloat(rawVal);
    const targetVal = parseFloat(step.finalAmount);

    let isMatch = false;
    if (!isNaN(userVal) && Math.abs(userVal - targetVal) < 0.001) {
      isMatch = true;
    }

    if (isMatch) {
      correctCount++;
      input.classList.remove('is-wrong');
      input.classList.add('is-correct');
      if (feedbackEl) {
        feedbackEl.className = 'step-feedback-msg correct-msg';
        feedbackEl.innerHTML = `✓ 정답 (${targetVal})`;
      }
    } else {
      input.classList.remove('is-correct');
      input.classList.add('is-wrong');
      if (feedbackEl) {
        feedbackEl.className = 'step-feedback-msg wrong-msg';
        const note = step.isShortened ? ` (쇼튼 적용, 원래 ${step.origAmount})` : '';
        feedbackEl.innerHTML = `정답: <strong>${targetVal}</strong>${note}`;
      }
    }
  });

  // Overall Result Banner
  const banner = document.getElementById('quizResultBanner');
  banner.classList.remove('hidden');

  const isPerfect = (correctCount === totalNumericCount);
  if (isPerfect) {
    banner.className = 'quiz-result-banner perfect';
    banner.innerHTML = `
      <span class="result-banner-icon">🎉</span>
      <div class="result-banner-text">
        <div>100점 만점! 완벽합니다!</div>
        <div style="font-size:0.85rem; font-weight:normal; opacity:0.9;">모든 레시피 순서와 용량을 정확히 맞췄습니다.</div>
      </div>
    `;
    sfx.playSuccess();
  } else {
    banner.className = 'quiz-result-banner incorrect';
    banner.innerHTML = `
      <span class="result-banner-icon">⚠️</span>
      <div class="result-banner-text">
        <div>${correctCount} / ${totalNumericCount} 정답</div>
        <div style="font-size:0.85rem; font-weight:normal; opacity:0.9;">빨간색으로 표시된 오답의 올바른 정답 수치를 확인해보세요.</div>
      </div>
    `;
    sfx.playWrong();
  }

  // Reveal Detailed Breakdown
  renderDetailedBreakdown(state.currentQuestion);
}

/**
 * Show All Answers
 */
function showAllAnswers() {
  if (!state.currentQuestion) return;

  state.stepInputs.forEach(item => {
    item.inputEl.value = item.step.finalAmount;
    item.inputEl.classList.remove('is-wrong');
    item.inputEl.classList.add('is-correct');

    const feedbackEl = document.getElementById(`stepFeedback_${item.idx}`);
    if (feedbackEl) {
      feedbackEl.className = 'step-feedback-msg correct-msg';
      feedbackEl.innerHTML = `✓ 정답 (${item.step.finalAmount})`;
    }
  });

  const banner = document.getElementById('quizResultBanner');
  banner.classList.remove('hidden');
  banner.className = 'quiz-result-banner perfect';
  banner.innerHTML = `
    <span class="result-banner-icon">💡</span>
    <div class="result-banner-text">
      <div>정답 전체 공개 완료</div>
      <div style="font-size:0.85rem; font-weight:normal; opacity:0.9;">하단 상세 해설과 쇼튼 폼 변환표를 확인하세요.</div>
    </div>
  `;

  renderDetailedBreakdown(state.currentQuestion);
}

/**
 * Render Detailed Breakdown (Exceptions & Shorten Summary)
 */
function renderDetailedBreakdown(q) {
  const card = document.getElementById('detailedAnswerCard');
  if (!card) return;
  card.classList.remove('hidden');

  // Exception Rule Banner
  const badgeEl = document.getElementById('ansExceptionBadge');
  const textEl = document.getElementById('ansExceptionText');
  badgeEl.textContent = q.ruleBadge;
  badgeEl.className = 'exception-badge ' + q.ruleClass;
  textEl.textContent = q.ruleText;

  // Shorten Form Breakdown (No units!)
  const shortenBox = document.getElementById('ansShortenBox');
  const shortenGrid = document.getElementById('ansShortenGrid');

  if (q.applyShorten && q.shortenBreakdown.length > 0) {
    shortenBox.classList.remove('hidden');
    shortenGrid.innerHTML = '';
    q.shortenBreakdown.forEach(item => {
      const bEl = document.createElement('div');
      bEl.className = 'shorten-pill-card';
      bEl.innerHTML = `
        <span class="shorten-ing-name">${item.name}</span>
        <div class="shorten-calc">
          <span class="black-val">${item.orig}</span>
          <span class="arrow">➔</span>
          <span class="red-val">${item.shortened}</span>
        </div>
      `;
      shortenGrid.appendChild(bEl);
    });
  } else {
    shortenBox.classList.add('hidden');
  }
}

/**
 * Reference Modal Initialization
 */
function initReferenceModal() {
  const db = window.RECIPE_DATABASE;

  // Liquid
  const liquidEl = document.getElementById('modalLiquidTable');
  const liquidEntries = Object.entries(db.shorten.liquid).map(([k, v]) => ({ k: parseFloat(k), v }));
  liquidEntries.sort((a, b) => a.k - b.k);
  let lqCols = 8;
  let lqHtml = '';
  for (let i = 0; i < liquidEntries.length; i += lqCols) {
    const chunk = liquidEntries.slice(i, i + lqCols);
    lqHtml += '<tr class="black-row">' + chunk.map(c => `<td>${c.k}</td>`).join('') + '</tr>';
    lqHtml += '<tr class="red-row">' + chunk.map(c => `<td>${c.v}</td>`).join('') + '</tr>';
  }
  liquidEl.innerHTML = lqHtml;

  // Powder
  const powderEl = document.getElementById('modalPowderTable');
  const powderEntries = Object.entries(db.shorten.powder).map(([k, v]) => ({ k: parseFloat(k), v }));
  powderEntries.sort((a, b) => a.k - b.k);
  let pwHtml = '<tr class="black-row">' + powderEntries.map(c => `<td>${c.k}</td>`).join('') + '</tr>';
  pwHtml += '<tr class="red-row">' + powderEntries.map(c => `<td>${c.v}</td>`).join('') + '</tr>';
  powderEl.innerHTML = pwHtml;

  // Ice
  const iceEl = document.getElementById('modalIceTable');
  const iceEntries = Object.entries(db.shorten.ice).map(([k, v]) => ({ k: parseFloat(k), v }));
  iceEntries.sort((a, b) => a.k - b.k);
  let icHtml = '<tr class="black-row">' + iceEntries.map(c => `<td>${c.k}</td>`).join('') + '</tr>';
  icHtml += '<tr class="red-row">' + iceEntries.map(c => `<td>${c.v}</td>`).join('') + '</tr>';
  iceEl.innerHTML = icHtml;

  // Modal open/close
  const modal = document.getElementById('referenceModal');
  document.getElementById('btnOpenReference').addEventListener('click', () => modal.classList.remove('hidden'));
  document.getElementById('btnCloseModal').addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  // Modal tabs
  const modalTabs = document.querySelectorAll('.modal-nav-tab');
  const viewShorten = document.getElementById('viewShorten');
  const viewSheet = document.getElementById('viewSheet');
  const modalSheetRule = document.getElementById('modalSheetRule');
  const modalSheetContent = document.getElementById('modalSheetContent');

  modalTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      modalTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.dataset.ref;
      if (target === 'shorten') {
        viewShorten.classList.remove('hidden');
        viewSheet.classList.add('hidden');
      } else {
        viewShorten.classList.add('hidden');
        viewSheet.classList.remove('hidden');

        const cat = db.categories[target];
        if (!cat) return;
        modalSheetRule.innerHTML = `<strong>${target} 공식 문제 순서</strong> : ${cat.order_rule}`;

        let tableHtml = '<table class="sheet-raw-view-table"><thead><tr><th>음료명</th><th>사이즈</th><th>얼음옵션</th><th>제조 순서 및 용량</th></tr></thead><tbody>';
        Object.entries(cat.items).forEach(([dName, dObj]) => {
          ['M', 'L'].forEach(size => {
            cat.ice_options.forEach(iceOpt => {
              const rec = dObj.recipes[size][iceOpt];
              if (!rec) return;
              const stepsStr = rec.steps.map(s => {
                if (s.amount_by_sugar) {
                  return `${s.name}(100%:${s.amount_by_sugar['100%']} / 50%:${s.amount_by_sugar['50%']} / 30%:${s.amount_by_sugar['30%']} / 10%:${s.amount_by_sugar['10%']})`;
                }
                return `${s.name}: ${s.amount || 0}`;
              }).join(' ➔ ');

              tableHtml += `<tr><td><strong>${dName}</strong></td><td>${size}</td><td>${iceOpt}</td><td style="text-align:left;">${stepsStr}</td></tr>`;
            });
          });
        });
        tableHtml += '</tbody></table>';
        modalSheetContent.innerHTML = tableHtml;
      }
    });
  });
}

/**
 * Event Listeners & Boot
 */
document.addEventListener('DOMContentLoaded', () => {
  // Category Filter
  document.querySelectorAll('#categoryFilter .filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#categoryFilter .filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.categoryFilter = btn.dataset.cat;
      nextQuestion();
    });
  });

  // Topping Filter
  document.querySelectorAll('#toppingFilter .filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#toppingFilter .filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.toppingFilter = btn.dataset.top;
      nextQuestion();
    });
  });

  // Sound Toggle
  const soundBtn = document.getElementById('soundToggle');
  soundBtn.addEventListener('click', () => {
    sfx.enabled = !sfx.enabled;
    soundBtn.textContent = sfx.enabled ? '🔊' : '🔇';
  });

  // Action Buttons
  document.getElementById('btnNextQuiz').addEventListener('click', nextQuestion);
  document.getElementById('btnGradeQuiz').addEventListener('click', gradeQuiz);
  document.getElementById('btnShowAllAnswers').addEventListener('click', showAllAnswers);

  // Mobile Keypad Setup
  setupNumberPad();

  // Desktop Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
      if (e.key === 'Enter') {
        // Handled in individual input listener
      }
      return;
    }
    if (e.code === 'Space') {
      e.preventDefault();
      nextQuestion();
    } else if (e.code === 'Enter') {
      e.preventDefault();
      gradeQuiz();
    }
  });

  // Initialize
  initReferenceModal();
  nextQuestion();
});
