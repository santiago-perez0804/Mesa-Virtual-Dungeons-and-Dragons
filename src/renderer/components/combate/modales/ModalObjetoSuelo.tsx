import { StickyNote, Backpack } from 'lucide-react';
import { ItemDropIcon } from '../../../shared/components/iconos';

interface Props {
  selectedItemToken: any;
  userRole: string;
  characters: any[];
  currentUser: any;
  socket: any;
  onPickup: () => void;
  onClose: () => void;
}

/** Modal para inspeccionar (y recoger / eliminar) un objeto tirado en el suelo. */
export function ModalObjetoSuelo({ selectedItemToken, userRole, characters, currentUser, socket, onPickup, onClose }: Props) {
  const item = selectedItemToken.itemData;
  if (!item) return null;

  const isDM = userRole === 'dm' || userRole === 'admin';
  const myChars = characters.filter((c: any) => userRole === 'dm' || c.owner === currentUser.name);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }} onClick={onClose}>
      <div className="clipped-frame" style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 0 50px rgba(0,0,0,0.9)', border: '2px solid var(--accent-gold)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '25px 30px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '20px', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ width: '50px', height: '50px', border: '2px solid var(--accent-gold)', overflow: 'hidden', flexShrink: 0, background: 'rgba(0,0,0,0.4)', padding: '5px' }}>
            {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ItemDropIcon rarity={item.rarity || 'Común'} />}
          </div>
          <div style={{ flex: 1 }}>
            <h2 className="font-cinzel" style={{ margin: 0, fontSize: '1.6rem', color: 'var(--accent-gold)' }}>{item.name}</h2>
            <p className="font-cinzel" style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Objeto en el suelo • {item.rarity}
            </p>
          </div>
          {isDM && (
            <button
              onClick={() => {
                socket.emit('token:remove', selectedItemToken.instanceId);
                onClose();
              }}
              className="font-cinzel"
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--combat-red)', border: '1px solid var(--combat-red)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}
            >
              🗑️ ELIMINAR
            </button>
          )}
        </div>

        <div style={{ padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--bg-surface)' }}>
          <div>
            <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '10px', fontSize: '0.9rem' }}><StickyNote className="w-4 h-4 inline-block mr-2" /> DESCRIPCIÓN</h4>
            <p style={{ color: 'var(--text-parchment)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap' }}>
              {item.description || 'Sin descripción disponible.'}
            </p>
          </div>

          {myChars.length > 0 && (
            <div style={{ marginTop: '10px', background: 'rgba(0,0,0,0.2)', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 4px 0', fontSize: '0.9rem' }}><Backpack className="w-4 h-4 inline-block mr-2" /> RECOGER OBJETO</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>Se agregará directamente a tu inventario y desaparecerá del mapa.</p>
              </div>
              <button
                onClick={onPickup}
                className="font-cinzel torch-glow"
                style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
              >
                RECOGER
              </button>
            </div>
          )}
        </div>

        <div style={{ padding: '20px 30px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.2)' }}>
          <button onClick={onClose} className="font-cinzel" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>CERRAR</button>
        </div>
      </div>
    </div>
  );
}
