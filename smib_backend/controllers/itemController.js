const { Item, User } = require("../models");

class ItemController {
  // 1. Get All Items (Menampilkan semua daftar barang)
  static async getAllItems(req, res, next) {
    try {
      const items = await Item.findAll({
        include: [
          {
            model: User,
            attributes: ["id", "username", "email"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json(items);
    } catch (error) {
      next(error);
    }
  }

  // 2. Get Item By ID (Menampilkan detail satu barang)
  static async getItemById(req, res, next) {
    try {
      const { id } = req.params;
      const item = await Item.findByPk(id, {
        include: [
          {
            model: User,
            attributes: ["id", "username", "email"],
          },
        ],
      });

      if (!item) {
        throw { name: "NotFound", message: "Data barang tidak ditemukan" };
      }

      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  }

  // 3. Create Item (Menambah barang baru - Membutuhkan Authentication)
  static async createItem(req, res, next) {
    try {
      const { name, description, stock, price } = req.body;
      const userId = req.loginInfo.id;

      const newItem = await Item.create({
        name,
        description,
        stock,
        price,
        userId,
      });

      res.status(201).json({
        message: "Berhasil menambahkan barang baru",
        data: newItem,
      });
    } catch (error) {
      next(error);
    }
  }

  // 4. Update Item (Mengubah data barang - Membutuhkan Authentication & Authorization)
  static async updateItem(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, stock, price } = req.body;

      const item = await Item.findByPk(id);
      if (!item) {
        throw { name: "NotFound", message: "Data barang tidak ditemukan" };
      }

      await item.update({
        name,
        description,
        stock,
        price,
      });

      res.status(200).json({
        message: "Berhasil memperbarui data barang",
        data: item,
      });
    } catch (error) {
      next(error);
    }
  }

  // 5. Delete Item (Menghapus barang - Membutuhkan Authentication & Authorization)
  static async deleteItem(req, res, next) {
    try {
      const { id } = req.params;

      const item = await Item.findByPk(id);
      if (!item) {
        throw { name: "NotFound", message: "Data barang tidak ditemukan" };
      }

      await item.destroy();

      res.status(200).json({
        message: "Barang berhasil dihapus",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ItemController;
