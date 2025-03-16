// Import environment variables
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "~/interfaces/middlewares/errorHandler";
import { apiRoutes } from "~/interfaces/routes";
import { logger } from "~/infrastructure/logging/logger";
import { dbInit, getDbStatus, db } from "~/infrastructure/database/knex";
import { registerDynamicRoutes } from "~/interfaces/middlewares/dynamicRoutesMiddleware";
import { requestLogger } from "~/interfaces/middlewares/requestLogger";

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Database connection configuration
const dbConfig = {
  maxRetries: Number(process.env.DB_MAX_RETRIES) || 5,
  retryInterval: Number(process.env.DB_RETRY_INTERVAL) || 2000,
};

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Custom middleware to handle both JSON and text inputs
app.use(
  express.json({
    verify: (req, res, buf, encoding) => {
      if (buf.length > 0) {
        // Store the raw body for potential text processing
        (req as any).rawBody = buf.toString(
          (encoding as BufferEncoding) || "utf8"
        );
      }
    },
  })
);

// Middleware to handle text/plain content type
app.use((req, res, next) => {
  if (req.headers["content-type"] === "text/plain") {
    // If the content type is text/plain, use the raw body
    req.body = (req as any).rawBody;
  }

  // For requests without a content-type header but with a body
  if (!req.headers["content-type"] && (req as any).rawBody) {
    try {
      // Try to parse as JSON first
      req.body = JSON.parse((req as any).rawBody);
    } catch (e) {
      // If parsing fails, treat as plain text
      req.body = (req as any).rawBody;
    }
  }

  next();
});

app.use(morgan("dev"));

// Add request logger middleware
app.use(requestLogger);

// Routes
app.use("/api", apiRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Database health check endpoint
app.get("/health/db", async (req, res) => {
  try {
    const dbStatus = await getDbStatus();

    if (dbStatus.connected) {
      res.status(200).json({
        status: "ok",
        database: dbStatus,
      });
    } else {
      res.status(503).json({
        status: "error",
        database: dbStatus,
        message: "Database connection failed",
      });
    }
  } catch (error) {
    logger.error("Database health check failed:", error);
    res.status(500).json({
      status: "error",
      database: {
        connected: false,
        timestamp: new Date().toISOString(),
      },
      message: "Database health check error",
      error: (error as Error).message,
    });
  }
});

// Error handling middleware
app.use(errorHandler);

// Initialize server with database check
const startServer = async () => {
  try {
    // Initialize database and wait for connection
    logger.info("Checking database connection...");
    await dbInit(dbConfig.maxRetries, dbConfig.retryInterval);

    // Register dynamic routes for agents
    logger.info("Registering dynamic routes for agents...");
    await registerDynamicRoutes(app);
    logger.info("Dynamic routes registered successfully");

    // Start server only after successful database connection
    const server = app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });

    // Graceful shutdown handler
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      // Close the HTTP server first
      server.close(() => {
        logger.info("HTTP server closed");
      });

      try {
        // Close database connections
        logger.info("Closing database connections...");
        await db.destroy();
        logger.info("Database connections closed");

        logger.info("Graceful shutdown completed");
        process.exit(0);
      } catch (error) {
        logger.error("Error during graceful shutdown:", error);
        process.exit(1);
      }
    };

    // Listen for termination signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Rejection:", err);
  // Close server & exit process
  process.exit(1);
});

export default app;
