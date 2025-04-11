import React from "react";
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  useTheme,
} from "@mui/material";
import { ProcessedSentenceData, ProcessedClauseData } from "../../types";

interface ShareCardProps {
  hymnTitle: string | null;
  hymnOrigin: string | null;
  hymnNumber: number | null;
  timestamp: string | null;
  // query: string | null; // Add query if available
  primarySentence: ProcessedSentenceData | null;
  topHymnClausesMap: Record<string, ProcessedClauseData> | null;
  topHymnClauseIds?: Set<string>; // Added prop
  userQuery?: string | null; // Add query prop
}

// Copied from HighlightedText.tsx
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
    default:
      return "#4DD0E1"; // Cyan (matches index.css) - was "#bdbdbd" (Lighter Grey)
  }
};

// Simple date formatter
const formatTimestamp = (isoString: string | null): string => {
  if (!isoString) return "Unknown Time";
  try {
    return new Date(isoString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch (e) {
    return "Invalid Date";
  }
};

// Helper to render sentence with inline highlights
const renderSentenceWithHighlights = (
  sentence: ProcessedSentenceData,
  topHymnClauseIds: Set<string> | undefined,
  defaultColor: string,
) => {
  if (!sentence || !sentence.text) return "";

  const segments: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  const clausesToConsider = sentence.clauses || [];
  const safeTopIds = topHymnClauseIds || new Set();

  // Sort clauses by start character
  clausesToConsider.sort((a, b) => a.start_char - b.start_char);

  clausesToConsider.forEach((clause) => {
    // Check if this clause should be highlighted
    const spanId = `${clause.hymn_id}-s${clause.sentence_index}-${clause.start_char}`;
    const shouldHighlight = safeTopIds.has(spanId);

    // Add preceding text
    if (clause.start_char > lastIndex) {
      segments.push(sentence.text.substring(lastIndex, clause.start_char));
    }

    // Add clause text (highlighted or plain)
    const clauseText = sentence.text.substring(
      clause.start_char,
      clause.end_char,
    );
    if (shouldHighlight) {
      const categoryColor = getCategoryHexColor(clause.category);
      segments.push(
        <span key={spanId} style={{ color: categoryColor, fontWeight: 500 }}>
          {clauseText}
        </span>,
      );
    } else {
      segments.push(clauseText);
    }

    lastIndex = clause.end_char;
  });

  // Add remaining text
  if (lastIndex < sentence.text.length) {
    segments.push(sentence.text.substring(lastIndex));
  }

  // Wrap in a single element or return array for React fragment
  return segments;
};

export const ShareCard: React.FC<ShareCardProps> = React.memo(
  ({
    hymnTitle,
    hymnOrigin,
    hymnNumber,
    timestamp,
    primarySentence,
    topHymnClausesMap,
    topHymnClauseIds,
    userQuery,
  }) => {
    const theme = useTheme();
    const cardId = "share-card-render-target"; // ID for html2canvas

    // Define hardcoded colors based on the theme observed in App.tsx
    const primaryTextColor = "#e0e0e0"; // theme.palette.text.primary
    const secondaryTextColor = "#a0a0a0"; // Accent/secondary for timestamps, etc.
    const slightlyDimmedTextColor = "#cccccc"; // Approx primary text with 0.8 opacity
    const dimmedTextColor = "#b0b0b0"; // Approx primary text with 0.6 opacity
    const veryDimmedTextColor = "#888888"; // Approx primary text with 0.5 opacity
    const paperBackgroundColor = theme.palette.background.paper; // Still use theme for background

    if (!primarySentence || !topHymnClausesMap) {
      // Don't render anything if data is missing (or render placeholder?)
      return null;
    }

    // Reformat hymn identifier: [ORIGIN] [Title]
    const originText = hymnOrigin ? `${hymnOrigin.toUpperCase()} ` : ""; // Uppercase origin + space
    const titleText = hymnTitle || "Untitled Hymn";
    const hymnIdentifier = `${originText}${titleText}`;

    return (
      // This Box is rendered off-screen but available for capture
      <Box
        id={cardId}
        style={{
          backgroundColor: paperBackgroundColor, // Background from theme
          color: primaryTextColor, // Base text color hardcoded
        }}
        sx={{
          position: "absolute",
          left: "-9999px",
          top: "auto",
          width: "500px",
          padding: "24px",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: "8px",
          fontFamily: theme.typography.fontFamily,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ letterSpacing: "0.12em" }}>
          cleros
          <Box
            component="span"
            sx={{
              fontSize: "0.6em",
              opacity: 0.6,
              fontWeight: 400,
              letterSpacing: "0.08em",
              ml: 0.5,
            }}
            style={{ color: dimmedTextColor }}
          >
            | digital bibliomancy
          </Box>
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Typography
          variant="body2"
          sx={{ mb: 1 }}
          style={{ color: slightlyDimmedTextColor }}
        >
          {hymnIdentifier}
        </Typography>
        <Typography
          variant="caption"
          display="block"
          sx={{ mb: 2 }}
          style={{ color: dimmedTextColor }}
        >
          {formatTimestamp(timestamp)}
        </Typography>

        {/* Display the Query */}
        {userQuery && (
          <Typography
            sx={{ mt: 1, fontStyle: "italic", color: "text.secondary" }}
          >
            {userQuery}
          </Typography>
        )}

        {/* Use the helper function to render the primary sentence */}
        <Typography
          variant="body1"
          paragraph
          sx={{ lineHeight: 1.7, my: 3 }}
          style={{ color: primaryTextColor }}
        >
          {renderSentenceWithHighlights(
            primarySentence,
            topHymnClauseIds,
            primaryTextColor,
          )}
        </Typography>

        <Divider sx={{ mt: 2, mb: 1 }} />
        <Typography
          variant="caption"
          sx={{ display: "block" }}
          style={{ color: veryDimmedTextColor }}
        >
          neumannsworkshop.com/cleros
        </Typography>
      </Box>
    );
  },
);
