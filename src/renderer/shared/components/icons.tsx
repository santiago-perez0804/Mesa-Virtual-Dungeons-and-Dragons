import React from 'react';

export const NoteTokenIcon = () => (
  <svg viewBox="0 0 64 64" style={{ width: '100%', height: '100%', display: 'block' }}>
    <rect x="12" y="8" width="40" height="48" rx="3" fill="#ecd5b0" stroke="#5c4327" strokeWidth="2.5" />
    <path d="M 12 18 L 52 18" stroke="#5c4327" strokeWidth="1.5" />
    <line x1="18" y1="26" x2="46" y2="26" stroke="#8c6d4f" strokeWidth="2" strokeDasharray="3 3" />
    <line x1="18" y1="34" x2="46" y2="34" stroke="#8c6d4f" strokeWidth="2" strokeDasharray="3 3" />
    <line x1="18" y1="42" x2="36" y2="42" stroke="#8c6d4f" strokeWidth="2" strokeDasharray="3 3" />
    <circle cx="44" cy="44" r="4" fill="#9b2c2c" stroke="#5f1d1d" strokeWidth="1" />
  </svg>
);

export const ImageTokenIcon = () => (
  <svg viewBox="0 0 64 64" style={{ width: '100%', height: '100%', display: 'block' }}>
    <rect x="8" y="8" width="48" height="48" rx="4" fill="#2d3748" stroke="#b7791f" strokeWidth="2.5" />
    <rect x="12" y="12" width="40" height="40" fill="#1a202c" />
    <path d="M 14 44 L 26 30 L 34 38 L 42 32 L 50 44 Z" fill="#2b6cb0" opacity="0.8" />
    <circle cx="22" cy="20" r="3.5" fill="#ecc94b" />
  </svg>
);

export const ClosedChestIcon = () => (
  <svg viewBox="0 0 64 64" style={{ width: '100%', height: '100%', display: 'block' }}>
    <rect x="8" y="26" width="48" height="30" rx="3" fill="#5c3a21" stroke="#2b1a0f" strokeWidth="2.5" />
    <path d="M 8 26 C 8 12, 56 12, 56 26 Z" fill="#784c2b" stroke="#2b1a0f" strokeWidth="2.5" />
    <rect x="18" y="14" width="6" height="42" fill="#4a5568" stroke="#1a202c" strokeWidth="1" />
    <rect x="40" y="14" width="6" height="42" fill="#4a5568" stroke="#1a202c" strokeWidth="1" />
    <circle cx="21" cy="26" r="1.5" fill="#ecc94b" />
    <circle cx="43" cy="26" r="1.5" fill="#ecc94b" />
    <circle cx="21" cy="45" r="1.5" fill="#ecc94b" />
    <circle cx="43" cy="45" r="1.5" fill="#ecc94b" />
    <rect x="28" y="24" width="8" height="10" rx="1.5" fill="#ecc94b" stroke="#744210" strokeWidth="1" />
    <circle cx="32" cy="28" r="1.8" fill="#000" />
    <path d="M 32 30 L 32 33" stroke="#000" strokeWidth="1.5" />
  </svg>
);

