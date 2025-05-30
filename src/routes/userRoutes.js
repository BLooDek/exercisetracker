const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { validateExerciseInput } = require("../middleware/exerciseValidation");
const { validateUserExists } = require("../middleware/userValidation");

router.get("/users", userController.getAllUsers);
router.post("/users", userController.createUser);
router.get("/users/:id", validateUserExists, userController.getUserById);
router.post(
  "/users/:_id/exercises",
  validateUserExists,
  validateExerciseInput,
  userController.addExercise
);
router.get(
  "/users/:_id/logs",
  validateUserExists,
  userController.getExerciseLog
);

module.exports = router;
