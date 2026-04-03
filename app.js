const TEAM_META = {
  KT: { label: "KT 위즈", color: "#111111", strong: "#000000", logo: "logos/kt.png" },
  SSG: { label: "SSG 랜더스", color: "#CE0E2D", strong: "#96091F", logo: "logos/ssg.png" },
  NC: { label: "NC 다이노스", color: "#315288", strong: "#223A61", logo: "logos/nc.png" },
  HANWHA: { label: "한화 이글스", color: "#F37321", strong: "#C85A13", logo: "logos/hanwha.png" },
  LOTTE: { label: "롯데 자이언츠", color: "#041E42", strong: "#091F43", logo: "logos/lotte.png" },
  SAMSUNG: { label: "삼성 라이온즈", color: "#0066B3", strong: "#004C86", logo: "logos/samsung.png" },
  DOOSAN: { label: "두산 베어스", color: "#131230", strong: "#0B0A1D", logo: "logos/doosan.png" },
  LG: { label: "LG 트윈스", color: "#C30452", strong: "#91033E", logo: "logos/lg.png" },
  KIA: { label: "KIA 타이거즈", color: "#EA0029", strong: "#B90024", logo: "logos/kia.png" },
  KIWOOM: { label: "키움 히어로즈", color: "#570514", strong: "#3B030E", logo: "logos/kiwoom.png" }
};

const STORAGE_KEYS = {
  team: 'dugout-team',
  nickname: 'dugout-nickname',
  dark: 'dugout-dark',
  notes: 'dugout-notes'
};

const state = {
  selectedTeam: localStorage.getItem(STORAGE_KEYS.team) || '',
  nickname: localStorage.getItem(STORAGE_KEYS.nickname) || ''
};

const els = {
  floatingModeToggle: document.getElementById('floatingModeToggle'),
  nicknameInput: document.getElementById('nicknameInput'),
  selectedTeamPreview: document.getElementById('selectedTeamPreview'),
  teamGrid: document.getElementById('teamGrid'),
  bottomNav: document.getElementById('bottomNav'),
  hubNickname: document.getElementById('hubNickname'),
  hubNicknameInline: document.getElementById('hubNicknameInline'),
  hubTeamLabel: document.getElementById('hubTeamLabel'),
  summaryTeamLabel: document.getElementById('summaryTeamLabel'),
  rankTeamLabel: document.getElementById('rankTeamLabel'),
  rankHighlightName: document.getElementById('rankHighlightName'),
  mypageNickname: document.getElementById('mypageNickname'),
  previewBox: document.getElementById('previewBox'),
  notesList: document.getElementById('notesList')
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
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.nav === activePage);
  });
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById(`page-${id}`).classList.add('active');
  updateBottomNav(id);
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
  applyTeamTheme();
  renderTeamGrid();
  maybeAdvanceToHub();
}

function applyTeamTheme() {
  const meta = TEAM_META[state.selectedTeam] || TEAM_META.LOTTE;
  document.documentElement.style.setProperty('--accent', meta.color);
  document.documentElement.style.setProperty('--accent-strong', meta.strong);
  document.documentElement.style.setProperty('--accent-soft', hexToRgba(meta.color, 0.14));

  ['hubTeamLogo', 'diaryTeamLogo', 'summaryTeamLogo', 'rankTeamLogo', 'mypageTeamLogo'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.src = meta.logo;
  });

  if (state.selectedTeam) {
    els.selectedTeamPreview.src = meta.logo;
    els.selectedTeamPreview.classList.remove('hidden');
  }

  const nickname = state.nickname || '나';
  els.hubNickname.textContent = nickname;
  els.hubNicknameInline.textContent = nickname;
  els.mypageNickname.textContent = nickname;
  els.hubTeamLabel.textContent = meta.label;
  els.summaryTeamLabel.textContent = meta.label;
  els.rankTeamLabel.textContent = meta.label;
  els.rankHighlightName.textContent = meta.label;
}

function maybeAdvanceToHub() {
  const nickname = els.nicknameInput.value.trim();
  if (!nickname || !state.selectedTeam) return;
  state.nickname = nickname;
  localStorage.setItem(STORAGE_KEYS.nickname, nickname);
  applyTeamTheme();
  showPage('hub');
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
  ['f_summary', 'f_emotion', 'f_good', 'f_bad', 'f_next', 'freeText'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === 'SELECT') el.selectedIndex = 0;
    else el.value = '';
  });
  els.previewBox.textContent = '여기에 정리된 기록이 보여.';
}

function saveCurrentNote() {
  const placeholder = '여기에 정리된 기록이 보여.';
  const text = els.previewBox.textContent.trim() === placeholder ? currentRawText() : els.previewBox.textContent.trim();
  if (!text) {
    els.previewBox.textContent = '저장하려면 먼저 기록을 적어줘.';
    return;
  }
  const notes = getNotes();
  notes.unshift({
    id: Date.now(),
    nickname: state.nickname || '나',
    team: state.selectedTeam,
    teamLabel: TEAM_META[state.selectedTeam]?.label || '',
    text,
    createdAt: new Date().toLocaleString('ko-KR')
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
  els.notesList.innerHTML = notes.map(note => `
    <article class="note-card">
      <div class="note-head">
        <div>
          <strong>${note.teamLabel || '응원팀'}</strong>
          <p class="note-meta">${note.createdAt}</p>
        </div>
        <button class="text-btn danger note-delete" data-id="${note.id}" type="button">삭제</button>
      </div>
      <p class="note-body">${note.text}</p>
    </article>
  `).join('');

  document.querySelectorAll('.note-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const filtered = getNotes().filter(note => String(note.id) !== btn.dataset.id);
      setNotes(filtered);
      renderNotes();
    });
  });
}

function bindEvents() {
  els.nicknameInput.addEventListener('input', e => {
    state.nickname = e.target.value.trim();
    localStorage.setItem(STORAGE_KEYS.nickname, state.nickname);
    applyTeamTheme();
  });
  els.nicknameInput.addEventListener('change', maybeAdvanceToHub);

  document.getElementById('goDiary').addEventListener('click', () => showPage('diary'));
  document.getElementById('goRank').addEventListener('click', () => showPage('rank'));
  document.getElementById('goRules').addEventListener('click', () => showPage('rules'));
  document.getElementById('goMyPage').addEventListener('click', () => {
    renderNotes();
    showPage('mypage');
  });

  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.nav;
      if (page === 'mypage') renderNotes();
      showPage(page);
    });
  });

  document.querySelectorAll('.seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.seg-btn').forEach(item => item.classList.remove('active'));
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
}

function init() {
  renderTeamGrid();
  bindEvents();
  els.nicknameInput.value = state.nickname;

  if (localStorage.getItem(STORAGE_KEYS.dark) === '1') {
    document.body.classList.add('dark');
    els.floatingModeToggle.textContent = '☀️';
  }

  if (!state.selectedTeam) state.selectedTeam = 'LOTTE';
  applyTeamTheme();
  renderNotes();

  if (localStorage.getItem(STORAGE_KEYS.nickname) && localStorage.getItem(STORAGE_KEYS.team)) {
    showPage('hub');
  } else {
    showPage('onboarding');
  }
}

init();
