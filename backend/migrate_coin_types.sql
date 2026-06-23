-- Fix coin_transactions ENUM to include ad_bonus and entry_fee types
ALTER TABLE coin_transactions MODIFY COLUMN type ENUM('quiz_reward', 'double_reward', 'bonus', 'ad_bonus', 'entry_fee') NOT NULL;
