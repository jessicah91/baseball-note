const TEAM_META = {
  KIA: { label: "KIA 타이거즈", short: "K", logo: "K", color: "#EA0029", strong: "#B90024", english: "Kia Tigers" },
  SAMSUNG: { label: "삼성 라이온즈", short: "삼", logo: "삼", color: "#0066B3", strong: "#004C86", english: "Samsung Lions" },
  LG: { label: "LG 트윈스", short: "L", logo: "L", color: "#C30452", strong: "#91033E", english: "LG Twins" },
  DOOSAN: { label: "두산 베어스", short: "두", logo: "두", color: "#131230", strong: "#0B0A1D", english: "Doosan Bears" },
  KT: { label: "KT 위즈", short: "KT", logo: "K", color: "#111111", strong: "#000000", english: "KT Wiz" },
  SSG: { label: "SSG 랜더스", short: "SSG", logo: "S", color: "#CE0E2D", strong: "#96091F", english: "SSG Landers" },
  LOTTE: { label: "롯데 자이언츠", short: "롯", logo: "롯", color: "#0E2E63", strong: "#091F43", english: "Lotte Giants" },
  HANWHA: { label: "한화 이글스", short: "한", logo: "한", color: "#F37321", strong: "#C85A13", english: "Hanwha Eagles" },
  NC: { label: "NC 다이노스", short: "N", logo: "N", color: "#315288", strong: "#223A61", english: "NC Dinos" },
  KIWOOM: { label: "키움 히어로즈", short: "키", logo: "키", color: "#570514", strong: "#3B030E", english: "Kiwoom Heroes" }
};

const homeTeamSelect = document.getElementById("homeTeamSelect");
const homeTeamLogo = document.getElementById("homeTeamLogo");
const diaryTeamLogo = document.getElementById("diaryTeamLogo");
const scheduleTeamLogo = document.getElementById("scheduleTeamLogo");
const summaryLogo = document.getElementById("summaryLogo");
const summaryTeamName = document.getElementById("summaryTeamName");
const scheduleTeamName = document.getElementById("scheduleTeamName");
const modeToggle = document.getElementById("globalModeToggle");
const scheduleList = document.getElementById("scheduleList");
const scheduleLoading = document.getElementById("scheduleLoading");
const scheduleError = document.getElementById("scheduleError");
const scheduleEmpty = document.getElementById("scheduleEmpty");
const scheduleSourceText = document.getElementById("scheduleSourceText");

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

  [homeTeamLogo, diaryTeamLogo, scheduleTeamLogo, summaryLogo].forEach(el => {
    if (el) el.textContent = meta.logo;
  });
  if (summaryTeamName) summaryTeamName.textContent = meta.label;
  if (scheduleTeamName) scheduleTeamName.textContent = meta.label;
  localStorage.setItem("dugout-team", teamKey);
}

function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(`page-${id}`).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (id === "schedule") {
    loadSchedule();
  }
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

