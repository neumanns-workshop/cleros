import React, { useMemo, useCallback, useState, useEffect } from "react";
import { Box, Typography, Collapse, Button, Chip } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TypeWriter } from "./TypeWriter";
import { useOracleContext } from "../../context/OracleContext";
import { HighlightedText } from "../shared/HighlightedText";
import { fixFragmentedText } from "../../utils/textUtils";
import { ProcessedSentenceData, ProcessedClauseData } from "../../types";

export const ResultDisplay: React.FC = React.memo(() => {
  const {
    isTyping,
    setIsTyping,
    expanded,
    setExpanded,
    selectedHymnNumber,
    primarySentence,
    allSentencesForHymn,
    selectedHymnOrigin,
    selectedHymnTitle,
    divinationTimestamp,
    topHymnClauseIds,
  } = useOracleContext();

  const [typewriterKey, setTypewriterKey] = useState(0);

  useEffect(() => {
    if (primarySentence) {
      setTypewriterKey((prev) => prev + 1);
      setIsTyping(true);
    }
  }, [primarySentence, setIsTyping]);

  const processedSentences = useMemo(() => {
    if (!allSentencesForHymn) return [];

    // Process sentences, fix text, and determine opacity
    const sentencesWithData = allSentencesForHymn
      .map((sentence) => {
        const fixedText = fixFragmentedText(sentence.text);

        // Pass the full list of clauses; HighlightedText will handle filtering
        const spansToHighlight = sentence.clauses;

        return {
          ...sentence,
          fixedText,
          lineSpans: spansToHighlight, // Use the full clause list
          rankOpacity: 1.0,
        };
      })
      .filter((s) => s.fixedText);

    // Sort by COMBINED score (descending) to determine rank for opacity
    const sortedByScore = [...sentencesWithData].sort(
      (a, b) => b.combined_score - a.combined_score,
    );

    const numSentences = sortedByScore.length;
    const minOpacity = 0.2;
    const maxOpacity = 1.0;
    const opacityRange = maxOpacity - minOpacity;
    const opacityStep =
      numSentences > 1 ? opacityRange / (numSentences - 1) : 0; // Avoid division by zero if only 1 sentence

    // Assign opacity based on rank (using combined score rank)
    const sentencesWithRankOpacity = sortedByScore.map((sentence, index) => ({
      ...sentence,
      rankOpacity: maxOpacity - index * opacityStep,
    }));
    // --- End Rank-Based Opacity Calculation ---

    // Re-sort back to original sentence order for display
    return sentencesWithRankOpacity.sort(
      (a, b) => a.sentence_index - b.sentence_index,
    );
  }, [allSentencesForHymn]);

  const secondaryLines = useMemo(() => {
    if (!processedSentences) return [];

    return processedSentences
      .map((sentence) => {
        if (!sentence.fixedText) return null;

        return (
          <Typography
            key={`${sentence.hymn_id}-${sentence.sentence_index}`}
            variant="body1"
            sx={{
              opacity: sentence.rankOpacity, // Use pre-calculated rank-based opacity
              transition: "opacity 0.5s ease-in-out",
              marginLeft: "1rem",
              marginBottom: 2,
              color: "#e0e0e0",
              willChange: "opacity",
            }}
          >
            <HighlightedText
              text={sentence.fixedText}
              spans={sentence.lineSpans} // Pass full list of clauses
              topHymnClauseIds={topHymnClauseIds} // Pass the set of top IDs
            />
          </Typography>
        );
      })
      .filter(Boolean);
  }, [processedSentences, topHymnClauseIds]);

  if (!primarySentence) {
    return null;
  }

  const fixedPrimaryText = fixFragmentedText(primarySentence.text);
  // Prepare the full spans list for the primary sentence
  const primarySpans = primarySentence.clauses;

  const handleExpandToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <Box
      role="article"
      aria-label={`Details for ${selectedHymnTitle || `${selectedHymnOrigin || "Hymn"} ${selectedHymnNumber || "??"}`}`}
    >
      {/* Header Section - Display Title AND Origin/Number/Timestamp */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 3,
          opacity: 0.9,
        }}
        aria-label="Divination details"
      >
        {/* Display Title */}
        <Typography
          variant="h5"
          component="h2"
          sx={{ color: "#e0e0e0", mb: 0.5, textAlign: "center" }}
        >
          {selectedHymnTitle || `Hymn ${selectedHymnNumber || "??"}`}
        </Typography>
        {/* Display Origin/Number Tag and Timestamp on a second line as Chips */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 1,
            mt: 0.5,
          }}
        >
          {selectedHymnOrigin && (
            <Chip
              label={selectedHymnOrigin.toLowerCase()}
              size="small"
              variant="outlined"
              sx={{
                color: "rgba(224, 224, 224, 0.6)",
                borderColor: "rgba(224, 224, 224, 0.2)",
                fontSize: "0.65rem",
                height: "20px",
                letterSpacing: "0.05em",
              }}
            />
          )}
          {divinationTimestamp && (
            // Revert timestamp to Typography for better spacing
            <Typography
              variant="caption"
              component="time"
              dateTime={new Date(divinationTimestamp).toISOString()}
              sx={{
                color: "rgba(224, 224, 224, 0.6)",
                fontSize: "0.75rem", // Slightly larger than chip
                letterSpacing: "0.04em",
              }}
            >
              {`· ${divinationTimestamp}`}
            </Typography>
          )}
        </Box>
      </Box>
      {/* Optional Divider */}
      <Box
        sx={{
          width: "40%",
          margin: "0 auto 2rem auto",
          height: "1px",
          background:
            "linear-gradient(90deg, rgba(224,224,224,0) 0%, rgba(224,224,224,0.15) 50%, rgba(224,224,224,0) 100%)",
        }}
        role="separator"
        aria-hidden="true"
      />

      {/* --- Primary Sentence Display --- */}
      {fixedPrimaryText && (
        // Wrap the conditional rendering and add ID here
        <Box id="share-card-render-target" sx={{ mb: 2 }}>
          {isTyping ? (
            <TypeWriter
              key={typewriterKey}
              text={fixedPrimaryText}
              spans={primarySpans}
              onComplete={() => setIsTyping(false)}
              topHymnClauseIds={topHymnClauseIds}
            />
          ) : (
            <Typography
              variant="body1"
              sx={{
                opacity: 1,
                color: "#e0e0e0",
                position: "relative",
                textAlign: "center",
                maxWidth: "560px",
                mx: "auto",
                // mb: 2 // Margin now on the wrapper Box
              }}
              component="div"
            >
              <HighlightedText
                text={fixedPrimaryText}
                spans={primarySpans}
                topHymnClauseIds={topHymnClauseIds}
              />
            </Typography>
          )}
        </Box>
      )}

      {/* --- Expand Button & Secondary Lines --- */}
      {allSentencesForHymn && allSentencesForHymn.length > 1 && (
        <>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Button
              onClick={handleExpandToggle}
              aria-expanded={expanded}
              aria-controls="context-lines"
              variant="text"
              size="small"
              sx={{
                color: "rgba(224, 224, 224, 0.7)",
                fontSize: "0.8rem",
                textTransform: "lowercase",
              }}
            >
              {expanded ? "Hide Full Text" : "Show Full Text"}
              {/* <ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} /> // Temporarily commented out */}
            </Button>
          </Box>
          <Collapse
            in={expanded}
            timeout="auto"
            unmountOnExit
            id="context-lines"
          >
            <Box
              sx={{
                mt: 2,
                pl: 2,
                borderLeft: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              {secondaryLines}
            </Box>
          </Collapse>
        </>
      )}
    </Box>
  );
});
