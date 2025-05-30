const { genericErrorHandler, userErrorHandler } = require("./handlers");

describe("genericErrorHandler", () => {
  let mockRes;
  let consoleErrorSpy;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test("should send a 500 status and default message if no message or status code is provided", () => {
    const error = new Error("Test error");
    genericErrorHandler(mockRes, error);

    expect(consoleErrorSpy).toHaveBeenCalledWith("Error:", error);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "An unexpected error occurred.",
    });
  });

  test("should send a custom status and message if provided", () => {
    const error = new Error("Custom error");
    const message = "Something went wrong!";
    const statusCode = 404;
    genericErrorHandler(mockRes, error, message, statusCode);

    expect(consoleErrorSpy).toHaveBeenCalledWith("Error:", error);
    expect(mockRes.status).toHaveBeenCalledWith(statusCode);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: message,
    });
  });

  test("should log the error to console.error", () => {
    const error = new Error("Another test error");
    genericErrorHandler(mockRes, error);

    expect(consoleErrorSpy).toHaveBeenCalledWith("Error:", error);
  });
});

describe("userErrorHandler", () => {
  let mockRes;
  let consoleErrorSpy;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test("should handle UNIQUE constraint failed error", () => {
    const error = new Error("SQLITE_CONSTRAINT: UNIQUE constraint failed");
    userErrorHandler(error, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Username already exists.",
    });
  });

  test("should handle CHECK constraint failed error", () => {
    const error = new Error("SQLITE_CONSTRAINT: CHECK constraint failed");
    userErrorHandler(error, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Username cannot be empty.",
    });
  });

  test("should handle generic error if no specific constraint matches", () => {
    const error = new Error("Some other database error");
    userErrorHandler(error, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Failed to create user.",
    });
  });
});
