require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const { db } = require("./firebase");

// Admin Authentication Middleware
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    const adminRef = db.collection("admins").doc(decoded.uid);
    const adminSnapshot = await adminRef.get();
    if (adminSnapshot.exists) {
      req.admin = {
        adminId: decoded.uid,
        email: decoded.email,
        isAdmin: true,
      };
      next();
    } else {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
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
      req.user = { userId: decoded.uid };
      return next();
    }
  });
};

module.exports = { authenticateAdmin, authenticateUser };
