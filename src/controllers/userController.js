const { getDb } = require("../database");
const {
  userErrorHandler,
  genericErrorHandler,
} = require("../data-transformations/handlers");
const { buildExerciseLogQuery } = require("../utils/queryBuilders");

exports.getAllUsers = (req, res) => {
  const db = getDb();
  return db
    .all("SELECT id, username FROM users")
    .then((users) =>
      users.length === 0
        ? res.status(404).json({ message: "No users found." })
        : res.json(users)
    )
    .catch((error) => {
      genericErrorHandler(res, error, "Failed to retrieve users");
    });
};

exports.getUserById = (req, res) => {
  const user = req.user;
  return res.status(200).json(user);
};

exports.createUser = (req, res) => {
  const db = getDb();
  const { username } = req.body;

  return db
    .run("INSERT INTO users (username) VALUES (?)", [username])
    .then((result) => {
      res.status(201).json({
        id: result.id,
        username: username,
      });
    })
    .catch((error) => {
      userErrorHandler(error, res);
    });
};

exports.addExercise = (req, res) => {
  const db = getDb();
  const { description, duration, formattedDate } = req.body;
  const userId = req.user.id;
  return db
    .run(
      "INSERT INTO exercises (user_id, description, duration, date) VALUES (?, ?, ?, ?)",
      [userId, description, duration, formattedDate]
    )
    .then(({ id }) => {
      res.status(201).json({
        userId,
        exerciseId: id,
        description,
        duration,
        date: formattedDate,
      });
    })
    .catch((error) => {
      genericErrorHandler(res, error, "Failed to add exercise.");
    });
};

exports.getExerciseLog = (req, res) => {
  const db = getDb();
  const { from, to, limit } = req.query;
  const userId = req.user.id;

  const queryResult = buildExerciseLogQuery(userId, from, to, limit);

  if (queryResult.status) {
    return res
      .status(queryResult.status)
      .json({ message: queryResult.message });
  }

  const { query, params } = queryResult;

  const countQuery = query.replace(
    "SELECT id, description, duration, date",
    "SELECT COUNT(*)"
  );

  return db
    .get(countQuery, params)
    .then((countResult) => {
      const count = countResult["COUNT(*)"];

      return db
        .all(query, params)
        .then((exercises) => {
          const log = exercises.map(({ id, description, duration, date }) => ({
            id,
            description,
            duration,
            date,
          }));

          res.status(200).json({
            count: count,
            log: log,
          });
        })
        .catch((error) => {
          genericErrorHandler(res, error, "Failed to retrieve exercise log.");
        });
    })
    .catch((error) => {
      genericErrorHandler(res, error, "Failed to count exercises.");
    });
};
