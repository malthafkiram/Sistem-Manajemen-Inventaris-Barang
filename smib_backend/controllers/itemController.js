const { Item, User } = require("../models");
const { Op } = require("sequelize");

class ItemController {
  // 1. Get All Items (Menampilkan daftar barang dengan fitur search & pagination)
  static async getAllItems(req, res, next) {
    try {
      const { search, page, limit } = req.query;

      const whereClause = {};
      if (search && search.trim() !== "") {
        whereClause.name = {
          [Op.iLike]: `%${search.trim()}%`,
        };
      }

      const pageNumber = page ? Math.max(1, parseInt(page, 10) || 1) : 1;
      const limitNumber = limit ? Math.max(1, parseInt(limit, 10) || 10) : 10;
      const offset = (pageNumber - 1) * limitNumber;

      const { count, rows: items } = await Item.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            attributes: ["id", "username", "email"],
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: limitNumber,
        offset: offset,
      });

      res.status(200).json({
        totalItems: count,
        totalPages: Math.ceil(count / limitNumber),
        currentPage: pageNumber,
        limit: limitNumber,
        data: items,
      });
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
