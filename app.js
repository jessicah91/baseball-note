const TEAM_META = {
  KIA: { label: "KIA 타이거즈", short: "KIA", logo: "K", color: "#EA0029", strong: "#B90024", aliases: ["KIA", "기아"] },
  SAMSUNG: { label: "삼성 라이온즈", short: "삼성", logo: "삼", color: "#0066B3", strong: "#004C86", aliases: ["삼성"] },
  LG: { label: "LG 트윈스", short: "LG", logo: "L", color: "#C30452", strong: "#91033E", aliases: ["LG"] },
  DOOSAN: { label: "두산 베어스", short: "두산", logo: "두", color: "#131230", strong: "#0B0A1D", aliases: ["두산"] },
  KT: { label: "KT 위즈", short: "KT", logo: "KT", color: "#111111", strong: "#000000", aliases: ["KT", "kt"] },
  SSG: { label: "SSG 랜더스", short: "SSG", logo: "SSG", color: "#CE0E2D", strong: "#96091F", aliases: ["SSG"] },
  LOTTE: { label: "롯데 자이언츠", short: "롯데", logo: "롯", color: "#0E2E63", strong: "#091F43", aliases: ["롯데"] },
  HANWHA: { label: "한화 이글스", short: "한화", logo: "한", color: "#F37321", strong: "#C85A13", aliases: ["한화"] },
  NC: { label: "NC 다이노스", short: "NC", logo: "NC", color: "#315288", strong: "#223A61", aliases: ["NC", "nc"] },
  KIWOOM: { label: "키움 히어로즈", short: "키움", logo: "키", color: "#570514", strong: "#3B030E", aliases: ["키움"] }
};

const homeTeamSelect = document.getElementById("homeTeamSelect");
const nicknameInput = document.getElementById("nicknameInput");
const nicknameText = document.getElementById("nicknameText");
const nicknameArchive = document.getElementById("nicknameArchive");
const globalModeToggle = document.getElementById("globalModeToggle");
const homeTeamLogo = document.getElementById("homeTeamLogo");
const hubTeamLogo = document.getElementById("hubTeamLogo");
const diaryTeamLogo = document.getElementById("diaryTeamLogo");
const summaryLogo = document.getElementById("summaryLogo");
const standingsTeamLogo = document.getElementById("standingsTeamLogo");
const mypageTeamLogo = document.getElementById("mypageTeamLogo");
const summaryTeamName = document.getElementById("summaryTeamName");
const standingsHeadline = document.getElementById("standingsHeadline");
const standingsMeta = document.getElementById("standingsMeta");
const standingsStatus = document.getElementById("standingsStatus");
const standingsTableWrap = document.getElementById("standingsTableWrap");
const standingsTableBody = document.getElementById("standingsTableBody");
const savedNotesList = document.getElementById("savedNotesList");

function populateTeams() {
  Object.entries(TEAM_META).forEach(([key, meta]) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = meta.label;
    homeTeamSelect.appendChild(option);
  });
}

