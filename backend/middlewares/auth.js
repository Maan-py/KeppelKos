import jwt from "jsonwebtoken";

export const authenticationToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "Akses ditolak! Token tidak ditemukan",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        status: "error",
        message: "Sesi telah berakhir atau token tidak valid. Silakan login ulang.",
      });
    }

    req.user = decoded;

    next();
  });
};

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({
      status: "error",
      message: "Akses ditolak! Fitur hanya untuk admin",
    });
  }

  next();
};
