import { v4 as uuidv4 } from "uuid";
import { db } from "~/infrastructure/repositories/../database/knex";
import { Agent } from "~/domain/entities/Agent";
import { logger } from "~/infrastructure/repositories/../logging/logger";

export class AgentRepository {
  private readonly tableName = "agents";

  async findAll(): Promise<Agent[]> {
    try {
      return await db(this.tableName).select("*");
    } catch (error) {
      logger.error("Error finding all agents", error);
      throw error;
    }
  }

  async findById(id: string): Promise<Agent | null> {
    try {
      const agent = await db(this.tableName).where({ id }).first();
      return agent || null;
    } catch (error) {
      logger.error(`Error finding agent with id ${id}`, error);
      throw error;
    }
  }

  async findByApiPath(apiPath: string): Promise<Agent | null> {
    try {
      // Normalize the path by ensuring it starts with a slash
      let normalizedPath = apiPath;
      if (!normalizedPath.startsWith("/")) {
        normalizedPath = "/" + normalizedPath;
      }

      logger.info(
        `Looking for agent with normalized API path: ${normalizedPath}`
      );

      // Try to find with the normalized path
      let agent = await db(this.tableName)
        .where({ apiPath: normalizedPath })
        .first();

      // If not found, try without the leading slash
      if (!agent && normalizedPath.startsWith("/")) {
        const pathWithoutSlash = normalizedPath.substring(1);
        logger.info(
          `Agent not found, trying without leading slash: ${pathWithoutSlash}`
        );
        agent = await db(this.tableName)
          .where({ apiPath: pathWithoutSlash })
          .first();
      }

      return agent || null;
    } catch (error) {
      logger.error(`Error finding agent with apiPath ${apiPath}`, error);
      throw error;
    }
  }

  async create(
    agent: Omit<Agent, "id" | "createdAt" | "updatedAt">
  ): Promise<Agent> {
    try {
      const now = new Date();
      const newAgent: Agent = {
        ...agent,
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
      };

      await db(this.tableName).insert(newAgent);
      return newAgent;
    } catch (error) {
      logger.error("Error creating agent", error);
      throw error;
    }
  }

  async update(id: string, agentData: Partial<Agent>): Promise<Agent | null> {
    try {
      const updatedAgent = {
        ...agentData,
        updatedAt: new Date(),
      };

      await db(this.tableName).where({ id }).update(updatedAgent);

      return this.findById(id);
    } catch (error) {
      logger.error(`Error updating agent with id ${id}`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await db(this.tableName).where({ id }).delete();
    } catch (error) {
      logger.error(`Error deleting agent with id ${id}`, error);
      throw error;
    }
  }
}
