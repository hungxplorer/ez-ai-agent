import { Agent } from "~/domain/entities/Agent";
import { LLMService } from "./LLMService";
import { logger } from "~/infrastructure/logging/logger";
import { AppError } from "~/interfaces/middlewares/errorHandler";
import axios, { AxiosError } from "axios";

export class ClaudeService implements LLMService {
  private readonly API_BASE_URL = "https://api.anthropic.com/v1";
  private readonly DEFAULT_MODEL =
    process.env.DEFAULT_CLAUDE_MODEL || "claude-3-7-sonnet-20250219";

  async executePrompt(agent: Agent, input: unknown): Promise<unknown> {
    try {
      logger.info(`Executing Claude prompt for agent: ${agent.name}`);

      // Format the prompt with system prompt and input
      const formattedPrompt = this.formatPrompt(agent, input);

      // Call the Claude API
      const response = await this.callClaudeAPI(agent.apiKey, formattedPrompt);

      // Get the raw text response
      const rawResponse = response.content?.[0]?.text || "";

      // Check if the agent has a responseSchema and if it's type is json
      if (agent.responseSchema?.type === "json") {
        try {
          // Try to parse the response as JSON
          logger.info(`Formatting response as JSON for agent: ${agent.name}`);

          // First try to extract JSON if it's wrapped in markdown code blocks
          const jsonMatch = rawResponse.match(
            /```(?:json)?\s*([\s\S]*?)\s*```/
          );
          if (jsonMatch && jsonMatch[1]) {
            try {
              return JSON.parse(jsonMatch[1]);
            } catch (innerError) {
              logger.warn(
                "Failed to parse JSON from code block, trying raw response"
              );
            }
          }

          return JSON.parse(rawResponse);
        } catch (parseError) {
          logger.error(
            `Failed to parse response as JSON for agent: ${agent.name}`,
            parseError
          );

          // If parsing fails, return the raw response as a string instead of throwing an error
          logger.warn(
            `Returning raw response as string due to JSON parsing failure`
          );
          return {
            rawResponse: rawResponse,
            parsingError: "Failed to parse as JSON. Returning raw response.",
          };
        }
      } else {
        // Return the raw text response
        return rawResponse;
      }
    } catch (error: unknown) {
      logger.error(
        `Error executing Claude prompt for agent ${agent.id}`,
        error
      );

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const statusCode = axiosError.response?.status || 500;
        const errorData = axiosError.response?.data as
          | { error?: { message?: string } }
          | undefined;
        const errorMessage =
          errorData?.error?.message || "Failed to execute Claude prompt";
        throw new AppError(errorMessage, statusCode);
      }

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError("Failed to execute Claude prompt", 500);
    }
  }

  private formatPrompt(agent: Agent, input: unknown): any {
    // Format messages for Claude API
    let systemPrompt = agent.systemPrompt || "";

    // Add JSON format instructions if needed
    if (agent.responseSchema?.type === "json") {
      const jsonInstructions = this.generateJsonInstructions(agent);
      systemPrompt = `${systemPrompt}\n\n${jsonInstructions}`;
    }

    // Format the user input
    const userInput = typeof input === "string" ? input : JSON.stringify(input);

    return {
      model: this.DEFAULT_MODEL,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userInput,
        },
      ],
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 0.95,
    };
  }

  private generateJsonInstructions(agent: Agent): string {
    let instructions = "RESPONSE FORMAT: You must respond with valid JSON.";

    if (
      agent.responseSchema?.fields &&
      agent.responseSchema.fields.length > 0
    ) {
      instructions += " Your response must include the following fields:";

      const requiredFields = agent.responseSchema.fields
        .filter((field) => field.required)
        .map(
          (field) =>
            `"${field.name}" (${field.type}${
              field.description ? `: ${field.description}` : ""
            })`
        );

      const optionalFields = agent.responseSchema.fields
        .filter((field) => !field.required)
        .map(
          (field) =>
            `"${field.name}" (${field.type}${
              field.description ? `: ${field.description}` : ""
            })`
        );

      if (requiredFields.length > 0) {
        instructions += `\nRequired fields: ${requiredFields.join(", ")}`;
      }

      if (optionalFields.length > 0) {
        instructions += `\nOptional fields: ${optionalFields.join(", ")}`;
      }
    }

    return instructions;
  }

  private async callClaudeAPI(apiKey: string, data: any): Promise<any> {
    const url = `${this.API_BASE_URL}/messages`;

    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2024-02-15",
      },
    });

    return response.data;
  }
}
