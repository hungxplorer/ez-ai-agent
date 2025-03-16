import { Agent } from "~/domain/entities/Agent";
import { LLMService } from "./LLMService";
import { logger } from "~/infrastructure/logging/logger";
import { AppError } from "~/interfaces/middlewares/errorHandler";
import axios, { AxiosError } from "axios";

export class GeminiService implements LLMService {
  private readonly API_BASE_URL =
    "https://generativelanguage.googleapis.com/v1beta";
  private readonly DEFAULT_MODEL =
    process.env.DEFAULT_GEMINI_MODEL || "gemini-2.0-flash";

  async executePrompt(agent: Agent, input: unknown): Promise<unknown> {
    try {
      logger.info(`Executing Gemini prompt for agent: ${agent.name}`);

      // Format the prompt with system prompt and input
      const formattedPrompt = this.formatPrompt(agent, input);

      // Call the Gemini API
      const response = await this.callGeminiAPI(agent.apiKey, formattedPrompt);

      // Get the raw text response
      const rawResponse =
        response.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // Check if the agent has a responseSchema and if it's type is json
      if (agent.responseSchema?.type === "json") {
        try {
          // Try to parse the response as JSON
          logger.info(`Formatting response as JSON for agent: ${agent.name}`);

          try {
            // Use the parseJsonString function to handle various JSON formats
            return this.parseJsonString(rawResponse);
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
        } catch (error) {
          logger.error(
            `Error in JSON processing for agent: ${agent.name}`,
            error
          );
          return {
            rawResponse: rawResponse,
            parsingError: "Error in JSON processing. Returning raw response.",
          };
        }
      } else {
        // Return the raw text response
        return rawResponse;
      }
    } catch (error: unknown) {
      logger.error(
        `Error executing Gemini prompt for agent ${agent.id}`,
        error
      );

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const statusCode = axiosError.response?.status || 500;
        const errorData = axiosError.response?.data as
          | { error?: { message?: string } }
          | undefined;
        const errorMessage =
          errorData?.error?.message || "Failed to execute Gemini prompt";
        throw new AppError(errorMessage, statusCode);
      }

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError("Failed to execute Gemini prompt", 500);
    }
  }

  private formatPrompt(agent: Agent, input: unknown): any {
    // Format the prompt for Gemini API
    const contents = [];

    // Add system prompt if provided
    if (agent.systemPrompt) {
      // Add response format instructions if JSON is expected
      let systemPrompt = agent.systemPrompt;

      if (agent.responseSchema?.type === "json") {
        // Add JSON format instructions
        const jsonInstructions = this.generateJsonInstructions(agent);
        systemPrompt = `${systemPrompt}\n\n${jsonInstructions}`;
      }

      contents.push({
        role: "user",
        parts: [
          {
            text: systemPrompt,
          },
        ],
      });
    }

    // Add user input
    contents.push({
      role: "user",
      parts: [
        { text: typeof input === "string" ? input : JSON.stringify(input) },
      ],
    });

    return {
      contents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
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

  private async callGeminiAPI(apiKey: string, prompt: any): Promise<any> {
    const url = `${this.API_BASE_URL}/models/${this.DEFAULT_MODEL}:generateContent?key=${apiKey}`;

    const response = await axios.post(url, prompt, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  }

  /**
   * Parse a JSON string with special handling for code blocks and escaped characters
   * @param input The string to parse as JSON
   * @returns The parsed JSON object
   */
  private parseJsonString(input: string): any {
    // Loại bỏ code block đầu vào (```json, ```javascript, ```css, v.v.)
    input = input.replace(/```(\w+)?/g, "").trim();

    // Nếu chuỗi bị escape, giải mã nó
    if (input.startsWith('"') && input.endsWith('"')) {
      input = input.slice(1, -1).replace(/\\"/g, '"');
    }

    // Parse JSON thành object
    const parsedJson = JSON.parse(input);

    // Xử lý mọi thuộc tính chứa code block (```xxx\n...\n```)
    function cleanCodeBlocks(obj: any): void {
      for (const key in obj) {
        if (typeof obj[key] === "string") {
          obj[key] = obj[key]
            .replace(/```[\w]*\n([\s\S]*?)\n```/g, "$1")
            .trim();
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          cleanCodeBlocks(obj[key]); // Đệ quy nếu có object con
        }
      }
    }

    cleanCodeBlocks(parsedJson);
    return parsedJson;
  }
}
