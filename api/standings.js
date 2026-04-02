const iconv = require('iconv-lite');

const TEAM_META = {
  KT: { ko: 'KT', color: '#111111' },
  SSG: { ko: 'SSG', color: '#CE0E2D' },
  NC: { ko: 'NC', color: '#315288' },
  한화: { ko: '한화', color: '#F37321' },
  롯데: { ko: '롯데', color: '#0E2E63' },
  삼성: { ko: '삼성', color: '#005BAC' },
  두산: { ko: '두산', color: '#131230' },
  LG: { ko: 'LG', color: '#C30452' },
  KIA: { ko: 'KIA', color: '#EA0029' },
  키움: { ko: '키움', color: '#570514' },
};

const TEAM_ALIASES = {
  LOTTE: '롯데',
  GIANTS: '롯데',
  롯데: '롯데',
  DOOSAN: '두산',
  두산: '두산',
  KIA: 'KIA',
  TIGERS: 'KIA',
  LG: 'LG',
  TWINS: 'LG',
  SAMSUNG: '삼성',
  LIONS: '삼성',
  삼성: '삼성',
  HANWHA: '한화',
  EAGLES: '한화',
  한화: '한화',
  NC: 'NC',
  DINOS: 'NC',
  SSG: 'SSG',
  LANDERS: 'SSG',
  KT: 'KT',
  WIZ: 'KT',
  KIWOOM: '키움',
  HEROES: '키움',
  키움: '키움',
};

function normalizeTeam(input = '') {
  const key = String(input).trim().toUpperCase();
  return TEAM_ALIASES[key] || TEAM_ALIASES[String(input).trim()] || '롯데';
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
}

function parseStandings(text) {
  const sectionMatch = text.match(/순위 팀명 경기 승 패 무 승률 게임차 최근10경기 연속 홈 방문([\s\S]*?)팀간 승패표/);
  const section = sectionMatch ? sectionMatch[1] : text;
  const regex = /(\d+)\s+(KT|SSG|NC|한화|롯데|삼성|두산|LG|KIA|키움)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+([0-9.]+)\s+([0-9.]+|-)\s+(\d+승\d+무\d+패)\s+([0-9]+승|[0-9]+패|[0-9]+무)\s+([0-9-]+)\s+([0-9-]+)/g;
  const rows = [];
  let m;
  while ((m = regex.exec(section)) !== null) {
    rows.push({
      rank: Number(m[1]),
      team: m[2],
      games: Number(m[3]),
      wins: Number(m[4]),
      losses: Number(m[5]),
      draws: Number(m[6]),
      pct: m[7],
      gb: m[8],
      last10: m[9],
      streak: m[10],
      home: m[11],
      away: m[12],
      color: TEAM_META[m[2]]?.color || '#5b6b8c',
    });
  }
  return rows;
}

async function fetchStandingsText() {
  const url = 'https://www.koreabaseball.com/Record/TeamRank/TeamRankDaily.aspx';
  const res = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0',
      'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'cache-control': 'no-cache',
    },
  });
  const buffer = Buffer.from(await res.arrayBuffer());
  const utf8 = buffer.toString('utf8');
  const euckr = iconv.decode(buffer, 'euc-kr');
  const utf8Text = stripHtml(utf8);
  const euckrText = stripHtml(euckr);
  const utf8Rows = parseStandings(utf8Text);
  if (utf8Rows.length >= 10) return { text: utf8Text, rows: utf8Rows, encoding: 'utf8' };
  const euckrRows = parseStandings(euckrText);
  return { text: euckrText, rows: euckrRows, encoding: 'euc-kr' };
}

module.exports = async (req, res) => {
  try {
    const team = normalizeTeam(req.query.team || '롯데');
    const { text, rows, encoding } = await fetchStandingsText();
    const myStanding = rows.find((row) => row.team === team) || null;
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');
    res.status(200).json({
      source: 'kbo-teamrankdaily',
      fetchedAt: new Date().toISOString(),
      team,
      encoding,
      standings: rows,
      myStanding,
      debug: rows.length ? undefined : text.slice(0, 1200),
    });
  } catch (error) {
    res.status(200).json({
      source: 'kbo-teamrankdaily',
      fetchedAt: new Date().toISOString(),
      standings: [],
      myStanding: null,
      error: error.message,
    });
  }
};
