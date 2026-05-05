import { useState } from 'react';

const classDesc: any = {
  "Guerrero": "Maestros del combate marcial, expertos con diversas armas y armaduras.",
  "Mago": "Estudiosos de lo arcano, capaces de alterar la realidad con magia.",
  "Pícaro": "Expertos en sigilo, trampas y ataques precisos en los puntos débiles.",
  "Clérigo": "Canalizadores de magia divina, curanderos y protectores de su fe.",
  "Bárbaro": "Feroces guerreros impulsados por la ira y el instinto puro.",
  "Paladín": "Caballeros sagrados, juramentados a la justicia y portadores de magia divina."
};

const raceDesc: any = {
  "Humano": "Versátiles, adaptables y ambiciosos. Destacan en todas las áreas.",
  "Elfo": "Ágiles, longevos y en sintonía con la magia y la naturaleza.",
  "Enano": "Robustos y resistentes, grandes artesanos y guerreros de la montaña.",
  "Mediano": "Pequeños, suertudos y ágiles. Prefieren evitar el conflicto directo.",
  "Orco": "Fuertes, salvajes y de gran tamaño. Temibles en el campo de batalla.",
  "Dracónido": "Humanoides con rasgos dracónicos, capaces de exhalar armas de aliento."
};

export const CharacterManager = ({ socket, characters, monsters, userRole }: any) => {
  // --- ESTADOS DEL FORMULARIO ---
  const [name, setName] = useState('');
  const [charClass, setCharClass] = useState('Guerrero');
  const [race, setRace] = useState('Humano');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [stats, setStats] = useState({
    fue: 10, dex: 10, con: 10,
    int: 10, sab: 10, car: 10
  });
  const defaultInventory = { armas: [], armaduras: [], consumibles: [], artefactos: [] };
  const [inventory, setInventory] = useState<any>(defaultInventory);

  // --- ESTADOS DE VISTA ---
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);

  // --- ESTADOS DE BÚSQUEDA ---
  const [searchTerm, setSearchTerm] = useState('');

  // --- LÓGICA DE PERSONAJES ---

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name) return alert("¡Tu héroe necesita un nombre!");

    const payload = { name, charClass, race, description, stats, image, inventory };

    if (editingId) {
      socket.emit('character:update', { id: editingId, ...payload });
      setEditingId(null);
    } else {
      socket.emit('character:create', payload);
    }

    // Reset tras guardar
    setName('');
    setDescription('');
    setImage('');
    setCharClass('Guerrero');
    setRace('Humano');
    setInventory(defaultInventory);
    setStats({ fue: 10, dex: 10, con: 10, int: 10, sab: 10, car: 10 });
  };

  const startEdit = (c: any) => {
    setEditingId(c.id);
    setName(c.name);
    setCharClass(c.class);
    setRace(c.race || 'Humano');
    setDescription(c.description);
    setImage(c.image || '');
    setStats(JSON.parse(c.stats)); // Parseamos el string de SQLite
    setInventory(c.inventory ? JSON.parse(c.inventory) : defaultInventory);
    setSelectedCharacter(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este aventurero?")) {
      socket.emit('character:delete', id); // Sincronizado con el servidor[cite: 2]
    }
  };

  const updateStat = (stat: string, val: number) => {
    const clampedVal = Math.max(1, Math.min(20, val));
    setStats({ ...stats, [stat]: clampedVal });
  };

  const calcMod = (val: number) => Math.floor((val - 10) / 2);
  const getModStr = (val: number) => {
    const mod = calcMod(val);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  // --- LÓGICA DE MONSTRUOS (BESTIARIO) ---

  // OPTIMIZACIÓN: Solo mostramos los primeros 20 resultados para evitar lag con los +1000 registros
  const filteredMonsters = monsters
    .filter((m: any) => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 20);

  const spawnMonster = (monster: any) => {
    // Extraemos HP y AC reales desde el JSON almacenado en la columna 'data'
    const mData = JSON.parse(monster.data);

    socket.emit('token:spawn', {
      id: monster.id,
      name: monster.name,
      type: 'monster',
      hp: mData.hit_points || mData.hp || 10,
      ac: mData.armor_class || 10
    });
  };

  // --- ESTILOS ---
  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: userRole === 'dm' ? '1fr 350px' : '1fr',
      gap: '30px',
      padding: '20px',
      color: '#e0e0e0'
    },
    card: {
      background: '#1a1a1a',
      borderRadius: '12px',
      padding: '25px',
      border: '1px solid #333',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
    },
    input: {
      padding: '12px',
      background: '#0f172a',
      border: '1px solid #334155',
      borderRadius: '8px',
      color: 'white',
      width: '100%'
    },
    statLabel: {
      fontSize: '0.7rem',
      color: '#a855f7',
      fontWeight: 'bold' as const,
      marginBottom: '4px',
      display: 'block'
    }
  };

  return (
    <div style={styles.container}>

      {/* SECCIÓN DE HÉROES */}
      <section>
        <div style={styles.card}>
          <h2 style={{ textAlign: 'center', color: editingId ? '#22c55e' : '#a855f7', marginTop: 0 }}>
            {editingId ? '⚡ Editando Aventurero' : '⚔️ Forjar Personaje'}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                {image ? (
                  <img src={image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '2rem' }}>👤</span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                  title="Subir foto"
                />
              </div>
              <div style={{ flex: 1 }}>
                <input
                  style={{ ...styles.input, fontSize: '1.2rem', fontWeight: 'bold' }}
                  placeholder="Nombre del Héroe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <select
                  style={{ ...styles.input, marginBottom: '8px' }}
                  value={race}
                  onChange={(e) => setRace(e.target.value)}
                >
                  <option value="Humano">Humano</option>
                  <option value="Elfo">Elfo</option>
                  <option value="Enano">Enano</option>
                  <option value="Mediano">Mediano</option>
                  <option value="Orco">Orco</option>
                  <option value="Dracónido">Dracónido</option>
                </select>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', padding: '0 4px' }}>{raceDesc[race]}</div>
              </div>

              <div>
                <select
                  style={{ ...styles.input, marginBottom: '8px' }}
                  value={charClass}
                  onChange={(e) => setCharClass(e.target.value)}
                >
                  <option value="Guerrero">Guerrero</option>
                  <option value="Mago">Mago</option>
                  <option value="Pícaro">Pícaro</option>
                  <option value="Clérigo">Clérigo</option>
                  <option value="Bárbaro">Bárbaro</option>
                  <option value="Paladín">Paladín</option>
                </select>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', padding: '0 4px' }}>{classDesc[charClass]}</div>
              </div>
            </div>

            <textarea
              style={{ ...styles.input, minHeight: '80px', resize: 'vertical' as const }}
              placeholder="Descripción o trasfondo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <label style={styles.statLabel}>{key.toUpperCase()}</label>
                  <input
                    type="number"
                    style={{ ...styles.input, padding: '8px', textAlign: 'center', marginBottom: '4px' }}
                    value={value}
                    onChange={(e) => updateStat(key, +e.target.value)}
                  />
                  <div style={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: 'bold' }}>
                    {getModStr(value)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                style={{ flex: 1, background: editingId ? '#22c55e' : '#7c3aed', color: 'white', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                onClick={handleSave}
              >
                {editingId ? 'Guardar Cambios' : 'Crear Personaje'}
              </button>
              {editingId && (
                <button
                  onClick={() => { setEditingId(null); setName(''); }}
                  style={{ background: '#4b5563', color: 'white', padding: '14px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>

        <h3 style={{ marginTop: '40px', color: '#94a3b8', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
          Héroes en la Reserva
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' }}>
          {characters.map((c: any) => (
            <div
              key={c.id}
              onClick={() => setSelectedCharacter(c)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                width: '120px',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#1e293b', border: '3px solid #a855f7', overflow: 'hidden', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {c.image ? (
                  <img src={c.image} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '2rem' }}>👤</span>
                )}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', textAlign: 'center', color: '#e0e0e0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                {c.name}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ASIDE: BESTIARIO (Solo DM)[cite: 1, 2] */}
      {userRole === 'dm' && (
        <aside style={{ background: '#111', borderRadius: '12px', padding: '20px', border: '1px solid #444', height: 'fit-content', position: 'sticky', top: '20px' }}>
          <h3 style={{ color: '#ef4444', marginTop: 0 }}>👾 Bestiario Rápido</h3>
          <button
            style={{ width: '100%', padding: '10px', marginBottom: '15px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => alert("Función en desarrollo: Calculará el VD recomendado para el grupo actual.")}
          >
            ⚖️ Recomendar Enemigos (WIP)
          </button>
          <input
            style={{ ...styles.input, marginBottom: '20px' }}
            placeholder="🔍 Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '500px', overflowY: 'auto' }}>
              {filteredMonsters.map((m: any) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#1c1c1c', borderRadius: '8px', border: '1px solid #333' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{m.name}</span>
                  <button
                    onClick={() => spawnMonster(m)}
                    style={{ background: '#ef4444', border: 'none', color: 'white', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    +
                  </button>
                </div>
              ))}
              {filteredMonsters.length === 0 && (
                <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>No se encontraron monstruos.</div>
              )}
            </div>
          ) : (
            <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', fontStyle: 'italic', padding: '20px 0' }}>
              Escribe un nombre para buscar monstruos.
            </div>
          )}
        </aside>
      )}

      {/* MODAL DE DETALLES DEL PERSONAJE */}
      {selectedCharacter && (() => {
        const charStats = typeof selectedCharacter.stats === 'string' ? JSON.parse(selectedCharacter.stats) : selectedCharacter.stats;
        const charInv = selectedCharacter.inventory ? (typeof selectedCharacter.inventory === 'string' ? JSON.parse(selectedCharacter.inventory) : selectedCharacter.inventory) : defaultInventory;

        const sections: any = {
          armas: { title: 'Armas', icon: '⚔️' },
          armaduras: { title: 'Armaduras', icon: '🛡️' },
          consumibles: { title: 'Consumibles', icon: '🧪' },
          artefactos: { title: 'Artefactos', icon: '💍' }
        };

        const handleAddInv = (sec: string) => {
          const itemName = prompt(`Añadir a ${sections[sec].title}:`);
          if (itemName) {
            const newInv = { ...charInv, [sec]: [...(charInv[sec] || []), { id: Date.now(), name: itemName }] };
            const updated = { ...selectedCharacter, inventory: JSON.stringify(newInv) };
            socket.emit('character:update', updated);
            setSelectedCharacter(updated);
          }
        };

        const handleRemoveInv = (sec: string, id: number) => {
          const newInv = { ...charInv, [sec]: charInv[sec].filter((i: any) => i.id !== id) };
          const updated = { ...selectedCharacter, inventory: JSON.stringify(newInv) };
          socket.emit('character:update', updated);
          setSelectedCharacter(updated);
        };

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', boxSizing: 'border-box' }}>
            <div style={{ ...styles.card, width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <button
                onClick={() => setSelectedCharacter(null)}
                style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#ef4444', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                ✕
              </button>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '12px', background: '#334155', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedCharacter.image ? (
                    <img src={selectedCharacter.image} alt={selectedCharacter.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '3rem' }}>👤</span>
                  )}
                </div>
                <div>
                  <h1 style={{ margin: '0 0 10px 0', color: '#a855f7' }}>{selectedCharacter.name}</h1>
                  <p style={{ margin: 0, fontSize: '1.1rem', color: '#cbd5e1' }}>
                    {selectedCharacter.race || 'Humano'} • {selectedCharacter.class}
                  </p>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#64748b' }}>Propietario: {selectedCharacter.owner}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                  <button onClick={() => startEdit(selectedCharacter)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>✏️ Editar</button>
                  <button
                    onClick={() => { socket.emit('token:spawn', { ...selectedCharacter, type: 'character' }); setSelectedCharacter(null); }}
                    style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ⚔️ Invocar
                  </button>
                  {userRole === 'dm' && (
                    <button onClick={() => { handleDelete(selectedCharacter.id); setSelectedCharacter(null); }} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🗑️</button>
                  )}
                </div>
              </div>

              <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px' }}>
                <p style={{ margin: 0, color: '#e2e8f0', lineHeight: '1.6' }}>{selectedCharacter.description || "Sin descripción."}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', background: '#0f172a', padding: '15px', borderRadius: '8px' }}>
                {Object.entries(charStats).map(([key, value]: any) => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: 'bold', marginBottom: '5px' }}>{key.toUpperCase()}</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</span>
                    <span style={{ fontSize: '1rem', color: '#22c55e', marginTop: '2px' }}>{getModStr(value)}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '10px' }}>
                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', color: '#fbbf24' }}>🎒 Inventario</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {Object.entries(sections).map(([secKey, secMeta]: any) => (
                    <div key={secKey} style={{ background: '#0f172a', borderRadius: '8px', padding: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0, color: '#cbd5e1' }}>{secMeta.icon} {secMeta.title}</h4>
                        <button
                          onClick={() => handleAddInv(secKey)}
                          style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          + Añadir
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {charInv[secKey]?.map((item: any) => (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1e293b', padding: '6px 12px', borderRadius: '20px', border: '1px solid #334155' }}>
                            <span style={{ fontSize: '0.9rem' }}>{item.name}</span>
                            <button
                              onClick={() => handleRemoveInv(secKey, item.id)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, marginLeft: '4px' }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        {(!charInv[secKey] || charInv[secKey].length === 0) && (
                          <span style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>Vacío</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
};