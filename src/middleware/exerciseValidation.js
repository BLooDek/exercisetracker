const {
  isValidYYYYMMDD,
  isNull,
} = require("../data-transformations/validators");

const validateDescription = (description) =>
  !description ? "Description is required." : null;

const validateDuration = (duration) => {
  if (isNull(duration)) {
    return "Duration is required.";
  }

  const checks = [
    isNaN(duration),
    parseInt(duration) != duration,
    parseInt(duration) <= 0,
  ];

  if (checks.some((condition) => condition)) {
    return "Duration must be a positive integer.";
  }

  return null;
};

const validateDate = (date) =>
  date && !isValidYYYYMMDD(date)
    ? "Invalid date format. Use YYYY-MM-DD."
    : null;

const validateExerciseInput = (req, res, next) => {
  const { description, duration, date } = req.body;

  const validationChecks = [
    () => validateDescription(description),
    () => validateDuration(duration),
    () => validateDate(date),
  ];

  for (const checkFn of validationChecks) {
    const errorMsg = checkFn();
    if (errorMsg) {
      return res.status(400).json({ message: errorMsg });
    }
  }

  const exerciseDate = date ? new Date(date) : new Date();

  req.body.formattedDate = exerciseDate.toISOString().split("T")[0];
  next();
};

module.exports = {
  validateExerciseInput,
};
