const { db, admin } = require("../services/firebase");

// Add Quiz (Admin Only)
const addQuiz = async (req, res) => {
  try {
    const { title, questions } = req.body;
    const quizRef = await db.collection("quizzes").add({ title, questions });
    res.json({ message: "Quiz added", id: quizRef.id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding quiz", error: error.message });
  }
};

// Edit Quiz - Add or Remove Questions (Admin Only)
const editQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { questions } = req.body;

    const quizRef = db.collection("quizzes").doc(id);
    const quizDoc = await quizRef.get();
    if (!quizDoc.exists)
      return res.status(404).json({ message: "Quiz not found" });

    await quizRef.update({ questions });
    res.json({ message: "Quiz updated" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating quiz", error: error.message });
  }
};

// Middleware to update a quiz by adding new questions
const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { questions } = req.body; // New questions to add

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: "Invalid questions format" });
    }

    const db = admin.firestore();
    const quizRef = db.collection("quizzes").doc(id);
    const quizSnapshot = await quizRef.get();

    if (!quizSnapshot.exists) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const quizData = quizSnapshot.data();
    const updatedQuestions = [...quizData.questions, ...questions]; // Append new questions

    await quizRef.update({ questions: updatedQuestions });

    return res
      .status(200)
      .json({ message: "Quiz updated successfully", updatedQuestions });
  } catch (error) {
    console.error("Error updating quiz:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// Delete Quiz (Admin Only)
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("quizzes").doc(id).delete();
    res.json({ message: "Quiz deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting quiz", error: error.message });
  }
};

// Fetch All Quizzes
const fetchAllQuizzes = async (req, res) => {
  try {
    const snapshot = await db.collection("quizzes").get();
    const quizzes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(quizzes);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching quizzes", error: error.message });
  }
};

// Fetch Single Quiz
const fetchQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const quizDoc = await db.collection("quizzes").doc(id).get();
    if (!quizDoc.exists)
      return res.status(404).json({ message: "Quiz not found" });

    res.json(quizDoc.data());
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching quiz", error: error.message });
  }
};

// Submit Quiz (User)
const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const {answers } = req.body; // User ID and answers

    if (!userId || !answers || typeof answers !== "object") {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const db = admin.firestore();
    const quizRef = db.collection("quizzes").doc(id);
    const userRef = db.collection("users").doc(userId);

    const quizSnapshot = await quizRef.get();
    const userSnapshot = await userRef.get();

    if (!quizSnapshot.exists) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    if (!userSnapshot.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    const quizData = quizSnapshot.data();
    let score = 0;
    const totalQuestions = quizData.questions.length;

    // Check if the user has already taken the quiz
    const userData = userSnapshot.data();
    let quizzesTaken = userData.quizzesTaken || [];
    const quizRecord = quizzesTaken.find((q) => q.id === id);

    if (quizRecord) {
      return res
        .status(400)
        .json({ message: "You have already taken this quiz" });
    }

    // Calculate Score
    quizData.questions.forEach((q, index) => {
      if (answers[index] && answers[index] === q.correctAnswer) {
        score++;
      }
    });

    // Update Quiz Attempts
    const newQuizAttempts = (quizData.quizAttempts || 0) + 1;
    await quizRef.update({ quizAttempts: newQuizAttempts });

    // Update User's Quizzes Taken

    // Add quiz attempt if not already recorded
    if (!quizRecord) {
      quizzesTaken.push({
        id,
        score,
        totalQuestions,
        timestamp: new Date().toISOString(),
      });
    }

    await userRef.update({ quizzesTaken });

    return res.status(200).json({
      message: "Quiz submitted successfully",
      score,
      totalQuestions,
      quizAttempts: newQuizAttempts,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Fetch Scores for a User
const fetchUserScore = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId; // Extract user ID from the authenticated request

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const db = admin.firestore();
    const userRef = db.collection("users").doc(userId);
    const quizRef = db.collection("quizzes").doc(id);

    const userSnapshot = await userRef.get();
    const quizSnapshot = await quizRef.get();

    if (!userSnapshot.exists) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!quizSnapshot.exists) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const userData = userSnapshot.data();
    const quizData = quizSnapshot.data();

    // Find the quiz in the user's taken quizzes
    const quizRecord = userData.quizzesTaken?.find((q) => q.id === id);

    if (!quizRecord) {
      return res.status(404).json({ message: "Quiz not taken by this user" });
    }

    return res.status(200).json({
      quizTitle: quizData.title,
      score: quizRecord.score,
      totalQuestions: quizRecord.totalQuestions,
    });
  } catch (error) {
    console.error("Error fetching user score:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Fetch Scores for All Users (Admin Only)
const fetchAllUserScores = async (req, res) => {
  try {
    const { id } = req.params;

    const db = admin.firestore();
    const usersRef = db.collection("users");
    const quizRef = db.collection("quizzes").doc(id);

    const quizSnapshot = await quizRef.get();
    if (!quizSnapshot.exists) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const quizData = quizSnapshot.data();
    const usersSnapshot = await usersRef.get();

    let scoresList = [];

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const quizRecord = userData.quizzesTaken?.find((q) => q.id === id);

      if (quizRecord) {
        scoresList.push({
          username: userData.username, // Ensure the user has a "username" field in Firestore
          score: quizRecord.score,
        });
      }
    });

    return res.status(200).json({
      quizTitle: quizData.title,
      scores: scoresList,
    });
  } catch (error) {
    console.error("Error fetching all users' scores:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addQuiz,
  editQuiz,
  updateQuiz,
  deleteQuiz,
  fetchAllQuizzes,
  fetchQuiz,
  submitQuiz,
  fetchUserScore,
  fetchAllUserScores,
};
