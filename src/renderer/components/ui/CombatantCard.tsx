import React from 'react';
import { ProgressBar } from './ProgressBar';
import { Skull } from 'lucide-react';

interface CombatantCardProps extends React.HTMLAttributes<HTMLDivElement> {
  token: any;
  isActive?: boolean;
  showHp?: boolean;
  showAc?: boolean;
  customOverlay?: React.ReactNode;
  tempHp?: number;
  onHpClick?: (e: React.MouseEvent) => void;
  hpLabel?: React.ReactNode;
  initiativeBadge?: React.ReactNode;
}

export const CombatantCard: React.FC<CombatantCardProps> = ({
  token,
  isActive = false,
  showHp = true,
  showAc = true,
  customOverlay,
  tempHp = 0,
  onHpClick,
  hpLabel,
  className = '',
  style = {},
  ...props
}) => {
  const isDefeated = token.hp <= 0;
  const hpPercentage = token.hp / (token.max_hp || 1);
  const hpColor = hpPercentage < 0.3 ? 'var(--hp-low)' : (hpPercentage <= 0.6 ? 'var(--hp-mid)' : 'var(--hp-full)');

  return (
    <div
      {...props}
      className={`clipped-frame torch-glow ${isActive ? 'active' : ''} ${className}`}
      style={{
        padding: '12px',
        border: isActive ? '1px solid var(--gold-primary)' : '1px solid var(--border-normal)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        background: isActive ? 'rgba(201, 162, 39, 0.1)' : 'var(--bg-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        position: 'relative',
        ...style
      }}
    >
      {/* 1. Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ position: 'relative', width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', border: `1px solid ${token.teamColor || 'var(--border-subtle)'}`, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-raised)' }}>
          {token.image ? (
            <img src={token.image} alt={token.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isDefeated ? 'grayscale(100%)' : 'none' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '10px', color: 'var(--text-secondary)' }}>
              {token.name?.[0]}
            </div>
          )}
          {isDefeated && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
              <Skull color="var(--hp-low)" size={14} />
            </div>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: '6px', overflow: 'hidden' }}>
          <span style={{ color: isDefeated ? 'var(--text-secondary)' : 'var(--text-primary)', fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {token.name}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {token.type === 'character' ? 'Héroe' : 'Criatura'}
          </span>
        </div>

        {/* BADGE iniciativa -> inyectado via prop */}
        {props.initiativeBadge}
      </div>

      {/* 2. HP row */}
      {showHp && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: onHpClick ? 'pointer' : 'default' }} onClick={onHpClick}>
          <div style={{ flex: 1 }}>
            <ProgressBar value={token.hp} max={token.max_hp} height={5} />
          </div>
          <div className="mono" style={{ fontSize: '11px', fontWeight: 'bold', color: hpColor }}>
            {hpLabel || `${token.hp} / ${token.max_hp}`}
          </div>
        </div>
      )}

      {/* 3. Dots de equipo */}
      {token.teamColor && (
        <div style={{ position: 'absolute', top: '16px', right: '-4px', width: '8px', height: '8px', borderRadius: '50%', background: token.teamColor, border: '1px solid var(--bg-surface)' }} />
      )}
      
      {customOverlay}
    </div>
  );
};
