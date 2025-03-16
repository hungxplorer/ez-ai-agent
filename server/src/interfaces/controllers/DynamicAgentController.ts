import { Request, Response, NextFunction } from "express";
import { AgentService } from "~/application/services/AgentService";
import { AppError } from "~/interfaces/middlewares/errorHandler";
import { logger } from "~/infrastructure/logging/logger";

export class DynamicAgentController {
  private agentService: AgentService;

  constructor() {
    this.agentService = new AgentService();
  }

  /**
   * Execute an agent based on the API path
   */
  executeAgentByPath = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      // Get the API path from the request and remove the /api prefix
      let apiPath = req.path;

      // If the path is empty after removing the prefix, set it to '/'
      if (!apiPath) {
        apiPath = "/";
      }

      // Check if the path has prefix /api
      if (!apiPath.startsWith("/api")) {
        apiPath = "/api" + apiPath;
      }

      logger.info(`Executing agent with API path: ${apiPath}`);

      // Use the entire request body as input
      const requestBody = req.body;

      if (requestBody === undefined || requestBody === null) {
        throw new AppError("Request body cannot be empty", 400);
      }

      // Log the request body type for debugging
      logger.info(`Request body type: ${typeof requestBody}`);

      // Execute the agent with the entire request body
      const result = await this.agentService.executeAgentByApiPath(
        apiPath,
        requestBody
      );

      // Return the raw result directly without wrapping it
      res.status(200).json(result);
    } catch (error) {
      // Provide more detailed error messages for schema validation errors
      if (error instanceof AppError) {
        if (
          error.message.includes("Invalid request format") ||
          error.message.includes("Missing required request field") ||
          error.message.includes("Invalid request field type")
        ) {
          logger.warn(`Request schema validation error: ${error.message}`);
          return res.status(error.statusCode).json({
            status: "error",
            message: error.message,
            details:
              "The request does not match the required schema. Please check the API documentation for the correct format.",
          });
        }

        if (
          error.message.includes("Invalid response format") ||
          error.message.includes("Missing required response field") ||
          error.message.includes("Invalid response field type") ||
          error.message.includes("LLM returned invalid JSON response")
        ) {
          logger.error(`Response schema validation error: ${error.message}`);
          return res.status(error.statusCode).json({
            status: "error",
            message:
              "The AI model generated an invalid response that doesn't match the required schema.",
            details: error.message,
          });
        }
      }

      next(error);
    }
  };
}
