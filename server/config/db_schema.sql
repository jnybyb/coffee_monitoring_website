-- ==========================================================
-- DATABASE INITIALIZATION
-- ==========================================================
CREATE DATABASE IF NOT EXISTS coffee_monitoring;
USE coffee_monitoring;

-- ==========================================================
-- TABLE: admins
-- Stores admin login credentials
-- ==========================================================
CREATE TABLE IF NOT EXISTS admins (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin') DEFAULT 'admin',
  date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- TABLE: beneficiaries
-- Stores the basic information about each beneficiary.
-- ==========================================================
CREATE TABLE IF NOT EXISTS beneficiaries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  beneficiary_id VARCHAR(20) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  gender ENUM('Male', 'Female'),
  marital_status VARCHAR(50),
  birth_date DATE,
  age INT,
  cellphone_number VARCHAR(20),
  province VARCHAR(100),
  municipality VARCHAR(100),
  barangay VARCHAR(100),
  purok VARCHAR(100),
  picture VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==========================================================
-- TABLE: farm_plots
-- Stores farm boundaries (coordinates) per beneficiary.
-- Each plot can have multiple coordinate points.
-- ==========================================================
CREate TABLE IF NOT EXISTS farm_plots (
  plot_id VARCHAR(255) NOT NULL PRIMARY KEY,
  beneficiary_id VARCHAR(255) NOT NULL,
  hectares DECIMAL(10,2),
  FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(beneficiary_id)
    ON DELETE CASCADE
);

-- ==========================================================
-- TABLE: plot_coordinates
-- Stores each (longitude, latitude) pair per plot.
-- A minimum of 4 points defines a boundary.
-- ==========================================================
CREATE TABLE IF NOT EXISTS plot_coordinates (
  coordinate_id INT AUTO_INCREMENT PRIMARY KEY,
  plot_id VARCHAR(255) NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  elevation INT,
  point_order INT,
  FOREIGN KEY (plot_id) REFERENCES farm_plots(plot_id)
    ON DELETE CASCADE
);

-- ==========================================================
-- TABLE: coffee_seedlings
-- Tracks the number of seedlings received and planted.
-- ==========================================================
CREATE TABLE IF NOT EXISTS coffee_seedlings (
  seedling_id INT AUTO_INCREMENT PRIMARY KEY,
  beneficiary_id VARCHAR(255) NOT NULL,
  received_seedling INT DEFAULT 0,
  date_received DATE,
  planted_seedling INT DEFAULT 0,
  plot_id VARCHAR(255),
  date_planting_start DATE,
  date_planting_end DATE,
  FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(beneficiary_id)
    ON DELETE CASCADE,
  FOREIGN KEY (plot_id) REFERENCES farm_plots(plot_id)
    ON DELETE SET NULL
);

-- ==========================================================
-- TABLE: crop_survey_status
-- Records survey data about the crops and their condition.
-- ==========================================================
CREATE TABLE IF NOT EXISTS crop_survey_status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  beneficiary_id VARCHAR(255) NOT NULL,
  plot_id VARCHAR(255),
  surveyer VARCHAR(150),
  survey_date DATE,
  alive_crops INT DEFAULT 0,
  dead_crops INT DEFAULT 0,
  pictures JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(beneficiary_id)
    ON DELETE CASCADE,
  FOREIGN KEY (plot_id) REFERENCES farm_plots(plot_id)
    ON DELETE SET NULL
);

-- ==========================================================
-- TABLE: pictures
-- Stores optional picture metadata (could link to uploads folder).
-- Used for seedlings.
-- Note: Crop status pictures are stored as JSON in the crop_status table.
-- ==========================================================
CREATE TABLE IF NOT EXISTS pictures (
  picture_id INT AUTO_INCREMENT PRIMARY KEY,
  beneficiary_id VARCHAR(255),
  plot_id VARCHAR(255),
  seedling_id INT,
  file_path VARCHAR(255) NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(beneficiary_id)
    ON DELETE CASCADE,
  FOREIGN KEY (plot_id) REFERENCES farm_plots(plot_id)
    ON DELETE CASCADE,
  FOREIGN KEY (seedling_id) REFERENCES coffee_seedlings(seedling_id)
    ON DELETE CASCADE
);