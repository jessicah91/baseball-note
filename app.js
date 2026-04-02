const TEAMS = [
  { code: 'KT', name: 'KT 위즈', color: '#111111', logo: 'assets/logos/kt.png' },
  { code: 'SSG', name: 'SSG 랜더스', color: '#CE0E2D', logo: 'assets/logos/ssg.png' },
  { code: 'NC', name: 'NC 다이노스', color: '#315288', logo: 'assets/logos/nc.png' },
  { code: 'HANWHA', name: '한화 이글스', color: '#F37321', logo: 'assets/logos/hanwha.png' },
  { code: 'LOTTE', name: '롯데 자이언츠', color: '#0E2E63', logo: 'assets/logos/lotte.png' },
  { code: 'SAMSUNG', name: '삼성 라이온즈', color: '#0066B3', logo: 'assets/logos/samsung.png' },
  { code: 'DOOSAN', name: '두산 베어스', color: '#131230', logo: 'assets/logos/doosan.png' },
  { code: 'LG', name: 'LG 트윈스', color: '#C30452', logo: 'assets/logos/lg.png' },
  { code: 'KIA', name: 'KIA 타이거즈', color: '#E4002B', logo: 'assets/logos/kia.png' },
  { code: 'KIWOOM', name: '키움 히어로즈', color: '#570514', logo: 'assets/logos/kiwoom.png' }
];

const state = {
  team: localStorage.getItem('dugout-team') || '',
  nickname: localStorage.getItem('dugout-nickname') || '',
  mode: localStorage.getItem('dugout-mode') || 'day',
  range: Number(localStorage.getItem('dugout-range') || '5'),
  standingsOpen: false,
  recentOpen: true,
  diaryOpen: true,
  recentGames: []
};

const $ = (id) => document.getElementById(id);

function currentTeam() {
  return TEAMS.find((team) => team.code === state.team) || TEAMS[0];
}

function setTheme() {
  const team = currentTeam();
  document.body.dataset.mode = state.mode;
  document.documentElement.style.setProperty('--key', team.color);
  document.documentElement.style.setProperty('--key-soft', `${hexToRgba(team.color, 0.14)}`);
  if ($('modeToggle')) $('modeToggle').textContent = state.mode === 'day' ? '나이트 모드' : '데이 모드';
}

