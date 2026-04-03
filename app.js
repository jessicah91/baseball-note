const TEAM_META = {
  KT: { label: 'KT 위즈', color: '#111111', strong: '#000000', logo: 'logos/kt.png', kbo: 'KT' },
  SSG: { label: 'SSG 랜더스', color: '#CE0E2D', strong: '#96091F', logo: 'logos/ssg.png', kbo: 'SSG' },
  NC: { label: 'NC 다이노스', color: '#315288', strong: '#223A61', logo: 'logos/nc.png', kbo: 'NC' },
  HANWHA: { label: '한화 이글스', color: '#F37321', strong: '#C85A13', logo: 'logos/hanwha.png', kbo: '한화' },
  LOTTE: { label: '롯데 자이언츠', color: '#041E42', strong: '#091F43', logo: 'logos/lotte.png', kbo: '롯데' },
  SAMSUNG: { label: '삼성 라이온즈', color: '#0066B3', strong: '#004C86', logo: 'logos/samsung.png', kbo: '삼성' },
  DOOSAN: { label: '두산 베어스', color: '#131230', strong: '#0B0A1D', logo: 'logos/doosan.png', kbo: '두산' },
  LG: { label: 'LG 트윈스', color: '#C30452', strong: '#91033E', logo: 'logos/lg.png', kbo: 'LG' },
  KIA: { label: 'KIA 타이거즈', color: '#EA0029', strong: '#B90024', logo: 'logos/kia.png', kbo: 'KIA' },
  KIWOOM: { label: '키움 히어로즈', color: '#570514', strong: '#3B030E', logo: 'logos/kiwoom.png', kbo: '키움' }
};

const RULES = [
  { id: 'single', title: '1루타', badge: '주루', summary: '타자가 안전하게 1루까지 진루하면 1루타야.', detail: '타자가 홈에서 출발해 1루 베이스를 밟는 움직임을 보여줘.', type: 'run', path: ['home', 'first'] },
  { id: 'double', title: '2루타', badge: '주루', summary: '타자가 한 번에 2루까지 가면 2루타야.', detail: '홈에서 출발해서 1루를 지나 2루까지 도달하는 흐름을 보여줘.', type: 'run', path: ['home', 'first', 'second'] },
  { id: 'triple', title: '3루타', badge: '주루', summary: '타자가 멈추지 않고 3루까지 들어가면 3루타야.', detail: '홈 → 1루 → 2루 → 3루를 순서대로 모두 지나가는 주루 장면이야.', type: 'run', path: ['home', 'first', 'second', 'third'] },
  { id: 'ground-home-run', title: '그라운드 홈런', badge: '주루', summary: '페어 타구로 타자가 네 베이스를 모두 돌아 홈까지 들어오면 그라운드 홈런이야.', detail: '홈에서 출발해 1루, 2루, 3루를 모두 돌고 다시 홈으로 들어오는 주루를 보여줘.', type: 'run', path: ['home', 'first', 'second', 'third', 'home'] },
  { id: 'hit', title: '안타', badge: '타구', summary: '타자가 친 공이 페어 지역에 떨어져 수비보다 먼저 1루에 나가면 안타야.', detail: '공이 페어 지역의 외야 쪽으로 향하는 장면을 보여줘.', type: 'ball', x: 64, y: 42 },
  { id: 'foul', title: '파울', badge: '타구', summary: '타구가 1루선과 3루선 바깥쪽으로 나가면 파울이야.', detail: '공이 파울라인 바깥쪽 갈색 지역으로 빠지는 장면이야.', type: 'ball', x: 13, y: 47 },
  { id: 'home-run', title: '홈런', badge: '타구', summary: '타구가 페어 지역에서 담장을 넘기면 홈런이야.', detail: '공이 중앙 깊숙이 날아가 담장을 넘기는 느낌으로 표현했어.', type: 'ball', x: 50, y: 8 },
  { id: 'ground-ball', title: '내야땅볼', badge: '타구', summary: '타구가 내야 땅으로 굴러가며 처리되는 타구를 내야땅볼이라고 해.', detail: '공이 3루-유격수 쪽 내야 흙 부분으로 굴러가는 장면이야.', type: 'ball', x: 30, y: 62 }
];

