const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const toCamel = (str) => str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

const mapRow = (row) => {
  if (!row) return null;
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [toCamel(k), v]));
};

const mapRows = (rows) => rows.map(mapRow);

module.exports = { pool, mapRow, mapRows };
