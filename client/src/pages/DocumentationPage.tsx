import {
  Box,
  Heading,
  Text,
  VStack,
  Code,
  Link,
  Divider,
  Container,
  Grid,
  GridItem,
  Flex,
  Icon,
  Card,
  CardBody,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  ListItem,
  UnorderedList,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Tab,
} from "@chakra-ui/react";
import {
  FiBook,
  FiCode,
  FiMessageSquare,
  FiServer,
  FiCpu,
  FiDatabase,
  FiKey,
} from "react-icons/fi";

const DocumentationPage = () => {
  const bgGradient = useColorModeValue(
    'linear(to-b, gray.50, white)',
    'linear(to-b, gray.900, gray.800)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const codeBlockBg = useColorModeValue('gray.50', 'gray.700');
  const highlightColor = useColorModeValue('brand.50', 'brand.900');

  return (
    <Box minH="100vh" w="100vw" pt="100px" pb="60px" bgGradient={bgGradient}>
      {/* Main Content */}
      <Container maxW="1200px" mt={12}>
        <Grid templateColumns={{ base: "1fr", lg: "250px 1fr" }} gap={10}>
          {/* Sidebar Navigation */}
          <GridItem display={{ base: "none", lg: "block" }}>
            <VStack align="stretch" position="sticky" top="100px" spacing={2}>
              <Heading size="sm" mb={2} color={textColor}>
                Documentation
              </Heading>
              <Link
                py={2}
                px={3}
                borderRadius="md"
                bg={highlightColor}
                color="brand.700"
                fontWeight="medium"
                href="#getting-started"
              >
                Getting Started
              </Link>
              <Link py={2} px={3} borderRadius="md" _hover={{ bg: "gray.50" }} href="#supported-models">
                Supported Models
              </Link>
              <Link py={2} px={3} borderRadius="md" _hover={{ bg: "gray.50" }} href="#system-prompts">
                System Prompts
              </Link>
              <Link py={2} px={3} borderRadius="md" _hover={{ bg: "gray.50" }} href="#schemas">
                Request & Response Schemas
              </Link>
              <Link py={2} px={3} borderRadius="md" _hover={{ bg: "gray.50" }} href="#using-api">
                Using Your API
              </Link>
              <Link py={2} px={3} borderRadius="md" _hover={{ bg: "gray.50" }} href="#api-reference">
                API Reference
              </Link>
              <Link py={2} px={3} borderRadius="md" _hover={{ bg: "gray.50" }} href="#troubleshooting">
                Troubleshooting
              </Link>
            </VStack>
          </GridItem>

          {/* Main Content */}
          <GridItem>
            <VStack spacing={12} align="stretch">
              {/* Getting Started Section */}
              <Box id="getting-started">
                <Flex align="center" mb={6}>
                  <Icon as={FiBook} color="brand.500" boxSize={6} mr={3} />
                  <Heading
                    as="h2"
                    size="xl"
                    bgGradient="linear(to-r, brand.500, accent.500)"
                    bgClip="text"
                  >
                    Getting Started
                  </Heading>
                </Flex>
                <Text fontSize="lg" mb={6} color={textColor}>
                  EZ AI Agent allows you to create custom AI agents
                  powered by various large language models. You can define the
                  behavior of these agents using system prompts and schema
                  definitions.
                </Text>

                <Card
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  mb={6}
                  overflow="hidden"
                  bg={cardBg}
                >
                  <CardBody>
                    <Heading size="md" mb={4} color={textColor}>
                      To create your first AI agent:
                    </Heading>
                    <VStack align="stretch" spacing={3}>
                      <Flex>
                        <Badge
                          colorScheme="blue"
                          fontSize="md"
                          borderRadius="full"
                          px={3}
                          py={1}
                          mr={4}
                        >
                          1
                        </Badge>
                        <Text>Click on "Create New Agent" on the home page</Text>
                      </Flex>
                      <Flex>
                        <Badge
                          colorScheme="blue"
                          fontSize="md"
                          borderRadius="full"
                          px={3}
                          py={1}
                          mr={4}
                        >
                          2
                        </Badge>
                        <Text>
                          Enter a name for your AI agent
                        </Text>
                      </Flex>
                      <Flex>
                        <Badge
                          colorScheme="blue"
                          fontSize="md"
                          borderRadius="full"
                          px={3}
                          py={1}
                          mr={4}
                        >
                          3
                        </Badge>
                        <Text>
                          Choose your preferred LLM model (Gemini, ChatGPT, Deepseek)
                        </Text>
                      </Flex>
                      <Flex>
                        <Badge
                          colorScheme="blue"
                          fontSize="md"
                          borderRadius="full"
                          px={3}
                          py={1}
                          mr={4}
                        >
                          4
                        </Badge>
                        <Text>
                          Enter your API key for the selected model
                        </Text>
                      </Flex>
                      <Flex>
                        <Badge
                          colorScheme="blue"
                          fontSize="md"
                          borderRadius="full"
                          px={3}
                          py={1}
                          mr={4}
                        >
                          5
                        </Badge>
                        <Text>
                          Define the API path for your endpoint (e.g., /api/translate)
                        </Text>
                      </Flex>
                      <Flex>
                        <Badge
                          colorScheme="blue"
                          fontSize="md"
                          borderRadius="full"
                          px={3}
                          py={1}
                          mr={4}
                        >
                          6
                        </Badge>
                        <Text>
                          Create request and response schemas to define the data structure
                        </Text>
                      </Flex>
                      <Flex>
                        <Badge
                          colorScheme="blue"
                          fontSize="md"
                          borderRadius="full"
                          px={3}
                          py={1}
                          mr={4}
                        >
                          7
                        </Badge>
                        <Text>
                          Write a system prompt that guides the AI's behavior
                        </Text>
                      </Flex>
                      <Flex>
                        <Badge
                          colorScheme="blue"
                          fontSize="md"
                          borderRadius="full"
                          px={3}
                          py={1}
                          mr={4}
                        >
                          8
                        </Badge>
                        <Text>
                          Click "Create" to generate your AI agent
                        </Text>
                      </Flex>
                    </VStack>
                  </CardBody>
                </Card>

                <Text fontSize="md" mb={6} color={textColor}>
                  Once created, your AI agent will be available immediately. You can test it, edit its configuration, or integrate it into your applications.
                </Text>
              </Box>

              <Divider />

              {/* Supported Models Section */}
              <Box id="supported-models">
                <Flex align="center" mb={6}>
                  <Icon as={FiCpu} color="brand.500" boxSize={6} mr={3} />
                  <Heading
                    as="h2"
                    size="xl"
                    bgGradient="linear(to-r, brand.500, accent.500)"
                    bgClip="text"
                  >
                    Supported Models
                  </Heading>
                </Flex>
                <Text fontSize="lg" mb={6} color={textColor}>
                  EZ AI Agent supports multiple large language models. Each model has its own strengths and capabilities.
                </Text>

                <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} mb={6}>
                  <Card borderRadius="lg" borderWidth="1px" borderColor={borderColor} bg={cardBg}>
                    <CardBody>
                      <Flex align="center" mb={3}>
                        <Icon as={FiCpu} color="blue.500" boxSize={5} mr={2} />
                        <Heading size="md" color={textColor}>Gemini</Heading>
                      </Flex>
                      <Text color={textColor} mb={3}>
                        Google's advanced LLM with strong reasoning capabilities and multimodal support.
                      </Text>
                      <Badge colorScheme="blue">Recommended</Badge>
                    </CardBody>
                  </Card>

                  <Card borderRadius="lg" borderWidth="1px" borderColor={borderColor} bg={cardBg}>
                    <CardBody>
                      <Flex align="center" mb={3}>
                        <Icon as={FiMessageSquare} color="green.500" boxSize={5} mr={2} />
                        <Heading size="md" color={textColor}>ChatGPT</Heading>
                      </Flex>
                      <Text color={textColor} mb={3}>
                        OpenAI's powerful conversational model with broad knowledge and capabilities.
                      </Text>
                      <Badge colorScheme="green">Popular</Badge>
                    </CardBody>
                  </Card>

                  <Card borderRadius="lg" borderWidth="1px" borderColor={borderColor} bg={cardBg}>
                    <CardBody>
                      <Flex align="center" mb={3}>
                        <Icon as={FiDatabase} color="purple.500" boxSize={5} mr={2} />
                        <Heading size="md" color={textColor}>Deepseek</Heading>
                      </Flex>
                      <Text color={textColor} mb={3}>
                        Specialized model with strong coding and technical capabilities.
                      </Text>
                      <Badge colorScheme="purple">Technical</Badge>
                    </CardBody>
                  </Card>
                </Grid>
              </Box>

              <Divider />

              {/* System Prompts Section */}
              <Box id="system-prompts">
                <Flex align="center" mb={6}>
                  <Icon
                    as={FiMessageSquare}
                    color="accent.500"
                    boxSize={6}
                    mr={3}
                  />
                  <Heading
                    as="h2"
                    size="xl"
                    bgGradient="linear(to-r, brand.500, accent.500)"
                    bgClip="text"
                  >
                    System Prompts
                  </Heading>
                </Flex>
                <Text fontSize="lg" mb={4} color={textColor}>
                  The system prompt is the most important part of your API
                  configuration. It defines how the AI should behave and what
                  kind of responses it should generate.
                </Text>
                <Text fontSize="lg" mb={4} color={textColor}>
                  Write clear, specific instructions for the AI to follow. For
                  example:
                </Text>
                <Box
                  bg={codeBlockBg}
                  p={6}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  mb={6}
                  position="relative"
                  _before={{
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "4px",
                    height: "100%",
                    bg: "linear-gradient(to bottom, #4776E6, #8E54E9)",
                    borderTopLeftRadius: "lg",
                    borderBottomLeftRadius: "lg",
                  }}
                >
                  <Code
                    p={0}
                    bg="transparent"
                    fontSize="md"
                    whiteSpace="pre-wrap"
                    color={textColor}
                  >
                    {`You are a helpful assistant that specializes in translating English text to Vietnamese.
When given English text, provide an accurate and natural-sounding Vietnamese translation.
Maintain the original tone and style of the text.
If there are culturally specific references, provide appropriate Vietnamese equivalents.
Do not add any explanations or notes unless specifically requested.`}
                  </Code>
                </Box>

                <Text fontSize="lg" mb={4} color={textColor}>
                  Tips for writing effective system prompts:
                </Text>
                <UnorderedList spacing={2} mb={6} color={textColor}>
                  <ListItem>Be specific about the AI's role and purpose</ListItem>
                  <ListItem>Define the expected input and output formats</ListItem>
                  <ListItem>Set boundaries for what the AI should and shouldn't do</ListItem>
                  <ListItem>Include examples if helpful</ListItem>
                  <ListItem>Keep instructions clear and concise</ListItem>
                </UnorderedList>

                <Text fontSize="lg" color={textColor}>
                  The system prompt will be combined with your schema definitions to create a comprehensive instruction set for the AI.
                </Text>
              </Box>

              <Divider />

              {/* Request & Response Schemas Section */}
              <Box id="schemas">
                <Flex align="center" mb={6}>
                  <Icon as={FiCode} color="brand.500" boxSize={6} mr={3} />
                  <Heading
                    as="h2"
                    size="xl"
                    bgGradient="linear(to-r, brand.500, accent.500)"
                    bgClip="text"
                  >
                    Request & Response Schemas
                  </Heading>
                </Flex>
                <Text fontSize="lg" mb={6} color={textColor}>
                  Schemas define the structure of data sent to and received from your AI agent. They help ensure consistent data formats and improve the reliability of your API.
                </Text>
                
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} mb={6}>
                  <Card borderRadius="lg" borderWidth="1px" borderColor={borderColor} h="100%" bg={cardBg}>
                    <CardBody>
                      <Heading size="md" mb={3} color="brand.600">Request Schema</Heading>
                      <Text color={textColor} mb={4}>
                        Defines what data your API expects to receive. You can specify required fields, 
                        data types, and descriptions.
                      </Text>
                      <Box bg={codeBlockBg} p={4} borderRadius="md" fontSize="sm" fontFamily="mono">
                        <Text color={textColor}>JSON format example:</Text>
                        <Code display="block" whiteSpace="pre" bg="transparent" color={textColor} mt={2}>
{`{
  "text": "Hello, how are you?",
  "target_language": "vi"
}`}
                        </Code>
                      </Box>
                    </CardBody>
                  </Card>
                  
                  <Card borderRadius="lg" borderWidth="1px" borderColor={borderColor} h="100%" bg={cardBg}>
                    <CardBody>
                      <Heading size="md" mb={3} color="accent.600">Response Schema</Heading>
                      <Text color={textColor} mb={4}>
                        Defines how your API will structure its responses. This helps ensure 
                        consistent output format that can be easily parsed by client applications.
                      </Text>
                      <Box bg={codeBlockBg} p={4} borderRadius="md" fontSize="sm" fontFamily="mono">
                        <Text color={textColor}>JSON format example:</Text>
                        <Code display="block" whiteSpace="pre" bg="transparent" color={textColor} mt={2}>
{`{
  "translated_text": "Xin chào, bạn khỏe không?",
  "detected_language": "en",
  "confidence": 0.98
}`}
                        </Code>
                      </Box>
                    </CardBody>
                  </Card>
                </Grid>
                
                <Text fontSize="lg" mb={4} color={textColor}>
                  When creating schemas, you can choose between:
                </Text>
                <UnorderedList spacing={2} mb={6} color={textColor}>
                  <ListItem><strong>JSON format:</strong> Structured data with defined fields, types, and requirements</ListItem>
                  <ListItem><strong>Plain text format:</strong> Simple text input and output without specific structure</ListItem>
                </UnorderedList>

                <Text fontSize="lg" mb={4} color={textColor}>
                  For JSON schemas, you can define fields with the following properties:
                </Text>
                <Table variant="simple" mb={6}>
                  <Thead>
                    <Tr>
                      <Th>Property</Th>
                      <Th>Description</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td>Name</Td>
                      <Td>The field name (e.g., "text", "target_language")</Td>
                    </Tr>
                    <Tr>
                      <Td>Type</Td>
                      <Td>Data type (string, number, boolean, object, array)</Td>
                    </Tr>
                    <Tr>
                      <Td>Required</Td>
                      <Td>Whether the field must be included in requests/responses</Td>
                    </Tr>
                  </Tbody>
                </Table>
              </Box>

              <Divider />

              {/* Using Your API Section */}
              <Box id="using-api">
                <Flex align="center" mb={6}>
                  <Icon as={FiServer} color="accent.500" boxSize={6} mr={3} />
                  <Heading
                    as="h2"
                    size="xl"
                    bgGradient="linear(to-r, brand.500, accent.500)"
                    bgClip="text"
                  >
                    Using Your API
                  </Heading>
                </Flex>
                <Text fontSize="lg" mb={6} color={textColor}>
                  Once you've created an AI agent, you can integrate it into your applications using standard HTTP requests.
                </Text>

                <Heading size="md" mb={4} color={textColor}>Making API Requests</Heading>
                <Box
                  bg={codeBlockBg}
                  p={6}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  mb={6}
                >
                  <Code
                    p={0}
                    bg="transparent"
                    fontSize="md"
                    whiteSpace="pre-wrap"
                    color={textColor}
                  >
{`// Example using fetch in JavaScript
async function callAPI() {
  const response = await fetch('https://your-domain.com/api/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: 'Hello, how are you?',
      target_language: 'vi'
    })
  });
  
  const data = await response.json();
  console.log(data);
}`}
                  </Code>
                </Box>

                <Heading size="md" mb={4} color={textColor}>API Response</Heading>
                <Box
                  bg={codeBlockBg}
                  p={6}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  mb={6}
                >
                  <Code
                    p={0}
                    bg="transparent"
                    fontSize="md"
                    whiteSpace="pre-wrap"
                    color={textColor}
                  >
{`// Example response
{
  "translated_text": "Xin chào, bạn khỏe không?",
  "detected_language": "en",
  "confidence": 0.98
}`}
                  </Code>
                </Box>

                <Text fontSize="lg" mb={6} color={textColor}>
                  Your AI agents are secured with your LLM provider's API key. Make sure to keep this key secure and not expose it in client-side code.
                </Text>
              </Box>

              <Divider />

              {/* API Reference Section */}
              <Box id="api-reference">
                <Flex align="center" mb={6}>
                  <Icon as={FiCode} color="purple.500" boxSize={6} mr={3} />
                  <Heading
                    as="h2"
                    size="xl"
                    bgGradient="linear(to-r, brand.500, accent.500)"
                    bgClip="text"
                  >
                    API Reference
                  </Heading>
                </Flex>
                <Text fontSize="lg" mb={6} color={textColor}>
                  Technical details for integrating with your custom AI agents.
                </Text>

                <Heading as="h3" size="md" mt={6} mb={2}>
                  Request Format
                </Heading>
                <Text mb={4}>
                  When making a request to execute an agent, send your data directly in the request body:
                </Text>

                <Box bg="gray.50" p={4} borderRadius="md" mb={4} overflowX="auto">
                  <Text fontFamily="mono" whiteSpace="pre">
                    {`// For text-based agents
{
  "your text input here"
}

// For JSON-based agents
{
  "field1": "value1",
  "field2": "value2"
}
`}
                  </Text>
                </Box>

                <Heading as="h3" size="md" mt={6} mb={2}>
                  Request Examples
                </Heading>

                <Tabs variant="enclosed" mt={4}>
                  <TabList>
                    <Tab>cURL</Tab>
                    <Tab>JavaScript</Tab>
                    <Tab>Python</Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel>
                      <Box bg="gray.50" p={4} borderRadius="md" overflowX="auto">
                        <Text fontFamily="mono" whiteSpace="pre">
                          {`# Using agent ID
curl -X POST \\
  ${window.location.origin}/api/agents/YOUR_AGENT_ID/execute \\
  -H "Content-Type: application/json" \\
  -d '"Your text input here"'

# Using API path directly (recommended)
curl -X POST \\
  ${window.location.origin}/api/YOUR_API_PATH \\
  -H "Content-Type: application/json" \\
  -d '"Your text input here"'`}
                        </Text>
                      </Box>
                    </TabPanel>

                    <TabPanel>
                      <Box bg="gray.50" p={4} borderRadius="md" overflowX="auto">
                        <Text fontFamily="mono" whiteSpace="pre">
                          {`// Using agent ID
fetch('${window.location.origin}/api/agents/YOUR_AGENT_ID/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify("Your text input here")
})
.then(response => response.json())
.then(data => console.log(data));

// Using API path directly (recommended)
fetch('${window.location.origin}/api/YOUR_API_PATH', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify("Your text input here")
})
.then(response => response.json())
.then(data => console.log(data));`}
                        </Text>
                      </Box>
                    </TabPanel>

                    <TabPanel>
                      <Box bg="gray.50" p={4} borderRadius="md" overflowX="auto">
                        <Text fontFamily="mono" whiteSpace="pre">
                          {`import requests
import json

# Using agent ID
url = "${window.location.origin}/api/agents/YOUR_AGENT_ID/execute"
headers = {
    "Content-Type": "application/json"
}
payload = "Your text input here"

response = requests.post(url, headers=headers, json=payload)
data = response.json()
print(data)

# Using API path directly (recommended)
url = "${window.location.origin}/api/YOUR_API_PATH"
headers = {
    "Content-Type": "application/json"
}
payload = "Your text input here"

response = requests.post(url, headers=headers, json=payload)
data = response.json()
print(data)`}
                        </Text>
                      </Box>
                    </TabPanel>
                  </TabPanels>
                </Tabs>

                <Heading size="md" mb={4} color={textColor}>Error Responses</Heading>
                <Box
                  bg={codeBlockBg}
                  p={6}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  mb={6}
                >
                  <Code
                    p={0}
                    bg="transparent"
                    fontSize="md"
                    whiteSpace="pre-wrap"
                    color={textColor}
                  >
{`// Error response format
{
  "error": {
    "message": "Description of the error",
    "code": "ERROR_CODE"
  }
}

// Common error codes:
// - INVALID_REQUEST: Request doesn't match the defined schema
// - AUTHORIZATION_ERROR: API key issues
// - MODEL_ERROR: Problems with the LLM provider
// - SERVER_ERROR: Internal server errors`}
                  </Code>
                </Box>
              </Box>

              <Divider />

              {/* Troubleshooting Section */}
              <Box id="troubleshooting">
                <Flex align="center" mb={6}>
                  <Icon as={FiKey} color="accent.500" boxSize={6} mr={3} />
                  <Heading
                    as="h2"
                    size="xl"
                    bgGradient="linear(to-r, brand.500, accent.500)"
                    bgClip="text"
                  >
                    Troubleshooting
                  </Heading>
                </Flex>
                <Text fontSize="lg" mb={6} color={textColor}>
                  Common issues and their solutions.
                </Text>

                <Card
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  mb={6}
                  bg={cardBg}
                >
                  <CardBody>
                    <Heading size="md" mb={4} color={textColor}>API Key Issues</Heading>
                    <Text color={textColor} mb={2}>
                      If you receive authorization errors, check:
                    </Text>
                    <UnorderedList spacing={2} mb={4} color={textColor}>
                      <ListItem>Your API key is valid and active</ListItem>
                      <ListItem>You have sufficient credits/quota with your LLM provider</ListItem>
                      <ListItem>The API key has the necessary permissions</ListItem>
                    </UnorderedList>
                  </CardBody>
                </Card>

                <Card
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  mb={6}
                  bg={cardBg}
                >
                  <CardBody>
                    <Heading size="md" mb={4} color={textColor}>Schema Validation Errors</Heading>
                    <Text color={textColor} mb={2}>
                      If your requests are being rejected:
                    </Text>
                    <UnorderedList spacing={2} mb={4} color={textColor}>
                      <ListItem>Ensure your request matches the defined schema</ListItem>
                      <ListItem>Check that all required fields are included</ListItem>
                      <ListItem>Verify data types match the schema definition</ListItem>
                    </UnorderedList>
                  </CardBody>
                </Card>

                <Card
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  mb={6}
                  bg={cardBg}
                >
                  <CardBody>
                    <Heading size="md" mb={4} color={textColor}>Response Quality Issues</Heading>
                    <Text color={textColor} mb={2}>
                      If responses aren't meeting expectations:
                    </Text>
                    <UnorderedList spacing={2} mb={4} color={textColor}>
                      <ListItem>Refine your system prompt to be more specific</ListItem>
                      <ListItem>Add examples in your system prompt</ListItem>
                      <ListItem>Consider using a different LLM model</ListItem>
                    </UnorderedList>
                  </CardBody>
                </Card>

                <Text fontSize="lg" color={textColor}>
                  For additional help, check the detailed logs in your agent details page or contact support.
                </Text>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default DocumentationPage;