const STORAGE_KEYS = {
  team: 'dugout-team',
  nickname: 'dugout-nickname',
  dark: 'dugout-dark',
  notes: 'dugout-notes'
};

const BASE_POSITIONS = {
  home: { x: 50, y: 76 },
  first: { x: 72, y: 58 },
  second: { x: 50, y: 34 },
  third: { x: 28, y: 58 }
};

const state = {
  selectedTeam: localStorage.getItem(STORAGE_KEYS.team) || '',
  nickname: localStorage.getItem(STORAGE_KEYS.nickname) || '',
  ruleId: RULES[0].id,
  runnerLoop: null
};

const els = {
  floatingModeToggle: document.getElementById('floatingModeToggle'),
  nicknameInput: document.getElementById('nicknameInput'),
  onboardingHint: document.getElementById('onboardingHint'),
  selectedTeamPreview: document.getElementById('selectedTeamPreview'),
  teamGrid: document.getElementById('teamGrid'),
  bottomNav: document.getElementById('bottomNav'),
  homeNickname: document.getElementById('homeNickname'),
  homeTeamLabel: document.getElementById('homeTeamLabel'),
  summaryTeamLabel: document.getElementById('summaryTeamLabel'),
  mypageNickname: document.getElementById('mypageNickname'),
  previewBox: document.getElementById('previewBox'),
  notesList: document.getElementById('notesList'),
  rankMeta: document.getElementById('rankMeta'),
  rankLoading: document.getElementById('rankLoading'),
  rankError: document.getElementById('rankError'),
  standingsTable: document.getElementById('standingsTable'),
  standingsRows: document.getElementById('standingsRows'),
  ruleTabs: document.getElementById('ruleTabs'),
  ruleTitle: document.getElementById('ruleTitle'),
  ruleBadge: document.getElementById('ruleBadge'),
  ruleSummary: document.getElementById('ruleSummary'),
  ruleDetail: document.getElementById('ruleDetail'),
  runnerDot: document.getElementById('runnerDot'),
  ballDot: document.getElementById('ballDot'),
  ballTrail: document.getElementById('ballTrail'),
  landingDot: document.getElementById('landingDot'),
  fieldBoard: document.getElementById('fieldBoard')
};

function hexToRgba(hex, alpha) {
  const c = hex.replace('#', '');
  const n = parseInt(c, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function updateBottomNav(activePage) {
  const shouldHide = activePage === 'onboarding';
  els.bottomNav.classList.toggle('hidden', shouldHide);
  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.nav === activePage);
  });
}

function showPage(id) {
  document.querySelectorAll('.page').forEach((page) => page.classList.remove('active'));
  document.getElementById(`page-${id}`).classList.add('active');
  updateBottomNav(id);
  if (id === 'rank') loadStandings();
  if (id === 'mypage') renderNotes();
  if (id === 'rules') renderRuleStage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getNotes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.notes) || '[]');
  } catch {
    return [];
  }
}

function setNotes(notes) {
  localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes));
}

function renderTeamGrid() {
  els.teamGrid.innerHTML = '';
  Object.entries(TEAM_META).forEach(([key, meta]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `logo-team-tile${state.selectedTeam === key ? ' active' : ''}`;
    button.dataset.team = key;
    button.innerHTML = `
      <div class="logo-team-mark">
        <img src="${meta.logo}" alt="${meta.label} 로고" class="logo-team-image" />
      </div>
      <span class="logo-team-name">${meta.label}</span>
    `;
    button.addEventListener('click', () => selectTeam(key));
    els.teamGrid.appendChild(button);
  });
}

function selectTeam(teamKey) {
  state.selectedTeam = teamKey;
  localStorage.setItem(STORAGE_KEYS.team, teamKey);
  renderTeamGrid();
  applyTeamTheme();
  const moved = maybeAdvanceToHome();
  if (!moved) {
    els.onboardingHint.classList.remove('hidden');
    els.nicknameInput.focus();
  }
}

