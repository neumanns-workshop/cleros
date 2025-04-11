import React from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { useOracleContext } from "../../context/OracleContext";

// Close icon
const CloseIcon = () => (
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
    aria-hidden="true"
    role="img"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export const InfoDialog: React.FC = () => {
  const { infoOpen, setInfoOpen } = useOracleContext();

  // Monochromatic theme colors
  const theme = {
    background: "#141414", // Darker background
    paper: "#1c1c1c", // Darker paper background
    text: "#e0e0e0", // Slightly muted text
    accent: "#a0a0a0", // Light gray accent for subtlety
  };

  return (
    <Dialog
      open={infoOpen}
      onClose={() => setInfoOpen(false)}
      maxWidth="md"
      aria-labelledby="cleros-info-dialog-title"
      PaperProps={{
        sx: {
          background: `linear-gradient(135deg, ${theme.paper} 0%, ${theme.background} 100%)`,
          border: `1px solid rgba(224, 224, 224, 0.1)`,
          color: theme.text,
          minWidth: "400px",
          maxWidth: "650px",
          borderRadius: 1,
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderBottom: `1px solid rgba(224, 224, 224, 0.1)`,
        }}
      >
        <Typography
          variant="h6"
          id="cleros-info-dialog-title"
          sx={{
            fontSize: "1.1rem",
            letterSpacing: "0.05em",
          }}
        >
          cleros system information
        </Typography>
        <IconButton
          onClick={() => setInfoOpen(false)}
          size="small"
          aria-label="Close information dialog"
          sx={{
            color: theme.text,
            "&:hover": { color: "rgba(224, 224, 224, 0.8)" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontSize: "0.95rem", fontWeight: 500 }}
        >
          What is cleros?
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          cleros (Greek for "lots") is a contemporary approach to bibliomantic
          divination—the ancient practice of seeking guidance through texts.
          This system uses modern language AI to bring new depth to a
          traditional practice.
        </Typography>

        <Typography
          variant="h6"
          sx={{ mb: 2, fontSize: "0.95rem", fontWeight: 500 }}
        >
          How it Works
        </Typography>
        <Typography sx={{ mb: 1, fontSize: "0.9rem", lineHeight: 1.6 }}>
          When you pose a question to cleros, two things happen:
        </Typography>
        <Box
          sx={{
            mb: 1,
            pl: 2,
            borderLeft: `2px solid rgba(224, 224, 224, 0.15)`,
          }}
        >
          <Typography sx={{ mb: 1, fontSize: "0.9rem", fontWeight: "bold" }}>
            Hymn Selection:
          </Typography>
          <Typography
            sx={{ mb: 2, fontSize: "0.9rem", opacity: 0.9, lineHeight: 1.6 }}
          >
            The precise, irreproducible context in which you cast your lot
            determines which hymn is selected.
          </Typography>
          <Typography sx={{ mb: 1, fontSize: "0.9rem", fontWeight: "bold" }}>
            Meaning Analysis:
          </Typography>
          <Typography
            sx={{ mb: 2, fontSize: "0.9rem", opacity: 0.9, lineHeight: 1.6 }}
          >
            The meaning of your concern is captured by an AI language model,
            which is used to reveal the most relevant sentences or passages, as
            well as the most relevant symbols or clauses within the hymn as a
            whole.
          </Typography>
        </Box>

        <Typography
          variant="h6"
          sx={{ mb: 2, mt: 3, fontSize: "0.95rem", fontWeight: 500 }}
        >
          Available Sources
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            mb: 3,
            pl: 2,
            borderLeft: `2px solid rgba(224, 224, 224, 0.15)`,
          }}
        >
          <Typography sx={{ fontSize: "0.9rem", fontWeight: "bold" }}>
            Homeric Hymns
          </Typography>
          <Typography
            sx={{ fontSize: "0.9rem", opacity: 0.9, lineHeight: 1.6 }}
          >
            The Homeric Hymns are a collection of 33 ancient Greek poems that
            honor various gods and goddesses, stylistically similar to Homer's
            epics but shorter in length and attributed to him although likely
            composed by multiple poets over several centuries.
          </Typography>
          <Typography
            sx={{
              fontSize: "0.8rem",
              opacity: 0.7,
              mt: 1,
              fontStyle: "italic",
            }}
          >
            Source: <em>Hesiod, the Homeric Hymns, and Homerica</em>. Trans.
            Hugh G. Evelyn-White. London: William Heinemann, 1914.
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            mb: 3,
            pl: 2,
            borderLeft: `2px solid rgba(224, 224, 224, 0.15)`,
          }}
        >
          <Typography sx={{ fontSize: "0.9rem", fontWeight: "bold" }}>
            Orphic Hymns
          </Typography>
          <Typography
            sx={{ fontSize: "0.9rem", opacity: 0.9, lineHeight: 1.6 }}
          >
            The Orphic Hymns are a collection of 87 short religious poems
            composed in ancient Greece, attributed to the legendary musician
            Orpheus and used in mystery cult rituals to invoke and praise
            various deities.
          </Typography>
          <Typography
            sx={{
              fontSize: "0.8rem",
              opacity: 0.7,
              mt: 1,
              fontStyle: "italic",
            }}
          >
            Source: <em>The Orphic Hymns</em>. Trans. Apostolos N. Athanassakis
            and Benjamin M. Wolkow. Baltimore: Johns Hopkins University Press,
            2013.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
