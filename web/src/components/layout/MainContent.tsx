import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { OracleResponse } from '../results/OracleResponse';
import { DRAWER_WIDTH } from '../../utils/constants';
import { useSidebar } from '../../context/SidebarContext';
import { useOracleContext } from '../../context/OracleContext';

export const MainContent: React.FC = React.memo(() => {
  const { isOpen, setIsOpen } = useSidebar();
  const { results } = useOracleContext();

  // Determine if we should center the content (only center when there are no results)
  const shouldCenterContent = results.length === 0;

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
        alignItems: shouldCenterContent ? 'center' : 'flex-start',
        justifyContent: 'center',
        p: 3,
        pt: shouldCenterContent ? 3 : 4,
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