const { pool, mapRow } = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { signToken, verifyToken } = require('../config/jwt');

// POST /api/users/guest
const createGuest = async (req, res, next) => {
  try {
    const guestToken = crypto.randomUUID();
    const username = `guest_${crypto.randomBytes(4).toString('hex')}`;
    const [result] = await pool.query(
      'INSERT INTO users (username, is_guest, guest_token) VALUES (?, 1, ?)',
      [username, guestToken]
    );
    const [[userRow]] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const token = signToken({ id: userRow.id, username: userRow.username, isGuest: true, role: 'user' });
    res.json({
      success: true,
      data: { token, user: { id: userRow.id, username: userRow.username, isGuest: true } },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/register
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    let userId;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const decoded = verifyToken(authHeader.split(' ')[1]);
        if (decoded.role === 'user' && decoded.isGuest) {
          await pool.query(
            'UPDATE users SET username = ?, email = ?, password = ?, is_guest = 0, guest_token = NULL, updated_at = NOW() WHERE id = ?',
            [username, email, hash, decoded.id]
          );
          userId = decoded.id;
        }
      } catch {
        // Invalid guest token — create fresh account below
      }
    }

    if (!userId) {
      const [result] = await pool.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hash]
      );
      userId = result.insertId;
    }

    const [[userRow]] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    const token = signToken({
      id: userRow.id, username: userRow.username, email: userRow.email, isGuest: false, role: 'user',
    });
    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: userRow.id, username: userRow.username, email: userRow.email, isGuest: false },
      },
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Username or email is already taken' });
    }
    next(err);
  }
};

// POST /api/users/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const [[userRow]] = await pool.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    if (!userRow || userRow.is_guest || !userRow.password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const valid = await bcrypt.compare(password, userRow.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const token = signToken({
      id: userRow.id, username: userRow.username, email: userRow.email, isGuest: false, role: 'user',
    });
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: userRow.id, username: userRow.username, email: userRow.email,
          isGuest: false, totalPoints: userRow.total_points, coins: userRow.coins,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/me
const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const [[userRow]] = await pool.query(
      'SELECT id, username, email, total_points, coins, is_guest, created_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );
    if (!userRow) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({
      success: true,
      data: {
        id: userRow.id,
        username: userRow.username,
        email: userRow.email,
        totalPoints: userRow.total_points,
        coins: userRow.coins,
        isGuest: !!userRow.is_guest,
        createdAt: userRow.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users — admin only
const getAll = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM users WHERE is_guest = 0'
    );

    const [rows] = await pool.query(
      `SELECT id, username, email, total_points, created_at
       FROM users WHERE is_guest = 0
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, skip]
    );

    const users = rows.map((row) => ({
      id: row.id,
      username: row.username,
      email: row.email,
      totalPoints: row.total_points,
      createdAt: row.created_at,
    }));

    res.json({
      success: true,
      data: { users, total: Number(total), page, limit, totalPages: Math.ceil(Number(total) / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/leaderboard
const getLeaderboard = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, username, total_points
       FROM users
       WHERE is_guest = 0 AND total_points > 0
       ORDER BY total_points DESC
       LIMIT 20`
    );
    const users = rows.map((row) => ({
      id: row.id,
      username: row.username,
      totalPoints: row.total_points,
    }));
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

module.exports = { createGuest, register, login, getMe, getAll, getLeaderboard };
