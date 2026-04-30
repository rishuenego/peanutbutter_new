import type { Request, Response, NextFunction } from 'express'

declare global {
  namespace Express {
    interface User {
      id: number
      google_id?: string
      email: string
      name: string
      password?: string
      phone?: string
      address?: string
      city?: string
      state?: string
      pincode?: string
    }
  }
}

export type AuthenticatedRequest = Request & { user: Express.User }

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const isAuth = req.isAuthenticated && req.isAuthenticated();
  if (isAuth && req.user) {
    return next();
  }
  
  console.log('Auth Failure:', {
    isAuthenticated: isAuth,
    hasUser: !!req.user,
    sessionID: req.sessionID,
    hasSession: !!req.session,
    cookies: req.headers.cookie ? 'Present' : 'Missing'
  });
  
  res.status(401).json({ success: false, message: 'Unauthorized' });
}

export function isOptionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  next()
}
