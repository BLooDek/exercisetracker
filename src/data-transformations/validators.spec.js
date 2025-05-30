const { isValidYYYYMMDD } = require("./validators");

describe("isValidYYYYMMDD", () => {
  test("should return true for a valid YYYY-MM-DD date", () => {
    expect(isValidYYYYMMDD("2023-01-15")).toBe(true);
    expect(isValidYYYYMMDD("1999-12-31")).toBe(true);
    expect(isValidYYYYMMDD("2000-02-29")).toBe(true);
  });

  test("should return false for invalid date formats", () => {
    expect(isValidYYYYMMDD("2023/01/15")).toBe(false);
    expect(isValidYYYYMMDD("2023-1-15")).toBe(false);
    expect(isValidYYYYMMDD("2023-01-5")).toBe(false);
    expect(isValidYYYYMMDD("2023-1-05")).toBe(false);
    expect(isValidYYYYMMDD("23-01-15")).toBe(false);
    expect(isValidYYYYMMDD("20230115")).toBe(false);
    expect(isValidYYYYMMDD("2023-01-15 ")).toBe(false);
    expect(isValidYYYYMMDD(" 2023-01-15")).toBe(false);
  });

  test("should return false for non-existent dates", () => {
    expect(isValidYYYYMMDD("2023-02-30")).toBe(false);
    expect(isValidYYYYMMDD("2023-04-31")).toBe(false);
    expect(isValidYYYYMMDD("2023-13-01")).toBe(false);
    expect(isValidYYYYMMDD("2023-01-32")).toBe(false);
    expect(isValidYYYYMMDD("2023-00-01")).toBe(false);
    expect(isValidYYYYMMDD("2023-01-00")).toBe(false);
  });

  test("should return false for non-string inputs", () => {
    expect(isValidYYYYMMDD(12345678)).toBe(false);
    expect(isValidYYYYMMDD(null)).toBe(false);
    expect(isValidYYYYMMDD(undefined)).toBe(false);
    expect(isValidYYYYMMDD({})).toBe(false);
    expect(isValidYYYYMMDD([])).toBe(false);
  });
});
