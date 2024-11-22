const mysql = require('mysql2/promise');
require('dotenv').config();

// Check if environment variables are loaded
console.log('Environment variables:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '(set)' : '(not set)');
console.log('DB_NAME:', process.env.DB_NAME);

async function testConnection() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });
        
        console.log('\nSuccessfully connected to MySQL!');
        await connection.end();
    } catch (error) {
        console.error('\nConnection failed:', error.message);
        
        if (!process.env.DB_PASSWORD) {
            console.error('\nERROR: Password is not set in environment variables');
        }
    }
}

testConnection();