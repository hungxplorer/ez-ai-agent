export type LLMType = "Gemini" | "ChatGPT" | "Deepseek" | "Grok";

export interface SchemaField {
  name: string;
  type: string;
  description?: string;
  required: boolean;
}

export interface RequestSchema {
  type: "json" | "text";
  fields?: SchemaField[];
}

export interface ResponseSchema {
  type: "json" | "text";
  fields?: SchemaField[];
}

export interface Agent {
  id: string;
  name: string;
  llmType: LLMType;
  apiKey: string;
  apiPath: string;
  systemPrompt: string;
  requestSchema?: RequestSchema;
  responseSchema?: ResponseSchema;
  createdAt: Date;
  updatedAt: Date;
}

// DTO for creating a new agent
export interface CreateAgentDTO {
  name: string;
  llmType: LLMType;
  apiKey: string;
  apiPath: string;
  systemPrompt: string;
  requestSchema?: RequestSchema;
  responseSchema?: ResponseSchema;
}
