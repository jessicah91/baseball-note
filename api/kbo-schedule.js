const TEAM_MAP = {
  KT: { label: "KT 위즈", aliases: ["KT", "케이티"] },
  SSG: { label: "SSG 랜더스", aliases: ["SSG", "랜더스"] },
  NC: { label: "NC 다이노스", aliases: ["NC", "다이노스"] },
  HANWHA: { label: "한화 이글스", aliases: ["한화", "이글스"] },
  LOTTE: { label: "롯데 자이언츠", aliases: ["롯데", "자이언츠"] },
  SAMSUNG: { label: "삼성 라이온즈", aliases: ["삼성", "라이온즈"] },
  DOOSAN: { label: "두산 베어스", aliases: ["두산", "베어스"] },
  LG: { label: "LG 트윈스", aliases: ["LG", "트윈스"] },
  KIA: { label: "KIA 타이거즈", aliases: ["KIA", "기아", "타이거즈"] },
  KIWOOM: { label: "키움 히어로즈", aliases: ["키움", "히어로즈"] }
};

const SCHEDULE_URL = "https://www.koreabaseball.com/Schedule/Schedule.aspx";

function clean(text) {
  return String(text || "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitCells(rowHtml) {
  const cells = [...rowHtml.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(m => clean(m[1]));
  return cells.filter(cell => cell !== "");
}

function splitMatchup(text) {
  const normalized = clean(text).replace(/\s+/g, " ");
  const parts = normalized.split(/\s*vs\s*/i);
  if (parts.length === 2) {
    return { awayTeam: parts[0].trim(), homeTeam: parts[1].trim() };
  }
  return { awayTeam: normalized, homeTeam: "" };
}

function parseRows(html) {
  const tableMatch = html.match(/<table[^>]*id=["']tblScheduleList["'][^>]*>[\s\S]*?<tbody[^>]*>([\s\S]*?)<\/tbody>[\s\S]*?<\/table>/i);
  if (!tableMatch) return [];

  const tbody = tableMatch[1];
  const rowMatches = [...tbody.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  const games = [];
  let currentDate = "";

  for (const match of rowMatches) {
    const rowHtml = match[1];
    const cells = splitCells(rowHtml);
    if (!cells.length) continue;

    const joined = cells.join(" ");
    if (/데이터가 없습니다/.test(joined) || /취소/.test(joined) && !/vs/i.test(joined)) continue;

    let cursor = 0;
    let dateLabel = currentDate;

    if (/\d{1,2}\.\d{1,2}|\d{4}\.\d{1,2}\.\d{1,2}|\d{1,2}월\s*\d{1,2}일/.test(cells[0])) {
      dateLabel = cells[0];
      currentDate = dateLabel;
      cursor = 1;
    }

    if (!cells[cursor + 1]) continue;

    const time = cells[cursor] || "";
    const matchupRaw = cells[cursor + 1] || "";
    if (!/vs/i.test(matchupRaw)) continue;

    const { awayTeam, homeTeam } = splitMatchup(matchupRaw);
    const rest = cells.slice(cursor + 2);

    let score = "";
    let broadcast = "";
    let stadium = "";
    let note = "";

    if (rest.length >= 4) {
      [score, broadcast, stadium, note] = rest;
    } else if (rest.length === 3) {
      [broadcast, stadium, note] = rest;
    } else if (rest.length === 2) {
      [stadium, note] = rest;
    } else if (rest.length === 1) {
      [note] = rest;
    }

    games.push({
      dateLabel,
      time,
      awayTeam,
      homeTeam,
      matchup: matchupRaw,
      score,
      broadcast,
      stadium,
      note,
      state: score ? "경기 반영" : "예정"
    });
  }

  return games;
}

function filterByTeam(games, teamKey) {
  const meta = TEAM_MAP[teamKey] || TEAM_MAP.LOTTE;
  return games.filter(game => {
    const haystack = `${game.awayTeam} ${game.homeTeam} ${game.matchup}`.toUpperCase();
    return meta.aliases.some(alias => haystack.includes(alias.toUpperCase()));
  });
}

function monthLabelFromNow() {
  const now = new Date();
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월 일정`;
}

export default async function handler(req, res) {
  const teamKey = String(req.query.team || "LOTTE").toUpperCase();
  const meta = TEAM_MAP[teamKey] || TEAM_MAP.LOTTE;

  try {
    const response = await fetch(SCHEDULE_URL, {
      headers: {
        "user-agent": "Mozilla/5.0",
        "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7"
      }
    });

    if (!response.ok) {
      throw new Error(`upstream_${response.status}`);
    }

    const html = await response.text();
    const games = filterByTeam(parseRows(html), teamKey);

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    res.status(200).json({
      ok: true,
      teamKey,
      teamLabel: meta.label,
      source: SCHEDULE_URL,
      monthLabel: monthLabelFromNow(),
      games
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      teamKey,
      teamLabel: meta.label,
      error: error instanceof Error ? error.message : "unknown_error"
    });
  }
}
