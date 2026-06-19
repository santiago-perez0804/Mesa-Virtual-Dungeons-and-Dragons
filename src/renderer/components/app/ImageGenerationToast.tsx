import { AlertTriangle, Palette } from 'lucide-react';

export type ImageToastState = {
  id: number;
  name: string;
  status: 'generating' | 'ready' | 'failed';
};

export function ImageGenerationToast({ toast }: { toast: ImageToastState }) {
  return (
    <div style={{
      position: 'fixed', bottom: '30px', right: '30px', zIndex: 9998,
      background: toast.status === 'ready'
        ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))'
        : toast.status === 'failed'
        ? 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(185,28,28,0.1))'
        : 'linear-gradient(135deg, rgba(200,135,42,0.15), rgba(161,107,31,0.1))',
      border: `1px solid ${toast.status === 'ready' ? '#10b981' : toast.status === 'failed' ? '#ef4444' : 'var(--accent-gold)'}`,
      borderRadius: '8px', padding: '16px 22px', display: 'flex', alignItems: 'center', gap: '14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
      animation: 'fadeInUp 0.3s ease',
      maxWidth: '320px'
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      {toast.status === 'generating' ? (
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          border: '3px solid rgba(200,135,42,0.3)',
          borderTopColor: 'var(--accent-gold)',
          animation: 'spin 0.8s linear infinite', flexShrink: 0
        }} />
      ) : toast.status === 'ready' ? (
        <Palette size={24} style={{ flexShrink: 0 }} />
      ) : (
        <AlertTriangle size={24} style={{ flexShrink: 0 }} />
      )}
      <div>
        <div className="font-cinzel" style={{
          color: toast.status === 'ready' ? '#10b981' : toast.status === 'failed' ? '#ef4444' : 'var(--accent-gold)',
          fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px'
        }}>
          {toast.status === 'generating' ? 'Generando imagen IA...' : toast.status === 'ready' ? '\u00a1Imagen lista!' : 'Sin imagen (plan gratuito)'}
        </div>
        <div style={{ color: 'var(--text-parchment)', fontSize: '0.85rem', fontWeight: 'bold' }}>
          {toast.name}
        </div>
        {toast.status === 'generating' && (
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginTop: '2px' }}>
            La imagen se agregar\u00e1 autom\u00e1ticamente al guardarse
          </div>
        )}
      </div>
    </div>
  );
}
