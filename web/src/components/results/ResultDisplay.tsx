import React, { useMemo } from 'react';
import { Box, Typography, Collapse, Button } from '@mui/material';
import { TypeWriter } from './TypeWriter';
import { useOracleContext } from '../../context/OracleContext';
import { HymnResult } from '../../types';
import { HighlightedText } from '../shared/HighlightedText';
import { fixFragmentedText } from '../../utils/textUtils';

interface ResultDisplayProps {
  result: HymnResult;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = React.memo(({ result }) => {
  const { isTyping, setIsTyping, expanded, setExpanded } = useOracleContext();
  
  // Memoize the main text line for better performance with fragment fixing
  // Now with fallback to next best lines if the top-ranked is empty
  const mainLine = useMemo(() => {
    // Try to get the top-ranked line first
    let baseText = '';
    let originalIndex = 0;
    
    // Sort the lines by rank to ensure we try them in order of relevance
    const sortedLines = [...result.lines].sort((a, b) => a.rank - b.rank);
    
    // Try each line in order until we find a non-empty one after processing
    for (const line of sortedLines) {
      const processedText = fixFragmentedText(line.text);
      if (processedText) {
        baseText = processedText;
        originalIndex = line.originalIndex;
        break;
      }
    }
    
    // If no valid lines are found, fallback to the first line with any content
    if (!baseText && result.lines.length > 0) {
      for (const line of result.lines) {
        if (line.text.trim()) {
          baseText = line.text;
          originalIndex = line.originalIndex;
          break;
        }
      }
    }
    
    console.log('Selected main line:', { 
      text: baseText, 
      originalIndex,
      linesCount: result.lines.length,
      firstFewLines: result.lines.slice(0, 3).map(l => ({ 
        rank: l.rank, 
        text: l.text.substring(0, 30) + (l.text.length > 30 ? '...' : ''),
        processedText: fixFragmentedText(l.text).substring(0, 30) + (fixFragmentedText(l.text).length > 30 ? '...' : '')
      }))
    });
    
    return { text: baseText, originalIndex };
  }, [result.lines]);
  
  // Memoize secondary lines to avoid re-renders and fix fragmented text
  const secondaryLines = useMemo(() => 
    result.lines.map((line, lineIndex) => {
      const opacity = line.rank === 0 ? 1 :
                      line.rank === 1 ? 0.8 :
                      line.rank === 2 ? 0.6 :
                      0.4;
      
      // Fix fragmented text before rendering
      const fixedText = fixFragmentedText(line.text);
      
      // Skip empty text (this will hide lines that contain only periods or commas)
      if (!fixedText) return null;
                      
      return (
        <Typography
          key={lineIndex}
          variant="body1"
          sx={{
            opacity,
            transition: 'opacity 0.5s ease-in-out',
            marginLeft: '1rem',
            marginBottom: 2,
            color: '#e0e0e0',  // Updated text color
            willChange: 'opacity',
          }}
        >
          <HighlightedText 
            text={fixedText}
            hymnId={String(result.hymn)}
            lineNum={line.originalIndex}
          />
        </Typography>
      );
    }).filter(Boolean), // Remove nulls
  [result.lines, result.hymn]);
  
  return (
    <Box sx={{ mb: 6 }} role="article" aria-label={`Oracle response for: ${result.question}`}>
      <Typography variant="h1" component="h1" gutterBottom align="center" sx={{ 
        mb: 3, 
        letterSpacing: '0.2em'
      }}>
        {result.title}
      </Typography>

      {/* Incense and timestamp display */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        mb: 3,
        opacity: 0.7
      }}
      aria-label="Ritual details"
      >
        {result.incense && (
          <Typography
            variant="body2"
            align="center"
            sx={{
              fontStyle: 'italic',
              color: '#e0e0e0',
              mb: 1
            }}
          >
            {result.incense}
          </Typography>
        )}
        {result.timestamp && (
          <Typography
            variant="body2"
            align="center"
            component="time"
            dateTime={result.timestamp}
            sx={{
              fontSize: '0.8rem',
              color: '#e0e0e0'
            }}
          >
            {new Date(result.timestamp).toLocaleString()}
          </Typography>
        )}
      </Box>
      
      {/* Horizontal rule before question - subtle gray */}
      <Box 
        sx={{
          width: '40%',
          margin: '0 auto 2rem auto',
          height: '1px',
          background: 'linear-gradient(90deg, rgba(224,224,224,0) 0%, rgba(224,224,224,0.15) 50%, rgba(224,224,224,0) 100%)'
        }}
        role="separator"
        aria-hidden="true"
      />

      {/* User question */}
      {result.question && (
        <Typography
          variant="body1"
          align="center"
          component="blockquote"
          aria-label="Your question"
          sx={{
            mb: 4,
            backgroundColor: 'transparent !important',
            background: 'transparent !important',
            color: '#e0e0e0',  // Updated text color
            padding: 2,
            borderRadius: 1,
            fontFamily: 'inherit',
            boxShadow: 'none',
            '&::before, &::after': {
              backgroundColor: 'transparent !important',
              background: 'transparent !important'
            }
          }}
        >
          {result.question}
        </Typography>
      )}

      {/* Horizontal rule after question - subtle gray */}
      <Box 
        sx={{
          width: '40%',
          margin: '0 auto 2rem auto',
          height: '1px',
          background: 'linear-gradient(90deg, rgba(224,224,224,0) 0%, rgba(224,224,224,0.15) 50%, rgba(224,224,224,0) 100%)'
        }}
        role="separator"
        aria-hidden="true"
      />

      {/* Oracle response */}
      <Box
        sx={{
          marginBottom: 2,
          display: 'flex',
          justifyContent: 'center',
        }}
        aria-live="polite"
        aria-atomic="true"
      >
        {isTyping ? (
          <TypeWriter 
            text={mainLine.text}
            hymnId={String(result.hymn)}
            lineNum={mainLine.originalIndex} 
            onComplete={() => setIsTyping(false)}
          />
        ) : (
          <Typography
            variant="body1"
            component="p"
            sx={{
              opacity: 1,
              color: '#e0e0e0',  // Updated text color
              willChange: 'opacity',
              fontWeight: expanded ? 500 : 400,
              textAlign: 'center',
              maxWidth: '560px',
              mx: 'auto'
            }}
          >
            <HighlightedText 
              text={mainLine.text}
              hymnId={String(result.hymn)}
              lineNum={mainLine.originalIndex}
            />
          </Typography>
        )}
      </Box>

      {/* Divider always present */}
      <Box
        sx={{
          width: '30%',
          margin: '0 auto 1rem auto',
          height: '1px',
          background: 'linear-gradient(90deg, rgba(224,224,224,0) 0%, rgba(224,224,224,0.1) 50%, rgba(224,224,224,0) 100%)',
          opacity: 0.6,
        }}
        role="separator"
        aria-hidden="true"
      />

      {/* Toggle button - always visible */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        mb: expanded ? 2 : 0
      }}>
        <Button
          onClick={() => !isTyping && setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls={`expanded-response-${result.hymn}`}
          sx={{
            color: 'rgba(224, 224, 224, 0.5)',
            textTransform: 'none',
            '&:hover': {
              color: 'rgba(224, 224, 224, 0.8)',
            },
          }}
        >
          {expanded ? 'Show less' : 'Show more'}
        </Button>
      </Box>

      {/* Show complete text when expanded */}
      <Collapse in={expanded} timeout="auto">
        <Box sx={{ 
          pl: 2, 
          mt: 2,
          maxWidth: '560px',
          mx: 'auto'
        }}
        id={`expanded-response-${result.hymn}`}
        aria-label="Additional oracle insights"
        >          
          {secondaryLines}
        </Box>
      </Collapse>
    </Box>
  );
}); 