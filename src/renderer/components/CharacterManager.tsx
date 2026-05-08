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
  "Humano": "Versátiles, adaptables y ambiciosos. (+1 a todo)",
  "Elfo": "Ágiles, longevos y en sintonía con la magia. (+2 Destreza)",
  "Enano": "Robustos y resistentes, grandes artesanos. (+2 Constitución)",
  "Gnomo": "Pequeños inventores con mentes brillantes. (+2 Inteligencia)",
  "Mediano": "Pequeños, suertudos y ágiles. (+2 Destreza)",
  "Orco": "Fuertes, salvajes y temibles. (+2 Fuerza)",
  "Dracónido": "Humanoides con rasgos dracónicos. (+2 Fuerza, +1 Carisma)"
};

const raceBonuses: any = {
  "Humano": { fue: 1, dex: 1, con: 1, int: 1, sab: 1, car: 1 },
  "Elfo": { dex: 2 },
  "Enano": { con: 2 },
  "Gnomo": { int: 2 },
  "Mediano": { dex: 2 },
  "Orco": { fue: 2 },
  "Dracónido": { fue: 2, car: 1 }
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

const skillList = [
  "Acrobacias", "Atletismo", "Arcanos", "Engaño", "Historia",
  "Intuición", "Intimidación", "Investigación", "Medicina",
  "Naturaleza", "Percepción", "Interpretación", "Persuasión",
  "Religión", "Juego de Manos", "Sigilo", "Supervivencia", "Trato con Animales"
];

const statDescriptions: any = {
  fue: "Fuerza física y potencia muscular.",
  dex: "Agilidad, reflejos y equilibrio.",
  con: "Salud, resistencia y vitalidad.",
  int: "Razonamiento, memoria y lógica.",
  sab: "Percepción, intuición y empatía.",
  car: "Presencia y fuerza de personalidad."
};

const subraces: any = {
  "Humano": ["Estándar"],
  "Elfo": ["Alto Elfo", "Elfo de los Bosques", "Elfo Oscuro (Drow)"],
  "Enano": ["Enano de las Colinas", "Enano de las Montañas"],
  "Gnomo": ["Gnomo de los Bosques", "Gnomo de las Rocas"],
  "Mediano": ["Piesligeros", "Fuertecorazón"],
  "Orco": ["Semiorco", "Orco de las Estepas"],
  "Dracónido": ["Rojo", "Azul", "Dorado", "Plateado", "Verde"]
};

export const CharacterManager = ({ socket, characters, monsters, compendium, userRole }: any) => {
  // --- ESTADOS DEL FORMULARIO DE CREACIÓN ---
  const [name, setName] = useState('');
  const [charClass, setCharClass] = useState('Guerrero');
  const [race, setRace] = useState('Humano');
  const [subrace, setSubrace] = useState('Estándar');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [stats, setStats] = useState({
    fue: 8, dex: 8, con: 8,
    int: 8, sab: 8, car: 8
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [backgroundItems, setBackgroundItems] = useState<string[]>(['', '']);

  const defaultInventory = { armas: [], armaduras: [], consumibles: [], artefactos: [] };
  const [inventory, setInventory] = useState<any>(defaultInventory);

  // --- ESTADOS DE VISTA ---
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState(1);
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
  const [levelUpClass, setLevelUpClass] = useState('');
  const [newItemNames, setNewItemNames] = useState<any>({ armas: '', armaduras: '', consumibles: '', artefactos: '' });
  const [itemSearchTerms, setItemSearchTerms] = useState<any>({ armas: '', armaduras: '', consumibles: '', artefactos: '' });

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

    const finalStats = { ...stats };
    if (!editingId) {
      const bonuses = raceBonuses[race] || {};
      Object.keys(bonuses).forEach((s: string) => {
        (finalStats as any)[s] += bonuses[s];
      });
    }

    const dexMod = calcMod(finalStats.dex);
    const ac = 10 + dexMod;

    const payload = {
      name,
      charClass: payloadClass,
      race: `${race} (${subrace})`,
      description,
      stats: finalStats,
      image,
      inventory: JSON.stringify({
        ...inventory,
        trasfondo: backgroundItems.filter(i => i.trim() !== ''),
        habilidades: selectedSkills
      }),
      level: payloadLevel,
      max_hp: payloadMaxHp,
      current_hp: payloadMaxHp,
      ac: ac
    };

    if (editingId) {
      const original = characters.find((c: any) => c.id === editingId);
      socket.emit('character:update', {
        id: editingId,
        ...payload,
        level: original?.level || 1,
        max_hp: original?.max_hp || payloadMaxHp,
        current_hp: original?.current_hp || payloadMaxHp,
        charClass: original?.class || payloadClass
      });
    } else {
      socket.emit('character:create', payload);
    }

    resetForm();
  };

  const resetForm = () => {
    setIsCreating(false);
    setCreationStep(1);
    setEditingId(null);
    setName('');
    setDescription('');
    setImage('');
    setCharClass('Guerrero');
    setRace('Humano');
    setSubrace('Estándar');
    setInventory(defaultInventory);
    setStats({ fue: 8, dex: 8, con: 8, int: 8, sab: 8, car: 8 });
    setSelectedSkills([]);
    setBackgroundItems(['', '']);
  };

  const startEdit = (c: any) => {
    setIsCreating(true);
    setEditingId(c.id);
    setName(c.name);
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
    let mData: any;
    try {
      mData = typeof monster.data === 'string' ? JSON.parse(monster.data) : monster.data;
    } catch (e) {
      console.error("Error parseando data del monstruo:", e);
      return;
    }

    const hpText = mData.hit_points || mData.hp || '10';
    // Importamos o definimos parseAndRollHP si no está disponible, 
    // pero como este componente es un componente de React, asumimos que 
    // podemos usar una versión simplificada o la misma que App si se pasara por props.
    // Para ser consistentes, calculamos un valor o usamos el base.

    let rolledHp = 10;
    if (typeof hpText === 'number') {
      rolledHp = hpText;
    } else {
      // Intento básico de parseo si no tenemos el util a mano (aunque lo ideal es importarlo)
      const match = hpText.match(/^(\d+)/);
      rolledHp = match ? parseInt(match[1]) : 10;
    }

    socket.emit('token:spawn', {
      id: monster.id,
      name: monster.name,
      type: 'monster',
      hp: rolledHp,
      max_hp: rolledHp,
      ac: mData.armor_class || 10,
      image: mData.image || null
    });
  };

  // --- ESTILOS ---
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '40px',
      color: 'var(--text-parchment)',
      width: '100%',
      paddingBottom: '100px'
    },
    card: {
      background: 'var(--bg-surface)',
      padding: '40px',
      border: '1px solid var(--border-color)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
    },
    input: {
      padding: '14px 18px',
      background: 'var(--bg-base)',
      border: '1px solid var(--border-color)',
      borderRadius: '2px',
      color: 'white',
      width: '100%',
      boxSizing: 'border-box' as const,
      outline: 'none',
      transition: 'border-color 0.2s'
    },
    statLabel: {
      fontSize: '0.65rem',
      color: 'var(--accent-gold)',
      fontWeight: 'bold' as const,
      marginBottom: '6px',
      display: 'block',
      letterSpacing: '1px'
    }
  };

  const filteredCharacters = characters.filter((c: any) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.owner?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <section>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '40px', background: 'var(--bg-surface)', padding: '25px', border: '1px solid var(--border-color)' }} className="clipped-frame">
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              className="mono"
              style={{ ...styles.input, paddingLeft: '45px' }}
              placeholder="Buscar héroe en la reserva..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
          </div>
          <button
            onClick={() => { resetForm(); setIsCreating(true); }}
            className="font-cinzel torch-glow"
            style={{ background: 'var(--accent-gold)', color: 'white', border: 'none', padding: '14px 30px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem', letterSpacing: '1px' }}
          >
            + NUEVO HÉROE
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '30px' }}>
          {filteredCharacters.map((c: any) => {
            const parsedCls = parseClasses(c.class);
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCharacter(c)}
                className="clipped-frame torch-glow"
                style={{ background: 'var(--bg-surface)', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all 0.3s' }}
              >
                <div style={{ width: '100%', aspectRatio: '1/1', border: '1px solid var(--accent-gold)', overflow: 'hidden', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
                  {c.image ? <img src={c.image} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '3rem', opacity: 0.2 }}>👤</span>}
                </div>
                <div className="font-cinzel" style={{ fontSize: '1.1rem', fontWeight: 'bold', textAlign: 'center', color: 'var(--accent-gold)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', marginBottom: '5px' }}>
                  {c.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Nivel {c.level || 1}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-parchment)', textAlign: 'center', marginTop: '5px', opacity: 0.7 }}>{Object.keys(parsedCls)[0]}</div>
              </div>
            );
          })}
          {filteredCharacters.length === 0 && <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>No se encontraron aventureros...</div>}
        </div>
      </section>

      {/* MODAL DE FORJA / EDICIÓN */}
      {isCreating && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '40px' }} onClick={() => resetForm()}>
          <div style={{ ...styles.card, width: '100%', maxWidth: '1000px', maxHeight: '95vh', overflowY: 'auto', border: '2px solid var(--accent-gold)' }} className="clipped-frame" onClick={e => e.stopPropagation()}>

            {/* INDICADOR DE PASOS */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '40px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
              {[1, 2, 3].map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: creationStep === s ? 1 : 0.4, transition: '0.3s' }}>
                  <div className="mono" style={{ width: '30px', height: '30px', borderRadius: '50%', background: creationStep === s ? 'var(--accent-gold)' : 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white', border: '1px solid var(--accent-gold)' }}>{s}</div>
                  <span className="font-cinzel" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>{s === 1 ? 'ESENCIA' : s === 2 ? 'COMPETENCIAS' : 'VITALIDAD'}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

              {creationStep === 1 && (
                <>
                  <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                    <div
                      className="torch-glow"
                      style={{ width: '120px', height: '120px', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, position: 'relative', background: 'var(--bg-base)' }}
                    >
                      {image ? (
                        <img src={image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '3rem' }}>👤</span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>NOMBRE DEL HÉROE</label>
                      <input
                        className="font-cinzel"
                        style={{ ...styles.input, fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}
                        placeholder="Escribe su nombre..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    <div>
                      <label className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>RAZA</label>
                      <select className="font-cinzel" style={{ ...styles.input, marginBottom: '8px' }} value={race} onChange={(e) => { setRace(e.target.value); setSubrace(subraces[e.target.value][0]); }}>
                        {Object.keys(raceDesc).map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{raceDesc[race]}</div>
                    </div>

                    <div>
                      <label className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>SUBRAZA</label>
                      <select className="font-cinzel" style={{ ...styles.input, marginBottom: '8px' }} value={subrace} onChange={(e) => setSubrace(e.target.value)}>
                        {subraces[race].map((sr: string) => <option key={sr} value={sr}>{sr}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>CLASE PRINCIPAL</label>
                      <select
                        className="font-cinzel"
                        style={{ ...styles.input, marginBottom: '8px' }}
                        value={charClass}
                        onChange={(e) => setCharClass(e.target.value)}
                        disabled={editingId !== null}
                      >
                        {Object.keys(classDesc).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', letterSpacing: '1px', marginBottom: '15px', display: 'block' }}>ATRIBUTOS Y CAPACIDADES</label>
                    {!editingId && <div className="mono" style={{ color: remainingPoints === 0 ? 'var(--combat-red)' : 'var(--natural-green)', marginBottom: '15px', fontSize: '0.9rem' }}>PUNTOS RESTANTES: {remainingPoints} / 27</div>}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                      {Object.entries(stats).map(([key, value]) => {
                        const bonus = editingId ? 0 : ((raceBonuses[race] || {})[key] || 0);
                        const total = value + bonus;
                        return (
                          <div key={key} style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', border: '1px solid var(--border-color)', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <label style={{ ...styles.statLabel, margin: 0 }}>{key.toUpperCase()}</label>
                              <div className="mono" style={{ fontSize: '1.2rem', color: 'var(--natural-green)', fontWeight: 'bold' }}>{getModStr(total)}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                              <input className="mono" type="number" style={{ ...styles.input, width: '70px', padding: '8px', textAlign: 'center', fontSize: '1.2rem' }} value={value} onChange={(e) => updateStat(key, +e.target.value)} />
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{statDescriptions[key]}</div>
                            </div>
                            {bonus > 0 && <div style={{ position: 'absolute', top: '-10px', right: '10px', background: 'var(--accent-gold)', color: 'black', fontSize: '0.6rem', padding: '2px 6px', fontWeight: 'bold' }}>+{bonus} {race.toUpperCase()}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>HISTORIA Y TRASFONDO</label>
                    <textarea
                      style={{ ...styles.input, minHeight: '100px', resize: 'vertical' as const }}
                      placeholder="Escribe la leyenda de tu héroe..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
                    <button className="font-cinzel" onClick={() => resetForm()} style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '14px 30px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>CANCELAR</button>
                    <button className="font-cinzel torch-glow" onClick={() => setCreationStep(2)} style={{ background: 'var(--accent-gold)', color: 'white', padding: '14px 40px', border: 'none', cursor: 'pointer' }}>SIGUIENTE: COMPETENCIAS</button>
                  </div>
                </>
              )}

              {creationStep === 2 && (
                <>
                  <section>
                    <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', marginBottom: '10px' }}>⚔️ COMPETENCIAS EN HABILIDADES</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>Selecciona 2 habilidades en las que tu personaje destaque (Historia, Sigilo, Percepción, etc.).</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      {skillList.map(skill => {
                        const isSelected = selectedSkills.includes(skill);
                        return (
                          <div
                            key={skill}
                            onClick={() => {
                              if (isSelected) setSelectedSkills(selectedSkills.filter(s => s !== skill));
                              else if (selectedSkills.length < 2) setSelectedSkills([...selectedSkills, skill]);
                            }}
                            style={{
                              padding: '12px', background: isSelected ? 'rgba(200,135,42,0.2)' : 'var(--bg-base)',
                              border: `1px solid ${isSelected ? 'var(--accent-gold)' : 'var(--border-color)'}`,
                              cursor: selectedSkills.length < 2 || isSelected ? 'pointer' : 'not-allowed',
                              opacity: isSelected || selectedSkills.length < 2 ? 1 : 0.5,
                              transition: '0.2s', fontSize: '0.9rem'
                            }}
                          >
                            <span style={{ marginRight: '10px' }}>{isSelected ? '✅' : '▢'}</span> {skill}
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section>
                    <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', marginBottom: '10px' }}>🎒 EQUIPO DE TRASFONDO</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>Define dos objetos significativos que tu personaje posea según su historia.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <input
                        className="font-cinzel" style={styles.input} placeholder="Objeto 1 (ej: Relicario antiguo)"
                        value={backgroundItems[0]} onChange={(e) => setBackgroundItems([e.target.value, backgroundItems[1]])}
                      />
                      <input
                        className="font-cinzel" style={styles.input} placeholder="Objeto 2 (ej: Mapa de un tesoro)"
                        value={backgroundItems[1]} onChange={(e) => setBackgroundItems([backgroundItems[0], e.target.value])}
                      />
                    </div>
                  </section>

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '20px' }}>
                    <button className="font-cinzel" onClick={() => setCreationStep(1)} style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '14px 30px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>ATRÁS</button>
                    <button className="font-cinzel torch-glow" onClick={() => setCreationStep(3)} style={{ background: 'var(--accent-gold)', color: 'white', padding: '14px 40px', border: 'none', cursor: 'pointer' }}>SIGUIENTE: VITALIDAD</button>
                  </div>
                </>
              )}

              {creationStep === 3 && (
                <>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '30px', border: '1px solid var(--border-color)' }}>
                    <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 20px 0' }}>📋 RESUMEN DE NIVEL 1</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                      <div>
                        <h4 className="font-cinzel" style={{ color: 'var(--combat-red)', fontSize: '0.9rem' }}>✨ RASGOS DE {charClass.toUpperCase()} (NV 1)</h4>
                        <ul style={{ fontSize: '0.9rem', color: 'var(--text-parchment)', lineHeight: '1.8', paddingLeft: '20px' }}>
                          <li>Competencia con {charClass === 'Mago' ? 'Dagas y Bastones' : 'Armas Marciales'}.</li>
                          <li>Competencia con salvaciones de {charClass === 'Guerrero' ? 'FUE y CON' : 'INT y SAB'}.</li>
                          <li>Rasgo de Clase: <em>Por definir...</em></li>
                        </ul>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ background: 'var(--bg-base)', padding: '20px', border: '1px solid var(--border-color)' }}>
                          <h4 className="font-cinzel" style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: 'var(--natural-green)' }}>🛡️ CLASE DE ARMADURA (CA)</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div className="mono" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{10 + calcMod(stats.dex)}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Fórmula: 10 + Destreza ({getModStr(stats.dex)})</div>
                          </div>
                        </div>

                        <div style={{ background: 'var(--bg-base)', padding: '20px', border: '1px solid var(--border-color)' }}>
                          <h4 className="font-cinzel" style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: 'var(--combat-red)' }}>❤️ PUNTOS DE GOLPE (HP)</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div className="mono" style={{ fontSize: '2rem', fontWeight: 'bold' }}>{classHitDice[charClass] + calcMod(stats.con)}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Fórmula: Máximo d{classHitDice[charClass]} ({classHitDice[charClass]}) + Constitución ({getModStr(stats.con)})</div>
                          </div>
                          <p style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', marginTop: '10px', fontStyle: 'italic' }}>* A partir del Nivel 2 podrás lanzar los dados de vida.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginTop: '20px' }}>
                    <button className="font-cinzel" onClick={() => setCreationStep(2)} style={{ background: 'transparent', color: 'var(--text-secondary)', padding: '14px 30px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>ATRÁS</button>
                    <button className="font-cinzel torch-glow" onClick={handleSave} style={{ background: 'var(--natural-green)', color: 'white', padding: '14px 60px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', letterSpacing: '2px' }}>
                      {editingId ? 'CONFIRMAR CAMBIOS' : 'FINALIZAR Y FORJAR LEYENDA'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}


      {/* MODAL DE DETALLES DEL PERSONAJE */}
      {selectedCharacter && (() => {
        const charStats = typeof selectedCharacter.stats === 'string' ? JSON.parse(selectedCharacter.stats) : selectedCharacter.stats;
        const charInv = selectedCharacter.inventory ? (typeof selectedCharacter.inventory === 'string' ? JSON.parse(selectedCharacter.inventory) : selectedCharacter.inventory) : defaultInventory;
        const parsedClasses = parseClasses(selectedCharacter.class);
        const classesDisplay = Object.entries(parsedClasses).map(([cls, lvl]) => `${cls} ${lvl}`).join(' / ');

        const sections: any = {
          armas: { title: 'Armas', tag: 'arma' },
          armaduras: { title: 'Armaduras', tag: 'armadura' },
          consumibles: { title: 'Consumibles', tag: 'consumible' },
          artefactos: { title: 'Artefactos', tag: 'artefacto' }
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

        const handleAddCompendiumItem = (sec: string, compItem: any) => {
          const newInv = { ...charInv, [sec]: [...(charInv[sec] || []), { id: Date.now(), name: compItem.name, compId: compItem.id }] };
          const updated = { ...selectedCharacter, inventory: JSON.stringify(newInv) };
          socket.emit('character:update', updated);
          setSelectedCharacter(updated);
          setItemSearchTerms({ ...itemSearchTerms, [sec]: '' });
        };

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '40px', boxSizing: 'border-box' }} onClick={() => setSelectedCharacter(null)}>
            <div className="clipped-frame" style={{ ...styles.card, width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column', gap: '30px', boxShadow: '0 0 100px rgba(0,0,0,1)' }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setSelectedCharacter(null)} style={{ position: 'absolute', top: '20px', right: '25px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '2.5rem', cursor: 'pointer' }}>✕</button>

              <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap', borderBottom: '2px solid var(--border-color)', paddingBottom: '30px' }}>
                <div style={{ width: '150px', height: '150px', border: '2px solid var(--accent-gold)', background: 'var(--bg-base)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedCharacter.image ? <img src={selectedCharacter.image} alt={selectedCharacter.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ fontSize: '1rem', opacity: 0.3, color: 'var(--accent-gold)' }}>SIN IMAGEN</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <h1 className="font-cinzel" style={{ margin: '0 0 10px 0', color: 'var(--accent-gold)', fontSize: '2.5rem' }}>
                    {selectedCharacter.name}
                    <span className="mono" style={{ fontSize: '1rem', color: 'white', background: 'var(--border-color)', padding: '5px 12px', marginLeft: '20px', verticalAlign: 'middle' }}>NV {selectedCharacter.level || 1}</span>
                  </h1>
                  <p className="font-cinzel" style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>
                    {selectedCharacter.race || 'Humano'} • {classesDisplay.toUpperCase()}
                  </p>

                  {/* SISTEMA DE VIDA (SOLO LECTURA) */}
                  <div style={{ marginTop: '25px', width: '100%', maxWidth: '400px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className="font-cinzel" style={{ color: 'var(--combat-red)', fontWeight: 'bold', fontSize: '0.8rem' }}>PUNTOS DE GOLPE</span>
                      <span className="mono" style={{ fontSize: '0.9rem', color: 'white' }}>
                        {selectedCharacter.current_hp || selectedCharacter.max_hp || 10} / {selectedCharacter.max_hp || 10}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, ((selectedCharacter.current_hp || selectedCharacter.max_hp || 10) / (selectedCharacter.max_hp || 10)) * 100)}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #991b1b, #ef4444)',
                        transition: 'width 0.5s ease-out'
                      }} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '150px' }}>
                  <button className="font-cinzel torch-glow" onClick={() => startEdit(selectedCharacter)} style={{ background: 'var(--accent-gold)', color: 'white', border: 'none', padding: '12px', fontWeight: 'bold', cursor: 'pointer' }}>EDITAR</button>
                  {(userRole === 'dm' || userRole === 'admin') && <button className="font-cinzel" onClick={() => { handleDelete(selectedCharacter.id); setSelectedCharacter(null); }} style={{ background: 'transparent', color: 'var(--combat-red)', border: '1px solid var(--combat-red)', padding: '12px', fontWeight: 'bold', cursor: 'pointer' }}>BORRAR</button>}
                </div>
              </div>

              {/* SUBIDA DE NIVEL */}
              <div style={{ background: 'rgba(200, 135, 42, 0.05)', padding: '25px', border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '30px', justifyContent: 'space-between' }}>
                <div>
                  <h4 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.1rem' }}>ASCENSIÓN DE NIVEL</h4>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Elige la senda de tu nuevo poder para aumentar tu vitalidad.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <select
                    className="font-cinzel"
                    style={{ padding: '10px 15px', background: 'var(--bg-base)', color: 'white', border: '1px solid var(--border-color)', outline: 'none' }}
                    value={levelUpClass}
                    onChange={(e) => setLevelUpClass(e.target.value)}
                  >
                    <option value="">-- ELIGE CLASE --</option>
                    {Object.keys(classDesc).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button className="font-cinzel torch-glow" onClick={handleLevelUp} style={{ background: 'var(--accent-gold)', color: 'white', fontWeight: 'bold', border: 'none', padding: '10px 25px', cursor: 'pointer' }}>
                    SUBIR NIVEL
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  <section>
                    <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>📜 LEYENDA</h4>
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', border: '1px solid var(--border-color)' }}>
                      <p style={{ margin: 0, color: 'var(--text-parchment)', lineHeight: '1.8', fontSize: '1rem', fontStyle: selectedCharacter.description ? 'normal' : 'italic' }}>
                        {selectedCharacter.description || "Esta leyenda aún no ha sido escrita..."}
                      </p>
                    </div>
                  </section>

                  <section>
                    <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>ATRIBUTOS</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                      {['fue', 'dex', 'con', 'int', 'sab', 'car'].map((key) => {
                        const value = charStats[key] || 10;
                        return (
                          <div key={key} style={{ background: 'var(--bg-base)', padding: '15px 10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.65rem', color: 'var(--accent-gold)', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '1px' }}>{key.toUpperCase()}</div>
                            <div className="mono" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{value}</div>
                            <div className="mono" style={{ fontSize: '1rem', color: 'var(--natural-green)', marginTop: '5px' }}>{getModStr(value)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  <section>
                    <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>PERTENENCIAS</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                      {Object.entries(sections).map(([secKey, secMeta]: any) => (
                        <div key={secKey} style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', border: '1px solid var(--border-color)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h4 className="font-cinzel" style={{ margin: 0, color: 'var(--text-parchment)', fontSize: '0.9rem' }}>{secMeta.title.toUpperCase()}</h4>
                          </div>

                          <div style={{ position: 'relative', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <input
                                className="font-cinzel"
                                type="text"
                                placeholder={`Buscar ${secMeta.title.toLowerCase()}...`}
                                value={itemSearchTerms[secKey] || ''}
                                onChange={(e) => setItemSearchTerms({ ...itemSearchTerms, [secKey]: e.target.value })}
                                style={{ flex: 1, padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', fontSize: '0.8rem' }}
                              />
                              <button onClick={() => {
                                const name = itemSearchTerms[secKey];
                                if (name) handleAddInv(secKey);
                              }} style={{ background: 'var(--accent-gold)', color: 'white', border: 'none', padding: '0 15px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                            </div>

                            {/* RESULTADOS DE BÚSQUEDA DEL COMPENDIO */}
                            {itemSearchTerms[secKey] && (
                              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-surface)', border: '1px solid var(--border-color)', zIndex: 10, maxHeight: '150px', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                                {compendium
                                  .filter((item: any) => {
                                    const data = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
                                    const tags = data?.tags || [];
                                    return item.type === 'item' && tags.includes(secMeta.tag) && item.name.toLowerCase().includes(itemSearchTerms[secKey].toLowerCase());
                                  })
                                  .map((item: any) => (
                                    <div
                                      key={item.id}
                                      onClick={() => handleAddCompendiumItem(secKey, item)}
                                      style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--accent-gold)' }}
                                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                      {item.name}
                                    </div>
                                  ))
                                }
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {charInv[secKey]?.map((item: any) => (
                              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-base)', padding: '6px 15px', border: '1px solid var(--border-color)', borderRadius: '20px' }}>
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-parchment)' }}>{item.name}</span>
                                <button onClick={() => handleRemoveInv(secKey, item.id)} style={{ background: 'none', border: 'none', color: 'var(--combat-red)', cursor: 'pointer', padding: 0, fontSize: '1rem' }}>✕</button>
                              </div>
                            ))}
                            {(!charInv[secKey] || charInv[secKey].length === 0) && (
                              <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontStyle: 'italic' }}>Sin objetos.</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
};