export function LoadingScreen() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'radial-gradient(circle, #1e1b15 0%, #0d0c09 100%)',
      color: 'var(--accent-gold)'
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.03); }
        }
      `}</style>
      <div className="font-cinzel" style={{ fontSize: '2.5rem', marginBottom: '20px', textShadow: '0 0 20px rgba(200,135,42,0.4)', animation: 'pulse 1.8s ease-in-out infinite', fontWeight: 'bold' }}>
        D&D PP
      </div>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        border: '3px solid rgba(200,135,42,0.15)',
        borderTopColor: 'var(--accent-gold)',
        animation: 'spin 0.8s linear infinite',
        boxShadow: '0 0 10px rgba(200, 135, 42, 0.2)'
      }} />
      <span className="font-cinzel" style={{ fontSize: '0.8rem', marginTop: '15px', color: 'var(--text-secondary)', letterSpacing: '3px', opacity: 0.7 }}>
        INICIANDO MESA...
      </span>
    </div>
  );
}