function applyTeamTheme() {
  const meta = TEAM_META[state.selectedTeam] || TEAM_META.LOTTE;
  document.documentElement.style.setProperty('--accent', meta.color);
  document.documentElement.style.setProperty('--accent-strong', meta.strong);
  document.documentElement.style.setProperty('--accent-soft', hexToRgba(meta.color, 0.14));

  ['homeTeamLogo', 'diaryTeamLogo', 'summaryTeamLogo', 'rankTeamLogo', 'mypageTeamLogo'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.src = meta.logo;
  });

  if (state.selectedTeam) {
    els.selectedTeamPreview.src = meta.logo;
    els.selectedTeamPreview.classList.remove('hidden');
  }

  const nickname = state.nickname || '나';
  els.homeNickname.textContent = nickname;
  els.mypageNickname.textContent = nickname;
  els.homeTeamLabel.textContent = meta.label;
  els.summaryTeamLabel.textContent = meta.label;
}

function maybeAdvanceToHome() {
  const nickname = els.nicknameInput.value.trim();
  if (!nickname || !state.selectedTeam) return false;
  state.nickname = nickname;
  localStorage.setItem(STORAGE_KEYS.nickname, nickname);
  els.onboardingHint.classList.add('hidden');
  applyTeamTheme();
  setTimeout(() => showPage('home'), 80);
  return true;
}

function getActiveWriteMode() {
  return document.querySelector('.seg-btn.active')?.dataset.mode || 'template';
}

function value(id) {
  return (document.getElementById(id)?.value || '').trim();
}

function buildTemplatePreview() {
  const summary = value('f_summary');
  const emotion = value('f_emotion');
  const good = value('f_good');
  const bad = value('f_bad');
  const next = value('f_next');
  const parts = [];
  if (summary) parts.push(`오늘 경기는 ${summary}.`);
  if (emotion) parts.push(`전체적으로는 ${emotion}이 크게 남았다.`);
  if (good) parts.push(`좋았던 장면은 ${good}.`);
  if (bad) parts.push(`아쉬웠던 장면은 ${bad}.`);
  if (next) parts.push(`다음 경기에서는 ${next}를 보고 싶다.`);
  return parts.join(' ');
}

function currentRawText() {
  return getActiveWriteMode() === 'template' ? buildTemplatePreview() : value('freeText');
}

function softenText(text) {
  if (!text.trim()) return '먼저 내용을 적어줘.';
  return text
    .replace(/씨발|시발|ㅅㅂ|씹팔|씹발/gi, '아쉽다')
    .replace(/존나|존내|ㅈㄴ/gi, '정말')
    .replace(/개같/gi, '많이 힘들')
    .replace(/빡치/gi, '답답했')
    .replace(/짜증나/gi, '아쉬웠')
    .replace(/병신|븅신/gi, '아쉬운 플레이')
    .replace(/개못하/gi, '조금 아쉬웠')
    .replace(/미쳤다/gi, '강렬했다')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function resetDiary() {
  ['f_summary', 'f_emotion', 'f_good', 'f_bad', 'f_next', 'freeText'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'SELECT') el.selectedIndex = 0;
    else el.value = '';
  });
  els.previewBox.textContent = '여기에 정리된 기록이 보여.';
}

function saveCurrentNote() {
  const text = els.previewBox.textContent.trim() === '여기에 정리된 기록이 보여.' ? currentRawText() : els.previewBox.textContent.trim();
  if (!text) {
    els.previewBox.textContent = '먼저 기록을 적어줘.';
    return;
  }
  const notes = getNotes();
  notes.unshift({
    id: Date.now(),
    team: state.selectedTeam || 'LOTTE',
    nickname: state.nickname || '나',
    createdAt: new Date().toLocaleString('ko-KR'),
    text
  });
  setNotes(notes);
  renderNotes();
  showPage('mypage');
}

function renderNotes() {
  const notes = getNotes();
  if (!notes.length) {
    els.notesList.className = 'notes-list empty-state';
    els.notesList.textContent = '아직 저장한 기록이 없어.';
    return;
  }

  els.notesList.className = 'notes-list';
  els.notesList.innerHTML = notes.map((note) => `
    <article class="note-card">
      <div class="note-head">
        <div>
          <strong>${TEAM_META[note.team]?.label || '나의 팀'}</strong>
          <p class="note-meta">${note.nickname} · ${note.createdAt}</p>
        </div>
        <button class="text-btn danger note-delete" data-id="${note.id}" type="button">삭제</button>
      </div>
      <p class="note-body">${note.text}</p>
    </article>
  `).join('');

  document.querySelectorAll('.note-delete').forEach((btn) => {
    btn.addEventListener('click', () => {
      const filtered = getNotes().filter((note) => String(note.id) !== btn.dataset.id);
      setNotes(filtered);
      renderNotes();
    });
  });
}

