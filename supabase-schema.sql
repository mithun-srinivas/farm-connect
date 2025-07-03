-- Farm Connect Database Schema
-- This file contains the SQL setup for the Farm Connect application

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends auth.users)
-- Note: Supabase auth.users table is already created, but we can create a profile table if needed
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id)
);

-- Create farmers_goods table
CREATE TABLE IF NOT EXISTS public.farmers_goods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    farmer_name TEXT NOT NULL,
    farmer_phone TEXT NOT NULL,
    good_name TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
    units TEXT NOT NULL CHECK (units IN ('Kg', 'Box', 'Bags')),
    price_per_unit DECIMAL(10,2) NOT NULL CHECK (price_per_unit > 0),
    with_commission BOOLEAN DEFAULT FALSE,
    final_price DECIMAL(10,2) NOT NULL CHECK (final_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    goods_purchased TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_farmers_goods_created_at ON public.farmers_goods(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_farmers_goods_farmer_name ON public.farmers_goods(farmer_name);
CREATE INDEX IF NOT EXISTS idx_farmers_goods_farmer_phone ON public.farmers_goods(farmer_phone);
CREATE INDEX IF NOT EXISTS idx_farmers_goods_good_name ON public.farmers_goods(good_name);
CREATE INDEX IF NOT EXISTS idx_farmers_goods_units ON public.farmers_goods(units);
CREATE INDEX IF NOT EXISTS idx_farmers_goods_user_id ON public.farmers_goods(user_id);

CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(customer_name);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers_goods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for farmers_goods
CREATE POLICY "Users can view their own farmers_goods" ON public.farmers_goods
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own farmers_goods" ON public.farmers_goods
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farmers_goods" ON public.farmers_goods
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own farmers_goods" ON public.farmers_goods
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for customers
CREATE POLICY "Users can view their own customers" ON public.customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customers" ON public.customers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers" ON public.customers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers" ON public.customers
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at_user_profiles
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_farmers_goods
    BEFORE UPDATE ON public.farmers_goods
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_customers
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create a function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Insert default admin user (you'll need to run this after creating the user in Supabase Auth)
-- Note: This is just for reference - you'll need to create the user through Supabase Auth first
-- Then you can insert the profile manually or it will be created automatically via the trigger

-- Sample data for testing (optional - remove in production)
-- You can uncomment these lines to add sample data for testing

/*
-- Sample farmers_goods data
INSERT INTO public.farmers_goods (farmer_name, farmer_phone, good_name, quantity, units, price_per_unit, with_commission, final_price) VALUES
('John Smith', '+91-9876543210', 'Wheat', 100, 'Kg', 5.50, true, 495.00),
('Mary Johnson', '+91-9876543211', 'Corn', 150, 'Bags', 3.20, false, 480.00),
('Bob Wilson', '+91-9876543212', 'Rice', 80, 'Kg', 7.25, true, 522.00),
('Sarah Davis', '+91-9876543213', 'Soybeans', 120, 'Box', 6.80, false, 816.00),
('Tom Brown', '+91-9876543214', 'Barley', 90, 'Kg', 4.75, true, 384.75);

-- Sample customers data
INSERT INTO public.customers (customer_name, phone, address, goods_purchased, price) VALUES
('ABC Restaurant', '+1-555-0101', '123 Main St, Anytown, ST 12345', '50kg Rice, 30kg Wheat', 425.00),
('Fresh Market Co', '+1-555-0102', '456 Oak Ave, Somewhere, ST 67890', '100kg Corn, 25kg Soybeans', 490.00),
('Organic Foods Ltd', '+1-555-0103', '789 Pine Rd, Elsewhere, ST 13579', '75kg Barley, 40kg Rice', 630.00),
('City Grocery', '+1-555-0104', '321 Elm St, Nowhere, ST 24680', '60kg Wheat, 80kg Corn', 586.00),
('Farm to Table', '+1-555-0105', '654 Maple Dr, Anywhere, ST 97531', '45kg Soybeans, 35kg Barley', 472.25);
*/

-- Views for reporting (optional but useful)
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

CREATE OR REPLACE VIEW public.customer_summary AS
SELECT 
    customer_name,
    phone,
    address,
    goods_purchased,
    price,
    created_at,
    DATE(created_at) as purchase_date
FROM public.customers
ORDER BY created_at DESC;

-- Create a view for dashboard statistics
CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM public.farmers_goods) as total_goods,
    (SELECT COUNT(*) FROM public.customers) as total_customers,
    (SELECT COALESCE(SUM(final_price), 0) FROM public.farmers_goods) as total_revenue,
    (SELECT COALESCE(SUM(
        CASE 
            WHEN with_commission THEN (quantity * price_per_unit * 0.1)
            ELSE 0
        END
    ), 0) FROM public.farmers_goods) as total_commission,
    (SELECT COUNT(*) FROM public.farmers_goods WHERE with_commission = true) as goods_with_commission,
    (SELECT COUNT(*) FROM public.farmers_goods WHERE with_commission = false) as goods_without_commission;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL VIEWS IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Migration to add new columns to existing farmers_goods table
-- Run this if you already have data in your farmers_goods table
ALTER TABLE public.farmers_goods 
ADD COLUMN IF NOT EXISTS farmer_phone TEXT,
ADD COLUMN IF NOT EXISTS units TEXT;

-- Set default values for existing records (you may need to update these manually)
UPDATE public.farmers_goods 
SET farmer_phone = '+91-0000000000' 
WHERE farmer_phone IS NULL;

UPDATE public.farmers_goods 
SET units = 'Kg' 
WHERE units IS NULL;

-- Now add the constraints
ALTER TABLE public.farmers_goods 
ALTER COLUMN farmer_phone SET NOT NULL,
ALTER COLUMN units SET NOT NULL;

-- Add the constraint for units
ALTER TABLE public.farmers_goods 
ADD CONSTRAINT check_units CHECK (units IN ('Kg', 'Box', 'Bags'));

-- Final notes:
-- 1. Make sure to set up your Supabase project first
-- 2. Replace the environment variables in your .env.local file:
--    VITE_SUPABASE_URL=your_supabase_project_url
--    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
-- 3. Create a user with email: admin@farmconnect.com and password: admin
-- 4. Run this SQL in your Supabase SQL Editor
-- 5. Make sure Row Level Security is properly configured for your use case 