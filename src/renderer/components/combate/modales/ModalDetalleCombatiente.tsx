import { User, Ghost, Dices, StickyNote } from 'lucide-react';

interface Props {
  viewingToken: any;
  boardTokens: any[];
  characters: any[];
  monsters: any[];
  onClose: () => void;
}

function safeParse(val: any): any {
  if (typeof val !== 'string') return val;
  try {
    const p = JSON.parse(val);
    if (typeof p === 'string') return safeParse(p);
    return p;
  } catch { return val; }
}

const PH_LIST = [
  { label: 'Atletismo', key: 'fue' },
  { label: 'Acrobacias', key: 'dex' }, { label: 'Juego de Manos', key: 'dex' }, { label: 'Sigilo', key: 'dex' },
  { label: 'Arcanos', key: 'int' }, { label: 'Historia', key: 'int' }, { label: 'Investigación', key: 'int' }, { label: 'Naturaleza', key: 'int' }, { label: 'Religión', key: 'int' },
  { label: 'Trato con Animales', key: 'sab' }, { label: 'Perspicacia', key: 'sab' }, { label: 'Medicina', key: 'sab' }, { label: 'Percepción', key: 'sab' }, { label: 'Supervivencia', key: 'sab' },
  { label: 'Engaño', key: 'car' }, { label: 'Intimidación', key: 'car' }, { label: 'Interpretación', key: 'car' }, { label: 'Persuasión', key: 'car' },
];

/** Modal de detalle de un combatiente (héroe o criatura): atributos, habilidades, descripción e inventario. */
export function ModalDetalleCombatiente({ viewingToken, boardTokens, characters, monsters, onClose }: Props) {
  const item = boardTokens.find((t: any) => t.instanceId === viewingToken.instanceId) || viewingToken;
  const isChar = item.type === 'character';
  let inventory: any = null;
  let stats: any = {};
  let description: any = "";
  let classes = "";
  let race = "";
  let type = "";

  if (isChar) {
    const charSource = characters.find((c: any) => c.id === item.originalId);
    stats = safeParse(charSource?.stats || {});
    description = charSource?.description || "Sin descripción.";
    race = charSource?.race || "Humano";
    inventory = safeParse(charSource?.inventory) || null;
    try {
      const parsedCls = safeParse(charSource?.class);
      classes = Object.entries(parsedCls).map(([c, l]) => `${c} ${l}`).join(' / ');
    } catch {
      classes = charSource?.class || "Guerrero";
    }
  } else {
    const mSource = monsters.find((m: any) => m.id === item.originalId);
    const mData = safeParse(mSource?.data || {});
    stats = { fue: mData.strength || 10, dex: mData.dexterity || 10, con: mData.constitution || 10, int: mData.intelligence || 10, sab: mData.wisdom || 10, car: mData.charisma || 10 };
    description = mData.description || mData.desc || "Sin descripción.";
    type = mData.type || "Monstruo";
  }

  const statMod = (v: number) => {
    const mod = Math.floor((v - 10) / 2);
    return (mod >= 0 ? '+' : '') + mod;
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }} onClick={onClose}>
      <div className="clipped-frame" style={{ width: '100%', maxWidth: '900px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
        {/* HEADER */}
        <div style={{ padding: '25px 30px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '20px', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ width: '80px', height: '80px', border: '2px solid var(--accent-gold)', overflow: 'hidden', flexShrink: 0 }}>
            {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '2.5rem' }}>{isChar ? <User className="w-full h-full p-2" /> : <Ghost className="w-full h-full p-2" />}</span>}
          </div>
          <div style={{ flex: 1 }}>
            <h2 className="font-cinzel" style={{ margin: 0, fontSize: '2rem', color: 'var(--accent-gold)' }}>{item.name}</h2>
            <p className="font-cinzel" style={{ margin: '4px 0 0 0', color: 'var(--text-parchment)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {isChar ? `${race} • ${classes}` : type}
            </p>
          </div>
        </div>

        {/* BODY */}
        <div style={{ padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Atributos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '15px' }}>
            {Object.entries(stats).map(([key, val]: [string, any]) => {
              const mod = statMod(val);
              return (
                <div key={key} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', padding: '12px', textAlign: 'center' }}>
                  <div className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 'bold', textTransform: 'uppercase' }}>{key}</div>
                  <div className="mono" style={{ fontSize: '1.4rem', color: 'white', fontWeight: 'bold' }}>{val}</div>
                  <div className="mono" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mod: {mod}</div>
                  {isChar && <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', marginTop: '4px', fontWeight: 'bold' }}>TS: {mod}</div>}
                </div>
              );
            })}
          </div>

          {isChar && (() => {
            const selectedSkills = inventory?.habilidades || [];
            const level = characters.find((c: any) => c.id === item.originalId)?.level || 1;
            const pb = 1 + Math.ceil(level / 4);

            return (
              <div>
                <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}><Dices className="w-5 h-5 inline-block mr-2" /> HABILIDADES</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {PH_LIST.map(s => {
                    const baseMod = Math.floor(((stats[s.key] || 10) - 10) / 2);
                    const isProficient = selectedSkills.includes(s.label);
                    const totalMod = baseMod + (isProficient ? pb : 0);
                    const modStr = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;
                    return (
                      <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                        <span className="font-cinzel" style={{ fontSize: '0.75rem', color: isProficient ? 'var(--accent-gold)' : 'white' }}>{s.label} ({s.key.toUpperCase()})</span>
                        <span className="mono" style={{ fontSize: '1rem', fontWeight: 'bold', color: isProficient ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>{modStr}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Descripción */}
          <div>
            <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}><StickyNote className="w-4 h-4 inline-block mr-2" /> DESCRIPCIÓN</h4>
            <div style={{ color: 'var(--text-parchment)', lineHeight: '1.6', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
              {Array.isArray(description) ? description.join('\n') : description}
            </div>
          </div>

          {/* Inventario (solo héroes) */}
          {isChar && inventory && (
            <div>
              <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>⚔️ INVENTARIO</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {Object.entries(inventory).map(([cat, items]: [string, any]) => (
                  items && items.length > 0 && (
                    <div key={cat} style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', border: '1px solid var(--border-color)' }}>
                      <h5 className="font-cinzel" style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{cat}</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {items.map((it: any, idx: number) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                            <span style={{ fontSize: '0.9rem', color: 'white' }}>{it.name}</span>
                            {it.damage && <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--combat-red)' }}>{it.damage}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
