import React, { useState, useMemo } from 'react';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';
import ShareDialog from '../common/ShareDialog';
import OracleLine from '../OracleLine';
import { ViewType } from '../../types/app';
import { OracleResponse, CounselResponse } from '../../types/oracle';
import { formatTitle } from '../../utils/stringUtils';

interface CorpusViewProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  corpusData: any;
  loading: boolean;
  selectedSource: string;
  setSelectedSource: (source: string) => void;
  selectedSection: string;
  setSelectedSection: (section: string) => void;
  currentOracleResponse: OracleResponse | null;
  currentCounselResponse: CounselResponse | null;
  personalOracleReports: OracleResponse[];
  personalCounselReports: CounselResponse[];
  onNavigateToSource: (sourceLink: any) => void;
  onLineClick: (line: any) => void;
}

export const CorpusView: React.FC<CorpusViewProps> = ({
  currentView,
  setCurrentView,
  corpusData,
  loading,
  selectedSource,
  setSelectedSource,
  selectedSection,
  setSelectedSection,
  currentOracleResponse,
  currentCounselResponse,
  personalOracleReports,
  personalCounselReports,
  onNavigateToSource,
  onLineClick
}) => {
  const [selectedLine, setSelectedLine] = useState<any>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Format oracle or counsel report as lines for display
  const formatReportAsLines = (report: OracleResponse | CounselResponse) => {
    const lines = [];

    // Determine report type and source info
    const isOracle = 'randomSource' in report;
    const source = isOracle ? 'True Random.org' : 'Semantic Search';
    const mode = isOracle ? 'ORACLE' : 'COUNSEL';
    
    // QUERY section header (no line number)
    lines.push({
      line: null,
      english: `QUERY (${mode})`,
      note: `Generated ${new Date(report.timestamp).toLocaleString()} via ${source}`,
      isHeader: true
    });

    // Query text (line 1)
    lines.push({
      line: 1,
      english: report.query,
      note: 'User submitted oracle query'
    });

    // INVOCATION section
    if (report.selections.hymns) {
      const hymnsSelection = report.selections.hymns;
      const selectionNote = isOracle 
        ? `Random selection ${(hymnsSelection as any).randomIndex + 1} of ${hymnsSelection.totalSentences} sentences`
        : `Semantic match: ${((hymnsSelection as any).semanticScore * 100).toFixed(1)}% relevance of ${hymnsSelection.totalSentences} sentences`;
      
      const bestLineInfo = !isOracle && (hymnsSelection as any).bestLine 
        ? ` • Best line: ${(hymnsSelection as any).bestLine.lineNumber} (${((hymnsSelection as any).bestLine.score * 100).toFixed(1)}%)`
        : '';
      
      const hymnsTitle = hymnsSelection.incense
        ? `${hymnsSelection.source} • ${formatTitle(hymnsSelection.sectionTitle)} • ${hymnsSelection.incense.english}`
        : `${hymnsSelection.source} • ${formatTitle(hymnsSelection.sectionTitle)}`;

      lines.push({
        line: null,
        english: hymnsTitle,
        note: selectionNote + bestLineInfo,
        isHeader: true,
        sourceLink: {
          corpus: 'hymns',
          sentenceId: hymnsSelection.sentenceId,
          sectionTitle: hymnsSelection.sectionTitle,
          key: (hymnsSelection as any).partNumber
        }
      });

      // Add each line from the sentence with original line numbers
      if (report.selections.hymns.lineDetails && report.selections.hymns.lineDetails.length > 0) {
        report.selections.hymns.lineDetails.forEach((lineDetail: any) => {
          const lineNote = isOracle
            ? `Line ${lineDetail.line} • Sentence ${report.selections.hymns!.sentenceId} • Random selection ${(report.selections.hymns as any).randomIndex + 1} of ${report.selections.hymns!.totalSentences}`
            : `Line ${lineDetail.line} • Sentence ${report.selections.hymns!.sentenceId} • Semantic match: ${((report.selections.hymns as any).semanticScore * 100).toFixed(1)}% relevance`;
          
          lines.push({
            ...lineDetail,
            note: lineDetail.note || lineNote,
            part_number: (report.selections.hymns as any).partNumber,
            sentence_id: report.selections.hymns!.sentenceId,
            corpus_name: (report.selections.hymns as any).corpusName,
            sourceLink: {
              corpus: 'hymns',
              sentenceId: report.selections.hymns!.sentenceId,
              sectionTitle: report.selections.hymns!.sectionTitle,
              lineNumber: lineDetail.line
            }
          });
        });
      }
    }

    // NARRATIVE section (argonautica)
    if (report.selections.argonautica) {
      const argonauticaSelection = report.selections.argonautica;
      const selectionNote = isOracle 
        ? `Random selection ${(argonauticaSelection as any).randomIndex + 1} of ${argonauticaSelection.totalSentences} sentences`
        : `Semantic match: ${((argonauticaSelection as any).semanticScore * 100).toFixed(1)}% relevance of ${argonauticaSelection.totalSentences} sentences`;
      
      const bestLineInfo = !isOracle && (argonauticaSelection as any).bestLine 
        ? ` • Best line: ${(argonauticaSelection as any).bestLine.lineNumber} (${((argonauticaSelection as any).bestLine.score * 100).toFixed(1)}%)`
        : '';
      
      lines.push({
        line: null,
        english: `${argonauticaSelection.source} • ${formatTitle(argonauticaSelection.sectionTitle)}`,
        note: selectionNote + bestLineInfo,
        isHeader: true,
        sourceLink: {
          corpus: 'argonautica',
          sentenceId: argonauticaSelection.sentenceId,
          sectionTitle: argonauticaSelection.sectionTitle
        }
      });

      // Add lines for argonautica
      if (report.selections.argonautica.lineDetails && report.selections.argonautica.lineDetails.length > 0) {
        report.selections.argonautica.lineDetails.forEach((lineDetail: any) => {
          const lineNote = isOracle
            ? `Line ${lineDetail.line} • Sentence ${report.selections.argonautica!.sentenceId} • Random selection ${(report.selections.argonautica as any).randomIndex + 1} of ${report.selections.argonautica!.totalSentences}`
            : `Line ${lineDetail.line} • Sentence ${report.selections.argonautica!.sentenceId} • Semantic match: ${((report.selections.argonautica as any).semanticScore * 100).toFixed(1)}% relevance`;
          
          lines.push({
            ...lineDetail,
            note: lineDetail.note || lineNote,
            part_number: (report.selections.argonautica as any).partNumber,
            sentence_id: report.selections.argonautica!.sentenceId,
            corpus_name: (report.selections.argonautica as any).corpusName,
            sourceLink: {
              corpus: 'argonautica',
              sentenceId: report.selections.argonautica!.sentenceId,
              sectionTitle: report.selections.argonautica!.sectionTitle,
              lineNumber: lineDetail.line
            }
          });
        });
      }
    }

    // PRAXIS section (lithica)
    if (report.selections.lithica) {
      const lithicaSelection = report.selections.lithica;
      const selectionNote = isOracle 
        ? `Random selection ${(lithicaSelection as any).randomIndex + 1} of ${lithicaSelection.totalSentences} sentences`
        : `Semantic match: ${((lithicaSelection as any).semanticScore * 100).toFixed(1)}% relevance of ${lithicaSelection.totalSentences} sentences`;
      
      const bestLineInfo = !isOracle && (lithicaSelection as any).bestLine 
        ? ` • Best line: ${(lithicaSelection as any).bestLine.lineNumber} (${((lithicaSelection as any).bestLine.score * 100).toFixed(1)}%)`
        : '';
      
      lines.push({
        line: null,
        english: `${lithicaSelection.source} • ${formatTitle(lithicaSelection.sectionTitle)}`,
        note: selectionNote + bestLineInfo,
        isHeader: true,
        sourceLink: {
          corpus: 'lithica',
          sentenceId: lithicaSelection.sentenceId,
          sectionTitle: lithicaSelection.sectionTitle
        }
      });

      // Add lines for lithica
      if (report.selections.lithica.lineDetails && report.selections.lithica.lineDetails.length > 0) {
        report.selections.lithica.lineDetails.forEach((lineDetail: any) => {
          const lineNote = isOracle
            ? `Line ${lineDetail.line} • Sentence ${report.selections.lithica!.sentenceId} • Random selection ${(report.selections.lithica as any).randomIndex + 1} of ${report.selections.lithica!.totalSentences}`
            : `Line ${lineDetail.line} • Sentence ${report.selections.lithica!.sentenceId} • Semantic match: ${((report.selections.lithica as any).semanticScore * 100).toFixed(1)}% relevance`;
          
          lines.push({
            ...lineDetail,
            note: lineDetail.note || lineNote,
            part_number: (report.selections.lithica as any).partNumber,
            sentence_id: report.selections.lithica!.sentenceId,
            corpus_name: (report.selections.lithica as any).corpusName,
            sourceLink: {
              corpus: 'lithica',
              sentenceId: report.selections.lithica!.sentenceId,
              sectionTitle: report.selections.lithica!.sectionTitle,
              lineNumber: lineDetail.line
            }
          });
        });
      }
    }

    return lines;
  };

  // Get current part data
  const getCurrentPartData = () => {
    if (selectedSource === 'personal') {
      if (selectedSection.startsWith('oracle_')) {
        const timestamp = parseInt(selectedSection.replace('oracle_', ''), 10);
        const report = personalOracleReports.find(r => r.timestamp === timestamp);
        if (report) {
          return formatReportAsLines(report);
        }
      } else if (selectedSection.startsWith('counsel_')) {
        const timestamp = parseInt(selectedSection.replace('counsel_', ''), 10);
        const report = personalCounselReports.find(r => r.timestamp === timestamp);
        if (report) {
          return formatReportAsLines(report);
        }
      }
      return [];
    }
    
    const sourceData = corpusData[selectedSource as keyof typeof corpusData];
    console.log(`📊 getCurrentPartData: source=${selectedSource}, section=${selectedSection}, sourceData available=${!!sourceData}`);
    
    if (sourceData && sourceData.parts) {
      const part = sourceData.parts.find((s: any) => s.key === selectedSection);
      console.log(`📄 Looking for part with key '${selectedSection}', found=${!!part}`);
      
      if (part) {
        const lines: any[] = [];
        
        // Add part header
        const formattedTitle = formatTitle(part.part_title);
        const headerText = part.incense 
          ? `${formattedTitle} • ${part.incense}`
          : formattedTitle;
        
        lines.push({
          line: 'header',
          english: headerText,
          isHeader: true,
          sourceLink: {
            corpus: selectedSource,
            source: formattedTitle,
            key: part.part_number
          }
        });

        // Add lines from sentences with embedding context
        for (const sentence of part.sentences || []) {
          for (const lineDetail of sentence.line_details || []) {
            const lineWithContext = {
              ...lineDetail,
              part_number: part.part_number,
              sentence_id: sentence.sentence_id,
              corpus_name: selectedSource,
              sourceLink: {
                corpus: selectedSource,
                source: part.part_title,
                key: part.key
              }
            };
            
            lines.push(lineWithContext);
          }
        }
        
        console.log(`📝 Returning ${lines.length} lines for part '${part.part_title}'`);
        return lines;
      } else {
        // Debug available parts when the requested section isn't found
        const availableParts = sourceData.parts.map((p: any) => p.key).join(', ');
        console.log(`⚠️ Part '${selectedSection}' not found. Available parts: ${availableParts}`);
      }
    } else if (!sourceData) {
      console.log(`⚠️ No corpus data available for source '${selectedSource}'`);
    }
    return [];
  };

  const currentLines = useMemo(() => {
    return getCurrentPartData();
  }, [selectedSource, selectedSection, corpusData, personalOracleReports, personalCounselReports]);

  const handleSourceChange = (newSource: string) => {
    console.log(`📖 Source changed to: ${newSource}`);
    setSelectedSource(newSource);
    
    // Reset to first part of selected source
    if (newSource === 'personal') {
      // For personal reports, set to most recent report if available
      const allReports = [
        ...personalOracleReports.map(r => ({ ...r, type: 'oracle' })),
        ...personalCounselReports.map(r => ({ ...r, type: 'counsel' }))
      ].sort((a, b) => b.timestamp - a.timestamp);
      
      if (allReports.length > 0) {
        const mostRecent = allReports[0];
        setSelectedSection(`${mostRecent.type}_${mostRecent.timestamp}`);
      } else {
        setSelectedSection('');
      }
    } else {
      // For regular corpus data
      const newSourceData = corpusData[newSource as keyof typeof corpusData];
      if (newSourceData && newSourceData.parts && newSourceData.parts.length > 0) {
        setSelectedSection(newSourceData.parts[0].key);
      } else {
        setSelectedSection('');
      }
    }
  };

  const handleSectionChange = (newSection: string) => {
    console.log(`📄 Section changed to: ${newSection}`);
    setSelectedSection(newSection);
  };

  const handleLineClick = (line: any) => {
    setSelectedLine(line);
    onLineClick(line);
  };

  const navigateToSource = (sourceLink: any) => {
    setSelectedLine(null);
    onNavigateToSource(sourceLink);
  };

  return (
    <div className="app">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      
      <div className="corpus-view">
        <div className="corpus-header">
          <div className="corpus-controls">
            <select 
              className="source-selector" 
              value={selectedSource} 
              onChange={(e) => handleSourceChange(e.target.value)}
            >
              <option value="hymns">Hymns</option>
              <option value="argonautica">Argonautica</option>
              <option value="lithica">Lithica</option>
              <option value="tablets">Golden Tablets</option>
              <option value="queries">Oracle Queries (Dodona)</option>
              <option value="papyrusQueries">Oracle Queries (Papyrus)</option>
              <option value="personal">Personal Reports</option>
            </select>
            {(selectedSource === 'personal' ? 
              (personalOracleReports.length > 0 || personalCounselReports.length > 0) : 
              corpusData[selectedSource] && corpusData[selectedSource].parts && corpusData[selectedSource].parts.length > 0) && (
              <select 
                className="section-selector" 
                value={selectedSection} 
                onChange={(e) => handleSectionChange(e.target.value)}
              >
                {selectedSource === 'personal' ? (
                  <>
                    {personalOracleReports.map((report) => (
                      <option key={`oracle_${report.timestamp}`} value={`oracle_${report.timestamp}`}>
                        [ORACLE] {new Date(report.timestamp).toLocaleString()} - "{report.query.substring(0, 40)}..."
                      </option>
                    ))}
                    {personalCounselReports.map((report) => (
                      <option key={`counsel_${report.timestamp}`} value={`counsel_${report.timestamp}`}>
                        [COUNSEL] {new Date(report.timestamp).toLocaleString()} - "{report.query.substring(0, 40)}..."
                      </option>
                    ))}
                  </>
                ) : (
                  // Use unified corpus structure - all parts have proper titles
                  corpusData[selectedSource].parts.map((part: any) => (
                    <option key={`${selectedSource}_${part.key}`} value={part.key}>
                      {part.title_english || part.title}
                    </option>
                  ))
                )}
              </select>
            )}
          </div>
        </div>
        
        {/* Share Button - Show when viewing personal reports */}
        {selectedSource === 'personal' && (currentOracleResponse || currentCounselResponse) && (
          <div style={{ 
            padding: '12px 24px',
            borderBottom: '1px solid #333',
            backgroundColor: '#111'
          }}>
            <button 
              onClick={() => setShowShareDialog(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: '#9370db',
                color: '#ffffff',
                border: '1px solid #9370db',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '500',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#a478e4';
                e.currentTarget.style.borderColor = '#a478e4';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(147, 112, 219, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#9370db';
                e.currentTarget.style.borderColor = '#9370db';
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Share
            </button>
          </div>
        )}

        <div className="corpus-content">
          {loading ? (
            <div className="no-content">
              <p>Loading corpus data...</p>
            </div>
          ) : (
            <div className="line-display">
              {currentLines.length > 0 ? (
                currentLines.map((lineData: any, index: number) => (
                  <OracleLine
                    key={`${index}_${lineData.line}`}
                    lineData={lineData}
                    oracleResponse={selectedSource === 'personal' ? (currentOracleResponse || currentCounselResponse) : null}
                    onNavigate={onNavigateToSource}
                    onLineClick={handleLineClick}
                  />
                ))
              ) : (
                <div className="no-content">
                  <p>
                    {selectedSource === 'personal' && personalOracleReports.length === 0 && personalCounselReports.length === 0
                      ? 'You have no personal reports. Generate one from the Home page.'
                      : 'No content available for this selection.'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {selectedLine && (
          <div className="modal-overlay" onClick={() => setSelectedLine(null)}>
            <div className="line-modal" onClick={(e) => e.stopPropagation()}>
              <div className="line-modal-header">
                <h3>Line {selectedLine.line}</h3>
                <button onClick={() => setSelectedLine(null)} className="close-button">×</button>
              </div>
              <div className="line-modal-content">
                <div className="line-section">
                  <h4>English</h4>
                  <p className="english-text">{selectedLine.english}</p>
                </div>
                <div className="line-section">
                  <h4>Greek</h4>
                  <p className="greek-text">{selectedLine.greek}</p>
                </div>
                <div className="line-section">
                  <h4>Commentary</h4>
                  <p className="commentary-text">
                    {selectedLine.note && selectedLine.note.trim() 
                      ? selectedLine.note 
                      : <em>No commentary available for this line.</em>
                    }
                  </p>
                </div>
                {selectedLine.sourceLink && (
                  <div className="line-section">
                    <button 
                      className="source-button"
                      onClick={() => navigateToSource(selectedLine.sourceLink)}
                    >
                      Go to {selectedLine.sourceLink.corpus.charAt(0).toUpperCase() + selectedLine.sourceLink.corpus.slice(1)}: {selectedLine.sourceLink.sectionTitle || `Line ${selectedLine.sourceLink.lineNumber}`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />

      {/* Share Dialog */}
      {(currentOracleResponse || currentCounselResponse) && (
        <ShareDialog 
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
          response={currentOracleResponse || currentCounselResponse}
          selectedCorpus="all"
        />
      )}
    </div>
  );
};
