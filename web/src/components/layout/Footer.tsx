import React from 'react';
import { ViewType } from '../../types/app';

interface FooterProps {
  currentView?: ViewType;
  setCurrentView?: (view: ViewType) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView }) => (
  <footer className="app-footer mt-8 py-6 border-t border-purple-500/30">
    <div className="container mx-auto px-4 text-center">
      <p className="text-gray-300 mb-2">© 2025 Galaxy Brain Entertainment</p>
      {setCurrentView && (
        <div className="flex justify-center space-x-4 text-sm">
          <button 
            onClick={() => setCurrentView('privacy')}
            className="text-purple-300 hover:text-purple-100 transition-colors"
          >
            Privacy Policy
          </button>
          <span className="text-gray-500">•</span>
          <button 
            onClick={() => setCurrentView('terms')}
            className="text-purple-300 hover:text-purple-100 transition-colors"
          >
            Terms of Service
          </button>
        </div>
      )}
    </div>
  </footer>
);