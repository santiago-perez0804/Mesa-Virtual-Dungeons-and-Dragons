import { Box, Coins } from 'lucide-react';
import { OpenChestIcon } from '../../../shared/components/iconos';

interface Props {
  selectedChestToken: any;
  boardTokens: any[];
  userRole: string;
  socket: any;
  onSlotClick: (idx: number) => void;
  onLootItem: (idx: number) => void;
  onLootAllCoins: () => void;
  onClose: () => void;
}

const MONEDAS = [
  { key: 'po', label: 'Oro (po)', color: '#ecc94b' },
  { key: 'pt', label: 'Platino (pt)', color: '#a0aec0' },
  { key: 'pl', label: 'Plata (pl)', color: '#cbd5e0' },
  { key: 'pc', label: 'Cobre (pc)', color: '#b7791f' },
  { key: 'el', label: 'Electrum (el)', color: '#319795' },
];

/** Panel de inventario de un cofre abierto: slots 3x3 y monedas (loot por jugador, edición por DM). */
export function ModalCofreInventario({ selectedChestToken, boardTokens, userRole, socket, onSlotClick, onLootItem, onLootAllCoins, onClose }: Props) {
  const activeChest = boardTokens.find((t: any) => t.instanceId === selectedChestToken.instanceId);
  if (!activeChest) return null;

  const isDM = userRole === 'dm' || userRole === 'admin';
  const coins = activeChest.chestData?.coins || { pc: 0, pl: 0, el: 0, po: 0, pt: 0 };
  const slots = activeChest.chestData?.slots || Array(9).fill(null);

  const handleUpdateCoins = (key: string, value: number) => {
    const newCoins = { ...coins, [key]: Math.max(0, value) };
    socket.emit('token:update-chest', { tokenId: activeChest.instanceId, chestData: { coins: newCoins } });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }} onClick={onClose}>
      <div className="clipped-frame" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 0 50px rgba(0,0,0,0.9)', border: '2px solid var(--accent-gold)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '25px 30px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '20px', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ width: '60px', height: '60px', border: '2px solid var(--accent-gold)', overflow: 'hidden', flexShrink: 0, background: 'rgba(0,0,0,0.4)', padding: '5px' }}>
            <OpenChestIcon />
          </div>
          <div style={{ flex: 1 }}>
            <h2 className="font-cinzel" style={{ margin: 0, fontSize: '1.8rem', color: 'var(--accent-gold)' }}>INVENTARIO DEL COFRE</h2>
            <p className="font-cinzel" style={{ margin: '4px 0 0 0', color: 'var(--text-parchment)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {isDM ? 'Panel del DM • Sin Contraseña' : 'Abierto • Contraseña Correcta'}
            </p>
          </div>
          {isDM && (
            <button
              onClick={() => {
                if (confirm("¿Estás seguro de que deseas eliminar este cofre y todo su contenido de forma permanente?")) {
                  socket.emit('token:remove', activeChest.instanceId);
                  onClose();
                }
              }}
              className="font-cinzel"
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--combat-red)', border: '1px solid var(--combat-red)', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              🗑️ ELIMINAR COFRE
            </button>
          )}
        </div>

        <div style={{ padding: '30px', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', background: 'var(--bg-surface)' }}>
          {/* Slots 3x3 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 15px 0', fontSize: '1rem', letterSpacing: '1.5px', textTransform: 'uppercase', alignSelf: 'flex-start' }}><Box className="w-4 h-4 inline-block mr-2" /> Compartimentos (3x3)</h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', width: 'fit-content' }}>
              {slots.map((slot: any, idx: number) => {
                let tagColor = 'var(--text-secondary)';
                if (slot) {
                  const r = String(slot.rarity || 'Común').toLowerCase();
                  if (r.includes('raro') || r.includes('rare')) {
                    tagColor = r.includes('muy') ? '#a855f7' : '#3b82f6';
                  } else if (r.includes('legend')) {
                    tagColor = '#f59e0b';
                  } else if (r.includes('poco')) {
                    tagColor = '#10b981';
                  }
                }

                return (
                  <div
                    key={idx}
                    onClick={() => onSlotClick(idx)}
                    style={{ width: '85px', height: '85px', background: slot ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.4)', border: slot ? `1.5px solid ${tagColor}` : '1.5px dashed var(--border-color)', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: isDM ? 'pointer' : 'default', overflow: 'hidden', padding: '6px', boxSizing: 'border-box', textAlign: 'center', transition: 'all 0.2s' }}
                    className={isDM && !slot ? 'torch-glow' : ''}
                    onMouseEnter={e => { if (isDM) { e.currentTarget.style.borderColor = 'var(--accent-gold)'; e.currentTarget.style.background = 'rgba(200, 135, 42, 0.05)'; } }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = slot ? tagColor : '1.5px dashed var(--border-color)'; e.currentTarget.style.background = slot ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.4)'; }}
                  >
                    {slot ? (
                      <>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'white', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word', lineHeight: '1.2' }}>{slot.name}</span>
                        <span style={{ fontSize: '0.6rem', color: tagColor, textTransform: 'uppercase', marginTop: '4px', fontWeight: 'bold', letterSpacing: '0.5px' }}>{slot.rarity}</span>
                        {!isDM && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onLootItem(idx); }}
                            className="font-cinzel"
                            style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '2px 0', fontSize: '0.65rem', cursor: 'pointer', fontWeight: 'bold', opacity: 0.9 }}
                          >
                            TOMAR
                          </button>
                        )}
                      </>
                    ) : (
                      <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', opacity: 0.4 }}>{isDM ? '+' : ''}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monedas */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 15px 0', fontSize: '1rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}><Coins className="w-4 h-4 inline-block mr-2" /> Monedas en el cofre</h4>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px', flex: 1, justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {MONEDAS.map(coin => (
                  <div key={coin.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.9rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: coin.color, display: 'inline-block' }} />
                      {coin.label}
                    </span>
                    {isDM ? (
                      <input
                        type="number" min="0" value={coins[coin.key] || 0}
                        onChange={e => handleUpdateCoins(coin.key, parseInt(e.target.value) || 0)}
                        style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '6px 10px', width: '80px', borderRadius: '4px', outline: 'none', textAlign: 'right', boxSizing: 'border-box' }}
                      />
                    ) : (
                      <span className="mono" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: coin.color }}>{coins[coin.key] || 0}</span>
                    )}
                  </div>
                ))}
              </div>

              {!isDM && (
                <button
                  onClick={onLootAllCoins}
                  className="font-cinzel torch-glow"
                  style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem', marginTop: '20px', width: '100%' }}
                >
                  <Coins className="w-4 h-4 inline-block mr-1" /> TOMAR TODAS LAS MONEDAS
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 30px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.2)' }}>
          <button onClick={onClose} className="font-cinzel" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 25px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>CERRAR COFRE</button>
        </div>
      </div>
    </div>
  );
}
