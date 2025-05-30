const { isValidYYYYMMDD } = require("../data-transformations/validators");

const validateDescription = (description) =>
  !description ? "Description is required." : null;

const validateDuration = (duration) => {
  if (duration === null || duration === undefined) {
    return "Duration is required.";
  }
  if (
    isNaN(duration) ||
    parseInt(duration) != duration ||
    parseInt(duration) <= 0
  ) {
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
    {
      check: () => validateDescription(description),
      action: (errorMsg) => res.status(400).json({ message: errorMsg }),
    },
    {
      check: () => validateDuration(duration),
      action: (errorMsg) => res.status(400).json({ message: errorMsg }),
    },
    {
      check: () => validateDate(date),
      action: (errorMsg) => res.status(400).json({ message: errorMsg }),
    },
  ];

  for (const validation of validationChecks) {
    const errorMsg = validation.check();
    if (errorMsg) {
      return validation.action(errorMsg);
    }
  }

  const exerciseDate = date ? new Date(date) : new Date();

  req.body.formattedDate = exerciseDate.toISOString().split("T")[0];
  next();
};

module.exports = {
  validateExerciseInput,
};
