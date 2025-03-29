import React, { useMemo, useEffect, useCallback } from 'react';
import { Container, Typography, Box, CircularProgress, Divider } from '@mui/material';
import { ResultDisplay } from './ResultDisplay';
import { useOracleContext } from '../../context/OracleContext';

export const OracleResponse: React.FC = () => {
  const { results, error, modelLoading, isLoading } = useOracleContext();

  // Random quote selection
  const quotes = useMemo(() => [
    "You wield the dreaded, the respected weapon of speech.",
    "In the quiet darkness of a night lit with stars.",
    "Silent you come to show the future to silent souls.",
    "Good always wins the race in people's minds.",
    "Airy, invisible, inexorable, ever indestructible.",
    "The beginning and the end to come are yours.",
    "You harmonize the poles, balancing all that exists.",
  ], []);

  // Select a pseudorandom quote based on the current day
  const selectedQuote = useMemo(() => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = Number(today) - Number(startOfYear);
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    return quotes[dayOfYear % quotes.length];
  }, [quotes]);

  // Set initial focus for keyboard users
  useEffect(() => {
    // If there are results, focus on the results container
    if (results.length > 0) {
      const resultsSection = document.getElementById('oracle-results-section');
      if (resultsSection) {
        resultsSection.focus();
      }
    // If there's an error, focus on the error message
    } else if (error) {
      const errorMessage = document.getElementById('oracle-error-message');
      if (errorMessage) {
        errorMessage.focus();
      }
    // Otherwise, focus on the welcome message when content is ready
    } else if (!isLoading && !modelLoading) {
      const welcomeSection = document.getElementById('oracle-welcome-section');
      if (welcomeSection) {
        welcomeSection.focus();
      }
    }
  }, [results, error, isLoading, modelLoading]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // If ESC key is pressed in results view, it could be used to return to welcome view
    // (This would require state management changes to actually implement)
    if (event.key === 'Escape' && results.length > 0) {
      console.log('Escape key pressed - could be used to return to welcome screen');
    }
  }, [results]);

  // Custom focus style that maintains the aesthetic
  const focusStyle = {
    outline: 'none',
    '&:focus-visible': {
      boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.4)',
      borderRadius: '4px',
      transition: 'box-shadow 0.2s ease-in-out',
    },
  };

  // Render welcome message if there are no results yet and not loading
  const renderWelcomeMessage = () => {
    if (results.length === 0 && !error && !isLoading && !modelLoading) {
      return (
        <Box 
          id="oracle-welcome-section"
          role="region"
          aria-label="Welcome information"
          tabIndex={0}
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            px: 3,
            ...focusStyle,
          }}
        >
          <Box
            component="section"
            sx={{ 
              maxWidth: '550px',
              textAlign: 'center'
            }}
          >
            <Typography 
              variant="body1" 
              component="p"
              sx={{ mb: 6, opacity: 0.95, lineHeight: 1.7 }}
            >
              <Box component="span" sx={{ fontWeight: 'bold' }}>SORTES</Box> (Latin for "lots") modernizes the ancient practice of bibliomancy—drawing wisdom from chance encounters with significant texts.
            </Typography>
            
            <Divider 
              aria-hidden="true"
              sx={{ 
                my: 5, 
                width: '40%', 
                mx: 'auto', 
                opacity: 0.3,
                borderColor: 'rgba(255,255,255,0.5)'
              }} 
            />
            
            <Typography 
              variant="body1" 
              component="blockquote"
              aria-label="Daily philosophical quote"
              sx={{ 
                fontStyle: 'italic', 
                opacity: 0.6, 
                maxWidth: '450px', 
                mx: 'auto',
                letterSpacing: '0.03em',
                fontWeight: 300,
                fontSize: '0.95rem'
              }}
            >
              {selectedQuote}
            </Typography>
          </Box>
        </Box>
      );
    }
    return null;
  };

  // Show a loading indicator when loading
  const renderLoadingState = () => {
    if (isLoading || modelLoading) {
      return (
        <Box 
          role="status"
          aria-live="polite"
          aria-busy="true"
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%'
          }}
        >
          <CircularProgress 
            size={30} 
            aria-label="Loading indicator"
            sx={{ 
              opacity: 0.8,
              mb: 2 
            }} 
          />
          <Typography 
            variant="body2" 
            sx={{ 
              fontStyle: 'italic', 
              opacity: 0.8
            }}
          >
            Consulting the oracle
          </Typography>
        </Box>
      );
    }
    return null;
  };

  // Error handling with proper accessibility
  const renderErrorMessage = () => {
    if (error) {
      return (
        <Typography 
          id="oracle-error-message"
          role="alert"
          color="error"
          tabIndex={0}
          sx={{ 
            mt: 2,
            opacity: 0.9,
            fontWeight: 500,
            p: 2,
            ...focusStyle,
          }}
        >
          {error}
        </Typography>
      );
    }
    return null;
  };

  return (
    <Container 
      maxWidth={false} 
      component="main"
      aria-label="Oracle response area"
      onKeyDown={handleKeyDown}
      sx={{ 
        mx: 'auto', 
        maxWidth: '650px !important', 
        lineHeight: 1.6,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 0
      }}
    >
      {renderWelcomeMessage()}
      {renderLoadingState()}
      
      {results.length > 0 && (
        <Box 
          component="section" 
          id="oracle-results-section"
          aria-label="Oracle results"
          tabIndex={0}
          sx={{ 
            ...focusStyle,
            // Center the content horizontally
            mx: 'auto',
            width: '100%',
          }}
        >
          {results.map((result, index) => (
            <ResultDisplay key={index} result={result} />
          ))}
        </Box>
      )}

      {renderErrorMessage()}
    </Container>
  );
}; 