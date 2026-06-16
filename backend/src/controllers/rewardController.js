const { pool } = require('../config/database');

// POST /api/rewards/claim
const claimReward = async (req, res, next) => {
  try {
    const { attemptId, doubled = false } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Login required to claim rewards' });
    }
    if (req.user.isGuest) {
      return res.status(403).json({ success: false, message: 'Create a free account to save your coins' });
    }

    const [[attempt]] = await pool.query(
      `SELECT qa.*, q.reward_coins, q.title AS quiz_title
       FROM quiz_attempts qa
       JOIN quizzes q ON q.id = qa.quiz_id
       WHERE qa.id = ? AND qa.user_id = ?
       LIMIT 1`,
      [Number(attemptId), Number(userId)]
    );

    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }

    if (attempt.reward_claimed) {
      const [[userRow]] = await pool.query('SELECT coins FROM users WHERE id = ? LIMIT 1', [Number(userId)]);
      return res.status(409).json({
        success: false,
        message: 'Reward already claimed',
        data: { alreadyClaimed: true, currentBalance: userRow.coins },
      });
    }

    const baseCoins = Math.round(attempt.score * (attempt.reward_coins || 10) / 10);
    const coinsEarned = doubled ? baseCoins * 2 : baseCoins;
    const type = doubled ? 'double_reward' : 'quiz_reward';
    const description = `${attempt.quiz_title}${doubled ? ' (doubled)' : ''}`;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query('UPDATE users SET coins = coins + ? WHERE id = ?', [coinsEarned, Number(userId)]);
      await conn.query('UPDATE quiz_attempts SET reward_claimed = 1 WHERE id = ?', [Number(attemptId)]);
      await conn.query(
        'INSERT INTO coin_transactions (user_id, amount, type, description, attempt_id) VALUES (?, ?, ?, ?, ?)',
        [Number(userId), coinsEarned, type, description, Number(attemptId)]
      );

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    const [[userRow]] = await pool.query('SELECT coins FROM users WHERE id = ? LIMIT 1', [Number(userId)]);

    res.json({
      success: true,
      data: { coinsEarned, newBalance: userRow.coins, doubled },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { claimReward };
