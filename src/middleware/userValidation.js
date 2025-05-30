const { getDb } = require("../database");

const validateUserExists = (req, res, next) => {
  const db = getDb();
  const userId = req.params._id || req.params.id;

  if (!userId || isNaN(userId) || parseInt(userId) != userId) {
    return res.status(400).json({ message: "Invalid user ID provided." });
  }

  return db
    .get("SELECT id, username FROM users WHERE id = ?", [userId])
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .json({ message: `User with ID ${userId} not found.` });
      }
      req.user = user;
      next();
    })
    .catch((error) => {
      console.error("Database error in validateUserExists:", error);
      res.status(500).json({ message: "Internal server error." });
    });
};

module.exports = {
  validateUserExists,
};
