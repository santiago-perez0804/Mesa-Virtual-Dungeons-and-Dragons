import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  height?: number;
  showText?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, height = 5, showText = false }) => {
  const percentage = Math.max(0, Math.min(100, (value / (max || 1)) * 100));
  
  let color = 'var(--hp-full)';
  if (percentage < 30) color = 'var(--hp-low)';
  else if (percentage <= 60) color = 'var(--hp-mid)';

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {showText && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          <span>HP</span>
          <span className="mono">{value} / {max}</span>
        </div>
      )}
      <div style={{
        width: '100%',
        height: `${height}px`,
        background: 'var(--bg-void)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: color,
          transition: 'width 0.3s ease, background-color 0.3s ease',
          boxShadow: `0 0 10px ${color}80`
        }} />
      </div>
    </div>
  );
};
