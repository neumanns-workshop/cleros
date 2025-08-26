import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { ConsultationResponse } from '../../types/oracle';
import { formatTitle } from '../../utils/stringUtils';

interface ShareCardOption {
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
}

interface ShareCardProps {
  response: ConsultationResponse;
  currentOption: ShareCardOption;
}

const ShareCard: React.FC<ShareCardProps> = React.memo(({ response, currentOption }) => {
  const cardId = 'share-card-render-target'; // ID for html2canvas
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Capitalize first letter of sentence
  const capitalizeFirst = (text: string): string => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // Get line range from original response data
  const getLineRange = (corpus: string): string | null => {
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

  // Generate QR code
  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL('https://cleros.gbe.games', {
          width: 80,
          margin: 1,
          color: {
            dark: '#333333',
            light: '#1a1a1a'
          }
        });
        setQrCodeUrl(url);
      } catch (error) {
        console.error('Failed to generate QR code:', error);
      }
    };
    generateQR();
  }, []);

  // Simple date formatter
  const formatTimestamp = (timestamp: number): string => {
    try {
      return new Date(timestamp).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
            } catch {
      return 'Invalid Date';
    }
  };





  // Prepare display data
  const incense = currentOption.metadata?.incense?.english;

  return (
    // ShareCard component for display and image capture
    <div
      id={cardId}
      data-testid="share-card-render-target"
      style={{
        width: '500px',
        maxWidth: '100%',
        backgroundColor: '#242830', // Card background
        color: '#f5f4f0', // Primary text color
        padding: '24px',
        borderRadius: '8px',
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        textAlign: 'center' as const,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        border: '1px solid #a8a8a833'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}
        >
          <h1 
            style={{ 
              color: '#f5f4f0',
              fontSize: '1.5rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              margin: 0
            }}
          >
            cleros
          </h1>
          <span 
            style={{
              color: '#a8a8a8',
              fontSize: '1rem',
              fontWeight: 300,
              letterSpacing: '0.08em',
              opacity: 0.8
            }}
          >
            | digital bibliomancy
          </span>
        </div>
        <div 
          style={{
            height: '1px',
            backgroundColor: '#a8a8a833',
            margin: '16px 0'
          }}
        />
      </div>

      {/* Query */}
      <div 
        style={{ 
          color: '#a8a8a8',
          fontStyle: 'italic',
          fontSize: '0.9rem',
          marginBottom: '18px',
          opacity: 0.8,
          fontWeight: 300
        }}
      >
        "{response.query}"
      </div>

      {/* Content Header - Current selection title */}
      <div style={{ marginBottom: '12px' }}>
        {/* Top bar */}
        <div 
          style={{
            height: '1px',
            backgroundColor: '#a8a8a833',
            width: '15%',
            minWidth: '40px',
            maxWidth: '60px',
            margin: '0 auto 9px auto'
          }}
        />
        <div 
          style={{ 
            color: '#a8a8a8',
            fontSize: '0.85rem',
            fontWeight: '500',
            lineHeight: 1.4,
            margin: '0 0 9px 0',
            letterSpacing: '0.02em'
          }}
        >
          {/* Corpus */}
          <span style={{ textTransform: 'uppercase', fontWeight: '500' }}>
            {currentOption.corpus}
          </span>
          <span style={{ margin: '0 8px', color: '#a8a8a8' }}>•</span>
          {/* Title and line info */}
          {currentOption.corpus === 'hymns' 
            ? formatTitle(currentOption.content.sectionTitle)
            : currentOption.content.sectionTitle}
          {getLineRange(currentOption.corpus) && (
            <>
              <span style={{ color: '#a8a8a8' }}>,</span>
              <span style={{ margin: '0 0 0 4px', color: '#a8a8a8' }}>
                {getLineRange(currentOption.corpus)}
              </span>
            </>
          )}
          {incense && (
            <>
              <span style={{ margin: '0 8px' }}>•</span>
              <span style={{ fontWeight: 'normal' }}>{incense}</span>
            </>
          )}
        </div>
        {/* Bottom bar */}
        <div 
          style={{
            height: '1px',
            backgroundColor: '#a8a8a833',
            width: '15%',
            minWidth: '40px',
            maxWidth: '60px',
            margin: '0 auto 12px auto'
          }}
        />
      </div>

      {/* Main Quote */}
       <div style={{ position: 'relative', marginBottom: '18px' }}>

         <div 
           style={{ 
             color: '#f0f0f0',
             fontSize: '1.125rem',
             lineHeight: 1.6,
             padding: '0 8px',
             wordWrap: 'break-word',
             overflowWrap: 'break-word',
             hyphens: 'auto',
             position: 'relative',
             zIndex: 2,
             marginBottom: '24px',
             fontWeight: 400
           }}
         >
           {capitalizeFirst(currentOption.content.text)}
         </div>
       </div>



      {/* Footer */}
      <div style={{ marginTop: '50px', position: 'relative' }}>
        <div 
          style={{
            position: 'absolute',
            bottom: '25px',
            left: '15%',
            right: '15%',
            height: '1px',
            backgroundColor: '#333'
          }}
        />
        {/* Orphic Egg - bottom left */}
        <div 
                      style={{
              position: 'absolute',
              bottom: '-17.5px',
              left: '-20px',
              width: '85px',
              height: '85px',
              opacity: 0.9,
              zIndex: 1
            }}
        >
          <img 
            src="/orphic-egg.png" 
            alt="Orphic Egg" 
            crossOrigin="anonymous"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </div>
        
        <div 
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '24px'
          }}
        >
          <div 
            style={{ 
              color: '#888888',
              fontSize: '0.7rem',
              fontWeight: 300
            }}
          >
            {formatTimestamp(response.timestamp)}
          </div>
          <div style={{ color: '#666', fontSize: '0.7rem' }}>•</div>
          <div 
            style={{ 
              color: '#888888',
              fontSize: '0.7rem',
              fontWeight: 300
            }}
          >
            cleros.gbe.games
          </div>
        </div>
        {/* QR Code */}
        {qrCodeUrl && (
          <img
            src={qrCodeUrl}
            alt="QR Code for cleros.gbe.games"
            style={{
              position: 'absolute',
              bottom: '0px',
              right: '0px',
              width: '50px',
              height: '50px',
              opacity: 0.8
            }}
          />
        )}
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';

export default ShareCard;