function renderStandingsRows(rows) {
  const myTeam = TEAM_META[state.selectedTeam]?.kbo;
  els.standingsRows.innerHTML = rows.map((row) => {
    const isMine = row.team === myTeam;
    return `
      <div class="rank-row${isMine ? ' mine' : ''}">
        <span>${row.rank}</span>
        <span>${row.team}</span>
        <span>${row.win}</span>
        <span>${row.lose}</span>
        <span>${row.draw ?? '-'}</span>
        <span>${row.pct}</span>
        <span>${row.gb}</span>
      </div>
    `;
  }).join('');
}

async function loadStandings() {
  els.rankLoading.classList.remove('hidden');
  els.rankError.classList.add('hidden');
  els.standingsTable.classList.add('hidden');
  els.rankMeta.textContent = '공식 순위표를 불러오는 중이야.';

  try {
    const response = await fetch(`/api/kbo-standings?t=${Date.now()}`, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '순위표 응답 실패');
    if (!Array.isArray(data.rows) || !data.rows.length) throw new Error('순위표 데이터 없음');

    renderStandingsRows(data.rows);
    els.rankMeta.textContent = `${data.date || ''} ${data.subtitle || '공식 KBO 일자별 팀 순위'}`.trim();
    els.rankLoading.classList.add('hidden');
    els.standingsTable.classList.remove('hidden');
  } catch (error) {
    console.error(error);
    els.rankLoading.classList.add('hidden');
    els.rankError.classList.remove('hidden');
    els.rankMeta.textContent = '순위표 연동에 실패했어. api/kbo-standings.js 와 vercel.json 이 같이 배포됐는지 확인해줘.';
  }
}

function renderRuleTabs() {
  els.ruleTabs.innerHTML = RULES.map((rule) => `
    <button class="rule-tab${state.ruleId === rule.id ? ' active' : ''}" data-rule="${rule.id}" type="button">${rule.title}</button>
  `).join('');

  els.ruleTabs.querySelectorAll('.rule-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.ruleId = btn.dataset.rule;
      renderRuleTabs();
      renderRuleStage();
    });
  });
}

