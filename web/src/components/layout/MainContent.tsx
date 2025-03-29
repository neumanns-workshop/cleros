import React from 'react';
import { Box } from '@mui/material';
import { OracleResponse } from '../results/OracleResponse';
import { DRAWER_WIDTH } from '../../utils/constants';

export const MainContent: React.FC = React.memo(() => {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        background: '#141414 !important',
        backgroundColor: '#141414 !important',
        p: 3,
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        marginLeft: 0,
      }}
    >
      <OracleResponse />
    </Box>
  );
}); 