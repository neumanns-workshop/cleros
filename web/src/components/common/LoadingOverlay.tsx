interface LoadingOverlayProps {
  isGeneratingOracle: boolean;
  isGeneratingCounsel: boolean;
}

export const LoadingOverlay = ({ isGeneratingOracle, isGeneratingCounsel }: LoadingOverlayProps) => {
  if (!isGeneratingOracle && !isGeneratingCounsel) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      zIndex: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '2px solid transparent',
          borderTop: '2px solid #9370db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }}></div>
        <p style={{ color: 'white', fontSize: '1.2rem', margin: '0 0 8px 0' }}>
          {isGeneratingOracle ? 'Consulting the Oracle...' : 'Seeking Wisdom...'}
        </p>
        <p style={{ color: '#a0a0a0', fontSize: '0.9rem', margin: 0 }}>
          {isGeneratingOracle ? 'The fates are aligning...' : 'Analyzing sacred texts...'}
        </p>
      </div>
    </div>
  );
};