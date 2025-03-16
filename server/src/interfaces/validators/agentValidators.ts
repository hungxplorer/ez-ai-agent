import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { AppError } from "~/interfaces/validators/../middlewares/errorHandler";

// Middleware to validate request
const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(
      `Validation error: ${errors
        .array()
        .map((err) => err.msg)
        .join(", ")}`,
      400
    );
  }
  next();
};

// Validate agent creation
export const validateAgentCreate = [
  body("name")
    .notEmpty()
    .withMessage("Agent name is required")
    .isString()
    .withMessage("Agent name must be a string")
    .isLength({ min: 3, max: 100 })
    .withMessage("Agent name must be between 3 and 100 characters"),

  body("llmType")
    .notEmpty()
    .withMessage("LLM type is required")
    .isIn(["Gemini", "ChatGPT", "Deepseek", "Grok", "Claude"])
    .withMessage("Invalid LLM type"),

  body("apiKey")
    .notEmpty()
    .withMessage("API key is required")
    .isString()
    .withMessage("API key must be a string"),

  body("apiPath")
    .notEmpty()
    .withMessage("API path is required")
    .isString()
    .withMessage("API path must be a string")
    .matches(/^\/[a-zA-Z0-9\-_\/]*$/)
    .withMessage(
      "API path must start with / and contain only letters, numbers, hyphens, and underscores"
    ),

  body("systemPrompt")
    .notEmpty()
    .withMessage("System prompt is required")
    .isString()
    .withMessage("System prompt must be a string"),

  validateRequest,
];

// Validate agent update
export const validateAgentUpdate = [
  body("name")
    .optional()
    .isString()
    .withMessage("Agent name must be a string")
    .isLength({ min: 3, max: 100 })
    .withMessage("Agent name must be between 3 and 100 characters"),

  body("llmType")
    .optional()
    .isIn(["Gemini", "ChatGPT", "Deepseek", "Grok", "Claude"])
    .withMessage("Invalid LLM type"),

  body("apiKey").optional().isString().withMessage("API key must be a string"),

  body("apiPath")
    .optional()
    .isString()
    .withMessage("API path must be a string")
    .matches(/^\/[a-zA-Z0-9\-_\/]*$/)
    .withMessage(
      "API path must start with / and contain only letters, numbers, hyphens, and underscores"
    ),

  body("systemPrompt")
    .optional()
    .isString()
    .withMessage("System prompt must be a string"),

  validateRequest,
];
