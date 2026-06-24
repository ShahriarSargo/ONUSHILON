(() => {
  const LS_KEYS = {
    name: 'onushilon.playerName',
    stats: 'onushilon.stats',
  };

  const DEFAULT_STATS = {
    totalQuizzes: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    wins: 0,
    competitiveMatches: 0,
  };

  // Match the CSS variables
  const SUBJECT_COLORS = {
    physics: '#38bdf8',   
    chemistry: '#c084fc', 
    biology: '#4ade80',   
  };

  // Question Banks (12 each)
  const BANK = {
    physics: [
      q('What is the SI unit of force?', ['Joule', 'Newton', 'Watt', 'Pascal'], 1),
      q('Speed is defined as:', ['Distance/Time', 'Time/Distance', 'Mass/Volume', 'Force/Area'], 0),
      q('Acceleration due to gravity near Earth is about:', ['1 m/s²', '3.0×10^8 m/s', '9.8 m/s²', '6.67×10^-11 N·m²/kg²'], 2),
      q('The speed of light in vacuum is about:', ['3.0×10^8 m/s', '9.8 m/s²', '3.0×10^6 m/s', '1.5×10^8 m/s'], 0),
      q('Work done equals:', ['Force × Distance', 'Power × Time', 'Mass × Acceleration', 'Pressure × Volume'], 0),
      q('The SI unit of energy is:', ['Joule', 'Newton', 'Coulomb', 'Tesla'], 0),
      q('Power is:', ['Work/Time', 'Force/Area', 'Energy × Time', 'Current × Resistance'], 0),
      q('Newton’s third law states:', ['F=ma', 'Energy is conserved', 'Equal and opposite reactions', 'Entropy increases'], 2),
      q('Frequency is measured in:', ['Ampere', 'Hertz', 'Volt', 'Ohm'], 1),
      q('Potential energy near Earth is:', ['mgv', 'mgh', '1/2 mv²', 'qV'], 1),
      q('Ohm’s law is:', ['P=IV', 'V=IR', 'Q=mcΔT', 'E=mc²'], 1),
      q('Density is:', ['m/V', 'V/m', 'F/A', 'P×V'], 0),
    ],
    chemistry: [
      q('Chemical formula of water is:', ['H2O', 'CO2', 'NaCl', 'O2'], 0),
      q('Atomic number equals number of:', ['Neutrons', 'Electrons', 'Protons', 'Ions'], 2),
      q('A solution with pH 3 is:', ['Neutral', 'Basic', 'Acidic', 'Buffer'], 2),
      q('Common table salt is:', ['KCl', 'NaCl', 'CaCO3', 'NaOH'], 1),
      q('Respiration releases:', ['CO2', 'O3', 'H2', 'Cl2'], 0),
      q('Symbol for oxygen:', ['Ox', 'Oy', 'O', 'Om'], 2),
      q('Noble gases are:', ['Reactive metals', 'Inert', 'Acidic', 'Radioactive'], 1),
      q('Ionic bond forms by:', ['Electron sharing', 'Electron transfer', 'Proton sharing', 'Neutron transfer'], 1),
      q('Rows of periodic table are called:', ['Groups', 'Periods', 'Blocks', 'Lines'], 1),
      q('Avogadro’s number ≈', ['6.02×10^20', '6.02×10^22', '6.02×10^23', '6.02×10^25'], 2),
      q('Acids turn blue litmus:', ['Blue', 'Green', 'Red', 'Yellow'], 2),
      q('Methane formula:', ['CH3', 'CH4', 'C2H6', 'C2H4'], 1),
    ],
    biology: [
      q('Basic unit of life is the:', ['Atom', 'Tissue', 'Organ', 'Cell'], 3),
      q('DNA stands for:', ['Deoxy Nitric Acid', 'Deoxyribonucleic Acid', 'Dioxyribo Nucleic Acid', 'Deoxynucleic Acid'], 1),
      q('Photosynthesis happens in the:', ['Mitochondria', 'Nucleus', 'Chloroplast', 'Ribosome'], 2),
      q('Plants primarily produce:', ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'], 1),
      q('Human heart has how many chambers?', ['2', '3', '4', '6'], 2),
      q('RBCs carry oxygen using:', ['Chlorophyll', 'Hemoglobin', 'Myosin', 'Insulin'], 1),
      q('Mitochondria are the:', ['Brain', 'Powerhouse', 'Skeleton', 'Memory'], 1),
      q('Nerve cells are called:', ['Nephrons', 'Neurons', 'Nucleons', 'Nematodes'], 1),
      q('Largest human organ:', ['Liver', 'Brain', 'Skin', 'Heart'], 2),
      q('Enzymes are mostly:', ['Carbohydrates', 'Lipids', 'Proteins', 'Nucleic acids'], 2),
      q('Bacteria are:', ['Eukaryotes', 'Prokaryotes', 'Viruses', 'Fungi'], 1),
      q('“Father of genetics” is:', ['Darwin', 'Mendel', 'Watson', 'Crick'], 1),
    ],
  };

  function q(text, options, correctIndex){ return { text, options, correctIndex }; }

  // App State
  const state = {
    view: 'home',
    mode: null,
    subject: null,
    questionList: [],
    answers: [],
    currentIndex: 0,
    correctCount: 0,
    startTime: 0,
    endTime: 0,
    finishedTime: null,
    running: false, 
    bot: {
      active: false,
      plan: [],
      correctCount: 0,
      finishedTime: null,
      nextEventIndex: 0,
    }
  };

  // DOM Elements
  const $ = sel => document.querySelector(sel);
  const $$ = sel => document.querySelectorAll(sel);

  const nameOverlay = $('#name-overlay');
  const nameInput = $('#name-input');
  const saveNameBtn = $('#save-name');
  const skipNameBtn = $('#skip-name');
  const subjectModal = $('#subject-modal');
  const cancelSubjectBtn = $('#cancel-subject');
  const tabButtons = $$('.tab-btn');

  const chipName = $('#chip-name');
  const chipRank = $('#chip-rank');

  const statQuizzes = $('#stat-quizzes');
  const statAccuracy = $('#stat-accuracy');
  const statWins = $('#stat-wins');
  const statWinrate = $('#stat-winrate');

  const profileNameInput = $('#profile-name');
  const profileRank = $('#profile-rank');
  const pQuizzes = $('#p-quizzes');
  const pQuestions = $('#p-questions');
  const pCorrect = $('#p-correct');
  const pAccuracy = $('#p-accuracy');
  const pWins = $('#p-wins');
  const pWinrate = $('#p-winrate');
  const pScore = $('#p-score');
  
  const quizModeLabel = $('#quiz-mode-label');
  const quizSubjectLabel = $('#quiz-subject-label');
  const quizTimer = $('#quiz-timer');
  const versusBar = $('#versus-bar');
  const youScore = $('#you-score');
  const botScore = $('#bot-score');

  const qProgress = $('#q-progress');
  const qProgressFill = $('#q-progress-fill');
  const qText = $('#q-text');
  const qOptions = $('#q-options');
  const nextBtn = $('#next-btn');
  const finishBtn = $('#finish-btn');

  const resultCard = $('#result-card');
  const resultTitle = $('#result-title');
  const resultDetail = $('#result-detail');
  const resultYou = $('#result-you');
  const resultBot = $('#result-bot');
  const resultTime = $('#result-time');

  // Stats Logic
  function loadStats(){
    const s = localStorage.getItem(LS_KEYS.stats);
    return s ? { ...DEFAULT_STATS, ...JSON.parse(s) } : { ...DEFAULT_STATS };
  }
  function saveStats(stats){ localStorage.setItem(LS_KEYS.stats, JSON.stringify(stats)); }
  function getName(){ return localStorage.getItem(LS_KEYS.name) || ''; }
  function setName(n){ localStorage.setItem(LS_KEYS.name, n); }

  function computeScore(stats){ return stats.wins * 100 + stats.totalCorrect * 2 + stats.totalQuizzes * 5; }
  function computeRank(stats){
    const score = computeScore(stats);
    if (score >= 1500) return 'Master';
    if (score >= 1000) return 'Diamond';
    if (score >= 700)  return 'Platinum';
    if (score >= 400)  return 'Gold';
    if (score >= 200)  return 'Silver';
    return 'Bronze';
  }
  function accuracy(stats){ return stats.totalQuestions === 0 ? 0 : Math.round((stats.totalCorrect / stats.totalQuestions) * 100); }
  function winRate(stats){ return stats.competitiveMatches === 0 ? 0 : Math.round((stats.wins / stats.competitiveMatches) * 100); }

  function updateAccent(subject){
    const root = document.documentElement;
    const color = SUBJECT_COLORS[subject] || '#38bdf8';
    root.style.setProperty('--accent', color);
    
    // Convert hex to rgba for the glow effect
    let r = parseInt(color.slice(1, 3), 16),
        g = parseInt(color.slice(3, 5), 16),
        b = parseInt(color.slice(5, 7), 16);
    root.style.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.4)`);
  }

  // Views & Routing
  function showView(id){
    state.view = id;
    $$('.view').forEach(v => v.classList.remove('visible'));
    $(`#${id}`).classList.add('visible');
    tabButtons.forEach(b => b.classList.toggle('active', b.dataset.view === id));
    if (id === 'profile') renderProfile();
    if (id === 'home') renderHomeStats();
  }

  function renderHomeStats(){
    const stats = loadStats();
    statQuizzes.textContent = stats.totalQuizzes;
    statAccuracy.textContent = `${accuracy(stats)}%`;
    statWins.textContent = stats.wins;
    statWinrate.textContent = `${winRate(stats)}%`;
  }

  function renderProfile(){
    const stats = loadStats();
    profileNameInput.value = getName() || 'Shahriar';
    const r = computeRank(stats);
    profileRank.textContent = r;
    profileRank.className = `rank-badge ${r.toLowerCase()}`;
    pQuizzes.textContent = stats.totalQuizzes;
    pQuestions.textContent = stats.totalQuestions;
    pCorrect.textContent = stats.totalCorrect;
    pAccuracy.textContent = `${accuracy(stats)}%`;
    pWins.textContent = stats.wins;
    pWinrate.textContent = `${winRate(stats)}%`;
    pScore.textContent = computeScore(stats);
  }

  function updateChip(){
    const stats = loadStats();
    chipName.textContent = getName() || 'Shahriar';
    const r = computeRank(stats);
    chipRank.textContent = r;
    chipRank.className = `rank-badge ${r.toLowerCase()}`;
  }

  // Quiz Engine
  function startMode(mode){
    state.mode = mode;
    subjectModal.classList.add('visible');
  }

  function selectSubject(subject){
    state.subject = subject;
    updateAccent(subject);
    beginQuiz();
    subjectModal.classList.remove('visible');
  }

  function beginQuiz(){
    state.questionList = pickQuestions(state.subject, 10);
    state.answers = new Array(state.questionList.length).fill(null);
    state.currentIndex = 0;
    state.correctCount = 0;
    state.finishedTime = null;
    state.bot = { active: state.mode === 'competitive', plan: [], correctCount: 0, finishedTime: null, nextEventIndex: 0 };
    state.running = true;

    const timed = (state.mode === 'timed' || state.mode === 'competitive');
    const now = Date.now();
    state.startTime = now;
    state.endTime = timed ? now + 5 * 60 * 1000 : 0;

    quizModeLabel.textContent = modeLabel(state.mode);
    quizSubjectLabel.textContent = capitalize(state.subject);

    showView('quiz');
    resultCard.classList.add('hidden');
    $('#question-card').classList.remove('hidden');
    versusBar.classList.toggle('hidden', state.mode !== 'competitive');
    youScore.textContent = '0';
    botScore.textContent = '0';

    if (state.mode === 'competitive') state.bot.plan = makeBotPlan(now);

    renderQuestion();
    startLoop();
  }

  function renderQuestion(){
    const idx = state.currentIndex;
    const q = state.questionList[idx];
    
    qProgress.textContent = `Question ${idx+1} of ${state.questionList.length}`;
    qProgressFill.style.width = `${((idx) / state.questionList.length) * 100}%`;
    
    qText.textContent = q.text;
    qOptions.innerHTML = '';
    
    q.options.forEach((op, i) => {
      const btn = document.createElement('button');
      btn.className = 'q-option';
      btn.textContent = op;
      btn.addEventListener('click', () => onSelectOption(i));
      qOptions.appendChild(btn);
    });

    nextBtn.disabled = true;
    
    if(idx === state.questionList.length - 1) {
       nextBtn.classList.add('hidden');
       finishBtn.classList.remove('hidden');
    } else {
       nextBtn.classList.remove('hidden');
       finishBtn.classList.add('hidden');
    }
  }

  function onSelectOption(choice){
    if (!state.running) return;
    const idx = state.currentIndex;
    if (state.answers[idx] !== null) return; 
    
    state.answers[idx] = choice;

    // Lock options
    [...qOptions.children].forEach((btn, i) => {
      btn.classList.add('locked');
      btn.classList.toggle('selected', i === choice);
    });

    if (state.mode === 'casual'){
      const q = state.questionList[idx];
      [...qOptions.children].forEach((btn, i) => {
        if (i === q.correctIndex) btn.classList.add('correct');
        if (i === choice && i !== q.correctIndex) btn.classList.add('incorrect');
      });
    }

    nextBtn.disabled = false;
    finishBtn.disabled = false;
  }

  function nextQuestion(){
    if (state.answers[state.currentIndex] === null) return;
    if (state.currentIndex < state.questionList.length - 1){
      state.currentIndex++;
      renderQuestion();
    }
  }

  function finishQuiz(reason='finished'){
    if (!state.running) return;
    state.running = false;
    
    qProgressFill.style.width = `100%`;

    const answered = state.answers.filter(a => a !== null).length;
    state.correctCount = state.answers.reduce((sum, a, i) => sum + (a === state.questionList[i].correctIndex ? 1 : 0), 0);
    const now = Date.now();
    const timeUsedMs = now - state.startTime;
    if (answered === state.questionList.length) state.finishedTime = now;

    let title = 'Quiz Complete';
    let detail = '';
    let showVs = state.mode === 'competitive';
    let you = state.correctCount;
    let bot = 0;

    if (state.mode === 'competitive'){
      processBotEvents(now, true);
      bot = state.bot.correctCount;

      let outcome = 'draw';
      if (you > bot) outcome = 'win';
      else if (you < bot) outcome = 'lose';
      else if (state.finishedTime && state.bot.finishedTime) {
        outcome = state.finishedTime < state.bot.finishedTime ? 'win' : (state.finishedTime > state.bot.finishedTime ? 'lose' : 'draw');
      }

      if (outcome === 'win'){ title = 'Victory!'; detail = 'You outscored the bot.'; }
      else if (outcome === 'lose'){ title = 'Defeat'; detail = 'The bot scored higher.'; }
      else { title = 'Tie Game'; detail = 'Scores were equal.'; }

      const stats = loadStats();
      stats.totalQuizzes++;
      stats.totalQuestions += answered;
      stats.totalCorrect += you;
      stats.competitiveMatches++;
      if (outcome === 'win') stats.wins++;
      saveStats(stats);
      
    } else {
      const stats = loadStats();
      stats.totalQuizzes++;
      stats.totalQuestions += answered;
      stats.totalCorrect += you;
      saveStats(stats);
      detail = state.mode === 'timed' ? 'Timed challenge complete.' : 'Practice session complete.';
    }

    $('#question-card').classList.add('hidden');
    resultCard.classList.remove('hidden');
    
    resultTitle.textContent = title;
    resultDetail.textContent = detail;
    resultYou.textContent = you;
    resultBot.textContent = state.mode === 'competitive' ? state.bot.correctCount : 0;
    document.querySelectorAll('.vs-only').forEach(el => el.style.display = showVs ? '' : 'none');
    resultTime.textContent = fmtTime(timeUsedMs);

    updateChip();
    renderHomeStats();
  }

  // Animation Loop / Bot simulation
  function startLoop(){
    function loop(){
      if (!state.running) return;
      const now = Date.now();

      if (state.mode === 'timed' || state.mode === 'competitive'){
        const left = Math.max(0, state.endTime - now);
        quizTimer.textContent = fmtTime(left);
        if (left <= 0) return finishQuiz('timeout');
      } else {
        quizTimer.textContent = '—';
      }

      if (state.mode === 'competitive') {
        processBotEvents(now, false);
        youScore.textContent = state.correctCount; // Realtime updating might feel cooler
      }

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  function processBotEvents(now, flushAll){
    if (!state.bot.active) state.bot.active = true;
    const plan = state.bot.plan;
    while (state.bot.nextEventIndex < plan.length){
      const ev = plan[state.bot.nextEventIndex];
      if (!flushAll && ev.at > now) break;
      if (ev.at <= state.endTime){
        if (ev.correct) state.bot.correctCount++;
        if (state.bot.nextEventIndex === plan.length - 1) state.bot.finishedTime = ev.at;
      }
      state.bot.nextEventIndex++;
    }
    botScore.textContent = state.bot.correctCount.toString();
  }

  function makeBotPlan(startMs){
    const profiles = [
      { min:8000, max:12000, pCorrect:0.6 },
      { min:12000, max:18000, pCorrect:0.7 },
      { min:18000, max:25000, pCorrect:0.8 },
    ];
    const prof = profiles[Math.floor(Math.random() * profiles.length)];
    const events = [];
    let t = startMs + rand(prof.min, prof.max);
    for (let i=0;i<10;i++){
      events.push({ at: t, correct: Math.random() < prof.pCorrect });
      t += rand(prof.min, prof.max);
    }
    return events;
  }

  // Helpers
  function pickQuestions(subject, count){
    const arr = (BANK[subject] || []).slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, count);
  }

  function rand(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }
  function modeLabel(m){ return m === 'casual' ? 'Casual' : (m === 'timed' ? 'Solo Timed' : 'Competitive vs Bot'); }
  function capitalize(s){ return s ? s[0].toUpperCase() + s.slice(1) : s; }
  function fmtTime(ms){
    const total = Math.max(0, Math.floor(ms/1000));
    const m = Math.floor(total / 60);
    const s = (total % 60).toString().padStart(2,'0');
    return `${m}:${s}`;
  }

  // Event Listeners
  document.addEventListener('click', (e) => {
    const t = e.target.closest('button, a, .tab-btn, .start-mode, .subject-card');
    if(!t) return;

    if (t.classList.contains('tab-btn')) showView(t.dataset.view);
    if (t.dataset.view === 'profile') showView('profile');
    if (t.dataset.view === 'home') showView('home');
    if (t.dataset.view === 'leaderboard') showView('leaderboard');
    if (t.dataset.view === 'ranks') showView('ranks');

    if (t.classList.contains('start-mode')) startMode(t.dataset.mode);
    if (t.classList.contains('subject-card')) selectSubject(t.dataset.subject);
    
    if (t.id === 'cancel-subject') subjectModal.classList.remove('visible');
    if (t.id === 'next-btn') nextQuestion();
    if (t.id === 'finish-btn') finishQuiz('finished');
    if (t.id === 'play-again') startMode(state.mode || 'casual');

    if (t.id === 'save-profile-name'){
      const newName = profileNameInput.value.trim();
      if (newName){
        setName(newName);
        updateChip();
      }
    }
  });

  saveNameBtn.addEventListener('click', () => {
    setName(nameInput.value.trim() || 'Shahriar');
    updateChip();
    nameOverlay.classList.remove('visible');
    showView('home');
  });

  skipNameBtn.addEventListener('click', () => {
    setName('Shahriar');
    updateChip();
    nameOverlay.classList.remove('visible');
    showView('home');
  });

  // Init
  function init(){
    if (getName()) nameOverlay.classList.remove('visible');
    else nameOverlay.classList.add('visible');
    
    updateChip();
    renderHomeStats();
    profileNameInput.value = getName() || 'Shahriar';
  }

  init();
})();
