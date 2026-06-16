const { pool, mapRow } = require('../config/database');

const getStats = async (req, res, next) => {
  try {
    const [
      [{ totalQuizzes }],
      [{ publishedQuizzes }],
      [{ totalCategories }],
      [{ activeCategories }],
      [{ registeredUsers }],
      [{ guestUsers }],
      [{ totalAttempts }],
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) AS totalQuizzes FROM quizzes'),
      pool.query('SELECT COUNT(*) AS publishedQuizzes FROM quizzes WHERE is_published = 1'),
      pool.query('SELECT COUNT(*) AS totalCategories FROM categories'),
      pool.query('SELECT COUNT(*) AS activeCategories FROM categories WHERE is_active = 1'),
      pool.query('SELECT COUNT(*) AS registeredUsers FROM users WHERE is_guest = 0'),
      pool.query('SELECT COUNT(*) AS guestUsers FROM users WHERE is_guest = 1'),
      pool.query('SELECT COUNT(*) AS totalAttempts FROM quiz_attempts'),
    ]);

    res.json({
      success: true,
      data: {
        totalQuizzes: Number(totalQuizzes),
        publishedQuizzes: Number(publishedQuizzes),
        totalCategories: Number(totalCategories),
        activeCategories: Number(activeCategories),
        registeredUsers: Number(registeredUsers),
        guestUsers: Number(guestUsers),
        totalUsers: Number(registeredUsers) + Number(guestUsers),
        totalAttempts: Number(totalAttempts),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getRecentAttempts = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        qa.*,
        q.title AS quiz_title, q.slug AS quiz_slug,
        u.username AS user_username, u.email AS user_email, u.is_guest AS user_is_guest
      FROM quiz_attempts qa
      LEFT JOIN quizzes q ON q.id = qa.quiz_id
      LEFT JOIN users u ON u.id = qa.user_id
      ORDER BY qa.completed_at DESC
      LIMIT 10
    `);

    const attempts = rows.map((row) => ({
      ...mapRow(row),
      rewardClaimed: !!row.reward_claimed,
      quiz: { title: row.quiz_title, slug: row.quiz_slug },
      user: row.user_id
        ? { username: row.user_username, email: row.user_email, isGuest: !!row.user_is_guest }
        : null,
    }));

    res.json({ success: true, data: attempts });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getRecentAttempts };
