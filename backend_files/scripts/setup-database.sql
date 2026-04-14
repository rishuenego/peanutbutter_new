-- Nut Baba E-Commerce Database Schema
-- MySQL Database

-- Create database (run this separately if needed)
-- CREATE DATABASE IF NOT EXISTS nutbaba;
-- USE nutbaba;

-- ============================================
-- Users Table - Customer accounts (Google OAuth + Email/Password)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    google_id VARCHAR(255) UNIQUE NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_google_id (google_id)
);

-- ============================================
-- Admins Table - Admin accounts with hashed passwords
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- ============================================
-- Products Table - Product catalog
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    category VARCHAR(100),
    texture ENUM('smooth', 'crunchy') DEFAULT 'smooth',
    mrp_price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2) NOT NULL,
    discount_percentage INT DEFAULT 0,
    weight_options JSON DEFAULT '["350g", "500g", "1kg"]',
    manufacturer VARCHAR(255),
    product_type VARCHAR(100),
    dimensions VARCHAR(100),
    is_featured BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    stock_status ENUM('in_stock', 'out_of_stock') DEFAULT 'in_stock',
    stock_quantity INT DEFAULT 100,
    rating DECIMAL(2, 1) DEFAULT 4.5,
    review_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_category (category),
    INDEX idx_featured (is_featured),
    INDEX idx_bestseller (is_bestseller),
    INDEX idx_stock (stock_status)
);

-- ============================================
-- Orders Table - Order management
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT,
    items JSON NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    coupon_code VARCHAR(50),
    shipping_charge DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('razorpay', 'upi', 'cod') NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    order_status ENUM(
        'pending', 
        'confirmed', 
        'processing', 
        'shipped', 
        'in_transit', 
        'out_for_delivery', 
        'delivered', 
        'cancelled', 
        'returned'
    ) DEFAULT 'pending',
    shipping_address JSON NOT NULL,
    tracking_number VARCHAR(100),
    estimated_delivery DATE,
    delivered_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_order_number (order_number),
    INDEX idx_user_id (user_id),
    INDEX idx_order_status (order_status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at)
);

-- ============================================
-- Coupons Table - Coupon codes with discount
-- ============================================
CREATE TABLE IF NOT EXISTS coupons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percentage INT NOT NULL,
    max_discount_amount DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    usage_limit INT DEFAULT 100,
    used_count INT DEFAULT 0,
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_active (is_active),
    INDEX idx_validity (valid_from, valid_until)
);

-- ============================================
-- Settings Table - Site settings (shipping, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (key_name)
);

-- ============================================
-- Newsletter Subscribers Table
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- ============================================
-- Contact Messages Table
-- ============================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- ============================================
-- Insert Default Settings
-- ============================================
INSERT INTO settings (key_name, value) VALUES 
    ('free_shipping_threshold', '299'),
    ('shipping_charge', '49'),
    ('cod_charge', '0')
ON DUPLICATE KEY UPDATE value = VALUES(value);

-- ============================================
-- Insert Default Admin (password: admin123)
-- Using plain text password for simplicity
-- ============================================
INSERT INTO admins (username, email, password_hash, role) VALUES 
    ('admin', 'admin@nutbaba.com', 'admin123', 'super_admin')
ON DUPLICATE KEY UPDATE password_hash = 'admin123';

-- ============================================
-- Insert Sample Products
-- ============================================
INSERT INTO products (name, slug, description, short_description, category, texture, mrp_price, sale_price, discount_percentage, weight_options, manufacturer, product_type, dimensions, is_featured, is_bestseller, stock_status, stock_quantity, rating, review_count) VALUES

