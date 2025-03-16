import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { ReactNode, useEffect } from 'react';
import { useThemeStore } from '../store/themeStore';

interface ThemeProviderProps {
  children: ReactNode;
}

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        transition: 'background-color 0.2s',
      },
    },
  },
  colors: {
    brand: {
      50: '#e6f7ff',
      100: '#b3e0ff',
      200: '#80caff',
      300: '#4db3ff',
      400: '#1a9dff',
      500: '#0080ff',
      600: '#0066cc',
      700: '#004d99',
      800: '#003366',
      900: '#001a33',
    },
  },
});

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { colorMode } = useThemeStore();

  // Apply the color mode to the document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorMode);
    document.body.setAttribute('data-theme', colorMode);
    
    // Add or remove the 'dark' class based on the color mode
    if (colorMode === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [colorMode]);

  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
};

export default ThemeProvider; 