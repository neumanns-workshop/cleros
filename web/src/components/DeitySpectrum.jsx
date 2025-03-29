import React, { useEffect, useState } from 'react';
import { useDeityContext } from '../context/DeityContext';
import { analyzeDeityCategories, generateSpectrumGradient } from '../utils/categoryAnalysis';

// Component that displays a spectral analysis of deity categories
const DeitySpectrum = ({ height = 30, showLabels = true, showCounts = true, className = '' }) => {
  const { classifications, loading } = useDeityContext();
  const [spectralData, setSpectralData] = useState([]);
  const [gradientStyle, setGradientStyle] = useState('');

  useEffect(() => {
    if (!loading && classifications.length > 0) {
      const data = analyzeDeityCategories(classifications);
      setSpectralData(data);
      setGradientStyle(generateSpectrumGradient(data));
    }
  }, [loading, classifications]);

  if (loading || !spectralData.length) {
    return <div className={`deity-spectrum-loading ${className}`}>Loading spectrum data...</div>;
  }

  return (
    <div className={`deity-spectrum-container ${className}`}>
      <div 
        className="deity-spectrum-bar"
        style={{ 
          height: `${height}px`,
          background: gradientStyle,
          borderRadius: '4px'
        }}
      />
      
      {showLabels && (
        <div className="deity-spectrum-labels">
          {spectralData.map((data) => (
            <div key={data.category} className="deity-spectrum-label">
              <span 
                className={`deity-label-color`} 
                style={{ backgroundColor: `var(--deity-${data.category.toLowerCase()}-color)` }}
              />
              <span className="deity-label-text">
                {data.category}
                {showCounts && (
                  <span className="deity-label-count"> ({data.count}, {data.percentage.toFixed(1)}%)</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeitySpectrum; 