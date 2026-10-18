-- ==============================================================================
-- Dolphin Aquarium - Delete All Products & Price History from Supabase
-- Run this in your Supabase Dashboard > SQL Editor to wipe all products
-- ==============================================================================

BEGIN;

-- 1. Clear price history audit logs linked to products
DELETE FROM public.price_history;

-- 2. Delete all products
DELETE FROM public.products;

COMMIT;

-- Verify that the table is clean
SELECT count(*) AS remaining_products FROM public.products;
