-- Migration: Add password-based authentication support to users table
-- Run this after the initial setup-database.sql

-- Step 1: Modify users table to support password-based authentication
-- Make google_id nullable and add password column

ALTER TABLE users 
MODIFY COLUMN google_id VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS password VARCHAR(255) NULL AFTER name;

-- Step 2: Drop the NOT NULL constraint if it exists (for older MySQL versions)
-- You may need to run this manually if the above fails:
-- ALTER TABLE users MODIFY google_id VARCHAR(255);

-- Step 3: Create index on password for faster lookups
-- CREATE INDEX idx_password ON users(password);

-- Verify the changes
DESCRIBE users;
