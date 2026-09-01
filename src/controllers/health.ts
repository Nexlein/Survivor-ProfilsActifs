import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';

/**
 * Health Check Controller
 * Directly answers Thomas Vignal's IT constraint:
 * Must return 503 if the database is unreachable, 200 otherwise.
 */
export const checkHealth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Attempt a raw query to guarantee the database connection is truly alive.
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Health Check Failed]', error);
    // Explicit 503 Service Unavailable per IT specifications
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      message: 'Service Unavailable'
    });
  }
};
