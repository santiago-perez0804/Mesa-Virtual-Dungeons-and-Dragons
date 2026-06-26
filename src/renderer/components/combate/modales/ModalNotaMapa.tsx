import { NoteTokenIcon } from '../../../shared/components/iconos';

interface Props {
  selectedNoteToken: any;
  boardTokens: any[];
  userRole: string;
  socket: any;
  onClose: () => void;
}

/** Modal para ver (y, si es DM, eliminar) una nota colocada en el mapa. */
export function ModalNotaMapa({ selectedNoteToken, boardTokens, userRole, socket, onClose }: Props) {
  const activeNote = boardTokens.find((t: any) => t.instanceId === selectedNoteToken.instanceId);
  if (!activeNote) return null;
  const isDM = userRole === 'dm' || userRole === 'admin';

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }} onClick={onClose}>
      <div className="clipped-frame" style={{ width: '100%', maxWidth: '500px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 0 50px rgba(0,0,0,0.9)', border: '2px solid var(--accent-gold)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ width: '40px', height: '40px', border: '1.5px solid var(--accent-gold)', flexShrink: 0, padding: '3px', background: 'rgba(0,0,0,0.3)' }}>
            <NoteTokenIcon />
          </div>
          <div style={{ flex: 1 }}>
            <h3 className="font-cinzel" style={{ margin: 0, fontSize: '1.4rem', color: 'var(--accent-gold)' }}>NOTA DEL MAPA</h3>
          </div>
          {isDM && (
            <button
              onClick={() => {
                if (confirm("¿Eliminar esta nota permanentemente?")) {
                  socket.emit('token:remove', activeNote.instanceId);
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

        <div style={{ padding: '30px', overflowY: 'auto', background: 'var(--bg-surface)' }}>
          <div style={{ color: 'var(--text-parchment)', fontSize: '1.05rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontFamily: 'serif', padding: '15px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px' }}>
            {activeNote.noteData?.text || 'Esta nota está vacía.'}
          </div>
        </div>

        <div style={{ padding: '15px 25px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.2)' }}>
          <button onClick={onClose} className="font-cinzel" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '8px 20px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>CERRAR</button>
        </div>
      </div>
    </div>
  );
}
