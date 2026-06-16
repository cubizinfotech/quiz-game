-- ─── Quick Start Quiz Migration ──────────────────────────────────────────────

CREATE TABLE `quick_start_quizzes` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `is_active`   TINYINT(1) NOT NULL DEFAULT 1,
  `reward_coins` INT NOT NULL DEFAULT 20,
  `created_at`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `quick_start_questions` (
  `id`            INT NOT NULL AUTO_INCREMENT,
  `quiz_id`       INT NOT NULL,
  `question_text` TEXT NOT NULL,
  `option_a`      VARCHAR(500) NOT NULL,
  `option_b`      VARCHAR(500) NOT NULL,
  `option_c`      VARCHAR(500) NOT NULL,
  `option_d`      VARCHAR(500) NOT NULL,
  `correct_answer` VARCHAR(1) NOT NULL,
  `explanation`   TEXT NULL,
  `order_index`   INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `quick_start_questions_quiz_id_idx` (`quiz_id`),
  CONSTRAINT `quick_start_questions_quiz_id_fkey`
    FOREIGN KEY (`quiz_id`) REFERENCES `quick_start_quizzes` (`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
