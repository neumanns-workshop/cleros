import React, { useMemo, useEffect, useState } from 'react';
import { 
  Box, 
  ThemeProvider, 
  createTheme, 
  CssBaseline,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { OracleProvider } from './context/OracleContext';
import { StyleProvider, useStyle } from './context/StyleContext';
import { MainContent } from './components/layout/MainContent';
import { InfoDialog } from './components/shared/InfoDialog';

// Simple error boundary to catch rendering errors
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, bgcolor: '#121212', color: '#ffffff', minHeight: '100vh' }}>
          <Typography variant="h4" sx={{ mb: 2 }}>Something went wrong</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>Error message: {this.state.error?.message}</Typography>
          <Typography variant="body2">Error stack: {this.state.error?.stack}</Typography>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Theme component that uses style context
const ThemedApp: React.FC = () => {
  const { font } = useStyle();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Debug log to check viewport detection
  useEffect(() => {
    console.log('App: Detected viewport =', isMobile ? 'mobile' : 'desktop');
  }, [isMobile]);

  // Monochromatic theme colors
  const colorTheme = {
    background: '#141414',        // Darker background
    paper: '#1c1c1c',             // Darker paper background
    text: '#e0e0e0',              // Slightly muted text
    accent: '#a0a0a0'             // Light gray accent
  };

  // Use useMemo to recalculate theme when context values change
  const darkTheme = useMemo(() => createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: colorTheme.background,
        paper: colorTheme.paper,
      },
      primary: {
        main: colorTheme.accent,
      },
      text: {
        primary: colorTheme.text,
        secondary: 'rgba(255, 255, 255, 0.7)',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          /* Force HTML and Body background */
          html, body {
            background-color: ${colorTheme.background} !important;
            color: ${colorTheme.text};
            min-height: 100%;
            transition: background-color 0.5s ease, color 0.5s ease;
          }
          
          /* Force root element */
          #root {
            background-color: ${colorTheme.background} !important;
            min-height: 100vh;
            transition: background-color 0.5s ease;
          }
          
          /* Global transition for theme changes */
          * {
            transition-property: background-color, border-color, color;
            transition-duration: 0.3s;
            transition-timing-function: ease;
          }
          
          /* Exclude specific properties from universal transition */
          *:not(button):not(a) {
            transition-property: background-color, border-color, color !important;
          }
          
          /* Prevent transition on initial page load */
          .no-transition {
            transition: none !important;
          }
          
          /* Override the default browser autofill styling */
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus,
          textarea:-webkit-autofill,
          textarea:-webkit-autofill:hover,
          textarea:-webkit-autofill:focus,
          select:-webkit-autofill,
          select:-webkit-autofill:hover,
          select:-webkit-autofill:focus {
            WebkitBoxShadow: 0 0 0 1000px transparent inset !important;
            WebkitTextFillColor: ${colorTheme.text} !important;
            transition: backgroundColor 5000s ease-in-out 0s;
            backgroundColor: transparent !important;
          }
          
          input:autofill,
          textarea:autofill,
          select:autofill {
            caretColor: ${colorTheme.text} !important;
            boxShadow: 0 0 0 1000px transparent inset !important;
            backgroundColor: transparent !important;
          }
          
          body {
            font-family: "${font}", sans-serif;
          }
          
          h1, h2, h3, h4, h5, h6 {
            font-family: "${font}", sans-serif;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          
          @keyframes blink {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
          }
        `,
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: colorTheme.paper,
            borderRight: `1px solid ${colorTheme.accent}33`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontFamily: `"${font}", sans-serif`,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }
        }
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            fontFamily: `"${font}", sans-serif`,
          },
          h1: {
            fontFamily: `"${font}", sans-serif`,
            textTransform: 'uppercase',
          },
          h2: {
            fontFamily: `"${font}", sans-serif`,
            textTransform: 'uppercase',
          },
          h3: {
            fontFamily: `"${font}", sans-serif`,
            textTransform: 'uppercase',
          },
          h4: {
            fontFamily: `"${font}", sans-serif`,
            textTransform: 'uppercase',
          },
          h5: {
            fontFamily: `"${font}", sans-serif`,
            textTransform: 'uppercase',
          },
          h6: {
            fontFamily: `"${font}", sans-serif`,
            textTransform: 'uppercase',
          },
        }
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            fontFamily: `"${font}", sans-serif`,
            backgroundColor: 'transparent',
            color: colorTheme.text,
          }
        }
      },
      MuiFilledInput: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
            '& fieldset': {
              borderColor: `${colorTheme.accent}66`,
            },
            '&:hover fieldset': {
              borderColor: `${colorTheme.accent}99`,
            },
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiInputBase-input': {
              backgroundColor: 'transparent !important',
              color: colorTheme.text,
            },
            '& .MuiInputLabel-root': {
              color: `${colorTheme.text}99`,
            },
            '& .MuiFilledInput-root': {
              backgroundColor: 'transparent !important',
            },
            '& input': {
              backgroundColor: 'transparent !important',
            }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: `${colorTheme.paper} !important`,
            color: colorTheme.text,
            backgroundImage: 'none',
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: `${colorTheme.paper} !important`,
            color: colorTheme.text,
            backgroundImage: 'none',
          }
        }
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            backgroundColor: `${colorTheme.paper} !important`,
            color: colorTheme.text,
            backgroundImage: 'none',
          }
        }
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          }
        }
      },
      MuiInput: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent !important',
            '&:before': {
              borderBottomColor: `${colorTheme.accent}33`,
            },
            '&:hover:not(.Mui-disabled):before': {
              borderBottomColor: `${colorTheme.accent}66`,
            },
          },
          input: {
            backgroundColor: 'transparent !important',
          }
        }
      },
    },
    typography: {
      fontFamily: `"${font}", sans-serif`,
      h1: {
        fontSize: '2rem',
        fontWeight: 400,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        fontFamily: `"${font}", sans-serif`,
      },
      h2: {
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontFamily: `"${font}", sans-serif`,
      },
      h3: {
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontFamily: `"${font}", sans-serif`,
      },
      h4: {
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontFamily: `"${font}", sans-serif`,
      },
      h5: {
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontFamily: `"${font}", sans-serif`,
      },
      h6: {
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        fontFamily: `"${font}", sans-serif`,
      },
      body1: {
        fontSize: '1.1rem',
        lineHeight: 1.8,
        letterSpacing: '0.05em',
        fontFamily: `"${font}", sans-serif`,
      },
      body2: {
        fontFamily: `"${font}", sans-serif`,
        letterSpacing: '0.05em',
      },
    },
  }), [font, colorTheme.accent, colorTheme.background, colorTheme.paper, colorTheme.text]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <MainContent />
        <InfoDialog />
      </Box>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <ErrorBoundary>
      <StyleProvider>
        <OracleProvider>
          <ThemedApp />
        </OracleProvider>
      </StyleProvider>
    </ErrorBoundary>
  );
};

const Root: React.FC = () => (
  <ThemeProvider theme={createTheme()}>
    <App />
  </ThemeProvider>
);

export default Root;
