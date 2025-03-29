import React, { useState } from 'react';
import { Box, Typography, Drawer, Tooltip, IconButton, Collapse, Link } from '@mui/material';
import { useOracleContext } from '../../context/OracleContext';
import { OracleQueryForm } from '../forms/OracleQueryForm';
import { DRAWER_WIDTH } from '../../utils/constants';
import DonateButton from './DonateButton';

// SVG icons as React components
const InfoIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="18" 
    height="18" 
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

export const Sidebar: React.FC = () => {
  const { setInfoOpen } = useOracleContext();
  const [examplesExpanded, setExamplesExpanded] = useState(false);

  // Example prompts for different use cases
  const examplePrompts = [
    "What path should I take in my career?",
    "Guidance for my creative project.",
    "I'm feeling lost right now.",
    "Show me what I need to see today.",
    "My relationship with time.",
    "The meaning behind my recent dream."
  ];

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          background: 'linear-gradient(135deg, #0f0f0f 0%, #181818 100%)',
          borderRight: '1px solid rgba(224, 224, 224, 0.1)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ letterSpacing: '0.12em' }}>sortes</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Show examples">
              <IconButton 
                onClick={() => setExamplesExpanded(!examplesExpanded)}
                size="small"
                aria-label="Show example prompts"
                aria-expanded={examplesExpanded}
                aria-controls="example-prompts-list"
                sx={{ 
                  color: examplesExpanded ? 'rgba(224, 224, 224, 0.9)' : 'rgba(224, 224, 224, 0.6)',
                  borderRadius: '4px',
                  backgroundColor: examplesExpanded ? 'rgba(224, 224, 224, 0.08)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(224, 224, 224, 0.08)',
                    color: 'rgba(224, 224, 224, 0.9)',
                  },
                }}
              >
                <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>Ex.</Typography>
              </IconButton>
            </Tooltip>
            <Tooltip title="About sortes">
              <IconButton 
                onClick={() => setInfoOpen(true)}
                size="small"
                aria-label="Open information dialog about sortes"
                sx={{ 
                  color: 'rgba(224, 224, 224, 0.6)',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: 'rgba(224, 224, 224, 0.08)',
                    color: 'rgba(224, 224, 224, 0.9)',
                  },
                }}
              >
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Collapse in={examplesExpanded} timeout="auto">
          <Box 
            id="example-prompts-list"
            component="ul" 
            sx={{ 
              listStyleType: 'none', 
              pl: 0,
              pt: 0,
              pb: 2,
              mt: 0,
              mb: 0,
              fontSize: '0.85rem',
              color: 'rgba(224, 224, 224, 0.6)',
              borderBottom: '1px solid rgba(224, 224, 224, 0.1)',
            }}
            aria-label="List of example prompts for the oracle"
          >
            {examplePrompts.map((prompt, index) => (
              <Box 
                component="li" 
                key={index} 
                sx={{ 
                  py: 0.5, 
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'rgba(224, 224, 224, 0.9)',
                  }
                }}
                onClick={() => {
                  // Find the input element and set its value
                  const input = document.getElementById('oracle-question') as HTMLInputElement;
                  if (input) {
                    // Create and dispatch events to simulate typing
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                      window.HTMLInputElement.prototype, 'value'
                    )?.set;
                    nativeInputValueSetter?.call(input, prompt);
                    
                    const ev = new Event('input', { bubbles: true });
                    input.dispatchEvent(ev);
                    
                    // Focus the input
                    input.focus();
                  }
                }}
              >
                {prompt}
              </Box>
            ))}
          </Box>
        </Collapse>

        <OracleQueryForm />
        
        {/* Spacer to push donation button to bottom */}
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Version tag */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 2
        }}>
          <Link 
            href="https://github.com/neumanns-workshop/sortes/blob/main/CHANGELOG.md" 
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              color: 'rgba(224, 224, 224, 0.4)', 
              fontSize: '0.7rem', 
              textDecoration: 'none',
              padding: '2px 8px',
              border: '1px solid rgba(224, 224, 224, 0.2)',
              borderRadius: '12px',
              '&:hover': {
                color: 'rgba(224, 224, 224, 0.8)',
                borderColor: 'rgba(224, 224, 224, 0.4)',
                backgroundColor: 'rgba(224, 224, 224, 0.05)'
              }
            }}
          >
            v1.0.0-beta
          </Link>
        </Box>
        
        {/* Donation button */}
        <Box 
          sx={{ 
            mt: 2, 
            pt: 2, 
            borderTop: '1px solid rgba(224, 224, 224, 0.1)',
            position: 'relative',
            minHeight: '60px'
          }}
        >
          <DonateButton />
        </Box>
      </Box>
    </Drawer>
  );
}; 