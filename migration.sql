-- SQL Migration to add 'status' column to the 'bookings' table
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

-- 1. Add status column if it does not already exist
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';

-- 2. Backfill existing null records to 'pending'
UPDATE bookings 
SET status = 'pending' 
WHERE status IS NULL;
