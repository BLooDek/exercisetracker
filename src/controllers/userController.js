const db = require("../database"); // Adjust path as needed
const userErrorHandler = require("../data-transformations/handlers");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await db.all("SELECT id, username FROM users");
    if (users.length === 0) {
      res.status(404).json({ message: "No users found." });
    } else {
      res.json(users);
    }
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({ error: "Failed to retrieve users" });
  }
};

exports.getUserById = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await db.get("SELECT id, username FROM users WHERE id = ?", [
      id,
    ]);
    if (!user) {
      return res.status(404).json({ message: `User with ID ${id} not found.` });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(`Error retrieving user with ID ${id}:`, error);
    res.status(500).json({ error: "Failed to retrieve user." });
  }
};

exports.createUser = async (req, res) => {
  const { username } = req.body;

  try {
    const result = await db.run("INSERT INTO users (username) VALUES (?)", [
      username,
    ]);
    res.status(201).json({
      message: "User created successfully.",
      id: result.id,
      username: username,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    userErrorHandler(error, res);
  }
};
