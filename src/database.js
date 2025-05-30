const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

let dbInstance = null;

class Database {
  constructor(dbPath) {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Could not connect to database", err);
      } else {
        console.log(`Connected to SQLite database at ${dbPath}`);
      }
    });
  }

  async init() {
    await this.run(
      `
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL CHECK(username != '')
          )
          `
    )
      .then(() => console.log("Users table created or already exists"))
      .catch((err) => console.error("Error creating users table", err));

    await this.run(
      `
          CREATE TABLE IF NOT EXISTS exercises (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            description TEXT NOT NULL,
            duration INTEGER NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
          )
          `
    )
      .then(() => console.log("Exercises table created or already exists"))
      .catch((err) => console.error("Error creating exercises table", err));
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          console.error("Error running sql " + sql);
          console.error(err);
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, result) => {
        if (err) {
          console.error("Error running sql " + sql);
          console.error(err);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error("Error running sql " + sql);
          console.error(err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          console.error("Error closing database", err);
          reject(err);
        } else {
          console.log("Closed the database connection.");
          resolve();
        }
      });
    });
  }
}

const getDbPath = () => {
  const dbFileName = process.env.NODE_ENV === "test" ? "test.db" : "dev.db";
  const dataDir = path.join(__dirname, "..", "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, dbFileName);
};

const connectDB = async () => {
  if (!dbInstance) {
    const dbPath = getDbPath();
    dbInstance = new Database(dbPath);
    await dbInstance.init(); // Initialize tables after connection
  }
  return dbInstance;
};

const closeDB = async () => {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
};

module.exports = { connectDB, closeDB, getDb: () => dbInstance };
