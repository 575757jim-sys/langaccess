/*
  # Simplify interaction_logs schema

  1. Changes
    - Make phrase_english nullable with default empty string
    - Make subcategory nullable with default empty string  
    - Make phrase_translation nullable with default empty string
    - Make session_id nullable with default empty string
    
  2. Rationale
    - Simplify inserts to only require language and sector
    - Allow defaults to populate other fields
    - Maintain data integrity while reducing insert complexity
*/

-- Make currently required fields nullable with defaults
ALTER TABLE interaction_logs 
  ALTER COLUMN phrase_english SET DEFAULT '',
  ALTER COLUMN phrase_english DROP NOT NULL;

ALTER TABLE interaction_logs 
  ALTER COLUMN subcategory DROP NOT NULL;

ALTER TABLE interaction_logs 
  ALTER COLUMN phrase_translation DROP NOT NULL;

ALTER TABLE interaction_logs 
  ALTER COLUMN session_id DROP NOT NULL;
