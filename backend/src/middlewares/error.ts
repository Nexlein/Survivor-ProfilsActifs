import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';

// Global Error Handler Middleware
// Catches all unhandled exceptions thrown by routes or controllers.
// Ensures the API always returns a clean JSON response instead of an HTML stack trace.

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Error Handler]', err);

  // Multer's own errors (thrown by its `limits` checks, e.g. LIMIT_FILE_SIZE)
  // and the custom fileFilter rejection (a plain Error) both reach here via
  // next(err) — surface them with the status codes a client actually expects
  // instead of a generic 500.
  if (err instanceof MulterError && err.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({ error: 'File too large', message: 'The uploaded file exceeds the maximum allowed size of 100 MB.' });
    return;
  }
  if (err.message?.startsWith('Invalid file type')) {
    res.status(400).json({ error: 'Invalid file type', message: err.message });
    return;
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
};
