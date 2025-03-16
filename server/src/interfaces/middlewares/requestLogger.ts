import { Request, Response, NextFunction } from "express";
import { logger } from "~/infrastructure/logging/logger";

/**
 * Middleware to log request details for debugging
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Only log for execute endpoints
  if (req.path.includes("/execute") || req.path.startsWith("/api/")) {
    logger.info(`Request path: ${req.path}`);
    logger.info(`Request method: ${req.method}`);
    logger.info(`Content-Type: ${req.headers["content-type"]}`);

    // Log the body type and a preview
    const bodyType = typeof req.body;
    let bodyPreview = "";

    if (bodyType === "string") {
      bodyPreview =
        req.body.length > 100 ? `${req.body.substring(0, 100)}...` : req.body;
      logger.info(`Request body (string): ${bodyPreview}`);
    } else if (bodyType === "object" && req.body !== null) {
      try {
        const stringified = JSON.stringify(req.body);
        bodyPreview =
          stringified.length > 100
            ? `${stringified.substring(0, 100)}...`
            : stringified;
        logger.info(`Request body (object): ${bodyPreview}`);
      } catch (error) {
        logger.info(`Request body: [Object that couldn't be stringified]`);
      }
    } else {
      logger.info(`Request body type: ${bodyType}`);
    }
  }

  next();
};
