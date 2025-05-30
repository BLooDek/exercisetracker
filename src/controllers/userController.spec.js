const userController = require("./userController");
const {
  genericErrorHandler,
  userErrorHandler,
} = require("../data-transformations/handlers");
const db = require("../database");

jest.mock("../data-transformations/handlers", () => ({
  genericErrorHandler: jest.fn(),
  userErrorHandler: jest.fn(),
}));

jest.mock("../database", () => ({
  all: jest.fn(),
  get: jest.fn(),
  run: jest.fn(),
}));

describe("getAllUsers", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    genericErrorHandler.mockClear();
    userErrorHandler.mockClear();
    db.all.mockClear();
    db.get.mockClear();
    db.run.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return users when users exist", async () => {
    const users = [
      { id: 1, username: "alice" },
      { id: 2, username: "bob" },
    ];
    db.all = jest.fn().mockResolvedValue(users);

    await userController.getAllUsers(req, res);

    expect(db.all).toHaveBeenCalledWith("SELECT id, username FROM users");
    expect(res.json).toHaveBeenCalledWith(users);
    expect(res.status).not.toHaveBeenCalledWith(404);
  });

  it("should return 404 when no users found", async () => {
    db.all = jest.fn().mockResolvedValue([]);

    await userController.getAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "No users found." });
  });

  it("should call genericErrorHandler on db error", async () => {
    const error = new Error("DB error");
    db.all = jest.fn().mockRejectedValue(error);

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
      db.get.mockResolvedValue(user);

      await userController.getUserById(req, res);

      expect(db.get).toHaveBeenCalledWith(
        "SELECT id, username FROM users WHERE id = ?",
        [1]
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it("should return 404 when user not found", async () => {
      req.params = { id: 999 };
      db.get.mockResolvedValue(undefined);

      await userController.getUserById(req, res);

      expect(db.get).toHaveBeenCalledWith(
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
      db.get.mockRejectedValue(error);

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
      db.run.mockResolvedValue(mockResult);

      await userController.createUser(req, res);

      expect(db.run).toHaveBeenCalledWith(
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
      db.run.mockRejectedValue(error);

      await userController.createUser(req, res);

      expect(userErrorHandler).toHaveBeenCalledWith(error, res);
    });
  });
});
