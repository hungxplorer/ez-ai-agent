import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  useDisclosure,
  Badge,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Tag,
  TagLabel,
  Divider,
  useColorModeValue,
  Wrap,
  WrapItem,
  chakra,
  SimpleGrid,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiCpu, FiCode, FiMessageSquare, FiDatabase, FiSearch, FiArrowRight, FiServer, FiZap, FiGlobe } from 'react-icons/fi';
import { useAgentStore } from '~/store/agentStore';
import AddAgentModal from '~/components/AddAgentModal';
import { AIAgent } from '~/types';
import { useApi } from '~/api';

const HomePage = () => {
  const { agents, fetchAgents } = useAgentStore();
  const { isLoading } = useApi(); // Get loading state from API context
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch agents on component mount
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleAddAgent = () => {
    setSelectedAgent(null);
    onOpen();
  };

  const handleEditAgent = (agent: AIAgent) => {
    setSelectedAgent(agent);
    onOpen();
  };

  // Filter agents based on search query
  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.llmType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.apiPath.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Map LLM types to icons
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

  // Get color scheme based on LLM type
  const getLLMColorScheme = (llmType: string) => {
    switch (llmType) {
      case 'ChatGPT':
        return 'green';
      case 'Gemini':
        return 'blue';
      case 'Deepseek':
        return 'purple';
      default:
        return 'gray';
    }
  };

  // Background colors
  const bgGradient = useColorModeValue(
    'linear(to-b, gray.50, white)',
    'linear(to-b, gray.900, gray.800)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const statCardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const subtleTextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  
  // Pre-compute hover background colors for each LLM type
  const chatGptHoverBg = useColorModeValue('green.50', 'green.900');
  const geminiHoverBg = useColorModeValue('blue.50', 'blue.900');
  const deepseekHoverBg = useColorModeValue('purple.50', 'purple.900');
  const defaultHoverBg = useColorModeValue('gray.50', 'gray.900');
  
  // Function to get the hover background color based on LLM type
  const getHoverBg = (llmType: string) => {
    switch (llmType) {
      case 'ChatGPT':
        return chatGptHoverBg;
      case 'Gemini':
        return geminiHoverBg;
      case 'Deepseek':
        return deepseekHoverBg;
      default:
        return defaultHoverBg;
    }
  };

  return (
    <Box 
      bgGradient={bgGradient}
      minH="100vh"
      w="100vw"
      pt="100px"
      pb="60px"
    >
      <Container maxW="1400px" px={{ base: 4, md: 8 }}>
        {/* Hero Section */}
        <Flex 
          direction={{ base: 'column', lg: 'row' }} 
          justify="center" 
          align="center"
          mb={{ base: 10, md: 16 }}
          gap={{ base: 8, lg: 4 }}
          mx="auto"
        >
          <Box maxW={{ lg: "600px" }} textAlign="center">
            <chakra.h1
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              fontWeight="bold"
              lineHeight="1.2"
              mb={4}
              bgGradient="linear(to-r, brand.500, accent.500)"
              bgClip="text"
            >
              EZ AI Agent
            </chakra.h1>
            <Text 
              fontSize={{ base: "lg", md: "xl" }}
              color={subtleTextColor}
              mb={6}
              maxW="600px"
              mx="auto"
            >
              Create and manage custom AI agents powered by large language models. 
              Build intelligent applications with just a few clicks.
            </Text>
            
            <Button 
              onClick={handleAddAgent} 
              leftIcon={<FiPlus />}
              bgGradient="linear(to-r, brand.500, accent.500)"
              color="white"
              _hover={{ 
                bgGradient: "linear(to-r, brand.600, accent.600)",
                boxShadow: "0 4px 20px rgba(71, 118, 230, 0.4)"
              }}
              borderRadius="full"
              px={8}
              py={6}
              size="lg"
              fontSize="md"
              fontWeight="bold"
              transition="all 0.3s"
            >
              Create New Agent
            </Button>
          </Box>
          
          <Box 
            position="relative" 
            w={{ base: "100%", md: "450px", lg: "500px" }}
            h={{ base: "250px", md: "300px", lg: "350px" }}
            borderRadius="2xl"
            overflow="hidden"
            boxShadow="xl"
          >
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg="brand.500"
              opacity="0.1"
              borderRadius="2xl"
              zIndex="1"
            />
            <Box
              position="absolute"
              top="10px"
              left="10px"
              right="10px"
              bottom="10px"
              bg="white"
              borderRadius="xl"
              boxShadow="md"
              zIndex="2"
              p={4}
              overflow="hidden"
            >
              <VStack align="start" spacing={3}>
              <HStack>
                  <Icon as={FiMessageSquare} color="blue.500" boxSize={5} />
                  <Text fontWeight="bold" color="gray.800">English Translator AI Agent</Text>
                </HStack>
                <Divider />
                <Text fontSize="sm" color="gray.600" fontFamily="mono">
                  {`{`}
                </Text>
                <Text fontSize="sm" color="gray.600" fontFamily="mono" pl={4}>
                  {`"text": "Hello, how are you?",`}
                </Text>
                <Text fontSize="sm" color="gray.600" fontFamily="mono" pl={4}>
                  {`"target_language": "vi"`}
                </Text>
                <Text fontSize="sm" color="gray.600" fontFamily="mono">
                  {`}`}
                </Text>
                <Divider />
                <HStack>
                  <Icon as={FiZap} color="orange.500" boxSize={5} />
                  <Text fontWeight="bold" color="gray.800">Response</Text>
                </HStack>
                <Text fontSize="sm" color="gray.600" fontFamily="mono" pl={4}>
                  {`"data": "Xin chào, bạn thế nào?"`}
                </Text>
              </VStack>
            </Box>
            <Box
              position="absolute"
              bottom="-30px"
              right="-30px"
              w="150px"
              h="150px"
              borderRadius="full"
              bg="accent.500"
              opacity="0.2"
              zIndex="0"
            />
            <Box
              position="absolute"
              top="-20px"
              left="-20px"
              w="100px"
              h="100px"
              borderRadius="full"
              bg="brand.500"
              opacity="0.2"
              zIndex="0"
            />
          </Box>
        </Flex>

        {/* Search Bar */}
        <Flex 
          justify="center" 
          mb={{ base: 8, md: 12 }}
          position="relative"
          zIndex="1"
          mx="auto"
        >
          <InputGroup 
            maxW={{ base: "100%", md: "600px" }}
            size="lg"
          >
            <InputLeftElement pointerEvents="none" h="full">
              <Icon as={FiSearch} color="gray.400" boxSize={5} />
            </InputLeftElement>
            <Input 
              placeholder="Search agents..." 
              bg={cardBg}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              borderRadius="full"
              borderWidth="2px"
              borderColor={borderColor}
              _focus={{
                borderColor: "brand.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)"
              }}
              fontSize="md"
              h="60px"
              _hover={{
                borderColor: "brand.400"
              }}
            />
          </InputGroup>
        </Flex>

        {/* Stats Section */}
        {agents.length > 0 && (
          <SimpleGrid 
            columns={{ base: 2, md: 4 }} 
            spacing={{ base: 4, md: 6 }}
            mb={{ base: 8, md: 12 }}
            mx="auto"
            maxW="1200px"
          >
            <Card 
              borderRadius="xl" 
              boxShadow="md" 
              bg={statCardBg}
              borderWidth="1px"
              borderColor={borderColor}
              overflow="hidden"
              position="relative"
              transition="all 0.3s"
              _hover={{
                transform: "translateY(-5px)",
                boxShadow: "lg"
              }}
            >
              <Box 
                position="absolute" 
                top="0" 
                left="0" 
                right="0" 
                h="4px" 
                bg="brand.500" 
              />
              <CardBody p={6}>
                <Flex direction="column">
                  <HStack mb={2}>
                    <Icon as={FiServer} color="brand.500" boxSize={5} />
                    <Text color={subtleTextColor} fontSize="sm">Total Agents</Text>
                  </HStack>
                  <Text fontSize="3xl" fontWeight="bold" color={textColor}>
                    {agents.length}
                  </Text>
                </Flex>
              </CardBody>
            </Card>

            <Card 
              borderRadius="xl" 
              boxShadow="md" 
              bg={statCardBg}
              borderWidth="1px"
              borderColor={borderColor}
              overflow="hidden"
              position="relative"
              transition="all 0.3s"
              _hover={{
                transform: "translateY(-5px)",
                boxShadow: "lg"
              }}
            >
              <Box 
                position="absolute" 
                top="0" 
                left="0" 
                right="0" 
                h="4px" 
                bg="green.500" 
              />
              <CardBody p={6}>
                <Flex direction="column">
                  <HStack mb={2}>
                    <Icon as={FiMessageSquare} color="green.500" boxSize={5} />
                    <Text color={subtleTextColor} fontSize="sm">ChatGPT Agents</Text>
                  </HStack>
                  <Text fontSize="3xl" fontWeight="bold" color={textColor}>
                    {agents.filter(a => a.llmType === 'ChatGPT').length}
                  </Text>
                </Flex>
              </CardBody>
            </Card>

            <Card 
              borderRadius="xl" 
              boxShadow="md" 
              bg={statCardBg}
              borderWidth="1px"
              borderColor={borderColor}
              overflow="hidden"
              position="relative"
              transition="all 0.3s"
              _hover={{
                transform: "translateY(-5px)",
                boxShadow: "lg"
              }}
            >
              <Box 
                position="absolute" 
                top="0" 
                left="0" 
                right="0" 
                h="4px" 
                bg="blue.500" 
              />
              <CardBody p={6}>
                <Flex direction="column">
                  <HStack mb={2}>
                    <Icon as={FiCpu} color="blue.500" boxSize={5} />
                    <Text color={subtleTextColor} fontSize="sm">Gemini Agents</Text>
                  </HStack>
                  <Text fontSize="3xl" fontWeight="bold" color={textColor}>
                    {agents.filter(a => a.llmType === 'Gemini').length}
                  </Text>
                </Flex>
              </CardBody>
            </Card>
            
            <Card 
              borderRadius="xl" 
              boxShadow="md" 
              bg={statCardBg}
              borderWidth="1px"
              borderColor={borderColor}
              overflow="hidden"
              position="relative"
              transition="all 0.3s"
              _hover={{
                transform: "translateY(-5px)",
                boxShadow: "lg"
              }}
            >
              <Box 
                position="absolute" 
                top="0" 
                left="0" 
                right="0" 
                h="4px" 
                bg="purple.500" 
              />
              <CardBody p={6}>
                <Flex direction="column">
                  <HStack mb={2}>
                    <Icon as={FiGlobe} color="purple.500" boxSize={5} />
                    <Text color={subtleTextColor} fontSize="sm">Other Models</Text>
                  </HStack>
                  <Text fontSize="3xl" fontWeight="bold" color={textColor}>
                    {agents.filter(a => a.llmType !== 'ChatGPT' && a.llmType !== 'Gemini').length}
                  </Text>
                </Flex>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {/* Agents Section */}
        {isLoading ? (
          <Flex justify="center" align="center" h="300px">
            <Text>Loading agents...</Text>
          </Flex>
        ) : agents.length === 0 ? (
          <Card 
            p={{ base: 6, md: 10 }}
            borderRadius="2xl" 
            bg={cardBg}
            textAlign="center"
            boxShadow="xl"
            borderWidth="1px"
            borderColor={borderColor}
            maxW="800px"
            mx="auto"
            overflow="hidden"
            position="relative"
          >
            <Box
              position="absolute"
              top="-50px"
              right="-50px"
              w="150px"
              h="150px"
              borderRadius="full"
              bg="brand.500"
              opacity="0.1"
            />
            <Box
              position="absolute"
              bottom="-30px"
              left="-30px"
              w="100px"
              h="100px"
              borderRadius="full"
              bg="accent.500"
              opacity="0.1"
            />
            <VStack spacing={8} position="relative" zIndex="1">
              <Icon as={FiServer} boxSize={{ base: 12, md: 16 }} color="gray.300" />
              <Heading size="lg" color={textColor}>No AI Agents Yet</Heading>
              <Text color={subtleTextColor} maxW="600px" mx="auto" fontSize="lg">
                Start building AI-powered applications with a few clicks.
              </Text>
            </VStack>
          </Card>
        ) : (
          <Box maxW="1200px" mx="auto">
            {searchQuery && (
              <Text mb={6} color={subtleTextColor} fontSize="lg" textAlign="center">
                Found {filteredAgents.length} agent{filteredAgents.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </Text>
            )}
            
            <SimpleGrid 
              columns={{ 
                base: 1, 
                md: 2, 
                lg: 3,
                xl: 4
              }} 
              spacing={8}
            >
              {filteredAgents.map((agent) => {
                const LLMIcon = getLLMIcon(agent.llmType);
                const colorScheme = getLLMColorScheme(agent.llmType);
                const hoverBg = getHoverBg(agent.llmType);
                
                return (
                  <Card 
                    key={agent.id} 
                    borderRadius="xl" 
                    overflow="hidden" 
                    boxShadow="lg"
                    transition="all 0.3s"
                    _hover={{
                      transform: 'translateY(-8px)',
                      boxShadow: 'xl',
                    }}
                    borderWidth="1px"
                    borderColor={borderColor}
                    bg={cardBg}
                    h="100%"
                    display="flex"
                    flexDirection="column"
                    position="relative"
                  >
                    <Box 
                      position="absolute" 
                      top="0" 
                      left="0" 
                      right="0" 
                      h="6px" 
                      bg={`${colorScheme}.500`} 
                    />
                    <CardHeader pb={3}>
                      <Flex justify="space-between" align="flex-start" mb={4}>
                        <Box 
                          bg={`${colorScheme}.50`}
                          p={3}
                          borderRadius="xl"
                          boxShadow="sm"
                        >
                          <Icon 
                            as={LLMIcon} 
                            boxSize={6} 
                            color={`${colorScheme}.500`}
                          />
                        </Box>
                        <Badge 
                          colorScheme={colorScheme}
                          borderRadius="full"
                          px={3}
                          py={1.5}
                          fontSize="xs"
                          fontWeight="medium"
                          textTransform="none"
                          boxShadow="sm"
                        >
                          {agent.llmType}
                        </Badge>
                      </Flex>
                      <Heading size="md" fontWeight="bold" mb={1} noOfLines={1} color={textColor}>
                        {agent.name}
                      </Heading>
                      <Text color={subtleTextColor} fontSize="sm" mb={2} fontFamily="mono">
                        {agent.apiPath}
                      </Text>
                    </CardHeader>
                    
                    <CardBody pt={0} flex="1">
                      <Box
                        bg={hoverBg}
                        p={3}
                        borderRadius="md"
                        mb={4}
                        borderLeft="3px solid"
                        borderColor={`${colorScheme}.500`}
                      >
                        <Text color={textColor} noOfLines={3} fontSize="sm">
                          {agent.systemPrompt}
                        </Text>
                      </Box>
                      
                      <Wrap spacing={2}>
                        <WrapItem>
                          <Tag 
                            size="sm" 
                            borderRadius="full" 
                            colorScheme={colorScheme} 
                            variant="subtle"
                            boxShadow="sm"
                          >
                            <TagLabel>{agent.requestSchema?.type || 'text'}</TagLabel>
                          </Tag>
                        </WrapItem>
                        {agent.requestSchema?.fields && (
                          <WrapItem>
                            <Tag 
                              size="sm" 
                              borderRadius="full" 
                              variant="subtle"
                              boxShadow="sm"
                            >
                              <TagLabel>{agent.requestSchema.fields.length} fields</TagLabel>
                            </Tag>
                          </WrapItem>
                        )}
                      </Wrap>
                    </CardBody>
                    
                    <Divider borderColor={borderColor} />
                    
                    <CardFooter pt={3}>
                      <Flex justify="space-between" width="100%" align="center">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditAgent(agent)}
                          color={subtleTextColor}
                          _hover={{
                            bg: hoverBg,
                            color: `${colorScheme}.500`
                          }}
                          leftIcon={<Icon as={FiCode} />}
                        >
                          Edit
                        </Button>
                        <Link to={`/agent/${agent.id}`} style={{ width: 'auto' }}>
                          <Button 
                            rightIcon={<FiArrowRight />}
                            variant="ghost"
                            size="sm"
                            color={`${colorScheme}.500`}
                            fontWeight="medium"
                            _hover={{
                              bg: hoverBg,
                            }}
                          >
                            View Details
                          </Button>
                        </Link>
                      </Flex>
                    </CardFooter>
                  </Card>
                );
              })}
            </SimpleGrid>
          </Box>
        )}
      </Container>

      {/* Add/Edit Agent Modal */}
      <AddAgentModal
        isOpen={isOpen}
        onClose={onClose}
        agent={selectedAgent}
      />
    </Box>
  );
};

export default HomePage; 