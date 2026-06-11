import React from 'react';
import { parseClasses } from '../../utils/personaje';
import { safeParseStats, getProficiencyBonus } from '../../modules/personaje/personaje.utilidades';

export const CharacterSpellsTab = ({ character }: any) => {
  const charLevel = character.level || 1;
  const allClassesList = Object.keys(parseClasses(character.class));
  const charStats = safeParseStats(character.stats);
  const subclass = charStats?.subclass;

  const getSpellcasterType = (clsName: string) => {
    const clsLower = clsName.toLowerCase().trim();
    const clsClean = clsLower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const fullCasters = ['bardo', 'bard', 'clerigo', 'cleric', 'druida', 'druid', 'hechicero', 'sorcerer', 'mago', 'wizard', 'brujo', 'warlock'];
    const halfCasters = ['paladin', 'explorador', 'ranger', 'artifice', 'artificer'];
    
    if (fullCasters.some(c => clsClean.includes(c))) {
      return 'Lanzador Completo';
    }
    if (halfCasters.some(c => clsClean.includes(c))) {
      return 'Medio Lanzador';
    }

    const isThirdCasterClass = clsClean.includes('mistico') || 
                               clsClean.includes('arcano') || 
                               clsClean.includes('eldritch') || 
                               clsClean.includes('trickster');
    if (isThirdCasterClass) {
      return 'Tercer Lanzador';
    }

    if (subclass) {
      const subClean = subclass.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const isGuerrero = clsClean.includes('guerrero') || clsClean.includes('fighter');
      const isPicaro = clsClean.includes('picaro') || clsClean.includes('rogue');
      
      if (isGuerrero && (subClean.includes('mistico') || subClean.includes('eldritch'))) {
        return 'Tercer Lanzador';
      }
      if (isPicaro && (subClean.includes('arcano') || subClean.includes('trickster'))) {
        return 'Tercer Lanzador';
      }
    }

    return 'No Lanzador';
  };

  const getSpellcastingAbility = (clsName: string) => {
    const clsLower = clsName.toLowerCase().trim();
    const clsClean = clsLower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const carClasses = ['bardo', 'bard', 'hechicero', 'sorcerer', 'brujo', 'warlock', 'paladin'];
    const sabClasses = ['clerigo', 'cleric', 'druida', 'druid', 'explorador', 'ranger'];
    const intClasses = ['mago', 'wizard', 'artifice', 'artificer'];

    if (carClasses.some(c => clsClean.includes(c))) return 'Carisma';
    if (sabClasses.some(c => clsClean.includes(c))) return 'Sabiduría';
    if (intClasses.some(c => clsClean.includes(c))) return 'Inteligencia';

    const isThirdCasterClass = clsClean.includes('mistico') || 
                               clsClean.includes('arcano') || 
                               clsClean.includes('eldritch') || 
                               clsClean.includes('trickster');
    if (isThirdCasterClass) return 'Inteligencia';

    if (subclass) {
      const subClean = subclass.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const isGuerrero = clsClean.includes('guerrero') || clsClean.includes('fighter');
      const isPicaro = clsClean.includes('picaro') || clsClean.includes('rogue');

      if (isGuerrero && (subClean.includes('mistico') || subClean.includes('eldritch'))) {
        return 'Inteligencia';
      }
      if (isPicaro && (subClean.includes('arcano') || subClean.includes('trickster'))) {
        return 'Inteligencia';
      }
    }

    return null;
  };

  const spellSlotsTable: Record<number, number[]> = {
    1: [2, 0, 0, 0, 0, 0, 0, 0, 0], 2: [3, 0, 0, 0, 0, 0, 0, 0, 0], 3: [4, 2, 0, 0, 0, 0, 0, 0, 0], 4: [4, 3, 0, 0, 0, 0, 0, 0, 0],
    5: [4, 3, 2, 0, 0, 0, 0, 0, 0], 6: [4, 3, 3, 0, 0, 0, 0, 0, 0], 7: [4, 3, 3, 1, 0, 0, 0, 0, 0], 8: [4, 3, 3, 2, 0, 0, 0, 0, 0],
    9: [4, 3, 3, 3, 1, 0, 0, 0, 0], 10: [4, 3, 3, 3, 2, 0, 0, 0, 0], 11: [4, 3, 3, 3, 2, 1, 0, 0, 0], 12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
    13: [4, 3, 3, 3, 2, 1, 1, 0, 0], 14: [4, 3, 3, 3, 2, 1, 1, 0, 0], 15: [4, 3, 3, 3, 2, 1, 1, 1, 0], 16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
    17: [4, 3, 3, 3, 2, 1, 1, 1, 1], 18: [4, 3, 3, 3, 3, 1, 1, 1, 1], 19: [4, 3, 3, 3, 3, 2, 1, 1, 1], 20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
  };
  const slots = spellSlotsTable[Math.min(charLevel, 20)] || spellSlotsTable[1];
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {(() => {
        const casterTypes = allClassesList.map(cls => {
          const type = getSpellcasterType(cls);
          if (type === 'Lanzador Completo') return 'Completo';
          if (type === 'Medio Lanzador') return 'Parcial';
          if (type === 'Tercer Lanzador') return 'Terciario';
          return null;
        }).filter((t): t is string => !!t);

        const casterTypesDisplay = casterTypes.length > 0 
          ? Array.from(new Set(casterTypes)).join(' / ') 
          : 'No Lanzador';

        const spellcastAbilities = allClassesList
          .map(cls => getSpellcastingAbility(cls))
          .filter((ability): ability is string => !!ability);
        const uniqueAbilities = Array.from(new Set(spellcastAbilities));
        const displayAbilities = uniqueAbilities.length > 0 ? uniqueAbilities : ['Inteligencia'];

        const customPb = (charStats.customProficiencyModifiers || []).reduce((acc: number, m: any) => acc + m.value, 0);
        const totalPb = getProficiencyBonus(charLevel) + customPb;

        const getEffectiveStat = (statKey: string) => {
          const baseVal = charStats[statKey] || 10;
          const mods = charStats[`custom_${statKey}_modifiers`] || [];
          const customSum = mods.reduce((acc: number, m: any) => acc + m.value, 0);
          return baseVal + customSum;
        };

        const getMod = (statKey: string) => {
          const score = getEffectiveStat(statKey);
          return Math.floor((score - 10) / 2);
        };

        const abilityToKey: Record<string, string> = {
          'Inteligencia': 'int',
          'Sabiduría': 'sab',
          'Carisma': 'car'
        };

        const spellAttackBonuses = displayAbilities.map(ability => {
          const key = abilityToKey[ability] || 'int';
          const mod = getMod(key);
          const total = totalPb + mod;
          return total >= 0 ? `+${total}` : `${total}`;
        });

        const spellSaveDCs = displayAbilities.map(ability => {
          const key = abilityToKey[ability] || 'int';
          const mod = getMod(key);
          return 8 + totalPb + mod;
        });

        const spellAttackDisplay = spellAttackBonuses.join(' / ');
        const spellSaveDCDisplay = spellSaveDCs.join(' / ');

        return (
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px 80px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '24px', lineHeight: '1.2', height: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', textAlign: 'center' }}>
                CLASE
              </div>
              <div style={{ color: 'var(--text-parchment)', fontSize: '1rem', fontWeight: 'bold' }}>
                {allClassesList.join(' + ')}
              </div>
            </div>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '24px', lineHeight: '1.2', height: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', textAlign: 'center' }}>
                LANZADOR
              </div>
              <div style={{ color: 'var(--text-parchment)', fontSize: '1rem', fontWeight: 'bold' }}>
                {casterTypesDisplay}
              </div>
            </div>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '24px', lineHeight: '1.2', height: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', textAlign: 'center' }}>
                APTITUD MÁGICA
              </div>
              <div style={{ color: 'var(--text-parchment)', fontSize: '1rem', fontWeight: 'bold' }}>
                {displayAbilities.join(' / ')}
              </div>
            </div>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '24px', lineHeight: '1.2', height: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', textAlign: 'center' }}>
                BONIF.<br />ATAQUE DE CONJURO
              </div>
              <div style={{ color: 'var(--text-parchment)', fontSize: '1rem', fontWeight: 'bold' }}>
                {spellAttackDisplay}
              </div>
            </div>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '24px', lineHeight: '1.2', height: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', textAlign: 'center' }}>
                CD<br />SALVACION DE CONJUROS
              </div>
              <div style={{ color: 'var(--text-parchment)', fontSize: '1rem', fontWeight: 'bold' }}>
                {spellSaveDCDisplay}
              </div>
            </div>
          </div>
        );
      })()}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
        {slots.map((sl: number, i: number) => {
          if (sl === 0) return null;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
              <div className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)' }}>N{i+1}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', justifyContent: 'center' }}>
                {Array.from({ length: sl }).map((_, j) => (
                  <div key={j} style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px solid var(--accent-gold)', background: 'var(--accent-gold)' }}></div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {slots.map((sl: number, lvlIdx: number) => {
          if (sl === 0 && lvlIdx > 0) return null;
          const lvl = lvlIdx + 1;
          return (
            <div key={lvlIdx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px' }}>
              <div style={{ padding: '8px 15px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-cinzel" style={{ color: 'var(--text-parchment)', fontSize: '0.9rem' }}>
                  {lvlIdx === 0 ? 'TRUCOS' : `NIVEL ${lvl}`}
                </span>
                {lvlIdx > 0 && <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sl} ESPACIOS</span>}
              </div>
              <div style={{ padding: '15px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center' }}>
                (Pr�ximamente: Sistema de arrastre de hechizos desde el compendio)
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
