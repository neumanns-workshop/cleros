import React, { useMemo, useEffect, useCallback } from 'react';
import { Container, Typography, Box, CircularProgress, Divider } from '@mui/material';
import { ResultDisplay } from './ResultDisplay';
import { useOracleContext } from '../../context/OracleContext';
import { TypewritingQuote } from "./TypewritingQuote";
import { AnimatedEllipsis } from "./AnimatedEllipsis";

export const OracleResponse: React.FC = () => {
  const {
    error,
    modelLoading,
    isLoading,
    isContextDataLoading,
    selectedHymnNumber,
  } = useOracleContext();

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

  // Determine if initial loading (model or context data) is happening
  const isInitializing = modelLoading || isContextDataLoading;

  // Set initial focus for keyboard users
  useEffect(() => {
    if (selectedHymnNumber) {
      const resultsSection = document.getElementById('oracle-results-section');
      if (resultsSection) {
        resultsSection.focus();
      }
    } else if (error) {
      const errorMessage = document.getElementById('oracle-error-message');
      if (errorMessage) {
        errorMessage.focus();
      }
    } else if (!isLoading && !isInitializing) {
      const welcomeSection = document.getElementById('oracle-welcome-section');
      if (welcomeSection) {
        welcomeSection.focus();
      }
    }
  }, [selectedHymnNumber, error, isLoading, isInitializing]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && selectedHymnNumber) {
      console.log('Escape key pressed - could be used to return to welcome screen');
    }
  }, [selectedHymnNumber]);

  // Render welcome message if there are no results yet and not initializing
  const renderWelcomeMessage = () => {
    if (!selectedHymnNumber && !error && !isLoading && !isInitializing) {
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
            outline: 'none',
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
              <Box component="span" sx={{ fontWeight: 'bold' }}>Cleros</Box> (Greek for "lots") modernizes the ancient practice of bibliomancy—drawing wisdom from chance encounters with significant texts.
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
            
            {/* Show animated ellipsis during init, typewriting quote after */}
            {isInitializing ? (
              <AnimatedEllipsis />
            ) : (
              <TypewritingQuote quote={selectedQuote} />
            )}
          </Box>
        </Box>
      );
    }
    return null;
  };

  // Show a loading indicator when loading (Divination in progress)
  const renderLoadingState = () => {
    if (isLoading) {
      const loadingText = "Performing Divination...";
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
            {loadingText}
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
            outline: 'none',
          }}
        >
          {error}
        </Typography>
      );
    }
    return null;
  };

  // Render the main results section (modified logic)
  const renderResultsSection = () => {
    if (!isLoading && !isInitializing && selectedHymnNumber !== null) {
      return (
        <Box 
          component="section" 
          id="oracle-results-section"
          aria-label={`Oracle results for Hymn ${selectedHymnNumber}`}
          tabIndex={-1}
          sx={{ 
            mx: 'auto',
            width: '100%',
            py: 3,
            outline: 'none',
          }}
        >
          <ResultDisplay />
        </Box>
      );
    }
    return null;
  };

  return (
    <Container 
      maxWidth={false} 
      component="div"
      aria-label="Oracle response area"
      onKeyDown={handleKeyDown}
      sx={{ 
        mx: 'auto', 
        maxWidth: '700px !important',
        lineHeight: 1.6,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 0,
      }}
    >
      {renderWelcomeMessage()}
      {renderLoadingState()}
      {renderResultsSection()}
      {renderErrorMessage()}
    </Container>
  );
}; 