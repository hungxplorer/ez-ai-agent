import knex from "knex";
import { logger } from "~/infrastructure/database/../logging/logger";

// Database configuration
const config = {
  client: "pg",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "llm_api_builder",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: "knex_migrations",
    directory: "./migrations",
  },
  seeds: {
    directory: "./seeds",
  },
};

// Create knex instance
export const db = knex(config);

/**
 * Check if the database connection is alive
 * @param timeout - Timeout in milliseconds (default: 5000ms)
 * @returns Promise that resolves to true if connected, false otherwise
 */
export const checkDbConnection = async (timeout = 5000): Promise<boolean> => {
  try {
    // Try to connect to the database with a timeout
    const connectPromise = db.raw("SELECT 1");

    // Set a timeout for the connection attempt
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Database connection timeout after ${timeout}ms`));
      }, timeout);
    });

    // Race the connection against the timeout
    await Promise.race([connectPromise, timeoutPromise]);
    return true;
  } catch (error) {
    logger.error("Database connection check failed:", error);
    return false;
  }
};

/**
 * Wait for database connection to be established
 * @param maxRetries - Maximum number of retries (default: 5)
 * @param retryInterval - Interval between retries in milliseconds (default: 2000ms)
 * @returns Promise that resolves when connected or rejects after max retries
 */
export const waitForDbConnection = async (
  maxRetries = 5,
  retryInterval = 2000
): Promise<void> => {
  let retries = 0;

  while (retries < maxRetries) {
    const isConnected = await checkDbConnection();

    if (isConnected) {
      logger.info("Database connection established");
      return;
    }

    retries++;
    logger.warn(
      `Database connection attempt ${retries}/${maxRetries} failed, retrying in ${retryInterval}ms...`
    );

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, retryInterval));
  }

  throw new Error(`Failed to connect to database after ${maxRetries} attempts`);
};

/**
 * Get database connection status information
 * @returns Promise with connection status information
 */
export const getDbStatus = async (): Promise<{
  connected: boolean;
  timestamp: string;
  databaseName?: string;
  host?: string;
}> => {
  try {
    // Check connection and get database info
    const result = await db.raw(
      "SELECT current_database() as db_name, inet_server_addr() as host"
    );

    return {
      connected: true,
      timestamp: new Date().toISOString(),
      databaseName: result.rows[0]?.db_name,
      host: result.rows[0]?.host,
    };
  } catch (error) {
    return {
      connected: false,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Initialize database connection
 * This function checks if the database is accessible before the server starts
 * @param maxRetries - Maximum number of connection retry attempts
 * @param retryInterval - Interval between retries in milliseconds
 * @returns Promise that resolves when connection is successful or rejects on failure
 */
export const dbInit = async (
  maxRetries = 5,
  retryInterval = 2000
): Promise<void> => {
  try {
    logger.info(
      `Initializing database connection (max retries: ${maxRetries}, interval: ${retryInterval}ms)...`
    );

    // Get connection parameters for logging
    const { host, port, database } = config.connection as any;
    logger.info(`Connecting to PostgreSQL at ${host}:${port}/${database}`);

    // Wait for database connection with retry logic
    await waitForDbConnection(maxRetries, retryInterval);

    logger.info("Database initialization completed successfully");
  } catch (error) {
    logger.error("Database initialization failed:", error);
    // Re-throw the error to be caught by the server startup process
    throw new Error(
      `Failed to initialize database: ${(error as Error).message}`
    );
  }
};
