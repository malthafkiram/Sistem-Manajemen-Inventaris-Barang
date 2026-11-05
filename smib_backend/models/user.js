"use strict";
const { Model } = require("sequelize");
const { hashPassword } = require("../helpers/bcrypt");
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
        allowNull: false,
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
        allowNull: false,
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
        allowNull: false,
        validate: {
          notEmpty: { msg: "password tidak boleh kosong" },
          notNull: { msg: "password wajib diisi" },
          len: {
            args: [8, 30],
            msg: "password minimal 8 karakter",
          },
          checkPassword(value) {
            const chars = value.split("");

            let hasLetter = false;
            let hasNumber = false;
            let hasSpecialChar = false;

            const symbols = '!@#$%^&*(),.?":{}|<>-';

            chars.forEach((char) => {
              // Cek apakah karakter adalah huruf (bukan angka dan bukan simbol)
              if (char.toLowerCase() !== char.toUpperCase()) {
                hasLetter = true;
              }
              // Cek apakah karakter adalah angka
              else if (!isNaN(char) && char !== " ") {
                hasNumber = true;
              }
              // Cek apakah karakter adalah simbol/karakter unik
              else if (symbols.includes(char)) {
                hasSpecialChar = true;
              }
            });

            if (!hasLetter || !hasNumber || !hasSpecialChar) {
              throw new Error(
                "Password harus mengandung huruf, angka, dan karakter unik",
              );
            }
          },
        },
      },
    },
    {
      hooks: {
        beforeCreate: (user) => {
          user.password = hashPassword(user.password);
        },
      },
      sequelize,
      modelName: "User",
    },
  );
  return User;
};
