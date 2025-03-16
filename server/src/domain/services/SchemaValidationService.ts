import {
  RequestSchema,
  ResponseSchema,
  SchemaField,
} from "~/domain/entities/Agent";
import { AppError } from "~/interfaces/middlewares/errorHandler";
import { logger } from "~/infrastructure/logging/logger";

export class SchemaValidationService {
  /**
   * Validate request body against the defined request schema
   * @param requestBody The request body to validate
   * @param schema The schema to validate against
   * @returns The validated request body
   * @throws AppError if validation fails
   */
  validateRequest(requestBody: any, schema?: RequestSchema): any {
    if (!schema) {
      // If no schema is defined, return the request body as is
      return requestBody;
    }

    logger.info(`Validating request against schema type: ${schema.type}`);

    // For text schema
    if (schema.type === "text") {
      if (typeof requestBody !== "string") {
        throw new AppError(
          "Invalid request format: Expected a string for text schema",
          400
        );
      }
      return requestBody;
    }

    // For JSON schema
    if (schema.type === "json") {
      // If requestBody is a string, try to parse it as JSON
      let jsonBody = requestBody;
      if (typeof requestBody === "string") {
        try {
          jsonBody = JSON.parse(requestBody);
        } catch (error) {
          throw new AppError(
            "Invalid request format: Expected valid JSON",
            400
          );
        }
      }

      // If no fields are defined, return the JSON body as is
      if (!schema.fields || schema.fields.length === 0) {
        return jsonBody;
      }

      // Validate against defined fields
      this.validateJsonAgainstFields(jsonBody, schema.fields, "request");
      return jsonBody;
    }

    // If we get here, the schema type is not supported
    throw new AppError(`Unsupported schema type: ${schema.type}`, 400);
  }

  /**
   * Validate response against the defined response schema
   * @param response The response to validate
   * @param schema The schema to validate against
   * @returns The validated response
   * @throws AppError if validation fails
   */
  validateResponse(response: any, schema?: ResponseSchema): any {
    if (!schema) {
      // If no schema is defined, return the response as is
      return response;
    }

    logger.info(`Validating response against schema type: ${schema.type}`);

    // For text schema
    if (schema.type === "text") {
      if (typeof response !== "string") {
        logger.warn(
          `Response validation failed: Expected string but got ${typeof response}`
        );
        // Convert to string if possible
        try {
          if (typeof response === "object" && response !== null) {
            // Check if this is a failed JSON parsing result with rawResponse
            if (response.rawResponse && response.parsingError) {
              return response.rawResponse;
            }
            return JSON.stringify(response);
          }
          return String(response);
        } catch (error) {
          logger.error("Failed to convert response to string:", error);
          return String(response);
        }
      }
      return response;
    }

    // For JSON schema
    if (schema.type === "json") {
      // Check if this is a failed JSON parsing result with rawResponse
      if (
        typeof response === "object" &&
        response !== null &&
        response.rawResponse &&
        response.parsingError
      ) {
        logger.warn("Received a failed JSON parsing result, returning as is");
        return response;
      }

      // If response is a string, try to parse it as JSON
      let jsonResponse = response;
      if (typeof response === "string") {
        try {
          jsonResponse = JSON.parse(response);
        } catch (error) {
          logger.error("Failed to parse response as JSON:", error);
          // Return the raw string instead of throwing an error
          logger.warn(
            "Returning raw string response due to JSON parsing failure"
          );
          return {
            rawResponse: response,
            parsingError: "Failed to parse as JSON. Returning raw response.",
          };
        }
      }

      // If no fields are defined, return the JSON response as is
      if (!schema.fields || schema.fields.length === 0) {
        return jsonResponse;
      }

      // Validate against defined fields
      try {
        this.validateJsonAgainstFields(jsonResponse, schema.fields, "response");
        return jsonResponse;
      } catch (error) {
        logger.error("Failed to validate JSON against fields:", error);
        // If validation fails, return the original response with error info
        if (typeof response === "string") {
          return {
            rawResponse: response,
            validationError: (error as Error).message,
          };
        }
        return response;
      }
    }

    // If we get here, the schema type is not supported
    throw new AppError(`Unsupported schema type: ${schema.type}`, 500);
  }

  /**
   * Validate a JSON object against a set of field definitions
   * @param json The JSON object to validate
   * @param fields The field definitions to validate against
   * @param context Whether this is a request or response validation
   * @throws AppError if validation fails
   */
  private validateJsonAgainstFields(
    json: any,
    fields: SchemaField[],
    context: "request" | "response"
  ): void {
    if (typeof json !== "object" || json === null) {
      throw new AppError(
        `Invalid ${context} format: Expected an object`,
        context === "request" ? 400 : 500
      );
    }

    // Check for required fields
    const requiredFields = fields.filter((field) => field.required);
    for (const field of requiredFields) {
      if (json[field.name] === undefined) {
        throw new AppError(
          `Missing required ${context} field: ${field.name}`,
          context === "request" ? 400 : 500
        );
      }
    }

    // Validate field types
    for (const field of fields) {
      if (json[field.name] !== undefined) {
        const expectedType = field.type.toLowerCase();
        const actualType = typeof json[field.name];

        // Special handling for arrays
        if (expectedType === "array" && !Array.isArray(json[field.name])) {
          throw new AppError(
            `Invalid ${context} field type: ${field.name} should be an array`,
            context === "request" ? 400 : 500
          );
        }
        // Special handling for string fields - convert objects to strings
        else if (
          expectedType === "string" &&
          actualType === "object" &&
          json[field.name] !== null
        ) {
          try {
            // Convert object to string
            json[field.name] = JSON.stringify(json[field.name]);
            logger.warn(`Converted object to string for field: ${field.name}`);
          } catch (error) {
            logger.error(
              `Failed to convert object to string for field: ${field.name}`,
              error
            );
            throw new AppError(
              `Invalid ${context} field type: ${field.name} should be ${expectedType} but got ${actualType}`,
              context === "request" ? 400 : 500
            );
          }
        }
        // Type checking for other types
        else if (
          expectedType !== "array" &&
          actualType !== expectedType &&
          // Handle special case for numbers
          !(expectedType === "number" && !isNaN(Number(json[field.name])))
        ) {
          throw new AppError(
            `Invalid ${context} field type: ${field.name} should be ${expectedType} but got ${actualType}`,
            context === "request" ? 400 : 500
          );
        }
      }
    }
  }
}
