import { Request, Response, NextFunction } from 'express';

/**
 * Global Error Handler Middleware
 * Catches all unhandled exceptions thrown by routes or controllers.
 * Ensures the API always returns a clean JSON response instead of an HTML stack trace.
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Error Handler]', err);
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
};
