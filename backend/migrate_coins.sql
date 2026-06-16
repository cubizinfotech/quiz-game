-- ─── Coin Reward System Migration ────────────────────────────────────────────

-- 1. Add coins balance to users
ALTER TABLE `users`
  ADD COLUMN `coins` INT NOT NULL DEFAULT 0 AFTER `total_points`;

-- 2. Add reward_coins to quizzes
ALTER TABLE `quizzes`
  ADD COLUMN `reward_coins` INT NOT NULL DEFAULT 10 AFTER `reward_points`;

-- 3. Track whether reward was claimed per attempt
ALTER TABLE `quiz_attempts`
  ADD COLUMN `reward_claimed` TINYINT(1) NOT NULL DEFAULT 0 AFTER `points_earned`;

-- 4. Coin transaction ledger
CREATE TABLE `coin_transactions` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `user_id`     INT NOT NULL,
  `amount`      INT NOT NULL,
  `type`        ENUM('quiz_reward', 'double_reward', 'bonus') NOT NULL,
  `description` VARCHAR(255) NULL,
  `attempt_id`  INT NULL,
  `created_at`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `coin_transactions_user_id_idx` (`user_id`),
  CONSTRAINT `coin_transactions_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
