const { User } = require("../models");
const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

class UserController {
  // Register User Baru
  static async register(req, res, next) {
    try {
      const { username, email, password } = req.body;

      const newUser = await User.create({ username, email, password });

      res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      });
    } catch (error) {
      next(error);
    }
  }

  // Login User
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email) {
        throw { name: "Unauthorized", message: "Email wajib diisi" };
      }
      if (!password) {
        throw { name: "Unauthorized", message: "Password wajib diisi" };
      }

      // Cari user berdasarkan email
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw { name: "Unauthorized", message: "Email atau password salah" };
      }

      // Cocokkan password menggunakan helper comparePassword
      const isPasswordValid = comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw { name: "Unauthorized", message: "Email atau password salah" };
      }

      // Jika valid, buat token JWT
      const access_token = signToken({
        id: user.id,
        email: user.email,
      });

      res.status(200).json({
        access_token,
        email: user.email,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
