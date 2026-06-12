import React from 'react';
import { calcMod, getProficiencyBonus } from '../../modules/personaje/personaje.utilidades';
import { Shield, Swords, Hammer, Languages } from 'lucide-react';

export const CharacterStatsPanel = ({
  character,
  charStats,
  selectedSavingThrows,
  selectedSkills,
  onSelectSavingThrow,
  onSelectSkill,
  dbRaces = []
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--char-sheet-stats-gap)', minWidth: 'var(--char-sheet-stats-min-w)', maxWidth: 'var(--char-sheet-stats-max-w)' }}>
        

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

          const getEffectiveStat = (statKey: string) => {
            const baseVal = charStats[statKey] || 10;
            const mods = charStats[`custom_${statKey}_modifiers`] || [];
            const customSum = mods.reduce((acc: number, m: any) => acc + m.value, 0);
            return baseVal + customSum;
          };

          return (
            <>
              {/* TIRADAS DE SALVACIÓN */}
              <div>
                <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '10px', fontSize: 'var(--char-sheet-stats-header-size)' }}>SALVACIONES</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {tsList.map((s) => {
                    const effectiveScore = getEffectiveStat(s.key);
                    const baseMod = calcMod(effectiveScore);
                    const isProficient = currentSavingThrows.includes(s.key);
                    const customSaveMod = (charStats[`custom_save_${s.key}_modifiers`] || []).reduce((acc: number, m: any) => acc + m.value, 0);
                    const totalMod = baseMod + (isProficient ? currentPb : 0) + customSaveMod;
                    const modStr = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;
                    return (
                      <div key={s.label} className="stat-row-hover" onClick={() => onSelectSavingThrow && onSelectSavingThrow(s.key)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--char-sheet-stats-item-padding)', background: isProficient ? 'rgba(200, 135, 42, 0.08)' : 'transparent', borderRadius: '4px', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="proficiency-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: isProficient ? 'var(--gold-primary)' : 'var(--bg-raised)', border: `1px solid ${isProficient ? 'var(--gold-primary)' : 'var(--text-secondary)'}`, boxShadow: isProficient ? '0 0 8px var(--gold-primary), 0 0 12px var(--gold-primary)' : 'none', transition: 'all 0.2s ease' }} />
                          <span className="font-cinzel" style={{ fontSize: 'var(--char-sheet-stats-item-font-size)', color: isProficient ? 'var(--text-parchment)' : 'var(--text-secondary)', transition: 'all 0.2s ease' }}>{s.label} <span style={{opacity: 0.5}}>({s.key})</span></span>
                        </div>
                        <span className="mono" style={{ fontSize: 'var(--char-sheet-stats-item-val-size)', color: isProficient ? 'var(--gold-primary)' : 'var(--text-secondary)', transition: 'all 0.2s ease' }}>{modStr}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* HABILIDADES */}
              <div>
                <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '10px', fontSize: 'var(--char-sheet-stats-header-size)' }}>HABILIDADES</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {phList.map((s) => {
                    const effectiveScore = getEffectiveStat(s.key);
                    const baseMod = calcMod(effectiveScore);
                    const isProficient = currentSelectedSkills.includes(s.label);
                    const customSkillMod = (charStats[`custom_skill_${s.label}_modifiers`] || []).reduce((acc: number, m: any) => acc + m.value, 0);
                    const totalMod = baseMod + (isProficient ? currentPb : 0) + customSkillMod;
                    const modStr = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;
                    return (
                      <div key={s.label} className="stat-row-hover" onClick={() => onSelectSkill && onSelectSkill(s.label, s.key)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--char-sheet-stats-item-padding)', background: isProficient ? 'rgba(200, 135, 42, 0.05)' : 'transparent', borderRadius: '4px', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="proficiency-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: isProficient ? 'var(--gold-primary)' : 'var(--bg-raised)', border: `1px solid ${isProficient ? 'var(--gold-primary)' : 'var(--text-secondary)'}`, boxShadow: isProficient ? '0 0 8px var(--gold-primary), 0 0 12px var(--gold-primary)' : 'none', transition: 'all 0.2s ease' }} />
                          <span className="font-cinzel" style={{ fontSize: 'var(--char-sheet-stats-item-font-size)', color: isProficient ? 'var(--text-parchment)' : 'var(--text-secondary)', transition: 'all 0.2s ease' }}>{s.label} <span style={{opacity: 0.5}}>({s.key})</span></span>
                        </div>
                        <span className="mono" style={{ fontSize: 'var(--char-sheet-stats-item-val-size)', color: isProficient ? 'var(--gold-primary)' : 'var(--text-secondary)', transition: 'all 0.2s ease' }}>{modStr}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* OTRAS COMPETENCIAS */}
              <div style={{ marginTop: '10px' }}>
                <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '10px', fontSize: 'var(--char-sheet-stats-header-size)' }}>OTRAS COMPETENCIAS</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 8px' }}>
                  {(() => {
                    const parsedCls = typeof character.class === 'string' && character.class.startsWith('{')
                      ? JSON.parse(character.class)
                      : { [character.class || 'Guerrero']: 1 };
                    const firstClass = Object.keys(parsedCls)[0] || 'Guerrero';
                    const baseRace = (character.race || 'Humano').split(' ')[0];
                    
                    const eqProfs = getEquipmentProficiencies(firstClass, baseRace, dbRaces);
                    const characterLanguages = (parsedInv.idiomas && parsedInv.idiomas.length > 0)
                      ? parsedInv.idiomas.join(', ')
                      : eqProfs.languages;

                    return (
                      <>
                        <div>
                          <div style={{ fontSize: 'var(--char-sheet-stats-item-font-size)', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Shield size={13} style={{ color: 'var(--accent-gold)', width: 'var(--char-sheet-stats-icon-size, 13px)', height: 'var(--char-sheet-stats-icon-size, 13px)' }} /> Armaduras
                          </div>
                          <div style={{ fontSize: 'var(--char-sheet-stats-item-font-size)', color: 'var(--text-secondary)', lineHeight: '1.3', paddingLeft: '18px' }}>{eqProfs.armor}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 'var(--char-sheet-stats-item-font-size)', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Swords size={13} style={{ color: 'var(--accent-gold)', width: 'var(--char-sheet-stats-icon-size, 13px)', height: 'var(--char-sheet-stats-icon-size, 13px)' }} /> Armas
                          </div>
                          <div style={{ fontSize: 'var(--char-sheet-stats-item-font-size)', color: 'var(--text-secondary)', lineHeight: '1.3', paddingLeft: '18px' }}>{eqProfs.weapons}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 'var(--char-sheet-stats-item-font-size)', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Hammer size={13} style={{ color: 'var(--accent-gold)', width: 'var(--char-sheet-stats-icon-size, 13px)', height: 'var(--char-sheet-stats-icon-size, 13px)' }} /> Herramientas
                          </div>
                          <div style={{ fontSize: 'var(--char-sheet-stats-item-font-size)', color: 'var(--text-secondary)', lineHeight: '1.3', paddingLeft: '18px' }}>{eqProfs.tools}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 'var(--char-sheet-stats-item-font-size)', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Languages size={13} style={{ color: 'var(--accent-gold)', width: 'var(--char-sheet-stats-icon-size, 13px)', height: 'var(--char-sheet-stats-icon-size, 13px)' }} /> Idiomas
                          </div>
                          <div style={{ fontSize: 'var(--char-sheet-stats-item-font-size)', color: 'var(--text-secondary)', lineHeight: '1.3', paddingLeft: '18px' }}>{characterLanguages}</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </>
          );
        })()}

      </div>
    </>
  );
};

const getEquipmentProficiencies = (className: string, raceName: string, dbRaces: any[]) => {
  let armor = "";
  let weapons = "";
  let tools = "Ninguna";
  let languages = "Común";

  const cleanClass = className ? className.trim() : "Guerrero";
  const cleanRace = raceName ? raceName.trim() : "Humano";

  if (cleanClass.includes("Bárbaro")) {
    armor = "Armaduras Ligeras, Medianas, Escudos";
    weapons = "Armas Simples, Armas Marciales";
  } else if (cleanClass.includes("Bardo")) {
    armor = "Armaduras Ligeras";
    weapons = "Armas Simples, Ballesta de mano, Espada corta, Estoque";
    tools = "Tres instrumentos musicales";
  } else if (cleanClass.includes("Clérigo")) {
    armor = "Armaduras Ligeras, Medianas, Escudos";
    weapons = "Armas Simples";
  } else if (cleanClass.includes("Druida")) {
    armor = "Armaduras Ligeras, Medianas, Escudos (no metálicos)";
    weapons = "Bastón, Daga, Honda, Lanza, Maza, Hoz, Dardo";
    tools = "Kit de Herboristería";
  } else if (cleanClass.includes("Guerrero")) {
    armor = "Todas las Armaduras, Escudos";
    weapons = "Armas Simples, Armas Marciales";
  } else if (cleanClass.includes("Monje")) {
    armor = "Ninguna";
    weapons = "Armas Simples, Espadas cortas";
    tools = "Un tipo de herramienta de artesano o instrumento musical";
  } else if (cleanClass.includes("Paladín")) {
    armor = "Todas las Armaduras, Escudos";
    weapons = "Armas Simples, Armas Marciales";
  } else if (cleanClass.includes("Explorador")) {
    armor = "Armaduras Ligeras, Medianas, Escudos";
    weapons = "Armas Simples, Armas Marciales";
  } else if (cleanClass.includes("Pícaro")) {
    armor = "Armaduras Ligeras";
    weapons = "Armas Simples, Ballesta de mano, Estoque, Espada corta";
    tools = "Herramientas de Ladrón";
  } else if (cleanClass.includes("Hechicero")) {
    armor = "Ninguna";
    weapons = "Daga, Dardo, Honda, Bastón, Ballesta ligera";
  } else if (cleanClass.includes("Brujo")) {
    armor = "Armaduras Ligeras";
    weapons = "Armas Simples";
  } else if (cleanClass.includes("Mago")) {
    armor = "Ninguna";
    weapons = "Daga, Dardo, Honda, Bastón, Ballesta ligera";
  } else {
    armor = "Armaduras Ligeras, Medianas, Escudos";
    weapons = "Armas Simples";
  }

  const baseRace = cleanRace.split('(')[0].trim();
  const foundRace = dbRaces && dbRaces.find((r: any) => r.id === baseRace || r.name === baseRace);
  if (foundRace && foundRace.languages) {
    languages = foundRace.languages.join(', ');
  } else {
    if (cleanRace.includes("Elfo")) {
      languages = "Común, Élfico";
      weapons += (weapons ? ", " : "") + "Espada larga, Espada corta, Arco largo, Arco corto";
    } else if (cleanRace.includes("Enano")) {
      languages = "Común, Enano";
      weapons += (weapons ? ", " : "") + "Hacha de batalla, Hachuela, Martillo ligero, Martillo de guerra";
      tools = "Herramientas de herrero, cervecero o albañil";
    } else if (cleanRace.includes("Mediano")) {
      languages = "Común, Mediano";
    } else if (cleanRace.includes("Dracónido")) {
      languages = "Común, Dracónico";
    } else if (cleanRace.includes("Gnomo")) {
      languages = "Común, Gnomo";
    } else if (cleanRace.includes("Semielfo")) {
      languages = "Común, Élfico, Un idioma adicional";
    } else if (cleanRace.includes("Semiorco")) {
      languages = "Común, Orco";
    } else if (cleanRace.includes("Tiflin")) {
      languages = "Común, Infernal";
    } else {
      languages = "Común, Un idioma adicional";
    }
  }

  return { armor, weapons, tools, languages };
};

