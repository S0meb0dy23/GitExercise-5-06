
-- SQL Setup for Multi-Pet Medical App (server_db)

CREATE DATABASE IF NOT EXISTS server_db;
USE server_db;

-- PETS TABLE (existing)
CREATE TABLE IF NOT EXISTS pets (
  id INT(11) NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) DEFAULT NULL,
  breed VARCHAR(100) DEFAULT NULL,
  age INT(11) DEFAULT NULL,
  weight DECIMAL(5,2) DEFAULT NULL,
  avatar LONGBLOB DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- MEDICAL RECORDS (linked to pets)
CREATE TABLE IF NOT EXISTS medical_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pet_id INT NOT NULL,
  type ENUM('vaccination', 'medication', 'condition') NOT NULL,
  description VARCHAR(255) NOT NULL,
  info VARCHAR(255),
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);

-- WEIGHT RECORDS (linked to pets)
CREATE TABLE IF NOT EXISTS weight_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pet_id INT NOT NULL,
  record_date DATE NOT NULL,
  weight FLOAT NOT NULL,
  UNIQUE(pet_id, record_date),
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);

