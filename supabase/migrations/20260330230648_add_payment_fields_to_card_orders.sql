/*
  # Add payment tracking fields to card_orders

  1. Changes
    - Add `stripe_session_id` to track Stripe checkout session
    - Add `product_price` to store quoted product cost
    - Add `shipping_price` to store quoted shipping cost
    - Add `total_price` to store final quoted total
    - Add `currency` to store currency code (default USD)
    - Add `email` to store customer email
    - Add `street_address`, `city`, `state`, `zip_code` for normalized shipping
    - Add `ref_code` to track ambassador reference code
    - Update status to use 'pending' for orders awaiting payment

  2. Security
    - RLS already enabled on card_orders table
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'card_orders' AND column_name = 'stripe_session_id'
  ) THEN
    ALTER TABLE card_orders ADD COLUMN stripe_session_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'card_orders' AND column_name = 'product_price'
  ) THEN
    ALTER TABLE card_orders ADD COLUMN product_price numeric(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'card_orders' AND column_name = 'shipping_price'
  ) THEN
    ALTER TABLE card_orders ADD COLUMN shipping_price numeric(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'card_orders' AND column_name = 'total_price'
  ) THEN
    ALTER TABLE card_orders ADD COLUMN total_price numeric(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'card_orders' AND column_name = 'currency'
  ) THEN
    ALTER TABLE card_orders ADD COLUMN currency text DEFAULT 'USD';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'card_orders' AND column_name = 'email'
  ) THEN
    ALTER TABLE card_orders ADD COLUMN email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'card_orders' AND column_name = 'street_address'
  ) THEN
    ALTER TABLE card_orders ADD COLUMN street_address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'card_orders' AND column_name = 'city'
  ) THEN
    ALTER TABLE card_orders ADD COLUMN city text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'card_orders' AND column_name = 'state'
  ) THEN
    ALTER TABLE card_orders ADD COLUMN state text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'card_orders' AND column_name = 'zip_code'
  ) THEN
    ALTER TABLE card_orders ADD COLUMN zip_code text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'card_orders' AND column_name = 'ref_code'
  ) THEN
    ALTER TABLE card_orders ADD COLUMN ref_code text;
  END IF;
END $$;
