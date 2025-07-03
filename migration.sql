-- Migration script to add farmer_phone and units columns to existing farmers_goods table
-- Run this in your Supabase SQL Editor

-- Step 1: Add the new columns (allow NULL initially)
ALTER TABLE public.farmers_goods 
ADD COLUMN IF NOT EXISTS farmer_phone TEXT,
ADD COLUMN IF NOT EXISTS units TEXT;

-- Step 2: Set default values for existing records
-- Update these default values according to your needs
UPDATE public.farmers_goods 
SET farmer_phone = '+91-0000000000' 
WHERE farmer_phone IS NULL;

UPDATE public.farmers_goods 
SET units = 'Kg' 
WHERE units IS NULL;

-- Step 3: Make the columns NOT NULL now that they have values
ALTER TABLE public.farmers_goods 
ALTER COLUMN farmer_phone SET NOT NULL,
ALTER COLUMN units SET NOT NULL;

-- Step 4: Add the constraint for units (only allow Kg, Box, Bags)
ALTER TABLE public.farmers_goods 
ADD CONSTRAINT check_units CHECK (units IN ('Kg', 'Box', 'Bags'));

-- Step 5: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_farmers_goods_farmer_phone ON public.farmers_goods(farmer_phone);
CREATE INDEX IF NOT EXISTS idx_farmers_goods_units ON public.farmers_goods(units);

-- Step 6: Update the view to include new fields
CREATE OR REPLACE VIEW public.goods_summary AS
SELECT 
    farmer_name,
    farmer_phone,
    good_name,
    quantity,
    units,
    price_per_unit,
    with_commission,
    final_price,
    (quantity * price_per_unit) as total_before_commission,
    CASE 
        WHEN with_commission THEN (quantity * price_per_unit * 0.1)
        ELSE 0
    END as commission_amount,
    created_at,
    DATE(created_at) as collection_date
FROM public.farmers_goods
ORDER BY created_at DESC;

-- Verification query - run this to check if everything worked
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'farmers_goods' 
AND table_schema = 'public'
ORDER BY ordinal_position; 