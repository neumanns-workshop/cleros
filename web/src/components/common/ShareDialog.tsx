import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ConsultationResponse } from '../../types/oracle';
import ShareCard from './ShareCard';
import { formatTitle } from '../../utils/stringUtils';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  response: ConsultationResponse | null;
  // Add an optional parameter to specify which corpus to share, defaulting to all
  selectedCorpus?: 'hymns' | 'argonautica' | 'lithica' | 'all';
}

const ShareDialog: React.FC<ShareDialogProps> = ({ isOpen, onClose, response, selectedCorpus = 'all' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Capitalize first letter of sentence
  const capitalizeFirst = (text: string): string => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // Get line range from original response data
  const getLineRange = (corpus: string): string | null => {
    if (!response || !response.selections) return null;
    const selection = response.selections[corpus as keyof typeof response.selections];
    if (selection?.lineDetails && selection.lineDetails.length > 0) {
      if (selection.lineDetails.length === 1) {
        return `l. ${selection.lineDetails[0].line}`;
      } else {
        const firstLine = selection.lineDetails[0].line;
        const lastLine = selection.lineDetails[selection.lineDetails.length - 1].line;
        return `ll. ${firstLine}-${lastLine}`;
      }
    }
    return null;
  };




  if (!isOpen || !response || !response.selections) {
    return null;
  }

  // Create options from all oracle selections (truncated to 5 lines for display)
  const options: Array<{
    id: string;
    type: 'sentence';
    corpus: 'hymns' | 'argonautica' | 'lithica';
    content: {
      text: string;
      lineCount: number;
      sectionTitle: string;
    };
    metadata: {
      sentenceId: number;
      incense?: {
        english: string;
        greek?: string;
      };
    };
  }> = [];
  
  if (selectedCorpus === 'all' || selectedCorpus === 'hymns') {
    if (response.selections.hymns) {
      options.push({
        id: `hymns-${response.selections.hymns.sentenceId}`,
        type: 'sentence',
        corpus: 'hymns' as const,
        content: {
          text: response.selections.hymns.text.english,
          lineCount: response.selections.hymns.lineDetails?.length || 0,
          sectionTitle: response.selections.hymns.sectionTitle
        },
        metadata: {
          sentenceId: response.selections.hymns.sentenceId,
          incense: response.selections.hymns.incense
        }
      });
    }
  }
  
  if (selectedCorpus === 'all' || selectedCorpus === 'argonautica') {
    if (response.selections.argonautica) {
      options.push({
        id: `argonautica-${response.selections.argonautica.sentenceId}`,
        type: 'sentence',
        corpus: 'argonautica' as const,
        content: {
          text: response.selections.argonautica.text.english,
          lineCount: response.selections.argonautica.lineDetails?.length || 0,
          sectionTitle: response.selections.argonautica.sectionTitle
        },
        metadata: {
          sentenceId: response.selections.argonautica.sentenceId
        }
      });
    }
  }
  
  if (selectedCorpus === 'all' || selectedCorpus === 'lithica') {
    if (response.selections.lithica) {
      options.push({
        id: `lithica-${response.selections.lithica.sentenceId}`,
        type: 'sentence',
        corpus: 'lithica' as const,
        content: {
          text: response.selections.lithica.text.english,
          lineCount: response.selections.lithica.lineDetails?.length || 0,
          sectionTitle: response.selections.lithica.sectionTitle
        },
        metadata: {
          sentenceId: response.selections.lithica.sentenceId
        }
      });
    }
  }
  
  if (options.length === 0) {
    return null;
  }
  
  const currentOption = options[currentIndex];

  const nextOption = () => {
    setCurrentIndex((prev) => (prev + 1) % options.length);
  };

  const prevOption = () => {
    setCurrentIndex((prev) => (prev - 1 + options.length) % options.length);
  };

  const goToOption = (index: number) => {
    setCurrentIndex(index);
  };









  const showFeedback = (message: string) => {
    setFeedbackMessage(message);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const copyToClipboard = async () => {
    try {
      // Copy the text content
      const cardText = generateCardText();
      await navigator.clipboard.writeText(cardText);
      
      showFeedback('✅ Text copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      showFeedback('❌ Failed to copy text');
    }
  };
  
  const copyImageToClipboard = async () => {
    const shareCardElement = document.getElementById('share-card-render-target');
    if (!shareCardElement) {
      console.error('Share card element not found');
      return;
    }
    
    try {
      // Use html-to-image library
      const htmlToImage = await import('html-to-image');
      
      // Capture exactly as it appears in the preview - no additional transforms!
      const blob = await htmlToImage.toBlob(shareCardElement, { 
        quality: 0.95,
        pixelRatio: 2, // For high-res output
        backgroundColor: '#242830' // Match card background
      });
      
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showFeedback('✅ Image copied to clipboard');
      }
    } catch (error) {
      console.error('Failed to copy image to clipboard:', error);
      showFeedback('❌ Failed to copy image');
    }
  };

  const saveAsImage = async () => {
    const shareCardElement = document.getElementById('share-card-render-target');
    if (!shareCardElement) {
      console.error('Share card element not found');
      return;
    }
    
    try {
      // Use html-to-image library
      const htmlToImage = await import('html-to-image');
      
      // Capture exactly as it appears in the preview - no additional transforms!
      const dataUrl = await htmlToImage.toPng(shareCardElement, { 
        quality: 0.95,
        pixelRatio: 2, // For high-res output
        backgroundColor: '#242830' // Match card background
      });
      
      // Create a download link
      const link = document.createElement('a');
      link.download = `cleros-oracle-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      showFeedback('✅ Image saved to downloads');
    } catch (error) {
      console.error('Failed to save as image:', error);
      showFeedback('❌ Failed to save image');
    }
  };

  const generateCardText = (): string => {
    const currentTitle = currentOption.corpus === 'hymns' 
      ? formatTitle(currentOption.content.sectionTitle)
      : currentOption.content.sectionTitle;
    const incense = currentOption.metadata?.incense?.english;
    const lineRange = getLineRange(currentOption.corpus);
    const timestamp = new Date(response.timestamp).toLocaleDateString();
    
    let cardText = 'cleros | digital bibliomancy\n\n';
    
    cardText += `"${response.query}"\n\n`;
    
    // Format: CORPUS • Title, ll. X-Y • incense
    let titleLine = `${currentOption.corpus.toUpperCase()} • ${currentTitle}`;
    if (lineRange) {
      titleLine += `, ${lineRange}`;
    }
    if (incense) {
      titleLine += ` • ${incense}`;
    }
    cardText += `${titleLine}\n\n`;
    
    cardText += `${capitalizeFirst(currentOption.content.text)}\n\n`;
    
    cardText += `${timestamp}\n`;
    cardText += 'cleros.gbe.games';
    
    return cardText;
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      style={{
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
      }}
    >
      <div 
        style={{
          backgroundColor: '#111',
          border: '1px solid #333',
          borderRadius: '12px',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#e0e0e0'
        }}
      >
        {/* Header */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '24px',
            borderBottom: '1px solid #333',
            flexShrink: 0
          }}
        >
          <h2 
            style={{
              fontSize: '1.2rem',
              fontWeight: 'normal',
              color: '#e0e0e0',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              margin: 0
            }}
          >
            Share Oracle Card
          </h2>
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
        </div>

        {/* Feedback Message */}
        {feedbackMessage && (
          <div 
            style={{
              padding: '12px 24px',
              backgroundColor: feedbackMessage.includes('❌') ? '#2d1b1b' : '#1b2d1b',
              borderBottom: '1px solid #333',
              color: feedbackMessage.includes('❌') ? '#ff9999' : '#99ff99',
              fontSize: '0.9rem',
              textAlign: 'center',
              fontWeight: '500',
              flexShrink: 0
            }}
          >
            {feedbackMessage}
          </div>
        )}

        {/* Scrollable Content */}
        <div 
          style={{ 
            flex: 1,
            overflow: 'auto',
            borderBottom: '1px solid #333'
          }}
        >
          <div style={{ padding: '24px' }}>
          {/* Carousel Controls - Only show if multiple options */}
          {options.length > 1 && (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}
            >
              <button
                onClick={prevOption}
                style={{
                  background: 'transparent',
                  border: '1px solid #a0a0a066',
                  color: '#a0a0a0',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#ffffff';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#a0a0a066';
                  e.currentTarget.style.color = '#a0a0a0';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ← Previous
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {options.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToOption(index)}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: index === currentIndex ? '#9370db' : '#333',
                      transition: 'all 0.2s ease'
                    }}
                  />
                ))}
              </div>
              
              <button
                onClick={nextOption}
                style={{
                  background: 'transparent',
                  border: '1px solid #a0a0a066',
                  color: '#a0a0a0',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#ffffff';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#a0a0a066';
                  e.currentTarget.style.color = '#a0a0a0';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Next →
              </button>
            </div>
          )}

          {/* Option Info */}
          {options.length > 1 && (
            <div 
              style={{
                fontSize: '0.85rem',
                color: '#a0a0a0',
                marginBottom: '16px',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              {currentOption.corpus.toUpperCase()}
              ({currentIndex + 1} of {options.length})
            </div>
          )}

          {/* Use the actual ShareCard component as preview */}
          <div style={{ 
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <ShareCard 
              response={response}
              currentOption={currentOption}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div 
          style={{
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            flexShrink: 0
          }}
        >
          <button
            onClick={copyImageToClipboard}
            style={{
              padding: '8px 12px',
              backgroundColor: '#9370db',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#8a63d2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#9370db';
            }}
          >
            Copy Image
          </button>
          <button
            onClick={saveAsImage}
            style={{
              background: 'transparent',
              border: '1px solid #a0a0a066',
              color: '#a0a0a0',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#ffffff';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#a0a0a066';
              e.currentTarget.style.color = '#a0a0a0';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Save Image
          </button>
          <button
            onClick={copyToClipboard}
            style={{
              background: 'transparent',
              border: '1px solid #a0a0a066',
              color: '#a0a0a0',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#ffffff';
              e.currentTarget.style.color = '#ffffff';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#a0a0a066';
              e.currentTarget.style.color = '#a0a0a0';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Copy Text
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #a0a0a033',
              color: '#a0a0a0',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#a0a0a066';
              e.currentTarget.style.color = '#e0e0e0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#a0a0a033';
              e.currentTarget.style.color = '#a0a0a0';
            }}
          >
            Close
          </button>
        </div>
        </div>
      </div>

    </div>,
    document.body
  );
};

export default ShareDialog;
