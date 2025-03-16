import { Agent } from "~/domain/entities/Agent";
import { AgentRepository } from "~/infrastructure/repositories/AgentRepository";
import { LLMFactory } from "~/domain/factories/LLMFactory";
import { SchemaValidationService } from "~/domain/services/SchemaValidationService";
import { AppError } from "~/interfaces/middlewares/errorHandler";
import { logger } from "~/infrastructure/logging/logger";

export class AgentService {
  private agentRepository: AgentRepository;
  private llmFactory: LLMFactory;
  private schemaValidationService: SchemaValidationService;

  constructor() {
    this.agentRepository = new AgentRepository();
    this.llmFactory = new LLMFactory();
    this.schemaValidationService = new SchemaValidationService();
  }

  async getAllAgents(): Promise<Agent[]> {
    try {
      return await this.agentRepository.findAll();
    } catch (error) {
      logger.error("Error getting all agents", error);
      throw new AppError("Failed to retrieve agents", 500);
    }
  }

  async getAgentById(id: string): Promise<Agent | null> {
    try {
      return await this.agentRepository.findById(id);
    } catch (error) {
      logger.error(`Error getting agent with id ${id}`, error);
      throw new AppError("Failed to retrieve agent", 500);
    }
  }

  async getAgentByApiPath(apiPath: string): Promise<Agent | null> {
    try {
      return await this.agentRepository.findByApiPath(apiPath);
    } catch (error) {
      logger.error(`Error getting agent with apiPath ${apiPath}`, error);
      throw new AppError("Failed to retrieve agent", 500);
    }
  }

  async createAgent(agentData: Partial<Agent>): Promise<Agent> {
    try {
      // Validate agent data
      if (!agentData.name || !agentData.llmType || !agentData.apiKey) {
        throw new AppError("Missing required agent fields", 400);
      }

      return await this.agentRepository.create(agentData as Agent);
    } catch (error) {
      if (error instanceof AppError) throw error;

      logger.error("Error creating agent", error);
      throw new AppError("Failed to create agent", 500);
    }
  }

  async updateAgent(
    id: string,
    agentData: Partial<Agent>
  ): Promise<Agent | null> {
    try {
      const existingAgent = await this.agentRepository.findById(id);

      if (!existingAgent) {
        return null;
      }

      return await this.agentRepository.update(id, agentData);
    } catch (error) {
      logger.error(`Error updating agent with id ${id}`, error);
      throw new AppError("Failed to update agent", 500);
    }
  }

  async deleteAgent(id: string): Promise<void> {
    try {
      const existingAgent = await this.agentRepository.findById(id);

      if (!existingAgent) {
        throw new AppError("Agent not found", 404);
      }

      await this.agentRepository.delete(id);
    } catch (error) {
      if (error instanceof AppError) throw error;

      logger.error(`Error deleting agent with id ${id}`, error);
      throw new AppError("Failed to delete agent", 500);
    }
  }

  async executeAgent(id: string, requestBody: any): Promise<any> {
    logger.info(`Executing agent with ID: ${id}`);

    const agent = await this.agentRepository.findById(id);

    if (!agent) {
      throw new AppError(`Agent with ID ${id} not found`, 404);
    }

    try {
      // Validate request against schema
      const validatedRequest = this.schemaValidationService.validateRequest(
        requestBody,
        agent.requestSchema
      );

      logger.info(`Request validated successfully for agent: ${agent.name}`);

      // Get the appropriate LLM service based on agent type
      const llmService = this.llmFactory.createLLMService(agent.llmType);

      // Execute the prompt with the LLM service and the validated request
      const result = await llmService.executePrompt(agent, validatedRequest);

      // Validate response against schema
      const validatedResponse = this.schemaValidationService.validateResponse(
        result,
        agent.responseSchema
      );

      logger.info(`Response validated successfully for agent: ${agent.name}`);

      return validatedResponse;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error(`Error executing agent ${id}:`, error);
      throw new AppError(
        `Failed to execute agent: ${(error as Error).message}`,
        500
      );
    }
  }

  async executeAgentByApiPath(apiPath: string, requestBody: any): Promise<any> {
    logger.info(`Executing agent with API path: ${apiPath}`);

    const agent = await this.agentRepository.findByApiPath(apiPath);

    if (!agent) {
      logger.error(`No agent found for API path: ${apiPath}`);
      throw new AppError(`Agent with API path ${apiPath} not found`, 404);
    }

    logger.info(
      `Found agent: ${agent.name} (ID: ${agent.id}) for API path: ${apiPath}`
    );

    try {
      // Validate request against schema
      const validatedRequest = this.schemaValidationService.validateRequest(
        requestBody,
        agent.requestSchema
      );

      logger.info(`Request validated successfully for agent: ${agent.name}`);

      // Get the appropriate LLM service based on agent type
      const llmService = this.llmFactory.createLLMService(agent.llmType);

      logger.info(
        `Using LLM service: ${agent.llmType} for agent: ${agent.name}`
      );

      // Execute the prompt with the LLM service and the validated request
      const result = await llmService.executePrompt(agent, validatedRequest);

      // Validate response against schema
      const validatedResponse = this.schemaValidationService.validateResponse(
        result,
        agent.responseSchema
      );

      logger.info(`Response validated successfully for agent: ${agent.name}`);

      logger.info(
        `Successfully executed agent: ${agent.name} with API path: ${apiPath}`
      );

      return validatedResponse;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error(`Error executing agent with API path ${apiPath}:`, error);
      throw new AppError(
        `Failed to execute agent: ${(error as Error).message}`,
        500
      );
    }
  }
}