function hexToRgba(hex, alpha) {
  const value = hex.replace('#', '');
  const bigint = parseInt(value, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function renderTeamGrid() {
  $('teamGrid').innerHTML = TEAMS.map((team) => `
    <button type="button" class="team-card ${team.code === state.team ? 'is-selected' : ''}" data-team="${team.code}">
      <img src="${team.logo}" alt="${team.name} 로고" class="team-logo" />
      <span>${team.name}</span>
    </button>
  `).join('');

  [...document.querySelectorAll('.team-card')].forEach((button) => {
    button.addEventListener('click', () => chooseTeam(button.dataset.team));
  });
}

function chooseTeam(teamCode) {
  const nickname = $('nicknameInput').value.trim() || state.nickname.trim();
  if (!nickname) {
    $('nicknameInput').focus();
    $('nicknameInput').placeholder = '닉네임을 먼저 입력해줘!';
    return;
  }
  state.nickname = nickname;
  state.team = teamCode;
  localStorage.setItem('dugout-nickname', state.nickname);
  localStorage.setItem('dugout-team', state.team);
  renderTeamGrid();
  showDashboard();
}

function showDashboard() {
  setTheme();
  const team = currentTeam();
  $('onboarding').classList.add('hidden');
  $('dashboard').classList.remove('hidden');
  $('welcomeNick').textContent = state.nickname || '팬';
  $('welcomeTeam').textContent = team.name;
  $('selectedTeamBadge').innerHTML = `<img src="${team.logo}" alt="${team.name} 로고" class="selected-team-logo" /><strong>${team.name}</strong>`;
  Promise.all([loadDashboard(), loadRecentGames()]);
}

function showOnboarding() {
  $('dashboard').classList.add('hidden');
  $('onboarding').classList.remove('hidden');
  $('nicknameInput').value = state.nickname;
  renderTeamGrid();
}

function formatDateLabel(value) {
  const date = new Date(value);
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  return `${date.getMonth() + 1}. ${date.getDate()}. (${weekday})`;
}

function renderTodayGame(game) {
  const target = $('todayGame');
  if (!game) {
    target.innerHTML = `<div class="empty-box">오늘은 ${currentTeam().name} 경기 일정이 확인되지 않아요.</div>`;
    return;
  }
  const isHome = game.homeCode === state.team;
  const myTeam = isHome ? game.homeTeam : game.awayTeam;
  const opponent = isHome ? game.awayTeam : game.homeTeam;
  const scoreText = game.status === 'final' ? `${game.awayScore} : ${game.homeScore}` : game.time;
  const statusText = game.status === 'final' ? '경기 종료' : '예정';
  target.innerHTML = `
    <div class="today-card">
      <div class="calendar-top">
        <span class="calendar-date">${game.date}</span>
        <span class="status-pill">${statusText}</span>
      </div>
      <div class="scoreline">
        <div class="team-pill">${myTeam}</div>
        <div class="score-badge">${scoreText}</div>
        <div class="team-pill">상대 ${opponent}</div>
      </div>
      <div class="sub">${game.venue || ''}</div>
    </div>`;
}

function renderStandings(payload) {
  $('myStanding').innerHTML = payload.myStanding
    ? `<div class="standing-card"><strong>${payload.myStanding.rank}위 · ${currentTeam().name}</strong><div class="sub">${payload.myStanding.wins}승 ${payload.myStanding.losses}패 ${payload.myStanding.draws}무 · 승률 ${payload.myStanding.pct} · 최근10경기 ${payload.myStanding.last10}</div></div>`
    : `<div class="empty-box">마이팀 순위 정보를 아직 가져오지 못했어요.</div>`;

  if (!payload.standings?.length) {
    $('allStandings').innerHTML = `<div class="empty-box">전체 순위 정보를 아직 가져오지 못했어요.</div>`;
    return;
  }

  $('allStandings').innerHTML = `
    <table class="standing-table">
      <thead><tr><th>순위</th><th>팀</th><th>승패</th><th>승률</th><th>최근10</th></tr></thead>
      <tbody>
        ${payload.standings.map((row) => `
          <tr>
            <td>${row.rank}</td>
            <td>${row.teamName}</td>
            <td>${row.wins}-${row.losses}-${row.draws}</td>
            <td>${row.pct}</td>
            <td>${row.last10}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function renderRecentGames(games) {
  state.recentGames = games || [];
  const target = $('recentGames');
  if (!games?.length) {
    target.innerHTML = `<div class="empty-box">최근 경기 기록을 가져오지 못했어요.</div>`;
    $('gameDetail').classList.add('hidden');
    return;
  }
  target.innerHTML = games.map((game, index) => {
    const myIsHome = game.homeCode === state.team;
    const myScore = myIsHome ? game.homeScore : game.awayScore;
    const oppTeam = myIsHome ? game.awayTeam : game.homeTeam;
    const resultClass = game.resultForMyTeam;
    const resultLabel = resultClass === 'win' ? '승' : '패';
    return `
      <button type="button" class="calendar-item" data-index="${index}">
        <div class="calendar-top">
          <span class="calendar-date">${formatDateLabel(game.date)}</span>
          <span class="result-chip ${resultClass}">${resultLabel}</span>
        </div>
        <div class="calendar-match">vs ${oppTeam}</div>
        <div class="sub">${currentTeam().name} ${myScore} · ${game.venue}</div>
      </button>`;
  }).join('');

  [...target.querySelectorAll('[data-index]')].forEach((button) => {
    button.addEventListener('click', async () => {
      const game = state.recentGames[Number(button.dataset.index)];
      await loadGameDetail(game);
    });
  });
}

async function loadGameDetail(game) {
  const detail = $('gameDetail');
  detail.classList.remove('hidden');
  detail.innerHTML = `<div class="empty-box">상세 정보를 불러오는 중...</div>`;
  try {
    const response = await fetch(`/api/game-detail?date=${encodeURIComponent(game.date)}&away=${encodeURIComponent(game.awayCode)}&home=${encodeURIComponent(game.homeCode)}&venue=${encodeURIComponent(game.venue || '')}&awayScore=${encodeURIComponent(game.awayScore ?? '')}&homeScore=${encodeURIComponent(game.homeScore ?? '')}`);
    const data = await response.json();
    detail.innerHTML = `
      <h3>${formatDateLabel(game.date)} ${game.awayTeam} ${game.awayScore} : ${game.homeScore} ${game.homeTeam}</h3>
      <div class="detail-grid">
        <div class="detail-box"><strong>승리투수</strong>${data.winningPitcher || game.winningPitcher || '정보 없음'}</div>
        <div class="detail-box"><strong>패전투수</strong>${data.losingPitcher || game.losingPitcher || '정보 없음'}</div>
        <div class="detail-box"><strong>세이브투수</strong>${data.savePitcher || game.savePitcher || '정보 없음'}</div>
        <div class="detail-box"><strong>홀드투수</strong>${(data.holdPitchers || []).length ? data.holdPitchers.join(', ') : '정보 없음'}</div>
        <div class="detail-box" style="grid-column: 1 / -1;"><strong>결승타</strong>${data.winningHit || '정보 없음'}</div>
      </div>
      ${data.error ? `<p class="sub">${data.error}</p>` : data.note ? `<p class="sub">${data.note}</p>` : ''}`;
  } catch (error) {
    detail.innerHTML = `<div class="empty-box">상세 정보를 아직 가져오지 못했어요.</div>`;
  }
}

async function loadDashboard() {
  renderTodayGame(null);
  $('myStanding').innerHTML = '<div class="empty-box">불러오는 중...</div>';
  $('allStandings').innerHTML = '<div class="empty-box">불러오는 중...</div>';
  try {
    const response = await fetch(`/api/kbo-dashboard?team=${encodeURIComponent(state.team)}`);
    const data = await response.json();
    renderTodayGame(data.myTodayGame);
    renderStandings(data);
  } catch (error) {
    renderTodayGame(null);
    $('myStanding').innerHTML = '<div class="empty-box">대시보드를 불러오지 못했어요.</div>';
    $('allStandings').innerHTML = '<div class="empty-box">순위를 불러오지 못했어요.</div>';
  }
}

async function loadRecentGames() {
  $('recentGames').innerHTML = '불러오는 중...';
  try {
    const response = await fetch(`/api/recent-games?team=${encodeURIComponent(state.team)}&limit=${encodeURIComponent(state.range)}`);
    const data = await response.json();
    renderRecentGames(data.games || []);
  } catch (error) {
    renderRecentGames([]);
  }
}

function wireToggles() {
  $('toggleStandings').addEventListener('click', () => {
    state.standingsOpen = !state.standingsOpen;
    $('allStandings').classList.toggle('hidden', !state.standingsOpen);
    $('toggleStandings').textContent = state.standingsOpen ? '▴' : '▾';
  });
  $('toggleRecent').addEventListener('click', () => {
    state.recentOpen = !state.recentOpen;
    $('recentGamesWrap').classList.toggle('hidden', !state.recentOpen);
    $('toggleRecent').textContent = state.recentOpen ? '▴' : '▾';
  });
  $('toggleDiary').addEventListener('click', () => {
    state.diaryOpen = !state.diaryOpen;
    $('diaryWrap').classList.toggle('hidden', !state.diaryOpen);
    $('toggleDiary').textContent = state.diaryOpen ? '▴' : '▾';
  });
}

function wireInputs() {
  $('nicknameInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') event.preventDefault();
  });
  $('changeTeamBtn').addEventListener('click', () => {
    showOnboarding();
  });
  $('modeToggle').addEventListener('click', () => {
    state.mode = state.mode === 'day' ? 'night' : 'day';
    localStorage.setItem('dugout-mode', state.mode);
    setTheme();
  });
  [...document.querySelectorAll('.range-btn')].forEach((button) => {
    button.addEventListener('click', async () => {
      state.range = Number(button.dataset.range);
      localStorage.setItem('dugout-range', String(state.range));
      document.querySelectorAll('.range-btn').forEach((el) => el.classList.toggle('is-active', Number(el.dataset.range) === state.range));
      await loadRecentGames();
    });
  });
}

async function init() {
  wireToggles();
  wireInputs();
  document.querySelectorAll('.range-btn').forEach((el) => el.classList.toggle('is-active', Number(el.dataset.range) === state.range));
  setTheme();
  if (state.team && state.nickname) {
    $('nicknameInput').value = state.nickname;
    renderTeamGrid();
    showDashboard();
  } else {
    showOnboarding();
  }
}

init();
