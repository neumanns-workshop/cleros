import React from 'react';
import { ViewType } from '../../types/app';

interface FooterProps {
  currentView?: ViewType;
  setCurrentView?: (view: ViewType) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView }) => (
  <footer className="app-footer">
    <p style={{ margin: '0 0 0.5rem 0', color: '#f5f4f0' }}>© 2026 Galaxy Brain Entertainment</p>
    {setCurrentView && (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.9rem' }}>
        <a 
          href="#"
          onClick={(e) => { e.preventDefault(); setCurrentView('privacy'); }}
          style={{ 
            color: '#a8a8a8', 
            textDecoration: 'underline',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#d4af37'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#a8a8a8'}
        >
          Privacy Policy
        </a>
        <span style={{ color: '#a8a8a8' }}>•</span>
        <a 
          href="#"
          onClick={(e) => { e.preventDefault(); setCurrentView('terms'); }}
          style={{ 
            color: '#a8a8a8', 
            textDecoration: 'underline',
            transition: 'color 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#d4af37'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#a8a8a8'}
        >
          Terms of Service
        </a>
      </div>
    )}
  </footer>
);