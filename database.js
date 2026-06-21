const Database = require('better-sqlite3');
const path = require('path');

const dbFolder = process.env.RAILWAY_VOLUME_MOUNT_PATH || '.';
const dbPath = path.join(dbFolder, 'bot_data.db');

const db = new Database('database.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS economy (
        userId TEXT,
        guildId TEXT,
        balance INTEGER DEFAULT 0,
        PRIMARY KEY (userId, guildId)
    );

    CREATE TABLE IF NOT EXISTS mod_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT,
        guildId TEXT,
        moderatorId TEXT,
        action TEXT,
        reason TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

module.exports = db;
