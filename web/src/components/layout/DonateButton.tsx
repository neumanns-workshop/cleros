import React from 'react';
import { 
  Button,
  Tooltip
} from '@mui/material';

// SVG icons as React components
const HeartIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ marginRight: '4px' }}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const KOFI_USERNAME = 'neumannsworkshop'; // Your Ko-fi username

const DonateButton: React.FC = () => {
  // Open Ko-fi in a popup window
  const openKofiWidget = () => {
    // Open Ko-fi widget in a popup window
    const width = 500;
    const height = 650;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    window.open(
      `https://ko-fi.com/${KOFI_USERNAME}/?hidefeed=true&widget=true&embed=true&preview=true`,
      'ko-fi-widget',
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,location=no,status=no`
    );
  };
  
  return (
    <Tooltip title="Support this project" placement="top">
      <Button
        variant="outlined"
        size="small"
        startIcon={<HeartIcon />}
        onClick={openKofiWidget}
        sx={{
          borderColor: 'rgba(255, 255, 255, 0.3)',
          color: 'rgba(255, 255, 255, 0.7)',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)'
          },
          height: '36px',
          fontSize: '0.85rem',
          fontWeight: 400,
          padding: '0 12px',
          borderRadius: '4px',
          textTransform: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '180px'
        }}
      >
        Donate
      </Button>
    </Tooltip>
  );
};

export default DonateButton; 