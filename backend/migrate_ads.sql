-- Run this in phpMyAdmin (quiz_game database) or via MySQL CLI:
--   mysql -u root quiz_game < migrate_ads.sql

-- Step 1: Expand the position ENUM with new values
ALTER TABLE `ads`
  MODIFY COLUMN `position` ENUM(
    'header',
    'middle',
    'footer',
    'welcome_popup',
    'before_quiz',
    'between_questions',
    'wrong_answer',
    'quiz_complete',
    'rewarded_video'
  ) NOT NULL;

-- Step 2: Add delay_seconds and frequency columns
ALTER TABLE `ads`
  ADD COLUMN `delay_seconds` INT NOT NULL DEFAULT 0 AFTER `is_active`,
  ADD COLUMN `frequency`     INT NOT NULL DEFAULT 1 AFTER `delay_seconds`;
