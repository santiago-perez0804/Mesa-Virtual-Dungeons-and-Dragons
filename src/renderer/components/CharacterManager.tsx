import { useState } from 'react';

const classDesc: any = {
  "Artífice": "Maestros de la invención, imbuyen magia en objetos cotidianos.",
  "Bárbaro": "Feroces guerreros impulsados por la ira y el instinto puro.",
  "Bardo": "Artistas mágicos cuyas actuaciones inspiran aliados y confunden enemigos.",
  "Brujo": "Invocadores que han hecho pactos con seres de otro mundo.",
  "Clérigo": "Canalizadores de magia divina, curanderos y protectores de su fe.",
  "Druida": "Sacerdotes de la vieja fe que asumen formas animales y usan magia de la naturaleza.",
  "Explorador": "Guerreros de los bosques, expertos en rastreo y combate con armas.",
  "Guerrero": "Maestros del combate marcial, expertos con diversas armas y armaduras.",
  "Hechicero": "Lanzadores de conjuros cuya magia proviene de un don innato.",
  "Mago": "Estudiosos de lo arcano, capaces de alterar la realidad con magia.",
  "Monje": "Maestros de las artes marciales que aprovechan la energía de su cuerpo.",
  "Paladín": "Caballeros sagrados, juramentados a la justicia y portadores de magia divina.",
  "Pícaro": "Expertos en sigilo, trampas y ataques precisos en los puntos débiles."
};

const classHitDice: any = {
  "Hechicero": 6, "Mago": 6,
  "Artífice": 8, "Bardo": 8, "Brujo": 8, "Clérigo": 8, "Druida": 8, "Monje": 8, "Pícaro": 8,
  "Explorador": 10, "Guerrero": 10, "Paladín": 10,
  "Bárbaro": 12
};

const raceDesc: any = {
  "Humano": "Versátiles, adaptables y ambiciosos. Destacan en todas las áreas.",
  "Elfo": "Ágiles, longevos y en sintonía con la magia y la naturaleza.",
  "Enano": "Robustos y resistentes, grandes artesanos y guerreros de la montaña.",
  "Mediano": "Pequeños, suertudos y ágiles. Prefieren evitar el conflicto directo.",
  "Orco": "Fuertes, salvajes y de gran tamaño. Temibles en el campo de batalla.",
  "Dracónido": "Humanoides con rasgos dracónicos, exhalan armas de aliento."
};

// Costos de Point Buy
const getPointCost = (val: number) => {
  if (val <= 8) return 0;
  if (val === 9) return 1;
  if (val === 10) return 2;
  if (val === 11) return 3;
  if (val === 12) return 4;
  if (val === 13) return 5;
  if (val === 14) return 7;
  if (val === 15) return 9;
  return 0; // Fuera del rango de creación
};

