const TEAM_TRANSLATIONS = {
  "Doosan Bears": "두산 베어스",
  "Hanwha Eagles": "한화 이글스",
  "Kia Tigers": "KIA 타이거즈",
  "Kiwoom Heroes": "키움 히어로즈",
  "KT Wiz": "KT 위즈",
  "LG Twins": "LG 트윈스",
  "Lotte Giants": "롯데 자이언츠",
  "NC Dinos": "NC 다이노스",
  "Samsung Lions": "삼성 라이온즈",
  "SSG Landers": "SSG 랜더스"
};

const VENUE_TRANSLATIONS = {
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

function decodeHtml(text) {
  return String(text || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function formatTime(value) {
  const match = String(value).trim().match(/^(\d{1,2}):(\d{2})(am|pm)$/i);
  if (!match) return value;
  let [, hour, minute, ap] = match;
  let h = Number(hour);
  const label = ap.toLowerCase() === "am" ? "오전" : "오후";
  if (h > 12) h -= 12;
  return `${label} ${h}:${minute}`;
}

function translateStatus(status) {
  const s = String(status || "").trim();
  if (!s) return "경기 예정";
  return s
    .replace(/Final\/(\d+)/gi, (_, inn) => `${inn}회 종료 무승부`)
    .replace(/^Final$/i, "경기 종료")
    .replace(/^Top (\d+)(st|nd|rd|th)$/i, (_, inn) => `${inn}회초 진행중`)
    .replace(/^Bot(?:tom)? (\d+)(st|nd|rd|th)$/i, (_, inn) => `${inn}회말 진행중`)
    .replace(/^(\d{1,2}:\d{2}(?:am|pm))$/i, (_, time) => `경기 예정 · ${formatTime(time)}`);
}

function parseMatchup(rawText) {
  const clean = decodeHtml(rawText).replace(/\s+/g, ' ').trim();
  const teamPattern = /(Doosan Bears|Hanwha Eagles|Kia Tigers|Kiwoom Heroes|KT Wiz|LG Twins|Lotte Giants|NC Dinos|Samsung Lions|SSG Landers)/g;
  const teams = clean.match(teamPattern) || [];
  if (teams.length < 2) return null;
  const away = teams[0];
  const home = teams[1];
  let middle = clean.replace(away, '').replace(home, '').trim();
  middle = middle.replace(/^\s+|\s+$/g, '');
  const venueMatch = middle.match(/(Seoul-Jamsil|Seoul-Gocheok|Gwangju|Busan-Sajik|Suwon|Incheon|Daejeon|Changwon|Daegu)/i);
  const venue = venueMatch ? venueMatch[0] : '';
  let status = middle.replace(venue, '').trim();
  status = status.replace(/^:+|:+$/g, '').trim();
  return {
    away,
    home,
    awayKo: TEAM_TRANSLATIONS[away] || away,
    homeKo: TEAM_TRANSLATIONS[home] || home,
    status,
    statusKo: translateStatus(status),
    venue,
    venueKo: VENUE_TRANSLATIONS[venue] || venue
  };
}

function parseSchedule(html, selectedTeam) {
  const schedule = [];
  const sectionPattern = /<h3[^>]*>([^<]+)<\/h3>([\s\S]*?)(?=<h3[^>]*>|$)/gi;
  let sectionMatch;
  while ((sectionMatch = sectionPattern.exec(html)) !== null) {
    const dateLabel = decodeHtml(sectionMatch[1]);
    const body = sectionMatch[2];
    const games = [];
    const linkPattern = /<a[^>]*href="\/games\/[^"]+"[^>]*>([\s\S]*?)<\/a>/gi;
    let linkMatch;
    while ((linkMatch = linkPattern.exec(body)) !== null) {
      const game = parseMatchup(linkMatch[1]);
      if (!game) continue;
      if (selectedTeam && game.away !== selectedTeam && game.home !== selectedTeam) continue;
      games.push(game);
    }
    if (games.length) schedule.push({ dateLabel, games });
  }
  return schedule;
}

module.exports = async (req, res) => {
  try {
    const team = req.query && req.query.team ? String(req.query.team) : "";
    const response = await fetch("https://mykbostats.com/schedule", {
      headers: {
        "user-agent": "Mozilla/5.0 Vercel Function",
        "accept-language": "ko,en;q=0.9"
      }
    });
    if (!response.ok) {
      return res.status(502).json({ error: "source_fetch_failed", status: response.status });
    }
    const html = await response.text();
    const schedule = parseSchedule(html, team);
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({ source: "MyKBO Stats", unofficial: true, team, schedule });
  } catch (error) {
    return res.status(500).json({ error: "internal_error", message: error.message });
  }
};
