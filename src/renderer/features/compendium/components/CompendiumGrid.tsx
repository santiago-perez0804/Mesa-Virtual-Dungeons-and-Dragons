import { DatabaseCreateForm } from '../../../components/compendium/FormularioCrearBaseDatos';
import { ClassWizardModal } from '../../../components/compendium/ModalAsistenteClases';
import { DatabaseDetail } from '../../../components/compendium/DetalleBaseDatos';
import { SubclassModal } from '../../../components/compendium/ModalSubclase';
import { cleanNameForMatching } from './CompendiumUtils';
import { CompendiumCard } from '../../../components/ui/CartaCompendio';
import { Scroll, BarChart, BookOpen, Zap } from 'lucide-react';
import { FeatureTooltip } from '../../../components/TooltipRasgos';
import { formatDescription } from '../../../utils/formateador';

export const CompendiumGrid = ({ compendiumState, compendiumSave, formState, ...props }: any) => {
  const { 
    category, searchTerm, setSearchTerm, handleSearch, selectedClass, classesList, 
    handleImportSRD, isImportingClasses, setSelectedClass, 
    expandedTraits, setExpandedTraits, selectedFeatureClass, setSelectedFeatureClass,
    selectedFeatureLevel, setSelectedFeatureLevel, currentPage, setCurrentPage,
    hoveredCardId, setHoveredCardId, expandedRuleCategory, setExpandedRuleCategory,
    selectedItem, setSelectedItem, pagedItems, totalPages, filteredCompendium, PAGE_SIZE,
    allMergedFeatures, loadingFeatures, setSelectedFeature, classFeatures
  } = compendiumState;

  const { isCreating, isCreatingClass, setIsCreatingClass, setClassWizardStep, 
          editingClassId, setEditingClassId, setCName, setCDesc, setCHitDie, 
          setCSubclassLvl, setCSubclassTitle, setCArmors, setCWeapons, setCTools, 
          setCSaves, setCSkills, setCSkillsLimit, setCResourceName, setCResourceProg,
          setSubclassName, setSubclassDesc, setSubclassTraits, isAddingSubclass, setIsAddingSubclass } = formState;

  const { handleImageUpload, handleSave, handleDeleteFeature } = compendiumSave;
  
  const { handleEditClick, handleEditClassClick, socket, userRole, compendium, isOverlay, onCloseOverlay, openEditFeatureForm } = props;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--compendium-content-padding)', position: 'relative' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

              {category === 'class' ? (() => {
                const activeClass = selectedClass || classesList[0];
                let activeData: any = {};
                if (activeClass) {
                  try {
                    activeData = activeClass.data ? (typeof activeClass.data === 'string' ? JSON.parse(activeClass.data) : activeClass.data) : {};
                  } catch { activeData = {}; }
                }

                if (classesList.length === 0) {
                  return (
                    <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', background: 'var(--bg-base)' }}>
                      <div className="clipped-frame torch-glow" style={{
                        background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                        padding: '50px', textAlign: 'center', maxWidth: '600px',
                        boxShadow: '0 25px 80px rgba(0,0,0,0.6)'
                      }}>
                        <div style={{ fontSize: '4.5rem', marginBottom: '20px', filter: 'drop-shadow(0 0 10px var(--accent-gold))' }}>ðŸ›¡ï¸</div>
                        <h2 className="font-cinzel" style={{ margin: '0 0 15px 0', color: 'var(--text-parchment)', fontSize: '2rem' }}>El Compendio de Clases estÃ¡ VacÃ­o</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '35px' }}>
                          No se han registrado clases en la biblioteca. Conecta el archivo SRD oficial para descargar las clases bÃ¡sicas o forja tu propia clase personalizada ahora mismo.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                          <button
                            onClick={handleImportSRD}
                            disabled={isImportingClasses}
                            className="font-cinzel torch-glow"
                            style={{
                              background: 'var(--accent-gold)', border: 'none', color: 'white',
                              padding: '12px 25px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px'
                            }}
                          >
                            {isImportingClasses ? 'CONECTANDO SRD...' : 'CONECTAR ARCHIVO SRD'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingClassId(null);
                              setCName(''); setCDesc(''); setCHitDie('d8'); setCSubclassLvl(3); setCSubclassTitle('Arquetipo');
                              setCArmors([]); setCWeapons([]); setCTools(''); setCSaves([]); setCSkills([]); setCSkillsLimit(2);
                              setCResourceName(''); setCResourceProg(''); // setCTraits([]);
                              setClassWizardStep(1);
                              setIsCreatingClass!(true);
                            }}
                            className="font-cinzel"
                            style={{
                              background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-parchment)',
                              padding: '12px 25px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px'
                            }}
                          >
                            CREAR CLASE
                          </button>
                        </div>
                      </div>
                      {isCreatingClass && <ClassWizardModal formState={formState} editingClassId={editingClassId} socket={socket} />}
                    </div>
                  );
                }

                const filteredClasses = classesList.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()));

                return (
                  <div style={{ flex: 1, display: 'flex', height: '100%', overflow: 'hidden' }}>
                    <div style={{ width: '320px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.15)' }}>
                      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
                        <input
                          className="mono"
                          style={{ width: '100%', padding: '10px 15px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }}
                          placeholder="Buscar clase..."
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                        {filteredClasses.map(cls => {
                          const isActive = activeClass && activeClass.id === cls.id;
                          let cData: any = {};
                          try {
                            cData = cls.data ? (typeof cls.data === 'string' ? JSON.parse(cls.data) : cls.data) : {};
                          } catch { cData = {}; }
                          
                          return (
                            <div
                              key={cls.id}
                              className={`clipped-frame ${isActive ? 'torch-glow' : ''}`}
                              onClick={() => setSelectedClass(cls)}
                              style={{
                                padding: '15px 20px', marginBottom: '12px', cursor: 'pointer',
                                background: isActive ? 'rgba(200, 135, 42, 0.1)' : 'var(--bg-surface)',
                                border: `1px solid ${isActive ? 'var(--accent-gold)' : 'var(--border-color)'}`,
                                transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                              }}
                            >
                              <div>
                                <h4 className="font-cinzel" style={{ margin: 0, color: isActive ? 'var(--accent-gold)' : 'var(--text-parchment)', fontSize: '1.05rem' }}>{cls.name}</h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dado de Golpe: {cData.hit_dice || 'd8'}</span>
                              </div>
                              {cls.displaySource === 'srd' && <span className="font-cinzel" style={{ border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', fontSize: '0.6rem', padding: '2px 6px', fontWeight: 'bold' }}>SRD</span>}
                              {cls.displaySource === 'custom' && <span className="font-cinzel" style={{ border: '1px solid #10b981', color: '#10b981', fontSize: '0.6rem', padding: '2px 6px', fontWeight: 'bold' }}>CUSTOM</span>}
                              {cls.displaySource === 'modified' && <span className="font-cinzel" style={{ border: '1px solid #f97316', color: '#f97316', fontSize: '0.6rem', padding: '2px 6px', fontWeight: 'bold' }}>MODIFICADO</span>}
                            </div>
                          );
                        })}
                      </div>

                      {(userRole === 'admin' || userRole === 'dm') && (
                        <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
                          <button
                            className="font-cinzel torch-glow"
                            onClick={() => {
                              setEditingClassId(null);
                              setCName(''); setCDesc(''); setCHitDie('d8'); setCSubclassLvl(3); setCSubclassTitle('Arquetipo');
                              setCArmors([]); setCWeapons([]); setCTools(''); setCSaves([]); setCSkills([]); setCSkillsLimit(2);
                              setCResourceName(''); setCResourceProg(''); // setCTraits([]);
                              setClassWizardStep(1);
                              setIsCreatingClass!(true);
                            }}
                            style={{ width: '100%', padding: '12px', background: 'var(--accent-gold)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px' }}
                          >
                            + NUEVA CLASE
                          </button>
                        </div>
                      )}
                    </div>

                    {activeClass ? (
                      <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-color)', paddingBottom: '20px', marginBottom: '30px' }}>
                          <div>
                            <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '2.5rem' }}>{activeClass.name}</h2>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '8px' }}>
                              <span className="mono" style={{ color: 'var(--text-secondary)' }}>Dado de Golpe: {activeData.hit_dice ? activeData.hit_dice : <span style={{ color: '#f97316' }}>[DATO FALTANTE: hit_dice]</span>}</span>
                              <span style={{ color: 'var(--text-secondary)' }}>â€¢</span>
                              <span className="mono" style={{ color: 'var(--text-secondary)' }}>Subclase al nivel {activeData.subclass_level || 3} ({activeData.subclass_title || 'Subclase'})</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '10px' }}>
                            {(userRole === 'admin' || userRole === 'dm') && (
                              <>
                                <button
                                  className="font-cinzel"
                                  onClick={() => {
                                    setSubclassName(''); setSubclassDesc(''); setSubclassTraits([]);
                                    setIsAddingSubclass(true);
                                  }}
                                  style={{ background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}
                                >
                                  + NUEVA SUBCLASE
                                </button>
                                <>
                                  <button
                                    className="font-cinzel"
                                    onClick={() => handleEditClassClick(activeClass)}
                                    style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}
                                  >
                                    EDITAR
                                  </button>
                                  {!String(activeClass.id).startsWith('srd-') && (
                                    <button
                                      onClick={() => { if (confirm(`Â¿Eliminar la clase ${activeClass.name}?`)) socket.emit('content:delete', activeClass.id); }}
                                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--combat-red)', color: 'var(--combat-red)', padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}
                                    >
                                      ELIMINAR
                                    </button>
                                  )}
                                </>
                              </>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                          <section>
                            <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}><Scroll className="w-5 h-5 inline-block mr-2" /> Lore y DescripciÃ³n</h3>
                            <p 
                              style={{ color: 'var(--text-parchment)', lineHeight: '1.8', fontSize: '1rem' }}
                              dangerouslySetInnerHTML={{ __html: formatDescription(activeData.desc || activeData.description || '[DATO FALTANTE: description]') }}
                            />
                          </section>

                          <section>
                            <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '15px' }}>ðŸ›¡ï¸ Competencias Iniciales</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', border: '1px solid var(--border-color)' }}>
                                <div style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px' }}>Salvaciones y Habilidades</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-parchment)' }}>
                                  <div><b>Tiradas de SalvaciÃ³n:</b> {activeData.prof_saving_throws ? activeData.prof_saving_throws : <span style={{ color: '#f97316' }}>[DATO FALTANTE: prof_saving_throws]</span>}</div>
                                  <div><b>Habilidades:</b> {activeData.prof_skills ? activeData.prof_skills : <span style={{ color: '#f97316' }}>[DATO FALTANTE: prof_skills]</span>}</div>
                                </div>
                              </div>
                              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', border: '1px solid var(--border-color)' }}>
                                <div style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px' }}>Equipo y Herramientas</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-parchment)' }}>
                                  <div><b>Armaduras:</b> {activeData.prof_armor ? activeData.prof_armor : <span style={{ color: '#f97316' }}>[DATO FALTANTE: prof_armor]</span>}</div>
                                  <div><b>Armas:</b> {activeData.prof_weapons ? activeData.prof_weapons : <span style={{ color: '#f97316' }}>[DATO FALTANTE: prof_weapons]</span>}</div>
                                  <div><b>Herramientas:</b> {activeData.prof_tools ? activeData.prof_tools : <span style={{ color: '#f97316' }}>[DATO FALTANTE: prof_tools]</span>}</div>
                                </div>
                              </div>
                            </div>
                          </section>

                          <section>
                            <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '15px' }}><BarChart className="w-5 h-5 inline-block mr-2" /> Tabla de ProgresiÃ³n (Nivel 1-20)</h3>
                            {(() => {
                              const getTraitsForLevel = (lvl: number) => {
                                const merged: { name: string; desc: string; shortDesc?: string }[] = [];
                                const seen = new Set<string>();

                                // 1. Gather from local activeData.traits
                                if (activeData && activeData.traits) {
                                  activeData.traits.forEach((t: any) => {
                                    if (parseInt(t.level) === lvl) {
                                      const norm = cleanNameForMatching(t.name);
                                      if (!seen.has(norm)) {
                                        seen.add(norm);
                                        merged.push({
                                          name: t.name,
                                          desc: t.desc || t.description,
                                          shortDesc: t.short_description || ''
                                        });
                                      }
                                    }
                                  });
                                }

                                // 2. Gather from global classFeatures
                                if (classFeatures) {
                                  classFeatures.forEach((f: any) => {
                                    const isSameClass = f.class && activeClass && cleanNameForMatching(f.class) === cleanNameForMatching(activeClass.name);
                                    if (isSameClass && parseInt(f.level) === lvl) {
                                      const norm = cleanNameForMatching(f.name);
                                      if (!seen.has(norm)) {
                                        seen.add(norm);
                                        merged.push({
                                          name: f.name,
                                          desc: f.description,
                                          shortDesc: f.short_description || ''
                                        });
                                      }
                                    }
                                  });
                                }

                                return merged;
                              };

                              const resourceName = activeData.resource_name;
                              const resourceProg = activeData.resource_progression || [];
                              const isGuerrero = activeClass && (activeClass.name.toLowerCase() === 'guerrero' || activeClass.name.toLowerCase() === 'fighter');
                              
                              return (
                                <div style={{ width: '100%', overflowX: 'auto', border: '1px solid var(--border-color)' }}>
                                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                    <thead>
                                      <tr style={{ background: 'var(--bg-surface)', borderBottom: '2px solid var(--border-color)' }}>
                                        <th className="font-cinzel" style={{ padding: '12px 15px', color: 'var(--accent-gold)', borderRight: '1px solid var(--border-color)' }}>Nivel</th>
                                        <th className="font-cinzel" style={{ padding: '12px 15px', color: 'var(--accent-gold)', borderRight: '1px solid var(--border-color)' }}>Bono de Competencia</th>
                                        {isGuerrero && (
                                          <th className="font-cinzel" style={{ padding: '12px 15px', color: 'var(--accent-gold)', borderRight: '1px solid var(--border-color)' }}>Ataques Extra</th>
                                        )}
                                        <th className="font-cinzel" style={{ padding: '12px 15px', color: 'var(--accent-gold)', borderRight: '1px solid var(--border-color)' }}>Rasgos</th>
                                        {resourceName && (
                                          <th className="font-cinzel" style={{ padding: '12px 15px', color: 'var(--accent-gold)', borderRight: '1px solid var(--border-color)' }}>{resourceName}</th>
                                        )}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {Array.from({ length: 20 }, (_, i) => {
                                        const lvl = i + 1;
                                        const profBonus = `+${1 + Math.ceil(lvl / 4)}`;
                                        const traits = getTraitsForLevel(lvl);
                                        
                                        let extraAttacks = 'â€”';
                                        if (lvl >= 5 && lvl < 11) extraAttacks = '1 extra (2 ataques)';
                                        else if (lvl >= 11 && lvl < 20) extraAttacks = '2 extra (3 ataques)';
                                        else if (lvl === 20) extraAttacks = '3 extra (4 ataques)';
                                        
                                        return (
                                          <tr key={lvl} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '10px 15px', color: 'var(--text-parchment)', borderRight: '1px solid var(--border-color)', fontWeight: 'bold' }}>{lvl}Âº</td>
                                            <td style={{ padding: '10px 15px', color: 'var(--text-parchment)', borderRight: '1px solid var(--border-color)' }}>{profBonus}</td>
                                            {isGuerrero && (
                                              <td style={{ padding: '10px 15px', color: 'var(--text-parchment)', borderRight: '1px solid var(--border-color)' }}>
                                                {extraAttacks}
                                              </td>
                                            )}
                                            <td style={{ padding: '10px 15px', color: 'var(--text-parchment)', borderRight: '1px solid var(--border-color)', position: 'relative' }}>
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                                {traits.length > 0 ? (
                                                  traits.map((t: any, tIdx: number) => (
                                                    <FeatureTooltip 
                                                      key={tIdx} 
                                                      featureName={t.name} 
                                                      description={t.desc} 
                                                      shortDescription={t.shortDesc} 
                                                    />
                                                  ))
                                                ) : (
                                                  <span style={{ padding: '4px 8px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>â€”</span>
                                                )}
                                              </div>
                                            </td>
                                            {resourceName && (
                                              <td style={{ padding: '10px 15px', color: 'var(--text-parchment)', borderRight: '1px solid var(--border-color)' }}>
                                                {resourceProg[lvl - 1] || 'â€”'}
                                              </td>
                                            )}
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              );
                            })()}
                          </section>

                          <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '30px' }}>
                            <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.4rem', marginBottom: '20px' }}><BookOpen className="w-5 h-5 inline-block mr-2" /> Subclases disponibles</h3>
                            {(() => {
                              const apiSubclasses = activeData.subclasses || [];
                              const customSubclasses = compendium.filter((item: any) => {
                                if (item.type !== 'subclass') return false;
                                let sData: any = {};
                                try { sData = item.data ? (typeof item.data === 'string' ? JSON.parse(item.data) : item.data) : {}; } catch { sData = {}; }
                                return sData.class_parent?.toLowerCase() === activeClass.name?.toLowerCase();
                              }).map((item: any) => {
                                let sData: any = {};
                                try { sData = item.data ? (typeof item.data === 'string' ? JSON.parse(item.data) : item.data) : {}; } catch { sData = {}; }
                                return { id: item.id, name: item.name, desc: sData.description || sData.desc || '', traits: sData.traits || [], isCustom: true };
                              });
                              const allSubs = [...apiSubclasses, ...customSubclasses];
                              if (allSubs.length === 0) return <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>No hay subclases asociadas a esta clase. Â¡Crea una ahora!</div>;
                              return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                  {allSubs.map((sub, sIdx) => {
                                    const isExpanded = expandedTraits[`sub-${sIdx}`];
                                    return (
                                      <div key={sIdx} className="clipped-frame" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
                                        <div onClick={() => setExpandedTraits({ ...expandedTraits, [`sub-${sIdx}`]: !isExpanded })} style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}>
                                          <div>
                                            <h4 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.2rem' }}>
                                              {sub.name}{' '}
                                              {sub.isCustom ? <span style={{ border: '1px solid #10b981', color: '#10b981', fontSize: '0.55rem', padding: '2px 4px', marginLeft: '10px', verticalAlign: 'middle' }}>CUSTOM</span> : <span style={{ border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', fontSize: '0.55rem', padding: '2px 4px', marginLeft: '10px', verticalAlign: 'middle' }}>SRD</span>}
                                            </h4>
                                          </div>
                                          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                            {sub.isCustom && (userRole === 'admin' || userRole === 'dm') && (
                                              <button onClick={e => { e.stopPropagation(); if (confirm(`Â¿Eliminar la subclase ${sub.name}?`)) socket.emit('content:delete', sub.id); }} style={{ background: 'transparent', border: 'none', color: 'var(--combat-red)', cursor: 'pointer', fontSize: '1rem' }}>ðŸ—‘ï¸</button>
                                            )}
                                            <span style={{ color: 'var(--accent-gold)', fontSize: '1.2rem' }}>{isExpanded ? 'â–´' : 'â–¾'}</span>
                                          </div>
                                        </div>
                                        {isExpanded && (
                                          <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.15)' }}>
                                            <p style={{ margin: '0 0 20px 0', color: 'var(--text-parchment)', lineHeight: '1.6', fontSize: '0.95rem' }}>{sub.desc || sub.description}</p>
                                            {sub.traits && sub.traits.length > 0 && (
                                              <div>
                                                <div style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px', marginBottom: '10px' }}>Rasgos de Subclase</div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                  {sub.traits.map((st: any, stIdx: number) => (
                                                    <div key={stIdx}><span className="font-cinzel" style={{ fontWeight: 'bold', color: 'var(--text-parchment)', fontSize: '0.9rem' }}>Nivel {st.level} â€” {st.name}:</span>{' '}<span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>{st.desc || st.description}</span></div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </section>
                        </div>
                      </div>
                    ) : (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Selecciona una clase del compendio para ver su detalle</div>
                    )}
                    {isCreatingClass && <ClassWizardModal formState={formState} editingClassId={editingClassId} socket={socket} />}
                    {isAddingSubclass && <SubclassModal formState={formState} parentClass={activeClass} socket={socket} />}
                  </div>
                );
              })() : category === 'features' ? (() => {

                // Filter features
                const filteredFeatures = allMergedFeatures.filter((f: any) => {
                  const matchesSearch = f.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                        f.description?.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesClass = selectedFeatureClass === 'all' || f.class?.toLowerCase() === selectedFeatureClass.toLowerCase();
                  const matchesLevel = selectedFeatureLevel === 'all' || parseInt(f.level) === parseInt(selectedFeatureLevel);
                  return matchesSearch && matchesClass && matchesLevel;
                });

                // Class list for filter dropdown
                const uniqueClasses = Array.from(new Set(allMergedFeatures.map((f: any) => f.class))).sort() as string[];

                // Pagination logic for features (24 at a time)
                const totalFeaturePages = Math.max(1, Math.ceil(filteredFeatures.length / PAGE_SIZE));
                const pagedFeatures = filteredFeatures.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* FILTROS INTERNOS DE RASGOS */}
                    <div style={{ display: 'flex', gap: '20px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '20px', alignItems: 'center' }} className="clipped-frame">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                        <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', letterSpacing: '1px' }}>FILTRAR POR CLASE</label>
                        <select 
                          className="mono" 
                          style={{ width: '100%', padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }}
                          value={selectedFeatureClass}
                          onChange={e => { setSelectedFeatureClass(e.target.value); setCurrentPage(1); }}
                        >
                          <option value="all">Todas las Clases</option>
                          {uniqueClasses.map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '180px' }}>
                        <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', letterSpacing: '1px' }}>FILTRAR POR NIVEL</label>
                        <select 
                          className="mono" 
                          style={{ width: '100%', padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }}
                          value={selectedFeatureLevel}
                          onChange={e => { setSelectedFeatureLevel(e.target.value); setCurrentPage(1); }}
                        >
                          <option value="all">Todos los niveles</option>
                          {Array.from({ length: 20 }, (_, i) => i + 1).map(lvl => (
                            <option key={lvl} value={lvl}>Nivel {lvl}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* LISTA / GRILLA DE TARJETAS */}
                    {loadingFeatures ? (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--accent-gold)', fontSize: '1.2rem' }}>
                        Cargando rasgos...
                      </div>
                    ) : filteredFeatures.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '50px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }} className="clipped-frame">
                        No se encontraron rasgos con los filtros actuales.
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
                          {pagedFeatures.map((feat: any, idx: number) => {
                            const isHovered = hoveredCardId === (feat.id || idx.toString());
                            return (
                              <div 
                                key={feat.id || idx} 
                                className="clipped-frame torch-glow" 
                                onClick={() => setSelectedFeature(feat)}
                                onMouseEnter={() => setHoveredCardId(feat.id || idx.toString())}
                                onMouseLeave={() => setHoveredCardId(null)}
                                style={{ 
                                  background: 'var(--bg-surface)', 
                                  border: '1px solid var(--border-color)', 
                                  padding: '25px', 
                                  cursor: 'pointer', 
                                  transition: 'all 0.3s ease',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '15px',
                                  position: 'relative',
                                  minHeight: '190px',
                                  overflow: 'hidden'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span className="font-cinzel" style={{ border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', fontSize: '0.65rem', padding: '3px 8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                    {feat.class}{feat.subclass ? `: ${feat.subclass}` : ''}
                                  </span>
                                  
                                  <span className="mono" style={{ 
                                    background: 'rgba(200, 135, 42, 0.1)', 
                                    border: '1px solid rgba(200, 135, 42, 0.3)', 
                                    color: 'var(--accent-gold)',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold'
                                  }} title={`Nivel ${feat.level}`}>
                                    {feat.level}
                                  </span>
                                </div>

                                <div>
                                  <h3 className="font-cinzel" style={{ margin: '5px 0 0 0', color: 'var(--text-parchment)', fontSize: '1.25rem' }}>{feat.name}</h3>
                                </div>

                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <div style={{ width: '60px', height: '1px', background: 'var(--border-color)' }} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', letterSpacing: '1px' }}>
                                    <span>HAZ CLIC PARA DETALLES</span> <span>ðŸ¡’</span>
                                  </div>
                                </div>

                                {/* HOVER OVERLAY FOR SHORT DESCRIPTION */}
                                <div 
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    background: 'rgba(16, 12, 8, 0.98)',
                                    border: '1px solid var(--accent-gold)',
                                    padding: '25px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    opacity: isHovered ? 1 : 0,
                                    transition: 'opacity 0.2s ease',
                                    pointerEvents: 'none',
                                    zIndex: 2
                                  }}
                                >
                                  <div className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.7rem', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}><Zap className="w-3 h-3 inline-block mr-1" /> RESUMEN</div>
                                  <p style={{
                                    margin: 0,
                                    color: 'var(--text-parchment)',
                                    fontSize: '0.85rem',
                                    lineHeight: '1.6',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 4,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    fontFamily: 'var(--font-body)'
                                  }}>
                                    {feat.short_description || (feat.description ? (feat.description.slice(0, 110) + (feat.description.length > 110 ? '...' : '')) : 'Sin resumen.')}
                                  </p>
                                </div>

                                {/* EDIT/DELETE ACTIONS (rendered on top of hover overlay if user is admin) */}
                                {(userRole === 'admin' || userRole === 'dm') && (
                                  <div 
                                    style={{ 
                                      position: 'absolute', 
                                      bottom: '15px', 
                                      left: '25px', 
                                      right: '25px', 
                                      display: isHovered ? 'flex' : 'none', 
                                      gap: '15px', 
                                      zIndex: 3 
                                    }}
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); openEditFeatureForm(feat); }} 
                                      className="font-cinzel" 
                                      style={{ flex: 1, background: 'rgba(200, 135, 42, 0.1)', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)', padding: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                                    >
                                      EDITAR
                                    </button>
                                    {feat.id && !isNaN(Number(feat.id)) ? (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteFeature(feat.id); }} 
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--combat-red)', border: '1px solid var(--combat-red)', padding: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
                                      >
                                        ðŸ—‘ï¸
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); alert("Los rasgos nativos o integrados del sistema no se pueden eliminar, pero puedes editarlos para modificarlos."); }} 
                                        style={{ background: 'transparent', color: 'var(--text-secondary)', opacity: 0.5, border: 'none', padding: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
                                        title="Los rasgos base del sistema no se pueden eliminar, solo editar."
                                      >
                                        ðŸ—‘ï¸
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {totalFeaturePages > 1 && (
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '50px' }}>
                            <button 
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="font-cinzel"
                              style={{ background: 'transparent', border: '1px solid var(--border-color)', color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--text-parchment)', padding: '8px 20px', cursor: 'pointer' }}
                            >ANTERIOR</button>
                            <span className="mono" style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>PÃGINA {currentPage} DE {totalFeaturePages}</span>
                            <button 
                              onClick={() => setCurrentPage(p => Math.min(totalFeaturePages, p + 1))}
                              disabled={currentPage === totalFeaturePages}
                              className="font-cinzel"
                              style={{ background: 'transparent', border: '1px solid var(--border-color)', color: currentPage === totalFeaturePages ? 'var(--text-secondary)' : 'var(--text-parchment)', padding: '8px 20px', cursor: 'pointer' }}
                            >SIGUIENTE</button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })() : (
                <>

                    {isCreating ? (<DatabaseCreateForm formState={formState} handleImageUpload={handleImageUpload} handleSave={handleSave} userRole={userRole} />) : category === 'rule' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '10px' }}>
                        {(() => {
                          const baseCategories = [
                            "1. El Turno de Combate (Acciones y Estructura)",
                            "2. Reglas de Lanzamiento de Conjuros (Spellcasting)",
                            "3. Condiciones del Estado (Conditions)",
                            "4. MecÃ¡nicas del Entorno y Supervivencia",
                            "5. Pruebas de CaracterÃ­stica y Combate Avanzado",
                            "Otras Reglas"
                          ];
                          const groups: Record<string, any[]> = {};
                          baseCategories.forEach(c => groups[c] = []);
                          
                          // Use filteredCompendium to group ALL rules, ignoring pagination size
                          filteredCompendium.forEach((item: any) => {
                            let data = item.data;
                            if (typeof data === 'string') {
                              try { data = JSON.parse(data); } catch(e) {}
                            }
                            const cat = (data && data.category) || "Otras Reglas";
                            if (!groups[cat]) groups[cat] = [];
                            groups[cat].push(item);
                          });

                          return baseCategories.concat(Object.keys(groups).filter(k => !baseCategories.includes(k))).map(cat => {
                            const itemsInCat = groups[cat] || [];
                            if (itemsInCat.length === 0 && cat === "Otras Reglas") return null;
                            const isExpanded = expandedRuleCategory === cat;
                            return (
                              <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div
                                  onClick={() => setExpandedRuleCategory(isExpanded ? null : cat)}
                                  className="font-cinzel"
                                  style={{
                                    padding: '20px',
                                    background: isExpanded ? 'rgba(255,215,0,0.05)' : 'var(--bg-base)',
                                    border: '1px solid var(--border-color)',
                                    borderLeft: '4px solid var(--accent-gold)',
                                    color: 'var(--accent-gold)',
                                    fontSize: '1.25rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                  }}
                                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,215,0,0.05)'; e.currentTarget.style.transform = 'translateX(5px)'; }}
                                  onMouseOut={(e) => { e.currentTarget.style.background = isExpanded ? 'rgba(255,215,0,0.05)' : 'var(--bg-base)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <Scroll className="w-6 h-6 opacity-80" />
                                    <span style={{ letterSpacing: '1px' }}>{cat}</span>
                                  </div>
                                  <span style={{ fontSize: '0.9rem', opacity: 0.7, fontFamily: 'sans-serif' }}>
                                    {itemsInCat.length} {itemsInCat.length === 1 ? 'mÃ³dulo' : 'mÃ³dulos'} {isExpanded ? 'â–²' : 'â–¼'}
                                  </span>
                                </div>
                                {isExpanded && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '20px', paddingLeft: '10px', borderLeft: '2px solid rgba(255,215,0,0.2)' }}>
                                    {itemsInCat.map(item => (
                                      <div
                                        key={item.id}
                                        onClick={() => setSelectedItem(item)}
                                        className="font-cinzel"
                                        style={{
                                          padding: '12px 16px',
                                          background: 'rgba(0,0,0,0.2)',
                                          border: '1px solid var(--border-color)',
                                          color: 'var(--text-primary)',
                                          fontSize: '1.05rem',
                                          cursor: 'pointer',
                                          transition: 'all 0.2s',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '10px'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,215,0,0.1)'; e.currentTarget.style.color = 'var(--accent-gold)'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.2)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                      >
                                        <div style={{ width: '6px', height: '6px', background: 'var(--accent-gold)', borderRadius: '50%' }}></div>
                                        {item.name}
                                      </div>
                                    ))}
                                    {itemsInCat.length === 0 && (
                                      <div style={{ padding: '10px', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                                        No hay mÃ³dulos en esta categorÃ­a aÃºn.
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(var(--compendium-grid-minmax), 1fr))', gap: 'var(--compendium-grid-gap)' }}>
                        {pagedItems.map((item: any) => {
                          let data: any = {};
                          try {
                            data = item.data ? (typeof item.data === 'string' ? JSON.parse(item.data) : item.data) : {};
                          } catch { data = {}; }
                          if (!data) data = {};
                          return (
                            <CompendiumCard
                              key={item.id}
                              title={item.name}
                              subtitle={(() => {
                                if (item.type === 'monster') {
                                  const cr = data.cr ?? data.challenge_rating ?? '?';
                                  const size = data.size || '';
                                  const type = data.type || '';
                                  return [size, type, `CR ${cr}`].filter(Boolean).join(' Â· ');
                                }
                                if (item.type === 'spell') {
                                  const level = data.level !== undefined ? (data.level === 0 ? 'Truco' : `Nivel ${data.level}`) : '';
                                  const school = typeof data.school === 'object' ? data.school?.name : data.school;
                                  return [level, school].filter(Boolean).join(' Â· ');
                                }
                                if (item.type === 'item') {
                                  const cat = data.equipment_category?.name || data.category || '';
                                  const rarity = data.rarity || '';
                                  return [cat, rarity].filter(Boolean).join(' Â· ');
                                }
                                if (item.type === 'language') {
                                  const type = data.type || '';
                                  const script = data.script || '';
                                  return [type, script ? `Escritura: ${script}` : ''].filter(Boolean).join(' Â· ');
                                }
                                const desc = data.description || data.desc || '';
                                const descStr = Array.isArray(desc) ? desc.join(' ') : String(desc);
                                return descStr.slice(0, 80) + (descStr.length > 80 ? '...' : '');
                              })()}
                              image={data.image}
                              chips={[{ label: item.type, variant: 'primary' }]}
                              onClick={() => setSelectedItem(item)}
                            >
                              {userRole === 'admin' && (
                                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                                  <button onClick={(e) => { e.stopPropagation(); handleEditClick(item); }} className="font-cinzel" style={{ flex: 1, background: 'transparent', color: 'var(--text-parchment)', border: '1px solid var(--border-color)', padding: '8px', cursor: 'pointer', fontSize: '0.75rem' }}>EDITAR</button>
                                  <button onClick={(e) => { e.stopPropagation(); if (confirm(`Â¿Eliminar ${item.name}?`)) socket.emit('content:delete', item.id); }} style={{ background: 'transparent', color: 'var(--combat-red)', border: 'none', padding: '8px', cursor: 'pointer', fontSize: '1.1rem' }}>ðŸ—‘ï¸</button>
                                </div>
                              )}
                            </CompendiumCard>
                          );
                        })}
                      </div>
                    )}

                    {!isCreating && totalPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '50px' }}>
                        <button 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="font-cinzel"
                          style={{ background: 'transparent', border: '1px solid var(--border-color)', color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--text-parchment)', padding: '8px 20px', cursor: 'pointer' }}
                        >ANTERIOR</button>
                        <span className="mono" style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>PÃGINA {currentPage} DE {totalPages}</span>
                        <button 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="font-cinzel"
                          style={{ background: 'transparent', border: '1px solid var(--border-color)', color: currentPage === totalPages ? 'var(--text-secondary)' : 'var(--text-parchment)', padding: '8px 20px', cursor: 'pointer' }}
                        >SIGUIENTE</button>
                      </div>
                    )}
                </>
              )}

              {selectedItem && category !== 'class' && (
                <DatabaseDetail selectedItem={selectedItem} setSelectedItem={setSelectedItem} isOverlay={isOverlay} onCloseOverlay={onCloseOverlay} userRole={userRole} />
              )}
      </div>
    </div>
  );
};
