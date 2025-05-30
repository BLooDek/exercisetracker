const { connectDB, closeDB, getDb } = require("./database");
const path = require("path");
const fs = require("fs");

const TEST_DB_PATH = path.join(__dirname, "..", "data", "test.db");

describe("Database Operations", () => {
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    const dataDir = path.dirname(TEST_DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  });

  beforeEach(async () => {
    await closeDB();

    if (fs.existsSync(TEST_DB_PATH)) {
      await fs.promises.unlink(TEST_DB_PATH);
    }
    await connectDB();
  });

  afterEach(async () => {
    await closeDB();
  });

  afterAll(async () => {
    await closeDB();
    if (fs.existsSync(TEST_DB_PATH)) {
      await fs.promises.unlink(TEST_DB_PATH);
    }
    process.env.NODE_ENV = "development";
  });

  test("should connect to the database and create tables", async () => {
    const db = getDb();
    expect(db).toBeDefined();
    await expect(
      db.run("INSERT INTO users (username) VALUES (?)", ["testuser"])
    ).resolves.toBeDefined();
    const user = await db.get("SELECT * FROM users WHERE username = ?", [
      "testuser",
    ]);
    expect(user).toBeDefined();
    expect(user.username).toBe("testuser");
  });

  test("should insert a user and retrieve it", async () => {
    const db = getDb();
    const username = "anotheruser";
    const { id } = await db.run("INSERT INTO users (username) VALUES (?)", [
      username,
    ]);
    expect(id).toBeDefined();

    const user = await db.get("SELECT * FROM users WHERE id = ?", [id]);
    expect(user).toBeDefined();
    expect(user.username).toBe(username);
  });

  test("should insert an exercise and retrieve it", async () => {
    const db = getDb();
    const username = "exerciseuser";
    const { id: userId } = await db.run(
      "INSERT INTO users (username) VALUES (?)",
      [username]
    );
    expect(userId).toBeDefined();

    const description = "running";
    const duration = 30;
    const date = "2023-01-01";
    const { id: exerciseId } = await db.run(
      "INSERT INTO exercises (user_id, description, duration, date) VALUES (?, ?, ?, ?)",
      [userId, description, duration, date]
    );
    expect(exerciseId).toBeDefined();

    const exercise = await db.get("SELECT * FROM exercises WHERE id = ?", [
      exerciseId,
    ]);
    expect(exercise).toBeDefined();
    expect(exercise.user_id).toBe(userId);
    expect(exercise.description).toBe(description);
    expect(exercise.duration).toBe(duration);
    expect(exercise.date).toBe(date);
  });

  test("should retrieve all users", async () => {
    const db = getDb();
    await db.run("INSERT INTO users (username) VALUES (?)", ["user1"]);
    await db.run("INSERT INTO users (username) VALUES (?)", ["user2"]);

    const users = await db.all("SELECT * FROM users");
    expect(users.length).toBeGreaterThanOrEqual(2);
    expect(users.some((u) => u.username === "user1")).toBe(true);
    expect(users.some((u) => u.username === "user2")).toBe(true);
  });

  test("should retrieve all exercises for a user", async () => {
    const db = getDb();
    const username = "userWithExercises";
    const { id: userId } = await db.run(
      "INSERT INTO users (username) VALUES (?)",
      [username]
    );

    await db.run(
      "INSERT INTO exercises (user_id, description, duration, date) VALUES (?, ?, ?, ?)",
      [userId, "pushups", 20, "2023-01-02"]
    );
    await db.run(
      "INSERT INTO exercises (user_id, description, duration, date) VALUES (?, ?, ?, ?)",
      [userId, "situps", 15, "2023-01-03"]
    );

    const exercises = await db.all(
      "SELECT * FROM exercises WHERE user_id = ?",
      [userId]
    );
    expect(exercises.length).toBe(2);
    expect(exercises.some((e) => e.description === "pushups")).toBe(true);
    expect(exercises.some((e) => e.description === "situps")).toBe(true);
  });
});
