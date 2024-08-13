const mysql = require('mysql2/promise');

require('dotenv').config()

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,  // Number of connections in the pool
  queueLimit: 0
});

module.exports = db
