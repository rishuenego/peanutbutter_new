import express from 'express';
const { Router } = express;
import { getMany, getOne, execute } from '../config/db.js';
import { isAdmin, generateAdminToken, removeAdminToken, validateAdminToken } from '../middleware/adminAuth.js';
const router = Router();
// Safe JSON parse helper
function safeJsonParse(value, fallback = []) {
    if (value === null || value === undefined || value === '') {
        return fallback;
    }
    if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        return value;
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
            try {
                return JSON.parse(trimmed);
            }
            catch {
                // JSON parse failed
            }
        }
        if (trimmed.includes(',')) {
            return trimmed.split(',').map(v => v.trim()).filter(Boolean);
        }
        if (trimmed) {
            return Array.isArray(fallback) ? [trimmed] : fallback;
        }
    }
    return fallback;
}
// Check admin auth status
router.get('/check-auth', (req, res) => {
    // Check session first
    if (req.session?.admin) {
        return res.json({
            success: true,
            authenticated: true,
            admin: req.session.admin,
        });
    }
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const admin = validateAdminToken(token);
        if (admin) {
            return res.json({
                success: true,
                authenticated: true,
                admin,
            });
        }
    }
    res.json({
        success: true,
        authenticated: false,
    });
});
// Admin login - using simple password comparison (no hashing)
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await getOne('SELECT * FROM admins WHERE username = ? OR email = ?', [username, username]);
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        // Simple password comparison (password stored as plain text in password_hash column)
        if (admin.password_hash !== password) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        // Store admin in session
        req.session.admin = {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
        };
        // Generate token for cross-origin requests
        const token = generateAdminToken({
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
        });
        res.json({
            success: true,
            token, // Include token in response
            admin: {
                id: admin.id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
            },
        });
    }
    catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});