function value(id) {
  const el = document.getElementById(id);
  return (el?.value || "").trim();
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

function setDarkMode(enabled) {
  document.body.classList.toggle("dark", enabled);
  modeToggle.textContent = enabled ? "☀️" : "🌙";
  localStorage.setItem("dugout-dark", enabled ? "1" : "0");
}

function translateStatus(status) {
  const normalized = (status || "").trim();
  if (!normalized) return "경기 예정";
  return normalized
    .replace(/Final\/([0-9]+)/gi, (_, inn) => `${inn}회 종료 무승부`)
    .replace(/^Final$/i, "경기 종료")
    .replace(/^Top ([0-9]+)(st|nd|rd|th)$/i, (_, inn) => `${inn}회초 진행중`)
    .replace(/^Bot(?:tom)? ([0-9]+)(st|nd|rd|th)$/i, (_, inn) => `${inn}회말 진행중`)
    .replace(/^[0-9]{1,2}:[0-9]{2}(am|pm)$/i, t => `경기 예정 · ${formatTime(t)}`);
}

function formatTime(value) {
  const match = String(value).trim().match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
  if (!match) return value;
  let [, hour, minute, ap] = match;
  let h = Number(hour);
  const upper = ap.toUpperCase();
  const label = upper === "AM" ? "오전" : "오후";
  if (h === 0) h = 12;
  if (h > 12) h -= 12;
  return `${label} ${h}:${minute}`;
}

function translateVenue(venue) {
  const v = (venue || "").trim();
  const map = {
    "Seoul-Jamsil": "서울 잠실",
    "Seoul-Gocheok": "서울 고척",
    "Gwangju": "광주",
    "Busan-Sajik": "부산 사직",
    "Suwon": "수원",
    "Incheon": "인천",
    "Daejeon": "대전",
    "Changwon": "창원",
    "Daegu": "대구"
  };
  return map[v] || v;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderSchedule(items) {
  scheduleList.innerHTML = "";

  items.forEach(group => {
    const section = document.createElement("section");
    section.className = "schedule-day-group";

    const title = document.createElement("h4");
    title.className = "schedule-day-title";
    title.textContent = group.dateLabel;
    section.appendChild(title);

    const rowsWrap = document.createElement("div");
    rowsWrap.className = "schedule-day-list";

    group.games.forEach(game => {
      const row = document.createElement("article");
      row.className = "schedule-game-row";
      row.innerHTML = `
        <div class="schedule-row-top">
          <span class="schedule-status">${escapeHtml(game.statusKo)}</span>
          <span class="schedule-venue">${escapeHtml(game.venueKo || "장소 미정")}</span>
        </div>
        <div class="schedule-matchup">
          <strong>${escapeHtml(game.awayKo)}</strong>
          <span class="versus">vs</span>
          <strong>${escapeHtml(game.homeKo)}</strong>
        </div>
      `;
      rowsWrap.appendChild(row);
    });

    section.appendChild(rowsWrap);
    scheduleList.appendChild(section);
  });
}

async function loadSchedule() {
  const teamKey = localStorage.getItem("dugout-team") || "LOTTE";
  const team = TEAM_META[teamKey] || TEAM_META.LOTTE;

  scheduleLoading.classList.remove("hidden");
  scheduleError.classList.add("hidden");
  scheduleEmpty.classList.add("hidden");
  scheduleList.innerHTML = "";
  scheduleSourceText.textContent = `${team.label} 기준 MyKBO Stats 주간 일정을 한국어로 가져오는 중...`;

  try {
    const response = await fetch(`/api/mykbostats-schedule?team=${encodeURIComponent(team.english)}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (!data?.schedule?.length) {
      scheduleEmpty.classList.remove("hidden");
      scheduleSourceText.textContent = `${team.label} 일정이 아직 없거나 가져오지 못했어.`;
      return;
    }

    renderSchedule(data.schedule);
    scheduleSourceText.textContent = `${team.label} 기준 주간 일정 · 출처: MyKBO Stats`;
  } catch (error) {
    scheduleError.classList.remove("hidden");
    scheduleError.textContent = `일정을 불러오지 못했어. (${error.message})`;
    scheduleSourceText.textContent = "Vercel API 함수가 정상 배포됐는지 확인해줘.";
  } finally {
    scheduleLoading.classList.add("hidden");
  }
}

document.getElementById("goDiary").addEventListener("click", () => showPage("diary"));
document.getElementById("goSchedule").addEventListener("click", () => showPage("schedule"));
document.getElementById("goRules").addEventListener("click", () => showPage("rules"));
document.querySelectorAll("[data-go='home']").forEach(btn => btn.addEventListener("click", () => showPage("home")));

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
  ["f_summary","f_emotion","f_good","f_bad","f_next","freeText"].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.tagName === "SELECT") el.selectedIndex = 0;
    else if (el) el.value = "";
  });
  document.getElementById("previewBox").textContent = "여기에 정리된 기록이 보여.";
});

document.getElementById("refreshSchedule").addEventListener("click", loadSchedule);
modeToggle.addEventListener("click", () => setDarkMode(!document.body.classList.contains("dark")));
homeTeamSelect.addEventListener("change", e => {
  applyTeam(e.target.value);
  if (document.getElementById("page-schedule").classList.contains("active")) loadSchedule();
});

populateTeams();
const savedTeam = localStorage.getItem("dugout-team") || "LOTTE";
homeTeamSelect.value = savedTeam;
applyTeam(savedTeam);
setDarkMode(localStorage.getItem("dugout-dark") === "1");
