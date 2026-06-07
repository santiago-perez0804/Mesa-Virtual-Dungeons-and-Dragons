import React, { useState } from 'react';
import { Chip } from './Chip';

interface ProfileCardProps {
  profile?: any;
  isNew?: boolean;
  isSelected?: boolean;
  onClick: () => void;
  getProfileIcon?: (profile: any) => React.ReactNode;
}

export function ProfileCard({ profile, isNew, isSelected, onClick, getProfileIcon }: ProfileCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    width: '160px',
    padding: '20px',
    transition: 'all 0.3s ease',
    background: isHovered || isSelected ? 'var(--bg-raised)' : 'var(--bg-surface)',
    border: isSelected 
      ? '2px solid var(--gold-primary)' 
      : `1px ${isNew ? 'dashed' : 'solid'} ${isHovered ? 'var(--border-gold-active)' : 'var(--border-gold-subtle)'}`,
    opacity: isNew && !isHovered ? 0.4 : 1,
  };

  if (isNew) {
    return (
      <div
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="clipped-frame"
        style={baseStyle}
      >
        <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
          +
        </div>
        <span className="font-cinzel" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>NUEVO HÉROE</span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="clipped-frame"
      style={baseStyle}
    >
      <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', overflow: 'hidden' }}>
        {getProfileIcon && getProfileIcon(profile)}
      </div>
      <span className="font-cinzel" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
        {profile.username}
      </span>
      <Chip label={profile.role} variant={profile.role as any} />
    </div>
  );
}
