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

  const SUBJECT_COLORS = {
    physics: '#69c1ff',   // light blue
    chemistry: '#b69cff', // light purple
    biology: '#84d993',   // light green
  };

  // Simple question banks (12 each, pick 10)
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

  // State
  const state = {
    view: 'home',
    mode: null, // 'casual' | 'timed' | 'competitive'
    subject: null,
    questionList: [],
    answers: [],
    currentIndex: 0,
    correctCount: 0,
    startTime: 0,
    endTime: 0,
    finishedTime: null,
    running: false, // game loop flag
    bot: {
      active: false,
      plan: [],
      correctCount: 0,
      finishedTime: null,
      nextEventIndex: 0,
    }
  };

  // Elements
  const $ = sel => document.querySelector(sel);
  const $$ = sel => document.querySelectorAll(sel);

  const nameOverlay = $('#name-overlay');
  const nameInput = $('#name-input');
  const saveNameBtn = $('#save-name');
  const skipNameBtn = $('#skip-name');

  const subjectModal = $('#subject-modal');
  const cancelSubjectBtn = $('#cancel-subject');

  const tabButtons = $$('.tab-btn');
  const profileChip = $('#profile-chip');

  const homeView = $('#home');
  const ranksView = $('#ranks');
  const leaderboardView = $('#leaderboard');
  const profileView = $('#profile');
  const quizView = $('#quiz');

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
  const saveProfileNameBtn = $('#save-profile-name');

  const quizModeLabel = $('#quiz-mode-label');
  const quizSubjectLabel = $('#quiz-subject-label');
  const quizTimer = $('#quiz-timer');
  const versusBar = $('#versus-bar');
  const youScore = $('#you-score');
  const botScore = $('#bot-score');

  const qProgress = $('#q-progress');
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
  const playAgainBtn = $('#play-again');

  // Stats
  function loadStats(){
    const s = localStorage.getItem(LS_KEYS.stats);
    return s ? { ...DEFAULT_STATS, ...JSON.parse(s) } : { ...DEFAULT_STATS };
  }
  function saveStats(stats){
    localStorage.setItem(LS_KEYS.stats, JSON.stringify(stats));
  }
  function getName(){
    return localStorage.getItem(LS_KEYS.name) || '';
  }
  function setName(n){
    localStorage.setItem(LS_KEYS.name, n);
  }

  function computeScore(stats){
    // Local score for rank progression
    // Conservative weighting to reduce variance
    return stats.wins * 100 + stats.totalCorrect * 2 + stats.totalQuizzes * 5;
  }
  function computeRank(stats){
    const score = computeScore(stats);
    if (score >= 1500) return 'Master';
    if (score >= 1000) return 'Diamond';
    if (score >= 700)  return 'Platinum';
    if (score >= 400)  return 'Gold';
    if (score >= 200)  return 'Silver';
    return 'Bronze';
  }

  function accuracy(stats){
    if (stats.totalQuestions === 0) return 0;
    return Math.round((stats.totalCorrect / stats.totalQuestions) * 100);
  }
  function winRate(stats){
    if (stats.competitiveMatches === 0) return 0;
    return Math.round((stats.wins / stats.competitiveMatches) * 100);
    }

  function updateAccent(subject){
    const root = document.documentElement;
    const color = SUBJECT_COLORS[subject] || '#69c1ff';
    root.style.setProperty('--accent', color);
    root.style.setProperty('--accent-weak', colorMix(color, 20));
  }

  // Very small color-mix fallback for older browsers
  function colorMix(hex, pct){
    // Blend with white by pct%
    const c = hex.replace('#','');
    const r = parseInt(c.substring(0,2),16);
    const g = parseInt(c.substring(2,4),16);
    const b = parseInt(c.substring(4,6),16);
    const nr = Math.round(r + (255 - r) * (pct/100));
    const ng = Math.round(g + (255 - g) * (pct/100));
    const nb = Math.round(b + (255 - b) * (pct/100));
    return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`;
  }
  function toHex(n){ return n.toString(16).padStart(2,'0'); }

  // View handling
  function showView(id){
    state.view = id;
    $$('.view').forEach(v => v.classList.remove('visible'));
    $(`#${id}`).classList.add('visible');
    tabButtons.forEach(b => b.classList.toggle('active', b.dataset.view === id));
    if (id === 'profile') renderProfile();
    if (id === 'home') renderHomeStats();
  }

  // Home stats
  function renderHomeStats(){
    const stats = loadStats();
    statQuizzes.textContent = stats.totalQuizzes;
    statAccuracy.textContent = `${accuracy(stats)}%`;
    statWins.textContent = stats.wins;
    statWinrate.textContent = `${winRate(stats)}%`;
  }

  // Profile
  function renderProfile(){
    const stats = loadStats();
    profileNameInput.value = getName() || 'Shahriar';
    const r = computeRank(stats);
    profileRank.textContent = r;
    profileRank.className = `rank-badge ${rankClass(r)}`;
    pQuizzes.textContent = stats.totalQuizzes;
    pQuestions.textContent = stats.totalQuestions;
    pCorrect.textContent = stats.totalCorrect;
    pAccuracy.textContent = `${accuracy(stats)}%`;
    pWins.textContent = stats.wins;
    pWinrate.textContent = `${winRate(stats)}%`;
    pScore.textContent = computeScore(stats);
  }

  function rankClass(r){
    const map = { Silver:'silver', Gold:'gold', Platinum:'plat', Diamond:'diamond', Master:'master' };
    return map[r] || '';
  }

  // Profile chip
  function updateChip(){
    const stats = loadStats();
    const name = getName() || 'Shahriar';
    chipName.textContent = name;
    const r = computeRank(stats);
    chipRank.textContent = r;
    chipRank.className = `rank-badge ${rankClass(r)}`;
  }

  // Quiz
  function startMode(mode){
    state.mode = mode;
    // pick subject
    subjectModal.classList.add('visible');
  }

  function selectSubject(subject){
    state.subject = subject;
    updateAccent(subject);
    beginQuiz();
    subjectModal.classList.remove('visible');
  }

  function beginQuiz(){
    // Reset
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

    // UI labels
    quizModeLabel.textContent = modeLabel(state.mode);
    quizSubjectLabel.textContent = capitalize(state.subject);

    // Show quiz view
    showView('quiz');
    resultCard.classList.add('hidden');
    $('#question-card').classList.remove('hidden');
    versusBar.classList.toggle('hidden', state.mode !== 'competitive');
    youScore.textContent = '0';
    botScore.textContent = '0';

    // Setup bot plan (simple)
    if (state.mode === 'competitive'){
      state.bot.plan = makeBotPlan(now);
    }

    renderQuestion();
    startLoop();
  }

  function makeBotPlan(startMs){
    const profiles = [
      { name:'fast', min:8000, max:12000, pCorrect:0.6 },
      { name:'medium', min:12000, max:18000, pCorrect:0.7 },
      { name:'slow', min:18000, max:25000, pCorrect:0.8 },
    ];
    const prof = profiles[Math.floor(Math.random() * profiles.length)];
    const events = [];
    let t = startMs + rand(prof.min, prof.max);
    for (let i=0;i<10;i++){
      const correct = Math.random() < prof.pCorrect;
      events.push({ at: t, correct });
      t += rand(prof.min, prof.max);
    }
    return events;
  }

  function renderQuestion(){
    const idx = state.currentIndex;
    const q = state.questionList[idx];
    qProgress.textContent = `Question ${idx+1} of ${state.questionList.length}`;
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
    finishBtn.classList.toggle('hidden', idx !== state.questionList.length - 1);
  }

  function onSelectOption(choice){
    if (!state.running) return;
    const idx = state.currentIndex;
    if (state.answers[idx] !== null) return; // locked
    state.answers[idx] = choice;

    // Mark selection
    [...qOptions.children].forEach((btn, i) => {
      btn.classList.toggle('selected', i === choice);
    });

    // If casual, reveal correctness instantly for feedback
    if (state.mode === 'casual'){
      const q = state.questionList[idx];
      [...qOptions.children].forEach((btn, i) => {
        if (i === q.correctIndex) btn.classList.add('correct');
        if (i === choice && i !== q.correctIndex) btn.classList.add('incorrect');
      });
    }

    nextBtn.disabled = false;
  }

  function nextQuestion(){
    if (state.answers[state.currentIndex] === null) return;
    if (state.currentIndex < state.questionList.length - 1){
      state.currentIndex++;
      renderQuestion();
    }
    // Update finish button visibility
    finishBtn.classList.toggle('hidden', state.currentIndex !== state.questionList.length - 1);
  }

  function finishQuiz(reason='finished'){
    if (!state.running) return;
    state.running = false;
    // Calculate user correct
    const answered = state.answers.filter(a => a !== null).length;
    state.correctCount = state.answers.reduce((sum, a, i) => {
      if (a === null) return sum;
      return sum + (a === state.questionList[i].correctIndex ? 1 : 0);
    }, 0);
    const now = Date.now();
    const timeUsedMs = now - state.startTime;
    // If user answered all, set finished time
    if (answered === state.questionList.length) state.finishedTime = now;

    let title = 'Quiz Complete';
    let detail = '';
    let showVs = state.mode === 'competitive';
    let you = state.correctCount;
    let bot = 0;

    if (state.mode === 'competitive'){
      // Lock in bot up to now or until last plan event before end
      processBotEvents(now, true);
      bot = state.bot.correctCount;

      // Decide winner
      let outcome = 'draw';
      if (you > bot) outcome = 'win';
      else if (you < bot) outcome = 'lose';
      else {
        // Tie: if both finished all 10, earlier finisher wins; otherwise draw
        if (state.finishedTime && state.bot.finishedTime){
          if (state.finishedTime < state.bot.finishedTime) outcome = 'win';
          else if (state.finishedTime > state.bot.finishedTime) outcome = 'lose';
          else outcome = 'draw';
        } else {
          outcome = 'draw';
        }
      }

      if (outcome === 'win'){ title = 'Victory!'; detail = 'You outscored the bot.'; }
      else if (outcome === 'lose'){ title = 'Defeat'; detail = 'The bot scored higher.'; }
      else { title = 'It’s a tie'; detail = 'Scores were equal.'; }

      // Update stats
      const stats = loadStats();
      stats.totalQuizzes += 1;
      stats.totalQuestions += answered;
      stats.totalCorrect += you;
      stats.competitiveMatches += 1;
      if (you > bot) stats.wins += 1;
      else if (you === bot && state.finishedTime && state.bot.finishedTime && state.finishedTime < state.bot.finishedTime) {
        // tie-breaker win if both finished and you were faster
        stats.wins += 1;
      }
      saveStats(stats);
    } else {
      // Casual or Timed
      const stats = loadStats();
      stats.totalQuizzes += 1;
      stats.totalQuestions += answered;
      stats.totalCorrect += you;
      saveStats(stats);
      detail = state.mode === 'timed' ? 'Timed challenge complete.' : 'Practice session complete.';
    }

    // Show result
    $('#question-card').classList.add('hidden');
    resultCard.classList.remove('hidden');
    resultTitle.textContent = title;
    resultDetail.textContent = detail;
    resultYou.textContent = you;
    resultBot.textContent = state.mode === 'competitive' ? state.bot.correctCount : 0;
    resultCard.querySelectorAll('.vs-only').forEach(el => el.style.display = showVs ? '' : 'none');
    resultTime.textContent = fmtTime(timeUsedMs);

    // Update top chip + home stats
    updateChip();
    renderHomeStats();
  }

  // Loop (single source of truth)
  function startLoop(){
    function loop(){
      if (!state.running) return;
      const now = Date.now();

      // Timer
      if (state.mode === 'timed' || state.mode === 'competitive'){
        const left = Math.max(0, state.endTime - now);
        quizTimer.textContent = fmtTime(left);
        if (left <= 0){
          finishQuiz('timeout');
          return;
        }
      } else {
        quizTimer.textContent = '—';
      }

      // Bot
      if (state.mode === 'competitive'){
        processBotEvents(now, false);
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
      // Ignore events that land after endTime (time-out)
      if (ev.at <= state.endTime){
        if (ev.correct) state.bot.correctCount += 1;
        if (state.bot.nextEventIndex === plan.length - 1) state.bot.finishedTime = ev.at;
      }
      state.bot.nextEventIndex++;
    }
    botScore.textContent = state.bot.correctCount.toString();
  }

  function pickQuestions(subject, count){
    const bank = BANK[subject] || [];
    const arr = bank.slice();
    shuffle(arr);
    return arr.slice(0, count);
  }

  function shuffle(a){
    for (let i=a.length-1; i>0; i--){
      const j = Math.floor(Math.random() * (i+1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }

  function rand(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function modeLabel(m){
    if (m === 'casual') return 'Casual';
    if (m === 'timed') return 'Solo Timed';
    if (m === 'competitive') return 'Competitive vs Bot';
    return 'Mode';
  }
  function capitalize(s){ return s ? s[0].toUpperCase() + s.slice(1) : s; }

  function fmtTime(ms){
    const total = Math.max(0, Math.floor(ms/1000));
    const m = Math.floor(total / 60);
    const s = (total % 60).toString().padStart(2,'0');
    return `${m}:${s}`;
  }

  // Events
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.classList.contains('tab-btn')){
      showView(t.dataset.view);
    }
    if (t.dataset.view === 'profile') showView('profile');
    if (t.dataset.view === 'home') showView('home');

    if (t.classList.contains('start-mode')){
      startMode(t.dataset.mode);
    }

    if (t.classList.contains('subject-card')){
      selectSubject(t.dataset.subject);
    }

    if (t.id === 'cancel-subject'){
      subjectModal.classList.remove('visible');
    }

    if (t.id === 'next-btn'){
      nextQuestion();
    }

    if (t.id === 'finish-btn'){
      finishQuiz('finished');
    }

    if (t.id === 'save-profile-name'){
      const newName = profileNameInput.value.trim();
      if (newName){
        setName(newName);
        updateChip();
      }
    }

    if (t.id === 'play-again'){
      // restart same mode with subject select
      startMode(state.mode || 'casual');
    }
  });

  saveNameBtn.addEventListener('click', () => {
    const v = nameInput.value.trim();
    const name = v || 'Shahriar';
    setName(name);
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

  nextBtn.addEventListener('click', () => {
    // Evaluate correctness increment when leaving question
    tallyCurrentIfNeeded();
    nextQuestion();
  });

  finishBtn.addEventListener('click', () => {
    tallyCurrentIfNeeded();
    finishQuiz('finished');
  });

  function tallyCurrentIfNeeded(){
    const i = state.currentIndex;
    const choice = state.answers[i];
    if (choice === null) return;
    // Nothing else to do here now (we tally at finish)
  }

  // Initialize
  function init(){
    if (getName()){
      nameOverlay.classList.remove('visible');
    } else {
      nameOverlay.classList.add('visible');
    }
    updateChip();
    renderHomeStats();

    // Prefill profile name field
    profileNameInput.value = getName() || 'Shahriar';
  }

  init();
})();
