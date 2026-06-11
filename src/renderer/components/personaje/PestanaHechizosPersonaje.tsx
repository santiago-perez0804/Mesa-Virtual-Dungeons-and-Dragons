import { useState } from 'react';
import { parseClasses } from '../../utils/personaje';
import { safeParseStats, getProficiencyBonus } from '../../modules/personaje/personaje.utilidades';

export const CharacterSpellsTab = ({ character, socket }: any) => {
  const charLevel = character.level || 1;
  const allClassesList = Object.keys(parseClasses(character.class));
  const charStats = safeParseStats(character.stats);
  const subclass = charStats?.subclass;
  const [activeSpellSubTab, setActiveSpellSubTab] = useState<'myBook' | 'global'>('myBook');

  const handleSaveSpellsInfo = (key: 'cantrips_known' | 'spells_known', value: number) => {
    if (!socket) return;
    const updatedStats = {
      ...charStats,
      [key]: value
    };
    const updatedChar = {
      ...character,
      stats: JSON.stringify(updatedStats)
    };
    socket.emit('character:update', updatedChar);
  };

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
        }).filter((t): t is 'Completo' | 'Parcial' | 'Terciario' => t !== null);

        const casterTypesDisplay = casterTypes.length > 0 
          ? Array.from(new Set(casterTypes)).join(' / ') 
          : 'No Lanzador';

        const spellcastAbilities = allClassesList
          .map(cls => getSpellcastingAbility(cls))
          .filter((ability): ability is 'Carisma' | 'Sabiduría' | 'Inteligencia' => ability !== null);
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
          <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(200, 135, 42, 0.15)', borderRadius: '6px', padding: '15px 20px', flex: '1 1 160px', maxWidth: '220px', boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 0 8px rgba(0,0,0,0.4)' }}>
              <div className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '16px', lineHeight: '1.2', height: '42px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', textAlign: 'center' }}>
                CLASE
              </div>
              <div style={{ color: 'var(--text-parchment)', fontSize: '1.1rem', fontWeight: 'bold' }}>
                {allClassesList.join(' + ')}
              </div>
            </div>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(200, 135, 42, 0.15)', borderRadius: '6px', padding: '15px 20px', flex: '1 1 160px', maxWidth: '220px', boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 0 8px rgba(0,0,0,0.4)' }}>
              <div className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '16px', lineHeight: '1.2', height: '42px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', textAlign: 'center' }}>
                LANZADOR
              </div>
              <div style={{ color: 'var(--text-parchment)', fontSize: '1.1rem', fontWeight: 'bold' }}>
                {casterTypesDisplay}
              </div>
            </div>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(200, 135, 42, 0.15)', borderRadius: '6px', padding: '15px 20px', flex: '1 1 160px', maxWidth: '220px', boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 0 8px rgba(0,0,0,0.4)' }}>
              <div className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '16px', lineHeight: '1.2', height: '42px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', textAlign: 'center' }}>
                APTITUD MÁGICA
              </div>
              <div style={{ color: 'var(--text-parchment)', fontSize: '1.1rem', fontWeight: 'bold' }}>
                {displayAbilities.join(' / ')}
              </div>
            </div>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(200, 135, 42, 0.15)', borderRadius: '6px', padding: '15px 20px', flex: '1 1 160px', maxWidth: '220px', boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 0 8px rgba(0,0,0,0.4)' }}>
              <div className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '16px', lineHeight: '1.2', height: '42px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', textAlign: 'center' }}>
                BONIF.<br />ATAQUE DE CONJURO
              </div>
              <div style={{ color: 'var(--text-parchment)', fontSize: '1.1rem', fontWeight: 'bold' }}>
                {spellAttackDisplay}
              </div>
            </div>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(200, 135, 42, 0.15)', borderRadius: '6px', padding: '15px 20px', flex: '1 1 160px', maxWidth: '220px', boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 0 8px rgba(0,0,0,0.4)' }}>
              <div className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '16px', lineHeight: '1.2', height: '42px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', textAlign: 'center' }}>
                CD<br />SALVACION DE CONJUROS
              </div>
              <div style={{ color: 'var(--text-parchment)', fontSize: '1.1rem', fontWeight: 'bold' }}>
                {spellSaveDCDisplay}
              </div>
            </div>
          </div>
        );
      })()}
      <div className="font-cinzel" style={{ textAlign: 'center', color: 'var(--accent-gold)', fontSize: '0.9rem', letterSpacing: '2px', marginBottom: '10px', fontWeight: 'bold' }}>
        ESPACIOS TOTALES
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', width: '100%' }}>
        {Array.from({ length: 9 }).map((_, idx) => {
          const i = idx + 1;
          const maxSlots = slots[i - 1] || 0;
          const isActive = maxSlots > 0;

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(0, 0, 0, 0.25)',
                border: `1px solid ${isActive ? 'rgba(200, 135, 42, 0.2)' : 'rgba(255, 255, 255, 0.05)'}`,
                borderRadius: '6px',
                padding: '12px 10px',
                flex: '1 1 80px',
                minWidth: '80px',
                maxWidth: '120px',
                opacity: isActive ? 1 : 0.35,
                boxShadow: isActive ? '0 4px 10px rgba(0,0,0,0.3)' : 'none',
                transition: 'all 0.2s ease-in-out',
                minHeight: '80px'
              }}
            >
              <div className="font-cinzel" style={{ fontSize: '0.75rem', color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '1px' }}>
                N{i}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                {maxSlots > 0 ? (
                  <span style={{ fontSize: '1.2rem', color: 'var(--text-parchment)', fontWeight: 'bold', lineHeight: 1 }}>{maxSlots}</span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.2)' }}>—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', width: '100%', marginTop: '10px', marginBottom: '10px' }}>
        <div style={{ 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'rgba(0, 0, 0, 0.25)', 
          border: '1px solid rgba(200, 135, 42, 0.15)', 
          borderRadius: '6px', 
          padding: '12px 20px', 
          flex: '1 1 180px', 
          maxWidth: '240px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 0 8px rgba(0,0,0,0.4)'
        }}>
          <div className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', letterSpacing: '1.5px', marginBottom: '10px', fontWeight: 'bold' }}>
            TRUCOS CONOCIDOS
          </div>
          <input 
            type="number" 
            min={0}
            value={charStats.cantrips_known || 0} 
            onChange={(e) => handleSaveSpellsInfo('cantrips_known', Math.max(0, parseInt(e.target.value) || 0))}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '4px',
              color: 'var(--text-parchment)',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              textAlign: 'center',
              width: '70px',
              outline: 'none',
              padding: '2px 0'
            }}
          />
        </div>

        <div style={{ 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'rgba(0, 0, 0, 0.25)', 
          border: '1px solid rgba(200, 135, 42, 0.15)', 
          borderRadius: '6px', 
          padding: '12px 20px', 
          flex: '1 1 180px', 
          maxWidth: '240px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 0 8px rgba(0,0,0,0.4)'
        }}>
          <div className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', letterSpacing: '1.5px', marginBottom: '10px', fontWeight: 'bold' }}>
            CONJUROS CONOCIDOS
          </div>
          <input 
            type="number" 
            min={0}
            value={charStats.spells_known || 0} 
            onChange={(e) => handleSaveSpellsInfo('spells_known', Math.max(0, parseInt(e.target.value) || 0))}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '4px',
              color: 'var(--text-parchment)',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              textAlign: 'center',
              width: '70px',
              outline: 'none',
              padding: '2px 0'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px' }}>
          <div style={{ padding: '8px 15px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <span className="font-cinzel" style={{ color: 'var(--text-parchment)', fontSize: '0.9rem' }}>
              TODOS LOS CONJUROS
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setActiveSpellSubTab('myBook')}
                style={{
                  background: activeSpellSubTab === 'myBook' ? 'rgba(200, 135, 42, 0.15)' : 'transparent',
                  border: `1px solid ${activeSpellSubTab === 'myBook' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)'}`,
                  color: activeSpellSubTab === 'myBook' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s'
                }}
              >
                Mi libro
              </button>
              <button 
                onClick={() => setActiveSpellSubTab('global')}
                style={{
                  background: activeSpellSubTab === 'global' ? 'rgba(200, 135, 42, 0.15)' : 'transparent',
                  border: `1px solid ${activeSpellSubTab === 'global' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)'}`,
                  color: activeSpellSubTab === 'global' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s'
                }}
              >
                Grimorio global
              </button>
            </div>
          </div>
          <div style={{ padding: '20px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center' }}>
            {activeSpellSubTab === 'myBook' ? '(Aún nada)' : '(Aún nada)'}
          </div>
        </div>
      </div>
    </div>
  );
};
