import { Heading, Text, Button, Center, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Center h="60vh">
      <VStack spacing={6} textAlign="center">
        <Heading size="2xl">404</Heading>
        <Heading size="xl">Page Not Found</Heading>
        <Text fontSize="lg">
          The page you are looking for doesn't exist or has been moved.
        </Text>
        <Link to="/">
          <Button colorScheme="blue" size="lg">
            Return to Home
          </Button>
        </Link>
      </VStack>
    </Center>
  );
};

export default NotFoundPage; 