const calcMod = (val: number) => Math.floor((val - 10) / 2);
const getModStr = (val: number) => {
  const mod = calcMod(val);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

export const CharacterManager = ({ socket, characters, monsters, userRole }: any) => {
  // --- ESTADOS DEL FORMULARIO DE CREACIÓN ---
  const [name, setName] = useState('');
  const [charClass, setCharClass] = useState('Guerrero');
  const [race, setRace] = useState('Humano');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [stats, setStats] = useState({
    fue: 8, dex: 8, con: 8,
    int: 8, sab: 8, car: 8
  });

  const defaultInventory = { armas: [], armaduras: [], consumibles: [], artefactos: [] };
  const [inventory, setInventory] = useState<any>(defaultInventory);

  // --- ESTADOS DE VISTA ---
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
  const [levelUpClass, setLevelUpClass] = useState('');
  const [newItemNames, setNewItemNames] = useState<any>({ armas: '', armaduras: '', consumibles: '', artefactos: '' });

  // --- ESTADOS DE BÚSQUEDA ---
  const [searchTerm, setSearchTerm] = useState('');

  // --- CÁLCULO POINT BUY ---
  const spentPoints = Object.values(stats).reduce((acc, val) => acc + getPointCost(val), 0);
  const remainingPoints = 27 - spentPoints;

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

    let payloadMaxHp = 10;
    let payloadClass = charClass;
    let payloadLevel = 1;

    if (!editingId) {
      // Creación: Vida máxima óptima
      payloadMaxHp = classHitDice[charClass] + calcMod(stats.con);
      // Guardamos la clase como JSON para soportar multiclase futura
      payloadClass = JSON.stringify({ [charClass]: 1 });
    }

    const payload = {
      name,
      charClass: payloadClass,
      race,
      description,
      stats,
      image,
      inventory,
      level: payloadLevel,
      max_hp: payloadMaxHp,
      current_hp: payloadMaxHp
    };

    if (editingId) {
      // En edición preservamos el nivel y HP si existen, por lo que usamos un emit diferente o mergeamos
      // Dado que el form principal no tiene campos de level/hp, mantenemos los originales.
      const original = characters.find((c: any) => c.id === editingId);
      socket.emit('character:update', {
        id: editingId,
        ...payload,
        level: original?.level || 1,
        max_hp: original?.max_hp || payloadMaxHp,
        current_hp: original?.current_hp || payloadMaxHp,
        charClass: original?.class || payloadClass // Mantenemos las clases intactas en edición básica
      });
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
    setStats({ fue: 8, dex: 8, con: 8, int: 8, sab: 8, car: 8 });
  };

  const startEdit = (c: any) => {
    setEditingId(c.id);
    setName(c.name);
    // Para el select del form, si era multiclase solo mostramos la base o evitamos editarla
    try {
      const parsed = JSON.parse(c.class);
      setCharClass(Object.keys(parsed)[0]);
    } catch {
      setCharClass(c.class);
    }
    setRace(c.race || 'Humano');
    setDescription(c.description);
    setImage(c.image || '');
    setStats(JSON.parse(c.stats));
    setInventory(c.inventory ? JSON.parse(c.inventory) : defaultInventory);
    setSelectedCharacter(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este aventurero?")) {
      socket.emit('character:delete', id);
    }
  };

  const updateStat = (stat: string, val: number) => {
    if (editingId) {
      // En modo edición (Level Up manual de stats), permitimos ir hasta 20
      const clampedVal = Math.max(1, Math.min(20, val));
      setStats({ ...stats, [stat]: clampedVal });
    } else {
      // Modo Creación (Point Buy)
      const clampedVal = Math.max(8, Math.min(15, val));
      const currentCost = getPointCost(stats[stat as keyof typeof stats]);
      const newCost = getPointCost(clampedVal);
      if (spentPoints - currentCost + newCost <= 27) {
        setStats({ ...stats, [stat]: clampedVal });
      }
    }
  };

  const parseClasses = (clsStr: string) => {
    try {
      const parsed = JSON.parse(clsStr);
      if (typeof parsed === 'object' && parsed !== null) return parsed;
    } catch (e) { }
    return { [clsStr || "Guerrero"]: 1 };
  };

  const handleLevelUp = () => {
    if (!levelUpClass) return alert("Elige una clase para tomar tu nuevo nivel.");

    const hitDie = classHitDice[levelUpClass];
    const roll = Math.floor(Math.random() * hitDie) + 1;
    const charStats = typeof selectedCharacter.stats === 'string' ? JSON.parse(selectedCharacter.stats) : selectedCharacter.stats;
    const conMod = calcMod(charStats.con);
    const hpGain = Math.max(1, roll + conMod);

    alert(`🗡️ Tomaste un nivel en ${levelUpClass}.\nTiraste un d${hitDie} y sacaste ${roll}.\nModificador de CON: ${getModStr(charStats.con)}.\n¡Tu Vida Máxima aumenta en ${hpGain} puntos!`);

    const newMaxHp = (selectedCharacter.max_hp || 10) + hpGain;
    const newCurrentHp = (selectedCharacter.current_hp || 10) + hpGain;
    const newLevel = (selectedCharacter.level || 1) + 1;

    const parsedClasses = parseClasses(selectedCharacter.class);
    parsedClasses[levelUpClass] = (parsedClasses[levelUpClass] || 0) + 1;

    const updated = {
      ...selectedCharacter,
      class: JSON.stringify(parsedClasses),
      level: newLevel,
      max_hp: newMaxHp,
      current_hp: newCurrentHp
    };

    socket.emit('character:update', updated);
    setSelectedCharacter(updated);
    setLevelUpClass("");
  };

  // --- LÓGICA DE MONSTRUOS (BESTIARIO) ---

  const filteredMonsters = monsters
    .filter((m: any) => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 20);

  const spawnMonster = (monster: any) => {
    const mData = JSON.parse(monster.data);
    socket.emit('token:spawn', {
      id: monster.id,
      name: monster.name,
      type: 'monster',
      hp: mData.hit_points || mData.hp || 10,
      ac: mData.armor_class || 10,
      image: mData.image || null
    });
  };

  // --- ESTILOS ---
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '30px',
      color: '#e0e0e0',
      width: '100%'
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
      width: '100%',
      boxSizing: 'border-box' as const
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
                <select style={{ ...styles.input, marginBottom: '8px' }} value={race} onChange={(e) => setRace(e.target.value)}>
                  {Object.keys(raceDesc).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', padding: '0 4px' }}>{raceDesc[race]}</div>
              </div>

              <div>
                <select
                  style={{ ...styles.input, marginBottom: '8px' }}
                  value={charClass}
                  onChange={(e) => setCharClass(e.target.value)}
                  disabled={editingId !== null} // No se cambia la clase base en edición básica
                >
                  {Object.keys(classDesc).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', padding: '0 4px' }}>
                  {classDesc[charClass]}
                </div>
              </div>
            </div>

            {/* NUEVA CUADRÍCULA DE CLASE */}
            <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px', border: '1px solid #334155' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#3b82f6', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>📜 Rasgos de Clase: {charClass}</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', border: '1px solid #475569' }}>
                  <h5 style={{ margin: '0 0 10px 0', color: '#ef4444' }}>❤️ Puntos de Golpe</h5>
                  {editingId ? (
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1' }}>
                      <em>En edición se conserva tu HP actual. Para ganar vida por nivel, ve a la ficha del personaje y usa "Subir Nivel".</em>
                    </p>
                  ) : (
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                      Dado de Golpe: <strong style={{ color: '#fbbf24' }}>d{classHitDice[charClass]}</strong><br/>
                      Vida Nivel 1: <strong>{classHitDice[charClass]} + Modificador de CON</strong><br/>
                      <br/>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        (A nivel 1 la vida está al máximo. En niveles superiores podrás tirar el dado).
                      </span>
                    </p>
                  )}
                </div>
                <div style={{ background: '#1e293b', padding: '15px', borderRadius: '8px', border: '1px solid #475569' }}>
                  <h5 style={{ margin: '0 0 10px 0', color: '#2dd4bf' }}>✨ Habilidades de Nivel 1</h5>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic', lineHeight: '1.5' }}>
                    Las habilidades, competencias y poderes que tu clase te otorga a nivel 1 se mostrarán aquí.
                    <br/><br/>
                    (El contenido se rellenará más adelante...)
                  </p>
                </div>
              </div>
            </div>

            <textarea
              style={{ ...styles.input, minHeight: '80px', resize: 'vertical' as const }}
              placeholder="Descripción o trasfondo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h4 style={{ margin: 0, color: '#e2e8f0' }}>Estadísticas</h4>
                {!editingId && (
                  <div style={{ color: remainingPoints === 0 ? '#ef4444' : '#22c55e', fontWeight: 'bold' }}>
                    Puntos Restantes: {remainingPoints} / 27
                  </div>
                )}
              </div>
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
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ flex: 1, background: editingId ? '#22c55e' : '#7c3aed', color: 'white', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }} onClick={handleSave}>
                {editingId ? 'Guardar Cambios' : 'Crear Personaje'}
              </button>
              {editingId && (
                <button onClick={() => { setEditingId(null); setName(''); }} style={{ background: '#4b5563', color: 'white', padding: '14px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
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
          {characters.map((c: any) => {
            const parsedCls = parseClasses(c.class);
            const classesDisplay = Object.entries(parsedCls).map(([cls, lvl]) => `${cls} ${lvl}`).join(' / ');
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCharacter(c)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', width: '120px', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#1e293b', border: '3px solid #a855f7', overflow: 'hidden', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {c.image ? <img src={c.image} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '2rem' }}>👤</span>}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold', textAlign: 'center', color: '#e0e0e0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                  {c.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>Nvl {c.level || 1}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MODAL DE DETALLES DEL PERSONAJE */}
      {selectedCharacter && (() => {
        const charStats = typeof selectedCharacter.stats === 'string' ? JSON.parse(selectedCharacter.stats) : selectedCharacter.stats;
        const charInv = selectedCharacter.inventory ? (typeof selectedCharacter.inventory === 'string' ? JSON.parse(selectedCharacter.inventory) : selectedCharacter.inventory) : defaultInventory;
        const parsedClasses = parseClasses(selectedCharacter.class);
        const classesDisplay = Object.entries(parsedClasses).map(([cls, lvl]) => `${cls} ${lvl}`).join(' / ');

        const sections: any = {
          armas: { title: 'Armas', icon: '⚔️' },
          armaduras: { title: 'Armaduras', icon: '🛡️' },
          consumibles: { title: 'Consumibles', icon: '🧪' },
          artefactos: { title: 'Artefactos', icon: '💍' }
        };

        const handleAddInv = (sec: string) => {
          const itemName = newItemNames[sec];
          if (itemName && itemName.trim() !== '') {
            const newInv = { ...charInv, [sec]: [...(charInv[sec] || []), { id: Date.now(), name: itemName.trim() }] };
            const updated = { ...selectedCharacter, inventory: JSON.stringify(newInv) };
            socket.emit('character:update', updated);
            setSelectedCharacter(updated);
            setNewItemNames({ ...newItemNames, [sec]: '' });
          }
        };

        const handleRemoveInv = (sec: string, id: number) => {
          const newInv = { ...charInv, [sec]: charInv[sec].filter((i: any) => i.id !== id) };
          const updated = { ...selectedCharacter, inventory: JSON.stringify(newInv) };
          socket.emit('character:update', updated);
          setSelectedCharacter(updated);
        };

        const changeHP = (amount: number) => {
          let newHp = (selectedCharacter.current_hp || selectedCharacter.max_hp || 10) + amount;
          newHp = Math.min(newHp, selectedCharacter.max_hp || 10); // No exceder max
          const updated = { ...selectedCharacter, current_hp: newHp };
          socket.emit('character:update', updated);
          setSelectedCharacter(updated);
        };

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', boxSizing: 'border-box' }}>
            <div style={{ ...styles.card, width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <button onClick={() => setSelectedCharacter(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#ef4444', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '12px', background: '#334155', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedCharacter.image ? <img src={selectedCharacter.image} alt={selectedCharacter.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '3rem' }}>👤</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <h1 style={{ margin: '0 0 5px 0', color: '#a855f7' }}>{selectedCharacter.name} <span style={{ fontSize: '1rem', color: 'white', background: '#334155', padding: '4px 8px', borderRadius: '4px' }}>Nv {selectedCharacter.level || 1}</span></h1>
                  <p style={{ margin: 0, fontSize: '1.1rem', color: '#cbd5e1' }}>
                    {selectedCharacter.race || 'Humano'} • {classesDisplay}
                  </p>

                  {/* SISTEMA DE VIDA */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '15px', background: '#0f172a', padding: '10px', borderRadius: '8px', border: '1px solid #334155', width: 'fit-content' }}>
                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>❤️ HP</span>
                    <button onClick={() => changeHP(-1)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', width: '25px', cursor: 'pointer' }}>-</button>
                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', width: '60px', textAlign: 'center' }}>
                      {selectedCharacter.current_hp || selectedCharacter.max_hp || 10} / {selectedCharacter.max_hp || 10}
                    </span>
                    <button onClick={() => changeHP(1)} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', width: '25px', cursor: 'pointer' }}>+</button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                  <button onClick={() => { socket.emit('token:spawn', { ...selectedCharacter, type: 'character' }); setSelectedCharacter(null); }} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>⚔️ Invocar</button>
                  <button onClick={() => startEdit(selectedCharacter)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>✏️ Editar</button>
                  {userRole === 'dm' && <button onClick={() => { handleDelete(selectedCharacter.id); setSelectedCharacter(null); }} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>🗑️ Borrar</button>}
                </div>
              </div>

              {/* SUBIDA DE NIVEL Y MULTICLASE */}
              <div style={{ background: '#3b2505', padding: '15px', borderRadius: '8px', border: '1px solid #fbbf24', display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#fbbf24' }}>🌟 Subir de Nivel</h4>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#fcd34d' }}>Elige una clase para ganar sus PG.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select
                    style={{ padding: '8px', borderRadius: '6px', border: 'none', background: '#1a1a1a', color: 'white' }}
                    value={levelUpClass}
                    onChange={(e) => setLevelUpClass(e.target.value)}
                  >
                    <option value="">-- Elige Clase --</option>
                    {Object.keys(classDesc).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button onClick={handleLevelUp} style={{ background: '#fbbf24', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '6px', padding: '8px 15px', cursor: 'pointer' }}>
                    Subir Nivel
                  </button>
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
                      </div>

                      {/* INPUT DE INVENTARIO MEJORADO */}
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                        <input
                          type="text"
                          placeholder={`Añadir a ${secMeta.title}...`}
                          value={newItemNames[secKey] || ''}
                          onChange={(e) => setNewItemNames({ ...newItemNames, [secKey]: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddInv(secKey)}
                          style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #334155', background: '#1e293b', color: 'white' }}
                        />
                        <button onClick={() => handleAddInv(secKey)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {charInv[secKey]?.map((item: any) => (
                          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1e293b', padding: '6px 12px', borderRadius: '20px', border: '1px solid #334155' }}>
                            <span style={{ fontSize: '0.9rem' }}>{item.name}</span>
                            <button onClick={() => handleRemoveInv(secKey, item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, marginLeft: '4px' }}>✕</button>
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