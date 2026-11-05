"use strict";
const { Model } = require("sequelize");
const { FOREIGNKEYS } = require("sequelize/lib/query-types");
module.exports = (sequelize, DataTypes) => {
  class Item extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  Item.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Nama barang tidak boleh kosong" },
          notNull: { msg: "Nama barang wajib diisi" },
        },
      },
      description: DataTypes.TEXT,
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Stok wajib diisi" },
          min: {
            args: [0],
            msg: "Stok tidak boleh bernilai negatif",
          },
        },
      },
      price: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "Harga wajib diisi" },
          min: {
            args: [0],
            msg: "Harga tidak boleh negatif",
          },
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "userId wajib diisi" },
        },
      },
    },
    {
      sequelize,
      modelName: "Item",
    },
  );
  return Item;
};
