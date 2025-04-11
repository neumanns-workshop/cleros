import React, { useState, useEffect } from "react";

interface TypewritingQuoteProps {
  quote: string;
}

export const TypewritingQuote: React.FC<TypewritingQuoteProps> = ({
  quote,
}) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    // Replicate timing logic from TypeWriter.tsx
    setDisplayText(""); // Reset on quote change
    setIsTyping(true);
    const totalDuration = 1200; // Total animation time in ms (match TypeWriter)
    const intervalCount = 15; // Number of intervals (match TypeWriter)
    const charsPerInterval = Math.ceil(quote.length / intervalCount);
    let currentPosition = 0;

    const timer = setInterval(() => {
      const nextPosition = Math.min(
        currentPosition + charsPerInterval,
        quote.length,
      );
      setDisplayText(quote.substring(0, nextPosition));
      currentPosition = nextPosition;

      if (currentPosition >= quote.length) {
        clearInterval(timer);
        setIsTyping(false); // Mark typing as complete
      }
    }, totalDuration / intervalCount);

    return () => clearInterval(timer);
  }, [quote]); // Rerun effect if the quote text changes

  return (
    <>
      {displayText}
      {isTyping && (
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            width: "0.5em",
            height: "1em", // Adjusted height slightly
            background: "rgba(224, 224, 224, 0.6)",
            animation: "blink 1s infinite",
            marginLeft: "2px",
            verticalAlign: "baseline", // Adjusted alignment
          }}
        />
      )}
    </>
  );
};
