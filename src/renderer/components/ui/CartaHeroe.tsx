import React from 'react';
import { ProgressBar } from './BarraProgreso';

interface HeroCardProps {
  character: any;
  onClick?: () => void;
}

export const HeroCard: React.FC<HeroCardProps> = ({ character, onClick }) => {
  const stats = typeof character.stats === 'string' ? JSON.parse(character.stats) : (character.stats || {});
  
  const getEffectiveStat = (statKey: string) => {
    const baseVal = stats[statKey] || 10;
    const mods = stats[`custom_${statKey}_modifiers`] || [];
    const customSum = mods.reduce((acc: number, m: any) => acc + m.value, 0);
    return baseVal + customSum;
  };

  const statList = [
    { label: 'STR', value: getEffectiveStat('fue') },
    { label: 'DEX', value: getEffectiveStat('dex') },
    { label: 'CON', value: getEffectiveStat('con') },
    { label: 'INT', value: getEffectiveStat('int') },
    { label: 'WIS', value: getEffectiveStat('sab') },
    { label: 'CHA', value: getEffectiveStat('car') }
  ];

  return (
    <div
      onClick={onClick}
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        cursor: 'pointer',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-normal)',
        borderRadius: 'var(--radius-lg)',
        transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px var(--gold-muted)';
        e.currentTarget.style.borderColor = 'var(--gold-primary)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--border-normal)';
      }}
    >
      {/* 3. Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--gold-primary)', overflow: 'hidden', background: 'var(--bg-raised)', flexShrink: 0 }}>
          {character.avatar || character.image ? (
            <img src={character.avatar || character.image} alt={character.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
              {character.name?.[0]}
            </div>
          )}
        </div>
        
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div className="font-cinzel" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {character.name}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Nivel {character.level || 1} • {character.class || 'Clase'}
          </div>
        </div>
      </div>

      {/* 4. Stats simplificados en grid 3x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: 'var(--bg-base)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
        {statList.map(s => (
          <div key={s.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-raised)', borderRadius: 'var(--radius-sm)', padding: '4px 0' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '0.5px' }}>{s.label}</span>
            <span className="mono" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* 5. Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <ProgressBar value={character.hp || 10} max={character.max_hp || 10} height={6} showText={true} />
        </div>
        {character.teamColor && (
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: character.teamColor, border: '1px solid var(--border-normal)', flexShrink: 0, alignSelf: 'flex-end', marginBottom: '4px' }} title="Equipo" />
        )}
      </div>
    </div>
  );
};
