import React, { useState, useMemo, useCallback } from 'react';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';
import ShareDialog from '../common/ShareDialog';
import OracleLine from '../OracleLine';
import { ViewType } from '../../types/app';
import { OracleResponse, CounselResponse, OracleSelection, CounselSelection } from '../../types/oracle';
import { AllCorpusData, EnrichedLineData, SourceLink, CorpusPart } from '../../types/corpus';
import { formatTitle } from '../../utils/stringUtils';

interface CorpusViewProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  corpusData: AllCorpusData;
  loading: boolean;
  selectedSource: string;
  setSelectedSource: (source: string) => void;
  selectedSection: string;
  setSelectedSection: (section: string) => void;
  currentOracleResponse: OracleResponse | null;
  currentCounselResponse: CounselResponse | null;
  personalOracleReports: OracleResponse[];
  personalCounselReports: CounselResponse[];
  onNavigateToSource: (sourceLink: SourceLink) => void;
  onLineClick: (line: EnrichedLineData) => void;
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
  const [selectedLine, setSelectedLine] = useState<EnrichedLineData | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Format oracle or counsel report as lines for display
  const formatReportAsLines = (report: OracleResponse | CounselResponse): EnrichedLineData[] => {
    const lines: EnrichedLineData[] = [];

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
      const oracleSelection = hymnsSelection as OracleSelection;
      const counselSelection = hymnsSelection as CounselSelection;
      
      const selectionNote = isOracle 
        ? `Random selection ${oracleSelection.randomIndex + 1} of ${hymnsSelection.totalSentences} sentences`
        : `Semantic match: ${(counselSelection.semanticScore * 100).toFixed(1)}% relevance of ${hymnsSelection.totalSentences} sentences`;
      
      const bestLineInfo = !isOracle && counselSelection.bestLine 
        ? ` • Best line: ${counselSelection.bestLine.lineNumber} (${(counselSelection.bestLine.score * 100).toFixed(1)}%)`
        : '';
      
      const hymnsTitle = hymnsSelection.incense
        ? `${hymnsSelection.source} • ${formatTitle(hymnsSelection.sectionTitle)} • ${hymnsSelection.incense.english}`
        : `${hymnsSelection.source} • ${formatTitle(hymnsSelection.sectionTitle)}`;

        const partNumber = hymnsSelection.partNumber;
        if (partNumber === undefined) {
          console.warn('⚠️ partNumber is undefined for hymns selection:', hymnsSelection);
        }
        
        lines.push({
          line: null,
          english: hymnsTitle,
          note: selectionNote + bestLineInfo,
          isHeader: true,
          sourceLink: {
            corpus: 'hymns',
            sentenceId: hymnsSelection.sentenceId.toString(),
            sectionTitle: hymnsSelection.sectionTitle,
            key: partNumber !== undefined ? String(partNumber) : undefined
          }
        });

      // Add each line from the sentence with original line numbers
      if (report.selections.hymns.lineDetails && report.selections.hymns.lineDetails.length > 0) {
        report.selections.hymns.lineDetails.forEach((lineDetail) => {
          const hymnsSelectionTyped = report.selections.hymns;
          if (!hymnsSelectionTyped) return;
          
          const oracleHymns = hymnsSelectionTyped as OracleSelection;
          const counselHymns = hymnsSelectionTyped as CounselSelection;
          
          const lineNote = isOracle
            ? `Line ${lineDetail.line} • Sentence ${hymnsSelectionTyped.sentenceId} • Random selection ${oracleHymns.randomIndex + 1} of ${hymnsSelectionTyped.totalSentences}`
            : `Line ${lineDetail.line} • Sentence ${hymnsSelectionTyped.sentenceId} • Semantic match: ${(counselHymns.semanticScore * 100).toFixed(1)}% relevance`;
          
          lines.push({
            ...lineDetail,
            note: lineDetail.note || lineNote,
            part_number: hymnsSelectionTyped.partNumber,
            sentence_id: hymnsSelectionTyped.sentenceId.toString(),
            corpus_name: hymnsSelectionTyped.corpusName,
            sourceLink: {
              corpus: 'hymns',
              sentenceId: hymnsSelectionTyped.sentenceId.toString(),
              sectionTitle: hymnsSelectionTyped.sectionTitle,
              lineNumber: lineDetail.line
            }
          });
        });
      }
    }

    // NARRATIVE section (argonautica)
    if (report.selections.argonautica) {
      const argonauticaSelection = report.selections.argonautica;
      const oracleArg = argonauticaSelection as OracleSelection;
      const counselArg = argonauticaSelection as CounselSelection;
      
      const selectionNote = isOracle 
        ? `Random selection ${oracleArg.randomIndex + 1} of ${argonauticaSelection.totalSentences} sentences`
        : `Semantic match: ${(counselArg.semanticScore * 100).toFixed(1)}% relevance of ${argonauticaSelection.totalSentences} sentences`;
      
      const bestLineInfo = !isOracle && counselArg.bestLine 
        ? ` • Best line: ${counselArg.bestLine.lineNumber} (${(counselArg.bestLine.score * 100).toFixed(1)}%)`
        : '';
      
              lines.push({
          line: null,
          english: `${argonauticaSelection.source} • ${formatTitle(argonauticaSelection.sectionTitle)}`,
          note: selectionNote + bestLineInfo,
          isHeader: true,
          sourceLink: {
            corpus: 'argonautica',
            sentenceId: argonauticaSelection.sentenceId.toString(),
            sectionTitle: argonauticaSelection.sectionTitle,
            key: argonauticaSelection.partNumber !== undefined ? String(argonauticaSelection.partNumber) : undefined
          }
        });

      // Add lines for argonautica
      if (report.selections.argonautica.lineDetails && report.selections.argonautica.lineDetails.length > 0) {
        report.selections.argonautica.lineDetails.forEach((lineDetail) => {
          const argSelectionTyped = report.selections.argonautica;
          if (!argSelectionTyped) return;
          
          const oracleArgTyped = argSelectionTyped as OracleSelection;
          const counselArgTyped = argSelectionTyped as CounselSelection;
          
          const lineNote = isOracle
            ? `Line ${lineDetail.line} • Sentence ${argSelectionTyped.sentenceId} • Random selection ${oracleArgTyped.randomIndex + 1} of ${argSelectionTyped.totalSentences}`
            : `Line ${lineDetail.line} • Sentence ${argSelectionTyped.sentenceId} • Semantic match: ${(counselArgTyped.semanticScore * 100).toFixed(1)}% relevance`;
          
          lines.push({
            ...lineDetail,
            note: lineDetail.note || lineNote,
            part_number: argSelectionTyped.partNumber,
            sentence_id: argSelectionTyped.sentenceId.toString(),
            corpus_name: argSelectionTyped.corpusName,
            sourceLink: {
              corpus: 'argonautica',
              sentenceId: argSelectionTyped.sentenceId.toString(),
              sectionTitle: argSelectionTyped.sectionTitle,
              lineNumber: lineDetail.line,
              key: argSelectionTyped.partNumber !== undefined ? String(argSelectionTyped.partNumber) : undefined
            }
          });
        });
      }
    }

    // PRAXIS section (lithica)
    if (report.selections.lithica) {
      const lithicaSelection = report.selections.lithica;
      const oracleLith = lithicaSelection as OracleSelection;
      const counselLith = lithicaSelection as CounselSelection;
      
      const selectionNote = isOracle 
        ? `Random selection ${oracleLith.randomIndex + 1} of ${lithicaSelection.totalSentences} sentences`
        : `Semantic match: ${(counselLith.semanticScore * 100).toFixed(1)}% relevance of ${lithicaSelection.totalSentences} sentences`;
      
      const bestLineInfo = !isOracle && counselLith.bestLine 
        ? ` • Best line: ${counselLith.bestLine.lineNumber} (${(counselLith.bestLine.score * 100).toFixed(1)}%)`
        : '';
      
      lines.push({
        line: null,
        english: `${lithicaSelection.source} • ${formatTitle(lithicaSelection.sectionTitle)}`,
        note: selectionNote + bestLineInfo,
        isHeader: true,
        sourceLink: {
          corpus: 'lithica',
          sentenceId: lithicaSelection.sentenceId.toString(),
          sectionTitle: lithicaSelection.sectionTitle
        }
      });

      // Add lines for lithica
      if (report.selections.lithica.lineDetails && report.selections.lithica.lineDetails.length > 0) {
        report.selections.lithica.lineDetails.forEach((lineDetail) => {
          const lithSelectionTyped = report.selections.lithica;
          if (!lithSelectionTyped) return;
          
          const oracleLithTyped = lithSelectionTyped as OracleSelection;
          const counselLithTyped = lithSelectionTyped as CounselSelection;
          
          const lineNote = isOracle
            ? `Line ${lineDetail.line} • Sentence ${lithSelectionTyped.sentenceId} • Random selection ${oracleLithTyped.randomIndex + 1} of ${lithSelectionTyped.totalSentences}`
            : `Line ${lineDetail.line} • Sentence ${lithSelectionTyped.sentenceId} • Semantic match: ${(counselLithTyped.semanticScore * 100).toFixed(1)}% relevance`;
          
          lines.push({
            ...lineDetail,
            note: lineDetail.note || lineNote,
            part_number: lithSelectionTyped.partNumber,
            sentence_id: lithSelectionTyped.sentenceId.toString(),
            corpus_name: lithSelectionTyped.corpusName,
            sourceLink: {
              corpus: 'lithica',
              sentenceId: lithSelectionTyped.sentenceId.toString(),
              sectionTitle: lithSelectionTyped.sectionTitle,
              lineNumber: lineDetail.line,
              key: lithSelectionTyped.partNumber !== undefined ? String(lithSelectionTyped.partNumber) : undefined
            }
          });
        });
      }
    }

    return lines;
  };

  // Get current part data
  const getCurrentPartData = useCallback(() => {
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
      // Handle empty selectedSection by using first part
      if (!selectedSection) {
        return [];
      }
      
      const part = sourceData.parts.find((s: CorpusPart) => s.key === selectedSection);
      console.log(`📄 Using selectedSection '${selectedSection}', found=${!!part}`);
      
      if (part) {
        const lines: EnrichedLineData[] = [];
        
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
        const availableParts = sourceData.parts.map((p: CorpusPart) => p.key).join(', ');
        console.log(`⚠️ Part '${selectedSection}' not found. Available parts: ${availableParts}`);
      }
    } else if (!sourceData) {
      console.log(`⚠️ No corpus data available for source '${selectedSource}'`);
    }
    return [];
  }, [selectedSource, selectedSection, corpusData, personalOracleReports, personalCounselReports]);

  const currentLines = useMemo(() => {
    return getCurrentPartData();
  }, [getCurrentPartData]);

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
        setSelectedSection(String(newSourceData.parts[0].key));
      } else {
        setSelectedSection('');
      }
    }
  };

  const handleSectionChange = (newSection: string) => {
    console.log(`📄 Section changed to: ${newSection}`);
    setSelectedSection(newSection);
  };

  // Set selectedSection when switching sources or when corpus loads
  React.useEffect(() => {
    const sourceData = corpusData[selectedSource as keyof AllCorpusData];
    if (sourceData?.parts && sourceData.parts.length > 0) {
      if (sourceData?.parts?.[0]) {
        const firstPartKey = sourceData.parts[0].key;
        if (!selectedSection || selectedSource !== 'personal') {
          setSelectedSection(String(firstPartKey));
        }
      }
    }
  }, [selectedSource, corpusData, selectedSection, setSelectedSection]);

  const handleLineClick = (line: EnrichedLineData) => {
    setSelectedLine(line);
    onLineClick(line);
  };

  const navigateToSource = async (sourceLink: SourceLink) => {
    setSelectedLine(null);
    await onNavigateToSource(sourceLink);
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
                  corpusData[selectedSource as keyof AllCorpusData]?.parts?.map((part: CorpusPart) => (
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
            borderBottom: '1px solid #a8a8a833'
          }}>
            <button 
              onClick={() => setShowShareDialog(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#a8a8a8',
                border: '1px solid #a8a8a866',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '500',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#d4af3722';
                e.currentTarget.style.borderColor = '#d4af37';
                e.currentTarget.style.color = '#d4af37';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#a8a8a866';
                e.currentTarget.style.color = '#a8a8a8';
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
                currentLines.map((lineData: EnrichedLineData, index: number) => (
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
                      onClick={async () => selectedLine.sourceLink && await navigateToSource(selectedLine.sourceLink)}
                    >
                      Go to line
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer setCurrentView={setCurrentView} />

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
