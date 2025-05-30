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
    it("should return 400 for invalid user ID", async () => {
      req.params = { id: "abc" };

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid user ID provided.",
      });
    });

    it("should return user when user exists", async () => {
      const user = { id: 1, username: "testuser" };
      req.params = { id: 1 };
      mockDbInstance.get.mockResolvedValue(user);

      await userController.getUserById(req, res);

      expect(mockDbInstance.get).toHaveBeenCalledWith(
        "SELECT id, username FROM users WHERE id = ?",
        [1]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it("should return 404 when user not found", async () => {
      req.params = { id: 999 };
      mockDbInstance.get.mockResolvedValue(undefined);

      await userController.getUserById(req, res);

      expect(mockDbInstance.get).toHaveBeenCalledWith(
        "SELECT id, username FROM users WHERE id = ?",
        [999]
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "User with ID 999 not found.",
      });
    });

    it("should call genericErrorHandler on db error", async () => {
      const error = new Error("DB error for getUserById");
      req.params = { id: 1 };
      mockDbInstance.get.mockRejectedValue(error);

      await userController.getUserById(req, res);

      expect(genericErrorHandler).toHaveBeenCalledWith(
        res,
        error,
        "Failed to retrieve user."
      );
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
        message: "User created successfully.",
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
});
