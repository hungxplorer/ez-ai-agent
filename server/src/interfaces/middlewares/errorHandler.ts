import { Request, Response, NextFunction } from "express";
import { logger } from "~/infrastructure/logging/logger";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  const appError = err as AppError;

  // Log error
  logger.error(`${req.method} ${req.path} - ${err.message}`, {
    stack: err.stack,
    statusCode: appError.statusCode || 500,
  });

  // Check if the request path starts with /api/ (dynamic agent routes)
  if (req.path.startsWith("/api/") && req.path !== "/api/agents") {
    // For dynamic agent routes, return just the error message
    res.status(appError.statusCode || 500).send(appError.message);
  } else {
    // Operational, trusted error: send message to client
    if (appError.isOperational) {
      res.status(appError.statusCode).json({
        status: "error",
        message: appError.message,
      });
    } else {
      // Programming or other unknown error: don't leak error details
      // Send generic message
      res.status(500).json({
        status: "error",
        message: "Something went wrong",
      });
    }
  }
};
