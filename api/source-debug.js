const { fetchDailyStandings, fetchScoreboardForDate } = require('./_lib/kbo');
module.exports = async (req, res) => {
  const date = String(req.query.date || new Date().toISOString().slice(0, 10));
  const standings = await fetchDailyStandings(true).catch((e) => ({ error: e.message }));
  const scoreboard = await fetchScoreboardForDate(date, true).catch((e) => ({ error: e.message }));
  res.status(200).json({ date, standings, scoreboard });
};
