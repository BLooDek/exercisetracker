const db = require("../database");
const {
  userErrorHandler,
  genericErrorHandler,
} = require("../data-transformations/handlers");

exports.getAllUsers = (req, res) => {
  db.all("SELECT id, username FROM users")
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
  const id = req.params.id;

  if (isNaN(id) || parseInt(id) != id) {
    return res.status(400).json({ message: "Invalid user ID provided." });
  }

  db.get("SELECT id, username FROM users WHERE id = ?", [id])
    .then((user) =>
      !user
        ? res.status(404).json({ message: `User with ID ${id} not found.` })
        : res.status(200).json(user)
    )
    .catch((error) => {
      genericErrorHandler(res, error, "Failed to retrieve user.");
    });
};

exports.createUser = (req, res) => {
  const { username } = req.body;

  db.run("INSERT INTO users (username) VALUES (?)", [username])
    .then((result) => {
      res.status(201).json({
        message: "User created successfully.",
        id: result.id,
        username: username,
      });
    })
    .catch((error) => {
      userErrorHandler(error, res);
    });
};
