import React, { useState } from 'react';
import { Lock, Plus, Trash2, Award, Globe, BookOpen, Scroll } from 'lucide-react';
import { parseClasses, safeParseStats } from '../../utils/personaje';

const DEFAULT_RACIAL_TRAITS: Record<string, Array<{ name: string, description: string }>> = {
  'Humano': [
    { name: 'Versatilidad Humana', description: 'Obtienes +1 a todas tus puntuaciones de característica.' }
  ],
  'Elfo': [
    { name: 'Visión en la Oscuridad', description: 'Puedes ver en la penumbra a una distancia de 60 pies como si fuera luz brillante, y en la oscuridad como si fuera penumbra.' },
    { name: 'Sentidos Agudos', description: 'Eres competente en la habilidad Percepción.' },
    { name: 'Ascendencia Feérica', description: 'Tienes ventaja en las tiradas de salvación para no quedar hechizado y la magia no puede dormirte.' },
    { name: 'Trance', description: 'Los elfos no duermen. En su lugar, meditan profundamente durante 4 horas al día para obtener los beneficios de un descanso largo.' }
  ],
  'Enano': [
    { name: 'Visión en la Oscuridad', description: 'Puedes ver en la penumbra a una distancia de 60 pies como si fuera luz brillante, y en la oscuridad como si fuera penumbra.' },
    { name: 'Resistencia Enana', description: 'Tienes ventaja en las tiradas de salvación contra veneno y resistencia al daño de veneno.' },
    { name: 'Entrenamiento de Combate Enano', description: 'Eres competente con el hacha de batalla, hachuela, martillo ligero y martillo de guerra.' },
    { name: 'Afinidad con la Piedra', description: 'Cuando realizas una prueba de Inteligencia (Historia) relacionada con el origen de un trabajo en piedra, sumas el doble de tu bono de competencia.' }
  ],
  'Mediano': [
    { name: 'Suerte', description: 'Cuando obtienes un 1 en el dado para una tirada de ataque, prueba de característica o salvación, puedes volver a tirar el dado y debes usar la nueva tirada.' },
    { name: 'Valiente', description: 'Tienes ventaja en las tiradas de salvación para no ser asustado.' },
    { name: 'Agilidad de Mediano', description: 'Puedes moverte a través del espacio de cualquier criatura que sea de un tamaño mayor al tuyo.' }
  ],
  'Gnomo': [
    { name: 'Visión en la Oscuridad', description: 'Puedes ver en la penumbra a una distancia de 60 pies como si fuera luz brillante, y en la oscuridad como si fuera penumbra.' },
    { name: 'Astucia Gnómica', description: 'Tienes ventaja en todas las tiradas de salvación de Inteligencia, Sabiduría y Carisma contra magia.' }
  ],
  'Semielfo': [
    { name: 'Visión en la Oscuridad', description: 'Puedes ver en la penumbra a una distancia de 60 pies como si fuera luz brillante, y en la oscuridad como si fuera penumbra.' },
    { name: 'Ancestros Feéricos', description: 'Tienes ventaja en las tiradas de salvación para no quedar hechizado y la magia no puede dormirte.' },
    { name: 'Versatilidad en Habilidades', description: 'Obtienes competencia en dos habilidades de tu elección.' }
  ],
  'Semiorco': [
    { name: 'Visión en la Oscuridad', description: 'Puedes ver en la penumbra a una distancia de 60 pies como si fuera luz brillante, y en la oscuridad como si fuera penumbra.' },
    { name: 'Intimidante', description: 'Eres competente en la habilidad Intimidación.' },
    { name: 'Resistencia Incansable', description: 'Cuando tus puntos de golpe se reducen a 0 pero no mueres inmediatamente, puedes quedar a 1 punto de golpe en su lugar. No puedes volver a usar este rasgo hasta terminar un descanso largo.' },
    { name: 'Ataques Salvajes', description: 'Cuando obtienes un golpe crítico con un ataque de arma cuerpo a cuerpo, puedes añadir uno de los dados de daño del arma al daño extra del crítico.' }
  ],
  'Tiefling': [
    { name: 'Visión en la Oscuridad', description: 'Puedes ver en la penumbra a una distancia de 60 pies como si fuera luz brillante, y en la oscuridad como si fuera penumbra.' },
    { name: 'Resistencia Infernal', description: 'Tienes resistencia al daño de fuego.' },
    { name: 'Legado Infernal', description: 'Conoces el truco Taumaturgia. A nivel 3 puedes lanzar Represión Infernal como conjuro de 2.º nivel una vez al día. A nivel 5 puedes lanzar Oscuridad una vez al día.' }
  ],
  'Dracónido': [
    { name: 'Ascendencia Dracónica', description: 'Tienes un tipo de dragón ancestral que determina tu tipo de daño y arma de aliento, además de otorgarte resistencia a ese tipo de daño.' },
    { name: 'Arma de Aliento', description: 'Puedes usar tu acción para exhalar energía destructiva según tu ascendencia dracónica. Cada criatura en el área debe realizar una salvación (CD 8 + tu modificador de Constitución + tu bono de competencia).' },
    { name: 'Resistencia al Daño', description: 'Tienes resistencia al tipo de daño asociado con tu ascendencia dracónica.' }
  ]
};

