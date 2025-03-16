import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AgentDetailsPage from './pages/AgentDetailsPage';
import DocumentationPage from './pages/DocumentationPage';
import NotFoundPage from './pages/NotFoundPage';
import { ApiProvider } from './api';

// Extend the theme to include custom colors, fonts, etc
const theme = extendTheme({
  colors: {
    brand: {
      50: '#f0f4fe',
      100: '#d9e2fc',
      200: '#b6c9f9',
      300: '#8ba8f5',
      400: '#6689f2',
      500: '#4776E6', // Primary color
      600: '#3d68d8',
      700: '#2c4eb0',
      800: '#1f3780',
      900: '#142456',
    },
    accent: {
      50: '#f5f0fe',
      100: '#e9dcfc',
      200: '#d4bdf9',
      300: '#bb95f5',
      400: '#a574f1',
      500: '#8E54E9', // Secondary color
      600: '#7c46d4',
      700: '#6334b0',
      800: '#4a2680',
      900: '#301956',
    },
  },
  fonts: {
    heading: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'md',
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          transition: 'all 0.2s ease-in-out',
          _hover: {
            boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'white',
        color: 'gray.800',
      },
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <ApiProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/agent/:id" element={<AgentDetailsPage />} />
            <Route path="/docs" element={<DocumentationPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </ApiProvider>
    </ChakraProvider>
  );
}

export default App;
