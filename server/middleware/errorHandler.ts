import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  code?: string;
  stack?: string;
}

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('❌ Error:', error);

  // Default values
  let statusCode = 500;
  let message = 'Internal server error';

  // Type guard to check if error matches CustomError
  if (typeof error === 'object' && error !== null && 'name' in error) {
    const err = error as CustomError;

    // Validation error
    if (err.name === 'ValidationError') {
      statusCode = 400;
      message = err.message;
    }

    // MySQL duplicate entry
    if (err.code === 'ER_DUP_ENTRY') {
      statusCode = 409;
      message = 'Duplicate entry';
    }

    res.status(statusCode).json({
      error: message,
      ...(process.env.NODE_ENV === 'development' && err.stack && { stack: err.stack })
    });
  } else {
    res.status(statusCode).json({ error: message });
  }
};
