const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { connectDB } = require("./src/database");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const userRoutes = require("./src/routes/userRoutes");
app.use("/api", userRoutes);

const startServer = async () => {
  await connectDB();
  const listener = app.listen(process.env.PORT || 3000, () => {
    console.log("Your app is listening on port " + listener.address().port);
  });
};

startServer();