const getBaseLanguages = (raceName: string) => {
  const cleanRace = raceName ? raceName.trim() : "Humano";
  if (cleanRace.includes("Elfo")) return "Común, Élfico";
  if (cleanRace.includes("Enano")) return "Común, Enano";
  if (cleanRace.includes("Mediano")) return "Común, Mediano";
  if (cleanRace.includes("Dracónido")) return "Común, Dracónico";
  if (cleanRace.includes("Gnomo")) return "Común, Gnomo";
  if (cleanRace.includes("Semielfo")) return "Común, Élfico, Un idioma adicional";
  if (cleanRace.includes("Semiorco")) return "Común, Orco";
  if (cleanRace.includes("Tiflin") || cleanRace.includes("Tiefling")) return "Común, Infernal";
  return "Común, Un idioma adicional";
};

export const CharacterTraitsTab = ({
  character,
  classFeatures,
  activeFeaturesClass,
  featuresLoading,
  fetchClassFeatures,
  socket,
  onUpdate
}: any) => {
  const [activeSubTab, setActiveSubTab] = useState<'clase' | 'raza' | 'trasfondo' | 'dotes'>('clase');
  const charLevel = character.level || 1;
  const allClassesMap = parseClasses(character.class);
  const activeClassLevel = allClassesMap[activeFeaturesClass] || charLevel;
  const charStats = safeParseStats(character.stats);

  // Form states for creating custom traits
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTraitName, setNewTraitName] = useState('');
  const [newTraitDesc, setNewTraitDesc] = useState('');

  // Class Features calculation
  const featuresByLevel: any = {};
  classFeatures.forEach((f: any) => {
    const lvl = f.level_acquired;
    if (!featuresByLevel[lvl]) featuresByLevel[lvl] = [];
    featuresByLevel[lvl].push(f);
  });
  const levels = Object.keys(featuresByLevel).map(Number).sort((a, b) => a - b);

  // Racial traits calculation
  const baseRace = (character.race || 'Humano').split(' ')[0].trim();
  const defaultRacialTraits = DEFAULT_RACIAL_TRAITS[baseRace] || [];
  const customRacialTraits = charStats.custom_racial_traits || [];

  // Background custom traits calculation
  const customBackgroundTraits = charStats.custom_background_traits || [];

  // Feats & Languages calculation
  const customFeats = charStats.custom_feats || [];
  const baseLanguages = getBaseLanguages(character.race || 'Humano');
  const customLanguages = charStats.custom_languages || [];

  const handleSaveTrait = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTraitName.trim() || !newTraitDesc.trim()) return;

    const newTrait = {
      id: Date.now().toString(),
      name: newTraitName.trim(),
      description: newTraitDesc.trim()
    };

    let updatedStats = { ...charStats };
    if (activeSubTab === 'raza') {
      updatedStats.custom_racial_traits = [...customRacialTraits, newTrait];
    } else if (activeSubTab === 'trasfondo') {
      updatedStats.custom_background_traits = [...customBackgroundTraits, newTrait];
    } else if (activeSubTab === 'dotes') {
      updatedStats.custom_feats = [...customFeats, newTrait];
    }

    saveToDB(updatedStats);
    setNewTraitName('');
    setNewTraitDesc('');
    setShowAddForm(false);
  };

  const handleDeleteTrait = (id: string, type: 'raza' | 'trasfondo' | 'dotes') => {
    let updatedStats = { ...charStats };
    if (type === 'raza') {
      updatedStats.custom_racial_traits = customRacialTraits.filter((t: any) => t.id !== id);
    } else if (type === 'trasfondo') {
      updatedStats.custom_background_traits = customBackgroundTraits.filter((t: any) => t.id !== id);
    } else if (type === 'dotes') {
      updatedStats.custom_feats = customFeats.filter((t: any) => t.id !== id);
    }
    saveToDB(updatedStats);
  };

  const handleAddLanguage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTraitName.trim()) return;

    const newLang = {
      id: Date.now().toString(),
      name: newTraitName.trim()
    };

    const updatedStats = {
      ...charStats,
      custom_languages: [...customLanguages, newLang]
    };

    saveToDB(updatedStats);
    setNewTraitName('');
    setShowAddForm(false);
  };

  const handleDeleteLanguage = (id: string) => {
    const updatedStats = {
      ...charStats,
      custom_languages: customLanguages.filter((l: any) => l.id !== id)
    };
    saveToDB(updatedStats);
  };

  const saveToDB = (updatedStats: any) => {
    const updatedChar = {
      ...character,
      stats: JSON.stringify(updatedStats)
    };
    socket.emit('character:update', updatedChar);
    if (onUpdate) {
      onUpdate(updatedChar);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', width: '100%' }}>
      {/* MENU DE SUB-PESTAÑAS */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', flexWrap: 'wrap' }}>
        {[
          { id: 'clase', label: 'CLASE', icon: <BookOpen size={14} /> },
          { id: 'raza', label: 'RAZA', icon: <Scroll size={14} /> },
          { id: 'trasfondo', label: 'TRASFONDO', icon: <Globe size={14} /> },
          { id: 'dotes', label: 'DOTES / IDIOMAS', icon: <Award size={14} /> }
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setShowAddForm(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: isActive ? 'var(--accent-gold)' : 'transparent',
                border: '1px solid',
                borderColor: isActive ? 'var(--accent-gold)' : 'var(--border-color)',
                borderRadius: '4px',
                color: isActive ? 'black' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                padding: '6px 14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                letterSpacing: '0.5px'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* CONTENIDO DE LAS SUB-PESTAÑAS */}
      <div>
        {/* SUB-TAB: CLASE */}
        {activeSubTab === 'clase' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {Object.keys(allClassesMap).length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
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
                <div style={{ fontSize: '1.5rem', marginBottom: '10px', animation: 'spin 2s linear infinite' }}>⏳</div>
                <div className="font-cinzel" style={{ fontSize: '0.85rem', letterSpacing: '1px', opacity: 0.7 }}>Cargando rasgos de clase...</div>
              </div>
            )}

            {!featuresLoading && classFeatures.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)' }}>
                <div className="font-cinzel" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>Sin rasgos registrados para esta clase.</div>
              </div>
            )}

            {!featuresLoading && levels.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {levels.map(lvl => {
                  const isUnlocked = lvl <= activeClassLevel;
                  return (
                    <div key={lvl} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', pb: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', opacity: isUnlocked ? 1 : 0.35 }}>
                        <div style={{
                          width: '30px', height: '30px', borderRadius: '50%',
                          background: isUnlocked ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)',
                          border: `2px solid ${isUnlocked ? 'var(--accent-gold)' : 'rgba(255,255,255,0.12)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          boxShadow: isUnlocked ? '0 0 10px rgba(200,135,42,0.4)' : 'none'
                        }}>
                          <span className="mono" style={{ fontWeight: 'bold', fontSize: '0.75rem', color: isUnlocked ? 'black' : 'var(--text-secondary)' }}>{lvl}</span>
                        </div>
                        <span className="font-cinzel" style={{ fontSize: '0.7rem', color: isUnlocked ? 'var(--accent-gold)' : 'var(--text-secondary)', letterSpacing: '2px', fontWeight: 'bold' }}>
                          NIVEL {lvl}{!isUnlocked && ' - BLOQUEADO'}
                        </span>
                      </div>
                      <div style={{ paddingLeft: '42px', paddingBottom: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {featuresByLevel[lvl].map((f: any, fi: number) => (
                          <div key={fi} style={{
                            background: isUnlocked ? 'rgba(200, 135, 42, 0.04)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${isUnlocked ? 'rgba(200, 135, 42, 0.15)' : 'rgba(255,255,255,0.05)'}`,
                            padding: '14px 16px', opacity: isUnlocked ? 1 : 0.4, borderRadius: '4px'
                          }}>
                            <div className="font-cinzel" style={{ color: isUnlocked ? 'var(--accent-gold)' : 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {f.feature_name}
                              {!isUnlocked && <Lock size={12} style={{ opacity: 0.6 }} />}
                            </div>
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
        )}

        {/* SUB-TAB: RAZA */}
        {activeSubTab === 'raza' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: 0 }}>RASGOS RACIALES DE {character.race?.toUpperCase() || 'RAZA'}</h4>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent',
                  border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)',
                  borderRadius: '4px', padding: '5px 12px', fontSize: '0.75rem', cursor: 'pointer'
                }}
              >
                <Plus size={14} />
                Añadir Rasgo
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleSaveTrait} style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Nombre del Rasgo</label>
                  <input
                    type="text"
                    value={newTraitName}
                    onChange={(e) => setNewTraitName(e.target.value)}
                    placeholder="Ej: Trance, Aliento de Dragón..."
                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '10px', borderRadius: '4px' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Descripción</label>
                  <textarea
                    value={newTraitDesc}
                    onChange={(e) => setNewTraitDesc(e.target.value)}
                    placeholder="Describe el efecto del rasgo aquí..."
                    rows={3}
                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '10px', borderRadius: '4px', resize: 'vertical' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowAddForm(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Cancelar</button>
                  <button type="submit" style={{ background: 'var(--accent-gold)', border: 'none', color: 'black', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>Guardar</button>
                </div>
              </form>
            )}

            {/* Lista de Rasgos Estáticos (Por Defecto) */}
            {defaultRacialTraits.map((t, idx) => (
              <div key={`def-${idx}`} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '4px' }}>
                <div className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '6px' }}>{t.name} <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.5 }}>(Racial Base)</span></div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>{t.description}</div>
              </div>
            ))}

            {/* Lista de Rasgos Personalizados */}
            {customRacialTraits.map((t: any) => (
              <div key={t.id} style={{ background: 'rgba(200, 135, 42, 0.03)', border: '1px solid var(--accent-gold)', padding: '16px', borderRadius: '4px', position: 'relative' }}>
                <button
                  onClick={() => handleDeleteTrait(t.id, 'raza')}
                  style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: 0, opacity: 0.7 }}
                  title="Eliminar rasgo"
                >
                  <Trash2 size={15} />
                </button>
                <div className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '6px', paddingRight: '25px' }}>{t.name} <span style={{ fontSize: '0.7rem', color: 'var(--gold-primary)', opacity: 0.8 }}>(Personalizado)</span></div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>{t.description}</div>
              </div>
            ))}

            {defaultRacialTraits.length === 0 && customRacialTraits.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)' }}>
                <div className="font-cinzel" style={{ fontSize: '0.85rem' }}>No hay rasgos registrados para esta raza. Añade uno arriba.</div>
              </div>
            )}
          </div>
        )}

        {/* SUB-TAB: TRASFONDO */}
        {activeSubTab === 'trasfondo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: 0 }}>RASGOS DE TRASFONDO PERSONALIZADOS</h4>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent',
                  border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)',
                  borderRadius: '4px', padding: '5px 12px', fontSize: '0.75rem', cursor: 'pointer'
                }}
              >
                <Plus size={14} />
                Añadir Rasgo
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleSaveTrait} style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Nombre del Rasgo de Trasfondo</label>
                  <input
                    type="text"
                    value={newTraitName}
                    onChange={(e) => setNewTraitName(e.target.value)}
                    placeholder="Ej: Contacto Criminal, Privilegio del Templo..."
                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '10px', borderRadius: '4px' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Descripción</label>
                  <textarea
                    value={newTraitDesc}
                    onChange={(e) => setNewTraitDesc(e.target.value)}
                    placeholder="Describe el efecto del rasgo aquí..."
                    rows={3}
                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '10px', borderRadius: '4px', resize: 'vertical' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setShowAddForm(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Cancelar</button>
                  <button type="submit" style={{ background: 'var(--accent-gold)', border: 'none', color: 'black', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>Guardar</button>
                </div>
              </form>
            )}

            {/* Listado de Rasgos de Trasfondo Personalizados */}
            {customBackgroundTraits.map((t: any) => (
              <div key={t.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '4px', position: 'relative' }}>
                <button
                  onClick={() => handleDeleteTrait(t.id, 'trasfondo')}
                  style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: 0, opacity: 0.7 }}
                  title="Eliminar rasgo"
                >
                  <Trash2 size={15} />
                </button>
                <div className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '6px', paddingRight: '25px' }}>{t.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>{t.description}</div>
              </div>
            ))}

            {customBackgroundTraits.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)' }}>
                <div className="font-cinzel" style={{ fontSize: '0.85rem' }}>No hay rasgos de trasfondo registrados. Haz click en "+ Añadir Rasgo" arriba para crear uno personalizado.</div>
              </div>
            )}
          </div>
        )}

        {/* SUB-TAB: DOTES / IDIOMAS */}
        {activeSubTab === 'dotes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* SECCION DOTES */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: 0 }}>DOTES (FEATS)</h4>
                <button
                  onClick={() => {
                    setShowAddForm(!showAddForm);
                    setNewTraitName('');
                    setNewTraitDesc('');
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent',
                    border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)',
                    borderRadius: '4px', padding: '5px 12px', fontSize: '0.75rem', cursor: 'pointer'
                  }}
                >
                  <Plus size={14} />
                  Añadir Dote
                </button>
              </div>

              {showAddForm && !newTraitDesc.startsWith('[lang]') && (
                <form onSubmit={handleSaveTrait} style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Nombre de la Dote</label>
                    <input
                      type="text"
                      value={newTraitName}
                      onChange={(e) => setNewTraitName(e.target.value)}
                      placeholder="Ej: Alerta, Iniciado en la Magia..."
                      style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '10px', borderRadius: '4px' }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Descripción</label>
                    <textarea
                      value={newTraitDesc}
                      onChange={(e) => setNewTraitDesc(e.target.value)}
                      placeholder="Describe los beneficios de la dote aquí..."
                      rows={3}
                      style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '10px', borderRadius: '4px', resize: 'vertical' }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setShowAddForm(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Cancelar</button>
                    <button type="submit" style={{ background: 'var(--accent-gold)', border: 'none', color: 'black', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>Guardar</button>
                  </div>
                </form>
              )}

              {/* Listado de Dotes */}
              {customFeats.map((f: any) => (
                <div key={f.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '4px', position: 'relative' }}>
                  <button
                    onClick={() => handleDeleteTrait(f.id, 'dotes')}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: 0, opacity: 0.7 }}
                    title="Eliminar dote"
                  >
                    <Trash2 size={15} />
                  </button>
                  <div className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '6px', paddingRight: '25px' }}>{f.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6' }}>{f.description}</div>
                </div>
              ))}

              {customFeats.length === 0 && (
                <div style={{ textAlign: 'center', padding: '25px', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)', borderRadius: '4px' }}>
                  <div className="font-cinzel" style={{ fontSize: '0.8rem' }}>No hay dotes registradas.</div>
                </div>
              )}
            </div>

            {/* SECCION IDIOMAS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: 0 }}>IDIOMAS CONOCIDOS</h4>
                <button
                  onClick={() => {
                    setShowAddForm(!showAddForm || !newTraitDesc.startsWith('[lang]'));
                    setNewTraitName('');
                    setNewTraitDesc('[lang]'); // marker
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent',
                    border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)',
                    borderRadius: '4px', padding: '5px 12px', fontSize: '0.75rem', cursor: 'pointer'
                  }}
                >
                  <Globe size={14} />
                  Añadir Idioma
                </button>
              </div>

              {showAddForm && newTraitDesc === '[lang]' && (
                <form onSubmit={handleAddLanguage} style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '6px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <input
                      type="text"
                      value={newTraitName}
                      onChange={(e) => setNewTraitName(e.target.value)}
                      placeholder="Ej: Enano, Gigante, Celestial..."
                      style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '10px', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" onClick={() => setShowAddForm(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '10px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Cancelar</button>
                    <button type="submit" style={{ background: 'var(--accent-gold)', border: 'none', color: 'black', padding: '10px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>Guardar</button>
                  </div>
                </form>
              )}

              {/* Contenedor de Idiomas */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {/* Idiomas Base */}
                {baseLanguages.split(',').map((l, i) => (
                  <div key={`base-l-${i}`} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '8px 14px', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={12} style={{ color: 'var(--text-secondary)', opacity: 0.6 }} />
                    <span>{l.trim()} <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>(Racial)</span></span>
                  </div>
                ))}

                {/* Idiomas Adicionales */}
                {customLanguages.map((l: any) => (
                  <div key={l.id} style={{ background: 'rgba(200, 135, 42, 0.05)', border: '1px solid var(--accent-gold)', padding: '8px 14px', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={12} style={{ color: 'var(--accent-gold)' }} />
                    <span>{l.name}</span>
                    <button
                      onClick={() => handleDeleteLanguage(l.id)}
                      style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', opacity: 0.8 }}
                      title="Eliminar idioma"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
