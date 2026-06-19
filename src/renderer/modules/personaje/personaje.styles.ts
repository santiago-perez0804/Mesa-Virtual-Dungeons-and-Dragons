export const characterManagerStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '40px',
    color: 'var(--text-parchment)',
    width: '100%',
    paddingBottom: '100px'
  },
  card: {
    background: 'var(--bg-surface)',
    padding: '40px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
  },
  input: {
    padding: 'var(--search-input-padding)',
    background: 'var(--bg-base)',
    border: '1px solid var(--border-color)',
    borderRadius: '2px',
    color: 'white',
    width: '100%',
    boxSizing: 'border-box' as const,
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  statLabel: {
    fontSize: '0.9rem',
    color: 'var(--accent-gold)',
    fontWeight: 'bold' as const,
    marginBottom: '6px',
    display: 'block',
    letterSpacing: '1px'
  }
};
