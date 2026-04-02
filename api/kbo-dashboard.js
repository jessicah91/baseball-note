const { getTeam, fetchDailyStandings, fetchScoreboardForDate, formatEngScoreDate, findTodayGame, getMyStanding } = require('./_lib/kbo');

module.exports = async (req, res) => {
  const team = getTeam(req.query.team || 'LOTTE');
  const today = new Date();
  const todayString = formatEngScoreDate(today);
  const debug = req.query.debug === '1';

  const payload = {
    source: 'kbo-official',
    fetchedAt: new Date().toISOString(),
    today: todayString,
    team: team.code,
    teamKo: team.koShort,
    themeColor: team.color,
    myTodayGame: null,
    standings: [],
    myStanding: null,
    errors: { scoreboard: null, standings: null }
  };

  try {
    const result = await fetchScoreboardForDate(todayString, debug);
    const scoreboard = Array.isArray(result) ? result : result.games;
    payload.myTodayGame = findTodayGame(scoreboard, team.code);
    if (debug && !Array.isArray(result)) payload.debugScoreboard = result;
    if (!scoreboard.length) payload.errors.scoreboard = '경기 파싱 결과가 비어 있어요.';
  } catch (error) {
    payload.errors.scoreboard = error.message;
  }

  try {
    const result = await fetchDailyStandings(debug);
    const standings = Array.isArray(result) ? result : result.standings;
    payload.standings = standings;
    payload.myStanding = getMyStanding(standings, team.code);
    if (debug && !Array.isArray(result)) payload.debugStandings = result;
    if (!standings.length) payload.errors.standings = '순위 파싱 결과가 비어 있어요.';
  } catch (error) {
    payload.errors.standings = error.message;
  }

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.status(200).json(payload);
};