-- Product 1: High Protein Dark Chocolate
('High Protein Dark Chocolate Peanut Butter', 'high-protein-dark-chocolate-peanut-butter', 
'Nuttira High Protein Peanut Butter Spread (Dark Chocolate Blend)\n\nHigh Protein – Supports muscle recovery and active lifestyles\nCrunchy Texture – Rich and satisfying consistency\nEnergy Boosting – Ideal for daily nutrition\nDark Chocolate Blend – Perfect balance of taste and indulgence\nVersatile Usage – Suitable for meals, snacks, and recipes\n\nProduct Details\nBrand: Nuttira\nForm: Paste / Crunchy Spread\nSpecialty: High Protein, Crunchy Texture, Energy Boosting\nPackaging: Plastic Jar with Screw Cap\nCountry of Origin: India\n\nManufacturer Details\nPumpit Health Foods\n3 Near Police Line Tekri\nUdaipur, Rajasthan – 313001 India',
'26g Protein per serving. Dark Chocolate blend with crunchy texture.',
'High Protein', 'crunchy', 499.00, 349.00, 30, 
'["350g", "500g", "1kg"]',
'Nut Baba', 'Peanut Butter', '7 x 7.5 x 12 cm', TRUE, TRUE, 'in_stock', 150, 4.5, 715),

-- Product 2: All Natural Smooth
('All Natural Smooth Peanut Butter', 'all-natural-smooth-peanut-butter',
'100% Natural Peanut Butter - Smooth Texture\n\nMade with carefully selected peanuts\nNo added sugar, no preservatives\nPerfect for spreading on toast, making smoothies, or baking\nRich in protein and healthy fats\nCreamy, velvety smooth texture\n\nIdeal for:\n- Gym enthusiasts\n- Health-conscious individuals\n- Kids and families',
'100% Natural, No Added Sugar, Smooth creamy texture.',
'Classic', 'smooth', 449.00, 329.00, 27,
'["350g", "500g", "1kg"]',
'Nut Baba', 'Peanut Butter', '7 x 7.5 x 12 cm', TRUE, TRUE, 'in_stock', 200, 4.7, 892),

-- Product 3: White Chocolate Crunch
('White Chocolate Crunch Peanut Butter', 'white-chocolate-crunch-peanut-butter',
'White Chocolate Peanut Butter with Crunchy bits\n\nDelicious white chocolate flavor\nCrunchy peanut pieces for extra texture\nPerfect balance of sweet and nutty\nGreat for desserts and snacks\nNo artificial preservatives',
'White chocolate flavor with crunchy peanut bits.',
'Flavored', 'crunchy', 529.00, 399.00, 25,
'["350g", "500g", "1kg"]',
'Nut Baba', 'Peanut Butter', '7 x 7.5 x 12 cm', TRUE, TRUE, 'in_stock', 120, 4.6, 543),

-- Product 4: Dark Chocolate Crunch
('Dark Chocolate Crunch Peanut Butter', 'dark-chocolate-crunch-peanut-butter',
'Premium Dark Chocolate Peanut Butter with Crunchy texture\n\nRich dark chocolate flavor\nCrunchy roasted peanut pieces\nLower sugar content\nHigh in antioxidants\nPerfect for chocolate lovers',
'Rich dark chocolate with crunchy peanut pieces.',
'Flavored', 'crunchy', 529.00, 379.00, 28,
'["350g", "500g", "1kg"]',
'Nut Baba', 'Peanut Butter', '7 x 7.5 x 12 cm', FALSE, TRUE, 'in_stock', 100, 4.4, 421),

-- Product 5: High Protein Crunch
('High Protein Crunch Peanut Butter', 'high-protein-crunch-peanut-butter',
'Extra High Protein Peanut Butter - Crunchy\n\n30g protein per serving\nIdeal for muscle building\nCrunchy texture for satisfaction\nNo added sugar\nPerfect post-workout snack',
'30g Protein per serving. Crunchy texture for gym enthusiasts.',
'High Protein', 'crunchy', 549.00, 399.00, 27,
'["350g", "500g", "1kg"]',
'Nut Baba', 'Peanut Butter', '7 x 7.5 x 12 cm', TRUE, FALSE, 'in_stock', 80, 4.8, 312)

ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ============================================
-- Insert Sample Coupon
-- ============================================
INSERT INTO coupons (code, discount_percentage, max_discount_amount, min_order_amount, usage_limit, valid_from, valid_until, is_active) VALUES 
    ('NUTBABA20', 20, 200, 299, 1000, '2024-01-01', '2026-12-31', TRUE),
    ('WELCOME10', 10, 100, 199, 500, '2024-01-01', '2026-12-31', TRUE),
    ('PROTEIN15', 15, 150, 399, 200, '2024-01-01', '2026-12-31', TRUE)
ON DUPLICATE KEY UPDATE code = VALUES(code);
