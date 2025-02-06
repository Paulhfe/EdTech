require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// Admin Authentication Middleware
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
  

    req.admin = { adminId: decoded.uid, email: decoded.email, isAdmin: true };
    next();
  });
};

// User Authentication Middleware
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    if (decoded.isAdmin) {
      // If Admin, proceed as admin
      req.admin = { adminId: decoded.uid, email: decoded.email, isAdmin: true };
      return next();
    } else if (decoded.uid) {
      // If normal user, proceed as user
      req.user = { userId: decoded.uid, email: decoded.email };
      return next();
    }
    return res.status(403).json({ message: "Invalid token payload" });
  });
};

module.exports = { authenticateAdmin, authenticateUser };