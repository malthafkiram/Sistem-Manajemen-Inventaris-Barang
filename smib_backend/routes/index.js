const express = require("express");
const router = express.Router();

const userRouter = require("./user");
const itemRouter = require("./item");

router.use("/", userRouter);
router.use("/items", itemRouter);

module.exports = router;
