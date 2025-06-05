
CREATE DATABASE IF NOT EXISTS pawpulse;
USE pawpulse;

CREATE TABLE IF NOT EXISTS pets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    breed VARCHAR(100),
    age INT,
    weight DECIMAL(5,2),
    avatar TEXT
);
