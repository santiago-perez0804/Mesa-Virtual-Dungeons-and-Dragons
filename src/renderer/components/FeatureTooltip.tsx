import { useState, useEffect, useRef } from 'react';
import { formatDescription } from '../utils/format';

interface FeatureTooltipProps {
  featureName: string;
  description: string;
  shortDescription?: string;
}

export const FeatureTooltip = ({ featureName, description, shortDescription }: FeatureTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggle = () => setIsOpen(prev => !prev);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close on clicking outside container (though clicking outside the fixed modal also closes it via backdrop click)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        // Only close if it wasn't a click inside the fixed modal (which has e.stopPropagation)
        const target = e.target as HTMLElement;
        if (!target.closest('.fixed-modal-content')) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getShortDescFallback = (fullDesc: string): string => {
    if (!fullDesc) return '';
    const clean = fullDesc.replace(/[\r\n]+/g, ' ').trim();
    const firstSentence = clean.split(/[.!?]/)[0];
    if (firstSentence && firstSentence.length > 5 && firstSentence.length < 120) {
      return firstSentence.trim() + '.';
    }
    return clean.substring(0, 95).trim() + '...';
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        display: 'inline-block', 
        position: 'relative',
        margin: '2px 0',
        textAlign: 'left'
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-expanded={isOpen}
        aria-controls={`feature-desc-${featureName.replace(/\s+/g, '-').toLowerCase()}`}
        style={{
          background: 'transparent',
          border: 'none',
          color: isOpen ? 'var(--accent-gold)' : 'var(--text-parchment)',
          cursor: 'pointer',
          padding: '4px 8px',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          fontFamily: 'var(--font-display)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          borderRadius: '4px',
          borderBottom: '1px dashed rgba(200, 135, 42, 0.4)',
          transition: 'all 0.2s ease',
          outline: 'none',
          boxShadow: isOpen ? '0 0 10px rgba(200, 135, 42, 0.15)' : 'none'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(200, 135, 42, 0.08)';
          e.currentTarget.style.color = 'var(--accent-gold)';
        }}
        onMouseOut={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-parchment)';
          }
        }}
      >
        <span>{featureName}</span>
        <span 
          style={{ 
            fontSize: '0.7rem', 
            opacity: 0.7, 
            display: 'inline-block',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          🛈
        </span>
      </button>

      {/* Floating Tooltip (Hover) */}
      {isHovered && !isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            background: 'rgba(22, 18, 14, 0.98)',
            border: '1px solid var(--accent-gold)',
            borderRadius: '6px',
            padding: '8px 12px',
            color: 'var(--text-parchment)',
            fontSize: '0.75rem',
            lineHeight: '1.4',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8), inset 0 0 10px rgba(200, 135, 42, 0.05)',
            zIndex: 99999,
            width: '260px',
            pointerEvents: 'none',
            whiteSpace: 'normal',
            fontFamily: 'var(--font-body)',
            borderLeft: '3px solid var(--accent-gold)'
          }}
        >
          <div style={{ color: 'var(--accent-gold)', fontWeight: 'bold', marginBottom: '4px', fontSize: '0.8rem', fontFamily: 'var(--font-display)' }}>
            {featureName.toUpperCase()}
          </div>
          {shortDescription || getShortDescFallback(description)}
        </div>
      )}

      {/* Centered Premium Overlay Modal (Click) */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            pointerEvents: 'auto'
          }}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        >
          <div
            className="fixed-modal-content clipped-frame"
            style={{
              background: 'linear-gradient(135deg, #1e1a13, #120e0a)',
              border: '2px solid var(--accent-gold)',
              borderRadius: '8px',
              padding: '30px',
              width: '90%',
              maxWidth: '520px',
              color: 'var(--text-parchment)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), inset 0 0 20px rgba(200, 135, 42, 0.1)',
              position: 'relative',
              fontFamily: 'var(--font-body)',
              borderLeft: '4px solid var(--accent-gold)',
              animation: 'scaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '1.2rem',
                transition: 'color 0.2s',
                outline: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-gold)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              title="Cerrar"
            >
              ✕
            </button>
            
            <h3 className="font-cinzel" style={{
              margin: '0 0 15px 0',
              color: 'var(--accent-gold)',
              fontSize: '1.4rem',
              borderBottom: '1px solid rgba(200, 135, 42, 0.2)',
              paddingBottom: '10px',
              letterSpacing: '1px'
            }}>
              {featureName.toUpperCase()}
            </h3>
            
            <div 
              style={{
                lineHeight: '1.7',
                fontSize: '0.95rem',
                maxHeight: '360px',
                overflowY: 'auto',
                paddingRight: '10px',
                color: 'var(--text-parchment)',
                textAlign: 'left'
              }}
              dangerouslySetInnerHTML={{ __html: formatDescription(description) }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
