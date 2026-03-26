/*
  # Create card_orders table

  1. New Tables
    - `card_orders`
      - `id` (uuid, primary key)
      - `ambassador_id` (text, references ambassador)
      - `gelato_order_id` (text, the order ID returned from Gelato)
      - `quantity` (integer, number of cards ordered)
      - `shipping_name` (text, full name of recipient)
      - `shipping_address_json` (jsonb, full shipping address object)
      - `status` (text, order status, default 'submitted')
      - `created_at` (timestamptz, auto)

  2. Security
    - Enable RLS on `card_orders` table
    - No user-facing select/insert needed (server-side only via service role)
*/

CREATE TABLE IF NOT EXISTS card_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id text NOT NULL,
  gelato_order_id text,
  quantity integer NOT NULL DEFAULT 0,
  shipping_name text NOT NULL DEFAULT '',
  shipping_address_json jsonb,
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE card_orders ENABLE ROW LEVEL SECURITY;
