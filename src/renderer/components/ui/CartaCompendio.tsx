import React from 'react';
import { Chip } from './Chip';
import { BookOpen } from 'lucide-react';

interface CompendiumCardProps {
  title: string;
  subtitle?: string;
  image?: string;
  chips?: { label: string; variant?: any; icon?: React.ReactNode }[];
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

export const CompendiumCard: React.FC<CompendiumCardProps> = ({
  title, subtitle, image, chips = [], onClick, onContextMenu, children
}) => {
  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className="clipped-frame torch-glow"
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-normal)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
      onMouseEnter={e => {
        if (onClick) {
          e.currentTarget.style.background = 'var(--bg-raised)';
          e.currentTarget.style.borderColor = 'var(--gold-primary)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={e => {
        if (onClick) {
          e.currentTarget.style.background = 'var(--bg-surface)';
          e.currentTarget.style.borderColor = 'var(--border-normal)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', flexShrink: 0, borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}>
          {image ? (
            <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <BookOpen color="var(--gold-muted)" size={24} />
          )}
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
          <div className="font-cinzel" style={{ fontSize: '1.1rem', color: 'var(--gold-primary)', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {subtitle}
            </div>
          )}
        </div>

        {chips && chips.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {chips.map((c, i) => <Chip key={i} label={c.label} variant={c.variant} icon={c.icon} />)}
          </div>
        )}
      </div>

      {children && (
        <div style={{ padding: '0 12px 12px 12px' }}>
          {children}
        </div>
      )}
    </div>
  );
};
