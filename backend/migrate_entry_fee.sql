-- Add entry_fee column to quizzes table
ALTER TABLE quizzes ADD COLUMN `entry_fee` INT NOT NULL DEFAULT 0 AFTER `time_limit`;
