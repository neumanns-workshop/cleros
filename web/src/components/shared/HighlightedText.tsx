import React from "react";
import tinycolor from "tinycolor2";
import { ProcessedClauseData } from "../../types"; // Import from shared types

interface HighlightedTextProps {
  text: string | null;
  spans: ProcessedClauseData[]; // Use imported type
  className?: string;
  topHymnClauseIds?: Set<string>; // Added prop for top IDs
}

/* // Removed local ClauseHighlightData interface
interface ClauseHighlightData {
  text: string;
  category: string;
  start_char: number;
  end_char: number;
  similarity: number; // Keep for potential future use/debugging, but not for styling
  rankSaturation: number; // Pre-calculated saturation (0-100)
  rankLightness: number;  // Pre-calculated lightness (0-100)
}
*/

// Helper to get base text color for a category (returns HEX)
const getCategoryHexColor = (category: string): string => {
  switch (category.toLowerCase()) {
    case "deity":
      return "#ffd700"; // Gold
    case "epithet":
      return "#da70d6"; // Orchid
    case "place":
      return "#4fc3f7"; // Light Blue
    case "mortal":
      return "#ff7043"; // Coral
    case "nature":
      return "#4CAF50"; // Green
    // --- New Categories ---
    case "action":
      return "#ef5350"; // Light Red
    case "artifact":
      return "#ab47bc"; // Purple
    case "beast":
      return "#7e57c2"; // Deep Purple
    case "celestial_sphere":
      return "#26a69a"; // Teal
    case "hero":
      return "#ffee58"; // Yellow
    case "other_divinity":
      return "#ffca28"; // Amber
    // --- Default ---
    default:
      return "#4DD0E1"; // Cyan (was #F5F5F5 Off-White)
  }
};

// Memoize the component to prevent unnecessary re-renders
export const HighlightedText: React.FC<HighlightedTextProps> = React.memo(
  ({
    text,
    spans,
    className = "",
    topHymnClauseIds = new Set(), // Default to empty set
  }) => {
    // Explicitly handle null or empty text
    if (!text) {
      return <span className={className}></span>;
    }

    if (!spans || spans.length === 0) {
      return <span className={className}>{text}</span>;
    }

    const segments: JSX.Element[] = [];
    let lastIndex = 0;

    // Sort spans for correct rendering order
    const sortedSpans = [...spans].sort((a, b) => a.start_char - b.start_char);

    sortedSpans.forEach((span, index) => {
      // Push preceding text if any
      if (span.start_char > lastIndex) {
        segments.push(
          <span key={`text-${index}`}>
            {text.substring(lastIndex, span.start_char)}
          </span>,
        );
      }

      // Reconstruct the unique span ID
      const spanId = `${span.hymn_id}-s${span.sentence_index}-${span.start_char}`;

      // Check if this span is one of the hymn-level top clauses
      const shouldHighlight = topHymnClauseIds.has(spanId);

      // Prepare style and class conditionally
      let spanStyle: React.CSSProperties = {
        position: "relative",
      };
      let spanClassName = "";

      if (shouldHighlight) {
        const categoryColorHex = getCategoryHexColor(span.category);
        spanStyle = {
          ...spanStyle,
          color: categoryColorHex,
          fontWeight: 500, // Apply boldness only if highlighted
        };
        spanClassName = `span-${span.category.toLowerCase()}`;
      }

      // Push the span segment (highlighted or plain)
      segments.push(
        <span
          key={`span-${index}-${spanId}`} // Use a more unique key
          className={spanClassName}
          style={spanStyle}
          title={
            shouldHighlight
              ? `${span.category} (Top Hymn Match: ${span.similarity.toFixed(4)})`
              : undefined
          } // Optional: Modify title for clarity
        >
          {text?.substring(span.start_char, span.end_char)}
        </span>,
      );

      lastIndex = span.end_char;
    });

    if (lastIndex < (text?.length || 0)) {
      segments.push(<span key="text-last">{text?.substring(lastIndex)}</span>);
    }

    return <span className={`highlighted-text ${className}`}>{segments}</span>;
  },
);

// Add display name for better debugging
HighlightedText.displayName = "HighlightedText";
