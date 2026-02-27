-- Make product_id nullable in chats table so DMs work without a product
-- Run this in Supabase SQL Editor

ALTER TABLE chats ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE chats DROP CONSTRAINT IF EXISTS chats_product_id_buyer_id_seller_id_key;
