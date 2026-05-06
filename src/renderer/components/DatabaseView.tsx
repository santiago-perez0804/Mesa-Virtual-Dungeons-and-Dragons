import { useState } from 'react';

export const DatabaseView = ({ compendium, socket, userRole }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<'all' | 'monster' | 'spell' | 'item'>('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Estados de Creación
  const [isCreating, setIsCreating] = useState(false);
  const [createType, setCreateType] = useState<'monster' | 'item'>('monster');
  const [createName, setCreateName] = useState('');
  const [createImage, setCreateImage] = useState('');
  const [createDesc, setCreateDesc] = useState('');

  // Monster stats
  const [createHp, setCreateHp] = useState(10);
  const [createAc, setCreateAc] = useState(10);
  const [createAttacks, setCreateAttacks] = useState([{ name: '', desc: '' }]);

  // Item stats
  const [createRarity, setCreateRarity] = useState('Común');
  const [createDamage, setCreateDamage] = useState('');

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setCreateImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!createName) return alert("El elemento necesita un nombre");

    let data: any = { description: createDesc };
    if (createImage) data.image = createImage;

    if (createType === 'monster') {
      data.hit_points = createHp;
      data.armor_class = createAc;
      data.type = "homebrew_monster";
      data.actions = createAttacks.filter(a => a.name || a.desc);
    } else {
      data.rarity = createRarity;
      if (createDamage) data.damage = createDamage;
    }

    socket.emit('content:create', { name: createName, type: createType, data });

    // Reset
    setIsCreating(false);
    setCreateName('');
    setCreateDesc('');
    setCreateImage('');
    setCreateAttacks([{ name: '', desc: '' }]);
    setCreateHp(10);
    setCreateAc(10);
    setCreateDamage('');
  };

  const filteredItems = compendium
    .filter((item: any) => category === 'all' || item.type === category)
    .filter((item: any) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 100); // Limits to 100 to avoid performance issues

  const typeIcons: any = {
    'monster': '👾 Monstruo',
    'spell': '✨ Hechizo',
    'item': '🗡️ Objeto'
  };

  const renderDetails = (item: any) => {
    try {
      const data = JSON.parse(item.data);

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {data.image && (
            <div style={{ width: '100%', maxHeight: '300px', borderRadius: '12px', overflow: 'hidden', display: 'flex', justifyContent: 'center', background: '#000', marginBottom: '10px' }}>
              <img src={data.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          )}

          {data.desc && <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: data.desc }} />}
          {data.description && !data.desc && <p style={{ background: '#0f172a', padding: '15px', borderRadius: '8px', lineHeight: '1.6' }}>{data.description}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {item.type === 'monster' && (
              <>
                <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px' }}><strong>HP:</strong> {data.hit_points || data.hp}</div>
                <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px' }}><strong>AC:</strong> {data.armor_class || data.ac}</div>
                <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px' }}><strong>Tipo:</strong> {data.type}</div>
                <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px' }}><strong>Alineamiento:</strong> {data.alignment}</div>
              </>
            )}
            {item.type === 'spell' && (
              <>
                <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px' }}><strong>Nivel:</strong> {data.level}</div>
                <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px' }}><strong>Escuela:</strong> {data.school}</div>
                <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px' }}><strong>Tiempo:</strong> {data.casting_time}</div>
                <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px' }}><strong>Rango:</strong> {data.range}</div>
                <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px' }}><strong>Duración:</strong> {data.duration}</div>
                <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px' }}><strong>Componentes:</strong> {data.components}</div>
              </>
            )}
            {item.type === 'item' && (
              <>
                <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px' }}><strong>Rareza:</strong> {data.rarity || 'Desconocida'}</div>
                {data.requires_attunement && <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px' }}><strong>Sintonización:</strong> {data.requires_attunement}</div>}
                {data.damage && <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px' }}><strong>Daño/Efecto:</strong> {data.damage}</div>}
              </>
            )}
          </div>

          {data.higher_level && (
            <div style={{ background: '#334155', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ color: '#fbbf24', marginTop: 0 }}>Niveles Superiores</h4>
              <p style={{ margin: 0 }}>{data.higher_level}</p>
            </div>
          )}

          {data.actions && Array.isArray(data.actions) && (
            <div style={{ background: '#1e293b', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ color: '#ef4444', marginTop: 0 }}>Acciones</h4>
              {data.actions.map((act: any, idx: number) => (
                <div key={idx} style={{ marginBottom: '10px' }}>
                  <strong>{act.name}:</strong> {act.desc}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } catch (e) {
      return <p>Error al leer los datos de este elemento.</p>;
    }
  };

  return (
    <section style={{ animation: 'fadeIn 0.5s' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '25px', border: '1px solid #333', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        {/* CABECERA Y BOTÓN DE CREAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#3b82f6', margin: 0 }}>📚 Compendio de D&D</h2>
          <button
            onClick={() => setIsCreating(!isCreating)}
            style={{ background: isCreating ? '#ef4444' : '#22c55e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {isCreating ? 'Volver a la Lista' : '+ Crear Nuevo'}
          </button>
        </div>

        {isCreating ? (
          <div style={{ background: '#0f172a', padding: '25px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ color: '#e2e8f0', margin: 0 }}>⚒️ Forja de Contenido</h3>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>Nombre</label>
                <input
                  style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}
                  value={createName} onChange={e => setCreateName(e.target.value)} placeholder="Ej. Dragón de Cristal"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>Tipo</label>
                <select
                  style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}
                  value={createType} onChange={(e: any) => setCreateType(e.target.value)}
                >
                  <option value="monster">Monstruo</option>
                  <option value="item">Objeto Mágico / Equipamiento</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ width: '150px', height: '150px', borderRadius: '12px', background: '#1e293b', border: '2px dashed #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                {createImage ? (
                  <img src={createImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#94a3b8', textAlign: 'center', fontSize: '0.8rem', padding: '10px' }}>+ Subir<br />Imagen</span>
                )}
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {createType === 'monster' ? (
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ color: '#ef4444', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>❤️ Puntos de Golpe (HP)</label>
                      <input type="number" style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white' }} value={createHp} onChange={e => setCreateHp(+e.target.value)} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ color: '#3b82f6', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>🛡️ Clase de Armadura (AC)</label>
                      <input type="number" style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white' }} value={createAc} onChange={e => setCreateAc(+e.target.value)} />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ color: '#f59e0b', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>✨ Rareza</label>
                      <input style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white' }} value={createRarity} onChange={e => setCreateRarity(e.target.value)} placeholder="Ej. Raro" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ color: '#ef4444', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>⚔️ Daño / Efecto (Opcional)</label>
                      <input style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white' }} value={createDamage} onChange={e => setCreateDamage(e.target.value)} placeholder="Ej. 1d8 cortante" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>Descripción</label>
              <textarea
                style={{ width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white', minHeight: '100px', resize: 'vertical' }}
                value={createDesc} onChange={e => setCreateDesc(e.target.value)} placeholder="Lore o descripción mecánica..."
              />
            </div>

            {createType === 'monster' && (
              <div style={{ borderTop: '1px solid #334155', paddingTop: '20px' }}>
                <h4 style={{ color: '#ef4444', margin: '0 0 15px 0' }}>⚔️ Ataques / Acciones</h4>
                {createAttacks.map((atk, index) => (
                  <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                      style={{ flex: 1, padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}
                      placeholder="Nombre del ataque" value={atk.name}
                      onChange={e => { const newA = [...createAttacks]; newA[index].name = e.target.value; setCreateAttacks(newA); }}
                    />
                    <input
                      style={{ flex: 2, padding: '10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}
                      placeholder="Descripción y daño..." value={atk.desc}
                      onChange={e => { const newA = [...createAttacks]; newA[index].desc = e.target.value; setCreateAttacks(newA); }}
                    />
                  </div>
                ))}
                <button
                  onClick={() => setCreateAttacks([...createAttacks, { name: '', desc: '' }])}
                  style={{ background: '#334155', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  + Añadir Otro Ataque
                </button>
              </div>
            )}

            <button
              onClick={handleSave}
              style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
            >
              💾 Guardar en el Compendio
            </button>
          </div>
        ) : (
          <>
            {/* FILTROS Y BÚSQUEDA */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
              <input
                style={{ flex: 1, padding: '15px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white', fontSize: '1.1rem' }}
                placeholder="🔍 Buscar hechizo, monstruo o artefacto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                {['all', 'monster', 'spell', 'item'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat as any)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      background: category === cat ? '#3b82f6' : '#1e293b',
                      color: 'white',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    {cat === 'all' ? 'Ver Todo' : typeIcons[cat]}
                  </button>
                ))}
              </div>
            </div>

            {/* GRILLA DE RESULTADOS */}
            {compendium.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                Cargando compendio o base de datos vacía...
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                {filteredItems.map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    style={{
                      background: '#1e293b',
                      padding: '15px',
                      borderRadius: '8px',
                      borderLeft: `4px solid ${item.type === 'spell' ? '#a855f7' : item.type === 'monster' ? '#ef4444' : '#f59e0b'}`,
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '5px', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{typeIcons[item.type]}</div>
                  </div>
                ))}
                {filteredItems.length === 100 && (
                  <div style={{ padding: '15px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', gridColumn: '1 / -1' }}>
                    Mostrando los primeros 100 resultados. Usa el buscador para encontrar algo específico.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL DE LECTURA */}
      {selectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ background: '#111', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '12px', border: '1px solid #333', padding: '30px', position: 'relative' }}>
            <button
              onClick={() => setSelectedItem(null)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#ef4444', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              ✕
            </button>

            <div style={{ marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
              <div style={{ fontSize: '1rem', color: '#3b82f6', marginBottom: '5px' }}>{typeIcons[selectedItem.type]}</div>
              <h1 style={{ margin: 0, color: '#e2e8f0' }}>{selectedItem.name}</h1>

              {userRole === 'dm' && selectedItem.type === 'monster' && (
                <button
                  onClick={() => {
                    const data = JSON.parse(selectedItem.data);
                    socket.emit('token:spawn', {
                      id: selectedItem.id,
                      name: selectedItem.name,
                      type: 'monster',
                      hp: data.hit_points || data.hp || 10,
                      ac: data.armor_class || 10
                    });
                    setSelectedItem(null); // Optional: close modal on spawn
                  }}
                  style={{ marginTop: '15px', background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ⚔️ Invocar en Mapa
                </button>
              )}
            </div>

            {renderDetails(selectedItem)}

          </div>
        </div>
      )}
    </section>
  );
};
