import { Express, Request, Response, NextFunction } from "express";
import { AgentRepository } from "~/infrastructure/repositories/AgentRepository";
import { DynamicAgentController } from "~/interfaces/controllers/DynamicAgentController";
import { logger } from "~/infrastructure/logging/logger";

/**
 * Middleware to register dynamic routes from the database
 * @param app Express application
 */
export const registerDynamicRoutes = async (app: Express): Promise<void> => {
  try {
    const agentRepository = new AgentRepository();
    const dynamicAgentController = new DynamicAgentController();

    // Get all agents from the database
    const agents = await agentRepository.findAll();
    let registeredCount = 0;

    // Register a route for each agent
    agents.forEach((agent) => {
      if (agent.apiPath) {
        // Ensure the path starts with a slash
        let routePath = agent.apiPath;
        if (!routePath.startsWith("/")) {
          routePath = "/" + routePath;
        }

        logger.info(
          `Registering dynamic route for agent: ${agent.name} at path: ${routePath}`
        );

        // Register POST route for the agent's API path
        app.post(routePath, dynamicAgentController.executeAgentByPath);
        registeredCount++;
      }
    });

    logger.info(`Registered ${registeredCount} dynamic routes`);
  } catch (error) {
    logger.error("Error registering dynamic routes:", error);
  }
};

/**
 * Middleware to handle dynamic route updates
 * This should be called after a new agent is created or an existing agent is updated
 * @param app Express application
 */
export const updateDynamicRoutes = async (app: Express): Promise<void> => {
  try {
    // Clear existing routes (this is a simplified approach)
    // In a production environment, you might want to use a more sophisticated approach
    // to avoid clearing all routes

    // Re-register all dynamic routes
    await registerDynamicRoutes(app);
  } catch (error) {
    logger.error("Error updating dynamic routes:", error);
  }
};
