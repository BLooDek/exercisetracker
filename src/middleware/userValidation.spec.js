const { validateUserExists } = require("./userValidation");
const { getDb } = require("../database");

jest.mock("../database", () => ({
  getDb: jest.fn(),
}));

describe("validateUserExists", () => {
  let mockDb;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockDb = {
      get: jest.fn(),
    };
    getDb.mockReturnValue(mockDb);

    mockReq = {
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if no user ID is provided", async () => {
    mockReq.params = {};
    await validateUserExists(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Invalid user ID provided.",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 400 if an invalid user ID (non-numeric) is provided", async () => {
    mockReq.params = { id: "abc" };
    await validateUserExists(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Invalid user ID provided.",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 400 if an invalid user ID (float) is provided", async () => {
    mockReq.params = { id: "1.5" };
    await validateUserExists(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Invalid user ID provided.",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should return 404 if user is not found", async () => {
    mockReq.params = { id: "1" };
    mockDb.get.mockResolvedValue(null);

    await validateUserExists(mockReq, mockRes, mockNext);

    expect(mockDb.get).toHaveBeenCalledWith(
      "SELECT id, username FROM users WHERE id = ?",
      ["1"]
    );
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User with ID 1 not found.",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should call next and attach user to req if user is found", async () => {
    const user = { id: 1, username: "testuser" };
    mockReq.params = { id: "1" };
    mockDb.get.mockResolvedValue(user);

    await validateUserExists(mockReq, mockRes, mockNext);

    expect(mockDb.get).toHaveBeenCalledWith(
      "SELECT id, username FROM users WHERE id = ?",
      ["1"]
    );
    expect(mockReq.user).toEqual(user);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  it("should handle database errors", async () => {
    const error = new Error("Database connection failed");
    mockReq.params = { id: "1" };
    mockDb.get.mockRejectedValue(error);
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await validateUserExists(mockReq, mockRes, mockNext);

    expect(mockDb.get).toHaveBeenCalledWith(
      "SELECT id, username FROM users WHERE id = ?",
      ["1"]
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Database error in validateUserExists:",
      error
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Internal server error.",
    });
    expect(mockNext).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("should use _id from params if available", async () => {
    const user = { id: 2, username: "anotheruser" };
    mockReq.params = { _id: "2" };
    mockDb.get.mockResolvedValue(user);

    await validateUserExists(mockReq, mockRes, mockNext);

    expect(mockDb.get).toHaveBeenCalledWith(
      "SELECT id, username FROM users WHERE id = ?",
      ["2"]
    );
    expect(mockReq.user).toEqual(user);
    expect(mockNext).toHaveBeenCalled();
  });
});
