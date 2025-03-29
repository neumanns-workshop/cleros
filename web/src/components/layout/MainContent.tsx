import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { OracleResponse } from '../results/OracleResponse';
import { DRAWER_WIDTH } from '../../utils/constants';
import { useSidebar } from '../../context/SidebarContext';

export const MainContent: React.FC = React.memo(() => {
  const { isOpen, setIsOpen } = useSidebar();

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar with Cmd/Ctrl + \
      if (e.key === '\\' && (e.metaKey || e.ctrlKey)) {
        setIsOpen(!isOpen);
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  return (
    <Box
      component="main"
      onClick={() => {
        if (isOpen) {
          setIsOpen(false);
        }
      }}
      sx={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: isOpen ? DRAWER_WIDTH : 0,
        background: '#141414',
        transition: theme => theme.transitions.create('left', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '650px',
        }}
      >
        <OracleResponse />
      </Box>
    </Box>
  );
}); 