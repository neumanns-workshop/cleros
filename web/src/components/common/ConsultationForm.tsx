import React from 'react';
import { SearchMode } from '../../types/app';

interface ConsultationFormProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  searchMode: SearchMode;
}

export const ConsultationForm = ({ searchQuery, setSearchQuery, onSubmit, searchMode }: ConsultationFormProps) => (
  <form className="consultation-form" onSubmit={onSubmit}>
    <input 
      type="text" 
      placeholder={searchMode === 'oracle' ? 'Ask for divine guidance (random)' : 'Seek rational advice (semantic)'}
      className="query-input"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
    <button type="submit" className="submit-button">→</button>
  </form>
);