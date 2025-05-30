const fs = require("fs");
const path = require("path");
const { connectDB, closeDB } = require("./src/database");

const dbPath = path.resolve(__dirname, "data", "test.db");

beforeAll(async () => {
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  process.env.NODE_ENV = "test";
  await connectDB();
});

afterAll(async () => {
  await closeDB();
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
});