function hexToRgba(hex, alpha) {
  const c = hex.replace("#", "");
  const n = parseInt(c, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function applyTeam(teamKey) {
  const meta = TEAM_META[teamKey] || TEAM_META.LOTTE;
  document.documentElement.style.setProperty("--accent", meta.color);
  document.documentElement.style.setProperty("--accent-strong", meta.strong);
  document.documentElement.style.setProperty("--accent-soft", hexToRgba(meta.color, 0.12));

  [homeTeamLogo, hubTeamLogo, diaryTeamLogo, summaryLogo, standingsTeamLogo, mypageTeamLogo].forEach((el) => {
    if (el) el.textContent = meta.logo;
  });

  summaryTeamName.textContent = meta.label;
  localStorage.setItem("dugout-team", teamKey);
}

function showPage(id) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  document.getElementById(`page-${id}`).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (id === "standings") loadStandings();
  if (id === "mypage") renderSavedNotes();
}

function getActiveWriteMode() {
  return document.querySelector(".seg-btn.active")?.dataset.mode || "template";
}

function value(id) {
  const el = document.getElementById(id);
  return (el?.value || "").trim();
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

function setNickname(name) {
  const safeName = (name || "팬").trim() || "팬";
  nicknameText.textContent = safeName;
  nicknameArchive.textContent = safeName;
  localStorage.setItem("dugout-nickname", safeName);
}

function goAfterTeamSelect() {
  const nickname = nicknameInput.value.trim();
  if (!nickname) {
    nicknameInput.focus();
    nicknameInput.placeholder = "닉네임 먼저 입력해줘";
    return;
  }
  setNickname(nickname);
  showPage("hub");
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  globalModeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
  localStorage.setItem("dugout-dark", document.body.classList.contains("dark") ? "1" : "0");
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

function saveCurrentDiary() {
  const text = currentRawText();
  const preview = text || "내용 없음";
  const teamKey = localStorage.getItem("dugout-team") || "LOTTE";
  const notes = getSavedNotes();
  notes.unshift({
    id: Date.now(),
    teamKey,
    teamLabel: TEAM_META[teamKey].label,
    text: preview,
    createdAt: new Date().toLocaleString("ko-KR")
  });
  saveNotes(notes.slice(0, 50));
  renderSavedNotes();
  alert("덕아웃 노트를 저장했어!");
}

function renderSavedNotes() {
  const notes = getSavedNotes();
  if (!notes.length) {
    savedNotesList.innerHTML = '<div class="notice-card">아직 저장한 기록이 없어.</div>';
    return;
  }

  savedNotesList.innerHTML = notes.map((note) => `
    <article class="saved-note card inset">
      <div class="saved-note-head">
        <strong>${note.teamLabel}</strong>
        <button class="text-btn" type="button" onclick="deleteSavedNote(${note.id})">삭제</button>
      </div>
      <p class="saved-note-date">${note.createdAt}</p>
      <p class="saved-note-text">${escapeHtml(note.text)}</p>
    </article>
  `).join("");
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.deleteSavedNote = function deleteSavedNote(id) {
  const notes = getSavedNotes().filter((note) => note.id !== id);
  saveNotes(notes);
  renderSavedNotes();
};

function getMyTeamAliases() {
  const teamKey = localStorage.getItem("dugout-team") || "LOTTE";
  return TEAM_META[teamKey]?.aliases || [];
}

function renderStandingsTable(rows) {
  const aliases = getMyTeamAliases();
  standingsTableBody.innerHTML = rows.map((row) => {
    const isMine = aliases.includes(row.team);
    return `
      <tr class="${isMine ? "is-mine" : ""}">
        <td>${row.rank}</td>
        <td class="team-cell">${row.team}${isMine ? ' <span class="mine-badge">MY</span>' : ""}</td>
        <td>${row.games}</td>
        <td>${row.win}</td>
        <td>${row.lose}</td>
        <td>${row.draw}</td>
        <td>${row.pct}</td>
        <td>${row.gb}</td>
      </tr>
    `;
  }).join("");
}

async function loadStandings() {
  standingsStatus.textContent = "순위표를 불러오는 중이야…";
  standingsStatus.classList.remove("error");
  standingsTableWrap.classList.add("hidden");

  try {
    const response = await fetch(`/api/kbo-standings?ts=${Date.now()}`);
    if (!response.ok) throw new Error("순위 응답 실패");
    const data = await response.json();
    if (!data.rows?.length) throw new Error("순위 데이터 없음");

    standingsHeadline.textContent = `${data.date || "오늘"} 기준 KBO 순위`;
    standingsMeta.textContent = `${data.subtitle || "공식 KBO 일자별 팀 순위"}`;
    standingsStatus.textContent = "불러오기 완료";
    renderStandingsTable(data.rows);
    standingsTableWrap.classList.remove("hidden");
  } catch (error) {
    standingsStatus.textContent = "공식 순위표를 불러오지 못했어. Vercel에 api 폴더까지 같이 배포됐는지 확인해줘.";
    standingsStatus.classList.add("error");
  }
}

// Navigation and events
homeTeamSelect.addEventListener("change", (e) => {
  applyTeam(e.target.value);
  goAfterTeamSelect();
});

nicknameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") goAfterTeamSelect();
});

document.getElementById("goDiary").addEventListener("click", () => showPage("diary"));
document.getElementById("goStandings").addEventListener("click", () => showPage("standings"));
document.getElementById("goRules").addEventListener("click", () => showPage("rules"));
document.getElementById("goMyPage").addEventListener("click", () => showPage("mypage"));
document.querySelectorAll("[data-go='home']").forEach((btn) => btn.addEventListener("click", () => showPage("home")));
document.querySelectorAll("[data-go='hub']").forEach((btn) => btn.addEventListener("click", () => showPage("hub")));

document.getElementById("toggleSummary").addEventListener("click", () => {
  const body = document.getElementById("summaryBody");
  const chevron = document.getElementById("summaryChevron");
  const hidden = body.style.display === "none";
  body.style.display = hidden ? "block" : "none";
  chevron.textContent = hidden ? "▾" : "▸";
});

document.querySelectorAll(".seg-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".seg-btn").forEach((b) => b.classList.remove("active"));
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
  ["f_summary", "f_emotion", "f_good", "f_bad", "f_next", "freeText"].forEach((id) => {
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
document.getElementById("refreshStandings").addEventListener("click", loadStandings);
globalModeToggle.addEventListener("click", toggleDarkMode);

populateTeams();
const savedTeam = localStorage.getItem("dugout-team") || "LOTTE";
homeTeamSelect.value = savedTeam;
applyTeam(savedTeam);

const savedNickname = localStorage.getItem("dugout-nickname") || "팬";
nicknameInput.value = savedNickname === "팬" ? "" : savedNickname;
setNickname(savedNickname);

if (localStorage.getItem("dugout-dark") === "1") {
  document.body.classList.add("dark");
  globalModeToggle.textContent = "☀️";
}

renderSavedNotes();
