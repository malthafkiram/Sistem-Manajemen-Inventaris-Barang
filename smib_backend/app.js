require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const router = require("./routes/index");
const errorHandler = require("./middlewares/errorHandler");
const port = process.env.PORT || 3000;

// middlewares read data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Router User
app.use(router);

// Error Handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
