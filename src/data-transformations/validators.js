const isValidYYYYMMDD = (value) => {
  if (typeof value !== "string") return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(value);
  return (
    date instanceof Date &&
    !isNaN(date) &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
};

module.exports = { isValidYYYYMMDD };
