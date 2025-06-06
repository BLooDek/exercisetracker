const { isValidYYYYMMDD, isNull } = require("./validators");

const validateExerciseLogQueryParams = (from, to, limit) => {
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
      condition:
        !isNull(limit) && (isNaN(parseInt(limit)) || parseInt(limit) <= 0),
      message: "Limit must be a positive integer.",
    },
  ];

  for (const validation of validations) {
    if (validation.condition) {
      return { status: 400, message: validation.message };
    }
  }
  return null;
};

const buildExerciseLogQuery = (userId, from, to, limit) => {
  const validationError = validateExerciseLogQueryParams(from, to, limit);
  if (validationError) {
    return validationError;
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
    { condition: true, query: " ORDER BY date ASC", param: null },
    { condition: limit, query: " LIMIT ?", param: parseInt(limit) },
  ];

  const { query, params } = queryParts.reduce(
    (acc, { query, param, condition }) => {
      if (condition) {
        acc.query += query;
        acc.params = param ? [...acc.params, param] : acc.params;
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
