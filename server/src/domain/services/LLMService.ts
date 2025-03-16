import { Agent } from "~/domain/services/../entities/Agent";

export interface LLMService {
  executePrompt(agent: Agent, input: unknown): Promise<unknown>;
}
