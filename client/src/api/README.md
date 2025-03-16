# API Services

This directory contains centralized API services for communicating with the backend.

## Structure

- `config.ts` - API configuration settings and helper functions
- `agentApi.ts` - Agent-related API endpoints
- `index.ts` - Central export point for all API services
- `ApiContext.tsx` - Context provider for loading state and error handling
- `useApiRequest.ts` - Hooks for making API requests with loading and error handling

## Basic Usage

Import the API services in your components or stores:

```typescript
import { agentApi } from "../api";

// Use the API service
const fetchData = async () => {
  try {
    const agents = await agentApi.getAllAgents();
    // Do something with the agents
  } catch (error) {
    // Handle error
  }
};
```

## Using Loading Popup and Error Handling

For automatic loading popups and error handling, use the hook-based API:

1. First, make sure your app is wrapped with the `ApiProvider`:

```tsx
// In App.tsx
import { ApiProvider } from "./api";

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ApiProvider>{/* Your app components */}</ApiProvider>
    </ChakraProvider>
  );
}
```

2. Then use the hook-based API in your components:

```tsx
import { useAgentApi, useApi } from "../api";

function MyComponent() {
  const agentApi = useAgentApi(); // Hook-based API with loading and error handling
  const { isLoading } = useApi(); // Get loading state from API context

  const handleSubmit = async () => {
    try {
      // This will automatically show a loading popup
      const result = await agentApi.executeAgent(id, input);
      // Success! Do something with the result
    } catch {
      // Error is already handled by the API context
      // No need to handle it here
    }
  };

  return (
    <div>
      {/* You can use isLoading in your UI */}
      <Button onClick={handleSubmit} isLoading={isLoading}>
        Submit
      </Button>
    </div>
  );
}
```

## Adding New API Services

To add a new API service:

1. Create a new file in the `api` directory (e.g., `userApi.ts`)
2. Define your API methods using the same pattern as existing services
3. Create a hook-based version for loading and error handling
4. Export your service from `index.ts`

Example:

```typescript
// userApi.ts
import { API_BASE_URL, DEFAULT_HEADERS, handleApiResponse } from "./config";
import { useApiRequests } from "./useApiRequest";

// Regular API service
export const userApi = {
  getUser: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "GET",
      headers: DEFAULT_HEADERS,
    });

    const data = await handleApiResponse(response);
    return data.data.user;
  },

  // Add more methods as needed
};

// Hook-based API service with loading and error handling
export const useUserApi = () => {
  const api = useApiRequests();

  return {
    getUser: async (id: string) => {
      const data = await api.get(`${API_BASE_URL}/users/${id}`);
      return data.data.user;
    },

    // Add more methods as needed
  };
};

// Then in index.ts
export * from "./userApi";
```

## Benefits

- **Centralized API Logic**: All API calls are in one place, making them easier to maintain
- **Consistent Error Handling**: Common error handling logic is shared across all API calls
- **Type Safety**: API responses are properly typed
- **Reusability**: API services can be reused across multiple components and stores
- **Testability**: API services can be easily mocked for testing
- **Loading Indicators**: Automatic loading popups for all API calls
- **Error Messages**: Consistent error message display for all API calls
