/**
 * API configuration settings
 */

// Base API URL - using relative path for same-origin API
export const API_BASE_URL = "http://localhost:3000/api";

// Default headers for API requests
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

// Helper function to handle API responses
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      console.error("API Response Error:", {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(
        errorData.message ||
          errorData.error?.message ||
          `API error: ${response.status} ${response.statusText}`
      );
    } catch (jsonError) {
      // If we can't parse the error as JSON, throw a generic error
      console.error("Failed to parse error response as JSON:", jsonError);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
  }
  return response.json();
};

/**
 * Creates a wrapped fetch function that shows loading indicator and handles errors
 * @param apiContext - The API context from useApi hook
 * @param loadingMessage - Optional custom loading message
 * @returns A wrapped fetch function
 */
export const createApiRequest = (
  apiContext: {
    startLoading: (message?: string) => void;
    stopLoading: () => void;
    handleError: (error: Error) => void;
  },
  loadingMessage = "Loading..."
) => {
  return async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    try {
      apiContext.startLoading(loadingMessage);

      const response = await fetch(url, {
        ...options,
        headers: {
          ...DEFAULT_HEADERS,
          ...options.headers,
        },
      });

      const data = await handleApiResponse(response);
      apiContext.stopLoading();
      return data;
    } catch (error) {
      apiContext.handleError(error as Error);
      throw error;
    }
  };
};
