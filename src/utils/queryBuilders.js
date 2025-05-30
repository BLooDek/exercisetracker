const { isValidYYYYMMDD } = require("../data-transformations/validators");

const buildExerciseLogQuery = (userId, from, to, limit) => {
  const validations = [
    {
      condition: from && !isValidYYYYMMDD(from),
      message: "Invalid 'from' date format. Use YYYY-MM-DD.",
    },
    {
      condition: to && !isValidYYYYMMDD(to),
      message: "Invalid 'to' date format. Use YYYY-MM-DD.",
    },
    {
      condition: limit && (isNaN(parseInt(limit)) || parseInt(limit) <= 0),
      message: "Limit must be a positive integer.",
    },
  ];

  for (const validation of validations) {
    if (validation.condition) {
      return { status: 400, message: validation.message };
    }
  }

  const queryParts = [
    {
      condition: true,
      query:
        "SELECT id, description, duration, date FROM exercises WHERE user_id = ?",
      param: userId,
    },
    { condition: from, query: " AND date >= ?", param: from },
    { condition: to, query: " AND date <= ?", param: to },
    { condition: limit, query: " LIMIT ?", param: parseInt(limit) },
  ];

  const { query, params } = queryParts.reduce(
    (acc, part) => {
      if (part.condition) {
        acc.query += part.query;
        acc.params.push(part.param);
      }
      return acc;
    },
    { query: "", params: [] }
  );

  return { query, params };
};

module.exports = {
  buildExerciseLogQuery,
};
