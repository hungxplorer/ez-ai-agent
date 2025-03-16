import { create } from "zustand";
import { AIAgent } from "../types";
import { agentApi } from "../api";

interface AgentState {
  agents: AIAgent[];
  isLoading: boolean;
  error: string | null;
  fetchAgents: () => Promise<void>;
  fetchAgentById: (id: string) => Promise<AIAgent | undefined>;
  addAgent: (
    agent: Omit<AIAgent, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateAgent: (id: string, agent: Partial<AIAgent>) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  getAgentById: (id: string) => AIAgent | undefined;
  addFetchedAgent: (agent: AIAgent) => void;
}

// Using the centralized API service
export const useAgentStore = create<AgentState>((set, get) => ({
  agents: [],
  isLoading: false,
  error: null,

  fetchAgents: async () => {
    set({ isLoading: true, error: null });
    try {
      const agents = await agentApi.getAllAgents();
      set({ agents, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchAgentById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const agent = await agentApi.getAgentById(id);
      // Add the fetched agent to the store
      get().addFetchedAgent(agent);
      set({ isLoading: false });
      return agent;
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      return undefined;
    }
  },

  addAgent: async (agentData) => {
    set({ isLoading: true, error: null });
    try {
      const newAgent = await agentApi.createAgent(agentData);
      set((state) => ({
        agents: [...state.agents, newAgent],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateAgent: async (id, agentData) => {
    set({ isLoading: true, error: null });
    try {
      console.log("Store: Updating agent with ID:", id);
      console.log("Store: Update data:", JSON.stringify(agentData, null, 2));

      const updatedAgent = await agentApi.updateAgent(id, agentData);
      console.log("Store: Agent updated successfully:", updatedAgent);

      set((state) => ({
        agents: state.agents.map((agent) =>
          agent.id === id ? updatedAgent : agent
        ),
        isLoading: false,
      }));

      // Don't return the updatedAgent to match the Promise<void> return type
    } catch (error) {
      console.error("Store: Error updating agent:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to update agent",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteAgent: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await agentApi.deleteAgent(id);
      set((state) => ({
        agents: state.agents.filter((agent) => agent.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  getAgentById: (id) => {
    return get().agents.find((agent) => agent.id === id);
  },

  addFetchedAgent: (agent) => {
    set((state) => {
      // Check if the agent already exists in the store
      const exists = state.agents.some((a) => a.id === agent.id);
      if (exists) {
        // Update the existing agent
        return {
          agents: state.agents.map((a) => (a.id === agent.id ? agent : a)),
        };
      } else {
        // Add the new agent
        return {
          agents: [...state.agents, agent],
        };
      }
    });
  },
}));
