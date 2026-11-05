const { verifyToken } = require("../helpers/jwt");
const { User } = require("../models/index");

async function authentication(req, res, next) {
  try {
    const { authorization } = req.headers;

    if (!authorization)
      throw { name: "Unauthorized", message: "Token not found" };

    let token = authorization.split(" ")[1];

    let payload = verifyToken(token);

    if (!payload) throw { name: "Unauthorized", message: "Invalid token" };

    // Double Check Payload apakah ada di database
    let user = await User.findOne({ where: { email: payload.email } });

    if (!user) throw { name: "Unauthorized", message: "User not found" };

    req.loginInfo = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authentication;
