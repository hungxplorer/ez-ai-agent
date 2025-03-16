import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Tabs,
  Text,
  Textarea,
  VStack,
  Badge,
  Code,
  useToast,
  Container,
  HStack,
  Icon,
  Tag,
  TagLabel,
  SimpleGrid,
  Tooltip,
  IconButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
  GridItem,
  ButtonGroup,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useAgentStore } from '../store/agentStore';
import { ArrowBackIcon, CopyIcon, DeleteIcon, EditIcon, RepeatIcon } from '@chakra-ui/icons';
import { FiCpu, FiCode, FiMessageSquare, FiDatabase, FiServer, FiPlay, FiInfo } from 'react-icons/fi';
import AddAgentModal from '../components/AddAgentModal';
import { useAgentApi, useApi } from '../api';
import { AIAgent, SchemaField } from '../types';

const AgentDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { getAgentById, fetchAgentById, deleteAgent } = useAgentStore();
  const agentApi = useAgentApi();
  const { isLoading } = useApi();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [formattedResponse, setFormattedResponse] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [agent, setAgent] = useState<AIAgent | undefined>(undefined);
  const [sampleGenerated, setSampleGenerated] = useState(false);
  
  // Ref to track if agent is being updated
  const isUpdatingAgentRef = useRef(false);

  // Function to generate sample value based on field type
  const generateSampleValue = (field: SchemaField): unknown => {
    switch (field.type) {
      case 'string':
        return `Sample ${field.name}`;
      case 'number':
        return 123;
      case 'boolean':
        return true;
      case 'object':
        if (field.properties && field.properties.length > 0) {
          return field.properties.reduce((acc, prop) => {
            acc[prop.name] = generateSampleValue(prop);
            return acc;
          }, {} as Record<string, unknown>);
        }
        return {};
      case 'array':
        if (field.items) {
          return [generateSampleValue(field.items)];
        }
        return [];
      default:
        return null;
    }
  };

  // Function to generate sample input based on request schema
  const generateSampleInput = useCallback(() => {
    if (!agent || !agent.requestSchema) {
      return 'Your text input here';
    }

    if (agent.requestSchema.type === 'text') {
      return 'Your text input here';
    }

    // For JSON schema
    if (agent.requestSchema.type === 'json') {
      if (!agent.requestSchema.fields || agent.requestSchema.fields.length === 0) {
        return '{}';
      }

      // Generate sample values for each field
      const sampleData = agent.requestSchema.fields.reduce((acc, field) => {
        acc[field.name] = generateSampleValue(field);
        return acc;
      }, {} as Record<string, unknown>);

      return JSON.stringify(sampleData, null, 2);
    }

    return '{}';
  }, [agent]);

  // Function to format response based on response schema
  const formatResponse = useCallback((response: unknown): string => {
    if (!agent || !agent.responseSchema) {
      return typeof response === 'string' ? response : JSON.stringify(response, null, 2);
    }

    try {
      // For text schema, just return the response as is
      if (agent.responseSchema.type === 'text') {
        if (typeof response === 'string') {
          return response;
        } else {
          // If response is not a string, convert to string
          return JSON.stringify(response, null, 2);
        }
      }

      // For JSON schema
      let jsonResponse = response;
      
      // If response is a string, try to parse it as JSON
      if (typeof response === 'string') {
        try {
          jsonResponse = JSON.parse(response);
        } catch (e) {
          console.log('Failed to parse response as JSON, returning as is:', e);
          return response;
        }
      }
      
      // Ensure response is formatted nicely with 2 spaces indent
      return JSON.stringify(jsonResponse, null, 2);
    } catch (error) {
      console.error('Error formatting response:', error);
      // Fallback: return response as string
      return typeof response === 'string' ? response : JSON.stringify(response, null, 2);
    }
  }, [agent]);

  // Handle tab change
  const handleTabChange = (index: number) => {
    setActiveTab(index);
  };

  // Effect to fetch agent data
  useEffect(() => {
    const fetchAgent = async () => {
      if (!id) return;
      
      // Reset all test-related states before fetching new agent
      setTestInput('');
      setTestResponse('');
      setFormattedResponse('');
      setSampleGenerated(false);
      
      // First try to get the agent from the store
      const storeAgent = getAgentById(id);
      
      if (storeAgent) {
        setAgent(storeAgent);
        return;
      }
      
      // If not found in store, fetch from API
      try {
        const fetchedAgent = await fetchAgentById(id);
        if (fetchedAgent) {
          setAgent(fetchedAgent);
        } else {
          throw new Error(`No agent found with ID: ${id}`);
        }
      } catch (error) {
        console.error('Error fetching agent:', error);
        toast({
          title: 'Agent not found',
          description: `No agent found with ID: ${id}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/');
      }
    };
    
    fetchAgent();
  }, [id, getAgentById, fetchAgentById, toast, navigate]);

  // Effect to generate sample input when tab changes to Test API
  useEffect(() => {
    // Skip if we're currently updating the agent
    if (isUpdatingAgentRef.current) {
      return;
    }
    
    // Only generate sample if we're on the Test API tab, have an agent, haven't generated a sample yet, and don't have input
    if (activeTab === 1 && agent && !sampleGenerated && testInput === '') {
      // Use a timeout to break potential render cycles
      const timeoutId = setTimeout(() => {
        const sample = generateSampleInput();
        if (sample !== testInput) { // Only update if different
          setTestInput(sample);
          setSampleGenerated(true);
        }
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [activeTab, agent, sampleGenerated, generateSampleInput, testInput]);

  // Reset states when agent ID changes
  const prevAgentIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    // Skip if we're currently updating the agent
    if (isUpdatingAgentRef.current) {
      return;
    }
    
    // Only reset states if the agent ID actually changed
    if (agent?.id && agent.id !== prevAgentIdRef.current) {
      prevAgentIdRef.current = agent.id;
      
      // Reset all test-related states
      setTestInput('');
      setTestResponse('');
      setFormattedResponse('');
      setSampleGenerated(false);
    }
  }, [agent?.id]);

  // Track request schema type changes
  const prevSchemaTypeRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    // Skip if we're currently updating the agent
    if (isUpdatingAgentRef.current) {
      return;
    }
    
    const currentType = agent?.requestSchema?.type;
    
    // If schema type changed, reset test input and sample generated flag
    if (currentType && currentType !== prevSchemaTypeRef.current) {
      prevSchemaTypeRef.current = currentType;
      setTestInput('');
      setTestResponse('');
      setFormattedResponse('');
      setSampleGenerated(false);
    }
  }, [agent?.requestSchema?.type]);

  if (!agent) {
    return (
      <Flex justify="center" align="center" h="70vh">
        <Text>Loading agent details...</Text>
      </Flex>
    );
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      await deleteAgent(agent.id);
      navigate('/');
    }
  };

  const handleTest = async () => {
    try {
      // Try to parse the input as JSON if possible
      let parsedInput;
      try {
        parsedInput = JSON.parse(testInput);
      } catch {
        // If parsing fails, use the raw text input
        parsedInput = testInput;
      }

      // Send the input directly without wrapping it in an input field
      const result = await agentApi.executeAgent(agent.id, parsedInput);
      
      // Save raw response
      const rawResponse = JSON.stringify(result);
      setTestResponse(rawResponse);
      
      // Format the response based on the response schema
      const formatted = formatResponse(result);
      setFormattedResponse(formatted);

      toast({
        title: 'Test successful',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: 'Test failed',
        description: (error as Error).message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const copyApiUrl = () => {
    const baseUrl = window.location.origin;
    const apiUrl = `${baseUrl}/api/agents/${agent.id}/execute`;
    navigator.clipboard.writeText(apiUrl);
    toast({
      title: 'API URL copied',
      description: apiUrl,
      status: 'info',
      duration: 3000,
    });
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(agent.apiKey);
    toast({
      title: 'API Key copied',
      status: 'info',
      duration: 3000,
    });
  };

  const getLLMTypeColor = (llmType: string) => {
    switch (llmType) {
      case 'Gemini':
        return 'blue';
      case 'ChatGPT':
        return 'green';
      case 'Deepseek':
        return 'purple';
      case 'Grok':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getLLMIcon = (llmType: string) => {
    switch (llmType) {
      case 'ChatGPT':
        return FiMessageSquare;
      case 'Gemini':
        return FiCpu;
      case 'Deepseek':
        return FiDatabase;
      default:
        return FiCode;
    }
  };

  const LLMIcon = getLLMIcon(agent.llmType);
  const colorScheme = getLLMTypeColor(agent.llmType);

  return (
    <Box pt="100px" pb="60px" bg="gray.50" minH="100vh" w="100vw">
      <Container maxW="1200px">
        {/* Header */}
        <Card mb={6} borderRadius="xl" boxShadow="sm" bg="white" position="relative" overflow="hidden">
          <Box 
            position="absolute" 
            top={0} 
            left={0} 
            right={0} 
            h="8px" 
            bgGradient={`linear(to-r, ${colorScheme}.400, ${colorScheme}.600)`} 
          />
          <CardBody pt={8}>
            <Flex 
              direction={{ base: 'column', md: 'row' }} 
              justify="space-between" 
              align={{ base: 'flex-start', md: 'center' }}
              wrap="wrap"
              gap={4}
            >
              <HStack spacing={4}>
                <Button
                  leftIcon={<ArrowBackIcon />}
                  variant="ghost"
                  onClick={() => navigate('/')}
                  size="sm"
                >
                  Back
                </Button>
                <Box 
                  bg={`${colorScheme}.50`}
                  p={2.5}
                  borderRadius="lg"
                >
                  <Icon 
                    as={LLMIcon} 
                    boxSize={6} 
                    color={`${colorScheme}.500`}
                  />
                </Box>
                <Box>
                  <Heading size="lg">{agent.name}</Heading>
                  <HStack mt={1}>
                    <Badge
                      colorScheme={colorScheme}
                      borderRadius="full"
                      px={2}
                      py={0.5}
                    >
                      {agent.llmType}
                    </Badge>
                    <Text fontSize="sm" color="gray.500">
                      Created {new Date(agent.createdAt).toLocaleDateString()}
                    </Text>
                  </HStack>
                </Box>
              </HStack>
              
              <HStack spacing={3}>
                <Button
                  leftIcon={<EditIcon />}
                  variant="outline"
                  colorScheme={colorScheme}
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Edit
                </Button>
                <Button
                  leftIcon={<DeleteIcon />}
                  colorScheme="red"
                  variant="outline"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </HStack>
            </Flex>
          </CardBody>
        </Card>

        {/* Main Content */}
        <Tabs 
          variant="soft-rounded" 
          colorScheme={colorScheme} 
          mb={6} 
          isLazy
          index={activeTab}
          onChange={handleTabChange}
        >
          <TabList mb={6}>
            <Tab><Icon as={FiInfo} mr={2} />Details</Tab>
            <Tab><Icon as={FiPlay} mr={2} />Test API</Tab>
            <Tab><Icon as={FiCode} mr={2} />Usage</Tab>
          </TabList>

          <TabPanels>
            {/* Details Tab */}
            <TabPanel px={0}>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                {/* Left Column */}
                <VStack spacing={6} align="stretch">
                  {/* API Information */}
                  <Card borderRadius="xl" boxShadow="sm" bg="white">
                    <CardHeader pb={2}>
                      <Heading size="md" display="flex" alignItems="center">
                        <Icon as={FiServer} mr={2} color={`${colorScheme}.500`} />
                        API Information
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <Grid templateColumns="1fr 2fr" gap={4}>
                        <GridItem>
                          <Text fontWeight="medium" color="gray.600">API Path:</Text>
                        </GridItem>
                        <GridItem>
                          <Flex align="center">
                            <Code borderRadius="md" px={2} py={1} fontSize="sm">
                              {agent.apiPath}
                            </Code>
                            <Tooltip label="Copy API URL">
                              <IconButton
                                aria-label="Copy API URL"
                                icon={<CopyIcon />}
                                size="sm"
                                variant="ghost"
                                ml={2}
                                onClick={copyApiUrl}
                              />
                            </Tooltip>
                          </Flex>
                        </GridItem>
                        
                        <GridItem>
                          <Text fontWeight="medium" color="gray.600">API Key:</Text>
                        </GridItem>
                        <GridItem>
                          <Flex align="center">
                            <Code borderRadius="md" px={2} py={1} fontSize="sm">
                              ••••••••••••••••{agent.apiKey.slice(-4)}
                            </Code>
                            <Tooltip label="Copy API Key">
                              <IconButton
                                aria-label="Copy API Key"
                                icon={<CopyIcon />}
                                size="sm"
                                variant="ghost"
                                ml={2}
                                onClick={copyApiKey}
                              />
                            </Tooltip>
                          </Flex>
                        </GridItem>
                        
                        <GridItem>
                          <Text fontWeight="medium" color="gray.600">LLM Model:</Text>
                        </GridItem>
                        <GridItem>
                          <Badge colorScheme={colorScheme} borderRadius="full" px={2}>
                            {agent.llmType}
                          </Badge>
                        </GridItem>
                        
                        <GridItem>
                          <Text fontWeight="medium" color="gray.600">Created:</Text>
                        </GridItem>
                        <GridItem>
                          <Text fontSize="sm">
                            {new Date(agent.createdAt).toLocaleString()}
                          </Text>
                        </GridItem>
                        
                        <GridItem>
                          <Text fontWeight="medium" color="gray.600">Last Updated:</Text>
                        </GridItem>
                        <GridItem>
                          <Text fontSize="sm">
                            {new Date(agent.updatedAt).toLocaleString()}
                          </Text>
                        </GridItem>
                      </Grid>
                    </CardBody>
                  </Card>

                  {/* Request Schema */}
                  {agent.requestSchema && (
                    <Card borderRadius="xl" boxShadow="sm" bg="white">
                      <CardHeader pb={2}>
                        <Heading size="md" display="flex" alignItems="center">
                          <Icon as={FiDatabase} mr={2} color={`${colorScheme}.500`} />
                          Request Schema
                        </Heading>
                      </CardHeader>
                      <CardBody>
                        <HStack mb={4} spacing={3}>
                          <Tag colorScheme={colorScheme} borderRadius="full">
                            <TagLabel>Type: {agent.requestSchema.type}</TagLabel>
                          </Tag>
                          {agent.requestSchema.fields && (
                            <Tag colorScheme="gray" borderRadius="full">
                              <TagLabel>{agent.requestSchema.fields.length} fields</TagLabel>
                            </Tag>
                          )}
                        </HStack>
                        
                        {agent.requestSchema.description && (
                          <Box mb={4} p={3} bg="gray.50" borderRadius="md">
                            <Text fontSize="sm" color="gray.700">
                              {agent.requestSchema.description}
                            </Text>
                          </Box>
                        )}
                        
                        {agent.requestSchema.fields && agent.requestSchema.fields.length > 0 && (
                          <VStack spacing={3} align="stretch">
                            {agent.requestSchema.fields.map((field, index) => (
                              <Card
                                key={index}
                                variant="outline"
                                size="sm"
                                borderRadius="md"
                              >
                                <CardBody py={3}>
                                  <Flex justify="space-between" mb={1}>
                                    <HStack>
                                      <Text fontWeight="bold">
                                        {field.name}
                                      </Text>
                                      {field.required && (
                                        <Text as="span" color="red.500" fontWeight="bold">
                                          *
                                        </Text>
                                      )}
                                    </HStack>
                                    <Badge colorScheme={colorScheme} variant="outline">
                                      {field.type}
                                    </Badge>
                                  </Flex>
                                  {field.description && (
                                    <Text fontSize="sm" color="gray.600">
                                      {field.description}
                                    </Text>
                                  )}
                                </CardBody>
                              </Card>
                            ))}
                          </VStack>
                        )}
                      </CardBody>
                    </Card>
                  )}
                </VStack>

                {/* Right Column */}
                <VStack spacing={6} align="stretch">
                  {/* System Prompt */}
                  <Card borderRadius="xl" boxShadow="sm" bg="white">
                    <CardHeader pb={2}>
                      <Heading size="md" display="flex" alignItems="center">
                        <Icon as={FiMessageSquare} mr={2} color={`${colorScheme}.500`} />
                        System Prompt
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <Box 
                        p={4} 
                        bg="gray.50" 
                        borderRadius="md" 
                        whiteSpace="pre-wrap"
                        fontSize="sm"
                        fontFamily="monospace"
                        position="relative"
                        _before={{
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "4px",
                          height: "100%",
                          bg: `${colorScheme}.400`,
                          borderTopLeftRadius: "md",
                          borderBottomLeftRadius: "md",
                        }}
                      >
                        {agent.systemPrompt}
                      </Box>
                    </CardBody>
                  </Card>

                  {/* Response Schema */}
                  {agent.responseSchema && (
                    <Card borderRadius="xl" boxShadow="sm" bg="white">
                      <CardHeader pb={2}>
                        <Heading size="md" display="flex" alignItems="center">
                          <Icon as={FiDatabase} mr={2} color={`${colorScheme}.500`} />
                          Response Schema
                        </Heading>
                      </CardHeader>
                      <CardBody>
                        <HStack mb={4} spacing={3}>
                          <Tag colorScheme={colorScheme} borderRadius="full">
                            <TagLabel>Type: {agent.responseSchema.type}</TagLabel>
                          </Tag>
                          {agent.responseSchema.type === 'json' && agent.responseSchema.fields && (
                            <Tag colorScheme="gray" borderRadius="full">
                              <TagLabel>{agent.responseSchema.fields.length} fields</TagLabel>
                            </Tag>
                          )}
                        </HStack>
                        
                        {agent.responseSchema.description && (
                          <Box mb={4} p={3} bg="gray.50" borderRadius="md">
                            <Text fontSize="sm" color="gray.700">
                              {agent.responseSchema.description}
                            </Text>
                          </Box>
                        )}
                        
                        {agent.responseSchema.type === 'json' && agent.responseSchema.fields && agent.responseSchema.fields.length > 0 && (
                          <VStack spacing={3} align="stretch">
                            {agent.responseSchema.fields.map((field, index) => (
                              <Card
                                key={index}
                                variant="outline"
                                size="sm"
                                borderRadius="md"
                              >
                                <CardBody py={3}>
                                  <Flex justify="space-between" mb={1}>
                                    <HStack>
                                      <Text fontWeight="bold">
                                        {field.name}
                                      </Text>
                                      {field.required && (
                                        <Text as="span" color="red.500" fontWeight="bold">
                                          *
                                        </Text>
                                      )}
                                    </HStack>
                                    <Badge colorScheme={colorScheme} variant="outline">
                                      {field.type}
                                    </Badge>
                                  </Flex>
                                  {field.description && (
                                    <Text fontSize="sm" color="gray.600">
                                      {field.description}
                                    </Text>
                                  )}
                                </CardBody>
                              </Card>
                            ))}
                          </VStack>
                        )}
                      </CardBody>
                    </Card>
                  )}
                </VStack>
              </SimpleGrid>
            </TabPanel>

            {/* Test API Tab */}
            <TabPanel px={0}>
              <Card borderRadius="xl" boxShadow="sm" bg="white">
                <CardHeader pb={2}>
                  <Heading size="md">Test Your AI Agent</Heading>
                </CardHeader>
                <CardBody>
                  <Alert status="info" mb={6} borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Test Environment</AlertTitle>
                      <AlertDescription>
                        {agent.requestSchema 
                          ? `This agent expects ${agent.requestSchema.type === 'json' ? 'JSON input' : 'text input'}.` 
                          : 'Input format is not specified for this agent.'}
                        {agent.responseSchema 
                          ? ` It will return ${agent.responseSchema.type === 'json' ? 'JSON response' : 'text response'}.` 
                          : ' Response format is not specified.'}
                      </AlertDescription>
                    </Box>
                  </Alert>
                  
                  <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                    <GridItem>
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontWeight="medium">Input</Text>
                        <Tooltip label="Generate sample input based on schema">
                          <Button 
                            size="xs" 
                            leftIcon={<RepeatIcon />} 
                            onClick={() => {
                              const sample = generateSampleInput();
                              setTestInput(sample);
                            }}
                            colorScheme={colorScheme}
                            variant="outline"
                          >
                            Generate Sample
                          </Button>
                        </Tooltip>
                      </Flex>
                      <Textarea
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        placeholder={`Enter test input${agent.requestSchema?.type === 'json' ? ' in JSON format' : ''}...`}
                        minH="200px"
                        bg="gray.50"
                        mb={4}
                        fontFamily="monospace"
                      />
                      <Button
                        colorScheme={colorScheme}
                        isLoading={isLoading}
                        onClick={handleTest}
                        isDisabled={!testInput.trim()}
                        leftIcon={<Icon as={FiPlay} />}
                      >
                        Test API
                      </Button>
                    </GridItem>
                    
                    <GridItem>
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontWeight="medium">Response</Text>
                        <ButtonGroup size="xs" isAttached variant="outline">
                          <Button
                            onClick={() => {
                              if (testResponse) {
                                try {
                                  // Thử parse testResponse thành JSON trước
                                  let responseData;
                                  try {
                                    responseData = JSON.parse(testResponse);
                                  } catch {
                                    // Nếu không parse được, sử dụng nguyên testResponse
                                    responseData = testResponse;
                                  }
                                  
                                  console.log('Formatting response from button:', responseData);
                                  const formatted = formatResponse(responseData);
                                  setFormattedResponse(formatted);
                                  
                                  toast({
                                    title: 'Response formatted',
                                    status: 'info',
                                    duration: 2000,
                                  });
                                } catch (error) {
                                  console.error('Error formatting response:', error);
                                  toast({
                                    title: 'Error formatting response',
                                    status: 'error',
                                    duration: 3000,
                                  });
                                }
                              }
                            }}
                            colorScheme={colorScheme}
                            leftIcon={<RepeatIcon />}
                            isDisabled={!testResponse}
                          >
                            Format
                          </Button>
                          <IconButton
                            aria-label="Copy response"
                            icon={<CopyIcon />}
                            onClick={() => {
                              navigator.clipboard.writeText(formattedResponse || testResponse);
                              toast({
                                title: 'Response copied',
                                status: 'info',
                                duration: 2000,
                              });
                            }}
                            isDisabled={!testResponse}
                            colorScheme={colorScheme}
                          />
                        </ButtonGroup>
                      </Flex>
                      <Textarea
                        value={formattedResponse || testResponse}
                        isReadOnly
                        placeholder="Response will appear here..."
                        minH="200px"
                        bg="gray.50"
                        fontFamily="monospace"
                      />
                    </GridItem>
                  </Grid>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Usage Tab */}
            <TabPanel px={0}>
              <Card borderRadius="xl" boxShadow="sm" bg="white">
                <CardHeader pb={2}>
                  <Heading size="md">API Usage Examples</Heading>
                </CardHeader>
                <CardBody>
                  <Alert status="info" mb={6} borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>How to Access Your API</AlertTitle>
                      <AlertDescription>
                        <Text mb={1}>
                          <strong>Recommended method:</strong> Use the API path directly at <Code>http://localhost:3000${agent.apiPath}</Code>
                        </Text>
                        <Text>
                          Alternatively, you can also access your agent using the agent ID at <Code>http://localhost:3000/api/agents/${agent.id}/execute</Code>
                        </Text>
                      </AlertDescription>
                    </Box>
                  </Alert>

                  <Tabs variant="enclosed" size="sm">
                    <TabList>
                      <Tab>API Path</Tab>
                      <Tab>cURL</Tab>
                      <Tab>JavaScript</Tab>
                      <Tab>Python</Tab>
                    </TabList>
                    <TabPanels>
                      {/* API Path Tab - Ưu tiên hiển thị trước */}
                      <TabPanel>
                        <Box
                          bg="gray.800"
                          color="white"
                          p={4}
                          borderRadius="md"
                          fontFamily="monospace"
                          fontSize="sm"
                          overflowX="auto"
                        >
                          <Text fontWeight="bold" mb={2} color="cyan.300">API Path:</Text>
                          <Text mb={4} color="green.300">
                            http://localhost:3000${agent.apiPath}
                          </Text>
                          
                          <Text fontWeight="bold" mb={2} color="cyan.300">cURL Example:</Text>
                          <Text whiteSpace="pre" mb={4}>
{`curl -X POST \\
  http://localhost:3000${agent.apiPath} \\
  -H "Content-Type: application/json" \\
  -d '${agent.requestSchema?.type === 'json' ? 
    JSON.stringify(
      agent.requestSchema.fields?.reduce((acc, field) => {
        acc[field.name] = field.type === 'string' ? 'example' : 
                         field.type === 'number' ? 123 : 
                         field.type === 'boolean' ? true : null;
        return acc;
      }, {} as Record<string, unknown>) || {}
    , null, 2) : 
    JSON.stringify("Your text input here", null, 2)
  }'`}
                          </Text>
                          
                          <Text fontWeight="bold" mb={2} color="cyan.300">JavaScript Example:</Text>
                          <Text whiteSpace="pre" mb={4}>
{`fetch('http://localhost:3000${agent.apiPath}', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(${agent.requestSchema?.type === 'json' ? 
    JSON.stringify(
      agent.requestSchema.fields?.reduce((acc, field) => {
        acc[field.name] = field.type === 'string' ? 'example' : 
                         field.type === 'number' ? 123 : 
                         field.type === 'boolean' ? true : null;
        return acc;
      }, {} as Record<string, unknown>) || {}
    , null, 2) : 
    JSON.stringify("Your text input here", null, 2)
  })
})
.then(response => response.json())
.then(data => console.log(data));`}
                          </Text>
                          
                          <Text fontWeight="bold" mb={2} color="cyan.300">Python Example:</Text>
                          <Text whiteSpace="pre">
{`import requests
import json

# Using API path
url = "http://localhost:3000${agent.apiPath}"
headers = {
    "Content-Type": "application/json"
}

payload = ${agent.requestSchema?.type === 'json' ? 
  JSON.stringify(
    agent.requestSchema.fields?.reduce((acc, field) => {
      acc[field.name] = field.type === 'string' ? 'example' : 
                       field.type === 'number' ? 123 : 
                       field.type === 'boolean' ? true : null;
      return acc;
    }, {} as Record<string, unknown>) || {}
  , null, 2) : 
  JSON.stringify("Your text input here", null, 2)
}

response = requests.post(url, headers=headers, data=json.dumps(payload))
data = response.json()
print(data)`}
                          </Text>
                        </Box>
                      </TabPanel>
                      
                      {/* cURL Tab */}
                      <TabPanel>
                        <Box
                          bg="gray.800"
                          color="white"
                          p={4}
                          borderRadius="md"
                          fontFamily="monospace"
                          fontSize="sm"
                          overflowX="auto"
                        >
                          <Text fontWeight="bold" mb={2} color="cyan.300">Using API Path (Recommended):</Text>
                          <Text whiteSpace="pre" mb={4}>
{`curl -X POST \\
  http://localhost:3000${agent.apiPath} \\
  -H "Content-Type: application/json" \\
  -d '${agent.requestSchema?.type === 'json' ? 
    JSON.stringify(
      agent.requestSchema.fields?.reduce((acc, field) => {
        acc[field.name] = field.type === 'string' ? 'example' : 
                         field.type === 'number' ? 123 : 
                         field.type === 'boolean' ? true : null;
        return acc;
      }, {} as Record<string, unknown>) || {}
    , null, 2) : 
    JSON.stringify("Your text input here", null, 2)
  }'`}
                          </Text>
                          
                          <Text fontWeight="bold" mb={2} color="cyan.300">Using Agent ID:</Text>
                          <Text whiteSpace="pre">
{`curl -X POST \\
  http://localhost:3000/api/agents/${agent.id}/execute \\
  -H "Content-Type: application/json" \\
  -d '${agent.requestSchema?.type === 'json' ? 
    JSON.stringify(
      agent.requestSchema.fields?.reduce((acc, field) => {
        acc[field.name] = field.type === 'string' ? 'example' : 
                         field.type === 'number' ? 123 : 
                         field.type === 'boolean' ? true : null;
        return acc;
      }, {} as Record<string, unknown>) || {}
    , null, 2) : 
    JSON.stringify("Your text input here", null, 2)
  }'`}
                          </Text>
                        </Box>
                      </TabPanel>
                      
                      {/* JavaScript Tab */}
                      <TabPanel>
                        <Box
                          bg="gray.800"
                          color="white"
                          p={4}
                          borderRadius="md"
                          fontFamily="monospace"
                          fontSize="sm"
                          overflowX="auto"
                        >
                          <Text fontWeight="bold" mb={2} color="cyan.300">Using API Path (Recommended):</Text>
                          <Text whiteSpace="pre" mb={4}>
{`// Using fetch API with API path
async function callAPI() {
  const response = await fetch('http://localhost:3000${agent.apiPath}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(${agent.requestSchema?.type === 'json' ? 
      JSON.stringify(
        agent.requestSchema.fields?.reduce((acc, field) => {
          acc[field.name] = field.type === 'string' ? 'example' : 
                           field.type === 'number' ? 123 : 
                           field.type === 'boolean' ? true : null;
          return acc;
        }, {} as Record<string, unknown>) || {}
      , null, 2) : 
      JSON.stringify("Your text input here", null, 2)
    })
  });
  
  const data = await response.json();
  console.log(data);
}

callAPI();`}
                          </Text>
                          
                          <Text fontWeight="bold" mb={2} color="cyan.300">Using Agent ID:</Text>
                          <Text whiteSpace="pre">
{`// Using fetch API with agent ID
async function callAPI() {
  const response = await fetch('http://localhost:3000/agents/${agent.id}/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(${agent.requestSchema?.type === 'json' ? 
      JSON.stringify(
        agent.requestSchema.fields?.reduce((acc, field) => {
          acc[field.name] = field.type === 'string' ? 'example' : 
                           field.type === 'number' ? 123 : 
                           field.type === 'boolean' ? true : null;
          return acc;
        }, {} as Record<string, unknown>) || {}
      , null, 2) : 
      JSON.stringify("Your text input here", null, 2)
    })
  });
  
  const data = await response.json();
  console.log(data);
}

callAPI();`}
                          </Text>
                        </Box>
                      </TabPanel>
                      
                      {/* Python Tab */}
                      <TabPanel>
                        <Box
                          bg="gray.800"
                          color="white"
                          p={4}
                          borderRadius="md"
                          fontFamily="monospace"
                          fontSize="sm"
                          overflowX="auto"
                        >
                          <Text fontWeight="bold" mb={2} color="cyan.300">Using API Path (Recommended):</Text>
                          <Text whiteSpace="pre" mb={4}>
{`import requests
import json

# Using API path
url = "http://localhost:3000${agent.apiPath}"
headers = {
    "Content-Type": "application/json"
}

payload = ${agent.requestSchema?.type === 'json' ? 
  JSON.stringify(
    agent.requestSchema.fields?.reduce((acc, field) => {
      acc[field.name] = field.type === 'string' ? 'example' : 
                       field.type === 'number' ? 123 : 
                       field.type === 'boolean' ? true : null;
      return acc;
    }, {} as Record<string, unknown>) || {}
  , null, 2) : 
  JSON.stringify("Your text input here", null, 2)
}

response = requests.post(url, headers=headers, data=json.dumps(payload))
data = response.json()
print(data)`}
                          </Text>
                          
                          <Text fontWeight="bold" mb={2} color="cyan.300">Using Agent ID:</Text>
                          <Text whiteSpace="pre">
{`import requests
import json

# Using agent ID
url = "http://localhost:3000/api/agents/${agent.id}/execute"
headers = {
    "Content-Type": "application/json"
}

payload = ${agent.requestSchema?.type === 'json' ? 
  JSON.stringify(
    agent.requestSchema.fields?.reduce((acc, field) => {
      acc[field.name] = field.type === 'string' ? 'example' : 
                       field.type === 'number' ? 123 : 
                       field.type === 'boolean' ? true : null;
      return acc;
    }, {} as Record<string, unknown>) || {}
  , null, 2) : 
  JSON.stringify("Your text input here", null, 2)
}

response = requests.post(url, headers=headers, data=json.dumps(payload))
data = response.json()
print(data)`}
                          </Text>
                        </Box>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>

      {/* Edit Modal */}
      <AddAgentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          // Refresh agent data after edit
          if (id) {
            console.log('Refreshing agent data after edit');
            
            // Mark as updating agent
            isUpdatingAgentRef.current = true;
            
            // Reset all states completely
            setTestInput('');
            setTestResponse('');
            setFormattedResponse('');
            setSampleGenerated(false);
            
            // Use setTimeout to ensure state updates are processed before fetching
            setTimeout(() => {
              fetchAgentById(id).then(updatedAgent => {
                if (updatedAgent) {
                  // Set agent in a separate tick to avoid render cycles
                  setTimeout(() => {
                    setAgent(updatedAgent);
                    
                    // Mark as updated agent
                    isUpdatingAgentRef.current = false;
                    
                    toast({
                      title: 'Agent refreshed',
                      description: 'The agent data has been refreshed.',
                      status: 'info',
                      duration: 2000,
                      isClosable: true,
                    });
                  }, 0);
                }
              }).catch(error => {
                console.error('Error refreshing agent data:', error);
                
                // Mark as updated agent (even if there's an error)
                isUpdatingAgentRef.current = false;
                
                toast({
                  title: 'Refresh error',
                  description: 'Failed to refresh agent data. Please reload the page.',
                  status: 'error',
                  duration: 3000,
                  isClosable: true,
                });
              });
            }, 0);
          }
        }}
        agent={agent || null}
      />
    </Box>
  );
};

export default AgentDetailsPage; 