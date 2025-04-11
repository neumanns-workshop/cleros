import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { HighlightedText } from '../shared/HighlightedText';
import { ProcessedClauseData } from '../../types';

interface TypeWriterProps {
  text: string;
  spans: ProcessedClauseData[];
  topHymnClauseIds?: Set<string>;
  onComplete: () => void;
}

export const TypeWriter: React.FC<TypeWriterProps> = ({ 
  text, 
  spans,
  topHymnClauseIds,
  onComplete 
}) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    // Improved typewriter effect that adds multiple characters per interval
    const totalDuration = 1200; // Total animation time in ms
    const intervalCount = 15;    // Number of intervals to split the animation into
    const charsPerInterval = Math.ceil(text.length / intervalCount);
    let currentPosition = 0;
    
    const timer = setInterval(() => {
      const nextPosition = Math.min(currentPosition + charsPerInterval, text.length);
      setDisplayText(text.substring(0, nextPosition));
      currentPosition = nextPosition;
      
      if (currentPosition >= text.length) {
        clearInterval(timer);
        onComplete();
      }
    }, totalDuration / intervalCount);
    
    return () => clearInterval(timer);
  }, [text, onComplete]);

  return (
    <Typography
      variant="body1"
      sx={{
        opacity: 1,
        color: '#e0e0e0',
        position: 'relative',
        textAlign: 'center',
        maxWidth: '560px',
        mx: 'auto'
      }}
    >
      <HighlightedText 
        text={displayText}
        spans={spans}
        topHymnClauseIds={topHymnClauseIds}
      />
      {displayText.length < text.length && (
        <span
          style={{
            display: 'inline-block',
            width: '0.5em',
            height: '1.2em',
            background: 'rgba(224, 224, 224, 0.6)',
            animation: 'blink 1s infinite',
            marginLeft: '2px',
            verticalAlign: 'text-bottom',
          }}
        />
      )}
    </Typography>
  );
}; 