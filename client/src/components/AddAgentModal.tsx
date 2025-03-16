import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormErrorMessage,
  Box,
  Text,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  Heading,
  useColorModeValue,
  SimpleGrid,
  useToast,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { useEffect, useState, useMemo, useRef } from 'react';
import { AIAgent, LLMType, RequestSchema, ResponseSchema } from '../types';
import { useAgentStore } from '../store/agentStore';
import SchemaBuilder from './SchemaBuilder';

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AIAgent | null;
}

type FormValues = {
  name: string;
  llmType: LLMType;
  apiKey: string;
  apiPath: string;
  systemPrompt: string;
};

const AddAgentModal = ({ isOpen, onClose, agent }: AddAgentModalProps) => {
  const { addAgent, updateAgent } = useAgentStore();
  const [requestSchema, setRequestSchema] = useState<RequestSchema | undefined>(agent?.requestSchema);
  const [responseSchema, setResponseSchema] = useState<ResponseSchema | undefined>(agent?.responseSchema);
  const toast = useToast();
  
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      llmType: 'Gemini',
      apiKey: '',
      apiPath: '/api/',
      systemPrompt: '',
    },
  });

  // Watch system prompt for generating combined prompt
  const systemPrompt = watch('systemPrompt');

  // Ref to track if agent is being updated
  const isUpdatingAgentRef = useRef(false);

  // Ref to track timeout ID for debounce
  const requestSchemaTimeoutRef = useRef<number | null>(null);
  const responseSchemaTimeoutRef = useRef<number | null>(null);

  // Ref to track previous agent ID
  const prevAgentIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Only update when agent actually changes (different ID)
    const currentAgentId = agent?.id || null;
    const hasAgentChanged = prevAgentIdRef.current !== currentAgentId;
    
    if (!hasAgentChanged && !isUpdatingAgentRef.current) {
      return;
    }
    
    prevAgentIdRef.current = currentAgentId;
    isUpdatingAgentRef.current = true;
    
    if (agent) {
      // Update form values
      reset({
        name: agent.name,
        llmType: agent.llmType,
        apiKey: agent.apiKey,
        apiPath: agent.apiPath,
        systemPrompt: agent.systemPrompt,
      });
      
      // Use setTimeout to avoid infinite loop
      setTimeout(() => {
        // Update schemas
        setRequestSchema(agent.requestSchema);
        setResponseSchema(agent.responseSchema);
        
        // Reset flag after update complete
        setTimeout(() => {
          isUpdatingAgentRef.current = false;
        }, 50);
      }, 50);
    } else {
      // Reset form to default values
      reset({
        name: '',
        llmType: 'Gemini',
        apiKey: '',
        apiPath: '/api/',
        systemPrompt: '',
      });
      
      // Use setTimeout to avoid infinite loop
      setTimeout(() => {
        // Reset schemas
        setRequestSchema(undefined);
        setResponseSchema(undefined);
        
        // Reset flag after update complete
        setTimeout(() => {
          isUpdatingAgentRef.current = false;
        }, 50);
      }, 50);
    }
  }, [agent, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      console.log('Submitting agent form');
      
      // Mark as updating
      isUpdatingAgentRef.current = true;
      
      // Create agent data with appropriate type
      const agentData = {
        ...data,
        requestSchema,
        responseSchema,
      };

      if (agent) {
        console.log('Updating agent:', agent.id);
        await updateAgent(agent.id, agentData);
        toast({
          title: 'Agent updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        console.log('Creating new agent');
        await addAgent(agentData);
        toast({
          title: 'Agent created',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Ensure flag is reset after closing modal
      console.log('Agent saved, closing modal');
      setTimeout(() => {
        onClose();
        
        // Reset flag after closing modal
        setTimeout(() => {
          isUpdatingAgentRef.current = false;
        }, 100);
      }, 100);
    } catch (error) {
      console.error('Error saving agent:', error);
      toast({
        title: 'Error saving agent',
        description: (error as Error).message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset flag if there's an error
      isUpdatingAgentRef.current = false;
    }
  };

  // Generate combined prompt based on system prompt and schemas
  const combinedPrompt = useMemo(() => {
    let prompt = systemPrompt || '';
    
    // Add request schema information only if fields exist and have length > 0
    if (requestSchema?.fields && requestSchema.fields.length > 0) {
      prompt += '\n\n### Input Format:\n';
      if (requestSchema.type === 'json') {
        prompt += 'You will receive input in JSON format with the following fields:\n';
        requestSchema.fields.forEach(field => {
          prompt += `- ${field.name} (${field.type}): ${field.description}\n`;
        });
      } else {
        prompt += 'You will receive input as plain text.\n';
      }
    }

    // Always add output format section
    prompt += '\n\n### Output Format:\n';
    
    // Check if response schema exists and has fields
    if (responseSchema?.fields && responseSchema.fields.length > 0) {
      prompt += 'You should respond with JSON containing the following fields:\n';
      responseSchema.fields.forEach(field => {
        prompt += `- ${field.name} (${field.type}): ${field.description}\n`;
      });
    } else {
      prompt += 'You should respond with plain text.\n';
    }
    
    return prompt;
  }, [systemPrompt, requestSchema, responseSchema]);

  // Determine if we should show the combined prompt content
  const showCombinedPromptContent = useMemo(() => {
    // Always show the combined prompt, which will be just the system prompt if no schema info
    return true;
  }, []);

  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const activeTabBg = useColorModeValue('white', 'gray.700');
  const inactiveTabBg = useColorModeValue('gray.50', 'gray.600');

  // Handle schema change with debounce to avoid infinite loop
  const handleRequestSchemaChange = (schema: RequestSchema) => {
    // If updating agent, skip
    if (isUpdatingAgentRef.current) {
      return;
    }
    
    // Clear old timeout if exists
    if (requestSchemaTimeoutRef.current) {
      clearTimeout(requestSchemaTimeoutRef.current);
    }
    
    // Mark as updating
    isUpdatingAgentRef.current = true;
    
    // Create new timeout with debounce 100ms
    requestSchemaTimeoutRef.current = setTimeout(() => {
      setRequestSchema(schema);
      
      // Reset flag after update complete
      setTimeout(() => {
        isUpdatingAgentRef.current = false;
        requestSchemaTimeoutRef.current = null;
      }, 50);
    }, 100);
  };
  
  const handleResponseSchemaChange = (schema: ResponseSchema) => {
    // If updating agent, skip
    if (isUpdatingAgentRef.current) {
      return;
    }
    
    // Clear old timeout if exists
    if (responseSchemaTimeoutRef.current) {
      clearTimeout(responseSchemaTimeoutRef.current);
    }
    
    // Mark as updating
    isUpdatingAgentRef.current = true;
    
    // Create new timeout with debounce 100ms
    responseSchemaTimeoutRef.current = setTimeout(() => {
      setResponseSchema(schema);
      
      // Reset flag after update complete
      setTimeout(() => {
        isUpdatingAgentRef.current = false;
        responseSchemaTimeoutRef.current = null;
      }, 50);
    }, 100);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{agent ? 'Edit AI Agent' : 'Create New AI Agent'}</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody>
            <Grid templateColumns="repeat(12, 1fr)" gap={4}>
              {/* Left Column - AI Agent Configuration */}
              <GridItem colSpan={{ base: 12, md: 4 }}>
                <Card borderWidth="1px" borderColor={borderColor} mb={4}>
                  <CardHeader pb={0}>
                    <Heading size="md">AI Agent Configuration</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={1} spacing={3}>
                      <FormControl isInvalid={!!errors.name}>
                        <FormLabel fontSize="sm">Agent Name</FormLabel>
                        <Controller
                          name="name"
                          control={control}
                          rules={{ required: 'Name is required' }}
                          render={({ field }) => <Input {...field} placeholder="My AI Agent" size="sm" />}
                        />
                        <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={!!errors.llmType}>
                        <FormLabel fontSize="sm">LLM Model</FormLabel>
                        <Controller
                          name="llmType"
                          control={control}
                          rules={{ required: 'LLM Model is required' }}
                          render={({ field }) => (
                            <Select {...field} size="sm">
                              <option value="Gemini">Gemini (2.0-flash)</option>
                              <option value="ChatGPT">ChatGPT (Coming Soon)</option>
                              <option value="Deepseek">Deepseek (Coming Soon)</option>
                              <option value="Claude" disabled>Claude (Coming Soon)</option>
                              <option value="Grok" disabled>Grok (Coming Soon)</option>
                            </Select>
                          )}
                        />
                        <FormErrorMessage>{errors.llmType?.message}</FormErrorMessage>
                      </FormControl>

                      <FormControl isInvalid={!!errors.apiKey}>
                        <FormLabel fontSize="sm">API Key</FormLabel>
                        <Controller
                          name="apiKey"
                          control={control}
                          rules={{ required: 'API Key is required' }}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="password"
                              placeholder="Enter your API key"
                              size="sm"
                            />
                          )}
                        />
                        <FormErrorMessage>{errors.apiKey?.message}</FormErrorMessage>
                      </FormControl>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* API Configuration */}
                <Card borderWidth="1px" borderColor={borderColor}>
                  <CardHeader pb={0}>
                    <Heading size="md">Request & Response Schema</Heading>
                  </CardHeader>
                  <CardBody>
                    <FormControl isInvalid={!!errors.apiPath} mb={4}>
                      <FormLabel fontSize="sm">API Path</FormLabel>
                      <Controller
                        name="apiPath"
                        control={control}
                        rules={{ 
                          required: 'API Path is required',
                          validate: {
                            hasApiPrefix: (value) => 
                              value.startsWith('/api/') || 'API Path must start with /api/',
                          }
                        }}
                        render={({ field }) => (
                          <Input 
                            {...field} 
                            placeholder="/api/my-agent" 
                            size="sm"
                            value={field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Ensure /api/ prefix is always present
                              if (!value.startsWith('/api/')) {
                                return;
                              }
                              field.onChange(value);
                            }}
                          />
                        )}
                      />
                      <FormErrorMessage>{errors.apiPath?.message}</FormErrorMessage>
                    </FormControl>
                    
                    <Tabs 
                      variant="enclosed" 
                      size="sm" 
                      isFitted
                      colorScheme="brand"
                    >
                      <TabList
                        borderBottom="none"
                        position="relative"
                        zIndex="1"
                        mb="-1px"
                      >
                        <Tab 
                          _selected={{ 
                            bg: activeTabBg, 
                            borderBottomColor: activeTabBg,
                            fontWeight: "semibold",
                            borderTopColor: "brand.500",
                            borderTopWidth: "3px",
                            outline: "none",
                            boxShadow: "0 -6px 12px -2px rgba(0, 0, 0, 0.1)",
                            transform: "translateY(-3px)"
                          }}
                          bg={inactiveTabBg}
                          borderTopColor="transparent"
                          borderTopWidth="3px"
                          transition="all 0.3s"
                          _focus={{ outline: "none", boxShadow: "none" }}
                          _hover={{ bg: useColorModeValue('gray.100', 'gray.650') }}
                          borderTopLeftRadius="md"
                          borderTopRightRadius="md"
                          fontWeight="500"
                          px={4}
                        >
                          Request
                        </Tab>
                        <Tab 
                          _selected={{ 
                            bg: activeTabBg, 
                            borderBottomColor: activeTabBg,
                            fontWeight: "semibold",
                            borderTopColor: "brand.500",
                            borderTopWidth: "3px",
                            outline: "none",
                            boxShadow: "0 -6px 12px -2px rgba(0, 0, 0, 0.1)",
                            transform: "translateY(-3px)"
                          }}
                          bg={inactiveTabBg}
                          borderTopColor="transparent"
                          borderTopWidth="3px"
                          transition="all 0.3s"
                          _focus={{ outline: "none", boxShadow: "none" }}
                          _hover={{ bg: useColorModeValue('gray.100', 'gray.650') }}
                          borderTopLeftRadius="md"
                          borderTopRightRadius="md"
                          fontWeight="500"
                          px={4}
                        >
                          Response
                        </Tab>
                      </TabList>
                      <TabPanels 
                        bg={activeTabBg}
                        borderWidth="1px"
                        borderColor={borderColor}
                        borderRadius="md"
                        borderTopLeftRadius="0"
                        boxShadow="0 6px 16px -4px rgba(0, 0, 0, 0.1)"
                        position="relative"
                        top="-1px"
                      >
                        <TabPanel px={4} py={4}>
                          <SchemaBuilder 
                            schemaType="request" 
                            initialSchema={requestSchema}
                            onChange={handleRequestSchemaChange}
                          />
                        </TabPanel>
                        <TabPanel px={4} py={4}>
                          <SchemaBuilder 
                            schemaType="response" 
                            initialSchema={responseSchema}
                            onChange={handleResponseSchemaChange}
                          />
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </CardBody>
                </Card>
              </GridItem>

              {/* Right Column - System Prompt */}
              <GridItem colSpan={{ base: 12, md: 8 }}>
                <Card borderWidth="1px" borderColor={borderColor} h="100%">
                  <CardHeader pb={0}>
                    <Heading size="md">System Prompt</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch" h="100%">
                      <FormControl isInvalid={!!errors.systemPrompt} flex="1" mb={12}>
                        <FormLabel>Define AI Behavior</FormLabel>
                        <Controller
                          name="systemPrompt"
                          control={control}
                          rules={{ required: 'System Prompt is required' }}
                          render={({ field }) => (
                            <Textarea
                              {...field}
                              placeholder="Enter your system prompt here..."
                              minH="200px"
                              h="100%"
                            />
                          )}
                        />
                        <FormErrorMessage>{errors.systemPrompt?.message}</FormErrorMessage>
                      </FormControl>

                      <Box>
                        <FormLabel>Combined Prompt (Auto-generated)</FormLabel>
                        <Textarea
                          value={showCombinedPromptContent ? combinedPrompt : ''}
                          isReadOnly
                          bg={cardBg}
                          minH="160px"
                          fontSize="sm"
                          placeholder="The combined prompt will be generated based on your system prompt and schema definitions..."
                        />
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          This is the complete prompt that will be sent to the LLM, including schema information.
                        </Text>
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              bgGradient="linear(to-r, brand.500, accent.500)"
              color="white"
              _hover={{ 
                bgGradient: "linear(to-r, brand.600, accent.600)",
                boxShadow: "0 4px 10px rgba(71, 118, 230, 0.3)"
              }}
              type="submit"
              isLoading={isSubmitting}
            >
              {agent ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default AddAgentModal; 