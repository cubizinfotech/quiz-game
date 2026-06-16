-- Run in phpMyAdmin (quiz_game database) or:
--   mysql -u root quiz_game < migrate_users_auth.sql

-- Make email and password nullable (guests have neither)
ALTER TABLE `users`
  MODIFY COLUMN `email`    VARCHAR(191) NULL,
  MODIFY COLUMN `password` VARCHAR(255) NULL;

-- Add guest tracking columns
ALTER TABLE `users`
  ADD COLUMN `is_guest`    TINYINT(1)   NOT NULL DEFAULT 0   AFTER `total_points`,
  ADD COLUMN `guest_token` VARCHAR(191) NULL                  AFTER `is_guest`;

-- Unique index on guest_token (sparse — only non-null values are enforced)
ALTER TABLE `users`
  ADD UNIQUE INDEX `users_guest_token_key` (`guest_token`);
