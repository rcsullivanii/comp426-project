const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// MySQL Connection Pool 
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'movie_recommendation_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware to check if database is connected
const checkDbConnection = (req, res, next) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Database connection failed:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
    connection.release();
    next();
  });
};

// Apply database connection check to all routes
app.use(checkDbConnection);

// Authenticate user with password hashing
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const [users] = await pool.promise().query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    const user = users[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({ message: "Login successful", user: userWithoutPassword });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create a new user with password hashing
app.post("/users", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.promise().query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword]
    );

    res.status(201).json({
      message: "User created successfully",
      userId: result.insertId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: "Username already exists" });
    }
    console.error("User creation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get list of all users 
app.get("/users", async (req, res) => {
  try {
    const [users] = await pool.promise().query(
      "SELECT id, username FROM users"
    );
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Fetch list of user's movies
app.get("/user/:id/movies", async (req, res) => {
  try {
    const userId = req.params.id;
    const [movies] = await pool.promise().query(`
      SELECT movies.id, movies.title
      FROM movies
      JOIN user_movies ON movies.id = user_movies.movie_id
      WHERE user_movies.user_id = ?
    `, [userId]);
    
    res.status(200).json(movies);
  } catch (error) {
    console.error("Error fetching user movies:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add movie to user's list with duplicate check
app.post("/user/:id/movies", async (req, res) => {
  try {
    const userId = req.params.id;
    const { movieId } = req.body;

    if (!movieId) {
      return res.status(400).json({ message: "Movie ID is required" });
    }

    // Check if movie exists
    const [movies] = await pool.promise().query(
      "SELECT id FROM movies WHERE id = ?",
      [movieId]
    );

    if (movies.length === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Check for existing entry
    const [existing] = await pool.promise().query(
      "SELECT * FROM user_movies WHERE user_id = ? AND movie_id = ?",
      [userId, movieId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Movie already in user's list" });
    }

    await pool.promise().query(
      "INSERT INTO user_movies (user_id, movie_id) VALUES (?, ?)",
      [userId, movieId]
    );

    res.status(201).json({ message: "Movie added successfully" });
  } catch (error) {
    console.error("Error adding movie to user list:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all movies
app.get("/movies", async (req, res) => {
  try {
      const [movies] = await pool.promise().query("SELECT * FROM movies");
      res.status(200).json(movies);
  } catch (error) {
      console.error("Error fetching movies:", error);
      res.status(500).json({ message: "Internal server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// shutdown
process.on('SIGTERM', () => {
  pool.end((err) => {
    if (err) {
      console.error('Error closing MySQL pool:', err);
    }
    process.exit(err ? 1 : 0);
  });
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

