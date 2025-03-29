import { useState, useEffect } from 'react';

export const useTypewriter = (text: string, onComplete?: () => void, speed: number = 15) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, onComplete, speed]);

  const isTyping = currentIndex < text.length;

  return { displayText, isTyping };
}; 