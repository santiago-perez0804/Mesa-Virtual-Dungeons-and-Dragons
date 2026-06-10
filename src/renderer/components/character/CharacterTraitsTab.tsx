
import React from 'react';
import { parseClasses } from '../../utils/character';

export const CharacterTraitsTab = ({
  character,
  classFeatures,
  activeFeaturesClass,
  featuresLoading,
  fetchClassFeatures
}: any) => {
  const charLevel = character.level || 1;
  const allClassesMap = parseClasses(character.class);
  const activeClassLevel = allClassesMap[activeFeaturesClass] || charLevel;
  
  const featuresByLevel: any = {};
  classFeatures.forEach((f: any) => {
    const lvl = f.level_acquired;
    if (!featuresByLevel[lvl]) featuresByLevel[lvl] = [];
    featuresByLevel[lvl].push(f);
  });
  
  const levels = Object.keys(featuresByLevel).map(Number).sort((a, b) => a - b);
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {Object.keys(allClassesMap).length > 1 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {Object.entries(allClassesMap as Record<string, number>).map(([cls, lvl]) => (
            <button key={cls} className="font-cinzel" onClick={() => fetchClassFeatures(cls)}
              style={{ padding: '6px 14px', background: 'rgba(200,135,42,0.1)', border: '1px solid var(--border-color)', color: 'var(--accent-gold)', cursor: 'pointer', fontSize: '0.8rem' }}>
              {cls} (Nv {lvl})
            </button>
          ))}
        </div>
      )}
      {featuresLoading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>??</div>
          <div className="font-cinzel" style={{ fontSize: '0.85rem', letterSpacing: '1px', opacity: 0.7 }}>Cargando rasgos...</div>
        </div>
      )}
      {!featuresLoading && classFeatures.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.3 }}>??</div>
          <div className="font-cinzel" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>Sin rasgos registrados para esta clase.</div>
        </div>
      )}
      {!featuresLoading && levels.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {levels.map(lvl => {
            const isUnlocked = lvl <= activeClassLevel;
            return (
              <div key={lvl} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', opacity: isUnlocked ? 1 : 0.35 }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: isUnlocked ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)',
                    border: `2px solid ${isUnlocked ? 'var(--accent-gold)' : 'rgba(255,255,255,0.12)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    boxShadow: isUnlocked ? '0 0 12px rgba(200,135,42,0.5)' : 'none'
                  }}>
                    <span className="mono" style={{ fontWeight: 'bold', fontSize: '0.8rem', color: isUnlocked ? 'black' : 'var(--text-secondary)' }}>{lvl}</span>
                  </div>
                  <span className="font-cinzel" style={{ fontSize: '0.7rem', color: isUnlocked ? 'var(--accent-gold)' : 'var(--text-secondary)', letterSpacing: '2px' }}>
                    NIVEL {lvl}{!isUnlocked && ' - bloqueado'}
                  </span>
                </div>
                <div style={{ paddingLeft: '48px', paddingBottom: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {featuresByLevel[lvl].map((f: any, fi: number) => (
                    <div key={fi} style={{
                      background: isUnlocked ? 'rgba(200,135,42,0.04)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isUnlocked ? 'rgba(200,135,42,0.2)' : 'rgba(255,255,255,0.05)'}`,
                      padding: '14px 16px', opacity: isUnlocked ? 1 : 0.4, filter: isUnlocked ? 'none' : 'grayscale(1)'
                    }}>
                      <div className="font-cinzel" style={{ color: isUnlocked ? 'var(--accent-gold)' : 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '6px' }}>{f.feature_name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>{f.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

