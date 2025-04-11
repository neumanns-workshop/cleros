import React, { useState, useCallback, useMemo } from "react";
import {
  TextField,
  Box,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { useOracleContext } from "../../context/OracleContext";

// Simple Arrow Icon SVG
const SubmitIcon = () => (
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
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

export const OracleQueryForm: React.FC = React.memo(() => {
  const [query, setQuery] = useState("");
  const { performDivination, isLoading, modelLoading, isContextDataLoading } =
    useOracleContext();

  const isInitializing = modelLoading || isContextDataLoading;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim() || isLoading || isInitializing) return;
      console.log("[OracleQueryForm] Submitting query:", query);
      await performDivination(query);
      console.log("[OracleQueryForm] Divination process triggered.");
    },
    [performDivination, query, isLoading, isInitializing],
  );

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    [],
  );

  const isSubmitDisabled = useMemo(
    () => isLoading || !query.trim() || isInitializing,
    [isLoading, query, isInitializing],
  );

  return (
    <form onSubmit={handleSubmit} aria-label="Oracle consultation form">
      <TextField
        fullWidth
        variant="outlined"
        placeholder="What's on your mind?"
        id="oracle-question"
        aria-label="Enter your question for the oracle"
        value={query}
        onChange={handleQueryChange}
        disabled={isLoading}
        InputProps={{
          sx: {
            pr: "8px",
            fontSize: "1rem",
          },
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                type="submit"
                aria-label="Cast Lot"
                disabled={isSubmitDisabled}
                sx={{
                  color: isSubmitDisabled
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(255, 255, 255, 0.7)",
                  "&:hover": {
                    backgroundColor: isSubmitDisabled
                      ? "transparent"
                      : "rgba(255, 255, 255, 0.08)",
                    color: isSubmitDisabled
                      ? "rgba(255, 255, 255, 0.3)"
                      : "rgba(255, 255, 255, 0.9)",
                  },
                }}
              >
                {isLoading || isInitializing ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SubmitIcon />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 3,
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "rgba(255, 255, 255, 0.2)",
            },
            "&:hover fieldset": {
              borderColor: "rgba(255, 255, 255, 0.4)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "rgba(255, 255, 255, 0.6)",
            },
          },
          "& input::placeholder": {
            color: "rgba(255, 255, 255, 0.4)",
            letterSpacing: "0.05em",
            fontStyle: "italic",
          },
          "& .MuiInputBase-input": {
            background: "transparent !important",
            backgroundColor: "transparent !important",
          },
          "&:-webkit-autofill, &:autofill": {
            WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
            WebkitTextFillColor: "#ffffff !important",
            caretColor: "#ffffff !important",
            transition: "background-color 5000s ease-in-out 0s",
          },
          "&:autofill": {
            boxShadow: "0 0 0 1000px transparent inset !important",
            backgroundColor: "transparent !important",
          },
        }}
      />
    </form>
  );
});
