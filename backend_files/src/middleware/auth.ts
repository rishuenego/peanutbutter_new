import { Request, Response, NextFunction } from 'express'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number
    google_id: string
    email: string
    name: string
    phone?: string
    address?: string
    city?: string
    state?: string
    pincode?: string
  }
}

export function isAuthenticated(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next()
  }
  res.status(401).json({ success: false, message: 'Unauthorized' })
}

export function isOptionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  // Continue regardless of authentication status
  next()
}
