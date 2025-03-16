import { Request, Response, NextFunction } from "express";
import { AgentService } from "~/application/services/AgentService";
import { AppError } from "~/interfaces/controllers/../middlewares/errorHandler";
import { updateDynamicRoutes } from "~/interfaces/middlewares/dynamicRoutesMiddleware";
import { logger } from "~/infrastructure/logging/logger";
import app from "~/index"; // Import the Express app instance as default export

export class AgentController {
  private agentService: AgentService;

  constructor() {
    this.agentService = new AgentService();
  }

  getAllAgents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const agents = await this.agentService.getAllAgents();
      res.status(200).json({
        status: "success",
        data: {
          agents,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getAgentById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const agent = await this.agentService.getAgentById(id);

      if (!agent) {
        throw new AppError("Agent not found", 404);
      }

      res.status(200).json({
        status: "success",
        data: {
          agent,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  createAgent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const agentData = req.body;
      const newAgent = await this.agentService.createAgent(agentData);

      // Update dynamic routes after creating a new agent
      await updateDynamicRoutes(app);

      res.status(201).json({
        status: "success",
        data: {
          agent: newAgent,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  updateAgent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const agentData = req.body;

      const updatedAgent = await this.agentService.updateAgent(id, agentData);

      if (!updatedAgent) {
        throw new AppError("Agent not found", 404);
      }

      // Update dynamic routes after updating an agent
      await updateDynamicRoutes(app);

      res.status(200).json({
        status: "success",
        data: {
          agent: updatedAgent,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  deleteAgent = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      await this.agentService.deleteAgent(id);

      // Update dynamic routes after deleting an agent
      await updateDynamicRoutes(app);

      res.status(204).json({
        status: "success",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  };

  executeAgent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const requestBody = req.body;

      if (requestBody === undefined || requestBody === null) {
        throw new AppError("Request body cannot be empty", 400);
      }

      // Log the request body type and content for debugging
      logger.info(
        `Executing agent with ID: ${id}, request body type: ${typeof requestBody}`
      );

      // Handle both string and JSON payloads
      const result = await this.agentService.executeAgent(id, requestBody);

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
