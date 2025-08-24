import { useSemanticSimilarity } from '../services/clientSemanticScorer';
import { OracleResponse, CounselResponse } from '../types/oracle';

interface LineData {
  isMarker?: boolean;
  english?: string;
  isHeader?: boolean;
  sourceLink?: any; // Keeping any for now as its shape is complex
  line?: number | string;
}

interface OracleLineProps {
  lineData: LineData;
  oracleResponse: OracleResponse | CounselResponse | null;
  onNavigate: (sourceLink: any) => void;
  onLineClick: (lineData: LineData) => void;
}

const OracleLine = ({ lineData, oracleResponse, onNavigate, onLineClick }: OracleLineProps) => {
    const { isHeader, sourceLink } = lineData;
    
    // Determine if this is a Counsel response (semantic) vs Oracle response (random)
    const isCounselMode = oracleResponse && 'searchSource' in oracleResponse && oracleResponse.searchSource === 'semantic';

    // Use the hook to get dynamic style for Counsel mode only
    const transparencyStyle = useSemanticSimilarity(
        sourceLink?.corpus,
        lineData,
        isCounselMode ? oracleResponse : null  // Only apply semantic analysis for Counsel mode
    );

    // If the line is a marker or the entire text is enclosed in brackets, don't render it
    if (lineData.isMarker || (lineData.english?.trim().startsWith('[') && lineData.english?.trim().endsWith(']'))) {
        return null;
    }
    
    const handleLineClick = () => {
        if (isHeader && sourceLink) {
            // Headers with sourceLink navigate directly
            onNavigate(sourceLink);
        } else if (onLineClick && !isHeader) {
            // Regular lines open modal
            onLineClick(lineData);
        }
    };

    const lineStyle = {
        ...(isCounselMode && !isHeader ? transparencyStyle : {}),  // Only apply semantic styles for Counsel mode
        ...(isHeader ? {
            fontWeight: 'bold',
            fontSize: '1.1rem',
            color: '#ffffff',
            backgroundColor: '#2a2a2a',
            borderLeft: '4px solid #9370db',
            ...(sourceLink ? { cursor: 'pointer' } : {})
        } : {}),
        // No visual highlighting - clean and minimal
        ...(typeof onLineClick === 'function' && !isHeader ? {
            cursor: 'pointer'
        } : {})
    };

    return (
        <div
            className={`text-line ${isHeader ? 'section-header' : ''}`}
            onClick={handleLineClick}
            style={lineStyle}
        >
            <span className="line-number" style={{ opacity: isHeader ? 0 : 1 }}>
                {isHeader ? '' : lineData.line}
            </span>
            <span className="line-text">
                {lineData.english}
            </span>
        </div>
    );
};

export default OracleLine;
