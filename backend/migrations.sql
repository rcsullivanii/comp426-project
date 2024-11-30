-- Backup tables
CREATE TABLE IF NOT EXISTS movies_backup AS SELECT * FROM movies;
CREATE TABLE IF NOT EXISTS user_movies_backup AS SELECT * FROM user_movies;

-- Drop existing tables
DROP TABLE IF EXISTS user_movies;
DROP TABLE IF EXISTS movies;

CREATE TABLE movies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tmdb_id INT UNIQUE,
    title VARCHAR(255) NOT NULL,
    overview TEXT,
    poster_path VARCHAR(255),
    vote_average DECIMAL(3,1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_movies (
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, movie_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE
);

-- Drop and recreate user_moods table
DROP TABLE IF EXISTS user_moods;
CREATE TABLE user_moods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mood VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Restore data from backups
INSERT INTO movies (title)
SELECT title FROM movies_backup;

INSERT INTO user_movies (user_id, movie_id)
SELECT user_id, movie_id FROM user_movies_backup;

-- Clean up backup tables
DROP TABLE IF EXISTS movies_backup;
DROP TABLE IF EXISTS user_movies_backup;