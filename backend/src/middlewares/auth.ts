import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.body?.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const decoded = jwt.verify(token, secret) as any;
    (req as any).user = decoded;
    if (!req.body) {
      req.body = {};
    }
    req.body.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

export const optionalAuthenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.query?.token;

  if (!token) {
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    const decoded = jwt.verify(token as string, secret) as any;
    (req as any).user = decoded;
  } catch (err) {
    // Ignore error and continue as guest
  }
  return next();
};
