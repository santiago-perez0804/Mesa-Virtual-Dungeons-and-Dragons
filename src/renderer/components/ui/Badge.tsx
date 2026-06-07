import React from 'react';

interface BadgeProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ label, value, icon }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'var(--bg-raised)',
      border: '1px solid var(--border-normal)',
      borderRadius: 'var(--radius-sm)',
      padding: '4px 8px',
      minWidth: '40px'
    }}>
      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '2px' }}>
        {icon}
        {label}
      </span>
      <span className="mono" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
        {value}
      </span>
    </div>
  );
};
