import React from 'react';
import { FormGroup, FormControlLabel, Checkbox, Divider, Box } from '@mui/material';
import { useOracleContext } from '../../context/OracleContext';

export const SourceSelection: React.FC = () => {
  const { selectedSources, setSelectedSources } = useOracleContext();

  return (
    <Box role="region" aria-label="Source selection">
      <FormGroup sx={{ mb: 3 }} aria-labelledby="source-selection-label">
        {/* Available Sources */}
        <FormControlLabel
          control={
            <Checkbox 
              checked={selectedSources.orphic}
              onChange={(e) => setSelectedSources(prev => ({ ...prev, orphic: e.target.checked }))}
              id="source-orphic"
              inputProps={{ 'aria-label': 'Select Orphic Hymns source' }}
            />
          }
          label="Orphic Hymns"
        />
        
        <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        
        {/* Disabled Options */}
        <FormControlLabel
          control={
            <Checkbox 
              checked={selectedSources.homeric}
              onChange={(e) => setSelectedSources(prev => ({ ...prev, homeric: e.target.checked }))}
              disabled
              id="source-homeric"
              inputProps={{ 'aria-label': 'Select Homer source (coming soon)' }}
            />
          }
          label="Homer"
        />
        <FormControlLabel
          control={
            <Checkbox 
              checked={selectedSources.virgilian}
              onChange={(e) => setSelectedSources(prev => ({ ...prev, virgilian: e.target.checked }))}
              disabled
              id="source-virgilian"
              inputProps={{ 'aria-label': 'Select Virgil source (coming soon)' }}
            />
          }
          label="Virgil"
        />
        <FormControlLabel
          control={
            <Checkbox 
              checked={selectedSources.gnostic}
              onChange={(e) => setSelectedSources(prev => ({ ...prev, gnostic: e.target.checked }))}
              disabled
              id="source-gnostic"
              inputProps={{ 'aria-label': 'Select Gnostic texts source (coming soon)' }}
            />
          }
          label="Gnostics"
        />
      </FormGroup>
    </Box>
  );
}; 