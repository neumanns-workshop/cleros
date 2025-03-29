import React, { useState, useCallback, useMemo } from 'react';
import { TextField, Button, Box, CircularProgress, Divider, Tooltip, Typography } from '@mui/material';
import { useOracleContext } from '../../context/OracleContext';
import { useOracle } from '../../hooks/useOracle';
import { SourceSelection } from './SourceSelection';

export const OracleQueryForm: React.FC = React.memo(() => {
  const [question, setQuestion] = useState('');
  const { consultOracle } = useOracle();
  const { isLoading, modelLoading, selectedSources, modelInitialized } = useOracleContext();

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    consultOracle(question, selectedSources);
  }, [consultOracle, question, selectedSources]);

  const handleQuestionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(e.target.value);
  }, []);

  const isSubmitDisabled = useMemo(() => 
    isLoading || 
    !question.trim() || 
    !Object.values(selectedSources).some(v => v),
  [isLoading, question, selectedSources]);

  // Determine the right button content and tooltip text
  const buttonState = useMemo(() => {
    if (isLoading && modelLoading) {
      return {
        text: 'Loading Oracle...',
        tooltip: 'Loading TensorFlow.js models (first use only)',
        showSpinner: true
      };
    } else if (isLoading) {
      return {
        text: 'Consulting Oracle...',
        tooltip: 'Processing your question',
        showSpinner: true
      };
    } else if (modelLoading) {
      return {
        text: 'Loading Oracle...',
        tooltip: 'Loading TensorFlow.js models (first use only)',
        showSpinner: true
      };
    } else {
      return {
        text: 'Consult the Oracle',
        tooltip: modelInitialized ? 'Submit your question' : 'First query will load TensorFlow.js (15MB)',
        showSpinner: false
      };
    }
  }, [isLoading, modelLoading, modelInitialized]);

  return (
    <form onSubmit={handleSubmit} aria-label="Oracle consultation form">
      <TextField
        fullWidth
        variant="standard"
        placeholder="What's on your mind?"
        id="oracle-question"
        aria-label="Enter your question for the oracle"
        value={question}
        onChange={handleQuestionChange}
        disabled={isLoading || modelLoading}
        sx={{ 
          mb: 4,
          '& .MuiInput-underline:before': {
            borderBottomColor: 'rgba(255, 255, 255, 0.1)',
          },
          '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
            borderBottomColor: 'rgba(255, 255, 255, 0.2)',
          },
          '& input::placeholder': {
            color: 'rgba(255, 255, 255, 0.4)',
            letterSpacing: '0.05em',
            fontStyle: 'italic',
          },
          '& .MuiInputBase-input': {
            background: 'transparent !important',
            backgroundColor: 'transparent !important',
          },
          '& .MuiInput-root': {
            background: 'transparent !important',
            backgroundColor: 'transparent !important',
          },
          '&:-webkit-autofill, &:autofill': {
            WebkitBoxShadow: '0 0 0 1000px transparent inset !important',
            WebkitTextFillColor: '#ffffff !important',
            caretColor: '#ffffff !important',
            transition: 'background-color 5000s ease-in-out 0s',
          },
          '&:autofill': {
            boxShadow: '0 0 0 1000px transparent inset !important',
            backgroundColor: 'transparent !important',
          }
        }}
      />

      <SourceSelection />

      <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

      <Tooltip 
        title={buttonState.tooltip} 
        arrow 
        placement="top"
      >
        <span style={{ display: 'block', width: '100%' }}>
          <Button
            type="submit"
            variant="outlined"
            fullWidth
            disabled={isSubmitDisabled}
            aria-label="Submit your question to the oracle"
            sx={{
              color: 'white',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              height: '42px',
              position: 'relative',
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              position: 'relative',
              minHeight: '24px'
            }}>
              {buttonState.showSpinner && (
                <CircularProgress 
                  size={20} 
                  color="inherit" 
                  sx={{ 
                    position: 'absolute',
                    left: { xs: '10px', sm: '20px' } 
                  }} 
                />
              )}
              <Box sx={{ 
                textAlign: 'center',
                width: '100%' 
              }}>
                {buttonState.text}
              </Box>
            </Box>
          </Button>
        </span>
      </Tooltip>
      
      {!modelInitialized && !isLoading && !modelLoading && (
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block', 
            textAlign: 'center', 
            mt: 1, 
            fontSize: '0.7rem', 
            color: 'rgba(255, 255, 255, 0.4)' 
          }}
        >
          First query will load TensorFlow.js (≈15MB)
        </Typography>
      )}
    </form>
  );
}); 