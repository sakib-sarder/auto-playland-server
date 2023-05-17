const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AutoPlayland is Running");
});

app.listen(port, () => {
  console.log(`AutoPlayland is running on Port : ${port}`);
});
