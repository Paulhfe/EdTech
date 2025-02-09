## Features

### **Admin-Only Features**

- **Add Quiz:** Create a new quiz with a title and a set of questions.
- **Edit Quiz:** Modify an existing quiz by updating questions.
- **Update Quiz:** Append new questions to an existing quiz.
- **Delete Quiz:** Remove a quiz from the system.
- **Fetch All User Scores:** View scores of all users who have taken a quiz.
- **Fetch All Quizzes:** Retrieve a list of available quizzes.

### **User Features**

- **Fetch Single Quiz:** Get details of a specific quiz.
- **Submit Quiz:** Submit answers for evaluation.
- **Fetch User Score:** View a user's score for a specific quiz.

---

## Quiz API Documentation

This API provides functionality for managing quizzes, user authentication, and scoring. It allows admins to create and manage quizzes while enabling users to participate and track their scores.

### **Authentication Endpoints**

#### **Register User**

**Endpoint:** `POST /api/v1/auth/register-user`  
**Description:** Registers a new user.  
**Request Body:**

```json
{
  "username": "JohnDoe",
  "email": "johndoe@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "token": "jwt_token"
}
```

#### **Login User**

**Endpoint:** `POST /api/v1/auth/login-user`  
**Description:** Authenticates a user and returns a JWT token.  
**Request Body:**

```json
{
  "email": "johndoe@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "token": "jwt_token"
}
```

#### **Register Admin**

**Endpoint:** `POST /api/v1/auth/register-admin`  
**Description:** Registers a new admin.  
**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "message": "Registered successfully",
  "token": "jwt_token"
}
```

#### **Login Admin**

**Endpoint:** `POST /api/v1/auth/login-admin`  
**Description:** Authenticates an admin and returns a JWT token.  
**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "token": "jwt_token"
}
```

---

### **Admin-Only Routes**

#### **Add a Quiz**

- **Endpoint:** `POST /api/v1/quiz/`
- **Request Body:**
  ```json
  {
    "title": "Sample Quiz",
    "questions": [
      {
        "question": "What is 2+2?",
        "options": { "A": 3, "B": 2, "C": 5, "D": 4 },
        "correctAnswer": "D"
      }
    ]
  }
  ```
- **Response:**
  ```json
  { "message": "Quiz added", "id": "quizId123" }
  ```

#### **Edit a Quiz**

- **Endpoint:** `PUT /api/v1/quiz/:id`
- **Request Body:** (Replaces all questions)
  ```json
  {
    "questions": [
      {
        "question": "New Question?",
        "options": { "A": "New", "B": "Old", "C": "Fake", "D": "Good" },
        "correctAnswer": "A"
      }
    ]
  }
  ```
- **Response:**
  ```json
  { "message": "Quiz updated" }
  ```

#### **Update a Quiz (Add Questions)**

- **Endpoint:** `PATCH /api/v1/quiz/update/:id`
- **Request Body:** (Appends new questions)
  ```json
  {
    "questions": [
      { "question": "Additional Question?", "correctAnswer": "Answer" }
    ]
  }
  ```
- **Response:**
  ```json
  { "message": "Quiz updated successfully" }
  ```

#### **Delete a Quiz**

- **Endpoint:** `DELETE /api/v1/quiz/:id`
- **Response:**
  ```json
  { "message": "Quiz deleted" }
  ```

---

### **User Routes**

#### **Fetch All Quizzes**

- **Endpoint:** `GET /api/v1/quiz/`
- **Response:**
  ```json
  [
    { "id": "quizId1", "title": "Math Quiz" },
    { "id": "quizId2", "title": "Science Quiz" }
  ]
  ```

#### **Fetch a Single Quiz**

- **Endpoint:** `GET /api/v1/quiz/:id`
- **Response:**
  ```json
  {
    "title": "Math Quiz",
    "questions": [{ "question": "What is 2+2?", "correctAnswer": "4" }]
  }
  ```

#### **Submit a Quiz**

- **Endpoint:** `POST /api/v1/quiz/:id/submit`
- **Request Body:**
  ```json
  {
    "answers": ["A", "B", "C"]
  }
  ```
- **Response:**
  ```json
  {
    "message": "Quiz submitted successfully",
    "score": 2,
    "totalQuestions": 3,
    "percentage": "66.67%"
  }
  ```

#### **Fetch a User's Score**

- **Endpoint for User:** `GET /api/v1/quiz/score/:id`(userId is fetched from token)
- **Endpoint for Admin:** `GET /api/v1/quiz/score/:id/:userId`(userId is fetched from params)
- **Response:**
  ```json
  {
    "title": "Math Quiz",
    "score": 3,
    "totalQuestions": 5
  }
  ```

#### **Fetch All User Scores (Admin Only)**

- **Endpoint:** `GET /api/v1/quiz/all-scores/:id`
- **Response:**
  ```json
  {
    "title": "Math Quiz",
    "scores": [
      { "username": "User1", "score": 4 },
      { "username": "User2", "score": 2 }
    ]
  }
  ```

---
