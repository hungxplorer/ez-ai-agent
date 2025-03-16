import { useCallback } from "react";
import { useApi } from "./ApiContext";
import { createApiRequest } from "./config";

/**
 * Hook to create API requests with loading indicators and error handling
 * @param loadingMessage - Optional custom loading message
 * @returns A function to make API requests
 */
export const useApiRequest = (loadingMessage = "Loading...") => {
  const apiContext = useApi();

  const apiRequest = useCallback(
    <T>(url: string, options: RequestInit = {}): Promise<T> => {
      const makeRequest = createApiRequest(apiContext, loadingMessage);
      return makeRequest<T>(url, options);
    },
    [apiContext, loadingMessage]
  );

  return apiRequest;
};

/**
 * Hook to create API requests with specific loading messages for different operations
 * @returns Object with methods for different API operations
 */
export const useApiRequests = () => {
  const apiContext = useApi();

  const get = useCallback(
    <T>(url: string, options: RequestInit = {}): Promise<T> => {
      const makeRequest = createApiRequest(apiContext, "Loading data...");
      return makeRequest<T>(url, { ...options, method: "GET" });
    },
    [apiContext]
  );

  const post = useCallback(
    <T>(url: string, data: unknown, options: RequestInit = {}): Promise<T> => {
      const makeRequest = createApiRequest(apiContext, "Loading...");
      return makeRequest<T>(url, {
        ...options,
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    [apiContext]
  );

  const put = useCallback(
    <T>(url: string, data: unknown, options: RequestInit = {}): Promise<T> => {
      const makeRequest = createApiRequest(apiContext, "Updating data...");
      return makeRequest<T>(url, {
        ...options,
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    [apiContext]
  );

  const del = useCallback(
    <T>(url: string, options: RequestInit = {}): Promise<T> => {
      const makeRequest = createApiRequest(apiContext, "Deleting data...");
      return makeRequest<T>(url, { ...options, method: "DELETE" });
    },
    [apiContext]
  );

  return { get, post, put, del };
};
