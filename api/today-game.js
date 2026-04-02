const TEAM_ALIASES = {
  LOTTE: '롯데', GIANTS: '롯데', 롯데: '롯데',
  DOOSAN: '두산', BEARS: '두산', 두산: '두산',
  KIA: 'KIA', TIGERS: 'KIA',
  LG: 'LG', TWINS: 'LG',
  SAMSUNG: '삼성', LIONS: '삼성', 삼성: '삼성',
  HANWHA: '한화', EAGLES: '한화', 한화: '한화',
  NC: 'NC', DINOS: 'NC',
  SSG: 'SSG', LANDERS: 'SSG',
  KT: 'KT', WIZ: 'KT',
  KIWOOM: '키움', HEROES: '키움', 키움: '키움'
};

const TEAM_EN_TO_KO = {
  LOTTE: '롯데', DOOSAN: '두산', KIA: 'KIA', LG: 'LG', SAMSUNG: '삼성', HANWHA: '한화', NC: 'NC', SSG: 'SSG', KT: 'KT', KIWOOM: '키움'
};

const VENUE_KO = { CHANGWON:'창원', JAMSIL:'잠실', MUNHAK:'문학', DAEGU:'대구', DAEJEON:'대전', GWANGJU:'광주', GO척?':'고척', GOCH EOK:'고척', GOCH EOK SKY DOME:'고척', GOCH EOKSKYDOME:'고척', SUWON:'수원', SAJIK:'사직' };

function normalizeTeam(input='') {
  const raw = String(input).trim();
  return TEAM_ALIASES[raw.toUpperCase()] || TEAM_ALIASES[raw] || '롯데';
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

function venueToKo(v='') {
  const key = v.toUpperCase().replace(/\s+/g,' ').trim();
  return VENUE_KO[key] || v;
}

function parseGameBlocks(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const games = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/^Image:\s*\w+\s*/i, '').trim();
    let m = line.match(/^(KIA|KIWOOM|DOOSAN|LOTTE|KT|LG|SSG|NC|HANWHA|SAMSUNG)\s+(\d{1,2}:\d{2})\s+(KIA|KIWOOM|DOOSAN|LOTTE|KT|LG|SSG|NC|HANWHA|SAMSUNG)$/i);
    if (m) {
      const away = m[1].toUpperCase();
      const time = m[2];
      const home = m[3].toUpperCase();
      const venueLine = lines[i + 1] || '';
      const venueMatch = venueLine.match(/^([A-Z\s]+)\s+\d{1,2}:\d{2}/);
      games.push({
        status: '예정',
        awayEn: away,
        homeEn: home,
        awayKo: TEAM_EN_TO_KO[away],
        homeKo: TEAM_EN_TO_KO[home],
        time,
        venue: venueToKo(venueMatch ? venueMatch[1].trim() : venueLine),
        scoreAway: null,
        scoreHome: null,
      });
      continue;
    }
    m = line.match(/^(KIA|KIWOOM|DOOSAN|LOTTE|KT|LG|SSG|NC|HANWHA|SAMSUNG)\s+(\d+)\s+FINAL\s+(\d+)\s+(KIA|KIWOOM|DOOSAN|LOTTE|KT|LG|SSG|NC|HANWHA|SAMSUNG)$/i);
    if (m) {
      const away = m[1].toUpperCase();
      const scoreAway = Number(m[2]);
      const scoreHome = Number(m[3]);
      const home = m[4].toUpperCase();
      const venueLine = lines[i + 1] || '';
      const venueMatch = venueLine.match(/^([A-Z\s]+)\s+\d{1,2}:\d{2}/);
      const timeMatch = venueLine.match(/(\d{1,2}:\d{2})/);
      games.push({
        status: '종료',
        awayEn: away,
        homeEn: home,
        awayKo: TEAM_EN_TO_KO[away],
        homeKo: TEAM_EN_TO_KO[home],
        time: timeMatch ? timeMatch[1] : '',
        venue: venueToKo(venueMatch ? venueMatch[1].trim() : venueLine),
        scoreAway,
        scoreHome,
      });
    }
  }
  return games;
}

module.exports = async (req, res) => {
  try {
    const team = normalizeTeam(req.query.team || '롯데');
    const today = new Date().toISOString().slice(0,10);
    const url = `https://eng.koreabaseball.com/Schedule/Scoreboard.aspx?searchDate=${today}`;
    const response = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0',
        'accept-language': 'en-US,en;q=0.9,ko-KR;q=0.8,ko;q=0.7',
        'cache-control': 'no-cache',
      }
    });
    const html = await response.text();
    const text = stripHtml(html);
    const games = parseGameBlocks(text);
    const myGame = games.find(g => g.awayKo === team || g.homeKo === team) || null;
    res.setHeader('Cache-Control', 's-maxage=180, stale-while-revalidate=600');
    res.status(200).json({
      source: 'kbo-scoreboard',
      fetchedAt: new Date().toISOString(),
      today,
      team,
      myTodayGame: myGame,
      debug: games.length ? undefined : text.slice(0, 1200),
    });
  } catch (error) {
    res.status(200).json({
      source: 'kbo-scoreboard',
      fetchedAt: new Date().toISOString(),
      myTodayGame: null,
      error: error.message,
    });
  }
};
