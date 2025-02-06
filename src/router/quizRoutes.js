const express = require('express')

const quizRoute = express.Router()

const { authenticateAdmin, authenticateUser } = require("../middleware/authMiddleware");

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
} = require("../controller/quiz_controller");

// Quiz Management (Admin Only)
quizRoute.post("/", authenticateAdmin, addQuiz);
quizRoute.put("/:id", authenticateAdmin, editQuiz);
quizRoute.put("/update/:id", authenticateAdmin, updateQuiz);
quizRoute.delete("/:id", authenticateAdmin, deleteQuiz);

// Quiz Access
quizRoute.get("/", fetchAllQuizzes);
quizRoute.get("/:id", fetchQuiz);

// Quiz Submission & Scores
quizRoute.post("/:id/submit", authenticateUser, submitQuiz);
quizRoute.get("/score/:id", authenticateUser, fetchUserScore);
quizRoute.get("/allscores/:id", authenticateAdmin, fetchAllUserScores);

module.exports = quizRoute;