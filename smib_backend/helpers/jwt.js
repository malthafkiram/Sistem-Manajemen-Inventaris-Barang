require("dotenv").config();
const jwt = require("jsonwebtoken");
const secret_key = process.env.SECRET_KEY_JWT;

function signToken(payload) {
  return jwt.sign(payload, secret_key);
}

function verifyToken(token) {
  return jwt.verify(token, secret_key);
}

module.exports = { signToken, verifyToken };
