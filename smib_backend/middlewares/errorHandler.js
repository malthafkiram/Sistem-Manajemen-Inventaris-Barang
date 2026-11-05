function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || "Internal Server Error";

  // Penanganan Error Sequelize (Validasi & Unique Constraint)
  if (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError"
  ) {
    status = 400;
    message = err.errors.map((el) => el.message);
  }
  // Penanganan Error Token / Autentikasi
  else if (err.name === "JsonWebTokenError" || err.name === "Unauthorized") {
    status = 401;
    message = err.message || "Invalid Token / Unauthorized";
  }
  // Penanganan Error Data Tidak Ditemukan
  else if (err.name === "NotFound") {
    status = 404;
    message = err.message;
  }
  // Penanganan Error Hak Akses Dilarang
  else if (err.name === "Forbidden") {
    status = 403;
    message = err.message;
  }

  res.status(status).json({ message });
}

module.exports = errorHandler;
