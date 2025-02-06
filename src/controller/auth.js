require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db, auth } = require("../services/firebase");

const JWT_SECRET = process.env.JWT_SECRET;
const adminsCollection = db.collection("admins");
const usersCollection = db.collection("users");

// Function to generate JWT Token
const generateToken = (uid, email) => {
  return jwt.sign({ uid, email }, JWT_SECRET, { expiresIn: "2h" });
};

// Register Admin
const registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create an admin user in Firebase Authentication
    const userRecord = await auth.createUser({ email, password });
    
    // Store the admin details in Firestore
    await adminsCollection
      .doc(userRecord.uid)
      .set({ email, password: hashedPassword });

    // Generate a JWT token for the new admin
    const token = generateToken(userRecord.uid, email);
    res.json({ message: "Admin registered", token });
  } catch (error) {
    res.status(500).json({ message: "Error registering admin", error: error.message });
  }
};

// Admin Login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Retrieve the admin record from Firestore
    const adminDoc = await adminsCollection.where("email", "==", email).get();

    if (adminDoc.empty)
      return res.status(401).json({ message: "Admin not found" });

    const adminData = adminDoc.docs[0].data();
    
    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, adminData.password);

    if (!passwordMatch)
      return res.status(401).json({ message: "Incorrect password" });

    // Generate a JWT token for the admin
    const token = generateToken(adminDoc.docs[0].id, email);
    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// Register User
const registerUser = async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a user in Firebase Authentication
    const userRecord = await auth.createUser({ email, password });
    
    // Store the user details in Firestore
    await usersCollection
      .doc(userRecord.uid)
      .set({ email, username, password: hashedPassword, scores: [] });

    // Generate a JWT token for the new user
    const token = generateToken(userRecord.uid, email);
    res.json({ message: "User registered", token });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// User Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Retrieve the user record from Firestore
    const userDoc = await usersCollection.where("email", "==", email).get();

    if (userDoc.empty)
      return res.status(401).json({ message: "User not found" });

    const userData = userDoc.docs[0].data();
    
    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, userData.password);

    if (!passwordMatch)
      return res.status(401).json({ message: "Incorrect password" });

    // Generate a JWT token for the user
    const token = generateToken(userDoc.docs[0].id, email);
    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

// Export the authentication functions
module.exports = { registerAdmin, loginAdmin, registerUser, loginUser };
