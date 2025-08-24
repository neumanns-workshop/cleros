import React from 'react';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';
import { ModeSwitcher } from '../common/Modeswitcher';
import { ConsultationForm } from '../common/ConsultationForm';
import { AncientQueryCarousel } from '../common/AncientQueryCarousel';
import { LoadingOverlay } from '../common/LoadingOverlay';
import { ViewType, SearchMode } from '../../types/app';
import { useTypewriter } from '../../hooks/useTypewriter';
import { ancientQueries } from '../../constants/ancientQueries';

interface HomeViewProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isRandomOrgAvailable: boolean | null;
  isGenerating: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onAncientQueryClick: (query: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentView,
  setCurrentView,
  searchMode,
  setSearchMode,
  searchQuery,
  setSearchQuery,
  isRandomOrgAvailable,
  isGenerating,
  onSubmit,
  onAncientQueryClick
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(() => 
    Math.floor(Math.random() * ancientQueries.length)
  );

  const currentQuery = ancientQueries[currentIndex];
  const { displayedText } = useTypewriter({
    text: currentQuery.text,
    speed: 80,
    startDelay: 200
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(Math.floor(Math.random() * ancientQueries.length));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAncientQueryClick = () => {
    onAncientQueryClick(currentQuery.text);
  };

  return (
    <div className="app">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="main-content">
        <div className="intro-text">
          <p>
            {searchMode === 'oracle' 
              ? "Divine guidance (true random)"
              : "Mortal advice (semantic)"
            }
            {isRandomOrgAvailable === false && (
              <span style={{ color: '#ff6b6b', fontSize: '0.9em', display: 'block' }}>
                ⚠️ Oracle mode disabled: True randomness required
              </span>
            )}
          </p>
        </div>
        <ModeSwitcher 
          searchMode={searchMode}
          setSearchMode={setSearchMode}
          isRandomOrgAvailable={isRandomOrgAvailable}
        />
        <ConsultationForm
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSubmit={onSubmit}
        />
        <AncientQueryCarousel
          displayedText={displayedText}
          onQueryClick={handleAncientQueryClick}
        />
      </main>
      <Footer />
      {isGenerating && (
        <LoadingOverlay 
          isGeneratingOracle={searchMode === 'oracle'}
          isGeneratingCounsel={searchMode === 'sage'} 
        />
      )}
    </div>
  );
};