const { buildExerciseLogQuery } = require("./queryBuilders");
const { isValidYYYYMMDD, isNull } = require("./validators");

describe("validateExerciseLogQueryParams", () => {
  it("should return null for valid parameters", () => {
    expect(
      buildExerciseLogQuery(1, "2023-01-01", "2023-01-31", 10)
    ).toBeDefined();
    expect(
      buildExerciseLogQuery(1, "2023-01-01", "2023-01-31", 10).status
    ).toBeUndefined();
  });

  it("should return 400 for invalid 'from' date format", () => {
    const result = buildExerciseLogQuery(1, "invalid-date", null, null);
    expect(result).toEqual({
      status: 400,
      message: "Invalid 'from' date format. Use YYYY-MM-DD.",
    });
  });

  it("should return 400 for invalid 'to' date format", () => {
    const result = buildExerciseLogQuery(1, null, "invalid-date", null);
    expect(result).toEqual({
      status: 400,
      message: "Invalid 'to' date format. Use YYYY-MM-DD.",
    });
  });

  it("should return 400 for invalid limit (NaN)", () => {
    const result = buildExerciseLogQuery(1, null, null, "abc");
    expect(result).toEqual({
      status: 400,
      message: "Limit must be a positive integer.",
    });
  });

  it("should return 400 for invalid limit (zero)", () => {
    const result = buildExerciseLogQuery(1, null, null, 0);
    expect(result).toEqual({
      status: 400,
      message: "Limit must be a positive integer.",
    });
  });

  it("should return 400 for invalid limit (negative)", () => {
    const result = buildExerciseLogQuery(1, null, null, -5);
    expect(result).toEqual({
      status: 400,
      message: "Limit must be a positive integer.",
    });
  });
});

describe("buildExerciseLogQuery", () => {
  it("should build query for userId only", () => {
    const { query, params } = buildExerciseLogQuery(1);
    expect(query).toBe(
      "SELECT id, description, duration, date FROM exercises WHERE user_id = ?"
    );
    expect(params).toEqual([1]);
  });

  it("should build query with 'from' date", () => {
    const { query, params } = buildExerciseLogQuery(1, "2023-01-01");
    expect(query).toBe(
      "SELECT id, description, duration, date FROM exercises WHERE user_id = ? AND date >= ?"
    );
    expect(params).toEqual([1, "2023-01-01"]);
  });

  it("should build query with 'to' date", () => {
    const { query, params } = buildExerciseLogQuery(1, null, "2023-01-31");
    expect(query).toBe(
      "SELECT id, description, duration, date FROM exercises WHERE user_id = ? AND date <= ?"
    );
    expect(params).toEqual([1, "2023-01-31"]);
  });

  it("should build query with 'limit'", () => {
    const { query, params } = buildExerciseLogQuery(1, null, null, 5);
    expect(query).toBe(
      "SELECT id, description, duration, date FROM exercises WHERE user_id = ? LIMIT ?"
    );
    expect(params).toEqual([1, 5]);
  });

  it("should build query with 'from' and 'to' dates", () => {
    const { query, params } = buildExerciseLogQuery(
      1,
      "2023-01-01",
      "2023-01-31"
    );
    expect(query).toBe(
      "SELECT id, description, duration, date FROM exercises WHERE user_id = ? AND date >= ? AND date <= ?"
    );
    expect(params).toEqual([1, "2023-01-01", "2023-01-31"]);
  });

  it("should build query with 'from' date and 'limit'", () => {
    const { query, params } = buildExerciseLogQuery(1, "2023-01-01", null, 5);
    expect(query).toBe(
      "SELECT id, description, duration, date FROM exercises WHERE user_id = ? AND date >= ? LIMIT ?"
    );
    expect(params).toEqual([1, "2023-01-01", 5]);
  });

  it("should build query with 'to' date and 'limit'", () => {
    const { query, params } = buildExerciseLogQuery(1, null, "2023-01-31", 5);
    expect(query).toBe(
      "SELECT id, description, duration, date FROM exercises WHERE user_id = ? AND date <= ? LIMIT ?"
    );
    expect(params).toEqual([1, "2023-01-31", 5]);
  });

  it("should build query with 'from', 'to', and 'limit'", () => {
    const { query, params } = buildExerciseLogQuery(
      1,
      "2023-01-01",
      "2023-01-31",
      10
    );
    expect(query).toBe(
      "SELECT id, description, duration, date FROM exercises WHERE user_id = ? AND date >= ? AND date <= ? LIMIT ?"
    );
    expect(params).toEqual([1, "2023-01-01", "2023-01-31", 10]);
  });
});
