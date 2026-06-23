import { User, Ghost } from 'lucide-react';
import { renderConditionIcon } from '../ConditionIcon';

const SPELLCASTING_CLASSES = ['Brujo', 'Bardo', 'Paladín', 'Mago', 'Hechicero', 'Druida', 'Clérigo'];
const SPELL_SLOTS_TABLE: Record<number, number[]> = {
  1: [2, 0, 0, 0, 0, 0, 0, 0, 0], 2: [3, 0, 0, 0, 0, 0, 0, 0, 0], 3: [4, 2, 0, 0, 0, 0, 0, 0, 0], 4: [4, 3, 0, 0, 0, 0, 0, 0, 0],
  5: [4, 3, 2, 0, 0, 0, 0, 0, 0], 6: [4, 3, 3, 0, 0, 0, 0, 0, 0], 7: [4, 3, 3, 1, 0, 0, 0, 0, 0], 8: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  9: [4, 3, 3, 3, 1, 0, 0, 0, 0], 10: [4, 3, 3, 3, 2, 0, 0, 0, 0], 11: [4, 3, 3, 3, 2, 1, 0, 0, 0], 12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  13: [4, 3, 3, 3, 2, 1, 1, 0, 0], 14: [4, 3, 3, 3, 2, 1, 1, 0, 0], 15: [4, 3, 3, 3, 2, 1, 1, 1, 0], 16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1], 18: [4, 3, 3, 3, 3, 1, 1, 1, 1], 19: [4, 3, 3, 3, 3, 2, 1, 1, 1], 20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
};

interface Props {
  healthModalToken: any;
  setHealthModalToken: (v: any) => void;
  characters: any[];
  socket: any;
  healthInput: string;
  setHealthInput: (v: string) => void;
  conditionInput: string;
  setConditionInput: (v: string) => void;
}

