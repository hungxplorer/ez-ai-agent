import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Spinner,
  Text,
  VStack,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Box,
} from '@chakra-ui/react';

interface ApiContextType {
  isLoading: boolean;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  handleError: (error: Error) => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [error, setError] = useState<Error | null>(null);
  const toast = useToast();

  const startLoading = (message = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  const handleError = (error: Error) => {
    stopLoading();
    setError(error);
    
    // Show error toast
    toast({
      title: 'API Error',
      description: error.message,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top',
    });
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <ApiContext.Provider
      value={{
        isLoading,
        startLoading,
        stopLoading,
        handleError,
      }}
    >
      {children}

      {/* Loading Modal */}
      <Modal isOpen={isLoading} onClose={() => {}} isCentered closeOnOverlayClick={false} closeOnEsc={false}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent w="auto" p={6} bg="white" boxShadow="xl" borderRadius="xl">
          <ModalBody>
            <VStack spacing={4}>
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
              <Text fontWeight="medium" fontSize="lg" textAlign="center">
                {loadingMessage}
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Error Alert */}
      {error && (
        <Box
          position="fixed"
          top="20px"
          right="20px"
          zIndex={9999}
          maxW="400px"
          w="full"
        >
          <Alert status="error" variant="solid" borderRadius="md" boxShadow="lg">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription display="block">
                {error.message}
              </AlertDescription>
            </Box>
            <CloseButton
              alignSelf="flex-start"
              position="relative"
              right={-1}
              top={-1}
              onClick={clearError}
            />
          </Alert>
        </Box>
      )}
    </ApiContext.Provider>
  );
};

export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
}; 