// Simple token store (in production, use Redis or database)
const adminTokens = new Map();
// Generate a simple token
export function generateAdminToken(admin) {
    const token = `admin_${admin.id}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    adminTokens.set(token, {
        ...admin,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    return token;
}
// Validate token and get admin
export function validateAdminToken(token) {
    const adminData = adminTokens.get(token);
    if (!adminData)
        return null;
    if (adminData.expiresAt < Date.now()) {
        adminTokens.delete(token);
        return null;
    }
    return {
        id: adminData.id,
        username: adminData.username,
        email: adminData.email,
        role: adminData.role
    };
}
// Remove token on logout
export function removeAdminToken(token) {
    adminTokens.delete(token);
}
export function isAdmin(req, res, next) {
    // First check session
    if (req.session?.admin) {
        req.admin = req.session.admin;
        return next();
    }
    // Then check Authorization header for token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const admin = validateAdminToken(token);
        if (admin) {
            req.admin = admin;
            return next();
        }
    }
    res.status(401).json({ success: false, message: 'Admin access required' });
}
export function isSuperAdmin(req, res, next) {
    // First check session
    if (req.session?.admin && req.session.admin.role === 'super_admin') {
        req.admin = req.session.admin;
        return next();
    }
    // Then check Authorization header for token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const admin = validateAdminToken(token);
        if (admin && admin.role === 'super_admin') {
            req.admin = admin;
            return next();
        }
    }
    res.status(403).json({ success: false, message: 'Super admin access required' });
}
