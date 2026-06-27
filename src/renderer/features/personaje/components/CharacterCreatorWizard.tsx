import type { CSSProperties } from 'react';
import { User, Check, Dices, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { calcMod } from '../../../../utils/dnd-calculos';

export const CharacterCreatorWizard = (props: any) => {
  const { isCreating, creationStep, setCreationStep, draft, setDraft,
          charClass, setCharClass, race, subrace, fullBodyImage, stats, setStats,
          backgroundItems, setBackgroundItems,
          selectedSkills, setSelectedSkills, setSelectedSavingThrows,
          dbClasses, dbRaces, dbAlignments, getHitDieForClass, handleSave, handleImageUpload, setCropMode, portraitInputRef,
          styles, getPointCost, skillList, statDescriptions, resetForm,
          raceQuery, setRaceQuery, raceDropdownOpen, setRaceDropdownOpen,
          subraceQuery, setSubraceQuery, subraceDropdownOpen, setSubraceDropdownOpen,
          bgSkillQuery, setBgSkillQuery, bgSkillDropdownOpen, setBgSkillDropdownOpen,
          bgItemQuery, setBgItemQuery, bgItemDropdownOpen, setBgItemDropdownOpen,
          classQuery, setClassQuery, classDropdownOpen, setClassDropdownOpen,
          compendium, featuresLoading, classFeatures,
          hitDieValue, setHitDieValue, showTraits, setShowTraits, editingId } = props;
  return (
    <>
      {isCreating && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '40px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '1400px', height: '90vh', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <div style={{ ...styles.card, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', border: '2px solid var(--accent-gold)', padding: 0, overflow: 'hidden', position: 'relative' }} className="clipped-frame">
              <button onClick={() => resetForm()} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '2.5rem', cursor: 'pointer', zIndex: 10 }}><X className="w-6 h-6 m-auto" /></button>

            {/* INDICADOR DE PASOS (Stepper top fijo) */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', padding: '25px 40px 20px 40px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
              {[1, 2, 3].map(s => {
                const isActive = creationStep === s;
                const isCompleted = creationStep > s;

                let circleStyle: CSSProperties = {
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease',
                };

                if (isActive) {
                  circleStyle = {
                    ...circleStyle,
                    background: 'var(--accent-gold)',
                    color: 'var(--bg-base)',
                    border: '2px solid var(--accent-gold)',
                    boxShadow: '0 0 10px rgba(200, 135, 42, 0.5)',
                  };
                } else if (isCompleted) {
                  circleStyle = {
                    ...circleStyle,
                    background: 'transparent',
                    color: 'var(--accent-gold)',
                    border: '2px solid var(--accent-gold)',
                  };
                } else {
                  circleStyle = {
                    ...circleStyle,
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '2px solid var(--border-color)',
                  };
                }

                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: isCompleted ? 'pointer' : 'default' }} onClick={() => isCompleted && setCreationStep(s)}>
                    <div className="mono" style={circleStyle} title={s === 1 ? 'ESENCIA' : s === 2 ? 'COMPETENCIAS' : 'VITALIDAD'}>
                      {isCompleted ? 'Ô£ô' : s}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CONTENIDO SCROLLABLE */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '30px 40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>

              {creationStep === 1 && (
                <>
                  {/* Header: nombre del h├®roe (input full-width) y avatar */}
                  <div style={{ width: '100%' }}>
                    <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '1.5px', marginBottom: '8px', display: 'block' }}>NOMBRE DEL H├ëROE</label>
                    <div style={{ display: 'flex', gap: '25px', alignItems: 'center', width: '100%' }}>
                      <input
                        className="font-cinzel"
                        style={{
                          ...styles.input,
                          flex: 1,
                          fontSize: '1.6rem',
                          fontWeight: 'bold',
                          color: 'var(--accent-gold)',
                          borderBottom: '2px solid var(--border-color)',
                          borderRadius: 0,
                          background: 'transparent',
                          padding: '10px 12px',
                          boxSizing: 'border-box'
                        }}
                        placeholder="Escribe su nombre..."
                        value={draft.name}
                        onChange={(e) => setDraft(prev => ({ ...prev, name: e.target.value }))}
                      />
                      <div
                        className="torch-glow"
                        style={{
                          width: '75px',
                          height: '75px',
                          border: '2px solid var(--accent-gold)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          flexShrink: 0,
                          position: 'relative',
                          background: 'var(--bg-base)',
                          cursor: 'pointer',
                          boxShadow: '0 0 15px rgba(200, 135, 42, 0.3)'
                        }}
                      >
                        {draft.avatarUrl ? (
                          <img src={draft.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontSize: '2rem' }}><User className="w-full h-full p-2" /></span>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            setCropMode('avatar');
                            handleImageUpload(e);
                          }}
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Secci├│n de Raza y Subraza en dos columnas */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px', alignItems: 'start', borderTop: '1px solid rgba(200, 135, 42, 0.15)', borderBottom: '1px solid rgba(200, 135, 42, 0.15)', padding: '30px 0' }}>
                    
                    {/* Columna Izquierda: Buscadores y descripciones */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '90px' }}>
                      
                      {/* Buscador de Raza */}
                      <div style={{ position: 'relative' }}>
                        <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '1.5px', marginBottom: '8px', display: 'block' }}>RAZA</label>
                        <input
                          type="text"
                          className="font-cinzel"
                          style={styles.input}
                          placeholder="Buscar raza..."
                          value={raceQuery}
                          onChange={(e) => {
                            setRaceQuery(e.target.value);
                            setRaceDropdownOpen(true);
                          }}
                          onFocus={() => setRaceDropdownOpen(true)}
                          onBlur={() => setTimeout(() => setRaceDropdownOpen(false), 250)}
                        />
                        
                        {raceDropdownOpen && (
                          <div className="clipped-frame" style={{
                            position: 'absolute', top: '100%', left: 0, right: 0,
                            background: 'var(--bg-surface)', border: '1px solid var(--accent-gold)',
                            zIndex: 100, maxHeight: '200px', overflowY: 'auto', marginTop: '5px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
                          }}>
                            {dbRaces.filter(r => r.name.toLowerCase().includes(raceQuery.toLowerCase())).map(r => (
                              <div
                                key={r.id}
                                onClick={() => {
                                  const defaultAlign = r.alignment || 'true-neutral';
                                  setDraft(prev => ({
                                    ...prev,
                                    race: r.id,
                                    subrace: r.subraces.length > 0 ? r.subraces[0].id : null,
                                    languages: r.languages || ['Com├║n'],
                                    alignment: defaultAlign as any
                                  }));
                                  setRaceQuery(r.name);
                                  setRaceDropdownOpen(false);
                                }}
                                style={{
                                  padding: '10px 15px', borderBottom: '1px solid rgba(255,255,255,0.02)',
                                  cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-parchment)',
                                  transition: 'background 0.2s', display: 'flex', gap: '10px', alignItems: 'center'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(200, 135, 42, 0.15)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                <strong style={{ color: 'var(--accent-gold)' }}>{r.name}</strong>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Descripci├│n de Raza */}
                        {draft.race && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-parchment)', opacity: 0.9, fontStyle: 'italic', padding: '12px 18px', background: 'rgba(200, 135, 42, 0.04)', borderLeft: '3px solid var(--accent-gold)', marginTop: '8px' }}>
                            <strong>{draft.race}:</strong> {dbRaces.find(r => r.id === draft.race || r.name === draft.race)?.description}
                          </div>
                        )}
                      </div>

                      {/* Buscador de Subraza (si la raza elegida tiene subrazas) */}
                      {(() => {
                        const selectedRaceObj = dbRaces.find(r => r.id === draft.race || r.name === draft.race);
                        if (!selectedRaceObj || !selectedRaceObj.subraces || selectedRaceObj.subraces.length === 0) return null;

                        return (
                          <div style={{ position: 'relative' }}>
                            <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '1.5px', marginBottom: '8px', display: 'block' }}>SUBRAZA</label>
                            <input
                              type="text"
                              className="font-cinzel"
                              style={styles.input}
                              placeholder="Buscar subraza..."
                              value={subraceQuery}
                              onChange={(e) => {
                                setSubraceQuery(e.target.value);
                                setSubraceDropdownOpen(true);
                              }}
                              onFocus={() => setSubraceDropdownOpen(true)}
                              onBlur={() => setTimeout(() => setSubraceDropdownOpen(false), 250)}
                            />
                            
                            {subraceDropdownOpen && (
                              <div className="clipped-frame" style={{
                                position: 'absolute', top: '100%', left: 0, right: 0,
                                background: 'var(--bg-surface)', border: '1px solid var(--accent-gold)',
                                zIndex: 100, maxHeight: '150px', overflowY: 'auto', marginTop: '5px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
                              }}>
                                {selectedRaceObj.subraces.filter(sr => sr.name.toLowerCase().includes(subraceQuery.toLowerCase())).map(sr => (
                                  <div
                                    key={sr.id}
                                    onClick={() => {
                                      setDraft(prev => ({ ...prev, subrace: sr.id }));
                                      setSubraceQuery(sr.name);
                                      setSubraceDropdownOpen(false);
                                    }}
                                    style={{
                                      padding: '10px 15px', borderBottom: '1px solid rgba(255,255,255,0.02)',
                                      cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-parchment)',
                                      transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(200, 135, 42, 0.15)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                  >
                                    <strong>{sr.name}</strong>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Descripci├│n de Subraza */}
                            {draft.subrace && (
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-parchment)', opacity: 0.9, fontStyle: 'italic', padding: '12px 18px', background: 'rgba(200, 135, 42, 0.04)', borderLeft: '3px solid var(--accent-gold)', marginTop: '8px' }}>
                                <strong>{draft.subrace}:</strong> {selectedRaceObj.subraces.find(sr => sr.id === draft.subrace)?.description}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Columna Derecha: Foto de Raza (Tama├▒o Fijo 2:3) */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <div className="clipped-frame" style={{
                        width: '260px',
                        height: '390px',
                        border: '2px solid var(--accent-gold)',
                        boxShadow: '0 0 25px rgba(200, 135, 42, 0.25)',
                        position: 'relative',
                        background: 'var(--bg-base)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {draft.race && (
                          <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                            <button
                              type="button"
                              onClick={() => portraitInputRef.current?.click()}
                              style={{
                                background: 'rgba(15, 12, 8, 0.85)',
                                border: '1px solid var(--accent-gold)',
                                color: 'var(--accent-gold)',
                                width: '28px',
                                height: '28px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.85rem',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
                                transition: 'all 0.2s'
                              }}
                              title="Subir foto personalizada de raza"
                              onMouseEnter={e => {
                                e.currentTarget.style.background = 'var(--accent-gold)';
                                e.currentTarget.style.color = 'var(--bg-base)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(15, 12, 8, 0.85)';
                                e.currentTarget.style.color = 'var(--accent-gold)';
                              }}
                            >
                              Ô£Ä
                            </button>
                            <input
                              type="file"
                              ref={portraitInputRef}
                              accept="image/*"
                              onChange={(e) => {
                                setCropMode('portrait');
                                handleImageUpload(e);
                              }}
                              style={{ display: 'none' }}
                            />
                          </div>
                        )}
                        {draft.race && (fullBodyImage || dbRaces.find(r => r.id === draft.race || r.name === draft.race)?.image) ? (
                          <img
                            src={fullBodyImage || dbRaces.find(r => r.id === draft.race || r.name === draft.race)?.image}
                            alt={draft.race}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ textAlign: 'center', padding: '10px', color: 'var(--text-secondary)' }}>
                            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>ÔÜö´©Å</span>
                            <span className="font-cinzel" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>SELECCIONA RAZA</span>
                          </div>
                        )}
                        {draft.race && (
                          <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            background: 'rgba(15, 12, 8, 0.85)', padding: '6px',
                            borderTop: '1px solid var(--accent-gold)', textAlign: 'center'
                          }}>
                            <span className="font-cinzel" style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                              {draft.race}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Detalles F├¡sicos */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    <div>
                      <label className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>EDAD</label>
                      <input
                        type="number"
                        className="font-cinzel"
                        style={styles.input}
                        placeholder="A├▒os"
                        value={draft.age || ''}
                        onChange={(e) => setDraft(prev => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : null }))}
                      />
                    </div>
                    <div>
                      <label className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>ALTURA</label>
                      <input
                        type="text"
                        className="font-cinzel"
                        style={styles.input}
                        placeholder="Ej: 1.80 m"
                        value={draft.height}
                        onChange={(e) => setDraft(prev => ({ ...prev, height: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>PESO</label>
                      <input
                        type="text"
                        className="font-cinzel"
                        style={styles.input}
                        placeholder="Ej: 75 kg"
                        value={draft.weight}
                        onChange={(e) => setDraft(prev => ({ ...prev, weight: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>PRONOMBRES</label>
                      <input
                        type="text"
                        className="font-cinzel"
                        style={styles.input}
                        placeholder="Ej: ├ël / Ella / Ellos"
                        value={draft.gender}
                        onChange={(e) => setDraft(prev => ({ ...prev, gender: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Alineamiento (3x3 Grid) */}
                  <div>
                    <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '1.5px', marginBottom: '12px', display: 'block' }}>ALINEAMIENTO</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
                      {dbAlignments.map(align => {
                        const isSelected = draft.alignment === align.id;
                        return (
                          <div
                            key={align.id}
                            onClick={() => setDraft(prev => ({ ...prev, alignment: align.id as any }))}
                            style={{
                              background: isSelected ? 'rgba(200, 135, 42, 0.15)' : 'rgba(255,255,255,0.01)',
                              border: isSelected ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
                              padding: '12px 6px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              textAlign: 'center',
                              transition: 'all 0.2s',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              minHeight: '50px',
                              boxShadow: isSelected ? '0 0 10px rgba(200, 135, 42, 0.2)' : 'none'
                            }}
                            onMouseEnter={e => !isSelected && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                            onMouseLeave={e => !isSelected && (e.currentTarget.style.background = 'rgba(255,255,255,0.01)')}
                          >
                            <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: isSelected ? 'var(--accent-gold)' : 'var(--text-parchment)' }}>
                              {align.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Descripciones de Alineamiento y Raza */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Informaci├│n Completa del Alineamiento Elegido */}
                      {(() => {
                        const selectedAlignObj = dbAlignments.find(a => a.id === draft.alignment);
                        if (!selectedAlignObj) return null;
                        return (
                          <div style={{ 
                            fontSize: '0.8rem', 
                            color: 'var(--text-secondary)', 
                            padding: '12px 16px', 
                            background: 'rgba(255, 255, 255, 0.02)', 
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            lineHeight: '1.4'
                          }}>
                            <strong style={{ color: 'var(--accent-gold)', display: 'block', marginBottom: '4px', fontSize: '0.85rem' }}>
                              {selectedAlignObj.label.toUpperCase()}
                            </strong>
                            {selectedAlignObj.desc}
                          </div>
                        );
                      })()}

                      {/* Gu├¡a de Alineamiento seg├║n la Raza */}
                      {(() => {
                        const selectedRaceObj = dbRaces.find(r => r.id === draft.race || r.name === draft.race);
                        const alignDesc = selectedRaceObj?.alignmentDesc;
                        if (!alignDesc) return null;
                        return (
                          <div style={{ 
                            fontSize: '0.8rem', 
                            color: 'var(--text-parchment)', 
                            opacity: 0.85, 
                            fontStyle: 'italic', 
                            padding: '10px 14px', 
                            background: 'rgba(200, 135, 42, 0.03)', 
                            borderLeft: '2px solid var(--accent-gold)', 
                            lineHeight: '1.4'
                          }}>
                            <strong>Inclinaci├│n de la raza ({selectedRaceObj.name}):</strong> {alignDesc}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Idiomas */}
                  <div>
                    <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '1.5px', marginBottom: '8px', display: 'block' }}>IDIOMAS CONOCIDOS</label>
                    <div style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.01)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {draft.languages.map(lang => (
                          <span key={lang} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(200, 135, 42, 0.15)', border: '1px solid var(--accent-gold)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                            {lang}
                            {lang !== 'Com├║n' && (
                              <button
                                type="button"
                                onClick={() => setDraft(prev => ({ ...prev, languages: prev.languages.filter(l => l !== lang) }))}
                                style={{ background: 'none', border: 'none', color: 'var(--combat-red)', cursor: 'pointer', padding: 0, fontWeight: 'bold', fontSize: '0.85rem', marginLeft: '4px' }}
                              >
                                Ô£ò
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Escribe un idioma y presiona Enter..."
                        style={{
                          background: 'transparent',
                          border: 'none',
                          borderTop: '1px solid rgba(255,255,255,0.05)',
                          outline: 'none',
                          color: 'white',
                          width: '100%',
                          fontSize: '0.85rem',
                          padding: '10px 4px 4px 4px',
                          boxSizing: 'border-box'
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = e.currentTarget.value.trim();
                            if (val && !draft.languages.includes(val)) {
                              setDraft(prev => ({ ...prev, languages: [...prev.languages, val] }));
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Historia */}
                  <div>
                    <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '1.5px', marginBottom: '8px', display: 'block' }}>HISTORIA Y TRASFONDO</label>
                    <textarea
                      rows={4}
                      style={{ ...styles.input, resize: 'none', height: 'auto', minHeight: 'unset', fontFamily: 'var(--font-body)', fontSize: '0.95rem', padding: '12px' }}
                      placeholder="Escribe la leyenda de tu h├®roe..."
                      value={draft.backstoryText}
                      onChange={(e) => setDraft(prev => ({ ...prev, backstoryText: e.target.value }))}
                    />
                  </div>

                  {/* Habilidades de Trasfondo */}
                  <div>
                    <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '1.5px', marginBottom: '8px', display: 'block' }}>HABILIDADES DE TRASFONDO</label>
                    <div style={{ position: 'relative', width: '100%' }}>
                      <input
                        type="text"
                        className="font-cinzel"
                        style={{
                          ...styles.input,
                          background: selectedSkills.length >= 2 ? 'rgba(255,255,255,0.01)' : 'var(--bg-base)',
                          color: selectedSkills.length >= 2 ? 'var(--text-secondary)' : 'white',
                          opacity: selectedSkills.length >= 2 ? 0.6 : 1,
                          cursor: selectedSkills.length >= 2 ? 'not-allowed' : 'text'
                        }}
                        placeholder={selectedSkills.length >= 2 ? "2/2 seleccionadas" : "Escribe para buscar habilidades..."}
                        value={bgSkillQuery}
                        onChange={(e) => setBgSkillQuery(e.target.value)}
                        onFocus={() => selectedSkills.length < 2 && setBgSkillDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setBgSkillDropdownOpen(false), 250)}
                        disabled={selectedSkills.length >= 2}
                      />

                      {bgSkillDropdownOpen && selectedSkills.length < 2 && (
                        <div className="clipped-frame" style={{
                          position: 'absolute', top: '100%', left: 0, right: 0,
                          background: 'var(--bg-surface)', border: '1px solid var(--accent-gold)',
                          zIndex: 100, maxHeight: '200px', overflowY: 'auto', marginTop: '5px',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
                        }}>
                          {skillList
                            .filter(skill => !selectedSkills.includes(skill) && skill.toLowerCase().includes(bgSkillQuery.toLowerCase()))
                            .map(skill => (
                              <div
                                key={skill}
                                onClick={() => {
                                  setSelectedSkills([...selectedSkills, skill]);
                                  setBgSkillQuery('');
                                  setBgSkillDropdownOpen(false);
                                }}
                                style={{
                                  padding: '10px 15px', borderBottom: '1px solid rgba(255,255,255,0.02)',
                                  cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-parchment)',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(200, 135, 42, 0.15)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                Ô£ª {skill}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Chips de Habilidades seleccionadas */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                      {selectedSkills.map(skill => (
                        <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(200, 135, 42, 0.1)', padding: '6px 14px', border: '1px solid var(--accent-gold)', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
                            style={{ background: 'none', border: 'none', color: 'var(--combat-red)', cursor: 'pointer', padding: 0, fontSize: '1rem', fontWeight: 'bold' }}
                          >
                            Ô£ò
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Equipo de Trasfondo */}
                  <div>
                    <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '1.5px', marginBottom: '8px', display: 'block' }}>EQUIPO DE TRASFONDO</label>
                    <div style={{ position: 'relative', width: '100%' }}>
                      <input
                        type="text"
                        className="font-cinzel"
                        style={{
                          ...styles.input,
                          background: backgroundItems.filter(i => i.trim() !== '').length >= 2 ? 'rgba(255,255,255,0.01)' : 'var(--bg-base)',
                          color: backgroundItems.filter(i => i.trim() !== '').length >= 2 ? 'var(--text-secondary)' : 'white',
                          opacity: backgroundItems.filter(i => i.trim() !== '').length >= 2 ? 0.6 : 1,
                          cursor: backgroundItems.filter(i => i.trim() !== '').length >= 2 ? 'not-allowed' : 'text'
                        }}
                        placeholder={backgroundItems.filter(i => i.trim() !== '').length >= 2 ? "2/2 seleccionados" : "Buscar objetos en el compendio..."}
                        value={bgItemQuery}
                        onChange={(e) => setBgItemQuery(e.target.value)}
                        onFocus={() => backgroundItems.filter(i => i.trim() !== '').length < 2 && setBgItemDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setBgItemDropdownOpen(false), 250)}
                        disabled={backgroundItems.filter(i => i.trim() !== '').length >= 2}
                      />

                      {bgItemDropdownOpen && backgroundItems.filter(i => i.trim() !== '').length < 2 && (
                        <div className="clipped-frame" style={{
                          position: 'absolute', top: '100%', left: 0, right: 0,
                          background: 'var(--bg-surface)', border: '1px solid var(--accent-gold)',
                          zIndex: 100, maxHeight: '200px', overflowY: 'auto', marginTop: '5px',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
                        }}>
                          {compendium
                            .filter((item: any) => item.type === 'item' && !backgroundItems.includes(item.name) && item.name.toLowerCase().includes(bgItemQuery.toLowerCase()))
                            .map((item: any) => (
                              <div
                                key={item.id}
                                onClick={() => {
                                  const newItems = [...backgroundItems];
                                  const emptyIndex = newItems.findIndex(i => i.trim() === '');
                                  if (emptyIndex !== -1) {
                                    newItems[emptyIndex] = item.name;
                                  } else {
                                    newItems.push(item.name);
                                  }
                                  setBackgroundItems(newItems);
                                  setBgItemQuery('');
                                  setBgItemDropdownOpen(false);
                                }}
                                style={{
                                  padding: '10px 15px', borderBottom: '1px solid rgba(255,255,255,0.02)',
                                  cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-parchment)',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(200, 135, 42, 0.15)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                ­ƒôª {item.name}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Chips de Objetos seleccionados */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                      {backgroundItems.filter(i => i.trim() !== '').map(itemName => (
                        <div key={itemName} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(200, 135, 42, 0.1)', padding: '6px 14px', border: '1px solid var(--accent-gold)', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                          <span>­ƒôª {itemName}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newItems = backgroundItems.map(i => i === itemName ? '' : i);
                              setBackgroundItems(newItems);
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--combat-red)', cursor: 'pointer', padding: 0, fontSize: '1rem', fontWeight: 'bold' }}
                          >
                            Ô£ò
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {creationStep === 2 && (
                <>
                  {/* Point Buy Indicator */}
                  {(() => {
                    const spentPoints = Object.values(draft.attributes as Record<string, number>).reduce((acc, val) => acc + getPointCost(val), 0);
                    const remainingPoints = 27 - spentPoints;

                    return (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', padding: '15px 0', borderBottom: '1px solid rgba(200, 135, 42, 0.15)' }}>
                        <span className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '1px' }}>PUNTOS DE ATRIBUTO (COMPRA POR PUNTOS)</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ display: 'flex', gap: '3px', alignItems: 'center', height: '14px' }}>
                            {Array.from({ length: 27 }).map((_, idx) => {
                              const isVisible = idx < remainingPoints;
                              return (
                                <div
                                  key={idx}
                                  style={{
                                    width: '3px',
                                    height: '12px',
                                    background: remainingPoints < 5 ? 'var(--combat-red)' : 'var(--accent-gold)',
                                    borderRadius: '1px',
                                    opacity: isVisible ? 1 : 0,
                                    transform: isVisible ? 'scaleY(1)' : 'scaleY(0)',
                                    transition: 'all 0.2s ease-in-out'
                                  }}
                                />
                              );
                            })}
                          </div>
                          <span className="mono" style={{ fontSize: '0.9rem', color: remainingPoints < 5 ? 'var(--combat-red)' : 'var(--accent-gold)', fontWeight: 'bold' }}>
                            {remainingPoints} / 27 PUNTOS RESTANTES
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Atributos */}
                  <div>
                    <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '1.5px', marginBottom: '15px', display: 'block' }}>ATRIBUTOS Y TIRADAS DE SALVACI├ôN</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                      {Object.entries(draft.attributes as Record<string, number>).map(([key, value]) => {
                        const baseRace = (draft.race || 'Humano').split('(')[0].trim();
                        const dbRaceObj = dbRaces.find(r => r.name === baseRace || r.id === baseRace);
                        const raceBonus = dbRaceObj?.bonuses?.[key] || 0;
                        const total = value + raceBonus;
                        const mod = calcMod(total);
                        const modStr = mod >= 0 ? "+" + mod : "" + mod;
                        const modColor = mod > 0 ? 'var(--natural-green)' : mod < 0 ? 'var(--combat-red)' : 'var(--text-parchment)';
                        const statNames: Record<string, string> = {
                          fue: 'FUERZA',
                          dex: 'DESTREZA',
                          con: 'CONSTITUCI├ôN',
                          int: 'INTELIGENCIA',
                          sab: 'SABIDUR├ìA',
                          car: 'CARISMA'
                        };
                        const fullName = statNames[key] || key.toUpperCase();
                        const desc = statDescriptions[key];

                        const isSavingProficient = draft.savingThrows.includes(key as any);

                        const toggleSavingThrow = () => {
                          const exists = draft.savingThrows.includes(key as any);
                          let newSavingThrows = [];
                          if (exists) {
                            newSavingThrows = draft.savingThrows.filter(s => s !== key);
                          } else {
                            if (draft.savingThrows.length >= 2) {
                              alert("Solo puedes seleccionar hasta 2 tiradas de salvaci├│n competentes.");
                              return;
                            }
                            newSavingThrows = [...draft.savingThrows, key as any];
                          }
                          setDraft(prev => ({ ...prev, savingThrows: newSavingThrows }));
                          setSelectedSavingThrows(newSavingThrows);
                        };

                        const updateAttributeValue = (val: number) => {
                          if (val < 8 || val > 15) return;
                          const spentPoints = Object.values(draft.attributes as Record<string, number>).reduce((acc, v) => acc + getPointCost(v), 0);
                          const remainingPoints = 27 - spentPoints;
                          
                          const currentCost = getPointCost(draft.attributes[key as any]);
                          const newCost = getPointCost(val);
                          const costDiff = newCost - currentCost;
                          
                          if (remainingPoints - costDiff < 0) {
                            alert("No tienes suficientes puntos disponibles.");
                            return;
                          }
                          
                          const newAttributes = { ...draft.attributes, [key]: val };
                          setDraft(prev => ({ ...prev, attributes: newAttributes }));
                          setStats(newAttributes);
                        };

                        return (
                          <div key={key} style={{ position: 'relative', paddingTop: '12px' }}>
                            {/* Indicador de Salvaci├│n arriba al centro */}
                            <div
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: isSavingProficient ? 'var(--accent-gold)' : 'var(--bg-surface)',
                                border: '1px solid var(--accent-gold)',
                                color: isSavingProficient ? 'var(--bg-base)' : 'var(--accent-gold)',
                                padding: '3px 10px',
                                borderRadius: '3px',
                                fontSize: '0.65rem',
                                fontWeight: 'bold',
                                zIndex: 10,
                                transition: 'all 0.2s ease',
                                pointerEvents: 'none',
                                boxShadow: isSavingProficient ? '0 0 10px rgba(200, 135, 42, 0.5)' : 'none'
                              }}
                            >
                              Ô£ª SALVACI├ôN
                            </div>

                            <div
                              onClick={toggleSavingThrow}
                              style={{
                                background: isSavingProficient ? 'var(--accent-gold)' : 'var(--border-color)',
                                padding: '1.5px',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '190px',
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                clipPath: 'polygon(0 10px, 10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px))'
                              }}
                            >
                              <div
                                style={{
                                  background: 'var(--bg-base)',
                                  padding: '18px 15px',
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                  transition: 'all 0.2s ease',
                                  clipPath: 'polygon(0 9px, 9px 0, calc(100% - 9px) 0, 100% 9px, 100% calc(100% - 9px), calc(100% - 9px) 100%, 9px 100%, 0 calc(100% - 9px))'
                                }}
                              >
                                {/* Abreviatura y Valores */}
                                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <div style={styles.statLabel}>{fullName}</div>
                                  <div
                                    className="mono"
                                    style={{
                                      fontSize: '1.6rem',
                                      fontWeight: 'bold',
                                      color: modColor,
                                      margin: '4px 0',
                                      lineHeight: '1',
                                      textShadow: mod > 0 ? '0 0 8px rgba(45, 94, 58, 0.4)' : mod < 0 ? '0 0 8px rgba(139, 32, 32, 0.4)' : 'none'
                                    }}
                                  >
                                    {modStr}
                                  </div>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                                    Base: {value} {raceBonus > 0 ? "| +" + raceBonus + " Raza" : ""}
                                  </div>
                                </div>

                                {/* Valor central editable con + y - */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', margin: '5px 0' }}>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateAttributeValue(value - 1);
                                    }}
                                    disabled={value <= 8}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: 'var(--accent-gold)',
                                      width: 'auto',
                                      height: 'auto',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      fontSize: '1.8rem',
                                      fontWeight: 'bold',
                                      transition: 'all 0.2s ease',
                                      opacity: value <= 8 ? 0.2 : 0.7,
                                      padding: '0 10px',
                                      outline: 'none'
                                    }}
                                    onMouseEnter={e => value > 8 && (
                                      e.currentTarget.style.color = '#ffffff',
                                      e.currentTarget.style.transform = 'scale(1.25)',
                                      e.currentTarget.style.opacity = '1'
                                    )}
                                    onMouseLeave={e => (
                                      e.currentTarget.style.color = 'var(--accent-gold)',
                                      e.currentTarget.style.transform = 'scale(1)',
                                      e.currentTarget.style.opacity = value <= 8 ? '0.2' : '0.7'
                                    )}
                                  >
                                    -
                                  </button>

                                  <div className="mono" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', minWidth: '40px', textAlign: 'center' }}>
                                    {total}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateAttributeValue(value + 1);
                                    }}
                                    disabled={value >= 15}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: 'var(--accent-gold)',
                                      width: 'auto',
                                      height: 'auto',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      fontSize: '1.8rem',
                                      fontWeight: 'bold',
                                      transition: 'all 0.2s ease',
                                      opacity: value >= 15 ? 0.2 : 0.7,
                                      padding: '0 10px',
                                      outline: 'none'
                                    }}
                                    onMouseEnter={e => value < 15 && (
                                      e.currentTarget.style.color = '#ffffff',
                                      e.currentTarget.style.transform = 'scale(1.25)',
                                      e.currentTarget.style.opacity = '1'
                                    )}
                                    onMouseLeave={e => (
                                      e.currentTarget.style.color = 'var(--accent-gold)',
                                      e.currentTarget.style.transform = 'scale(1)',
                                      e.currentTarget.style.opacity = value >= 15 ? '0.2' : '0.7'
                                    )}
                                  >
                                    +
                                  </button>
                                </div>

                                {/* Descripci├│n corta debajo */}
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.2' }}>
                                  {desc}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selector de Clase */}
                  <div style={{ width: '100%', marginTop: '30px' }}>
                    <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '1.5px', marginBottom: '12px', display: 'block' }}>CLASE PRINCIPAL</label>
                    <div style={{ position: 'relative', width: '100%', display: 'flex' }}>
                      <input
                        type="text"
                        className="font-cinzel"
                        style={styles.input}
                        placeholder="Buscar clase..."
                        value={classQuery}
                        onChange={(e) => {
                          setClassQuery(e.target.value);
                          setClassDropdownOpen(true);
                        }}
                        onFocus={() => setClassDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setClassDropdownOpen(false), 250)}
                      />

                      {classDropdownOpen && (
                        <div className="clipped-frame" style={{
                          position: 'absolute', bottom: 'calc(100% - 1px)', left: 0, right: 0,
                          background: 'var(--bg-surface)', border: '1px solid var(--accent-gold)',
                          zIndex: 100, maxHeight: '200px', overflowY: 'auto', marginBottom: '0px',
                          boxShadow: '0 -10px 30px rgba(0,0,0,0.8)'
                        }}>
                          {(dbClasses || []).filter(c => c.name.toLowerCase().includes(classQuery.toLowerCase())).map(cls => (
                            <div
                              key={cls.id}
                              onClick={() => {
                                setDraft(prev => ({
                                  ...prev,
                                  class: cls.id,
                                  savingThrows: cls.savingThrows
                                }));
                                setCharClass(cls.id || 'Guerrero');
                                setSelectedSavingThrows(cls.savingThrows);
                                setClassQuery(cls.name);
                                setClassDropdownOpen(false);
                              }}
                              style={{
                                padding: '10px 15px', borderBottom: '1px solid rgba(255,255,255,0.02)',
                                cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-parchment)',
                                transition: 'background 0.2s', display: 'flex', gap: '10px', alignItems: 'center'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(200, 135, 42, 0.15)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <strong style={{ color: 'var(--accent-gold)' }}>{cls.name}</strong>
                              <span style={{ fontSize: '0.75rem', marginLeft: 'auto', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>d{cls.hitDice}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Descripci├│n Detallada de la Clase Elegida */}
                    {(() => {
                      const selectedDbClass = dbClasses.find(c => c.name === draft.class || c.id === draft.class);
                      const descToShow = selectedDbClass?.description || '';
                      if (!descToShow) return null;
                      return (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-parchment)', opacity: 0.9, fontStyle: 'italic', padding: '15px 20px', background: 'rgba(200, 135, 42, 0.04)', borderLeft: '3px solid var(--accent-gold)', marginTop: '12px', lineHeight: '1.5' }}>
                          {descToShow}
                        </div>
                      );
                    })()}
                  </div>
                </>
              )}
              {creationStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '30px', padding: '20px 0' }}>
                  
                  {/* Title without emoji */}
                  <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: 0, textAlign: 'center', fontSize: '1.4rem', letterSpacing: '2px' }}>
                    RESUMEN DE NIVEL 1
                  </h3>

                  {/* Character Card (Icon, Name, and HP) */}
                  <div
                    className="clipped-frame"
                    style={{
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid var(--border-color)',
                      padding: '25px 35px',
                      width: '100%',
                      maxWidth: '700px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '25px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}
                  >
                    {/* Avatar Icon */}
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        border: '2px solid var(--accent-gold)',
                        overflow: 'hidden',
                        background: 'var(--bg-base)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 15px rgba(200, 135, 42, 0.3)'
                      }}
                    >
                      {draft.avatarUrl ? (
                        <img src={draft.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <User className="w-10 h-10 text-secondary" style={{ opacity: 0.5 }} />
                      )}
                    </div>

                    {/* Name & Class info */}
                    <div style={{ flex: 1 }}>
                      <h4 className="font-cinzel" style={{ margin: 0, fontSize: '1.5rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                        {draft.name || 'H├®roe sin Nombre'}
                      </h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {charClass} ÔÇó {race} ({subrace})
                      </p>
                    </div>

                    {/* Calculated HP Next to Name */}
                    <div style={{ textAlign: 'right' }}>
                      <div className="mono" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--combat-red)', textShadow: '0 0 10px rgba(220, 53, 69, 0.3)' }}>
                        {hitDieValue === '' ? '-' : Math.max(1, hitDieValue + calcMod(stats.con))} HP
                      </div>
                    </div>
                  </div>

                  {/* HP Configuration & Health Bar */}
                  <div
                    className="clipped-frame"
                    style={{
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid var(--border-color)',
                      padding: '30px 35px',
                      width: '100%',
                      maxWidth: '700px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}
                  >
                    <label className="font-cinzel" style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', letterSpacing: '1px', fontWeight: 'bold' }}>
                      DADO DE VIDA & CONSTITUCI├ôN
                    </label>

                    {/* Row with HP controls on left and details table on right */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '40px', marginTop: '10px' }}>
                      
                      {/* Left: HP controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <input
                          type="number"
                          min={1}
                          max={getHitDieForClass(charClass)}
                          value={hitDieValue}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === '') {
                                setHitDieValue('');
                                return;
                            }
                            const maxVal = getHitDieForClass(charClass);
                            let val = parseInt(raw);
                            if (isNaN(val)) return;
                            if (val > maxVal) val = maxVal;
                            if (val < 1) val = 1;
                            setHitDieValue(val);
                          }}
                          className="mono"
                          style={{
                            background: 'var(--bg-base)',
                            border: '1px solid var(--border-color)',
                            color: 'white',
                            padding: '10px 15px',
                            borderRadius: '3px',
                            width: '80px',
                            fontSize: '1.2rem',
                            textAlign: 'center',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                          }}
                          onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                          onBlur={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                        />

                        <div
                          onClick={() => {
                            const maxVal = getHitDieForClass(charClass);
                            const roll = Math.floor(Math.random() * maxVal) + 1;
                            setHitDieValue(roll);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'var(--accent-gold)',
                            cursor: 'pointer',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            transition: 'all 0.2s ease',
                            userSelect: 'none'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.color = 'var(--accent-gold)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                          title={`Lanzar d${getHitDieForClass(charClass)}`}
                        >
                          <Dices className="w-6 h-6" />
                          <span className="mono">d{getHitDieForClass(charClass)}</span>
                        </div>
                      </div>

                      {/* Right: Calculation Details */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px 20px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: '3px' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-parchment)', display: 'flex', justifyContent: 'space-between', gap: '30px' }}>
                          <span>Dado de Vida ({charClass}):</span>
                          <span className="mono">+{hitDieValue}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-parchment)', display: 'flex', justifyContent: 'space-between', gap: '30px' }}>
                          <span>Modificador de Constituci├│n:</span>
                          <span className="mono" style={{ color: calcMod(stats.con) >= 0 ? 'var(--natural-green)' : 'var(--combat-red)' }}>
                            {calcMod(stats.con) >= 0 ? '+' : ''}{calcMod(stats.con)}
                          </span>
                        </div>
                        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '6px', fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', gap: '30px' }}>
                          <span>Vida M├íxima Total:</span>
                          <span className="mono">{hitDieValue === '' ? '-' : Math.max(1, hitDieValue + calcMod(stats.con))} HP</span>
                        </div>
                      </div>

                    </div>

                    <p style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', margin: '15px 0 0 0', fontStyle: 'italic', opacity: 0.8 }}>
                      * Aviso: En el primer nivel se recomienda utilizar el valor m├íximo del dado de vida de tu clase.
                    </p>

                  </div>

                  {/* Competencies Card */}
                  <div
                    className="clipped-frame"
                    style={{
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid var(--border-color)',
                      padding: '25px 35px',
                      width: '100%',
                      maxWidth: '700px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}
                  >
                    <label className="font-cinzel" style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', letterSpacing: '1px', fontWeight: 'bold' }}>
                      COMPETENCIAS
                    </label>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                      {/* Left: Habilidades */}
                      <div>
                        <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '6px', marginBottom: '12px', letterSpacing: '0.5px' }}>
                          HABILIDADES
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {selectedSkills.length > 0 ? (
                            selectedSkills.map(skill => (
                              <span key={skill} style={{ fontSize: '0.8rem', background: 'rgba(200, 135, 42, 0.1)', border: '1px solid var(--accent-gold)', padding: '4px 10px', borderRadius: '4px', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Ninguna seleccionada</span>
                          )}
                        </div>
                      </div>

                      {/* Right: Equipo de Trasfondo */}
                      <div>
                        <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '6px', marginBottom: '12px', letterSpacing: '0.5px' }}>
                          EQUIPO DE TRASFONDO
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {backgroundItems.filter(i => i.trim() !== '').length > 0 ? (
                            backgroundItems.filter(i => i.trim() !== '').map(item => (
                              <span key={item} style={{ fontSize: '0.8rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '4px', color: 'var(--text-parchment)' }}>
                                {item}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Ninguno seleccionado</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Traits Card */}
                  <div
                    className="clipped-frame"
                    style={{
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid var(--border-color)',
                      width: '100%',
                      maxWidth: '700px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {/* Header trigger */}
                    <div
                      onClick={() => setShowTraits(!showTraits)}
                      style={{
                        padding: '20px 35px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        userSelect: 'none',
                        background: 'rgba(200, 135, 42, 0.02)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(200, 135, 42, 0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(200, 135, 42, 0.02)'}
                    >
                      <span className="font-cinzel" style={{ fontSize: '0.9rem', color: 'var(--accent-gold)', letterSpacing: '1px', fontWeight: 'bold' }}>
                        RASGOS
                      </span>
                      <span style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', transition: 'transform 0.2s', transform: showTraits ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        Ôû╝
                      </span>
                    </div>

                    {/* Collapsible Content */}
                    <div style={{
                      maxHeight: showTraits ? '800px' : '0px',
                      opacity: showTraits ? 1 : 0,
                      overflow: 'hidden',
                      transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, padding 0.4s ease, margin-top 0.4s ease',
                      padding: showTraits ? '0 35px 30px 35px' : '0 35px 0 35px',
                      borderTop: showTraits ? '1px solid rgba(200, 135, 42, 0.1)' : '1px solid transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '25px',
                      marginTop: showTraits ? '15px' : '0px'
                    }}>
                      
                      {/* Race Traits Section */}
                      <div>
                        <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '6px', marginBottom: '12px', letterSpacing: '0.5px' }}>
                          RASGOS DE RAZA ({race.toUpperCase()})
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-parchment)', lineHeight: '1.4' }}>
                          <div>
                            <strong>{race}:</strong> {dbRaces.find(r => r.id === race || r.name === race)?.description} <span style={{ color: 'var(--accent-gold)' }}>({dbRaces.find(r => r.id === race || r.name === race)?.bonusText})</span>
                          </div>
                          {subrace && subrace !== 'Est├índar' && (
                            <div>
                              <strong>{subrace}:</strong> {dbRaces.find(r => r.id === race || r.name === race)?.subraces.find(sr => sr.id === subrace || sr.name === subrace)?.description}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Class Traits Section */}
                      <div>
                        <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '6px', marginBottom: '12px', letterSpacing: '0.5px' }}>
                          RASGOS DE CLASE ({charClass.toUpperCase()})
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: 'var(--text-parchment)', lineHeight: '1.4' }}>
                          {/* Class default proficiencies and saving throws */}
                          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            <span style={{ color: 'var(--accent-gold)', marginRight: '8px' }}>Ô£ª</span>
                            <span>Competencias: <strong>{charClass === 'Mago' ? 'Dagas y Bastones' : 'Armas Marciales'}</strong>.</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            <span style={{ color: 'var(--accent-gold)', marginRight: '8px' }}>Ô£ª</span>
                            <span>Salvaciones fijas de clase: <strong>{charClass === 'Guerrero' ? 'FUE y CON' : 'INT y SAB'}</strong>.</span>
                          </div>
                          
                          {/* Dynamic database class features at Level 1 */}
                          {featuresLoading ? (
                            <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Cargando rasgos...</div>
                          ) : classFeatures.filter(f => f.level_acquired === 1).length > 0 ? (
                            classFeatures.filter(f => f.level_acquired === 1).map((f, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ color: 'var(--accent-gold)', marginRight: '8px' }}>Ôùê</span>
                                <span><strong>{f.feature_name}:</strong> {f.description}</span>
                              </div>
                            ))
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'flex-start', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                              <span style={{ marginRight: '8px' }}>Ô£ª</span>
                              <span>Sin rasgos especiales adicionales registrados para Nivel 1.</span>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              )}
            </div>

            </div>

            {/* FLOATING SIDE NAVIGATION ARROWS (Outside the main modal card) */}
            {creationStep > 1 && (
              <button
                type="button"
                onClick={() => setCreationStep(creationStep - 1)}
                style={{
                  position: 'absolute',
                  right: '100%',
                  marginRight: '15px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 100,
                  background: 'rgba(15, 12, 8, 0.85)',
                  border: '2px solid var(--accent-gold)',
                  color: 'var(--accent-gold)',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 15px rgba(200, 135, 42, 0.2)',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--accent-gold)';
                  e.currentTarget.style.color = 'var(--bg-base)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(200, 135, 42, 0.6)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(15, 12, 8, 0.85)';
                  e.currentTarget.style.color = 'var(--accent-gold)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(200, 135, 42, 0.2)';
                }}
                title="Atr├ís"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <button
              type="button"
              disabled={creationStep === 3 && hitDieValue === ''}
              onClick={() => {
                if (creationStep === 3) {
                  if (hitDieValue === '') return;
                  handleSave();
                } else {
                  if (creationStep === 1 && !draft.name) {
                    alert("┬íTu h├®roe necesita un nombre!");
                    return;
                  }
                  setCreationStep(creationStep + 1);
                }
              }}
              style={{
                position: 'absolute',
                left: '100%',
                marginLeft: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 100,
                background: creationStep === 3 ? (hitDieValue === '' ? 'rgba(46, 117, 89, 0.2)' : 'var(--natural-green)') : 'rgba(15, 12, 8, 0.85)',
                border: creationStep === 3 ? (hitDieValue === '' ? '2px solid rgba(46, 117, 89, 0.2)' : '2px solid var(--natural-green)') : '2px solid var(--accent-gold)',
                color: creationStep === 3 ? (hitDieValue === '' ? 'rgba(255,255,255,0.3)' : 'white') : 'var(--accent-gold)',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                cursor: creationStep === 3 && hitDieValue === '' ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: creationStep === 3 ? (hitDieValue === '' ? 'none' : '0 0 15px rgba(46, 117, 89, 0.4)') : '0 0 15px rgba(200, 135, 42, 0.2)',
                transition: 'all 0.2s ease',
                outline: 'none',
                opacity: creationStep === 3 && hitDieValue === '' ? 0.5 : 1
              }}
              onMouseEnter={e => {
                if (creationStep === 3) {
                  if (hitDieValue === '') return;
                  e.currentTarget.style.background = '#3db080';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(46, 117, 89, 0.8)';
                } else {
                  e.currentTarget.style.background = 'var(--accent-gold)';
                  e.currentTarget.style.color = 'var(--bg-base)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(200, 135, 42, 0.6)';
                }
              }}
              onMouseLeave={e => {
                if (creationStep === 3) {
                  if (hitDieValue === '') {
                    e.currentTarget.style.background = 'rgba(46, 117, 89, 0.2)';
                    e.currentTarget.style.boxShadow = 'none';
                    return;
                  }
                  e.currentTarget.style.background = 'var(--natural-green)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(46, 117, 89, 0.4)';
                } else {
                  e.currentTarget.style.background = 'rgba(15, 12, 8, 0.85)';
                  e.currentTarget.style.color = 'var(--accent-gold)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(200, 135, 42, 0.2)';
                }
              }}
              title={creationStep === 3 ? (editingId ? 'Confirmar cambios' : 'Finalizar y forjar leyenda') : 'Siguiente'}
            >
              {creationStep === 3 ? <Check className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
            </button>

          </div>
        </div>
      )}



    </>
  );
};
