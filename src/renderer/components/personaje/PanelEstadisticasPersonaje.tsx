import React from 'react';
import { calcMod, getProficiencyBonus } from '../../modules/personaje/personaje.utilidades';

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '300px', maxWidth: '340px' }}>
        

        {(() => {
          const parsedInv = typeof character.inventory === 'string' ? JSON.parse(character.inventory || '{}') : (character.inventory || {});
          const currentSelectedSkills = parsedInv.habilidades || [];
          const charLevel = character.level || 1;
          const customPb = (charStats.customProficiencyModifiers || []).reduce((acc: number, m: any) => acc + m.value, 0);
          const currentPb = getProficiencyBonus(charLevel) + customPb;
          
          const phList = [
            { label: 'Atletismo', key: 'fue' },
            { label: 'Acrobacias', key: 'dex' }, { label: 'Juego de Manos', key: 'dex' }, { label: 'Sigilo', key: 'dex' },
            { label: 'Arcanos', key: 'int' }, { label: 'Historia', key: 'int' }, { label: 'Investigación', key: 'int' }, { label: 'Naturaleza', key: 'int' }, { label: 'Religión', key: 'int' },
            { label: 'Trato con Animales', key: 'sab' }, { label: 'Perspicacia', key: 'sab' }, { label: 'Medicina', key: 'sab' }, { label: 'Percepción', key: 'sab' }, { label: 'Supervivencia', key: 'sab' },
            { label: 'Engaño', key: 'car' }, { label: 'Intimidación', key: 'car' }, { label: 'Interpretación', key: 'car' }, { label: 'Persuasión', key: 'car' }
          ];

          const DEFAULT_SAVING_THROWS: Record<string, string[]> = {
            'Bárbaro': ['fue', 'con'],
            'Bardo': ['dex', 'car'],
            'Clérigo': ['sab', 'car'],
            'Druida': ['int', 'sab'],
            'Guerrero': ['fue', 'con'],
            'Monje': ['fue', 'dex'],
            'Paladín': ['sab', 'car'],
            'Explorador': ['fue', 'dex'],
            'Pícaro': ['dex', 'int'],
            'Hechicero': ['con', 'car'],
            'Brujo': ['sab', 'car'],
            'Mago': ['int', 'sab']
          };

          let classSavingThrows: string[] = [];
          try {
            const parsedCls = typeof character.class === 'string' && character.class.startsWith('{')
              ? JSON.parse(character.class)
              : { [character.class || 'Guerrero']: 1 };
            const firstClass = Object.keys(parsedCls)[0] || 'Guerrero';
            classSavingThrows = DEFAULT_SAVING_THROWS[firstClass] || ['fue', 'con'];
          } catch {
            classSavingThrows = DEFAULT_SAVING_THROWS[character.class || 'Guerrero'] || ['fue', 'con'];
          }

          const savedSavingThrows = parsedInv.salvaciones || [];
          const currentSavingThrows = savedSavingThrows.length > 0 ? savedSavingThrows : classSavingThrows;

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
                    const isProficient = currentSavingThrows.includes(s.key);
                    const totalMod = baseMod + (isProficient ? currentPb : 0);
                    const modStr = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;
                    return (
                      <div key={s.label} className="stat-row-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', background: isProficient ? 'rgba(200, 135, 42, 0.08)' : 'transparent', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="proficiency-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: isProficient ? 'var(--gold-primary)' : 'var(--bg-raised)', border: `1px solid ${isProficient ? 'var(--gold-primary)' : 'var(--text-secondary)'}`, boxShadow: isProficient ? '0 0 8px var(--gold-primary), 0 0 12px var(--gold-primary)' : 'none', transition: 'all 0.2s ease' }} />
                          <span className="font-cinzel" style={{ fontSize: '0.88rem', color: isProficient ? 'var(--text-parchment)' : 'var(--text-secondary)', transition: 'all 0.2s ease' }}>{s.label} <span style={{opacity: 0.5}}>({s.key})</span></span>
                        </div>
                        <span className="mono" style={{ fontSize: '0.98rem', color: isProficient ? 'var(--gold-primary)' : 'var(--text-secondary)', transition: 'all 0.2s ease' }}>{modStr}</span>
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
                      <div key={s.label} className="stat-row-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 8px', background: isProficient ? 'rgba(200, 135, 42, 0.05)' : 'transparent', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="proficiency-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: isProficient ? 'var(--gold-primary)' : 'var(--bg-raised)', border: `1px solid ${isProficient ? 'var(--gold-primary)' : 'var(--text-secondary)'}`, boxShadow: isProficient ? '0 0 8px var(--gold-primary), 0 0 12px var(--gold-primary)' : 'none', transition: 'all 0.2s ease' }} />
                          <span className="font-cinzel" style={{ fontSize: '0.88rem', color: isProficient ? 'var(--text-parchment)' : 'var(--text-secondary)', transition: 'all 0.2s ease' }}>{s.label} <span style={{opacity: 0.5}}>({s.key})</span></span>
                        </div>
                        <span className="mono" style={{ fontSize: '0.98rem', color: isProficient ? 'var(--gold-primary)' : 'var(--text-secondary)', transition: 'all 0.2s ease' }}>{modStr}</span>
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

