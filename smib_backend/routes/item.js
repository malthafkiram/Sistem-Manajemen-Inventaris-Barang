const express = require("express");
const router = express.Router();
const ItemController = require("../controllers/itemController");
const authentication = require("../middlewares/authentication");
const authorization = require("../middlewares/authorization");

// Public route
router.get("/", ItemController.getAllItems);
router.get("/:id", ItemController.getItemById);

// Middleware Authentication
router.use(authentication);

router.post("/", ItemController.createItem);

// Middleware Authorization dipasang khusus untuk Edit (PUT) dan Delete
router.put("/:id", authorization, ItemController.updateItem);
router.delete("/:id", authorization, ItemController.deleteItem);

module.exports = router;
