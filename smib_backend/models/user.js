"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      this.hasMany(models.Item, { foreignKey: "userId" });
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: {
          args: false,
          msg: "username wajib diisi",
        },
        validate: {
          notNull: {
            msg: "username wajib diisi",
          },
          notEmpty: {
            msg: "username tidak boleh kosong",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: {
          args: false,
          msg: "email wajib diisi",
        },
        unique: {
          args: true,
          msg: "email sudah terdaftar, silahkan daftar menggunakan email lain.",
        },
        validate: {
          notNull: {
            msg: "email wajib diisi",
          },
          notEmpty: {
            msg: "email tidak boleh kosong",
          },
          isEmail: {
            msg: "format email tidak valid",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: { args: false, msg: "password wajib diisi" },
        validate: {
          notEmpty: { msg: "password tidak boleh kosong" },
          notNull: { msg: "password wajib diisi" },
          len: {
            args: [8, 25],
            msg: "password minimal 8 karakter",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "User",
    },
  );
  return User;
};
