-- Reset Admin Password to 'admin123'
-- This hash was generated using bcrypt with 10 salt rounds

-- Delete existing admin first (to avoid duplicate key issues)
DELETE FROM admins WHERE username = 'admin' OR email = 'admin@nutbaba.com';

-- Insert admin with correct password hash for 'admin123'
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
INSERT INTO admins (username, email, password_hash, role) VALUES 
    ('admin', 'admin@nutbaba.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'super_admin');

-- Verify the admin was created
SELECT id, username, email, role FROM admins WHERE username = 'admin';
