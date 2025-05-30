const { validateExerciseInput } = require("./exerciseValidation");
const { isValidYYYYMMDD } = require("../data-transformations/validators");

describe("exerciseValidation", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe("validateDescription", () => {
    it("should return 400 if description is missing", () => {
      mockReq.body = { duration: 60, date: "2025-05-30" };
      validateExerciseInput(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Description is required.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next if description is provided", () => {
      mockReq.body = {
        description: "running",
        duration: 60,
        date: "2025-05-30",
      };
      validateExerciseInput(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe("validateDuration", () => {
    it("should return 400 if duration is missing", () => {
      mockReq.body = { description: "running", date: "2025-05-30" };
      validateExerciseInput(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Duration is required.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 400 if duration is not a number", () => {
      mockReq.body = {
        description: "running",
        duration: "abc",
        date: "2023-01-01",
      };
      validateExerciseInput(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Duration must be a positive integer.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 400 if duration is not an integer", () => {
      mockReq.body = {
        description: "running",
        duration: 60.5,
        date: "2023-01-01",
      };
      validateExerciseInput(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Duration must be a positive integer.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 400 if duration is not positive", () => {
      mockReq.body = {
        description: "running",
        duration: 0,
        date: "2023-01-01",
      };
      validateExerciseInput(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Duration must be a positive integer.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next if duration is a valid positive integer", () => {
      mockReq.body = {
        description: "running",
        duration: 60,
        date: "2025-05-30",
      };
      validateExerciseInput(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe("validateDate", () => {
    it("should return 400 if date is in invalid format", () => {
      mockReq.body = {
        description: "running",
        duration: 60,
        date: "30-05-2025",
      };
      validateExerciseInput(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Invalid date format. Use YYYY-MM-DD.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should call next if date is in valid YYYY-MM-DD format", () => {
      mockReq.body = {
        description: "running",
        duration: 60,
        date: "2025-05-30",
      };
      validateExerciseInput(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it("should call next if date is not provided", () => {
      mockReq.body = { description: "running", duration: 60 };
      validateExerciseInput(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe("validateExerciseInput middleware", () => {
    it("should call next and set formattedDate if all inputs are valid and date is provided", () => {
      const date = "2025-05-30";
      mockReq.body = { description: "running", duration: 60, date };
      validateExerciseInput(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.body.formattedDate).toBe(date);
    });

    it("should call next and set formattedDate to current date if date is not provided", () => {
      mockReq.body = { description: "running", duration: 60 };
      const mockDate = new Date("2025-05-30T12:00:00.000Z");
      jest.spyOn(global, "Date").mockImplementation(() => mockDate);

      validateExerciseInput(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.body.formattedDate).toBe("2025-05-30");

      global.Date.mockRestore();
    });
  });
});
