import React from 'react';
import { ViewType } from '../../types/app';

interface FooterProps {
  currentView?: ViewType;
  setCurrentView?: (view: ViewType) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView }) => (
  <footer className="app-footer mt-8 py-6 border-t border-purple-500/30">
    <div className="container mx-auto px-4 text-center">
      <p className="text-gray-100 mb-2">© 2025 Galaxy Brain Entertainment</p>
      {setCurrentView && (
        <div className="flex justify-center space-x-4 text-sm">
          <a 
            href="#"
            onClick={(e) => { e.preventDefault(); setCurrentView('privacy'); }}
            className="text-gray-200 hover:text-purple-300 underline underline-offset-2 hover:no-underline transition-colors"
          >
            Privacy Policy
          </a>
          <span className="text-gray-500">•</span>
          <a 
            href="#"
            onClick={(e) => { e.preventDefault(); setCurrentView('terms'); }}
            className="text-gray-200 hover:text-purple-300 underline underline-offset-2 hover:no-underline transition-colors"
          >
            Terms of Service
          </a>
        </div>
      )}
    </div>
  </footer>
);