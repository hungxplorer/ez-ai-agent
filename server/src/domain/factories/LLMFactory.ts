import { LLMType } from "~/domain/factories/../entities/Agent";
import { LLMService } from "~/domain/factories/../services/LLMService";
import { GeminiService } from "~/domain/factories/../services/GeminiService";
import { ChatGPTService } from "~/domain/factories/../services/ChatGPTService";
import { DeepseekService } from "~/domain/factories/../services/DeepseekService";
import { AppError } from "~/interfaces/middlewares/errorHandler";

export class LLMFactory {
  createLLMService(type: LLMType): LLMService {
    switch (type) {
      case "Gemini":
        return new GeminiService();
      case "ChatGPT":
        return new ChatGPTService();
      case "Deepseek":
        return new DeepseekService();
      case "Grok":
        throw new AppError("Grok service is not yet implemented", 501);
      default:
        throw new AppError(`Unknown LLM type: ${type}`, 400);
    }
  }
}
