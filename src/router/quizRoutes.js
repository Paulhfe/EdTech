const express = require("express");

const quizRoute = express.Router();

const {
  authenticateAdmin,
  authenticateUser,
} = require("../middleware/authMiddleware");

const {
  addQuiz,
  editQuiz,
  updateQuiz,
  deleteQuiz,
  fetchAllQuizzes,
  fetchQuiz,
  submitQuiz,
  fetchUserScore,
  fetchAllUserScores,
  fetchUserScoreForAdmin,
} = require("../controller/quiz_controller");

// Quiz Management (Admin Only)
quizRoute.post("/", authenticateAdmin, addQuiz);
quizRoute.put("/:id", authenticateAdmin, editQuiz);
quizRoute.patch("/update/:id", authenticateAdmin, updateQuiz);
quizRoute.delete("/:id", authenticateAdmin, deleteQuiz);

// Quiz Access
quizRoute.get("/", authenticateAdmin, fetchAllQuizzes);
quizRoute.get("/:id", fetchQuiz);

// Quiz Submission & Scores
quizRoute.post("/:id/submit", authenticateUser, submitQuiz);

// FetchUserScore for User
quizRoute.get("/score/:id", authenticateUser, fetchUserScore);
// FetchUserScore for Admin
quizRoute.get("/score/:id/:userId", authenticateUser, fetchUserScoreForAdmin);

quizRoute.get("/all-scores/:id", authenticateAdmin, fetchAllUserScores);

module.exports = quizRoute;
