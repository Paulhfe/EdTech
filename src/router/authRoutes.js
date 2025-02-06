const express = require("express");
const authRoute = express.Router();
const {
  registerAdmin,
  loginAdmin,
  registerUser,
  loginUser,
} = require("../controller/auth.js"); 

// Authentication Routes
authRoute.post("/register-admin", registerAdmin);
authRoute.post("/login-admin", loginAdmin);
authRoute.post("/register-user", registerUser);
authRoute.post("/login-user", loginUser);

module.exports = authRoute;