/** Modal de gestión de vida, HP temporal, condición y espacios de conjuro de un token. */
export function ModalSalud({ healthModalToken, setHealthModalToken, characters, socket, healthInput, setHealthInput, conditionInput, setConditionInput }: Props) {
  const charSource = healthModalToken.type === 'character'
    ? characters.find((c: any) => c.id === healthModalToken.originalId)
    : null;
  let parsedInv: any = {};
  if (charSource?.inventory) {
    try {
      let tmp = charSource.inventory;
      if (typeof tmp === 'string') tmp = JSON.parse(tmp);
      if (typeof tmp === 'string') tmp = JSON.parse(tmp);
      parsedInv = tmp || {};
    } catch {}
  }
  let isSpellcaster = false;
  let charLevel = 1;
  if (charSource) {
    charLevel = charSource.level || 1;
    try {
      const cls = typeof charSource.class === 'string' ? JSON.parse(charSource.class) : charSource.class;
      isSpellcaster = Object.keys(cls || {}).some((c: string) => SPELLCASTING_CLASSES.includes(c));
    } catch { isSpellcaster = SPELLCASTING_CLASSES.includes(charSource.class || ''); }
    if (!isSpellcaster && parsedInv?.slots && Object.keys(parsedInv.slots).length > 0) isSpellcaster = true;
  }
  const rawSpellSlots = parsedInv?.slots || {};
  const spellSlotsUsed: Record<number, number> = {};
  Object.entries(rawSpellSlots).forEach(([lvl, data]: [string, any]) => {
    spellSlotsUsed[parseInt(lvl)] = parseInt(data?.used) || 0;
  });
  const effectiveUsed: Record<number, number> = { ...spellSlotsUsed, ...(healthModalToken._spellSlotsUsed || {}) };
  const slotTable = SPELL_SLOTS_TABLE[Math.min(charLevel, 20)] || SPELL_SLOTS_TABLE[1];
  const handleSpellSlotToggle = (level: number, slotIndex: number) => {
    if (!charSource) return;
    const maxForLevel = slotTable[level - 1];
    const currentUsed = effectiveUsed[level] || 0;
    const newUsed = Math.min(slotIndex < currentUsed ? slotIndex : slotIndex + 1, maxForLevel);
    const newRawSlots = { ...rawSpellSlots, [level]: { max: maxForLevel, used: newUsed } };
    const newInv = { ...parsedInv, slots: newRawSlots };
    socket.emit('character:update', { ...charSource, inventory: JSON.stringify(newInv) });
    setHealthModalToken({ ...healthModalToken, _spellSlotsUsed: { ...(healthModalToken._spellSlotsUsed || {}), [level]: newUsed } });
  };
  const hpPct = Math.min(100, (healthModalToken.hp / Math.max(1, healthModalToken.max_hp)) * 100);
  const tmpPct = Math.min(100, ((healthModalToken.tempHp || 0) / Math.max(1, healthModalToken.max_hp)) * 100);
  const hpColor = hpPct > 60 ? '#22c55e' : hpPct > 30 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001, backdropFilter: 'blur(4px)' }} onClick={() => setHealthModalToken(null)}>
      <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '560px', padding: '28px 32px', boxShadow: '0 0 80px rgba(0,0,0,0.95), 0 0 40px rgba(200,135,42,0.15)', animation: 'healthModalIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both' }} onClick={e => e.stopPropagation()}>

        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--accent-gold)', flexShrink: 0, background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {healthModalToken.image ? <img src={healthModalToken.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.4rem' }}>{healthModalToken.type === 'character' ? <User className="w-6 h-6 m-auto" /> : <Ghost className="w-6 h-6 m-auto" />}</span>}
          </div>
          <div style={{ flex: 1 }}>
            <div className="font-cinzel" style={{ color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '1rem' }}>{healthModalToken.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {healthModalToken.type === 'character' ? 'Héroe' : 'Criatura'} · {(healthModalToken.tempHp || 0) > 0 ? `${healthModalToken.tempHp} temp. HP` : 'Sin temp HP'}
            </div>
          </div>
          <button onClick={() => setHealthModalToken(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.6rem', cursor: 'pointer', lineHeight: 1, padding: '4px' }}>✕</button>
        </div>

        {/* HEALTH BAR */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span className="font-cinzel" style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', letterSpacing: '1.5px' }}>PUNTOS DE GOLPE</span>
            <span className="mono" style={{ color: 'white', fontWeight: 'bold' }}>
              {healthModalToken.hp} <span style={{ color: 'var(--text-secondary)' }}>/ {healthModalToken.max_hp}</span>
              {(healthModalToken.tempHp || 0) > 0 && <span style={{ color: '#60a5fa', marginLeft: '6px' }}>+{healthModalToken.tempHp}</span>}
            </span>
          </div>
          <div style={{ width: '100%', height: '16px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', position: 'relative' }}>
            <div style={{ height: '100%', width: `${hpPct}%`, background: `linear-gradient(90deg, ${hpColor}cc, ${hpColor})`, borderRadius: '8px', transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1), background 0.4s ease', boxShadow: `0 0 10px ${hpColor}80` }} />
            {(healthModalToken.tempHp || 0) > 0 && (
              <div style={{ position: 'absolute', top: 0, right: 0, height: '100%', width: `${tmpPct}%`, background: 'linear-gradient(90deg, rgba(96,165,250,0.4), rgba(96,165,250,0.8))', borderRadius: '0 8px 8px 0', transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
            )}
          </div>
        </div>

        {/* INPUT + 3 BOTONES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
          <input
            type="number" min="0" value={healthInput}
            onChange={e => setHealthInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const amt = parseInt(healthInput) || 0;
                if (amt > 0) {
                  const newHp = Math.min(healthModalToken.max_hp, healthModalToken.hp + amt);
                  socket.emit('token:update-combat-state', { tokenId: healthModalToken.instanceId, hp: newHp });
                  setHealthModalToken({ ...healthModalToken, hp: newHp });
                  setHealthInput('');
                }
              }
            }}
            placeholder="Cantidad..."
            style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '9px 14px', borderRadius: '6px', outline: 'none', fontSize: '1rem', fontFamily: 'monospace', fontWeight: 'bold', textAlign: 'center', boxSizing: 'border-box' }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                const amt = parseInt(healthInput) || 0;
                if (amt > 0) {
                  const newHp = Math.min(healthModalToken.max_hp, healthModalToken.hp + amt);
                  socket.emit('token:update-combat-state', { tokenId: healthModalToken.instanceId, hp: newHp });
                  setHealthModalToken({ ...healthModalToken, hp: newHp });
                  setHealthInput('');
                }
              }}
              className="font-cinzel"
              style={{ flex: 1, background: '#16a34a', color: 'white', border: 'none', padding: '9px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.72rem', letterSpacing: '0.5px', transition: 'filter 0.15s, transform 0.1s', boxShadow: '0 2px 8px rgba(22,163,74,0.35)' }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >+ CURAR</button>
            <button
              onClick={() => {
                let amt = parseInt(healthInput) || 0;
                if (amt > 0) {
                  let tempLeft = healthModalToken.tempHp || 0;
                  let realHp = healthModalToken.hp;
                  if (tempLeft >= amt) { tempLeft -= amt; }
                  else { amt -= tempLeft; tempLeft = 0; realHp = Math.max(0, realHp - amt); }
                  socket.emit('token:update-combat-state', { tokenId: healthModalToken.instanceId, hp: realHp, tempHp: tempLeft });
                  setHealthModalToken({ ...healthModalToken, hp: realHp, tempHp: tempLeft });
                  setHealthInput('');
                }
              }}
              className="font-cinzel"
              style={{ flex: 1, background: '#dc2626', color: 'white', border: 'none', padding: '9px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.72rem', letterSpacing: '0.5px', transition: 'filter 0.15s, transform 0.1s', boxShadow: '0 2px 8px rgba(220,38,38,0.35)' }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >− DAÑO</button>
            <button
              onClick={() => {
                const amt = parseInt(healthInput) || 0;
                const newTemp = Math.max(0, (healthModalToken.tempHp || 0) + amt);
                socket.emit('token:update-combat-state', { tokenId: healthModalToken.instanceId, tempHp: newTemp });
                setHealthModalToken({ ...healthModalToken, tempHp: newTemp });
                setHealthInput('');
              }}
              className="font-cinzel"
              style={{ flex: 1, background: '#475569', color: 'white', border: 'none', padding: '9px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.72rem', letterSpacing: '0.5px', transition: 'filter 0.15s, transform 0.1s', boxShadow: '0 2px 8px rgba(71,85,105,0.35)' }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >TEMP</button>
          </div>
        </div>

        {/* ESTADO / CONDICION */}
        <div style={{ marginBottom: isSpellcaster ? '18px' : '0' }}>
          <div className="font-cinzel" style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', letterSpacing: '1.5px', marginBottom: '8px' }}>ESTADO</div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
            {['', '😵', '😨', '🔥', '❄️', '💤', '🛡️', '⚡', '🤢', '😡', '🤸'].map(emo => (
              <button
                key={emo || 'none'}
                onClick={() => setConditionInput(emo)}
                title={emo || 'Sin estado'}
                style={{ width: '34px', height: '34px', borderRadius: '6px', background: conditionInput === emo ? 'rgba(200,135,42,0.25)' : 'var(--bg-base)', border: conditionInput === emo ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)', cursor: 'pointer', fontSize: '1.2rem', padding: 0, transition: 'all 0.15s', boxShadow: conditionInput === emo ? '0 0 8px rgba(200,135,42,0.4)' : 'none' }}
              >{renderConditionIcon(emo)}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text" value={conditionInput}
              onChange={e => setConditionInput(e.target.value)}
              placeholder="Emoji o texto corto..." maxLength={5}
              style={{ flex: 1, background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '8px 12px', borderRadius: '6px', outline: 'none' }}
            />
            <button
              onClick={() => {
                socket.emit('token:update-combat-state', { tokenId: healthModalToken.instanceId, condition: conditionInput || null });
                setHealthModalToken({ ...healthModalToken, condition: conditionInput || null });
              }}
              className="font-cinzel"
              style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
            >APLICAR</button>
          </div>
        </div>

        {/* SPELL SLOTS */}
        {isSpellcaster && (
          <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <div className="font-cinzel" style={{ fontSize: '0.68rem', color: '#a78bfa', letterSpacing: '1.5px', marginBottom: '10px' }}>ESPACIOS DE CONJUROS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {slotTable.map((maxSlots, i) => {
                const level = i + 1;
                if (maxSlots === 0) return null;
                const used = effectiveUsed[level] || 0;
                return (
                  <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="mono" style={{ fontSize: '0.65rem', color: '#a78bfa', width: '24px', flexShrink: 0, textAlign: 'center', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '4px', padding: '2px 0' }}>N{level}</span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {Array.from({ length: maxSlots }).map((_, si) => {
                        const isSpent = si < used;
                        return (
                          <div
                            key={si}
                            onClick={() => handleSpellSlotToggle(level, si)}
                            title={isSpent ? `Espacio ${si + 1} gastado — clic para recuperar` : `Gastar espacio ${si + 1}`}
                            style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${isSpent ? 'rgba(167,139,250,0.25)' : '#a78bfa'}`, background: isSpent ? 'transparent' : 'rgba(167,139,250,0.85)', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: isSpent ? 'none' : '0 0 10px rgba(167,139,250,0.55)', transform: isSpent ? 'scale(0.8)' : 'scale(1)' }}
                          />
                        );
                      })}
                    </div>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginLeft: 'auto', flexShrink: 0 }}>{maxSlots - used}/{maxSlots}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
