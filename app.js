const TEAM_OPTIONS = [
  { value: '롯데', label: '롯데 자이언츠', color: '#0E2E63' },
  { value: '두산', label: '두산 베어스', color: '#131230' },
  { value: 'LG', label: 'LG 트윈스', color: '#C30452' },
  { value: 'KIA', label: 'KIA 타이거즈', color: '#EA0029' },
  { value: '삼성', label: '삼성 라이온즈', color: '#005BAC' },
  { value: '한화', label: '한화 이글스', color: '#F37321' },
  { value: 'SSG', label: 'SSG 랜더스', color: '#CE0E2D' },
  { value: 'NC', label: 'NC 다이노스', color: '#315288' },
  { value: 'KT', label: 'KT 위즈', color: '#111111' },
  { value: '키움', label: '키움 히어로즈', color: '#570514' },
];

const teamSelect = document.getElementById('teamSelect');
const refreshBtn = document.getElementById('refreshBtn');
const myStandingCard = document.getElementById('myStandingCard');
const standingsTable = document.getElementById('standingsTable');
const updatedAt = document.getElementById('updatedAt');
const entryTitle = document.getElementById('entryTitle');
const entryText = document.getElementById('entryText');
const previewBox = document.getElementById('previewBox');
const softenBtn = document.getElementById('softenBtn');
const previewBtn = document.getElementById('previewBtn');

const todayGameCard = document.getElementById('todayGameCard');
const todayUpdatedAt = document.getElementById('todayUpdatedAt');

function renderTodayGame(game) {
  if (!game) {
    todayGameCard.className = 'today-game empty';
    todayGameCard.innerHTML = '오늘은 마이팀 경기 일정이 확인되지 않았어.';
    return;
  }
  const isHome = game.homeKo === currentTeam();
  const opponent = isHome ? game.awayKo : game.homeKo;
  const scoreText = (game.scoreAway == null || game.scoreHome == null)
    ? `${game.time} 예정`
    : `${game.awayKo} ${game.scoreAway} : ${game.scoreHome} ${game.homeKo}`;
  const resultText = (game.scoreAway == null || game.scoreHome == null)
    ? '프리뷰'
    : ((isHome ? game.scoreHome > game.scoreAway : game.scoreAway > game.scoreHome) ? '승리' : '패배');
  todayGameCard.className = 'today-game';
  todayGameCard.innerHTML = `
    <div class="today-top">
      <div>
        <div class="today-badge">${game.status}</div>
        <div class="today-opponent">vs ${opponent}</div>
      </div>
      <div class="today-result ${resultText === '승리' ? 'win' : resultText === '패배' ? 'lose' : ''}">${resultText}</div>
    </div>
    <div class="today-score">${scoreText}</div>
    <div class="today-meta">
      <div class="meta-box light"><div class="meta-label">구장</div><div class="meta-value">${game.venue || '-'}</div></div>
      <div class="meta-box light"><div class="meta-label">시간</div><div class="meta-value">${game.time || '-'}</div></div>
      <div class="meta-box light"><div class="meta-label">홈/원정</div><div class="meta-value">${isHome ? '홈' : '원정'}</div></div>
    </div>
  `;
}

async function loadTodayGame() {
  todayGameCard.className = 'today-game empty';
  todayGameCard.textContent = '오늘 경기 불러오는 중...';
  try {
    const team = currentTeam();
    const res = await fetch(`/api/today-game?team=${encodeURIComponent(team)}`);
    const data = await res.json();
    renderTodayGame(data.myTodayGame);
    todayUpdatedAt.textContent = data.fetchedAt ? new Date(data.fetchedAt).toLocaleString('ko-KR') : '';
    if (!data.myTodayGame && data.debug) console.warn('today debug', data.debug);
  } catch (error) {
    todayGameCard.className = 'today-game empty';
    todayGameCard.textContent = '오늘 경기 정보를 불러오는 중 오류가 났어.';
  }
}


function currentTeam() {
  return localStorage.getItem('dugout-my-team') || '롯데';
}

function applyTheme(team) {
  const meta = TEAM_OPTIONS.find((item) => item.value === team) || TEAM_OPTIONS[0];
  document.documentElement.style.setProperty('--team', meta.color);
  document.documentElement.style.setProperty('--team-soft', `${meta.color}1a`);
}

