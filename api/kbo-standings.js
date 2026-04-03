function decodeHtmlEntities(str) {
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

function normalizeText(html) {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<!--([\s\S]*?)-->/g, ' ')
      .replace(/<[^>]+>/g, '\n')
      .replace(/\r/g, '\n')
  )
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function parseStandings(lines) {
  const rows = [];
  const rowRegex = /^(\d+)\s+(KT|SSG|NC|한화|롯데|삼성|두산|LG|KIA|키움)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+([0-9.]+)\s+([0-9.-]+).*$/;
  for (const line of lines) {
    const match = line.match(rowRegex);
    if (!match) continue;
    rows.push({
      rank: match[1],
      team: match[2],
      games: match[3],
      win: match[4],
      lose: match[5],
      draw: match[6],
      pct: match[7],
      gb: match[8]
    });
  }
  return rows;
}

export default async function handler(req, res) {
  try {
    const response = await fetch('https://www.koreabaseball.com/Record/TeamRank/TeamRankDaily.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
      }
    });
    if (!response.ok) {
      return res.status(502).json({ error: 'KBO 페이지 응답 실패' });
    }

    const html = await response.text();
    const lines = normalizeText(html);
    const date = lines.find((line) => /^20\d{2}\.\d{2}\.\d{2}$/.test(line)) || '';
    const subtitle = lines.find((line) => /일자별 팀 순위|기준/.test(line)) || '공식 KBO 일자별 팀 순위';
    const rows = parseStandings(lines);

    if (!rows.length) {
      return res.status(500).json({ error: '순위표 파싱 실패', sample: lines.slice(140, 220) });
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ date, subtitle, rows, source: 'KBO official' });
  } catch (error) {
    return res.status(500).json({ error: '서버 오류', detail: String(error) });
  }
}
