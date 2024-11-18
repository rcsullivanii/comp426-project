const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "movie_recommendation_app",
  /**
    +------------------------------------+
    | Tables_in_movie_recommendation_app |
    +------------------------------------+
    | movies                             |
    | user_movies                        |
    | users                              |
    +------------------------------------+

    users
    +----------+--------------+------+-----+---------+----------------+
    | Field    | Type         | Null | Key | Default | Extra          |
    +----------+--------------+------+-----+---------+----------------+
    | id       | int          | NO   | PRI | NULL    | auto_increment |
    | username | varchar(255) | NO   | UNI | NULL    |                |
    | password | varchar(255) | NO   |     | NULL    |                |
    +----------+--------------+------+-----+---------+----------------+

    movies
    +-------+--------------+------+-----+---------+----------------+
    | Field | Type         | Null | Key | Default | Extra          |
    +-------+--------------+------+-----+---------+----------------+
    | id    | int          | NO   | PRI | NULL    | auto_increment |
    | title | varchar(255) | NO   | UNI | NULL    |                |
    +-------+--------------+------+-----+---------+----------------+

    user_movies
    +----------+------+------+-----+---------+-------+
    | Field    | Type | Null | Key | Default | Extra |
    +----------+------+------+-----+---------+-------+
    | user_id  | int  | NO   | PRI | NULL    |       |
    | movie_id | int  | NO   | PRI | NULL    |       |
    +----------+------+------+-----+---------+-------+
  **/
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to MySQL database.");
});

// Authenticate user
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const query = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(query, [username, password], (err, results) => {
    if (err) {
      res.status(500).send({ message: "Error querying database." });
    } else if (results.length > 0) {
      res.status(200).send({ message: "Login successful.", user: results[0] });
    } else {
      res.status(401).send({ message: "Invalid credentials." });
    }
  });
});

// Create a new user
app.post("/users", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .send({ message: "Username and password are required." });
  }

  const query = "INSERT INTO users (username, password) VALUES (?, ?)";
  db.query(query, [username, password], (err, results) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        res.status(400).send({ message: "Username already exists." });
      } else {
        res.status(500).send({ message: "Error creating user." });
      }
    } else {
      res
        .status(201)
        .send({
          message: "User created successfully.",
          userId: results.insertId,
        });
    }
  });
});

// Get list of all users
app.get("/users", (req, res) => {
  const query = "SELECT id, username FROM users";
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).send({ message: "Error fetching users." });
    } else {
      res.status(200).send(results);
    }
  });
});

// Fetch list of user's movies
app.get("/user/:id/movies", (req, res) => {
  const userId = req.params.id;
  const query = `
      SELECT movies.title
      FROM movies
      JOIN user_movies ON movies.id = user_movies.movie_id
      WHERE user_movies.user_id = ?`;
  db.query(query, [userId], (err, results) => {
    if (err) {
      res.status(500).send({ message: "Error querying database." });
    } else {
      res.status(200).send(results);
    }
  });
});

// Add movie to user's list
app.post("/user/:id/movies", (req, res) => {
  const userId = req.params.id;
  const { movieId } = req.body;
  const query = "INSERT INTO user_movies (user_id, movie_id) VALUES (?, ?)";
  db.query(query, [userId, movieId], (err, results) => {
    if (err) {
      res.status(500).send({ message: "Error inserting data." });
    } else {
      res.status(201).send({ message: "Movie added successfully." });
    }
  });
});

// Start Server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
