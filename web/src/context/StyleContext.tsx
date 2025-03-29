import React, { createContext, useContext, useEffect } from 'react';

// Define the context type
interface StyleContextType {
  font: string;
}

// Create the context
const StyleContext = createContext<StyleContextType | undefined>(undefined);

// Create a provider component
export const StyleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Hardcoded font
  const font = 'Jura';

  // Add Google Fonts link for Jura
  useEffect(() => {
    // Format font name for URL
    const fontToLoad = font.replace(/ /g, '+');
    
    // Check if link already exists and remove it
    const existingLink = document.getElementById('google-fonts');
    if (existingLink) {
      existingLink.remove();
    }
    
    // Create and append new link
    const link = document.createElement('link');
    link.id = 'google-fonts';
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontToLoad}&display=swap`;
    document.head.appendChild(link);
  }, []);

  return (
    <StyleContext.Provider 
      value={{
        font
      }}
    >
      {children}
    </StyleContext.Provider>
  );
};

// Create a hook to use the context
export const useStyle = () => {
  const context = useContext(StyleContext);
  if (context === undefined) {
    throw new Error('useStyle must be used within a StyleProvider');
  }
  return context;
}; 