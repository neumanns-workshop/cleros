import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { EntityClassification, loadDeityClassifications } from '../services/deities';

interface DeityContextType {
  classifications: EntityClassification[];
  loading: boolean;
  error: string | null;
}

const DeityContext = createContext<DeityContextType>({
  classifications: [],
  loading: true,
  error: null,
});

export const useDeityContext = () => useContext(DeityContext);

interface DeityProviderProps {
  children: ReactNode;
}

export const DeityProvider: React.FC<DeityProviderProps> = ({ children }) => {
  const [classifications, setClassifications] = useState<EntityClassification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassifications = async () => {
      try {
        const data = await loadDeityClassifications();
        setClassifications(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load deity classifications:', err);
        setError('Failed to load deity data');
        setLoading(false);
      }
    };

    fetchClassifications();
  }, []);

  return (
    <DeityContext.Provider
      value={{
        classifications,
        loading,
        error,
      }}
    >
      {children}
    </DeityContext.Provider>
  );
}; 