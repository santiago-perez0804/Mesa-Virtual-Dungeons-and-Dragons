import { ImageTokenIcon } from '../../../shared/components/iconos';

interface Props {
  selectedImageToken: any;
  boardTokens: any[];
  userRole: string;
  socket: any;
  onClose: () => void;
}

/** Modal para ver (y, si es DM, eliminar) una imagen colocada en el mapa. */
export function ModalImagenMapa({ selectedImageToken, boardTokens, userRole, socket, onClose }: Props) {
  const activeImage = boardTokens.find((t: any) => t.instanceId === selectedImageToken.instanceId);
  if (!activeImage) return null;
  const isDM = userRole === 'dm' || userRole === 'admin';

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }} onClick={onClose}>
      <div className="clipped-frame" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 0 50px rgba(0,0,0,0.9)', border: '2px solid var(--accent-gold)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ width: '40px', height: '40px', border: '1.5px solid var(--accent-gold)', flexShrink: 0, padding: '3px', background: 'rgba(0,0,0,0.3)' }}>
            <ImageTokenIcon />
          </div>
          <div style={{ flex: 1 }}>
            <h3 className="font-cinzel" style={{ margin: 0, fontSize: '1.4rem', color: 'var(--accent-gold)' }}>IMAGEN EN MAPA</h3>
          </div>
          {isDM && (
            <button
              onClick={() => {
                if (confirm("¿Eliminar esta imagen del mapa?")) {
                  socket.emit('token:remove', activeImage.instanceId);
                  onClose();
                }
              }}
              className="font-cinzel"
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--combat-red)', border: '1px solid var(--combat-red)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}
            >
              🗑️ ELIMINAR
            </button>
          )}
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-surface)' }}>
          {activeImage.imageData?.url ? (
            <img src={activeImage.imageData.url} alt="Image map content" style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} />
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No hay ninguna imagen cargada.</p>
          )}
        </div>

        <div style={{ padding: '15px 25px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.2)' }}>
          <button onClick={onClose} className="font-cinzel" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '8px 20px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>CERRAR</button>
        </div>
      </div>
    </div>
  );
}
