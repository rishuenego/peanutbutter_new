-- Set admin password to plain text 'admin123'
UPDATE admins SET password_hash = 'admin123' WHERE username = 'admin';

-- Verify the update
SELECT id, username, email, password_hash, role FROM admins WHERE username = 'admin';
