import React from 'react';
import './App.css';
import { HomeView, AboutView, CorpusView, PrivacyView, TermsView } from './components';
import { useAppState } from './hooks/useAppState';
import { EnrichedLineData } from './types/corpus';

function App() {
  const {
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    searchMode,
    setSearchMode,
    selectedSource,
    setSelectedSource,
    selectedSection,
    setSelectedSection,
    corpusData,
    loading,
    currentOracleResponse,
    currentCounselResponse,
    isGeneratingOracle,
    isGeneratingCounsel,
    isRandomOrgAvailable,
    isEmbeddingsAvailable,
    personalOracleReports,
    personalCounselReports,
    handleSearch,
    navigateToSource
  } = useAppState();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleAncientQueryClick = (queryText: string) => {
    setSearchQuery(queryText);
    handleSearch(queryText);
  };

  const handleLineClick = (_line: EnrichedLineData) => {
    // Line click handling is managed within the CorpusView component
  };

  if (currentView === 'home') {
    return (
      <HomeView
        currentView={currentView}
        setCurrentView={setCurrentView}
        searchMode={searchMode}
        setSearchMode={setSearchMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isRandomOrgAvailable={isRandomOrgAvailable}
        isEmbeddingsAvailable={isEmbeddingsAvailable}
        isGenerating={isGeneratingOracle || isGeneratingCounsel}
        onSubmit={handleSubmit}
        onAncientQueryClick={handleAncientQueryClick}
      />
    );
  }

  if (currentView === 'about') {
    return (
      <AboutView 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
      />
    );
  }

  if (currentView === 'corpus') {
    return (
      <CorpusView
        currentView={currentView}
        setCurrentView={setCurrentView}
        corpusData={corpusData}
        loading={loading}
        selectedSource={selectedSource}
        setSelectedSource={setSelectedSource}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        currentOracleResponse={currentOracleResponse}
        currentCounselResponse={currentCounselResponse}
        personalOracleReports={personalOracleReports}
        personalCounselReports={personalCounselReports}
        onNavigateToSource={navigateToSource}
        onLineClick={handleLineClick}
      />
    );
  }

  if (currentView === 'privacy') {
    return (
      <PrivacyView 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
      />
    );
  }

  if (currentView === 'terms') {
    return (
      <TermsView 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
      />
    );
  }

  // Default fallback
  return (
    <HomeView
      currentView={currentView}
      setCurrentView={setCurrentView}
      searchMode={searchMode}
      setSearchMode={setSearchMode}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      isRandomOrgAvailable={isRandomOrgAvailable}
      isEmbeddingsAvailable={isEmbeddingsAvailable}
      isGenerating={isGeneratingOracle || isGeneratingCounsel}
      onSubmit={handleSubmit}
      onAncientQueryClick={handleAncientQueryClick}
    />
  );
}

export default App;