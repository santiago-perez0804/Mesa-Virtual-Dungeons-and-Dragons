import { useState } from 'react';

export const CharacterManager = ({ socket, characters, monsters, userRole }: any) => {
  // --- ESTADOS DEL FORMULARIO ---
  const [name, setName] = useState('');
  const [charClass, setCharClass] = useState('Guerrero');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [stats, setStats] = useState({
    fue: 10, dex: 10, con: 10,
    int: 10, sab: 10, car: 10
  });

  // --- ESTADOS DE BÚSQUEDA ---
  const [searchTerm, setSearchTerm] = useState('');

  // --- LÓGICA DE PERSONAJES ---

  const handleSave = () => {
    if (!name) return alert("¡Tu héroe necesita un nombre!");

    const payload = { name, charClass, description, stats };

    if (editingId) {
      socket.emit('character:update', { id: editingId, ...payload });
      setEditingId(null);
    } else {
      socket.emit('character:create', payload);
    }

    // Reset tras guardar
    setName('');
    setDescription('');
    setCharClass('Guerrero');
    setStats({ fue: 10, dex: 10, con: 10, int: 10, sab: 10, car: 10 });
  };

  const startEdit = (c: any) => {
    setEditingId(c.id);
    setName(c.name);
    setCharClass(c.class);
    setDescription(c.description);
    setStats(JSON.parse(c.stats)); // Parseamos el string de SQLite
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
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              <input 
                style={styles.input}
                placeholder="Nombre del Héroe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
              <select 
                style={styles.input}
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
            </div>

            <textarea 
              style={{ ...styles.input, minHeight: '80px', resize: 'vertical' as const }}
              placeholder="Descripción o trasfondo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
              {Object.entries(stats).map(([key, value]) => (
                <div key={key}>
                  <label style={styles.statLabel}>{key.toUpperCase()}</label>
                  <input 
                    type="number" 
                    style={{ ...styles.input, padding: '8px', textAlign: 'center' }}
                    value={value} 
                    onChange={(e) => updateStat(key, +e.target.value)} 
                  />
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {characters.map((c: any) => (
            <div key={c.id} style={{ background: '#1e293b', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #a855f7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{c.name}</div>
                  <div style={{ color: '#a855f7', fontSize: '0.8rem' }}>{c.class} • {c.owner}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => startEdit(c)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✏️</button>
                  <button 
                    onClick={() => socket.emit('token:spawn', { ...c, type: 'character' })}
                    style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}
                  >
                    ⚔️ Invocar
                  </button>
                  {userRole === 'dm' && (
                    <button onClick={() => handleDelete(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ASIDE: BESTIARIO (Solo DM)[cite: 1, 2] */}
      {userRole === 'dm' && (
        <aside style={{ background: '#111', borderRadius: '12px', padding: '20px', border: '1px solid #444', height: 'fit-content', position: 'sticky', top: '20px' }}>
          <h3 style={{ color: '#ef4444', marginTop: 0 }}>👾 Bestiario SRD</h3>
          <input 
            style={{ ...styles.input, marginBottom: '20px' }}
            placeholder="🔍 Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
          </div>
        </aside>
      )}
    </div>
  );
};