function restartAnimation(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

function resetField() {
  if (state.runnerLoop) clearInterval(state.runnerLoop);
  state.runnerLoop = null;
  [els.runnerDot, els.ballDot, els.ballTrail, els.landingDot].forEach((el) => {
    el.classList.add('hidden');
    el.classList.remove('animate-ball');
    el.style.left = '50%';
    el.style.top = '76%';
    el.style.setProperty('--x', '50%');
    el.style.setProperty('--y', '76%');
  });
}

function animateRunnerPath(pathNames) {
  const points = pathNames.map((name) => BASE_POSITIONS[name]);
  let segment = 0;
  let step = 0;
  const stepsPerSegment = 45;

  const placeRunner = (x, y) => {
    els.runnerDot.style.left = `${x}%`;
    els.runnerDot.style.top = `${y}%`;
  };

  placeRunner(points[0].x, points[0].y);
  state.runnerLoop = setInterval(() => {
    const start = points[segment];
    const end = points[segment + 1];
    if (!end) {
      segment = 0;
      step = 0;
      placeRunner(points[0].x, points[0].y);
      return;
    }
    step += 1;
    const t = step / stepsPerSegment;
    const x = start.x + ((end.x - start.x) * t);
    const y = start.y + ((end.y - start.y) * t);
    placeRunner(x, y);
    if (step >= stepsPerSegment) {
      segment += 1;
      step = 0;
      if (segment >= points.length - 1) {
        setTimeout(() => {
          segment = 0;
          step = 0;
          placeRunner(points[0].x, points[0].y);
        }, 280);
      }
    }
  }, 26);
}

function renderRuleStage() {
  const rule = RULES.find((item) => item.id === state.ruleId) || RULES[0];
  els.ruleTitle.textContent = rule.title;
  els.ruleBadge.textContent = rule.badge;
  els.ruleSummary.textContent = rule.summary;
  els.ruleDetail.textContent = rule.detail;
  resetField();

  if (rule.type === 'ball') {
    els.ballDot.classList.remove('hidden');
    els.ballTrail.classList.remove('hidden');
    els.landingDot.classList.remove('hidden');
    els.ballDot.style.setProperty('--x', `${rule.x}%`);
    els.ballDot.style.setProperty('--y', `${rule.y}%`);
    els.landingDot.style.left = `${rule.x}%`;
    els.landingDot.style.top = `${rule.y}%`;
    const fieldRect = els.fieldBoard.getBoundingClientRect();
    const startX = fieldRect.width * 0.5;
    const startY = fieldRect.height * 0.76;
    const endX = fieldRect.width * (rule.x / 100);
    const endY = fieldRect.height * (rule.y / 100);
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt((dx * dx) + (dy * dy));
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    els.ballTrail.style.width = `${distance}px`;
    els.ballTrail.style.transform = `translate(0, 0) rotate(${angle}deg)`;
    restartAnimation(els.ballDot, 'animate-ball');
    restartAnimation(els.ballTrail, 'animate-ball');
  }

  if (rule.type === 'run') {
    els.runnerDot.classList.remove('hidden');
    animateRunnerPath(rule.path);
  }
}

function bindEvents() {
  els.nicknameInput.addEventListener('input', (e) => {
    state.nickname = e.target.value.trim();
    localStorage.setItem(STORAGE_KEYS.nickname, state.nickname);
    if (state.nickname) els.onboardingHint.classList.add('hidden');
    applyTeamTheme();
  });
  els.nicknameInput.addEventListener('change', maybeAdvanceToHome);
  els.nicknameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') maybeAdvanceToHome();
  });

  document.getElementById('changeTeamBtn').addEventListener('click', () => showPage('onboarding'));
  document.getElementById('goDiary').addEventListener('click', () => showPage('diary'));
  document.getElementById('goRank').addEventListener('click', () => showPage('rank'));
  document.getElementById('goRules').addEventListener('click', () => showPage('rules'));
  document.getElementById('goMyPage').addEventListener('click', () => showPage('mypage'));
  document.getElementById('reloadStandings').addEventListener('click', loadStandings);

  document.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => showPage(btn.dataset.nav));
  });

  document.querySelectorAll('.seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.seg-btn').forEach((item) => item.classList.remove('active'));
      btn.classList.add('active');
      const isTemplate = btn.dataset.mode === 'template';
      document.getElementById('templateForm').classList.toggle('hidden', !isTemplate);
      document.getElementById('freeForm').classList.toggle('hidden', isTemplate);
    });
  });

  document.getElementById('makePreview').addEventListener('click', () => {
    const text = currentRawText();
    els.previewBox.textContent = text || '먼저 기록을 적어줘.';
  });

  document.getElementById('softenBtn').addEventListener('click', () => {
    els.previewBox.textContent = softenText(currentRawText());
  });

  document.getElementById('clearDiary').addEventListener('click', resetDiary);
  document.getElementById('saveDiary').addEventListener('click', saveCurrentNote);
  document.getElementById('clearAllNotes').addEventListener('click', () => {
    setNotes([]);
    renderNotes();
  });

  els.floatingModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    els.floatingModeToggle.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem(STORAGE_KEYS.dark, isDark ? '1' : '0');
  });

  window.addEventListener('resize', () => {
    if (document.getElementById('page-rules').classList.contains('active')) renderRuleStage();
  });
}

function init() {
  renderTeamGrid();
  renderRuleTabs();
  bindEvents();
  els.nicknameInput.value = state.nickname;

  if (localStorage.getItem(STORAGE_KEYS.dark) === '1') {
    document.body.classList.add('dark');
    els.floatingModeToggle.textContent = '☀️';
  }

  if (!state.selectedTeam) state.selectedTeam = 'LOTTE';
  applyTeamTheme();
  renderNotes();
  updateBottomNav('onboarding');
  renderRuleStage();

  if (state.nickname && localStorage.getItem(STORAGE_KEYS.team)) {
    showPage('home');
  }
}

init();