function populateTeams() {
  teamSelect.innerHTML = TEAM_OPTIONS.map((item) => `<option value="${item.value}">${item.label}</option>`).join('');
  teamSelect.value = currentTeam();
  applyTheme(teamSelect.value);
}

function renderMyStanding(row) {
  if (!row) {
    myStandingCard.className = 'my-standing empty';
    myStandingCard.innerHTML = '아직 순위를 불러오지 못했어. 아래 전체 순위가 비어 있으면 API 응답을 같이 확인해줘.';
    return;
  }
  myStandingCard.className = 'my-standing';
  myStandingCard.innerHTML = `
    <div class="my-standing-top">
      <div>
        <div class="rank-badge">${row.rank}위</div>
        <div class="team-name">${row.team}</div>
      </div>
      <div>${row.streak}</div>
    </div>
    <div class="standing-meta">
      <div class="meta-box"><div class="meta-label">승패</div><div class="meta-value">${row.wins}승 ${row.losses}패 ${row.draws}무</div></div>
      <div class="meta-box"><div class="meta-label">승률</div><div class="meta-value">${row.pct}</div></div>
      <div class="meta-box"><div class="meta-label">게임차</div><div class="meta-value">${row.gb}</div></div>
      <div class="meta-box"><div class="meta-label">최근 10</div><div class="meta-value">${row.last10}</div></div>
    </div>
  `;
}

function renderStandings(rows) {
  if (!rows || !rows.length) {
    standingsTable.innerHTML = '<div class="standing-row"><div class="row-team">순위 데이터를 아직 불러오지 못했어.</div></div>';
    return;
  }
  standingsTable.innerHTML = rows.map((row) => `
    <div class="standing-row">
      <div class="row-rank">${row.rank}</div>
      <div class="row-team">${row.team}</div>
      <div class="row-record">${row.wins}-${row.losses}-${row.draws}</div>
      <div class="row-pct">${row.pct}</div>
    </div>
  `).join('');
}

async function loadStandings() {
  myStandingCard.className = 'my-standing empty';
  myStandingCard.textContent = '순위를 불러오는 중...';
  standingsTable.innerHTML = '';
  try {
    const team = currentTeam();
    const res = await fetch(`/api/standings?team=${encodeURIComponent(team)}`);
    const data = await res.json();
    renderMyStanding(data.myStanding);
    renderStandings(data.standings || []);
    updatedAt.textContent = data.fetchedAt ? new Date(data.fetchedAt).toLocaleString('ko-KR') : '';
    if (!data.myStanding && data.debug) {
      console.warn('standings debug', data.debug);
    }
  } catch (error) {
    renderMyStanding(null);
    standingsTable.innerHTML = '<div class="standing-row"><div class="row-team">불러오는 중 오류가 났어.</div></div>';
    console.error(error);
  }
}

function makePreviewText() {
  const title = entryTitle.value.trim();
  const body = entryText.value.trim();
  if (!title && !body) {
    previewBox.textContent = '제목이나 기록을 먼저 적어줘.';
    return;
  }
  const parts = [];
  if (title) parts.push(`오늘 기록의 제목은 '${title}'였다.`);
  if (body) parts.push(body);
  previewBox.textContent = parts.join(' ');
}

async function softenText() {
  const text = entryText.value.trim();
  if (!text) {
    previewBox.textContent = '먼저 기록을 써줘.';
    return;
  }
  softenBtn.disabled = true;
  softenBtn.textContent = '순화 중...';
  try {
    const res = await fetch('/api/soften', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    previewBox.textContent = data.softened || text;
  } catch (error) {
    previewBox.textContent = '순화 중 오류가 났어. 잠시 후 다시 시도해줘.';
  } finally {
    softenBtn.disabled = false;
    softenBtn.textContent = 'GPT로 순화하기';
  }
}

teamSelect.addEventListener('change', () => {
  localStorage.setItem('dugout-my-team', teamSelect.value);
  applyTheme(teamSelect.value);
  loadStandings();
loadTodayGame();
  loadTodayGame();
});
refreshBtn.addEventListener('click', () => { loadStandings(); loadTodayGame(); });
previewBtn.addEventListener('click', makePreviewText);
softenBtn.addEventListener('click', softenText);

populateTeams();
loadStandings();
loadTodayGame();
