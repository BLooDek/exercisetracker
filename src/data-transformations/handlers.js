exports.userErrorHandler = (err, res) => {
  const errorCheck = [
    {
      check: (error) => error.message.includes("UNIQUE constraint failed"),
      action: (response) =>
        response.status(409).json({ error: "Username already exists." }),
    },
    {
      check: (error) => error.message.includes("CHECK constraint failed"),
      action: (response) =>
        response.status(400).json({ error: "Username cannot be empty." }),
    },
    {
      check: () => true,
      action: (response) =>
        response.status(500).json({ error: "Failed to create user." }),
    },
  ];
  return errorCheck.find((errorItem) => errorItem.check(err)).action(res);
};
