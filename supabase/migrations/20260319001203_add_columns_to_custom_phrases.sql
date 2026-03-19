/*
  # Add columns to custom_phrases table

  1. Modified Tables
    - `custom_phrases`
      - `subcategory` (text) - the subcategory this phrase belongs to
      - `english` (text) - English translation
      - `spanish` (text) - Spanish translation
      - `tagalog` (text) - Tagalog translation
      - `vietnamese` (text) - Vietnamese translation
      - `mandarin` (text) - Mandarin translation
      - `cantonese` (text) - Cantonese translation
      - `language` (text) - primary language identifier
*/

ALTER TABLE public.custom_phrases
ADD COLUMN IF NOT EXISTS subcategory text,
ADD COLUMN IF NOT EXISTS english text,
ADD COLUMN IF NOT EXISTS spanish text,
ADD COLUMN IF NOT EXISTS tagalog text,
ADD COLUMN IF NOT EXISTS vietnamese text,
ADD COLUMN IF NOT EXISTS mandarin text,
ADD COLUMN IF NOT EXISTS cantonese text,
ADD COLUMN IF NOT EXISTS language text;
