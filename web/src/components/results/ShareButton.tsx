import React, { useState, useCallback } from "react";
import {
  Tooltip,
  IconButton,
  Box,
  Button,
  Snackbar,
  Alert,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
} from "@mui/material";
import html2canvas from "html2canvas";
import { useOracleContext } from "../../context/OracleContext";
import { ShareCard } from "./ShareCard";

// Share Icon SVG
const ShareIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
    <polyline points="16 6 12 2 8 6"></polyline>
    <line x1="12" y1="2" x2="12" y2="15"></line>
  </svg>
);

export const ShareButton: React.FC = React.memo(() => {
  const {
    selectedHymnNumber,
    selectedHymnTitle,
    selectedHymnOrigin,
    divinationTimestamp,
    primarySentence,
    topHymnClausesMap,
    topHymnClauseIds,
    userQuery,
  } = useOracleContext();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [embedCode, setEmbedCode] = useState<string>("");

  const theme = useTheme();

  const showToast = useCallback(
    (
      message: string,
      severity: "success" | "error" = "success",
    ) => {
      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setSnackbarOpen(true);
    },
    [],
  );

  const handleCloseSnackbar = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  // --- Download ---
  const handleDownload = useCallback(() => {
    if (!imageDataUrl) {
      showToast("No image available to download.", "error");
      return;
    }

    try {
      const link = document.createElement("a");
      const fileName = `cleros-reading-${selectedHymnOrigin || "hymn"}-${selectedHymnNumber || "unknown"}.png`;
      link.download = fileName;
      link.href = imageDataUrl;
      link.click();
      showToast("Image download started.");
    } catch (err) {
      console.error("Error downloading image:", err);
      showToast("Failed to start download.", "error");
    }
  }, [imageDataUrl, selectedHymnOrigin, selectedHymnNumber, showToast]);

  // --- Copy image to clipboard ---
  const copyImageToClipboard = useCallback(async () => {
    if (!imageDataUrl) {
      showToast("No image available to copy.", "error");
      return;
    }

    try {
      // Convert data URL to blob
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();

      // Use Clipboard API
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);

      showToast("Image copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy image:", err);
      showToast("Failed to copy image to clipboard.", "error");
    }
  }, [imageDataUrl, showToast]);

  // Copy text content to clipboard
  const copyTextContent = useCallback(async () => {
    if (!primarySentence) {
      showToast("No text available to copy.", "error");
      return;
    }

    try {
      // Format all the elements that appear in the image
      const title = selectedHymnTitle || "Untitled Hymn";
      const origin = selectedHymnOrigin
        ? `${selectedHymnOrigin.toUpperCase()} `
        : "";
      const hymnNumber = selectedHymnNumber || "";
      const hymnInfo = `${origin}${title}${hymnNumber ? ` ${hymnNumber}` : ""}`;

      // Format the timestamp if available
      const timestamp = divinationTimestamp
        ? new Date(divinationTimestamp).toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })
        : "";

      // Build the complete text with formatting
      let textToCopy = "CLEROS | DIGITAL BIBLIOMANCY\n\n";
      textToCopy += `${hymnInfo}\n`;
      if (timestamp) textToCopy += `${timestamp}\n\n`;
      if (userQuery) textToCopy += `${userQuery}\n\n`;
      textToCopy += primarySentence.text;
      textToCopy += "\n\nneumannsworkshop.com/cleros";

      await navigator.clipboard.writeText(textToCopy);
      showToast("Text copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy text:", err);
      showToast("Failed to copy text to clipboard.", "error");
    }
  }, [
    primarySentence,
    selectedHymnTitle,
    selectedHymnOrigin,
    selectedHymnNumber,
    divinationTimestamp,
    userQuery,
    showToast,
  ]);

  // Copy embed code to clipboard
  const copyEmbedCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      showToast("Embed code copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy embed code:", err);
      showToast("Failed to copy embed code.", "error");
    }
  }, [embedCode, showToast]);

  // Copy link to clipboard
  const copyLink = useCallback(async () => {
    try {
      const shareableUrl = window.location.href;
      await navigator.clipboard.writeText(shareableUrl);
      showToast("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy link:", err);
      showToast("Failed to copy link.", "error");
    }
  }, [showToast]);

  // Generate embed code using the data URL directly
  const generateEmbedCode = useCallback(() => {
    if (!imageDataUrl) {
      showToast("No image available for embedding.", "error");
      return;
    }

    // Create an embed code that uses the data URL
    // Warning: This can be very large for complex images
    const embedCodeText = `<div style="max-width:500px;margin:0 auto;">
  <a href="${window.location.href}" target="_blank">
    <img src="${imageDataUrl}" alt="Cleros Reading" style="width:100%;border:0;display:block;" />
    <div style="text-align:center;padding:4px;font-size:12px;font-family:sans-serif;color:#888;">
      Visit Cleros
    </div>
  </a>
</div>`;

    setEmbedCode(embedCodeText);
    showToast("Embed code generated!");
  }, [imageDataUrl, showToast]);

  // --- Generate Image and Open Share Dialog ---
  const handleShowShareOptions = useCallback(async () => {
    const element = document.getElementById("share-card-render-target");
    if (!element) {
      showToast("Share card element not found.", "error");
      return;
    }

    try {
      const backgroundColor = theme.palette.background.paper;
      const textColor = theme.palette.text.primary;

      const canvas = await html2canvas(element, {
        backgroundColor: backgroundColor,
        scale: 2,
        logging: false,
        useCORS: true,
        onclone: (clonedDoc, clonedElement) => {
          clonedElement.style.backgroundColor = backgroundColor;
          clonedElement.style.color = textColor;
        },
      });

      // Store image data URL for sharing dialog
      const dataUrl = canvas.toDataURL("image/png");
      setImageDataUrl(dataUrl);

      // Reset embed code
      setEmbedCode("");

      // Open share dialog
      setShareDialogOpen(true);
    } catch (err) {
      console.error("Error generating image:", err);
      showToast("Failed to generate image for sharing.", "error");
    }
  }, [theme, showToast]);

  const closeShareDialog = useCallback(() => {
    setShareDialogOpen(false);
  }, []);

  // Disable button if there's no data
  const isDisabled =
    !primarySentence || Object.keys(topHymnClausesMap || {}).length === 0;

  return (
    <>
      {/* Only render ShareCard if the necessary data is present */}
      {primarySentence && topHymnClausesMap && (
        <ShareCard
          hymnTitle={selectedHymnTitle}
          hymnOrigin={selectedHymnOrigin}
          hymnNumber={selectedHymnNumber}
          timestamp={divinationTimestamp}
          primarySentence={primarySentence}
          topHymnClausesMap={topHymnClausesMap}
          topHymnClauseIds={topHymnClauseIds}
          userQuery={userQuery}
        />
      )}

      {/* The button that triggers the share dialog */}
      <Tooltip title="Share Result">
        {/* Wrap IconButton in a span to allow Tooltip when disabled */}
        <span>
          <IconButton
            onClick={handleShowShareOptions}
            size="small"
            disabled={isDisabled}
            aria-label="Share this result"
            sx={{
              color: isDisabled
                ? theme.palette.text.disabled
                : theme.palette.text.secondary,
              borderRadius: "4px",
              backgroundColor: "transparent",
              "&:hover": {
                backgroundColor: isDisabled
                  ? "transparent"
                  : `rgba(255, 255, 255, 0.08)`,
                color: isDisabled
                  ? theme.palette.text.disabled
                  : theme.palette.text.primary,
              },
            }}
          >
            <ShareIcon />
          </IconButton>
        </span>
      </Tooltip>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={closeShareDialog} maxWidth="md">
        <DialogTitle sx={{ textAlign: "center" }}>
          Share Your Cleros Reading
        </DialogTitle>
        <DialogContent>
          {imageDataUrl && (
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <img
                src={imageDataUrl}
                alt="Cleros Reading"
                style={{
                  maxWidth: "100%",
                  maxHeight: "300px",
                  border: "1px solid #ddd",
                }}
              />
            </Box>
          )}

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="subtitle1" gutterBottom>
              Share Options
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Button size="small" variant="outlined" onClick={handleDownload}>
                Download
              </Button>

              <Button
                size="small"
                variant="outlined"
                onClick={copyImageToClipboard}
              >
                Copy Image
              </Button>

              <Button size="small" variant="outlined" onClick={copyTextContent}>
                Copy Text
              </Button>

              {!embedCode ? (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={generateEmbedCode}
                >
                  Embed
                </Button>
              ) : (
                <Button size="small" variant="outlined" onClick={copyEmbedCode}>
                  Embed
                </Button>
              )}
            </Box>

            {embedCode && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={embedCode}
                  multiline
                  rows={4}
                  size="small"
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ display: "block", mt: 1, color: "text.secondary" }}
                >
                  Note: This embed code contains the entire image data and may
                  be large.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeShareDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
});
