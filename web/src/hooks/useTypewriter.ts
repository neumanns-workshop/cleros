import { useState, useEffect, useRef } from 'react';

interface UseTypewriterOptions {
  text: string;
  speed?: number;
  startDelay?: number;
}

interface UseTypewriterReturn {
  displayedText: string;
  isTyping: boolean;
  isComplete: boolean;
  reset: () => void;
}

export const useTypewriter = ({ 
  text, 
  speed = 80, 
  startDelay = 200 
}: UseTypewriterOptions): UseTypewriterReturn => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentTextRef = useRef('');
  const isActiveRef = useRef(true);

  // Calculate typing delay based on character
  const getTypingDelay = (char: string): number => {
    if (char === '.' || char === '?' || char === '!' || char === ':' || char === ';') {
      return 300; // Longer pause after sentence endings
    } else if (char === ',' || char === '—' || char === '-') {
      return 200; // Medium pause after clauses
    } else if (char === ' ') {
      return 40; // Faster for spaces
    } else {
      // Slight randomization for human-like typing
      return speed + Math.random() * 40;
    }
  };

  // Start the typewriter effect
  const startTyping = () => {
    if (!isActiveRef.current) return;
    
    const fullText = `"${text}"`;
    currentTextRef.current = fullText;
    setDisplayedText('');
    setIsTyping(true);
    setIsComplete(false);
    
    let currentIndex = 0;
    
    const typeNextChar = () => {
      if (!isActiveRef.current || currentTextRef.current !== fullText) {
        return;
      }
      
      if (currentIndex < fullText.length) {
        const textSoFar = fullText.slice(0, currentIndex + 1);
        setDisplayedText(textSoFar);
        
        const currentChar = fullText[currentIndex];
        const delay = getTypingDelay(currentChar);
        currentIndex++;
        
        timeoutRef.current = setTimeout(typeNextChar, delay);
      } else {
        // Typing complete
        setIsTyping(false);
        setIsComplete(true);
      }
    };
    
    // Start after initial delay
    timeoutRef.current = setTimeout(typeNextChar, startDelay);
  };

  // Reset function
  const reset = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setDisplayedText('');
    setIsTyping(false);
    setIsComplete(false);
  };

  // Start typing when text changes
  useEffect(() => {
    isActiveRef.current = true;
    reset();
    startTyping();
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [text]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    displayedText,
    isTyping,
    isComplete,
    reset
  };
};
