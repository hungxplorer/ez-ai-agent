import { AIAgent } from "../types";
import { API_BASE_URL, DEFAULT_HEADERS, handleApiResponse } from "./config";
import { useApiRequests } from "./useApiRequest";

/**
 * Agent API service
 * Provides methods for interacting with the agent endpoints
 */
export const agentApi = {
  /**
   * Get all agents
   * @returns Promise with array of agents
   */
  getAllAgents: async (): Promise<AIAgent[]> => {
    const response = await fetch(`${API_BASE_URL}/agents`, {
      method: "GET",
      headers: DEFAULT_HEADERS,
    });

    const data = await handleApiResponse(response);
    return data.data.agents;
  },

  /**
   * Get agent by ID
   * @param id - Agent ID
   * @returns Promise with agent data
   */
  getAgentById: async (id: string): Promise<AIAgent> => {
    const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
      method: "GET",
      headers: DEFAULT_HEADERS,
    });

    const data = await handleApiResponse(response);
    return data.data.agent;
  },

  /**
   * Create a new agent
   * @param agentData - Agent data without id, createdAt, updatedAt
   * @returns Promise with created agent
   */
  createAgent: async (
    agentData: Omit<AIAgent, "id" | "createdAt" | "updatedAt">
  ): Promise<AIAgent> => {
    const response = await fetch(`${API_BASE_URL}/agents`, {
      method: "POST",
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(agentData),
    });

    const data = await handleApiResponse(response);
    return data.data.agent;
  },

  /**
   * Update an existing agent
   * @param id - Agent ID
   * @param agentData - Partial agent data to update
   * @returns Promise with updated agent
   */
  updateAgent: async (
    id: string,
    agentData: Partial<AIAgent>
  ): Promise<AIAgent> => {
    console.log("API: Updating agent with ID:", id);
    console.log("API: Update data:", JSON.stringify(agentData, null, 2));

    try {
      const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
        method: "PUT",
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(agentData),
      });

      const data = await handleApiResponse(response);
      console.log("API: Update response:", data);
      return data.data.agent;
    } catch (error) {
      console.error("API: Error updating agent:", error);
      throw error;
    }
  },

  /**
   * Delete an agent
   * @param id - Agent ID
   * @returns Promise that resolves when deletion is complete
   */
  deleteAgent: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
      method: "DELETE",
      headers: DEFAULT_HEADERS,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Error deleting agent: ${response.status} ${response.statusText}`
      );
    }
  },

  /**
   * Execute an agent with input
   * @param id - Agent ID
   * @param input - Input data for the agent
   * @returns Promise with execution result
   */
  executeAgent: async (
    id: string,
    input: string | Record<string, unknown>
  ): Promise<unknown> => {
    const response = await fetch(`${API_BASE_URL}/agents/${id}/execute`, {
      method: "POST",
      headers: DEFAULT_HEADERS,
      body: JSON.stringify(input),
    });

    const data = await handleApiResponse(response);
    return data;
  },
};

/**
 * Hook-based Agent API
 * Uses the API context for loading indicators and error handling
 */
export const useAgentApi = () => {
  const api = useApiRequests();

  return {
    /**
     * Get all agents with loading indicator
     */
    getAllAgents: async (): Promise<AIAgent[]> => {
      const data = await api.get<{
        status: string;
        data: { agents: AIAgent[] };
      }>(`${API_BASE_URL}/agents`);
      return data.data.agents;
    },

    /**
     * Get agent by ID with loading indicator
     */
    getAgentById: async (id: string): Promise<AIAgent> => {
      const data = await api.get<{ status: string; data: { agent: AIAgent } }>(
        `${API_BASE_URL}/agents/${id}`
      );
      return data.data.agent;
    },

    /**
     * Create a new agent with loading indicator
     */
    createAgent: async (
      agentData: Omit<AIAgent, "id" | "createdAt" | "updatedAt">
    ): Promise<AIAgent> => {
      const data = await api.post<{ status: string; data: { agent: AIAgent } }>(
        `${API_BASE_URL}/agents`,
        agentData
      );
      return data.data.agent;
    },

    /**
     * Update an existing agent with loading indicator
     */
    updateAgent: async (
      id: string,
      agentData: Partial<AIAgent>
    ): Promise<AIAgent> => {
      console.log("Hook API: Updating agent with ID:", id);
      console.log("Hook API: Update data:", JSON.stringify(agentData, null, 2));

      try {
        const data = await api.put<{
          status: string;
          data: { agent: AIAgent };
        }>(`${API_BASE_URL}/agents/${id}`, agentData);
        console.log("Hook API: Update response:", data);
        return data.data.agent;
      } catch (error) {
        console.error("Hook API: Error updating agent:", error);
        throw error;
      }
    },

    /**
     * Delete an agent with loading indicator
     */
    deleteAgent: async (id: string): Promise<void> => {
      await api.del<{ status: string; data: null }>(
        `${API_BASE_URL}/agents/${id}`
      );
    },

    /**
     * Execute an agent with loading indicator
     */
    executeAgent: async (
      id: string,
      input: string | Record<string, unknown>
    ): Promise<unknown> => {
      const data = await api.post<{ status: string; data: unknown }>(
        `${API_BASE_URL}/agents/${id}/execute`,
        input
      );
      return data;
    },
  };
};
