-- Add new ad positions to the ads.position ENUM
ALTER TABLE ads MODIFY COLUMN position ENUM(
  'header','middle','footer','welcome_popup',
  'before_quiz','between_questions','wrong_answer',
  'quiz_complete','rewarded_video',
  'quickstart_done','quiz_card_click','quiz_bottom','post_quiz_bonus'
) NOT NULL;