// Admin logout
router.post('/logout', (req, res) => {
    req.session.admin = undefined;
    // Remove token if provided
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        removeAdminToken(token);
    }
    res.json({ success: true, message: 'Logged out successfully' });
});
// Dashboard stats
router.get('/dashboard', isAdmin, async (req, res) => {
    try {
        const [totalOrders, pendingOrders, totalRevenue, totalUsers, totalProducts, recentOrders,] = await Promise.all([
            getOne('SELECT COUNT(*) as count FROM orders'),
            getOne('SELECT COUNT(*) as count FROM orders WHERE order_status = "pending"'),
            getOne('SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = "paid"'),
            getOne('SELECT COUNT(*) as count FROM users'),
            getOne('SELECT COUNT(*) as count FROM products'),
            getMany('SELECT id, order_number, total_amount, order_status, created_at FROM orders ORDER BY created_at DESC LIMIT 10'),
        ]);
        res.json({
            success: true,
            stats: {
                totalOrders: totalOrders?.count || 0,
                pendingOrders: pendingOrders?.count || 0,
                totalRevenue: totalRevenue?.total || 0,
                totalUsers: totalUsers?.count || 0,
                totalProducts: totalProducts?.count || 0,
            },
            recentOrders: recentOrders.map(o => ({
                id: o.id,
                orderNumber: o.order_number,
                totalAmount: o.total_amount,
                orderStatus: o.order_status,
                createdAt: o.created_at,
            })),
        });
    }
    catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ success: false, message: 'Failed to load dashboard' });
    }
});
// Products CRUD
router.get('/products', isAdmin, async (req, res) => {
    try {
        const products = await getMany('SELECT * FROM products ORDER BY created_at DESC');
        res.json({
            success: true,
            products: products.map(p => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                description: p.description,
                category: p.category,
                texture: safeJsonParse(p.texture, []),
                mrpPrice: p.mrp_price,
                salePrice: p.sale_price,
                weightOptions: safeJsonParse(p.weight_options, []),
                manufacturer: p.manufacturer,
                productType: p.product_type,
                dimensions: p.dimensions,
                isFeatured: Boolean(p.is_featured),
                isBestseller: Boolean(p.is_bestseller),
                stockStatus: p.stock_status,
                stockQuantity: p.stock_quantity,
                images: safeJsonParse(p.images, []),
            })),
        });
    }
    catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products' });
    }
});
router.post('/products', isAdmin, async (req, res) => {
    try {
        const { name, slug, description, shortDescription, category, texture, mrpPrice, salePrice, weightOptions, manufacturer, productType, dimensions, isFeatured, isBestseller, stockQuantity, } = req.body;
        const nmrpPrice = Number(mrpPrice) || 0;
        const nsalePrice = Number(salePrice) || 0;
        const nstockQuantity = Number(stockQuantity) || 0;
        const discountPercentage = nmrpPrice > 0 ? Math.round(((nmrpPrice - nsalePrice) / nmrpPrice) * 100) : 0;
        const result = await execute(`INSERT INTO products (
        name, slug, description, short_description, category, texture,
        mrp_price, sale_price, discount_percentage, weight_options,
        manufacturer, product_type, dimensions, is_featured, is_bestseller,
        stock_status, stock_quantity, rating, review_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 4.5, 0, NOW(), NOW())`, [
            name, slug, description, shortDescription, category, JSON.stringify(texture || []),
            nmrpPrice, nsalePrice, discountPercentage, JSON.stringify(weightOptions || []),
            manufacturer, productType, dimensions, isFeatured ? 1 : 0, isBestseller ? 1 : 0,
            nstockQuantity > 0 ? 'in_stock' : 'out_of_stock', nstockQuantity,
        ]);
        res.json({ success: true, productId: result.insertId });
    }
    catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ success: false, message: 'Failed to create product' });
    }
});
router.put('/products/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, shortDescription, category, texture, mrpPrice, salePrice, weightOptions, manufacturer, productType, dimensions, isFeatured, isBestseller, stockStatus, stockQuantity, } = req.body;
        const nmrpPrice = Number(mrpPrice) || 0;
        const nsalePrice = Number(salePrice) || 0;
        const nstockQuantity = Number(stockQuantity) || 0;
        const discountPercentage = nmrpPrice > 0 ? Math.round(((nmrpPrice - nsalePrice) / nmrpPrice) * 100) : 0;
        await execute(`UPDATE products SET
        name = ?, slug = ?, description = ?, short_description = ?, category = ?,
        texture = ?, mrp_price = ?, sale_price = ?, discount_percentage = ?,
        weight_options = ?, manufacturer = ?, product_type = ?,
        dimensions = ?, is_featured = ?, is_bestseller = ?, stock_status = ?,
        stock_quantity = ?, updated_at = NOW()
       WHERE id = ?`, [
            name, slug, description, shortDescription, category, JSON.stringify(texture || []),
            nmrpPrice, nsalePrice, discountPercentage, JSON.stringify(weightOptions || []),
            manufacturer, productType, dimensions, isFeatured ? 1 : 0, isBestseller ? 1 : 0,
            stockStatus, nstockQuantity, id,
        ]);
        res.json({ success: true, message: 'Product updated successfully' });
    }
    catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ success: false, message: 'Failed to update product' });
    }
});
router.delete('/products/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await execute('DELETE FROM products WHERE id = ?', [id]);
        res.json({ success: true, message: 'Product deleted successfully' });
    }
    catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete product' });
    }
});
// Toggle product stock status
router.patch('/products/:id/stock', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { stockStatus, inStock } = req.body;
        const newStatus = stockStatus || (inStock ? 'in_stock' : 'out_of_stock');
        await execute('UPDATE products SET stock_status = ?, updated_at = NOW() WHERE id = ?', [newStatus, id]);
        res.json({ success: true, message: 'Stock status updated successfully' });
    }
    catch (error) {
        console.error('Toggle stock error:', error);
        res.status(500).json({ success: false, message: 'Failed to update stock status' });
    }
});
// Orders management
router.get('/orders', isAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        let sql = `
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
    `;
        const params = [];
        if (status) {
            sql += ' WHERE o.order_status = ?';
            params.push(status);
        }
        sql += ' ORDER BY o.created_at DESC';
        const orders = await getMany(sql, params);
        res.json({
            success: true,
            orders: orders.map(o => ({
                id: o.id,
                orderNumber: o.order_number,
                userId: o.user_id,
                userName: o.user_name,
                userEmail: o.user_email,
                items: safeJsonParse(o.items, []),
                subtotal: o.subtotal,
                discountAmount: o.discount_amount,
                couponCode: o.coupon_code,
                shippingCharge: o.shipping_charge,
                totalAmount: o.total_amount,
                paymentMethod: o.payment_method,
                paymentStatus: o.payment_status,
                orderStatus: o.order_status,
                shippingAddress: safeJsonParse(o.shipping_address, {}),
                trackingNumber: o.tracking_number,
                createdAt: o.created_at,
            })),
        });
    }
    catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders' });
    }
});
router.put('/orders/:id/status', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, trackingNumber } = req.body;
        let sql = 'UPDATE orders SET order_status = ?, updated_at = NOW()';
        const params = [status];
        if (trackingNumber) {
            sql += ', tracking_number = ?';
            params.push(trackingNumber);
        }
        if (status === 'delivered') {
            sql += ', delivered_at = NOW(), payment_status = "paid"';
        }
        sql += ' WHERE id = ?';
        params.push(id);
        await execute(sql, params);
        res.json({ success: true, message: 'Order status updated successfully' });
    }
    catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
});
// Coupons management
router.get('/coupons', isAdmin, async (req, res) => {
    try {
        const coupons = await getMany('SELECT * FROM coupons ORDER BY created_at DESC');
        res.json({
            success: true,
            coupons: coupons.map(c => ({
                id: c.id,
                code: c.code,
                discountPercentage: c.discount_percentage,
                maxDiscountAmount: c.max_discount_amount,
                minOrderAmount: c.min_order_amount,
                usageLimit: c.usage_limit,
                usedCount: c.used_count,
                validFrom: c.valid_from,
                validUntil: c.valid_until,
                isActive: Boolean(c.is_active),
                createdAt: c.created_at,
            })),
        });
    }
    catch (error) {
        console.error('Get coupons error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
    }
});
router.post('/coupons', isAdmin, async (req, res) => {
    try {
        const { code, discountPercentage, maxDiscountAmount, minOrderAmount, usageLimit, validFrom, validUntil, } = req.body;
        await execute(`INSERT INTO coupons (
        code, discount_percentage, max_discount_amount, min_order_amount,
        usage_limit, used_count, valid_from, valid_until, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, 0, ?, ?, 1, NOW())`, [
            code.toUpperCase(), discountPercentage, maxDiscountAmount, minOrderAmount,
            usageLimit, validFrom, validUntil,
        ]);
        res.json({ success: true, message: 'Coupon created successfully' });
    }
    catch (error) {
        console.error('Create coupon error:', error);
        res.status(500).json({ success: false, message: 'Failed to create coupon' });
    }
});
router.put('/coupons/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { discountPercentage, maxDiscountAmount, minOrderAmount, usageLimit, validFrom, validUntil, isActive, } = req.body;
        await execute(`UPDATE coupons SET
        discount_percentage = ?, max_discount_amount = ?, min_order_amount = ?,
        usage_limit = ?, valid_from = ?, valid_until = ?, is_active = ?
       WHERE id = ?`, [discountPercentage, maxDiscountAmount, minOrderAmount, usageLimit, validFrom, validUntil, isActive ? 1 : 0, id]);
        res.json({ success: true, message: 'Coupon updated successfully' });
    }
    catch (error) {
        console.error('Update coupon error:', error);
        res.status(500).json({ success: false, message: 'Failed to update coupon' });
    }
});
router.delete('/coupons/:id', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await execute('DELETE FROM coupons WHERE id = ?', [id]);
        res.json({ success: true, message: 'Coupon deleted successfully' });
    }
    catch (error) {
        console.error('Delete coupon error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete coupon' });
    }
});
// Toggle coupon active status
router.patch('/coupons/:id/toggle', isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        // Get current status
        const coupon = await getOne('SELECT is_active FROM coupons WHERE id = ?', [id]);
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }
        const newStatus = coupon.is_active ? 0 : 1;
        await execute('UPDATE coupons SET is_active = ? WHERE id = ?', [newStatus, id]);
        res.json({ success: true, message: 'Coupon status toggled successfully' });
    }
    catch (error) {
        console.error('Toggle coupon error:', error);
        res.status(500).json({ success: false, message: 'Failed to toggle coupon status' });
    }
});
// Users management
router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await getMany('SELECT * FROM users ORDER BY created_at DESC');
        res.json({
            success: true,
            users: users.map(u => ({
                id: u.id,
                googleId: u.google_id,
                email: u.email,
                name: u.name,
                phone: u.phone,
                address: u.address,
                city: u.city,
                state: u.state,
                pincode: u.pincode,
                createdAt: u.created_at,
            })),
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});
// Settings management
router.get('/settings', isAdmin, async (req, res) => {
    try {
        const settings = await getMany('SELECT * FROM settings');
        const settingsObj = {};
        settings.forEach(s => {
            settingsObj[s.key_name] = parseFloat(s.value);
        });
        res.json({
            success: true,
            settings: {
                freeShippingThreshold: settingsObj['free_shipping_threshold'] || 299,
                shippingCharge: settingsObj['shipping_charge'] || 49,
                codCharge: settingsObj['cod_charge'] || 0,
            },
        });
    }
    catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch settings' });
    }
});
router.put('/settings', isAdmin, async (req, res) => {
    try {
        const { freeShippingThreshold, shippingCharge, codCharge } = req.body;
        const updates = [
            { key: 'free_shipping_threshold', value: freeShippingThreshold },
            { key: 'shipping_charge', value: shippingCharge },
            { key: 'cod_charge', value: codCharge },
        ];
        for (const update of updates) {
            if (update.value !== undefined) {
                await execute(`INSERT INTO settings (key_name, value, updated_at)
           VALUES (?, ?, NOW())
           ON DUPLICATE KEY UPDATE value = ?, updated_at = NOW()`, [update.key, update.value.toString(), update.value.toString()]);
            }
        }
        res.json({ success: true, message: 'Settings updated successfully' });
    }
    catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
});
export default router;
