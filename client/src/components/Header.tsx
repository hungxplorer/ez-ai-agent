import { 
  Box, 
  Flex, 
  Heading, 
  HStack,
  Container,
  useColorModeValue,
  Text,
  Image
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const activeTextColor = useColorModeValue('brand.500', 'brand.300');
  const logoGradient = "linear(to-r, brand.500, accent.500)";
  
  // Check if link is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Box 
      position="fixed" 
      w="100%" 
      zIndex={10}
      bg={bgColor}
      boxShadow="0 2px 15px rgba(0,0,0,0.05)"
      py={4}
      px={4}
      borderBottom="1px solid"
      borderColor={borderColor}
    >
      <Container maxW="1400px">
        <Flex mx="auto" justify="space-between" align="center">
          <Link to="/">
            <Flex align="center">
              <Box 
                p={1}
                borderRadius="md"
                mr={3}
                transition="all 0.3s"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 15px rgba(71, 118, 230, 0.3)"
                }}
              >
                <Image src="/vite.svg" alt="EZ AI Agent Logo" boxSize="30px" />
              </Box>
              <Heading size="md" fontWeight="bold" bgGradient={logoGradient} bgClip="text">
                EZ AI Agent
              </Heading>
            </Flex>
          </Link>

          <HStack spacing={8}>
            <Link to="/">
              <Box 
                position="relative"
                px={1}
              >
                <Text
                  fontWeight={isActive('/') ? "bold" : "medium"}
                  fontSize="md"
                  color={isActive('/') ? activeTextColor : textColor}
                  _hover={{ color: activeTextColor }}
                  transition="all 0.2s"
                >
                  Home
                </Text>
                {isActive('/') && (
                  <Box 
                    position="absolute"
                    bottom="-8px"
                    left="0"
                    right="0"
                    height="3px"
                    bgGradient={logoGradient}
                    borderRadius="full"
                  />
                )}
              </Box>
            </Link>
            <Link to="/docs">
              <Box 
                position="relative"
                px={1}
              >
                <Text
                  fontWeight={isActive('/docs') ? "bold" : "medium"}
                  fontSize="md"
                  color={isActive('/docs') ? activeTextColor : textColor}
                  _hover={{ color: activeTextColor }}
                  transition="all 0.2s"
                >
                  Documentation
                </Text>
                {isActive('/docs') && (
                  <Box 
                    position="absolute"
                    bottom="-8px"
                    left="0"
                    right="0"
                    height="3px"
                    bgGradient={logoGradient}
                    borderRadius="full"
                  />
                )}
              </Box>
            </Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Header; 