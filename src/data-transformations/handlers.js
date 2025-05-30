const genericErrorHandler = (
  res,
  error,
  message = "An unexpected error occurred.",
  statusCode = 500
) => {
  console.error("Error:", error);
  res.status(statusCode).json({ error: message });
};

const errorCheck = [
  {
    check: (err) => err.message.includes("UNIQUE constraint failed"),
    action: (res, err) =>
      genericErrorHandler(res, err, "Username already exists.", 409),
  },
  {
    check: (err) => err.message.includes("CHECK constraint failed"),
    action: (res, err) =>
      genericErrorHandler(res, err, "Username cannot be empty.", 400),
  },
  {
    check: () => true,
    action: (res, err) =>
      genericErrorHandler(res, err, "Failed to create user."),
  },
];

exports.userErrorHandler = (err, res) =>
  errorCheck.find((errorItem) => errorItem.check(err)).action(res, err);

exports.genericErrorHandler;