export const OpenChestIcon = () => (
  <svg viewBox="0 0 64 64" style={{ width: '100%', height: '100%', display: 'block' }}>
    <path d="M 8 20 C 8 8, 56 8, 56 20 Z" fill="#4a301c" stroke="#1c110a" strokeWidth="2" transform="translate(0, -10) scale(1, 0.8)" />
    <rect x="18" y="0" width="6" height="12" fill="#2d3748" stroke="#1a202c" />
    <rect x="40" y="0" width="6" height="12" fill="#2d3748" stroke="#1a202c" />
    <ellipse cx="32" cy="24" rx="20" ry="7" fill="rgba(214, 158, 46, 0.6)" filter="blur(3px)" />
    <rect x="8" y="26" width="48" height="30" rx="3" fill="#5c3a21" stroke="#2b1a0f" strokeWidth="2.5" />
    <rect x="18" y="26" width="6" height="30" fill="#4a5568" stroke="#1a202c" strokeWidth="1" />
    <rect x="40" y="26" width="6" height="30" fill="#4a5568" stroke="#1a202c" strokeWidth="1" />
    <circle cx="20" cy="28" r="4.5" fill="#ecc94b" />
    <circle cx="28" cy="27" r="5" fill="#ecc94b" />
    <circle cx="36" cy="28" r="4.5" fill="#d69e2e" />
    <circle cx="44" cy="27" r="5" fill="#ecc94b" />
    <circle cx="24" cy="29" r="4" fill="#d69e2e" />
    <circle cx="32" cy="29" r="4" fill="#d69e2e" />
    <circle cx="40" cy="29" r="4" fill="#d69e2e" />
    <polygon points="26,26 29,23 32,26 29,29" fill="#e53e3e" />
    <polygon points="34,25 36,22 38,25 36,28" fill="#3182ce" />
    <polygon points="21,29 23,27 25,29 23,31" fill="#38a169" />
    <polygon points="41,28 43,26 45,28 43,30" fill="#805ad5" />
  </svg>
);

export const ItemDropIcon = ({ rarity }: { rarity: string }) => {
  let color = '#a0aec0';
  const r = String(rarity || 'Común').toLowerCase();
  if (r.includes('raro') || r.includes('rare') || r.includes('muy')) {
    if (r.includes('muy') || r.includes('very')) {
      color = '#a855f7';
    } else {
      color = '#3b82f6';
    }
  } else if (r.includes('legend') || r.includes('leyen')) {
    color = '#f59e0b';
  } else if (r.includes('poco') || r.includes('uncom')) {
    color = '#10b981';
  }

  return (
    <svg viewBox="0 0 64 64" style={{ width: '100%', height: '100%', display: 'block' }}>
      <circle cx="32" cy="32" r="26" fill="none" stroke={color} strokeWidth="2.5" strokeDasharray="5 4" style={{ opacity: 0.85, filter: 'drop-shadow(0 0 4px ' + color + ')' }} />
      <circle cx="32" cy="32" r="20" fill={color} style={{ opacity: 0.15, filter: 'blur(4px)' }} />
      <path d="M 22 46 C 22 52, 42 52, 42 46 C 42 36, 38 34, 38 27 C 38 23, 40 21, 38 17 C 36 13, 28 13, 26 17 C 24 21, 26 23, 26 27 C 26 34, 22 36, 22 46 Z" fill="#a0522d" stroke="#5c2e16" strokeWidth="2.5" />
      <ellipse cx="32" cy="27" rx="7" ry="2" fill="#ecc94b" stroke="#b7791f" strokeWidth="1" />
      <path d="M 26 37 L 38 37" stroke="#5c2e16" strokeWidth="1.5" opacity="0.4" />
      <path d="M 29 44 L 35 44" stroke="#5c2e16" strokeWidth="1.5" opacity="0.4" />
      <polygon points="14,20 16,16 18,20 16,24" fill={color} opacity="0.9" />
      <polygon points="48,42 50,38 52,42 50,46" fill={color} opacity="0.9" />
      <polygon points="44,17 45,14 46,17 45,20" fill="#fff" opacity="0.8" />
    </svg>
  );
};

export const CompassIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="m12 3-8 18M12 3l8 18M12 3v9M7 15h10" />
  </svg>
);

export const LineAoeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <line x1="19" y1="5" x2="5" y2="19" />
    <line x1="14" y1="5" x2="19" y2="10" />
    <line x1="9" y1="10" x2="14" y2="15" />
    <line x1="5" y1="14" x2="10" y2="19" />
  </svg>
);

export const ConeAoeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <path d="M12 3L4 21h16L12 3z" />
  </svg>
);

export const CircleAoeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <circle cx="12" cy="12" r="9" />
  </svg>
);

export const SquareAoeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

export const getAoeIcon = (shape: string | null) => {
  switch (shape) {
    case 'line': return <LineAoeIcon />;
    case 'cone': return <ConeAoeIcon />;
    case 'circle': return <CircleAoeIcon />;
    case 'cube': return <SquareAoeIcon />;
    default: return <CompassIcon />;
  }
};
