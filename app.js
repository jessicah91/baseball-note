const TEAM_META = {
  KT: { label: "KT 위즈", short: "KT", color: "#111111", strong: "#000000", logo: "logos/kt.png", aliases: ["KT", "케이티"] },
  SSG: { label: "SSG 랜더스", short: "SSG", color: "#CE0E2D", strong: "#96091F", logo: "logos/ssg.png", aliases: ["SSG", "랜더스"] },
  NC: { label: "NC 다이노스", short: "NC", color: "#315288", strong: "#223A61", logo: "logos/nc.png", aliases: ["NC", "다이노스"] },
  HANWHA: { label: "한화 이글스", short: "한화", color: "#F37321", strong: "#C85A13", logo: "logos/hanwha.png", aliases: ["한화", "이글스"] },
  LOTTE: { label: "롯데 자이언츠", short: "롯데", color: "#0E2E63", strong: "#091F43", logo: "logos/lotte.png", aliases: ["롯데", "자이언츠"] },
  SAMSUNG: { label: "삼성 라이온즈", short: "삼성", color: "#0066B3", strong: "#004C86", logo: "logos/samsung.png", aliases: ["삼성", "라이온즈"] },
  DOOSAN: { label: "두산 베어스", short: "두산", color: "#131230", strong: "#0B0A1D", logo: "logos/doosan.png", aliases: ["두산", "베어스"] },
  LG: { label: "LG 트윈스", short: "LG", color: "#C30452", strong: "#91033E", logo: "logos/lg.png", aliases: ["LG", "트윈스"] },
  KIA: { label: "KIA 타이거즈", short: "KIA", color: "#EA0029", strong: "#B90024", logo: "logos/kia.png", aliases: ["KIA", "기아", "타이거즈"] },
  KIWOOM: { label: "키움 히어로즈", short: "키움", color: "#570514", strong: "#3B030E", logo: "logos/kiwoom.png", aliases: ["키움", "히어로즈"] }
};

const nicknameInput = document.getElementById("nicknameInput");
const teamGrid = document.getElementById("teamGrid");
const startHelper = document.getElementById("startHelper");
const themeToggle = document.getElementById("themeToggle");
const pageEls = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav-btn");
const scheduleStatus = document.getElementById("scheduleStatus");
const scheduleList = document.getElementById("scheduleList");
const scheduleMonthLabel = document.getElementById("scheduleMonthLabel");

const logoTargets = [
  document.getElementById("homeTeamLogo"),
  document.getElementById("hubTeamLogo"),
  document.getElementById("diaryTeamLogo"),
  document.getElementById("scheduleTeamLogo"),
  document.getElementById("summaryLogo"),
  document.getElementById("mypageLogo")
].filter(Boolean);

const summaryTeamName = document.getElementById("summaryTeamName");
const scheduleTeamName = document.getElementById("scheduleTeamName");
const hubNickname = document.getElementById("hubNickname");
const welcomeNickname = document.getElementById("welcomeNickname");
const mypageNickname = document.getElementById("mypageNickname");
const welcomeTeamName = document.getElementById("welcomeTeamName");

let lastScheduleLoadedForTeam = null;

