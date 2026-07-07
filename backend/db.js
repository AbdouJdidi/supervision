const Database = require('better-sqlite3');
require('dotenv').config();

const db = new Database(process.env.DB_PATH || './database.sqlite');
db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    status TEXT DEFAULT 'UNKNOWN',
    last_checked TEXT
  )
`);

module.exports = db;