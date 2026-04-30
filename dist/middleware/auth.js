export function isAuthenticated(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Unauthorized' });
}
export function isOptionalAuth(req, res, next) {
    next();
}
