CREATE DATABASE IF NOT EXISTS coffee_monitoring;

USE coffee_monitoring;

-- Admin users table for authentication and authorization
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin') NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin login logs table for tracking authentication activities
CREATE TABLE IF NOT EXISTS admin_login_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_user_id INT NOT NULL,
  login_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  failure_reason VARCHAR(255) NULL,
  INDEX idx_admin_login_logs_admin_user_id (admin_user_id),
  INDEX idx_admin_login_logs_login_timestamp (login_timestamp),
  INDEX idx_admin_login_logs_success (success),
  FOREIGN KEY (admin_user_id) REFERENCES admins(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS beneficiary_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  beneficiary_id VARCHAR(20) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NOT NULL,
  purok VARCHAR(100) NOT NULL,
  barangay VARCHAR(100) NOT NULL,
  municipality VARCHAR(100) NOT NULL,
  province VARCHAR(100) NOT NULL,
  gender ENUM('Male', 'Female') NOT NULL,
  birth_date DATE NOT NULL,
  age TINYINT UNSIGNED NULL,
  marital_status ENUM('Single', 'Married', 'Widowed', 'Divorced', 'Separated') NOT NULL,
  cellphone VARCHAR(15) NOT NULL,
  picture VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seedling_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  beneficiary_id VARCHAR(20) NOT NULL,
  received INT NOT NULL,
  date_received DATE NOT NULL,
  planted INT NOT NULL,
  date_of_planting DATE NOT NULL,
  date_of_planting_end DATE NULL,
  hectares DECIMAL(8,2) NOT NULL,
  plot VARCHAR(255) NULL,
  gps VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_seedlings_beneficiary_id (beneficiary_id)
);

CREATE TABLE IF NOT EXISTS crop_status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  beneficiary_id VARCHAR(20) NOT NULL,
  survey_date DATE NOT NULL,
  surveyer VARCHAR(100) NOT NULL,
  alive_crops INT NOT NULL,
  dead_crops INT NOT NULL DEFAULT 0,
  plot VARCHAR(255) NULL,
  pictures JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_crop_status_beneficiary_id (beneficiary_id),
  INDEX idx_crop_status_survey_date (survey_date)
);

-- Farm plots for map monitoring
CREATE TABLE IF NOT EXISTS farm_plots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  beneficiary_id VARCHAR(20) NOT NULL,
  plot_number VARCHAR(255) NOT NULL,
  color VARCHAR(20) NULL,
  coordinates JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_farm_plots_beneficiary_id (beneficiary_id),
  INDEX idx_farm_plots_plot_number (plot_number)
);

-- Drop existing plot foreign key constraints if they exist
-- These statements will be ignored if constraints don't exist (handled by database.js error handling)
-- This allows the database to be recreated cleanly without plot foreign key constraints
ALTER TABLE seedling_records DROP FOREIGN KEY fk_seedlings_plot;
ALTER TABLE crop_status DROP FOREIGN KEY fk_crop_status_plot;

ALTER TABLE seedling_records
  ADD CONSTRAINT fk_seedlings_beneficiary
  FOREIGN KEY (beneficiary_id)
  REFERENCES beneficiary_details(beneficiary_id)
  ON UPDATE CASCADE
  ON DELETE CASCADE;

ALTER TABLE crop_status
  ADD CONSTRAINT fk_crop_status_beneficiary
  FOREIGN KEY (beneficiary_id)
  REFERENCES beneficiary_details(beneficiary_id)
  ON UPDATE CASCADE
  ON DELETE CASCADE;

ALTER TABLE farm_plots
  ADD CONSTRAINT fk_farm_plots_beneficiary
  FOREIGN KEY (beneficiary_id)
  REFERENCES beneficiary_details(beneficiary_id)
  ON UPDATE CASCADE
  ON DELETE CASCADE;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;




