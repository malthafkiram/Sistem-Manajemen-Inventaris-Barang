const { Item } = require("../models");

async function authorization(req, res, next) {
  try {
    const itemId = req.params.id;
    const userId = req.loginInfo.id;

    const item = await Item.findByPk(itemId);
    if (!item) {
      throw { name: "NotFound", message: "Data barang tidak ditemukan" };
    }

    // Cek apakah barang ini milik user yang sedang login
    if (item.userId !== userId) {
      throw {
        name: "Forbidden",
        message: "Anda tidak memiliki hak akses untuk melakukan aksi ini",
      };
    }

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authorization;
