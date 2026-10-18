-- ==============================================================================
-- Dolphin Aquarium - Delete All Orders from Supabase
-- Run this in your Supabase Dashboard > SQL Editor to wipe orders history
-- ==============================================================================

BEGIN;

-- Delete all order records
DELETE FROM public.orders;

COMMIT;

-- Verify that the table is clean
SELECT count(*) AS remaining_orders FROM public.orders;
