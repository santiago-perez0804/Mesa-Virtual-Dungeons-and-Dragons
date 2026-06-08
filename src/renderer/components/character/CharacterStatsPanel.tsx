import React from 'react';
import { calcMod, getProficiencyBonus } from '../../modules/character/character.utils';

export const CharacterStatsPanel = ({
  character,
  charStats,
  selectedSavingThrows,
  selectedSkills
}: any) => {

  const SKILLS_MAP: Record<string, string> = {
    'Atletismo': 'fue',
    'Acrobacias': 'dex', 'Juego de Manos': 'dex', 'Sigilo': 'dex',
    'Arcanos': 'int', 'Historia': 'int', 'Investigación': 'int', 'Naturaleza': 'int', 'Religión': 'int',
    'Trato con Animales': 'sab', 'Intuición': 'sab', 'Medicina': 'sab', 'Percepción': 'sab', 'Supervivencia': 'sab',
    'Engaño': 'car', 'Intimidación': 'car', 'Interpretación': 'car', 'Persuasión': 'car'
  };

  const pb = 1 + Math.ceil((character.level || 1) / 4);

  return (
    <>
      {/* Columna Izquierda (Mecánicas) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '220px', maxWidth: '280px' }}>
        
        {/* Atributos */}
        <div>
          <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '10px', fontSize: '0.8rem' }}>ATRIBUTOS</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {['fue', 'dex', 'con', 'int', 'sab', 'car'].map((key) => {
              const value = charStats[key] || 10;
              const mod = calcMod(value);
              const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
              const modColor = mod > 0 ? 'var(--gold-primary)' : (mod < 0 ? '#e74c3c' : 'white');
              return (
                <div key={key} style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '10px 4px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="font-cinzel" style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{key.toUpperCase()}</div>
                  <div className="mono" style={{ fontSize: '18px', fontWeight: 'bold', color: modColor, margin: '4px 0' }}>{modStr}</div>
                  <div className="mono" style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '3px', color: 'var(--text-secondary)' }}>{value}</div>
                </div>
              );
            })}
          </div>
        </div>

        {(() => {
          const parsedInv = typeof character.inventory === 'string' ? JSON.parse(character.inventory || '{}') : (character.inventory || {});
          const currentSelectedSkills = parsedInv.habilidades || [];
          const charLevel = character.level || 1;
          const currentPb = getProficiencyBonus(charLevel);
          
          const phList = [
            { label: 'Atletismo', key: 'fue' },
            { label: 'Acrobacias', key: 'dex' }, { label: 'Juego de Manos', key: 'dex' }, { label: 'Sigilo', key: 'dex' },
            { label: 'Arcanos', key: 'int' }, { label: 'Historia', key: 'int' }, { label: 'Investigación', key: 'int' }, { label: 'Naturaleza', key: 'int' }, { label: 'Religión', key: 'int' },
            { label: 'Trato con Animales', key: 'sab' }, { label: 'Perspicacia', key: 'sab' }, { label: 'Medicina', key: 'sab' }, { label: 'Percepción', key: 'sab' }, { label: 'Supervivencia', key: 'sab' },
            { label: 'Engaño', key: 'car' }, { label: 'Intimidación', key: 'car' }, { label: 'Interpretación', key: 'car' }, { label: 'Persuasión', key: 'car' }
          ];

          const tsList = [
            { label: 'Fuerza', key: 'fue' }, { label: 'Destreza', key: 'dex' }, { label: 'Constitución', key: 'con' },
            { label: 'Inteligencia', key: 'int' }, { label: 'Sabiduría', key: 'sab' }, { label: 'Carisma', key: 'car' }
          ];

          return (
            <>
              {/* TIRADAS DE SALVACIÓN */}
              <div>
                <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '10px', fontSize: '0.8rem' }}>SALVACIONES</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {tsList.map((s) => {
                    const baseMod = calcMod(charStats[s.key] || 10);
                    const isProficient = (parsedInv.salvaciones || []).includes(s.key);
                    const totalMod = baseMod + (isProficient ? currentPb : 0);
                    const modStr = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;
                    return (
                      <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', background: isProficient ? 'rgba(200, 135, 42, 0.08)' : 'transparent', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isProficient ? 'var(--gold-primary)' : 'var(--bg-raised)', border: `1px solid ${isProficient ? 'var(--gold-primary)' : 'var(--text-secondary)'}` }} />
                          <span className="font-cinzel" style={{ fontSize: '0.75rem', color: isProficient ? 'var(--text-parchment)' : 'var(--text-secondary)' }}>{s.label} <span style={{opacity: 0.5}}>({s.key})</span></span>
                        </div>
                        <span className="mono" style={{ fontSize: '0.85rem', color: isProficient ? 'var(--gold-primary)' : 'var(--text-secondary)' }}>{modStr}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* HABILIDADES */}
              <div>
                <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '10px', fontSize: '0.8rem' }}>HABILIDADES</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {phList.map((s) => {
                    const baseMod = calcMod(charStats[s.key] || 10);
                    const isProficient = currentSelectedSkills.includes(s.label);
                    const totalMod = baseMod + (isProficient ? currentPb : 0);
                    const modStr = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;
                    return (
                      <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 8px', background: isProficient ? 'rgba(200, 135, 42, 0.05)' : 'transparent', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isProficient ? 'var(--gold-primary)' : 'var(--bg-raised)', border: `1px solid ${isProficient ? 'var(--gold-primary)' : 'var(--text-secondary)'}` }} />
                          <span className="font-cinzel" style={{ fontSize: '0.75rem', color: isProficient ? 'var(--text-parchment)' : 'var(--text-secondary)' }}>{s.label} <span style={{opacity: 0.5}}>({s.key})</span></span>
                        </div>
                        <span className="mono" style={{ fontSize: '0.85rem', color: isProficient ? 'var(--gold-primary)' : 'var(--text-secondary)' }}>{modStr}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          );
        })()}

      </div>
    </>
  );
};

