
import React from 'react';

export const SubclassModal = ({ formState, parentClass, socket }: any) => {
  const {
    isAddingSubclass, setIsAddingSubclass, subclassName, setSubclassName,
    subclassDesc, setSubclassDesc, subclassTraits, setSubclassTraits,
    subclassTraitName, setSubclassTraitName, subclassTraitLevel, setSubclassTraitLevel,
    subclassTraitDesc, setSubclassTraitDesc
  } = formState;

  const getValidSubclassLevels = (clsName: string, activeData: any) => {
    const name = clsName?.toLowerCase() || '';
    if (name.includes('guerrero') || name.includes('fighter')) return [3, 7, 10, 15, 18];
    if (name.includes('p�caro') || name.includes('rogue')) return [3, 9, 13, 17];
    if (name.includes('mago') || name.includes('wizard')) return [2, 6, 10, 14];
    if (name.includes('cl�rigo') || name.includes('cleric')) return [1, 2, 6, 8, 17];
    if (name.includes('palad�n') || name.includes('paladin')) return [3, 7, 15, 20];
    if (name.includes('bardo') || name.includes('bard')) return [3, 6, 14];
    if (name.includes('druida') || name.includes('druid')) return [2, 6, 10, 14];
    if (name.includes('monje') || name.includes('monk')) return [3, 6, 11, 17];
    if (name.includes('explorador') || name.includes('ranger')) return [3, 7, 11, 15];
    if (name.includes('hechicero') || name.includes('sorcerer')) return [1, 6, 14, 18];
    if (name.includes('warlock') || name.includes('brujo')) return [1, 6, 10, 14];
    if (name.includes('b�rbaro') || name.includes('barbarian')) return [3, 6, 10, 14];
    const first = activeData?.subclass_level || 3;
    return [first, first + 4, first + 7, first + 12].filter((l: number) => l <= 20);
  };

  
    if (!isAddingSubclass || !parentClass) return null;

    let activeData: any = {};
    try {
      activeData = parentClass.data ? (typeof parentClass.data === 'string' ? JSON.parse(parentClass.data) : parentClass.data) : {};
    } catch { activeData = {}; }

    const validLevels = getValidSubclassLevels(parentClass.name, activeData);

    const addSubclassTrait = () => {
      if (!subclassTraitName || !subclassTraitDesc) return alert("Nombre y descripci├│n del rasgo de subclase son requeridos.");
      const newTrait = {
        name: subclassTraitName,
        level: subclassTraitLevel,
        desc: subclassTraitDesc
      };
      setSubclassTraits([...subclassTraits, newTrait].sort((a,b) => a.level - b.level));
      setSubclassTraitName('');
      setSubclassTraitDesc('');
    };

    const removeSubclassTrait = (idx: number) => {
      setSubclassTraits(subclassTraits.filter((_: any, i: number) => i !== idx));
    };

    const handleSaveSubclass = () => {
      if (!subclassName) return alert("La subclase requiere un nombre.");
      
      const data = {
        class_parent: parentClass.name,
        description: subclassDesc,
        traits: subclassTraits
      };

      socket.emit('content:create', {
        name: subclassName,
        type: 'subclass',
        data,
        source: 'custom'
      });

      setIsAddingSubclass(false);
    };

    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, overflowY: 'auto', padding: '40px 0'
      }}>
        <div className="clipped-frame" style={{
          background: 'var(--bg-surface)', border: '2px solid var(--border-color)',
          width: '90%', maxWidth: '700px', padding: '25px', position: 'relative', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 25px 80px rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', gap: '25px'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.6rem' }}>
              AGREGAR SUBCLASE A {parentClass.name.toUpperCase()}
            </h2>
            <button onClick={() => setIsAddingSubclass(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.8rem', cursor: 'pointer' }}>Ô£ò</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
            <div>
              <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Nombre de la Subclase</label>
              <input className="mono" style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }} placeholder={`Ej: Juramento de la Devoci├│n, Asesino...`} value={subclassName} onChange={e => setSubclassName(e.target.value)} />
            </div>

            <div>
              <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Descripci├│n de la Subclase</label>
              <textarea className="mono" style={{ width: '100%', height: '100px', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none', resize: 'none' }} placeholder="Escribe el trasfondo o lore de esta especializaci├│n..." value={subclassDesc} onChange={e => setSubclassDesc(e.target.value)} />
            </div>

            {/* Agregar rasgo */}
            <div style={{ border: '1px solid var(--border-color)', padding: '15px', background: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '0.9rem' }}>­ƒøí´©Å AGREGAR RASGO DE SUBCLASE</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nombre del Rasgo</label>
                  <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={subclassTraitName} onChange={e => setSubclassTraitName(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nivel de Obtenci├│n</label>
                  <select className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={subclassTraitLevel} onChange={e => setSubclassTraitLevel(parseInt(e.target.value) || 3)}>
                    {validLevels.map(lvl => <option key={lvl} value={lvl}>Nivel {lvl}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Descripci├│n del Rasgo</label>
                <textarea className="mono" style={{ width: '100%', height: '60px', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', resize: 'none' }} value={subclassTraitDesc} onChange={e => setSubclassTraitDesc(e.target.value)} />
              </div>
              <button onClick={addSubclassTrait} className="font-cinzel torch-glow" style={{ width: '100%', background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', padding: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>+ AGREGAR RASGO DE SUBCLASE</button>
            </div>

            <div>
              <h4 className="font-cinzel" style={{ margin: '0 0 10px 0', color: 'var(--text-parchment)', fontSize: '0.95rem' }}>Rasgos de Subclase definidos ({subclassTraits.length})</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {subclassTraits.map((t: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '8px 12px', fontSize: '0.85rem' }}>
                    <div>
                      <span className="font-cinzel" style={{ fontWeight: 'bold', color: 'var(--accent-gold)' }}>Nivel {t.level} ÔÇö {t.name}</span>
                    </div>
                    <button onClick={() => removeSubclassTrait(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--combat-red)', cursor: 'pointer', fontSize: '1rem' }}>­ƒùæ´©Å</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <button onClick={() => setIsAddingSubclass(false)} className="font-cinzel" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', padding: '10px 20px', cursor: 'pointer' }}>CANCELAR</button>
            <button onClick={handleSaveSubclass} className="font-cinzel torch-glow" style={{ background: '#10b981', border: 'none', color: 'white', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold' }}>CREAR SUBCLASE</button>
          </div>
        </div>
      </div>
    );
  
};
