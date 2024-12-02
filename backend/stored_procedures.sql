USE movie_recommendation_app;

DELIMITER $$

DROP PROCEDURE IF EXISTS `GetUserMovies` $$

CREATE PROCEDURE `GetUserMovies` (
    IN p_user_id INT
)
BEGIN
    SELECT 
        movies.id, 
        movies.title,
        movies.overview,
        movies.poster_path,
        movies.vote_average
    FROM movies
    JOIN user_movies ON movies.id = user_movies.movie_id
    WHERE user_movies.user_id = p_user_id;
END$$

DELIMITER ;