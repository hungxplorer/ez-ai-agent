export type LLMType = "Gemini" | "ChatGPT" | "Deepseek" | "Grok" | "Claude";

export interface AIAgent {
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

export interface RequestSchema {
  type: "json" | "text";
  fields?: SchemaField[];
  description?: string;
}

export interface ResponseSchema {
  type: "json" | "text";
  fields?: SchemaField[];
  description?: string;
}

export interface SchemaField {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  required: boolean;
  description?: string;
  properties?: SchemaField[]; // For object type
  items?: SchemaField; // For array type
}

export interface ThemeMode {
  colorMode: "light" | "dark";
}
