import React from 'react';
import { Dialog, DialogContent, Typography, Box, IconButton } from '@mui/material';
import { useOracleContext } from '../../context/OracleContext';

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
    background: '#141414',        // Darker background
    paper: '#1c1c1c',             // Darker paper background
    text: '#e0e0e0',              // Slightly muted text
    accent: '#a0a0a0'             // Light gray accent for subtlety
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
          minWidth: '400px',
          maxWidth: '650px',
          borderRadius: 1,
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        p: 2,
        borderBottom: `1px solid rgba(224, 224, 224, 0.1)`
      }}>
        <Typography 
          variant="h6" 
          id="cleros-info-dialog-title"
          sx={{ 
            fontSize: '1.1rem',
            letterSpacing: '0.05em'
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
            '&:hover': { color: 'rgba(224, 224, 224, 0.8)' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontSize: '0.95rem', fontWeight: 500 }}>What is cleros?</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          cleros (Greek for "lots") is a contemporary approach to bibliomantic divination—the ancient practice of seeking guidance through texts. This system uses modern language AI to bring new depth to this traditional practice.
        </Typography>

        <Typography variant="h6" sx={{ mb: 2, fontSize: '0.95rem', fontWeight: 500 }}>How it Works</Typography>
        <Typography sx={{ mb: 1, fontSize: '0.9rem', lineHeight: 1.6 }}>
          When you pose a question to cleros, two simultaneous processes occur:
        </Typography>
        <Box sx={{ mb: 1, pl: 2, borderLeft: `2px solid rgba(224, 224, 224, 0.15)` }}>
          <Typography sx={{ mb: 1, fontSize: '0.9rem', fontWeight: 'bold' }}>Text Selection:</Typography>
          <Typography sx={{ mb: 2, fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.6 }}>
            Your question's embedding (its representation in semantic space) is analyzed mathematically, combined with the current moment in time, to determine which text is selected. This creates an unrepeatable connection between your specific question and the selected passage.
          </Typography>
          <Typography sx={{ mb: 1, fontSize: '0.9rem', fontWeight: 'bold' }}>Meaning Analysis:</Typography>
          <Typography sx={{ mb: 2, fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.6 }}>
            The same embedding identifies which portions of the selected text most closely relate to your question's meaning.
          </Typography>
        </Box>

        <Typography variant="h6" sx={{ mb: 2, mt: 3, fontSize: '0.95rem', fontWeight: 500 }}>The Philosophical Approach</Typography>
        <Typography sx={{ mb: 1, fontSize: '0.9rem', lineHeight: 1.6 }}>
          cleros draws from gnostic traditions, where meaning emerges from within rather than from external forces:
        </Typography>
        <Box sx={{ mb: 1, pl: 2, borderLeft: `2px solid rgba(224, 224, 224, 0.15)` }}>
          <Typography sx={{ mb: 1, fontSize: '0.9rem', fontWeight: 'bold' }}>Inner Complexity:</Typography>
          <Typography sx={{ mb: 2, fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.6 }}>
            The apparent randomness in divination comes not from external chance, but from the intricate complexity of your own question as it interacts with collective human understanding encoded in the language model.
          </Typography>
          <Typography sx={{ mb: 1, fontSize: '0.9rem', fontWeight: 'bold' }}>Agency and Discovery:</Typography>
          <Typography sx={{ mb: 2, fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.6 }}>
            Your intentional framing of the question (Will) interacts with the unexpected connections revealed through analysis (Fate), creating a space where both purposeful inquiry and surprising insight can coexist.
          </Typography>
        </Box>
        
        <Typography variant="h6" sx={{ mb: 2, mt: 3, fontSize: '0.95rem', fontWeight: 500 }}>Available Sources</Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 1,
          mb: 3,
          pl: 2, 
          borderLeft: `2px solid rgba(224, 224, 224, 0.15)` 
        }}>
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
            cleros orphicae
          </Typography>
          <Typography sx={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.6 }}>
            A collection of 87 poems from Greco-Roman antiquity attributed to Orpheus, historically used in mystery cult rituals for invoking deities.
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', opacity: 0.7, mt: 1, fontStyle: 'italic' }}>
            Source: Athanassakis, A. N., & Wolkow, B. M. (2013). <em>The Orphic Hymns</em>. The Johns Hopkins University Press.
          </Typography>
        </Box>

        <Typography variant="h6" sx={{ mb: 2, fontSize: '0.95rem', fontWeight: 500 }}>Coming Soon</Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 1,
          pl: 2, 
          borderLeft: `2px solid rgba(224, 224, 224, 0.15)` 
        }}>
          <Typography sx={{ fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 'bold' }}>cleros homericae</span> - The Iliad and Odyssey, foundational works of Western literature
          </Typography>
          <Typography sx={{ fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 'bold' }}>cleros vergilianae</span> - The Aeneid, Rome's national epic
          </Typography>
          <Typography sx={{ fontSize: '0.9rem' }}>
            <span style={{ fontWeight: 'bold' }}>cleros gnosticae</span> - Texts from the Nag Hammadi library and other gnostic sources
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}; 