function hexToRgba(hex, alpha) {
  const c = hex.replace("#", "");
  const n = parseInt(c, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function setLogo(el, src, alt) {
  if (!el) return;
  el.classList.remove("empty");
  el.innerHTML = `<img src="${src}" alt="${alt}" />`;
}

function renderTeamChoices() {
  teamGrid.innerHTML = "";
  Object.entries(TEAM_META).forEach(([key, meta]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "team-choice";
    button.dataset.team = key;
    button.innerHTML = `
      <img class="logo-thumb" src="${meta.logo}" alt="${meta.label}" />
      <span>${meta.short}</span>
    `;
    button.addEventListener("click", () => selectTeam(key));
    teamGrid.appendChild(button);
  });
}

function updateSelectedTeamButton(teamKey) {
  document.querySelectorAll(".team-choice").forEach(btn => {
    btn.classList.toggle("selected", btn.dataset.team === teamKey);
  });
}

function applyTeam(teamKey) {
  const meta = TEAM_META[teamKey] || TEAM_META.LOTTE;
  document.documentElement.style.setProperty("--accent", meta.color);
  document.documentElement.style.setProperty("--accent-strong", meta.strong);
  document.documentElement.style.setProperty("--accent-soft", hexToRgba(meta.color, 0.12));
  logoTargets.forEach(el => setLogo(el, meta.logo, meta.label));
  if (summaryTeamName) summaryTeamName.textContent = meta.label;
  if (scheduleTeamName) scheduleTeamName.textContent = meta.label;
  if (welcomeTeamName) welcomeTeamName.textContent = meta.label;
  localStorage.setItem("dugout-team", teamKey);
  updateSelectedTeamButton(teamKey);
  lastScheduleLoadedForTeam = null;
}

function applyNickname(name) {
  const nickname = (name || "팬").trim() || "팬";
  [hubNickname, welcomeNickname, mypageNickname].forEach(el => {
    if (el) el.textContent = nickname;
  });
  localStorage.setItem("dugout-nickname", nickname);
}

function showPage(id) {
  pageEls.forEach(p => p.classList.remove("active"));
  document.getElementById(`page-${id}`)?.classList.add("active");
  navButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.go === id));
  if (id === "schedule") loadSchedule();
  if (id === "mypage") renderSavedNotes();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function maybeAdvanceFromStart() {
  const nickname = nicknameInput.value.trim();
  const teamKey = localStorage.getItem("dugout-team");
  if (nickname && teamKey) {
    applyNickname(nickname);
    startHelper.classList.add("hidden");
    showPage("hub");
  }
}

function selectTeam(teamKey) {
  applyTeam(teamKey);
  if (!nicknameInput.value.trim()) {
    startHelper.classList.remove("hidden");
    nicknameInput.focus();
    return;
  }
  maybeAdvanceFromStart();
}

function value(id) {
  const el = document.getElementById(id);
  return (el?.value || "").trim();
}

function getActiveWriteMode() {
  return document.querySelector(".seg-btn.active")?.dataset.mode || "template";
}

function buildTemplatePreview() {
  const summary = value("f_summary");
  const emotion = value("f_emotion");
  const good = value("f_good");
  const bad = value("f_bad");
  const next = value("f_next");

  const parts = [];
  if (summary) parts.push(`오늘 경기는 ${summary}.`);
  if (emotion) parts.push(`전체적으로는 ${emotion}이 가장 크게 남았다.`);
  if (good) parts.push(`좋았던 장면은 ${good}.`);
  if (bad) parts.push(`아쉬웠던 부분은 ${bad}.`);
  if (next) parts.push(`다음 경기에서는 ${next}를 보고 싶다.`);
  return parts.join(" ");
}

function softenText(text) {
  if (!text.trim()) return "먼저 내용을 적어줘.";
  return text
    .replace(/씨발|시발|ㅅㅂ|씹팔|씹발/gi, "아쉽다")
    .replace(/존나|존내|ㅈㄴ/gi, "정말")
    .replace(/개같/gi, "많이 힘들")
    .replace(/빡치/gi, "답답했")
    .replace(/짜증나/gi, "아쉬웠")
    .replace(/병신|븅신/gi, "아쉬운 플레이")
    .replace(/개못하/gi, "조금 아쉬웠")
    .replace(/미쳤다/gi, "강렬했다")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function currentRawText() {
  if (getActiveWriteMode() === "template") return buildTemplatePreview();
  return value("freeText");
}

function getSavedNotes() {
  try {
    return JSON.parse(localStorage.getItem("dugout-notes") || "[]");
  } catch {
    return [];
  }
}

function saveNotes(notes) {
  localStorage.setItem("dugout-notes", JSON.stringify(notes));
}

function renderSavedNotes() {
  const container = document.getElementById("savedNotesList");
  if (!container) return;
  const notes = getSavedNotes();
  if (!notes.length) {
    container.className = "saved-notes empty-state";
    container.textContent = "아직 저장된 기록이 없어. 먼저 덕아웃 노트를 작성해봐.";
    return;
  }

  container.className = "saved-notes";
  container.innerHTML = notes.map((note, index) => `
    <article class="saved-note">
      <div class="saved-note-head">
        <strong>${note.teamLabel}</strong>
        <div class="saved-meta">${note.nickname} · ${note.date}</div>
      </div>
      <p>${note.text}</p>
      <div class="saved-note-head">
        <span class="saved-meta">${note.mode === "template" ? "템플릿" : "자유양식"}</span>
        <button class="text-btn" type="button" onclick="deleteSavedNote(${index})">삭제</button>
      </div>
    </article>
  `).join("");
}

window.deleteSavedNote = function(index) {
  const notes = getSavedNotes();
  notes.splice(index, 1);
  saveNotes(notes);
  renderSavedNotes();
};

function saveCurrentDiary() {
  const text = document.getElementById("previewBox").textContent.trim();
  if (!text || text === "여기에 정리된 기록이 보여." || text === "먼저 기록을 적어줘.") {
    alert("먼저 기록 미리보기를 만들어줘.");
    return;
  }
  const teamKey = localStorage.getItem("dugout-team") || "LOTTE";
  const meta = TEAM_META[teamKey];
  const notes = getSavedNotes();
  notes.unshift({
    nickname: localStorage.getItem("dugout-nickname") || "팬",
    teamKey,
    teamLabel: meta.label,
    text,
    mode: getActiveWriteMode(),
    date: new Date().toLocaleDateString("ko-KR")
  });
  saveNotes(notes);
  renderSavedNotes();
  showPage("mypage");
}

function normalizeText(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

function teamMatchesSchedule(teamKey, game) {
  const meta = TEAM_META[teamKey];
  if (!meta || !game) return false;
  const haystack = `${game.awayTeam || ""} ${game.homeTeam || ""} ${game.matchup || ""}`.toUpperCase();
  return meta.aliases.some(alias => haystack.includes(alias.toUpperCase()));
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderScheduleGames(games, label) {
  scheduleMonthLabel.textContent = label || "이번 달 일정";

  if (!games.length) {
    scheduleList.innerHTML = `
      <div class="schedule-empty card-lite">
        <strong>표시할 일정이 없어요.</strong>
        <p>이번 달에 선택한 팀 경기 데이터가 없거나, KBO 페이지 구조가 잠시 달라졌을 수 있어.</p>
      </div>
    `;
    return;
  }

  scheduleList.innerHTML = games.map(game => {
    const teamKey = localStorage.getItem("dugout-team");
    const isMyHome = teamMatchesSchedule(teamKey, { awayTeam: "", homeTeam: game.homeTeam, matchup: game.homeTeam });
    const matchup = `${game.awayTeam || "원정"} vs ${game.homeTeam || "홈"}`;
    const status = game.note || game.state || "예정";
    const score = game.score ? `<div class="schedule-score">${escapeHtml(game.score)}</div>` : "";
    return `
      <article class="schedule-item">
        <div class="schedule-item-top">
          <div>
            <p class="schedule-date">${escapeHtml(game.dateLabel || "날짜 미정")}</p>
            <h4>${escapeHtml(matchup)}</h4>
          </div>
          <span class="schedule-badge ${isMyHome ? "home" : "away"}">${isMyHome ? "홈" : "원정"}</span>
        </div>
        <div class="schedule-info-grid">
          <div><span>시간</span><strong>${escapeHtml(game.time || "미정")}</strong></div>
          <div><span>구장</span><strong>${escapeHtml(game.stadium || "미정")}</strong></div>
          <div><span>상태</span><strong>${escapeHtml(status)}</strong></div>
          <div><span>중계</span><strong>${escapeHtml(game.broadcast || "- ")}</strong></div>
        </div>
        ${score}
      </article>
    `;
  }).join("");
}

async function loadSchedule(force = false) {
  const teamKey = localStorage.getItem("dugout-team") || "LOTTE";
  if (!force && lastScheduleLoadedForTeam === teamKey && scheduleList.innerHTML.trim()) return;

  scheduleStatus.textContent = "실제 경기 일정을 불러오는 중...";
  scheduleList.innerHTML = "";

  try {
    const response = await fetch(`/api/kbo-schedule?team=${encodeURIComponent(teamKey)}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!data.ok) throw new Error(data.error || "schedule_fetch_failed");

    const games = Array.isArray(data.games) ? data.games : [];
    scheduleStatus.textContent = `${data.teamLabel || TEAM_META[teamKey].label} 기준 ${games.length}경기 불러왔어.`;
    renderScheduleGames(games, data.monthLabel || "이번 달 일정");
    lastScheduleLoadedForTeam = teamKey;
  } catch (error) {
    console.error(error);
    scheduleStatus.textContent = "일정을 가져오지 못했어. 잠시 후 다시 새로고침해봐.";
    scheduleList.innerHTML = `
      <div class="schedule-empty card-lite">
        <strong>연결 실패</strong>
        <p>KBO 사이트 응답이나 구조가 바뀌면 잠깐 안 될 수 있어. 배포 후 새로고침 버튼으로 다시 시도해줘.</p>
      </div>
    `;
  }
}

document.getElementById("goDiary").addEventListener("click", () => showPage("diary"));
document.getElementById("goSchedule").addEventListener("click", () => showPage("schedule"));
document.getElementById("goRules").addEventListener("click", () => showPage("rules"));
document.querySelectorAll("[data-go]").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.go;
    if (target !== "home" && !localStorage.getItem("dugout-team")) {
      showPage("home");
      return;
    }
    showPage(target);
  });
});

document.getElementById("refreshSchedule").addEventListener("click", () => loadSchedule(true));

document.getElementById("toggleSummary").addEventListener("click", () => {
  const body = document.getElementById("summaryBody");
  const chevron = document.getElementById("summaryChevron");
  const hidden = body.style.display === "none";
  body.style.display = hidden ? "block" : "none";
  chevron.textContent = hidden ? "▾" : "▸";
});

document.querySelectorAll(".seg-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const mode = btn.dataset.mode;
    document.getElementById("templateForm").classList.toggle("hidden", mode !== "template");
    document.getElementById("freeForm").classList.toggle("hidden", mode !== "free");
  });
});

document.getElementById("makePreview").addEventListener("click", () => {
  const text = currentRawText();
  document.getElementById("previewBox").textContent = text || "먼저 기록을 적어줘.";
});

document.getElementById("softenBtn").addEventListener("click", () => {
  const text = currentRawText();
  document.getElementById("previewBox").textContent = softenText(text);
});

document.getElementById("clearDiary").addEventListener("click", () => {
  ["f_summary", "f_emotion", "f_good", "f_bad", "f_next", "freeText"].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.tagName === "SELECT") el.selectedIndex = 0;
    else if (el) el.value = "";
  });
  document.getElementById("previewBox").textContent = "여기에 정리된 기록이 보여.";
});

document.getElementById("saveDiary").addEventListener("click", saveCurrentDiary);
document.getElementById("clearSavedNotes").addEventListener("click", () => {
  localStorage.removeItem("dugout-notes");
  renderSavedNotes();
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
  localStorage.setItem("dugout-dark", document.body.classList.contains("dark") ? "1" : "0");
});

nicknameInput.addEventListener("input", () => {
  const trimmed = nicknameInput.value.trim();
  if (trimmed) {
    startHelper.classList.add("hidden");
    applyNickname(trimmed);
    maybeAdvanceFromStart();
  }
});

renderTeamChoices();
const savedTeam = localStorage.getItem("dugout-team") || "LOTTE";
const savedNickname = localStorage.getItem("dugout-nickname") || "";
if (savedNickname) nicknameInput.value = savedNickname;
applyTeam(savedTeam);
applyNickname(savedNickname || "팬");
renderSavedNotes();

if (localStorage.getItem("dugout-dark") === "1") {
  document.body.classList.add("dark");
  themeToggle.textContent = "☀️";
}
