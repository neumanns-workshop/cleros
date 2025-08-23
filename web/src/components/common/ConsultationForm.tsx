import React from 'react';

interface ConsultationFormProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ConsultationForm = ({ searchQuery, setSearchQuery, onSubmit }: ConsultationFormProps) => (
  <form className="consultation-form" onSubmit={onSubmit}>
    <input 
      type="text" 
      placeholder="What's on your mind?"
      className="query-input"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
    <button type="submit" className="submit-button">→</button>
  </form>
);