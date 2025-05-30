let userController;
let genericErrorHandler;
let userErrorHandler;

jest.mock("../database", () => {
  const mockDb = {
    all: jest.fn(),
    get: jest.fn(),
    run: jest.fn(),
  };
  return {
    getDb: jest.fn(() => mockDb),
    connectDB: jest.fn(),
    closeDB: jest.fn(),
  };
});

jest.mock("../data-transformations/handlers", () => ({
  genericErrorHandler: jest.fn(),
  userErrorHandler: jest.fn(),
}));

describe("getAllUsers", () => {
  let req, res;
  let mockDbInstance;

  beforeAll(() => {
    userController = require("./userController");
    const handlers = require("../data-transformations/handlers");
    genericErrorHandler = handlers.genericErrorHandler;
    userErrorHandler = handlers.userErrorHandler;
    mockDbInstance = require("../database").getDb();
  });

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    genericErrorHandler.mockClear();
    userErrorHandler.mockClear();
    mockDbInstance.all.mockClear();
    mockDbInstance.get.mockClear();
    mockDbInstance.run.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return users when users exist", async () => {
    const users = [
      { id: 1, username: "alice" },
      { id: 2, username: "bob" },
    ];
    mockDbInstance.all.mockResolvedValue(users);

    await userController.getAllUsers(req, res);

    expect(mockDbInstance.all).toHaveBeenCalledWith(
      "SELECT id, username FROM users"
    );
    expect(res.json).toHaveBeenCalledWith(users);
    expect(res.status).not.toHaveBeenCalledWith(404);
  });

  it("should return 404 when no users found", async () => {
    mockDbInstance.all.mockResolvedValue([]);

    await userController.getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "No users found." });
  });

  it("should call genericErrorHandler on db error", async () => {
    const error = new Error("DB error");
    mockDbInstance.all.mockRejectedValue(error);

    await userController.getAllUsers(req, res);

    expect(genericErrorHandler).toHaveBeenCalledWith(
      res,
      error,
      "Failed to retrieve users"
    );
  });

  describe("getUserById", () => {
    it("should return 200 and the user from req.user", async () => {
      const user = { id: 1, username: "testuser" };
      req.user = user; // req.user is set by a preceding middleware

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(user);
    });
  });

  describe("createUser", () => {
    it("should create a new user and return 201", async () => {
      const username = "newuser";
      req.body = { username };
      const mockResult = { id: 3 };
      mockDbInstance.run.mockResolvedValue(mockResult);

      await userController.createUser(req, res);

      expect(mockDbInstance.run).toHaveBeenCalledWith(
        "INSERT INTO users (username) VALUES (?)",
        [username]
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: mockResult.id,
        username: username,
      });
    });

    it("should call userErrorHandler on db error", async () => {
      const error = new Error("DB error for createUser");
      req.body = { username: "erroruser" };
      mockDbInstance.run.mockRejectedValue(error);

      await userController.createUser(req, res);

      expect(userErrorHandler).toHaveBeenCalledWith(error, res);
    });
  });

  describe("addExercise", () => {
    beforeEach(() => {
      req.user = { id: 1 };
    });

    it("should add an exercise with a provided date and return 201", async () => {
      const exerciseData = {
        description: "running",
        duration: 30,
        formattedDate: "2023-01-01",
      };
      req.body = exerciseData;
      const mockResult = { id: 101 };
      mockDbInstance.run.mockResolvedValue(mockResult);

      await userController.addExercise(req, res);

      expect(mockDbInstance.run).toHaveBeenCalledWith(
        "INSERT INTO exercises (user_id, description, duration, date) VALUES (?, ?, ?, ?)",
        [
          req.user.id,
          exerciseData.description,
          exerciseData.duration,
          exerciseData.formattedDate,
        ]
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        userId: req.user.id,
        exerciseId: mockResult.id,
        description: exerciseData.description,
        duration: exerciseData.duration,
        date: exerciseData.formattedDate,
      });
    });

    it("should add an exercise without a provided date (current date used) and return 201", async () => {
      const exerciseData = {
        description: "lifting",
        duration: 60,
      };

      const mockDate = "2024-05-30";
      req.body = { ...exerciseData, formattedDate: mockDate };
      const mockResult = { id: 102 };
      mockDbInstance.run.mockResolvedValue(mockResult);

      await userController.addExercise(req, res);

      expect(mockDbInstance.run).toHaveBeenCalledWith(
        "INSERT INTO exercises (user_id, description, duration, date) VALUES (?, ?, ?, ?)",
        [req.user.id, exerciseData.description, exerciseData.duration, mockDate]
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        userId: req.user.id,
        exerciseId: mockResult.id,
        description: exerciseData.description,
        duration: exerciseData.duration,
        date: mockDate,
      });
    });

    it("should call genericErrorHandler on db error", async () => {
      const error = new Error("DB error for addExercise");
      req.body = {
        description: "swim",
        duration: 45,
        formattedDate: "2023-02-01",
      };
      mockDbInstance.run.mockRejectedValue(error);

      await userController.addExercise(req, res);

      expect(genericErrorHandler).toHaveBeenCalledWith(
        res,
        error,
        "Failed to add exercise."
      );
    });
  });

  describe("getExerciseLog", () => {
    beforeEach(() => {
      req.user = { id: 1 };
      req.params = { _id: 1 };
    });

    it("should return 400 if 'from' date is in invalid format", async () => {
      req.query = { from: "invalid-date" };

      await userController.getExerciseLog(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid 'from' date format. Use YYYY-MM-DD.",
      });
    });

    it("should return 400 if 'to' date is in invalid format", async () => {
      req.query = { to: "another-invalid-date" };

      await userController.getExerciseLog(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid 'to' date format. Use YYYY-MM-DD.",
      });
    });

    it("should return 400 if 'limit' is not a positive integer", async () => {
      req.query = { limit: "abc" };

      await userController.getExerciseLog(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Limit must be a positive integer.",
      });
    });
  });
});
