const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// MySQL Connection
// Update the following details to match your MySQL configuration
const db = mysql.createConnection({
  host: "localhost", // Change "localhost" to your MySQL server's IP address or hostname if it's hosted remotely
  user: "root", // Replace "root" with your MySQL username
  password: "password", // Replace "password" with your MySQL password
  database: "movie_recommendation_app", // Replace with your desired database name
  /**
   * To set up your own session:
   * 1. Ensure you have MySQL installed on your machine.
   *    - If not, download and install it from https://dev.mysql.com/downloads/.
   *
   * 2. Create a new database in MySQL:
   *    - Run the following SQL command in the MySQL CLI or a GUI tool (e.g., MySQL Workbench):
   *      CREATE DATABASE movie_recommendation_app;
   *
   * 3. Create the necessary tables in the database:
   *    - Copy the table schema and execute these commands:
   *
   *      CREATE TABLE users (
   *        id INT AUTO_INCREMENT PRIMARY KEY,
   *        username VARCHAR(255) NOT NULL UNIQUE,
   *        password VARCHAR(255) NOT NULL
   *      );
   *
   *      CREATE TABLE movies (
   *        id INT AUTO_INCREMENT PRIMARY KEY,
   *        title VARCHAR(255) NOT NULL UNIQUE
   *      );
   *
   *      CREATE TABLE user_movies (
   *        user_id INT NOT NULL,
   *        movie_id INT NOT NULL,
   *        PRIMARY KEY (user_id, movie_id),
   *        FOREIGN KEY (user_id) REFERENCES users(id),
   *        FOREIGN KEY (movie_id) REFERENCES movies(id)
   *      );
   *
   * 4. Update the "host", "user", "password", and "database" fields above to match your MySQL configuration.
   *    - If you're hosting MySQL remotely, replace "localhost" with the remote server's IP address or hostname.
   *
   * 5. Start your MySQL server and test the connection:
   *    - If you're using a local MySQL server, ensure it's running.
   *    - Run this Node.js application to verify the connection works.
   *
   * 6. To allow others to connect to your database:
   *    - Ensure the MySQL server allows remote connections.
   *    - Update the `host` field to the IP address or hostname where your MySQL server is accessible.
   */
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to MySQL database.");
});

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
      res.status(201).send({
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
