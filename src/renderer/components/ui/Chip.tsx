import React from 'react';

interface ChipProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'dm' | 'player' | 'admin';
  icon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({ label, variant = 'default', icon }) => {
  const getStyles = () => {
    switch (variant?.toLowerCase()) {
      case 'dm': return { background: 'rgba(201,162,39,0.15)', color: 'var(--gold-primary)', border: '1px solid rgba(201,162,39,0.3)' };
      case 'player': return { background: 'rgba(41,128,185,0.15)', color: '#5dade2', border: '1px solid rgba(41,128,185,0.3)' };
      case 'admin': return { background: 'rgba(192,57,43,0.15)', color: '#e74c3c', border: '1px solid rgba(192,57,43,0.3)' };
      case 'success': return { background: 'rgba(39, 174, 96, 0.15)', color: '#2ecc71', border: '1px solid rgba(39, 174, 96, 0.3)' };
      case 'warning': return { background: 'rgba(230, 126, 34, 0.15)', color: '#e67e22', border: '1px solid rgba(230, 126, 34, 0.3)' };
      case 'danger': return { background: 'rgba(192, 57, 43, 0.15)', color: '#e74c3c', border: '1px solid rgba(192, 57, 43, 0.3)' };
      case 'info': return { background: 'rgba(41, 128, 185, 0.15)', color: '#3498db', border: '1px solid rgba(41, 128, 185, 0.3)' };
      default: return { background: 'var(--bg-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border-normal)' };
    }
  };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
      ...getStyles()
    }}>
      {icon}
      {label}
    </span>
  );
};
