import React from "react";
import { Box } from "@mui/material";

export const AnimatedEllipsis: React.FC = () => {
  const dotStyle = {
    animation: "ellipsis-fade 1.4s infinite",
    display: "inline-block",
    margin: "0 1px", // Adjust spacing between dots
  };

  return (
    <Box component="span" aria-label="Loading quote">
      <Box component="span" sx={{ ...dotStyle, animationDelay: "0s" }}>
        .
      </Box>
      <Box component="span" sx={{ ...dotStyle, animationDelay: "0.2s" }}>
        .
      </Box>
      <Box component="span" sx={{ ...dotStyle, animationDelay: "0.4s" }}>
        .
      </Box>
    </Box>
  );
};
