import React, { useEffect, useState } from 'react';
import { 
    Box, 
    useTheme, 
    Typography,
    IconButton,
    Collapse,
    Tooltip,
    Link,
} from '@mui/material';
import { OracleResponse } from '../results/OracleResponse';
import { useOracleContext } from '../../context/OracleContext';
import { OracleQueryForm } from '../forms/OracleQueryForm';
import DonateButton from './DonateButton';
import { ShareButton } from '../results/ShareButton';

// Icons (copied from previous version/Sidebar.tsx)
const InfoIcon = () => (
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
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const ExamplesIcon = () => (
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
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

export const MainContent: React.FC = React.memo(() => {
  const { primarySentence, setInfoOpen } = useOracleContext();
  const theme = useTheme();
  const [examplesExpanded, setExamplesExpanded] = useState(false);

  // Example prompts
  const examplePrompts = [
    "What should I do today?",
    "What will the outcome be?",
    "Should I take this job?",
    "My relationship is in trouble. What should I do?",
  ];

  // Determine if we should center the content (only center when there is no primary sentence)
  const shouldCenterContent = !primarySentence;

  return (
    <Box
      component="main"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        minHeight: "100vh",
        background: theme.palette.background.default,
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 4 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "700px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          flexGrow: 1,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Typography variant="h6" sx={{ letterSpacing: "0.12em" }}>
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
            >
              | digital bibliomancy
            </Box>
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <ShareButton />

            <Box sx={{ position: "relative" }}>
              <Tooltip title="Show examples">
                <IconButton
                  onClick={() => setExamplesExpanded(!examplesExpanded)}
                  size="small"
                  aria-label="Show example prompts"
                  aria-expanded={examplesExpanded}
                  aria-controls="example-prompts-list"
                  sx={{
                    color: examplesExpanded
                      ? theme.palette.text.primary
                      : theme.palette.text.secondary,
                    borderRadius: "4px",
                    backgroundColor: examplesExpanded
                      ? `rgba(255, 255, 255, 0.08)`
                      : "transparent",
                    "&:hover": {
                      backgroundColor: `rgba(255, 255, 255, 0.08)`,
                      color: theme.palette.text.primary,
                    },
                  }}
                >
                  <ExamplesIcon />
                </IconButton>
              </Tooltip>
              <Collapse
                in={examplesExpanded}
                timeout={250}
                sx={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  right: 0,
                  zIndex: theme.zIndex.tooltip + 1,
                  minWidth: "250px",
                }}
              >
                <Box
                  id="example-prompts-list"
                  component="ul"
                  sx={{
                    listStyleType: "none",
                    p: 0,
                    m: 0,
                    borderRadius: "4px",
                    backgroundColor: "#1e1e1e",
                    boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.4)",
                    border: `1px solid ${theme.palette.divider}`,
                    overflow: "hidden",
                    fontSize: "0.85rem",
                    color: theme.palette.text.secondary,
                  }}
                  aria-label="List of example prompts for the oracle"
                >
                  {examplePrompts.map((prompt, index) => (
                    <Box
                      component="li"
                      key={index}
                      sx={{
                        py: 1,
                        px: 2,
                        cursor: "pointer",
                        transition: "background-color 0.2s ease",
                        "&:hover": {
                          color: theme.palette.text.primary,
                          backgroundColor: `rgba(255, 255, 255, 0.05)`,
                        },
                      }}
                      onClick={() => {
                        const input = document.getElementById(
                          "oracle-question",
                        ) as HTMLInputElement;
                        if (input) {
                          const nativeInputValueSetter =
                            Object.getOwnPropertyDescriptor(
                              window.HTMLInputElement.prototype,
                              "value",
                            )?.set;
                          nativeInputValueSetter?.call(input, prompt);
                          const ev = new Event("input", { bubbles: true });
                          input.dispatchEvent(ev);
                          input.focus();
                          setExamplesExpanded(false);
                        }
                      }}
                    >
                      {prompt}
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Box>

            <Tooltip title="About cleros">
              <IconButton
                onClick={() => setInfoOpen(true)}
                size="small"
                aria-label="Open information dialog about cleros"
                sx={{
                  color: "rgba(224, 224, 224, 0.6)",
                  borderRadius: "4px",
                  "&:hover": {
                    backgroundColor: "rgba(224, 224, 224, 0.08)",
                    color: "rgba(224, 224, 224, 0.9)",
                  },
                }}
              >
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <OracleQueryForm />

        <OracleResponse />
      </Box>

      <Box
        component="footer"
        sx={{
          width: "100%",
          maxWidth: "700px",
          mt: 'auto',
          pt: 4,
          pb: 2,
          textAlign: 'center',
        }}
      >
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
          © {new Date().getFullYear()} Jared Neumann Consulting, LLC
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}>
          <Link 
            href="https://github.com/neumanns-workshop/cleros/blob/main/CHANGELOG.md"
            target="_blank" 
            rel="noopener noreferrer" 
            color="inherit" 
            underline="hover"
          >
            Version 2.0.0
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}); 