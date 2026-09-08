import { Request, Response, NextFunction } from 'express';

// authenticateToken only proves the token is valid - it doesn't check the role it carries. Chain this after it on routes that must be restricted to specific roles (e.g. ADMIN-only routes).
export const requireRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        if (!user || !roles.includes(user.role)) {
            return res.status(403).json({ error: 'Forbidden. Insufficient role.' });
        }
        return next();
    };
};
