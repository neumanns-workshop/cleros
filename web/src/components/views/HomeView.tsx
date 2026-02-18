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
  isEmbeddingsAvailable: boolean | null;
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
  isEmbeddingsAvailable,
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
    const recentQueries = [currentIndex]; // Track recent queries to avoid immediate repeats
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        let nextIndex;
        let attempts = 0;
        
        // Try to get a query that wasn't recently shown
        do {
          nextIndex = Math.floor(Math.random() * ancientQueries.length);
          attempts++;
        } while (recentQueries.includes(nextIndex) && attempts < 10);
        
        // Add to recent queries and keep only last 3-4 queries in memory
        recentQueries.push(nextIndex);
        if (recentQueries.length > Math.min(4, Math.floor(ancientQueries.length / 3))) {
          recentQueries.shift();
        }
        
        console.log(`🔄 HomeView Carousel: Switching from ${prev} (${ancientQueries[prev]?.id}) to ${nextIndex} (${ancientQueries[nextIndex]?.id})`);
        console.log(`🎯 Recent indices: [${recentQueries.join(', ')}]`);
        
        return nextIndex;
      });
    }, 15000);
    
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove currentIndex dependency to prevent restarting the interval

  const handleAncientQueryClick = () => {
    onAncientQueryClick(currentQuery.text);
  };

  return (
    <div className="app">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="main-content">
        <ModeSwitcher 
          searchMode={searchMode}
          setSearchMode={setSearchMode}
          isEmbeddingsAvailable={isEmbeddingsAvailable}
        />

        <ConsultationForm
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSubmit={onSubmit}
          searchMode={searchMode}
        />
        <AncientQueryCarousel
          displayedText={displayedText}
          onQueryClick={handleAncientQueryClick}
        />
      </main>
      <Footer setCurrentView={setCurrentView} />
      {isGenerating && (
        <LoadingOverlay 
          isGeneratingOracle={searchMode === 'oracle'}
          isGeneratingCounsel={searchMode === 'counsel'} 
        />
      )}
    </div>
  );
};