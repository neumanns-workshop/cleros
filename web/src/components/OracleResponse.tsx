import React, { useState } from 'react';
import { OracleResponse, OracleSelection } from '../services/oracleService';
import { CounselSelection } from '../services/counselService';
import { formatTitle } from '../utils/stringUtils';

interface OracleResponseProps {
  response: OracleResponse;
  onViewInCorpus?: (selection: OracleSelection | CounselSelection) => void;
  onClose?: () => void;
}

interface SelectionCardProps {
  selection: OracleSelection | CounselSelection;
  keywords: string[];
  onViewInCorpus?: (selection: OracleSelection | CounselSelection) => void;
}

const SelectionCard: React.FC<SelectionCardProps> = ({ 
  selection, 
  keywords
}) => {
  const [showGreek, setShowGreek] = useState(false);
  


  const highlightKeywords = (text: string): string => {
    if (keywords.length === 0) return text;
    
    let highlightedText = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlightedText = highlightedText.replace(
        regex, 
        `<span class="keyword-highlight">${keyword}</span>`
      );
    });
    
    return highlightedText;
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#1c1c1c',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    color: '#e0e0e0'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem'
  };



  const textStyle: React.CSSProperties = {
    fontSize: '1rem',
    lineHeight: '1.6',
    fontFamily: 'Georgia, serif',
    marginBottom: '1rem'
  };

  const sectionInfoStyle: React.CSSProperties = {
    backgroundColor: '#2a2a2a',
    border: '1px solid #444',
    borderRadius: '4px',
    padding: '12px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    color: '#a0a0a0'
  };

  return (
    <div style={cardStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#e0e0e0' }}>{selection.source}</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#a0a0a0' }}>{formatTitle(selection.sectionTitle)}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {selection.text.greek && (
            <button
              onClick={() => setShowGreek(!showGreek)}
              style={{
                padding: '4px 12px',
                fontSize: '0.8rem',
                backgroundColor: '#333',
                color: '#ccc',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showGreek ? 'English' : 'Greek'}
            </button>
          )}
        </div>
      </div>

      {/* Section Info */}
      <div style={sectionInfoStyle}>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 'bold' }}>{formatTitle(selection.sectionTitle)}</h4>
        <div style={{ fontSize: '0.8rem', color: '#777' }}>
          Sentence {selection.sentenceId} • {
            'randomIndex' in selection 
              ? `Random selection ${selection.randomIndex + 1} of ${selection.totalSentences}`
              : `Semantic match ${Math.round((selection as CounselSelection).semanticScore * 100)}%`
          }
        </div>
      </div>

      {/* Incense Information */}
      {(selection.incense?.english || selection.incense) && (
        <div style={{
          backgroundColor: '#1a2a1a',
          border: '1px solid #2a4a2a',
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '1rem',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
            <strong style={{ color: '#90c695' }}>Recommended Incense:</strong>
          </div>
          <div style={{ color: '#b8d4ba' }}>
            {selection.incense?.english || (selection as any).incense}
            {(selection.incense?.greek) && (
              <span style={{ marginLeft: '8px', color: '#8a9a8a', fontStyle: 'italic' }}>
                ({selection.incense?.greek})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Text */}
      <div 
        style={textStyle}
        dangerouslySetInnerHTML={{ 
          __html: highlightKeywords(
            showGreek && selection.text.greek 
              ? selection.text.greek 
              : selection.text.english
          )
        }}
      />

      {/* Line Details */}
      {selection.lineDetails && selection.lineDetails.length > 0 && (
        <div>
          <h5 style={{ fontSize: '0.9rem', color: '#a0a0a0', marginBottom: '8px' }}>Line by Line:</h5>
          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {selection.lineDetails.map((line, index) => (
              <div 
                key={index}
                style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '4px', fontSize: '0.9rem' }}
              >
                <span style={{ 
                  fontSize: '0.8rem', 
                  color: '#777', 
                  fontFamily: 'monospace', 
                  width: '32px', 
                  textAlign: 'right',
                  flexShrink: 0
                }}>
                  {line.line}
                </span>
                <span 
                  style={{ color: '#ccc', flex: 1 }}
                  dangerouslySetInnerHTML={{
                    __html: highlightKeywords(
                      showGreek && line.greek ? line.greek : line.english
                    )
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const OracleResponseComponent: React.FC<OracleResponseProps> = ({
  response,
  onViewInCorpus,
  onClose
}) => {
  const [copiedSelection, setCopiedSelection] = useState<string | null>(null);

  const copyToClipboard = async (text: string, selectionType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSelection(selectionType);
      setTimeout(() => setCopiedSelection(null), 2000);
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error);
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: '#111',
    border: '1px solid #333',
    borderRadius: '12px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'hidden',
    color: '#e0e0e0'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px',
    borderBottom: '1px solid #333'
  };

  const queryStyle: React.CSSProperties = {
    padding: '24px',
    borderBottom: '1px solid #333'
  };

  const contentStyle: React.CSSProperties = {
    padding: '24px',
    maxHeight: '400px',
    overflowY: 'auto'
  };

  const footerStyle: React.CSSProperties = {
    padding: '24px',
    borderTop: '1px solid #333',
    backgroundColor: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '12px',
              background: 'linear-gradient(45deg, #9370db, #ff69b4)',
              borderRadius: '8px'
            }}>
              ✨
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Oracle Response</h2>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#a0a0a0' }}>
                Divine guidance through chance and interpretation
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', color: '#777' }}>
                Generated via True Random.org atmospheric noise
              </div>
              <div style={{ fontSize: '0.8rem', color: '#777' }}>
                🕐 {formatTimestamp(response.timestamp)}
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#a0a0a0',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Query */}
        <div style={queryStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1rem' }}>📜</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#a0a0a0' }}>Your Query:</span>
          </div>
          <blockquote style={{ 
            fontSize: '1.2rem', 
            fontFamily: 'Georgia, serif', 
            fontStyle: 'italic', 
            color: '#e0e0e0', 
            lineHeight: '1.6',
            margin: 0
          }}>
            &quot;{response.query}&quot;
          </blockquote>

        </div>

        {/* Oracle Selections */}
        <div style={contentStyle}>
          {response.selections.hymns && (
            <SelectionCard
              selection={response.selections.hymns}
              keywords={response.keywords}
              onViewInCorpus={onViewInCorpus}
            />
          )}
          
          {response.selections.argonautica && (
            <SelectionCard
              selection={response.selections.argonautica}
              keywords={response.keywords}
              onViewInCorpus={onViewInCorpus}
            />
          )}
          
          {response.selections.lithica && (
            <SelectionCard
              selection={response.selections.lithica}
              keywords={response.keywords}
              onViewInCorpus={onViewInCorpus}
            />
          )}
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <div style={{ fontSize: '0.8rem', color: '#777' }}>
            The oracle speaks through random selection from the three Orphic texts.
          </div>
          
          <button
            onClick={() => copyToClipboard(
              `Oracle Response for "${response.query}"\n\n` +
              `${response.selections.hymns?.source}: ${response.selections.hymns?.text.english}\n\n` +
              `${response.selections.argonautica?.source}: ${response.selections.argonautica?.text.english}\n\n` +
              `${response.selections.lithica?.source}: ${response.selections.lithica?.text.english}`,
              'full'
            )}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#9370db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            📋 {copiedSelection === 'full' ? 'Copied!' : 'Copy All'}
          </button>
        </div>
      </div>
    </div>
  );
};