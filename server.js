require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { db } = require("./src/services/firebase.js");
const quizRoute = require("./src/router/quizRoutes.js")
const authRoute = require("./src/router/authRoutes.js")

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));


app.use("/api/v1/quiz", quizRoute)
app.use("/api/v1/auth", authRoute);


app.get("/test", async (req, res) => {
  try {
    const testDoc = await db.collection("test").add({ message: "Hello, Firebase!" });
    res.json({ message: "Firestore connected!", docId: testDoc.id });
  } catch (error) {
    res.status(500).json({ message: "Error connecting to Firestore", error: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

