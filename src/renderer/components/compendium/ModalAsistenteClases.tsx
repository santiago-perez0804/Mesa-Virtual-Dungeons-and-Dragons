
import React from 'react';
import { ClipboardList } from 'lucide-react';

export const ClassWizardModal = ({ formState, editingClassId, socket }: any) => {
  const {
    isCreatingClass, setIsCreatingClass, classWizardStep, setClassWizardStep,
    cName, setCName, cDesc, setCDesc, cHitDie, setCHitDie, cSubclassLvl, setCSubclassLvl,
    cSubclassTitle, setCSubclassTitle, cArmors, setCArmors, cWeapons, setCWeapons,
    cTools, setCTools, cSaves, setCSaves, cSkills, setCSkills, cSkillsLimit, setCSkillsLimit,
    cResourceName, setCResourceName, cResourceProg, setCResourceProg
  } = formState;

  const generateTableMarkdown = (resourceName: string, resourceProg: string[], traitsList: any[]) => {
    let headers = ['Nivel', 'Bono de Competencia', 'Rasgos'];
    if (resourceName) headers.push(resourceName);
    let headerLine = '| ' + headers.join(' | ') + ' |';
    let dividerLine = '| ' + headers.map(() => '---').join(' | ') + ' |';
    let rows: string[] = [];
    for (let lvl = 1; lvl <= 20; lvl++) {
      const profBonus = '+' + (1 + Math.ceil(lvl / 4));
      const lvlTraits = traitsList.filter((t: any) => parseInt(t.level) === lvl).map((t: any) => t.name).join(', ');
      let cells = [lvl + '�', profBonus, lvlTraits || 'Mejora de Caracter�stica'];
      if (resourceName) cells.push(resourceProg[lvl - 1] || '�');
      rows.push('| ' + cells.join(' | ') + ' |');
    }
    return [headerLine, dividerLine, ...rows].join('\n');
  };

  
    if (!isCreatingClass) return null;

    const steps = [
      { num: 1, name: 'Identidad' },
      { num: 2, name: 'Competencias' },
      { num: 3, name: 'Recursos' },
      { num: 4, name: 'Revisión' }
    ];

    const armorOptions = ['Acolchada', 'Cuero', 'Piel', 'Cota de Malla', 'Placas', 'Escudos', 'Todas las armaduras'];
    const weaponOptions = ['Armas Simples', 'Armas Marciales', 'Ballestas de mano', 'Espadas cortas', 'Estoques'];
    const saveOptions = ['Fuerza', 'Destreza', 'Constitución', 'Inteligencia', 'Sabiduría', 'Carisma'];
    const skillOptions = [
      'Atletismo', 'Acrobacias', 'Juego de Manos', 'Sigilo',
      'Arcanos', 'Historia', 'Investigación', 'Naturaleza', 'Religión',
      'Trato con Animales', 'Intuición', 'Medicina', 'Percepción', 'Supervivencia',
      'Engaño', 'Intimidación', 'Interpretación', 'Persuasión'
    ];

    const handleArmorToggle = (val: string) => {
      setCArmors(cArmors.includes(val) ? cArmors.filter(x => x !== val) : [...cArmors, val]);
    };

    const handleWeaponToggle = (val: string) => {
      setCWeapons(cWeapons.includes(val) ? cWeapons.filter(x => x !== val) : [...cWeapons, val]);
    };

    const handleSaveToggle = (val: string) => {
      if (cSaves.includes(val)) {
        setCSaves(cSaves.filter(x => x !== val));
      } else {
        if (cSaves.length >= 2) {
          setCSaves([cSaves[1], val]);
        } else {
          setCSaves([...cSaves, val]);
        }
      }
    };

    const handleSkillToggle = (val: string) => {
      if (cSkills.includes(val)) {
        setCSkills(cSkills.filter(x => x !== val));
      } else {
        if (cSkills.length < cSkillsLimit) {
          setCSkills([...cSkills, val]);
        } else {
          alert(`Solo puedes elegir hasta ${cSkillsLimit} habilidades.`);
        }
      }
    };

    const handleSaveClass = () => {
      if (!cName) return alert("La clase requiere un nombre.");
      
      const data = {
        description: cDesc,
        hit_dice: cHitDie,
        subclass_level: cSubclassLvl,
        subclass_title: cSubclassTitle,
        prof_saving_throws: cSaves.join(', '),
        prof_skills: cSkills.join(', '),
        prof_armor: cArmors.join(', '),
        prof_weapons: cWeapons.join(', '),
        prof_tools: cTools,
        resource_name: cResourceName,
        resource_progression: cResourceProg,
        table: generateTableMarkdown(cResourceName, cResourceProg, []),
        traits: []
      };

      if (editingClassId && !String(editingClassId).startsWith('srd-')) {
        socket.emit('content:update', { id: editingClassId, name: cName, type: 'class', data });
      } else {
        socket.emit('content:create', { name: cName, type: 'class', data, source: 'custom' });
      }

      setIsCreatingClass(false);
    };

    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, overflowY: 'auto', padding: '40px 0'
      }}>
        <div className="clipped-frame" style={{
          background: 'var(--bg-surface)', border: '2px solid var(--border-color)',
          width: '90%', maxWidth: '800px', padding: '25px', position: 'relative', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 25px 80px rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', gap: '30px'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.8rem' }}>
              {editingClassId ? 'FORJAR CLASE MODIFICADA' : 'FORJAR NUEVA CLASE'}
            </h2>
            <button onClick={() => setIsCreatingClass(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.8rem', cursor: 'pointer' }}>Ô£ò</button>
          </div>

          {/* Steps Indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
            {steps.map(s => (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="mono" style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: classWizardStep === s.num ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                  color: classWizardStep === s.num ? 'white' : 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem',
                  border: `1px solid ${classWizardStep === s.num ? 'var(--accent-gold)' : 'var(--border-color)'}`
                }}>{s.num}</span>
                <span className="font-cinzel" style={{
                  color: classWizardStep === s.num ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  fontSize: '0.85rem', fontWeight: classWizardStep === s.num ? 'bold' : 'normal'
                }}>{s.name}</span>
              </div>
            ))}
          </div>

          {/* Step Contents */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '55vh', overflowY: 'auto', paddingRight: '10px' }}>
            {classWizardStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Nombre de la Clase</label>
                  <input className="mono" style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }} placeholder="Ej: Guerrero, Bárbaro..." value={cName} onChange={e => setCName(e.target.value)} />
                </div>
                <div>
                  <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Descripción / Lore de la Clase</label>
                  <textarea className="mono" style={{ width: '100%', height: '120px', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none', resize: 'none' }} placeholder="Escribe el lore o historia de la clase..." value={cDesc} onChange={e => setCDesc(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <div>
                    <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Dado de Golpe</label>
                    <select className="mono" style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)' }} value={cHitDie} onChange={e => setCHitDie(e.target.value)}>
                      {['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].map(hd => <option key={hd} value={hd}>{hd}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Nivel de Subclase</label>
                    <input className="mono" type="number" min="1" max="20" style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)' }} value={cSubclassLvl} onChange={e => setCSubclassLvl(parseInt(e.target.value) || 3)} />
                  </div>
                  <div>
                    <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Título de Elección</label>
                    <input className="mono" style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)' }} placeholder="Ej: Arquetipo, Colegio..." value={cSubclassTitle} onChange={e => setCSubclassTitle(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {classWizardStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div>
                  <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Tiradas de Salvación (Elige exactamente 2)</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {saveOptions.map(save => {
                      const selected = cSaves.includes(save);
                      return (
                        <button key={save} onClick={() => handleSaveToggle(save)} className="mono" style={{
                          padding: '8px 16px', background: selected ? 'rgba(200, 135, 42, 0.2)' : 'var(--bg-base)',
                          border: `1px solid ${selected ? 'var(--accent-gold)' : 'var(--border-color)'}`,
                          color: selected ? 'var(--accent-gold)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s'
                        }}>{save}</button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Competencias en Armaduras</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {armorOptions.map(a => (
                        <label key={a} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-parchment)', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input type="checkbox" checked={cArmors.includes(a)} onChange={() => handleArmorToggle(a)} /> {a}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Competencias en Armas</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {weaponOptions.map(w => (
                        <label key={w} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-parchment)', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input type="checkbox" checked={cWeapons.includes(w)} onChange={() => handleWeaponToggle(w)} /> {w}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'flex-end' }}>
                  <div>
                    <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Herramientas y Otros</label>
                    <input className="mono" style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)' }} placeholder="Ej: Herramientas de Ladrón..." value={cTools} onChange={e => setCTools(e.target.value)} />
                  </div>
                  <div>
                    <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Límite Habilidades</label>
                    <input className="mono" type="number" min="1" max="10" style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)' }} value={cSkillsLimit} onChange={e => setCSkillsLimit(parseInt(e.target.value) || 2)} />
                  </div>
                </div>

                <div>
                  <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Elegir Habilidades Disponibles</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                    {skillOptions.map(sk => {
                      const selected = cSkills.includes(sk);
                      return (
                        <button key={sk} onClick={() => handleSkillToggle(sk)} className="mono" style={{
                          padding: '6px', background: selected ? 'rgba(200, 135, 42, 0.15)' : 'var(--bg-base)',
                          border: `1px solid ${selected ? 'var(--accent-gold)' : 'var(--border-color)'}`,
                          color: selected ? 'var(--accent-gold)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.1s', fontSize: '0.75rem'
                        }}>{sk}</button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {classWizardStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Nombre del Recurso de Clase (Opcional)</label>
                  <input className="mono" style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }} placeholder="Ej: Puntos de Furia, Puntos de Ki..." value={cResourceName} onChange={e => setCResourceName(e.target.value)} />
                </div>

                {cResourceName && (
                  <div>
                    <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '12px' }}>Progreso del Recurso por Nivel (1-20)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                      {Array(20).fill(0).map((_, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span className="mono" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', width: '30px' }}>N{i+1}:</span>
                          <input className="mono" style={{ width: '60px', padding: '6px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', textAlign: 'center' }} placeholder="ÔÇö" value={cResourceProg[i]} onChange={e => {
                            const newProg = [...cResourceProg];
                            newProg[i] = e.target.value;
                            setCResourceProg(newProg);
                          }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {classWizardStep === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', background: 'rgba(0,0,0,0.15)', padding: '25px', border: '1px solid var(--border-color)' }}>
                <h3 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.6rem', textAlign: 'center' }}><ClipboardList className="w-6 h-6 inline-block mr-2" /> REVISIÓN DE LA CREACIÓN</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', color: 'var(--text-parchment)', fontSize: '0.95rem' }}>
                  <div><b>Nombre de la Clase:</b> {cName || <span style={{ color: 'red' }}>Requerido</span>}</div>
                  <div><b>Dado de Golpe:</b> {cHitDie}</div>
                  <div><b>Descripción / Lore:</b> <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', margin: '5px 0 0 0', fontSize: '0.85rem' }}>{cDesc || 'Sin descripción.'}</p></div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                    <div>
                      <div style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '5px' }}>Competencias</div>
                      <div><b>Salvaciones:</b> {cSaves.join(', ') || 'Ninguna'}</div>
                      <div><b>Armadura:</b> {cArmors.join(', ') || 'Ninguna'}</div>
                      <div><b>Armas:</b> {cWeapons.join(', ') || 'Ninguna'}</div>
                      <div><b>Herramientas:</b> {cTools || 'Ninguna'}</div>
                      <div><b>Habilidades:</b> {cSkills.join(', ') || 'Ninguna'}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '5px' }}>Estructura</div>
                      <div><b>Subclase:</b> Nivel {cSubclassLvl} ({cSubclassTitle})</div>
                      <div><b>Recurso:</b> {cResourceName || 'Ninguno'}</div>
                      <div><b>Tabla Progresión:</b> Se generará una tabla del nivel 1 al 20 vacía de rasgos por defecto.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <button
              disabled={classWizardStep === 1}
              onClick={() => setClassWizardStep(classWizardStep - 1)}
              className="font-cinzel"
              style={{
                background: 'transparent', border: '1px solid var(--border-color)', color: classWizardStep === 1 ? 'var(--text-secondary)' : 'var(--text-parchment)',
                padding: '10px 20px', cursor: classWizardStep === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              ATRÁS
            </button>

            {classWizardStep < 4 ? (
              <button
                onClick={() => setClassWizardStep(classWizardStep + 1)}
                className="font-cinzel torch-glow"
                style={{ background: 'var(--accent-gold)', border: 'none', color: 'white', padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                SIGUIENTE
              </button>
            ) : (
              <button
                onClick={handleSaveClass}
                className="font-cinzel torch-glow"
                style={{ background: '#10b981', border: 'none', color: 'white', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {editingClassId ? 'GUARDAR CAMBIOS' : 'FORJAR CLASE'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  
};
