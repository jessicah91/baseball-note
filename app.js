const TEAM_META = {
  KIA: { label: "KIA", color: "#EA0029", strong: "#B90024" },
  SAMSUNG: { label: "삼성", color: "#0066B3", strong: "#004C86" },
  LG: { label: "LG", color: "#C30452", strong: "#91033E" },
  DOOSAN: { label: "두산", color: "#131230", strong: "#0B0A1D" },
  KT: { label: "KT", color: "#111111", strong: "#000000" },
  SSG: { label: "SSG", color: "#CE0E2D", strong: "#96091F" },
  LOTTE: { label: "롯데", color: "#0E2E63", strong: "#091F43" },
  HANWHA: { label: "한화", color: "#F37321", strong: "#C85A13" },
  NC: { label: "NC", color: "#315288", strong: "#223A61" },
  KIWOOM: { label: "키움", color: "#570514", strong: "#3B030E" }
};

const teamSelect = document.getElementById("teamSelect");
const teamColorChip = document.getElementById("teamColorChip");
const resultEl = document.getElementById("result");
const inputEl = document.getElementById("input");
const modeToggle = document.getElementById("modeToggle");
const toggleDiary = document.getElementById("toggleDiary");
const diary = document.querySelector(".diary");

function setTheme(teamKey) {
  const meta = TEAM_META[teamKey] || TEAM_META.LOTTE;
  document.documentElement.style.setProperty("--accent", meta.color);
  document.documentElement.style.setProperty("--accent-strong", meta.strong);
  document.documentElement.style.setProperty("--accent-soft", hexToRgba(meta.color, 0.12));
  teamColorChip.textContent = meta.label;
  localStorage.setItem("dugout-team", teamKey);
}

function hexToRgba(hex, alpha) {
  const cleaned = hex.replace("#", "");
  const bigint = parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function softenText(text) {
  if (!text.trim()) {
    return "먼저 오늘 경기 기록을 적어줘.";
  }

  return text
    .replace(/씨발|시발|ㅅㅂ|씹발|씹팔/gi, "아쉽다")
    .replace(/존나|존내|ㅈㄴ/gi, "정말")
    .replace(/개같/gi, "많이 힘들")
    .replace(/미쳤다/gi, "강렬했다")
    .replace(/빡치/gi, "답답했")
    .replace(/짜증나/gi, "아쉬웠")
    .replace(/개못하/gi, "조금 아쉬웠")
    .replace(/병신|븅신/gi, "아쉬운 플레이")
    .replace(/죽겠다/gi, "힘들다")
    .replace(/\s{2,}/g, " ")
    .trim();
}

document.getElementById("soften").addEventListener("click", () => {
  resultEl.textContent = softenText(inputEl.value);
});

document.getElementById("clearBtn").addEventListener("click", () => {
  inputEl.value = "";
  resultEl.textContent = "여기에 순화된 문장이 보여.";
});

teamSelect.addEventListener("change", (e) => {
  setTheme(e.target.value);
});

modeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  modeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

toggleDiary.addEventListener("click", () => {
  diary.classList.toggle("collapsed");
  toggleDiary.textContent = diary.classList.contains("collapsed") ? "열기" : "접기";
});

const savedTeam = localStorage.getItem("dugout-team") || "LOTTE";
teamSelect.value = savedTeam;
setTheme(savedTeam);
