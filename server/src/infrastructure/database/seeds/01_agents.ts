import { Knex } from "knex";
import { v4 as uuidv4 } from "uuid";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("agents").del();

  // Insert seed entries
  await knex("agents").insert([
    {
      id: uuidv4(),
      name: "Gemini Code Assistant",
      llmType: "Gemini",
      apiKey: "dummy-api-key-1",
      apiPath: "/api/code-assistant",
      systemPrompt:
        "You are a helpful code assistant. Provide clear and concise code examples when asked.",
      requestSchema: JSON.stringify({
        type: "json",
        fields: [
          {
            name: "language",
            type: "string",
            description: "Programming language",
            required: true,
          },
          {
            name: "query",
            type: "string",
            description: "User query",
            required: true,
          },
        ],
      }),
      responseSchema: JSON.stringify({
        type: "json",
        fields: [
          {
            name: "code",
            type: "string",
            description: "Generated code",
            required: true,
          },
          {
            name: "explanation",
            type: "string",
            description: "Explanation of the code",
            required: true,
          },
        ],
      }),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuidv4(),
      name: "ChatGPT Content Writer",
      llmType: "ChatGPT",
      apiKey: "dummy-api-key-2",
      apiPath: "/api/content-writer",
      systemPrompt:
        "You are a professional content writer. Create engaging and informative content based on the given topic.",
      requestSchema: JSON.stringify({
        type: "json",
        fields: [
          {
            name: "topic",
            type: "string",
            description: "Content topic",
            required: true,
          },
          {
            name: "tone",
            type: "string",
            description: "Writing tone (formal, casual, etc.)",
            required: false,
          },
          {
            name: "wordCount",
            type: "number",
            description: "Target word count",
            required: false,
          },
        ],
      }),
      responseSchema: JSON.stringify({
        type: "json",
        fields: [
          {
            name: "title",
            type: "string",
            description: "Content title",
            required: true,
          },
          {
            name: "content",
            type: "string",
            description: "Generated content",
            required: true,
          },
          {
            name: "wordCount",
            type: "number",
            description: "Actual word count",
            required: true,
          },
        ],
      }),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuidv4(),
      name: "Deepseek Data Analyzer",
      llmType: "Deepseek",
      apiKey: "dummy-api-key-3",
      apiPath: "/api/data-analyzer",
      systemPrompt:
        "You are a data analysis expert. Analyze the provided data and provide insights.",
      requestSchema: JSON.stringify({
        type: "json",
        fields: [
          {
            name: "data",
            type: "array",
            description: "Array of data points to analyze",
            required: true,
          },
          {
            name: "analysisType",
            type: "string",
            description: "Type of analysis to perform",
            required: true,
          },
        ],
      }),
      responseSchema: JSON.stringify({
        type: "json",
        fields: [
          {
            name: "summary",
            type: "string",
            description: "Summary of analysis",
            required: true,
          },
          {
            name: "insights",
            type: "array",
            description: "Array of insights",
            required: true,
          },
          {
            name: "recommendations",
            type: "array",
            description: "Array of recommendations",
            required: true,
          },
        ],
      }),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}
