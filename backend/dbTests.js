const mysql = require('mysql2/promise');
const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:3000';

// Test database setup
async function setupTestDatabase() {
    let connection;
    try {
        console.log('Attempting to connect to MySQL...');
        console.log('Using host:', process.env.DB_HOST || 'localhost');
        console.log('Using user:', process.env.DB_USER || 'root');
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        console.log('Successfully connected to MySQL');

        // Create database
        console.log('Creating database if it doesn\'t exist...');
        await connection.query(`
            CREATE DATABASE IF NOT EXISTS movie_recommendation_app;
        `);
        
        console.log('Switching to movie_recommendation_app database...');
        await connection.query(`USE movie_recommendation_app;`);

        console.log('Creating tables...');
        // Create tables 
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS movies (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tmdb_id INT UNIQUE,
                title VARCHAR(255) NOT NULL,
                overview TEXT,
                poster_path VARCHAR(255),
                vote_average DECIMAL(3,1),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS user_movies (
                user_id INT NOT NULL,
                movie_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, movie_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS user_moods (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                mood VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);

        // Clear existing test data
        console.log('Clearing existing test data...');
        await connection.query(`
            DELETE FROM user_movies;
            DELETE FROM user_moods;
            DELETE FROM users WHERE username LIKE 'testuser%';
            DELETE FROM movies;
        `);

        // Insert test movies
        console.log('Inserting test movies...');
        await connection.query(`
            INSERT INTO movies (title, tmdb_id) VALUES 
                ('The Shawshank Redemption', 278),
                ('The Godfather', 238),
                ('The Dark Knight', 155);
        `);

        // Verify movies inserted
        const [movies] = await connection.query('SELECT * FROM movies');
        console.log('Inserted movies:', movies);

        console.log('Database setup completed successfully');
        return true;
    } catch (error) {
        console.error('Detailed database setup error:', error);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Access denied. Please check your MySQL username and password in .env file');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('Connection refused. Please check if MySQL is running');
        }
        return false;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Test API endpoints
async function testAPI() {
    try {
        console.log('\n=== Starting API Tests ===\n');

        // Store test user credentials
        const testUser = {
            username: `testuser_${Date.now()}`,
            password: 'password123'
        };

        // Test user creation
        console.log('1. Testing user creation...');
        const createUserResponse = await axios.post(`${API_URL}/users`, testUser);
        console.log('User created:', createUserResponse.data);

        // Test login with same credentials
        console.log('\n2. Testing login...');
        const loginResponse = await axios.post(`${API_URL}/login`, testUser);
        console.log('Login successful:', loginResponse.data);

        // Store user ID 
        const userId = createUserResponse.data.userId;

        // Test getting users
        console.log('\n3. Testing get users...');
        const usersResponse = await axios.get(`${API_URL}/users`);
        console.log('Users retrieved:', usersResponse.data);

        // Test getting movies 
        console.log('\n4. Testing get all movies...');
        const moviesResponse = await axios.get(`${API_URL}/movies`);
        console.log('Available movies:', moviesResponse.data);

        // Test adding movie to user's list
        console.log('\n5. Testing adding movie to user...');
        const addMovieResponse = await axios.post(
            `${API_URL}/user/${userId}/movies`,
            { movieId: moviesResponse.data[0].id }
        );
        console.log('Movie added:', addMovieResponse.data);

        // Test getting user's movies
        console.log('\n6. Testing get user movies...');
        const userMoviesResponse = await axios.get(
            `${API_URL}/user/${userId}/movies`
        );
        console.log('User movies:', userMoviesResponse.data);

        console.log('\n=== All tests completed successfully ===');
    } catch (error) {
        console.error('\nTest failed:', {
            message: error.response?.data?.message || error.message,
            status: error.response?.status,
            endpoint: error.config?.url,
            method: error.config?.method,
            data: error.config?.data
        });
    }
}

// Run all tests
async function runTests() {
    console.log('Setting up test database...');
    const dbSetupSuccess = await setupTestDatabase();
    
    if (dbSetupSuccess) {
        console.log('\nStarting API tests...');
        await testAPI();
    } else {
        console.log('Skipping API tests due to database setup failure');
    }
}

// Execute tests
runTests();