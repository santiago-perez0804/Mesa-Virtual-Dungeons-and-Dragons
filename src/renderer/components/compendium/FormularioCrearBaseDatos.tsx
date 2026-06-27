
import { Ghost, Scroll, Swords, Camera, Search, RefreshCw } from 'lucide-react';
import { ACTION_TYPES, DAMAGE_TYPES } from '../../modules/compendium/compendio.traducciones';

export const DatabaseCreateForm = ({ formState, handleImageUpload, handleSave }: any) => {
  const {
    setIsCreating, editingId, createType, createName, setCreateName,
    createImage, createDesc, setCreateDesc, createShortDesc, setCreateShortDesc,
    createSpellLevel, setCreateSpellLevel, createSpellComponents, setCreateSpellComponents,
    createSpellRange, setCreateSpellRange, createSpellDuration, setCreateSpellDuration,
    createSpellConcentration, setCreateSpellConcentration, createHp, setCreateHp,
    createAc, setCreateAc, createCr, setCreateCr, createSpeed, setCreateSpeed,
    createStats, setCreateStats, createAttacks, setCreateAttacks, createVuln, setCreateVuln,
    createRes, setCreateRes, createImm, setCreateImm,
    createTraits, setCreateTraits, createRarity, setCreateRarity, isDamageItem, setIsDamageItem,
    itemAttackBonus, setItemAttackBonus, itemDamageFormula, setItemDamageFormula,
    itemDamageType, setItemDamageType, createTags, setCreateTags, createArmorType, setCreateArmorType,
    createRequiresAttunement, setCreateRequiresAttunement, createWeight, setCreateWeight,
    isProtectItem, setIsProtectItem, itemDefenseBonus, setItemDefenseBonus,
    itemAttackName, setItemAttackName, itemStatMod, setItemStatMod,
    itemStatSelection, setItemStatSelection, itemTargetsCount, setItemTargetsCount,
    itemCritDamage, setItemCritDamage,
    imageZoom, setImageZoom, imagePosX, setImagePosX, imagePosY, setImagePosY,
    isDragging, setIsDragging, dragStart, setDragStart
  } = formState;

  return (
    
                      <div className="clipped-frame" style={{ background: 'var(--bg-surface)', padding: '40px', border: '1px solid var(--border-color)', boxShadow: '0 25px 80px rgba(0,0,0,0.8)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                          <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)' }}>
                            {editingId 
                              ? (createType === 'monster' ? <><Ghost className="w-4 h-4 inline-block mr-1" /> EDITAR MONSTRUO</> : createType === 'spell' ? <><Scroll className="w-4 h-4 inline-block mr-1" /> EDITAR HECHIZO</> : <><Swords className="w-4 h-4 inline-block mr-1" /> EDITAR OBJETO</>) 
                              : (createType === 'monster' ? <><Ghost className="w-4 h-4 inline-block mr-1" /> NUEVO MONSTRUO</> : createType === 'spell' ? <><Scroll className="w-4 h-4 inline-block mr-1" /> NUEVO HECHIZO</> : <><Swords className="w-4 h-4 inline-block mr-1" /> NUEVO OBJETO</>)
                            }
                          </h2>
                          <button onClick={() => setIsCreating(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '2rem', cursor: 'pointer' }}>Ô£ò</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', marginBottom: '30px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div 
                              onMouseDown={(e) => {
                                if (!createImage) return;
                                e.preventDefault();
                                setIsDragging(true);
                                setDragStart({ x: e.clientX - imagePosX, y: e.clientY - imagePosY });
                              }}
                              onMouseMove={(e) => {
                                if (!isDragging) return;
                                setImagePosX(e.clientX - dragStart.x);
                                setImagePosY(e.clientY - dragStart.y);
                              }}
                              onMouseUp={() => setIsDragging(false)}
                              onMouseLeave={() => setIsDragging(false)}
                              style={{ 
                                width: '100%', 
                                aspectRatio: '1/1', 
                                background: 'var(--bg-base)', 
                                border: '2px dashed var(--border-color)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                cursor: createImage ? (isDragging ? 'grabbing' : 'grab') : 'pointer', 
                                overflow: 'hidden', 
                                position: 'relative' 
                              }}
                              onClick={() => { 
                                if (!createImage) {
                                  document.getElementById('imageUpload')?.click(); 
                                }
                              }}
                            >
                              {createImage ? (
                                <img 
                                  src={createImage} 
                                  alt="" 
                                  draggable={false}
                                  style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                    transform: `translate(${imagePosX}px, ${imagePosY}px) scale(${imageZoom})`,
                                    transformOrigin: 'center',
                                    transition: isDragging ? 'none' : 'transform 0.1s ease',
                                    pointerEvents: 'none'
                                  }} 
                                />
                              ) : (
                                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}><><Camera className="w-4 h-4 inline-block mr-1" /> Cargar Imagen</></div>
                              )}
                              <input id="imageUpload" type="file" hidden accept="image/*" onChange={handleImageUpload} />
                            </div>

                            {createImage && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.15)', padding: '12px', border: '1px solid var(--border-color)', marginTop: '-10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '0.5px' }}><><Search className="w-3 h-3 inline-block mr-1" /> ZOOM DE IMAGEN</></span>
                                  <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{imageZoom.toFixed(2)}x</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="1" 
                                  max="4" 
                                  step="0.05" 
                                  value={imageZoom} 
                                  onChange={e => setImageZoom(parseFloat(e.target.value))} 
                                  style={{ width: '100%', accentColor: 'var(--accent-gold)', cursor: 'pointer' }}
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '5px' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setImagePosX(0);
                                      setImagePosY(0);
                                      setImageZoom(1);
                                    }}
                                    className="font-cinzel"
                                    style={{ 
                                      background: 'transparent', 
                                      border: '1px solid var(--border-color)', 
                                      color: 'var(--text-secondary)', 
                                      padding: '6px', 
                                      fontSize: '0.65rem', 
                                      cursor: 'pointer',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-parchment)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                                  >
                                    <><RefreshCw className="w-3 h-3 inline-block mr-1" /> REINICIAR</>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => document.getElementById('imageUpload')?.click()}
                                    className="font-cinzel"
                                    style={{ 
                                      background: 'transparent', 
                                      border: '1px solid var(--accent-gold)', 
                                      color: 'var(--accent-gold)', 
                                      padding: '6px', 
                                      fontSize: '0.65rem', 
                                      cursor: 'pointer',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,135,42,0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <><Camera className="w-3 h-3 inline-block mr-1" /> CAMBIAR</>
                                  </button>
                                </div>
                              </div>
                            )}

                            {createType === 'item' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Rareza del Objeto</label>
                                    <select className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={createRarity} onChange={e => setCreateRarity(e.target.value)}>
                                      {['Común', 'Poco Común', 'Raro', 'Muy Raro', 'Legendario', 'Artefacto'].map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                                    </select>
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Peso (kg)</label>
                                    <input className="mono" type="text" placeholder="Ej: 2 o 1.5" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }} value={createWeight} onChange={e => setCreateWeight(e.target.value)} />
                                  </div>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.15)', padding: '15px', border: '1px solid var(--border-color)' }}>
                                  <label style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>Propiedades del Objeto</label>
                                  <div style={{ display: 'flex', gap: '15px', justifyContent: 'space-around', padding: '5px 0' }}>
                                    
                                    {/* Botón Daño (Espada) */}
                                    <button
                                      type="button"
                                      onClick={() => setIsDamageItem(!isDamageItem)}
                                      title={isDamageItem ? "Hace Daño: ACTIVO" : "Activar: Hace Daño"}
                                      style={{
                                        width: '45px',
                                        height: '45px',
                                        fontSize: '1.4rem',
                                        background: isDamageItem ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-base)',
                                        border: `2px solid ${isDamageItem ? '#ef4444' : 'var(--border-color)'}`,
                                        boxShadow: isDamageItem ? '0 0 10px rgba(239, 68, 68, 0.3)' : 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease',
                                        borderRadius: '4px',
                                        opacity: isDamageItem ? 1 : 0.4
                                      }}
                                      onMouseEnter={e => {
                                        e.currentTarget.style.opacity = '1';
                                        if (!isDamageItem) e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                                      }}
                                      onMouseLeave={e => {
                                        e.currentTarget.style.opacity = isDamageItem ? '1' : '0.4';
                                        if (!isDamageItem) e.currentTarget.style.borderColor = 'var(--border-color)';
                                      }}
                                    >
                                      ÔÜö´©Å
                                    </button>

                                    {/* Botón Escudo (Protege) */}
                                    <button
                                      type="button"
                                      onClick={() => setIsProtectItem(!isProtectItem)}
                                      title={isProtectItem ? "Protege: ACTIVO" : "Activar: Protege"}
                                      style={{
                                        width: '45px',
                                        height: '45px',
                                        fontSize: '1.4rem',
                                        background: isProtectItem ? 'rgba(74, 222, 128, 0.2)' : 'var(--bg-base)',
                                        border: `2px solid ${isProtectItem ? '#4ade80' : 'var(--border-color)'}`,
                                        boxShadow: isProtectItem ? '0 0 10px rgba(74, 222, 128, 0.3)' : 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease',
                                        borderRadius: '4px',
                                        opacity: isProtectItem ? 1 : 0.4
                                      }}
                                      onMouseEnter={e => {
                                        e.currentTarget.style.opacity = '1';
                                        if (!isProtectItem) e.currentTarget.style.borderColor = 'rgba(74, 222, 128, 0.5)';
                                      }}
                                      onMouseLeave={e => {
                                        e.currentTarget.style.opacity = isProtectItem ? '1' : '0.4';
                                        if (!isProtectItem) e.currentTarget.style.borderColor = 'var(--border-color)';
                                      }}
                                    >
                                      ­ƒøí´©Å
                                    </button>

                                    {/* Botón Sintonización (Cadena) */}
                                    <button
                                      type="button"
                                      onClick={() => setCreateRequiresAttunement(!createRequiresAttunement)}
                                      title={createRequiresAttunement ? "Requiere Sintonización: ACTIVO" : "Activar: Requiere Sintonización"}
                                      style={{
                                        width: '45px',
                                        height: '45px',
                                        fontSize: '1.4rem',
                                        background: createRequiresAttunement ? 'rgba(200, 135, 42, 0.2)' : 'var(--bg-base)',
                                        border: `2px solid ${createRequiresAttunement ? 'var(--accent-gold)' : 'var(--border-color)'}`,
                                        boxShadow: createRequiresAttunement ? '0 0 10px rgba(200, 135, 42, 0.3)' : 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease',
                                        borderRadius: '4px',
                                        opacity: createRequiresAttunement ? 1 : 0.4
                                      }}
                                      onMouseEnter={e => {
                                        e.currentTarget.style.opacity = '1';
                                        if (!createRequiresAttunement) e.currentTarget.style.borderColor = 'rgba(200, 135, 42, 0.5)';
                                      }}
                                      onMouseLeave={e => {
                                        e.currentTarget.style.opacity = createRequiresAttunement ? '1' : '0.4';
                                        if (!createRequiresAttunement) e.currentTarget.style.borderColor = 'var(--border-color)';
                                      }}
                                    >
                                      ­ƒöù
                                    </button>
                                  </div>
                                </div>

                                {isProtectItem && (
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Bono Defensa / CA (Ej: +2)</label>
                                    <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={itemDefenseBonus} onChange={e => setItemDefenseBonus(e.target.value)} />
                                  </div>
                                )}
                              </div>
                            )}

                            {createType === 'item' && (
                              <div>
                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Categoría / Tag</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                  {['arma', 'armadura', 'consumible', 'artefacto'].map(tag => (
                                    <button
                                      key={tag}
                                      onClick={() => {
                                        if (createTags.includes(tag)) setCreateTags(createTags.filter(t => t !== tag));
                                        else setCreateTags([...createTags, tag]);
                                      }}
                                      className="font-cinzel"
                                      style={{
                                        flex: 1, padding: '8px', fontSize: '0.7rem', cursor: 'pointer',
                                        background: createTags.includes(tag) ? 'var(--accent-gold)' : 'var(--bg-base)',
                                        color: createTags.includes(tag) ? 'black' : 'var(--text-secondary)',
                                        border: `1px solid ${createTags.includes(tag) ? 'var(--accent-gold)' : 'var(--border-color)'}`
                                      }}
                                    >
                                      {tag.toUpperCase()}
                                    </button>
                                  ))}
                                </div>
                                {createTags.includes('armadura') && (
                                  <div style={{ marginTop: '15px' }}>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Tipo de Armadura</label>
                                    <select 
                                      className="mono" 
                                      style={{ width: '100%', padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }} 
                                      value={createArmorType} 
                                      onChange={e => setCreateArmorType(e.target.value)}
                                    >
                                      <option value="ligera">­ƒøí´©Å Armadura Ligera</option>
                                      <option value="media">­ƒøí´©Å Armadura Media</option>
                                      <option value="pesada">­ƒøí´©Å Armadura Pesada</option>
                                    </select>
                                  </div>
                                )}
                              </div>
                            )}

                            {createType === 'spell' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                                <div>
                                  <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Nivel de Hechizo</label>
                                  <select className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={createSpellLevel} onChange={e => setCreateSpellLevel(parseInt(e.target.value) || 0)}>
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => <option key={lvl} value={lvl}>{lvl === 0 ? 'TRUCO (0)' : `NIVEL ${lvl}`}</option>)}
                                  </select>
                                </div>
                                
                                <div>
                                  <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Componentes</label>
                                  <div style={{ display: 'flex', gap: '15px' }}>
                                    {['V', 'S', 'M'].map(comp => (
                                      <label key={comp} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-parchment)', cursor: 'pointer' }}>
                                        <input 
                                          type="checkbox" 
                                          checked={(createSpellComponents as any)[comp]} 
                                          onChange={e => setCreateSpellComponents({ ...createSpellComponents, [comp]: e.target.checked })} 
                                        />
                                        {comp}
                                      </label>
                                    ))}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
                                  <input type="checkbox" id="isConcentrationCheck" checked={createSpellConcentration} onChange={e => setCreateSpellConcentration(e.target.checked)} />
                                  <label htmlFor="isConcentrationCheck" style={{ fontSize: '0.8rem', color: 'var(--text-parchment)', cursor: 'pointer' }}>¿Concentración?</label>
                                </div>
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div>
                              <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>Nombre</label>
                              <input className="mono font-cinzel" style={{ width: '100%', padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1.2rem', outline: 'none' }} value={createName} onChange={(e) => setCreateName(e.target.value)} />
                            </div>

                            {createType === 'rule' && (
                              <div>
                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>Categoría / Carpeta</label>
                                <select 
                                  className="mono" 
                                  style={{ width: '100%', padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }} 
                                  value={formState.createRuleCategory} 
                                  onChange={(e) => formState.setCreateRuleCategory(e.target.value)}
                                >
                                  <option value="1. El Turno de Combate (Acciones y Estructura)">1. El Turno de Combate (Acciones y Estructura)</option>
                                  <option value="2. Reglas de Lanzamiento de Conjuros (Spellcasting)">2. Reglas de Lanzamiento de Conjuros (Spellcasting)</option>
                                  <option value="3. Condiciones del Estado (Conditions)">3. Condiciones del Estado (Conditions)</option>
                                  <option value="4. Mecánicas del Entorno y Supervivencia">4. Mecánicas del Entorno y Supervivencia</option>
                                  <option value="5. Pruebas de Característica y Combate Avanzado">5. Pruebas de Característica y Combate Avanzado</option>
                                  <option value="Otras Reglas">Otras Reglas</option>
                                </select>
                              </div>
                            )}

                            {createType !== 'spell' ? (
                              <div>
                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>Descripción / Lore</label>
                                <textarea style={{ width: '100%', height: '120px', padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', resize: 'vertical', outline: 'none', lineHeight: '1.5' }} value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} />
                              </div>
                            ) : (
                              <>
                                <div>
                                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>Descripción Corta</label>
                                  <input className="mono" style={{ width: '100%', padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }} placeholder="Escribe una breve sinopsis..." value={createShortDesc} onChange={(e) => setCreateShortDesc(e.target.value)} />
                                </div>
                                <div>
                                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>Descripción Completa</label>
                                  <textarea style={{ width: '100%', height: '120px', padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', resize: 'vertical', outline: 'none', lineHeight: '1.5' }} placeholder="Escribe los detalles y efectos del hechizo..." value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} />
                                </div>
                              </>
                            )}

                            {createType === 'spell' && (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                                <div>
                                  <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Alcance (en casillas)</label>
                                  <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} placeholder="Ej: 6 casillas, toque, personal..." value={createSpellRange} onChange={e => setCreateSpellRange(e.target.value)} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Duración</label>
                                  <select className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={createSpellDuration} onChange={e => setCreateSpellDuration(e.target.value)}>
                                    {['instantaneo', '1 turno', '1 asalto', '1 minuto', '10 minutos'].map(dur => <option key={dur} value={dur}>{dur.toUpperCase()}</option>)}
                                  </select>
                                </div>
                              </div>
                            )}

                            {createType === 'item' && isDamageItem && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '20px', background: 'rgba(0,0,0,0.15)', padding: '20px', border: '1px solid var(--border-color)' }}>
                                <h4 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '0.9rem', letterSpacing: '1px' }}>ÔÜö´©Å AJUSTES DE ATAQUE Y DAÑO</h4>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '15px' }}>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Nombre del Ataque (Ej: Golpe con Mandoble)</label>
                                    <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={itemAttackName} onChange={e => setItemAttackName(e.target.value)} />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Bono Ataque (Ej: +5)</label>
                                    <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={itemAttackBonus} onChange={e => setItemAttackBonus(e.target.value)} />
                                  </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Otro Bonificador</label>
                                    <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} placeholder="Ej: +2" value={itemStatMod} onChange={e => setItemStatMod(e.target.value)} />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Estadística Base</label>
                                    <select className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={itemStatSelection} onChange={e => setItemStatSelection(e.target.value)}>
                                      {['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'].map(st => <option key={st} value={st}>{st}</option>)}
                                    </select>
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Objetivos Afectados</label>
                                    <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} type="number" min="1" value={itemTargetsCount} onChange={e => setItemTargetsCount(e.target.value)} />
                                  </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Daño (Ej: 1d8+3)</label>
                                    <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={itemDamageFormula} onChange={e => setItemDamageFormula(e.target.value)} />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Daño Crítico (Ej: 2d8)</label>
                                    <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={itemCritDamage} onChange={e => setItemCritDamage(e.target.value)} />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Tipo de Daño</label>
                                    <select className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={itemDamageType} onChange={e => setItemDamageType(e.target.value)}>
                                      {DAMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                  </div>
                                </div>
                              </div>
                            )}

                            {createType === 'monster' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>HP (Ej: 10 o 2d8+2)</label>
                                    <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={createHp} onChange={e => setCreateHp(e.target.value)} />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Armadura (CA)</label>
                                    <input type="number" className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={createAc} onChange={e => setCreateAc(parseInt(e.target.value) || 10)} />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Desafío (CR)</label>
                                    <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={createCr} onChange={e => setCreateCr(e.target.value)} />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Velocidad</label>
                                    <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={createSpeed} onChange={e => setCreateSpeed(e.target.value)} />
                                  </div>
                                </div>

                                <div>
                                  <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Atributos</label>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                                    {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(st => (
                                      <div key={st} style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{st.toUpperCase()}</div>
                                        <input 
                                          type="number" className="mono"
                                          style={{ width: '100%', padding: '5px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', textAlign: 'center' }} 
                                          value={(createStats as any)[st]} 
                                          onChange={e => setCreateStats({ ...createStats, [st]: parseInt(e.target.value) || 10 })} 
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Vulnerabilidades</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '5px' }}>
                                      {DAMAGE_TYPES.map(dt => (
                                        <label key={dt} style={{ fontSize: '0.7rem', display: 'flex', gap: '5px', cursor: 'pointer' }}>
                                          <input type="checkbox" checked={createVuln.includes(dt)} onChange={e => e.target.checked ? setCreateVuln([...createVuln, dt]) : setCreateVuln(createVuln.filter(v => v !== dt))} /> {dt}
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Resistencias</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '5px' }}>
                                      {DAMAGE_TYPES.map(dt => (
                                        <label key={dt} style={{ fontSize: '0.7rem', display: 'flex', gap: '5px', cursor: 'pointer' }}>
                                          <input type="checkbox" checked={createRes.includes(dt)} onChange={e => e.target.checked ? setCreateRes([...createRes, dt]) : setCreateRes(createRes.filter(v => v !== dt))} /> {dt}
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Inmunidades</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '5px' }}>
                                      {DAMAGE_TYPES.map(dt => (
                                        <label key={dt} style={{ fontSize: '0.7rem', display: 'flex', gap: '5px', cursor: 'pointer' }}>
                                          <input type="checkbox" checked={createImm.includes(dt)} onChange={e => e.target.checked ? setCreateImm([...createImm, dt]) : setCreateImm(createImm.filter(v => v !== dt))} /> {dt}
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Rasgos Especiales</label>
                                    <button onClick={() => setCreateTraits([...createTraits, { name: '', desc: '' }])} style={{ background: 'transparent', border: 'none', color: 'var(--accent-gold)', fontSize: '0.75rem', cursor: 'pointer' }}>+ Añadir Rasgo</button>
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {createTraits.map((t: any, idx: number) => (
                                      <div key={idx} style={{ display: 'flex', gap: '10px' }}>
                                        <input placeholder="Nombre (Ej: Anfíbio)" style={{ flex: 1, padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={t.name} onChange={e => {
                                          const list = [...createTraits];
                                          list[idx].name = e.target.value;
                                          setCreateTraits(list);
                                        }} />
                                        <input placeholder="Descripción del efecto..." style={{ flex: 2, padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={t.desc} onChange={e => {
                                          const list = [...createTraits];
                                          list[idx].desc = e.target.value;
                                          setCreateTraits(list);
                                        }} />
                                        {createTraits.length > 1 && (
                                          <button onClick={() => setCreateTraits(createTraits.filter((_: any, i: number) => i !== idx))} style={{ background: 'transparent', border: 'none', color: 'var(--combat-red)', cursor: 'pointer' }}>Ô£ò</button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Acciones de Combate</label>
                                    <button onClick={() => setCreateAttacks([...createAttacks, { name: '', desc: '', isAttack: false, actionType: 'Acción', attackBonus: '', damageFormula: '', damageType: 'cortante', range: '' }])} style={{ background: 'transparent', border: 'none', color: 'var(--accent-gold)', fontSize: '0.75rem', cursor: 'pointer' }}>+ Añadir Acción</button>
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {createAttacks.map((a: any, idx: number) => (
                                      <div key={idx} className="clipped-frame" style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                          <input placeholder="Nombre de la Acción (Ej: Mordisco)" style={{ flex: 2, padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={a.name} onChange={e => {
                                            const list = [...createAttacks];
                                            list[idx].name = e.target.value;
                                            setCreateAttacks(list);
                                          }} />
                                          <select className="mono" style={{ flex: 1, padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={a.actionType} onChange={e => {
                                            const list = [...createAttacks];
                                            list[idx].actionType = e.target.value;
                                            setCreateAttacks(list);
                                          }} >
                                            {ACTION_TYPES.map(act => <option key={act} value={act}>{act}</option>)}
                                          </select>
                                          {createAttacks.length > 1 && (
                                            <button onClick={() => setCreateAttacks(createAttacks.filter((_: any, i: number) => i !== idx))} style={{ background: 'transparent', border: 'none', color: 'var(--combat-red)', cursor: 'pointer' }}>Ô£ò</button>
                                          )}
                                        </div>
                                        <textarea placeholder="Descripción del ataque o efecto..." style={{ width: '100%', height: '50px', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', resize: 'vertical' }} value={a.desc} onChange={e => {
                                          const list = [...createAttacks];
                                          list[idx].desc = e.target.value;
                                          setCreateAttacks(list);
                                        }} />
                                        
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                          <input type="checkbox" id={`isAtt-${idx}`} checked={a.isAttack} onChange={e => {
                                            const list = [...createAttacks];
                                            list[idx].isAttack = e.target.checked;
                                            setCreateAttacks(list);
                                          }} />
                                          <label htmlFor={`isAtt-${idx}`} style={{ fontSize: '0.7rem', color: 'var(--text-parchment)', cursor: 'pointer' }}>¿Es un Ataque?</label>
                                        </div>

                                        {a.isAttack && (
                                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.5fr 1fr', gap: '10px' }}>
                                            <div>
                                              <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Bono (+5)</label>
                                              <input className="mono" style={{ width: '100%', padding: '6px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={a.attackBonus} onChange={e => {
                                                const list = [...createAttacks];
                                                list[idx].attackBonus = e.target.value;
                                                setCreateAttacks(list);
                                              }} />
                                            </div>
                                            <div>
                                              <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Fórmula Daño (2d6+3)</label>
                                              <input className="mono" style={{ width: '100%', padding: '6px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={a.damageFormula} onChange={e => {
                                                const list = [...createAttacks];
                                                list[idx].damageFormula = e.target.value;
                                                setCreateAttacks(list);
                                              }} />
                                            </div>
                                            <div>
                                              <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Tipo Daño</label>
                                              <select className="mono" style={{ width: '100%', padding: '6px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={a.damageType} onChange={e => {
                                                const list = [...createAttacks];
                                                list[idx].damageType = e.target.value;
                                                setCreateAttacks(list);
                                              }} >
                                                {DAMAGE_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                                              </select>
                                            </div>
                                            <div>
                                              <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Rango (5 ft)</label>
                                              <input className="mono" style={{ width: '100%', padding: '6px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={a.range} onChange={e => {
                                                const list = [...createAttacks];
                                                list[idx].range = e.target.value;
                                                setCreateAttacks(list);
                                              }} />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <button onClick={handleSave} className="font-cinzel torch-glow" style={{ width: '100%', background: 'var(--accent-gold)', color: 'white', border: 'none', padding: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', letterSpacing: '2px', marginTop: '30px' }}>
                          {editingId ? 'GUARDAR CAMBIOS' : 'AÑADIR AL COMPENDIO'}
                        </button>
                      </div>
                    
  );
};
