import { useState, useEffect, useCallback } from 'react';

export const KofiButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  return (
    <>
      <button
        onClick={open}
        aria-label="Support Cleros on Ko-fi"
        style={{
          position: 'fixed',
          bottom: '1.5em',
          right: '1.5em',
          zIndex: 9999,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4em',
          padding: '0.5em 1em',
          font: "600 clamp(0.7rem, 1.4vw, 0.85rem) / 1.4 -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          color: '#fff',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '2em',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
      >
        <img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="" style={{ height: '1.2em', width: 'auto' }} />
        Support Us
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Support Cleros on Ko-fi"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            display: 'flex',
            background: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <div style={{
            position: 'relative',
            width: 'min(90vw, 420px)',
            height: 'min(80vh, 700px)',
            borderRadius: '1em',
            overflow: 'hidden',
            background: '#fff',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <button
              onClick={close}
              aria-label="Close donation dialog"
              style={{
                position: 'absolute',
                top: '0.4em',
                right: '0.6em',
                zIndex: 1,
                background: 'none',
                border: 'none',
                fontSize: '1.4em',
                cursor: 'pointer',
                color: '#666',
                lineHeight: 1
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#000'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
            >
              &times;
            </button>
            <iframe
              src="https://ko-fi.com/neumannsworkshop/?hidefeed=true&widget=true&embed=true"
              title="Support Cleros on Ko-fi"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        </div>
      )}
    </>
  );
};
