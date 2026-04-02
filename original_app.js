const TEAM_META = {
  KIA: { label: "KIA 타이거즈", short: "K", logo: "K", color: "#EA0029", strong: "#B90024" },
  SAMSUNG: { label: "삼성 라이온즈", short: "삼", logo: "삼", color: "#0066B3", strong: "#004C86" },
  LG: { label: "LG 트윈스", short: "L", logo: "L", color: "#C30452", strong: "#91033E" },
  DOOSAN: { label: "두산 베어스", short: "두", logo: "두", color: "#131230", strong: "#0B0A1D" },
  KT: { label: "KT 위즈", short: "KT", logo: "K", color: "#111111", strong: "#000000" },
  SSG: { label: "SSG 랜더스", short: "SSG", logo: "S", color: "#CE0E2D", strong: "#96091F" },
  LOTTE: { label: "롯데 자이언츠", short: "롯", logo: "롯", color: "#0E2E63", strong: "#091F43" },
  HANWHA: { label: "한화 이글스", short: "한", logo: "한", color: "#F37321", strong: "#C85A13" },
  NC: { label: "NC 다이노스", short: "N", logo: "N", color: "#315288", strong: "#223A61" },
  KIWOOM: { label: "키움 히어로즈", short: "키", logo: "키", color: "#570514", strong: "#3B030E" }
};

const homeTeamSelect = document.getElementById("homeTeamSelect");
const homeTeamLogo = document.getElementById("homeTeamLogo");
const diaryTeamLogo = document.getElementById("diaryTeamLogo");
const scheduleTeamLogo = document.getElementById("scheduleTeamLogo");
const summaryLogo = document.getElementById("summaryLogo");
const summaryTeamName = document.getElementById("summaryTeamName");
const scheduleTeamName = document.getElementById("scheduleTeamName");
const modeToggle = document.getElementById("modeToggle");

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

  [homeTeamLogo, diaryTeamLogo, scheduleTeamLogo, summaryLogo].forEach(el => el.textContent = meta.logo);
  summaryTeamName.textContent = meta.label;
  scheduleTeamName.textContent = meta.label;
  localStorage.setItem("dugout-team", teamKey);
}

function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(`page-${id}`).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
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

modeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  modeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
  localStorage.setItem("dugout-dark", document.body.classList.contains("dark") ? "1" : "0");
});

homeTeamSelect.addEventListener("change", e => applyTeam(e.target.value));

populateTeams();
const savedTeam = localStorage.getItem("dugout-team") || "LOTTE";
homeTeamSelect.value = savedTeam;
applyTeam(savedTeam);

if (localStorage.getItem("dugout-dark") === "1") {
  document.body.classList.add("dark");
  modeToggle.textContent = "☀️";
}
