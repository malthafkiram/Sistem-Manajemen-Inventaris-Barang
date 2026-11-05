const express = require("express");
const router = express.Router();
const ItemController = require("../controllers/itemController");
const authentication = require("../middlewares/authentication");
const authorization = require("../middlewares/authorization");

// Middleware Authentication (Semua endpoint CRUD Barang hanya untuk user yang sudah login)
router.use(authentication);

router.get("/", ItemController.getAllItems);
router.get("/:id", ItemController.getItemById);
router.post("/", ItemController.createItem);

// Middleware Authorization dipasang khusus untuk Edit (PUT) dan Delete (Hanya pemilik barang)
router.put("/:id", authorization, ItemController.updateItem);
router.delete("/:id", authorization, ItemController.deleteItem);

module.exports = router;
