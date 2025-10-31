const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const config = require('./config');

class Database {
  constructor() {
    this.dbPath = path.join(__dirname, config.DATABASE.name);
    this.init();
  }

  init() {
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database');
        this.createTables();
      }
    });
  }

  createTables() {
    // Users table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        username TEXT,
        coins INTEGER DEFAULT 0,
        diamonds INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        exp INTEGER DEFAULT 0,
        last_mine TEXT,
        last_daily TEXT,
        inventory TEXT DEFAULT '{}',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Shop items table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS shop (
        item_id TEXT PRIMARY KEY,
        name TEXT,
        price INTEGER,
        item_type TEXT,
        description TEXT
      )
    `);

    // Insert default shop items
    const defaultItems = [
      ['pickaxe1', 'Basic Pickaxe', 100, 'tool', 'Mining efficiency +10%'],
      ['pickaxe2', 'Iron Pickaxe', 500, 'tool', 'Mining efficiency +25%'],
      ['pickaxe3', 'Diamond Pickaxe', 2000, 'tool', 'Mining efficiency +50%'],
      ['boost1', 'Mining Boost 1H', 300, 'boost', '2x mining for 1 hour'],
      ['boost2', 'Lucky Charm', 800, 'boost', 'Better rewards for 2 hours'],
      ['role1', 'VIP Role', 5000, 'role', 'Exclusive VIP role in server'],
      ['badge1', 'Miner Badge', 1500, 'badge', 'Special miner badge']
    ];

    defaultItems.forEach(item => {
      this.db.run(`
        INSERT OR IGNORE INTO shop (item_id, name, price, item_type, description)
        VALUES (?, ?, ?, ?, ?)
      `, item);
    });
  }

  // User methods
  getUser(userId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE user_id = ?',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else {
            if (row && row.inventory) {
              row.inventory = JSON.parse(row.inventory);
            }
            resolve(row);
          }
        }
      );
    });
  }

  updateUser(userId, username, data) {
    return new Promise((resolve, reject) => {
      this.getUser(userId).then(user => {
        if (user) {
          // Update existing user
          const fields = [];
          const values = [];
          
          Object.keys(data).forEach(key => {
            if (key === 'inventory') {
              fields.push(`${key} = ?`);
              values.push(JSON.stringify(data[key]));
            } else {
              fields.push(`${key} = ?`);
              values.push(data[key]);
            }
          });
          
          values.push(userId);
          
          this.db.run(
            `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`,
            values,
            function(err) {
              if (err) reject(err);
              else resolve(this.changes);
            }
          );
        } else {
          // Insert new user
          const defaultData = {
            user_id: userId,
            username: username,
            coins: 0,
            diamonds: 0,
            level: 1,
            exp: 0,
            last_mine: null,
            last_daily: null,
            inventory: '{}',
            ...data
          };

          if (defaultData.inventory && typeof defaultData.inventory === 'object') {
            defaultData.inventory = JSON.stringify(defaultData.inventory);
          }

          this.db.run(
            `INSERT INTO users (user_id, username, coins, diamonds, level, exp, last_mine, last_daily, inventory)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              defaultData.user_id,
              defaultData.username,
              defaultData.coins,
              defaultData.diamonds,
              defaultData.level,
              defaultData.exp,
              defaultData.last_mine,
              defaultData.last_daily,
              defaultData.inventory
            ],
            function(err) {
              if (err) reject(err);
              else resolve(this.changes);
            }
          );
        }
      }).catch(reject);
    });
  }

  // Shop methods
  getShopItems() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM shop', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  getShopItem(itemId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM shop WHERE item_id = ?',
        [itemId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  // Leaderboard methods
  getLeaderboard(limit = 10) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT username, coins, level, diamonds FROM users ORDER BY coins DESC LIMIT ?',
        [limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = Database;