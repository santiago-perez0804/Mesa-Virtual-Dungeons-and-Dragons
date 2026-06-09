import React, { useEffect, useState } from 'react';

export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
  primary?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const [safePos, setSafePos] = useState({ x, y });

  useEffect(() => {
    // We adjust position to ensure it stays on screen after render if needed,
    // but a simple approximation works for now
    const safeX = Math.min(x, window.innerWidth - 200);
    const safeY = Math.min(y, window.innerHeight - (items.length * 40 + 20));
    setSafePos({ x: safeX, y: safeY });
  }, [x, y, items]);

  return (
    <>
      <div 
        style={{ position: 'fixed', inset: 0, zIndex: 999 }} 
        onClick={onClose} 
        onContextMenu={(e) => { e.preventDefault(); onClose(); }} 
      />
      <div
        style={{
          position: 'fixed',
          left: safePos.x,
          top: safePos.y,
          zIndex: 1000,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-gold-subtle)',
          borderRadius: 'var(--radius-lg)',
          minWidth: '180px',
          padding: '8px 0',
          boxShadow: 'var(--shadow-modal)',
          animation: 'fadeInUp 0.15s ease-out'
        }}
      >
        {items.map((item, idx) => (
          <div key={idx}>
            <div
              onClick={() => { item.onClick(); onClose(); }}
              style={{
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                color: item.destructive ? 'var(--hp-low)' : (item.primary ? 'var(--gold-primary)' : 'var(--text-primary)'),
                fontSize: '0.9rem',
                fontWeight: 500,
                transition: 'background 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = item.destructive ? 'rgba(192, 57, 43, 0.1)' : 'var(--bg-raised)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {item.icon && <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>}
              {item.label}
            </div>
            {idx < items.length - 1 && (
              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />
            )}
          </div>
        ))}
      </div>
    </>
  );
};
