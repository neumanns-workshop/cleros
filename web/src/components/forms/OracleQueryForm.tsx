import React, { useState, useCallback, useMemo } from 'react';
import { TextField, Button, Box, CircularProgress, Divider } from '@mui/material';
import { useOracleContext } from '../../context/OracleContext';
import { useOracle } from '../../hooks/useOracle';
import { SourceSelection } from './SourceSelection';

export const OracleQueryForm: React.FC = React.memo(() => {
  const [question, setQuestion] = useState('');
  const { consultOracle } = useOracle();
  const { isLoading, modelLoading, selectedSources } = useOracleContext();

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    consultOracle(question, selectedSources);
  }, [consultOracle, question, selectedSources]);

  const handleQuestionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuestion(e.target.value);
  }, []);

  const isInitializing = modelLoading;
  const isSubmitDisabled = useMemo(() => 
    isLoading || 
    !question.trim() || 
    isInitializing || 
    !Object.values(selectedSources).some(v => v),
  [isLoading, question, isInitializing, selectedSources]);

  const buttonContent = useMemo(() => {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        position: 'relative',
        minHeight: '24px'
      }}>
        {(isLoading || isInitializing) && (
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
          {isLoading 
            ? 'Consulting the Oracle...' 
            : isInitializing 
              ? 'Initializing Oracle...' 
              : 'Consult the Oracle'
          }
        </Box>
      </Box>
    );
  }, [isLoading, isInitializing]);

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
        disabled={isLoading || isInitializing}
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
        {buttonContent}
      </Button>
    </form>
  );
}); 