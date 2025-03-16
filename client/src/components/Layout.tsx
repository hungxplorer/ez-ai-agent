import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const contentBgColor = useColorModeValue('white', 'gray.800');

  return (
    <Box minH="100vh" bg={bgColor}>
      <Header />
      <Flex pt="60px" px={4} maxW="1400px" mx="auto">
        <Box
          w="full"
          bg={contentBgColor}
          p={5}
          borderRadius="md"
          boxShadow="sm"
          my={4}
        >
          {children}
        </Box>
      </Flex>
    </Box>
  );
};

export default Layout; 