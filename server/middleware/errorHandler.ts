import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('❌ Error:', error);

  // Default error
  let statusCode = 500;
  let message = 'Internal server error';

  // Validation errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = error.message;
  }

  // MySQL errors
  if (error.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Duplicate entry';
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};