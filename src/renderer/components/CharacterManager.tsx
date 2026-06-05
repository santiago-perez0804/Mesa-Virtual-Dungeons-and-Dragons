import { useState, useEffect } from 'react';
import { formatDescription } from '../utils/format';
import pcCoin from '../assets/pc_coin_icon.png';
import plCoin from '../assets/pl_coin_icon.png';
import elCoin from '../assets/el_coin_icon.png';
import poCoin from '../assets/po_coin_icon.png';
import ptCoin from '../assets/pt_coin_icon.png';

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

const getProficiencyBonus = (level: number) => {
  if (level <= 4) return 2;
  if (level <= 8) return 3;
  if (level <= 12) return 4;
  if (level <= 16) return 5;
  return 6;
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

// Helpers de Parseo Seguro de JSON para prevenir double-serialization o spreads corruptos
function safeParseJSON(field: any, defaultVal: any): any {
  if (!field) return defaultVal;
  let parsed = field;
  try {
    while (typeof parsed === 'string') {
      const nextParsed = JSON.parse(parsed);
      if (nextParsed === parsed) break;
      parsed = nextParsed;
    }
  } catch (e) { }

  if (parsed && typeof parsed === 'object') {
    if (parsed["0"] !== undefined && parsed["1"] !== undefined) {
      try {
        let reconstructedStr = "";
        let idx = 0;
        while (parsed[idx] !== undefined) {
          reconstructedStr += parsed[idx];
          idx++;
        }
        let recovered = JSON.parse(reconstructedStr);
        while (typeof recovered === 'string') {
          recovered = JSON.parse(recovered);
        }
        if (recovered && typeof recovered === 'object') {
          parsed = recovered;
        }
      } catch (e) {
        console.error("Error recovering corrupted spread JSON:", e);
      }
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return defaultVal;
  }
  return parsed;
}

function safeParseInventory(inventoryField: any): any {
  const defaultInventory = { armas: [], armaduras: [], consumibles: [], artefactos: [], coins: { pc: 0, pl: 0, el: 0, po: 0, pt: 0 }, slots: {}, habilidades: [], salvaciones: [] };
  const parsed = safeParseJSON(inventoryField, defaultInventory);
  return {
    armas: Array.isArray(parsed.armas) ? parsed.armas : [],
    armaduras: Array.isArray(parsed.armaduras) ? parsed.armaduras : [],
    consumibles: Array.isArray(parsed.consumibles) ? parsed.consumibles : [],
    artefactos: Array.isArray(parsed.artefactos) ? parsed.artefactos : [],
    coins: parsed.coins && typeof parsed.coins === 'object' ? parsed.coins : defaultInventory.coins,
    slots: parsed.slots && typeof parsed.slots === 'object' ? parsed.slots : {},
    habilidades: Array.isArray(parsed.habilidades) ? parsed.habilidades : [],
    salvaciones: Array.isArray(parsed.salvaciones) ? parsed.salvaciones : []
  };
}

function safeParseStats(statsField: any): any {
  const defaultStats = { fue: 10, dex: 10, con: 10, int: 10, sab: 10, car: 10 };
  const parsed = safeParseJSON(statsField, defaultStats);
  return {
    fue: typeof parsed.fue === 'number' ? parsed.fue : 10,
    dex: typeof parsed.dex === 'number' ? parsed.dex : 10,
    con: typeof parsed.con === 'number' ? parsed.con : 10,
    int: typeof parsed.int === 'number' ? parsed.int : 10,
    sab: typeof parsed.sab === 'number' ? parsed.sab : 10,
    car: typeof parsed.car === 'number' ? parsed.car : 10
  };
}

export const CharacterManager = ({ socket, characters, compendium, userRole, triggerDiceRoll, isOverlay, forceOpenId, onCloseOverlay }: any) => {
  // --- ESTADOS DEL FORMULARIO DE CREACIÓN ---
  const [name, setName] = useState('');
  const [charClass, setCharClass] = useState('Guerrero');
  const [race, setRace] = useState('Humano');
  const [subrace, setSubrace] = useState('Estándar');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [fullBodyImage, setFullBodyImage] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [stats, setStats] = useState({
    fue: 8, dex: 8, con: 8,
    int: 8, sab: 8, car: 8
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedSavingThrows, setSelectedSavingThrows] = useState<string[]>([]);
  const [backgroundItems, setBackgroundItems] = useState<string[]>(['', '']);
  const [skillQuery, setSkillQuery] = useState('');
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);
  const [itemQuery0, setItemQuery0] = useState('');
  const [itemDropdownOpen0, setItemDropdownOpen0] = useState(false);
  const [itemQuery1, setItemQuery1] = useState('');
  const [itemDropdownOpen1, setItemDropdownOpen1] = useState(false);


  const defaultInventory = { armas: [], armaduras: [], consumibles: [], artefactos: [], coins: { pc: 0, pl: 0, el: 0, po: 0, pt: 0 }, slots: {} };
  const [inventory, setInventory] = useState<any>(defaultInventory);

  // --- ESTADOS DE VISTA ---
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState(1);
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
  const [levelUpClass, setLevelUpClass] = useState('');

  // --- ESTADOS DE BÚSQUEDA ---
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [slotSearchQuery, setSlotSearchQuery] = useState('');
  const [slotQuantity, setSlotQuantity] = useState(1);

  // --- MEJORAS DE INVENTARIO ---
  const [viewingItemDetail, setViewingItemDetail] = useState<any>(null);
  const [unequippingSlotIndex, setUnequippingSlotIndex] = useState<number | null>(null);
  const [unequipQuantity, setUnequipQuantity] = useState<number>(1);


  const [isLevelingUp, setIsLevelingUp] = useState(false);

  // --- TABS DE LA FICHA DE PERSONAJE ---
  const [charDetailTab, setCharDetailTab] = useState<'hoja' | 'rasgos' | 'conjuros'>('hoja');
  const [classFeatures, setClassFeatures] = useState<any[]>([]);
  const [featuresLoading, setFeaturesLoading] = useState(false);
  const [activeFeaturesClass, setActiveFeaturesClass] = useState<string>('');

  const SPELLCASTING_CLASSES = ['Brujo', 'Bardo', 'Paladín', 'Mago', 'Hechicero', 'Druida', 'Clérigo'];

  const fetchClassFeatures = async (className: string) => {
    setActiveFeaturesClass(className);
    setFeaturesLoading(true);
    setClassFeatures([]);
    try {
      const res = await fetch(`http://localhost:3000/api/class-features/${encodeURIComponent(className)}`);
      const data = await res.json();
      setClassFeatures(Array.isArray(data) ? data : []);
    } catch (e) {
      setClassFeatures([]);
    }
    setFeaturesLoading(false);
  };

  const openCharacterSheet = (c: any) => {
    setSelectedCharacter(c);
    setCharDetailTab('hoja');
    try {
      const parsed = JSON.parse(c.class);
      const primaryClass = Object.keys(parsed)[0] || c.class;
      setActiveFeaturesClass(primaryClass);
      fetchClassFeatures(primaryClass);
    } catch {
      const primaryClass = c.class || 'Guerrero';
      setActiveFeaturesClass(primaryClass);
      fetchClassFeatures(primaryClass);
    }
  };

  // EFECTO PARA OVERLAY
  useEffect(() => {
    if (isOverlay && forceOpenId) {
      const char = characters.find((c: any) => c.id === forceOpenId);
      if (char) {
        openCharacterSheet(char);
      }
    }
  }, [isOverlay, forceOpenId, characters]);



  // --- CÁLCULO POINT BUY ---
  const spentPoints = Object.values(stats).reduce((acc, val) => acc + getPointCost(val), 0);
  const remainingPoints = 27 - spentPoints;

  // --- LÓGICA DE PERSONAJES ---

  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const backendUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
      const uploadUrl = `${backendUrl}/api/upload?folder=avatars`;
      
      try {
        const res = await fetch(uploadUrl, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          setImage(data.url);
        } else {
          alert('Error al subir imagen: ' + data.error);
        }
      } catch (err) {
        console.error(err);
        alert('Error de conexión al subir la imagen');
      }
    }
  };

  const handleSave = () => {
    if (!name) return alert("¡Tu héroe necesita un nombre!");

    let payloadMaxHp = 10;
    let payloadClass = charClass;
    const payloadLevel = 1;

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
      full_body_image: fullBodyImage,
      inventory: JSON.stringify({
        ...inventory,
        trasfondo: backgroundItems.filter(i => i.trim() !== ''),
        habilidades: selectedSkills,
        salvaciones: selectedSavingThrows
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
    setFullBodyImage('');
    setCharClass('Guerrero');
    setRace('Humano');
    setSubrace('Estándar');
    setInventory(defaultInventory);
    setStats({ fue: 8, dex: 8, con: 8, int: 8, sab: 8, car: 8 });
    setSelectedSkills([]);
    setSelectedSavingThrows([]);
    setBackgroundItems(['', '']);
    if (isOverlay && onCloseOverlay) {
      onCloseOverlay();
    }
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
    setFullBodyImage(c.full_body_image || '');
    setStats(safeParseStats(c.stats));
    const parsedInv = safeParseInventory(c.inventory);
    setInventory(parsedInv);
    setSelectedSkills(parsedInv.habilidades || []);
    setSelectedSavingThrows(parsedInv.salvaciones || []);
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
    } catch { }
    return { [clsStr || "Guerrero"]: 1 };
  };

  const handleLevelUp = () => {
    if (!levelUpClass) return alert("Elige una clase para tomar tu nuevo nivel.");

    const hitDie = classHitDice[levelUpClass];
    const roll = Math.floor(Math.random() * hitDie) + 1;
    const charStats = safeParseStats(selectedCharacter.stats);
    const conMod = calcMod(charStats.con);
    const hpGain = Math.max(1, roll + conMod);
    const newLevel = (selectedCharacter.level || 1) + 1;

    const parsedClasses = parseClasses(selectedCharacter.class);
    parsedClasses[levelUpClass] = (parsedClasses[levelUpClass] || 0) + 1;

    const applyUpdate = () => {
      const newMaxHp = (selectedCharacter.max_hp || 10) + hpGain;
      const newCurrentHp = (selectedCharacter.current_hp || 10) + hpGain;

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

      // Enviar un mensaje de chat de sistema de alta calidad heráldico
      const chatMsg = {
        id: Date.now() + Math.random(),
        sender: 'Sistema',
        to: 'all',
        text: `🎲 **${selectedCharacter.name}** subió a nivel **${newLevel}** (${levelUpClass}) y tiró **d${hitDie}** para su vida sacando **${roll}** (Mod CON: ${getModStr(charStats.con)}). ¡Su vida máxima aumentó en **+${hpGain}**!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      };
      socket.emit('chat:send', chatMsg);
    };

    if (triggerDiceRoll) {
      triggerDiceRoll(`d${hitDie}` as any, roll, applyUpdate);
    } else {
      alert(`🗡️ Tomaste un nivel en ${levelUpClass}.\nTiraste un d${hitDie} y sacaste ${roll}.\nModificador de CON: ${getModStr(charStats.con)}.\n¡Tu Vida Máxima aumenta en ${hpGain} puntos!`);
      applyUpdate();
    }
  };

  // --- LÓGICA DE MONSTRUOS (BESTIARIO) ---



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
      <section style={{ display: isOverlay ? 'none' : 'block' }}>
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
                onClick={() => openCharacterSheet(c)}
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
          <div style={{ ...styles.card, width: '100%', maxWidth: '1000px', height: '90vh', maxHeight: '90vh', display: 'flex', flexDirection: 'column', border: '2px solid var(--accent-gold)', padding: 0, overflow: 'hidden' }} className="clipped-frame" onClick={e => e.stopPropagation()}>

            {/* INDICADOR DE PASOS (Stepper top fijo) */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', padding: '25px 40px 20px 40px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
              {[1, 2, 3].map(s => {
                const isActive = creationStep === s;
                const isCompleted = creationStep > s;

                let circleStyle: React.CSSProperties = {
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
                    <div className="mono" style={circleStyle}>
                      {isCompleted ? '✓' : s}
                    </div>
                    <span className="font-cinzel" style={{ fontSize: '0.85rem', letterSpacing: '1px', color: isActive || isCompleted ? 'var(--accent-gold)' : 'var(--text-secondary)', fontWeight: isActive ? 'bold' : 'normal' }}>
                      {s === 1 ? 'ESENCIA' : s === 2 ? 'COMPETENCIAS' : 'VITALIDAD'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* CONTENIDO SCROLLABLE */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '30px 40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>

              {creationStep === 1 && (
                <>
                  {/* Header: nombre del héroe (input full-width) */}
                  <div style={{ display: 'flex', gap: '25px', alignItems: 'flex-end', width: '100%' }}>
                    <div style={{ flex: 1 }}>
                      <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '1.5px', marginBottom: '8px', display: 'block' }}>NOMBRE DEL HÉROE</label>
                      <input
                        className="font-cinzel"
                        style={{
                          ...styles.input,
                          fontSize: '1.6rem',
                          fontWeight: 'bold',
                          color: 'var(--accent-gold)',
                          borderBottom: '2px solid var(--border-color)',
                          borderRadius: 0,
                          background: 'transparent',
                          padding: '10px 0'
                        }}
                        placeholder="Escribe su nombre..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div
                      className="torch-glow"
                      style={{
                        width: '75px',
                        height: '75px',
                        border: '2px solid var(--border-color)',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0,
                        position: 'relative',
                        background: 'var(--bg-base)',
                        cursor: 'pointer'
                      }}
                    >
                      {image ? (
                        <img src={image} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '2rem' }}>👤</span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                      />
                    </div>
                  </div>

                  {/* Fila: 3 selects */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    <div>
                      <label className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>RAZA</label>
                      <select className="font-cinzel" style={styles.input} value={race} onChange={(e) => { setRace(e.target.value); setSubrace(subraces[e.target.value][0]); }}>
                        {Object.keys(raceDesc).map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>SUBRAZA</label>
                      <select className="font-cinzel" style={styles.input} value={subrace} onChange={(e) => setSubrace(e.target.value)}>
                        {subraces[race].map((sr: string) => <option key={sr} value={sr}>{sr}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>CLASE PRINCIPAL</label>
                      <select
                        className="font-cinzel"
                        style={styles.input}
                        value={charClass}
                        onChange={(e) => setCharClass(e.target.value)}
                        disabled={editingId !== null}
                      >
                        {Object.keys(classDesc).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Descripción de raza debajo */}
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-parchment)', opacity: 0.9, fontStyle: 'italic', padding: '12px 18px', background: 'rgba(200, 135, 42, 0.04)', borderLeft: '3px solid var(--accent-gold)', marginTop: '-10px' }}>
                    <strong>{race}:</strong> {raceDesc[race]}
                  </div>

                  {/* Atributos: Grilla 3x2 de tarjetas compactas */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '1.5px' }}>ATRIBUTOS Y CAPACIDADES</label>
                      {!editingId && (
                        <div className="mono font-cinzel" style={{ color: remainingPoints === 0 ? 'var(--natural-green)' : remainingPoints < 0 ? 'var(--combat-red)' : 'var(--accent-gold)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                          Puntos restantes: <span style={{ fontSize: '1.1rem' }}>{remainingPoints}</span> / 27
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                      {Object.entries(stats).map(([key, value]) => {
                        const bonus = editingId ? 0 : ((raceBonuses[race] || {})[key] || 0);
                        const total = value + bonus;
                        const mod = calcMod(total);
                        const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                        const modColor = mod > 0 ? 'var(--natural-green)' : mod < 0 ? 'var(--combat-red)' : 'var(--text-parchment)';
                        const abbrev = key.toUpperCase();
                        const desc = statDescriptions[key];

                        return (
                          <div
                            key={key}
                            style={{
                              background: 'rgba(255,255,255,0.02)',
                              padding: '15px',
                              border: '1px solid var(--border-color)',
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              height: '140px',
                              transition: 'border-color 0.2s',
                            }}
                            className="clipped-frame"
                          >
                            {/* Modificador en esquina superior derecha */}
                            <div
                              className="mono"
                              style={{
                                position: 'absolute',
                                top: '10px',
                                right: '12px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                color: modColor,
                              }}
                            >
                              {modStr}
                            </div>

                            {/* Abreviatura en pequeño */}
                            <div style={styles.statLabel}>{abbrev}</div>

                            {/* Valor central editable con + y - */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', margin: '5px 0' }}>
                              <button
                                onClick={() => updateStat(key, value - 1)}
                                disabled={!editingId && value <= 8}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid var(--border-color)',
                                  color: 'var(--accent-gold)',
                                  width: '28px',
                                  height: '28px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  fontSize: '1rem',
                                  fontWeight: 'bold',
                                  opacity: (!editingId && value <= 8) ? 0.3 : 1
                                }}
                                onMouseEnter={e => !(!editingId && value <= 8) && (e.currentTarget.style.borderColor = 'var(--accent-gold)')}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                              >
                                -
                              </button>

                              <div className="mono" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', minWidth: '40px', textAlign: 'center' }}>
                                {value}
                              </div>

                              <button
                                onClick={() => updateStat(key, value + 1)}
                                disabled={!editingId && (value >= 15 || remainingPoints <= 0)}
                                style={{
                                  background: 'transparent',
                                  border: '1px solid var(--border-color)',
                                  color: 'var(--accent-gold)',
                                  width: '28px',
                                  height: '28px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  fontSize: '1rem',
                                  fontWeight: 'bold',
                                  opacity: (!editingId && (value >= 15 || remainingPoints <= 0)) ? 0.3 : 1
                                }}
                                onMouseEnter={e => !(!editingId && (value >= 15 || remainingPoints <= 0)) && (e.currentTarget.style.borderColor = 'var(--accent-gold)')}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                              >
                                +
                              </button>
                            </div>

                            {/* Descripción corta debajo */}
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.2' }}>
                              {desc}
                            </div>

                            {/* Badge de bonus racial superpuesto */}
                            {bonus > 0 && (
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: '-8px',
                                  right: '10px',
                                  background: 'var(--accent-gold)',
                                  color: 'var(--bg-base)',
                                  fontSize: '0.6rem',
                                  padding: '1px 5px',
                                  fontWeight: 'bold',
                                  border: '1px solid var(--border-color)',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                                  zIndex: 1
                                }}
                              >
                                +{bonus} {race.toUpperCase()}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Textarea Historia al final, altura reducida (3 líneas) */}
                  <div>
                    <label className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>HISTORIA Y TRASFONDO</label>
                    <textarea
                      rows={3}
                      style={{ ...styles.input, resize: 'none', height: 'auto', minHeight: 'unset', fontFamily: 'var(--font-body)', fontSize: '0.95rem' }}
                      placeholder="Escribe la leyenda de tu héroe..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </>
              )}

              {creationStep === 2 && (
                <>
                  {/* Sección A — Competencias en Habilidades */}
                  <section style={{ marginBottom: '10px' }}>
                    <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', marginBottom: '10px', fontSize: '1.1rem' }}>⚔️ COMPETENCIAS EN HABILIDADES</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '15px' }}>Selecciona hasta 2 habilidades en las que tu personaje destaque (Historia, Sigilo, Percepción, etc.).</p>

                    <div style={{ position: 'relative', width: '100%' }}>
                      <input
                        type="text"
                        className="font-cinzel"
                        style={{
                          ...styles.input,
                          background: selectedSkills.length >= 2 ? 'rgba(255,255,255,0.01)' : 'var(--bg-base)',
                          borderColor: selectedSkills.length >= 2 ? 'var(--border-color)' : 'var(--border-color)',
                          color: selectedSkills.length >= 2 ? 'var(--text-secondary)' : 'white',
                          opacity: selectedSkills.length >= 2 ? 0.6 : 1,
                          cursor: selectedSkills.length >= 2 ? 'not-allowed' : 'text'
                        }}
                        placeholder={selectedSkills.length >= 2 ? "2/2 seleccionadas" : "Escribe para buscar habilidades..."}
                        value={skillQuery}
                        onChange={(e) => setSkillQuery(e.target.value)}
                        onFocus={() => selectedSkills.length < 2 && setSkillDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setSkillDropdownOpen(false), 200)}
                        disabled={selectedSkills.length >= 2}
                      />

                      {/* Autocomplete dropdown list */}
                      {skillDropdownOpen && selectedSkills.length < 2 && (
                        <div
                          className="clipped-frame"
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--accent-gold)',
                            zIndex: 100,
                            maxHeight: '200px',
                            overflowY: 'auto',
                            marginTop: '5px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
                          }}
                        >
                          {skillList
                            .filter(skill => !selectedSkills.includes(skill) && skill.toLowerCase().includes(skillQuery.toLowerCase()))
                            .map(skill => (
                              <div
                                key={skill}
                                onClick={() => {
                                  setSelectedSkills([...selectedSkills, skill]);
                                  setSkillQuery('');
                                  setSkillDropdownOpen(false);
                                }}
                                style={{
                                  padding: '10px 15px',
                                  borderBottom: '1px solid rgba(255,255,255,0.02)',
                                  cursor: 'pointer',
                                  fontSize: '0.9rem',
                                  color: 'var(--text-parchment)',
                                  transition: 'background 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(200, 135, 42, 0.15)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                ✦ {skill}
                              </div>
                            ))}
                          {skillList.filter(skill => !selectedSkills.includes(skill) && skill.toLowerCase().includes(skillQuery.toLowerCase())).length === 0 && (
                            <div style={{ padding: '10px 15px', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                              No se encontraron habilidades...
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Chips removibles debajo del input */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                      {selectedSkills.map(skill => (
                        <div
                          key={skill}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(200, 135, 42, 0.1)',
                            padding: '6px 14px',
                            border: '1px solid var(--accent-gold)',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            color: 'var(--accent-gold)',
                            fontWeight: 'bold',
                          }}
                        >
                          <span>{skill}</span>
                          <button
                            onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--combat-red)',
                              cursor: 'pointer',
                              padding: 0,
                              fontSize: '1rem',
                              lineHeight: 1,
                              fontWeight: 'bold',
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Sección A2 — Competencias en Tiradas de Salvación */}
                  <section style={{ marginBottom: '25px' }}>
                    <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', marginBottom: '10px', fontSize: '1.1rem' }}>🛡️ TIRADAS DE SALVACIÓN COMPETENTES</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '15px' }}>Selecciona hasta 2 atributos para tus tiradas de salvación competentes.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                      {[
                        { key: 'fue', label: 'Fuerza (FUE)' },
                        { key: 'dex', label: 'Destreza (DEX)' },
                        { key: 'con', label: 'Constitución (CON)' },
                        { key: 'int', label: 'Inteligencia (INT)' },
                        { key: 'sab', label: 'Sabiduría (SAB)' },
                        { key: 'car', label: 'Carisma (CAR)' }
                      ].map((item) => {
                        const isSelected = selectedSavingThrows.includes(item.key);
                        return (
                          <button
                            key={item.key}
                            type="button"
                            className="font-cinzel"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedSavingThrows(selectedSavingThrows.filter(s => s !== item.key));
                              } else {
                                if (selectedSavingThrows.length < 2) {
                                  setSelectedSavingThrows([...selectedSavingThrows, item.key]);
                                } else {
                                  alert("Solo puedes seleccionar hasta 2 tiradas de salvación competentes.");
                                }
                              }
                            }}
                            style={{
                              padding: '12px',
                              background: isSelected ? 'rgba(200, 135, 42, 0.15)' : 'var(--bg-base)',
                              border: isSelected ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                              color: isSelected ? 'var(--accent-gold)' : 'var(--text-parchment)',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              textAlign: 'center',
                              borderRadius: '4px',
                              transition: 'all 0.2s'
                            }}
                          >
                            {isSelected ? '✦ ' : ''}{item.label}
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {/* Sección B — Equipo de Trasfondo */}
                  <section style={{ marginBottom: '10px' }}>
                    <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', marginBottom: '10px', fontSize: '1.1rem' }}>🎒 EQUIPO DE TRASFONDO</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '15px' }}>Define dos objetos significativos de la base de datos que tu personaje posea según su trasfondo.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      {[0, 1].map(index => {
                        const selectedItemName = backgroundItems[index];
                        const hasSelection = selectedItemName && selectedItemName.trim() !== '';

                        const queryValue = index === 0 ? itemQuery0 : itemQuery1;
                        const setQueryValue = index === 0 ? setItemQuery0 : setItemQuery1;
                        const dropdownOpen = index === 0 ? itemDropdownOpen0 : itemDropdownOpen1;
                        const setDropdownOpen = index === 0 ? setItemDropdownOpen0 : setItemDropdownOpen1;

                        const handleClear = () => {
                          const newItems = [...backgroundItems];
                          newItems[index] = '';
                          setBackgroundItems(newItems);
                          setQueryValue('');
                        };

                        const handleSelect = (name: string) => {
                          const newItems = [...backgroundItems];
                          newItems[index] = name;
                          setBackgroundItems(newItems);
                          setQueryValue('');
                          setDropdownOpen(false);
                        };

                        return (
                          <div key={index} style={{ position: 'relative', width: '100%' }}>
                            {hasSelection ? (
                              /* Chip seleccionado reemplazando el input */
                              <div
                                className="clipped-frame"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '12px 18px',
                                  background: 'rgba(200, 135, 42, 0.1)',
                                  border: '1px solid var(--accent-gold)',
                                  color: 'var(--accent-gold)',
                                  height: '46px',
                                  boxSizing: 'border-box'
                                }}
                              >
                                <span className="font-cinzel" style={{ fontSize: '0.9rem', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  🎒 {selectedItemName}
                                </span>
                                <button
                                  onClick={handleClear}
                                  className="font-cinzel"
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--combat-red)',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold',
                                    letterSpacing: '0.5px',
                                    padding: '2px 8px',
                                    transition: 'opacity 0.2s'
                                  }}
                                  onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                >
                                  LIMPIAR
                                </button>
                              </div>
                            ) : (
                              /* Input buscador */
                              <>
                                <input
                                  type="text"
                                  className="font-cinzel"
                                  style={styles.input}
                                  placeholder={`Buscar Objeto ${index + 1}...`}
                                  value={queryValue}
                                  onChange={(e) => setQueryValue(e.target.value)}
                                  onFocus={() => setDropdownOpen(true)}
                                  onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
                                />

                                {dropdownOpen && (
                                  <div
                                    className="clipped-frame"
                                    style={{
                                      position: 'absolute',
                                      top: '100%',
                                      left: 0,
                                      right: 0,
                                      background: 'var(--bg-surface)',
                                      border: '1px solid var(--accent-gold)',
                                      zIndex: 100,
                                      maxHeight: '200px',
                                      overflowY: 'auto',
                                      marginTop: '5px',
                                      boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
                                    }}
                                  >
                                    {compendium
                                      .filter((item: any) => item.type === 'item' && item.name.toLowerCase().includes(queryValue.toLowerCase()))
                                      .map((item: any) => (
                                        <div
                                          key={item.id}
                                          onClick={() => handleSelect(item.name)}
                                          style={{
                                            padding: '10px 15px',
                                            borderBottom: '1px solid rgba(255,255,255,0.02)',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            color: 'var(--text-parchment)',
                                            transition: 'background 0.2s',
                                          }}
                                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(200, 135, 42, 0.15)'}
                                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                          📦 {item.name}
                                        </div>
                                      ))}
                                    {compendium.filter((item: any) => item.type === 'item' && item.name.toLowerCase().includes(queryValue.toLowerCase())).length === 0 && (
                                      <div style={{ padding: '10px 15px', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                                        No se encontraron objetos en la base de datos...
                                      </div>
                                    )}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </>
              )}

              {creationStep === 3 && (
                <>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '40px', border: '1px solid var(--border-color)' }} className="clipped-frame">
                    <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 30px 0', textAlign: 'center', fontSize: '1.4rem', letterSpacing: '2px' }}>
                      📋 RESUMEN DE NIVEL 1
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>

                      {/* Lado Izquierdo: Rasgos de Clase */}
                      <div style={{ background: 'rgba(255,255,255,0.01)', padding: '25px', border: '1px solid var(--border-color)' }} className="clipped-frame">
                        <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '20px', letterSpacing: '1px' }}>
                          ✨ RASGOS DE {charClass.toUpperCase()} (NV 1)
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', fontSize: '0.95rem', color: 'var(--text-parchment)', lineHeight: '1.5' }}>
                            <span style={{ color: 'var(--accent-gold)', marginRight: '10px', fontSize: '1.1rem' }}>✦</span>
                            <span>Competencia con <strong>{charClass === 'Mago' ? 'Dagas y Bastones' : 'Armas Marciales'}</strong>.</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', fontSize: '0.95rem', color: 'var(--text-parchment)', lineHeight: '1.5' }}>
                            <span style={{ color: 'var(--accent-gold)', marginRight: '10px', fontSize: '1.1rem' }}>✦</span>
                            <span>Competencia con salvaciones de <strong>{charClass === 'Guerrero' ? 'FUE y CON' : 'INT y SAB'}</strong>.</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start', fontSize: '0.95rem', color: 'var(--text-parchment)', lineHeight: '1.5', opacity: 0.75 }}>
                            <span style={{ color: 'var(--accent-gold)', marginRight: '10px', fontSize: '1.1rem' }}>✦</span>
                            <span>Rasgo de Clase: <em>Por definir...</em></span>
                          </div>
                        </div>
                      </div>

                      {/* Lado Derecho: Tarjetas CA y HP más grandes y centradas */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', justifyContent: 'center' }}>

                        {/* Tarjeta CA */}
                        <div
                          className="clipped-frame torch-glow"
                          style={{
                            background: 'var(--bg-base)',
                            padding: '30px 20px',
                            border: '2px solid var(--border-color)',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                          }}
                        >
                          <h4 className="font-cinzel" style={{ margin: '0 0 15px 0', fontSize: '0.95rem', color: 'var(--natural-green)', fontWeight: 'bold', letterSpacing: '1px' }}>
                            🛡️ CLASE DE ARMADURA (CA)
                          </h4>
                          <div className="mono" style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'white', lineHeight: '1', marginBottom: '10px' }}>
                            {10 + calcMod(stats.dex)}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Fórmula: 10 + Destreza ({getModStr(stats.dex)})
                          </div>
                        </div>

                        {/* Tarjeta HP */}
                        <div
                          className="clipped-frame torch-glow"
                          style={{
                            background: 'var(--bg-base)',
                            padding: '30px 20px',
                            border: '2px solid var(--border-color)',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                          }}
                        >
                          <h4 className="font-cinzel" style={{ margin: '0 0 15px 0', fontSize: '0.95rem', color: 'var(--combat-red)', fontWeight: 'bold', letterSpacing: '1px' }}>
                            ❤️ PUNTOS DE GOLPE (HP)
                          </h4>
                          <div className="mono" style={{ fontSize: '3.5rem', fontWeight: 'bold', color: 'white', lineHeight: '1', marginBottom: '10px' }}>
                            {classHitDice[charClass] + calcMod(stats.con)}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                            Fórmula: Máximo d{classHitDice[charClass]} ({classHitDice[charClass]}) + Constitución ({getModStr(stats.con)})
                          </div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', margin: 0, fontStyle: 'italic', opacity: 0.85 }}>
                            * A partir del Nivel 2 lanzarás dados de vida.
                          </p>
                        </div>

                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* BOTONES NAVEGACIÓN ATRÁS/SIGUIENTE (Footer pegado abajo) */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 40px',
                borderTop: '1px solid var(--border-color)',
                background: 'rgba(26, 22, 16, 0.98)',
                boxSizing: 'border-box'
              }}
            >
              {/* Botón Izquierdo (Atrás / Cancelar) */}
              {creationStep === 1 ? (
                <button
                  className="font-cinzel"
                  onClick={() => resetForm()}
                  style={{
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    padding: '12px 25px',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-parchment)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  CANCELAR
                </button>
              ) : (
                <button
                  className="font-cinzel"
                  onClick={() => setCreationStep(creationStep - 1)}
                  style={{
                    background: 'transparent',
                    color: 'var(--accent-gold)',
                    padding: '12px 25px',
                    border: '1px solid var(--accent-gold)',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  ← ATRÁS
                </button>
              )}

              {/* Botón Derecho (Siguiente / Guardar) */}
              {creationStep === 3 ? (
                <button
                  className="font-cinzel torch-glow"
                  onClick={handleSave}
                  style={{
                    background: 'var(--natural-green)',
                    color: 'white',
                    padding: '12px 40px',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    letterSpacing: '1px'
                  }}
                >
                  {editingId ? 'CONFIRMAR CAMBIOS' : 'FINALIZAR Y FORJAR LEYENDA'}
                </button>
              ) : (
                <button
                  className="font-cinzel torch-glow"
                  onClick={() => {
                    if (creationStep === 1 && !name) {
                      alert("¡Tu héroe necesita un nombre!");
                      return;
                    }
                    setCreationStep(creationStep + 1);
                  }}
                  style={{
                    background: 'var(--accent-gold)',
                    color: 'var(--bg-base)',
                    padding: '12px 40px',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.95rem',
                    letterSpacing: '1px'
                  }}
                >
                  SIGUIENTE: {creationStep === 1 ? 'COMPETENCIAS' : 'VITALIDAD'} →
                </button>
              )}
            </div>

          </div>
        </div>
      )}


      {/* MODAL DE DETALLES DEL PERSONAJE */}
      {selectedCharacter && (() => {
        const charStats = safeParseStats(selectedCharacter.stats);
        const charInv = safeParseInventory(selectedCharacter.inventory);
        const parsedClasses = parseClasses(selectedCharacter.class);
        const classesDisplay = Object.entries(parsedClasses).map(([cls, lvl]) => `${cls} ${lvl}`).join(' / ');

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '40px', boxSizing: 'border-box' }} onClick={() => { setSelectedCharacter(null); if(onCloseOverlay) onCloseOverlay(); }}>
            <div className="clipped-frame" style={{ ...styles.card, width: '100%', maxWidth: '1250px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column', gap: '30px', boxShadow: '0 0 100px rgba(0,0,0,1)' }} onClick={e => e.stopPropagation()}>
              <button onClick={() => { setSelectedCharacter(null); if(onCloseOverlay) onCloseOverlay(); }} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '2.5rem', cursor: 'pointer', zIndex: 10 }}>✕</button>

              <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap', borderBottom: '2px solid var(--border-color)', paddingBottom: '30px' }}>
                <div style={{ width: '150px', height: '150px', border: '2px solid var(--accent-gold)', background: 'var(--bg-base)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selectedCharacter.image ? <img src={selectedCharacter.image} alt={selectedCharacter.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ fontSize: '1rem', opacity: 0.3, color: 'var(--accent-gold)' }}>SIN IMAGEN</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <h1 className="font-cinzel" style={{ margin: '0 0 10px 0', color: 'var(--accent-gold)', fontSize: '2.5rem' }}>
                    {selectedCharacter.name}
                    <span className="mono" style={{ fontSize: '1rem', color: 'white', background: 'var(--border-color)', padding: '5px 12px', marginLeft: '20px', verticalAlign: 'middle' }}>NV {selectedCharacter.level || 1}</span>
                    <span className="mono" style={{ fontSize: '1rem', color: 'black', background: 'var(--accent-gold)', padding: '5px 12px', marginLeft: '10px', verticalAlign: 'middle', fontWeight: 'bold' }}>COMPETENCIA: +{getProficiencyBonus(selectedCharacter.level || 1)}</span>

                    <button
                      onClick={() => {
                        setIsLevelingUp(true);
                        const parsed = parseClasses(selectedCharacter.class);
                        const firstClass = Object.keys(parsed)[0] || 'Guerrero';
                        setLevelUpClass(firstClass);
                      }}
                      className="mono font-cinzel torch-glow"
                      style={{
                        marginLeft: '12px',
                        background: 'var(--accent-gold)',
                        color: 'black',
                        border: 'none',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.8rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        verticalAlign: 'middle',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'scale(1.08)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      title="Subir de Nivel"
                    >
                      ▲
                    </button>
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
                </div> {/* Closes Details column <div style={{ flex: 1 }}> */}

                {/* Column for EDITAR/BORRAR buttons underneath the absolute close button */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '150px', alignSelf: 'flex-start', marginTop: '40px' }}>
                  <button className="font-cinzel torch-glow" onClick={() => startEdit(selectedCharacter)} style={{ background: 'var(--accent-gold)', color: 'white', border: 'none', padding: '12px', fontWeight: 'bold', cursor: 'pointer' }}>EDITAR</button>
                  {(userRole === 'dm' || userRole === 'admin') && <button className="font-cinzel" onClick={() => { handleDelete(selectedCharacter.id); setSelectedCharacter(null); if(onCloseOverlay) onCloseOverlay(); }} style={{ background: 'transparent', color: 'var(--combat-red)', border: '1px solid var(--combat-red)', padding: '12px', fontWeight: 'bold', cursor: 'pointer' }}>BORRAR</button>}
                </div>
              </div> {/* Closes Header <div style={{ display: 'flex', gap: '30px', ... }}> */}

                {/* ===== TABS & CONTENT SECTION ===== */}
              {(() => {
                const allClasses = Object.keys(parseClasses(selectedCharacter.class));
                const isSpellcaster = allClasses.some(c => SPELLCASTING_CLASSES.includes(c));
                const activeTabToRender = (charDetailTab === 'conjuros' && !isSpellcaster) ? 'hoja' : charDetailTab;

                const renderRasgos = () => {
                  const charLevel = selectedCharacter.level || 1;
                  const allClassesMap = parseClasses(selectedCharacter.class);
                  const activeClassLevel = allClassesMap[activeFeaturesClass] || charLevel;
                  const featuresByLevel: any = {};
                  classFeatures.forEach((f) => {
                    const lvl = f.level_acquired;
                    if (!featuresByLevel[lvl]) featuresByLevel[lvl] = [];
                    featuresByLevel[lvl].push(f);
                  });
                  const levels = Object.keys(featuresByLevel).map(Number).sort((a, b) => a - b);
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                      {Object.keys(allClassesMap).length > 1 && (
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
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
                          <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>⚔️</div>
                          <div className="font-cinzel" style={{ fontSize: '0.85rem', letterSpacing: '1px', opacity: 0.7 }}>Cargando rasgos...</div>
                        </div>
                      )}
                      {!featuresLoading && classFeatures.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                          <div style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.3 }}>📜</div>
                          <div className="font-cinzel" style={{ fontSize: '0.85rem', letterSpacing: '1px' }}>Sin rasgos registrados para esta clase.</div>
                        </div>
                      )}
                      {!featuresLoading && levels.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                          {levels.map(lvl => {
                            const isUnlocked = lvl <= activeClassLevel;
                            return (
                              <div key={lvl} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', marginBottom: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', opacity: isUnlocked ? 1 : 0.35 }}>
                                  <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: isUnlocked ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)',
                                    border: `2px solid ${isUnlocked ? 'var(--accent-gold)' : 'rgba(255,255,255,0.12)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    boxShadow: isUnlocked ? '0 0 12px rgba(200,135,42,0.5)' : 'none'
                                  }}>
                                    <span className="mono" style={{ fontWeight: 'bold', fontSize: '0.8rem', color: isUnlocked ? 'black' : 'var(--text-secondary)' }}>{lvl}</span>
                                  </div>
                                  <span className="font-cinzel" style={{ fontSize: '0.7rem', color: isUnlocked ? 'var(--accent-gold)' : 'var(--text-secondary)', letterSpacing: '2px' }}>
                                    NIVEL {lvl}{!isUnlocked && ' - bloqueado'}
                                  </span>
                                </div>
                                <div style={{ paddingLeft: '48px', paddingBottom: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                  {featuresByLevel[lvl].map((f: any, fi: number) => (
                                    <div key={fi} style={{
                                      background: isUnlocked ? 'rgba(200,135,42,0.04)' : 'rgba(255,255,255,0.02)',
                                      border: `1px solid ${isUnlocked ? 'rgba(200,135,42,0.2)' : 'rgba(255,255,255,0.05)'}`,
                                      padding: '14px 16px', opacity: isUnlocked ? 1 : 0.4, filter: isUnlocked ? 'none' : 'grayscale(1)'
                                    }}>
                                      <div className="font-cinzel" style={{ color: isUnlocked ? 'var(--accent-gold)' : 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '6px' }}>{f.feature_name}</div>
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
                  );
                };

                const renderConjuros = () => {
                  const charLevel = selectedCharacter.level || 1;
                  const allClassesList = Object.keys(parseClasses(selectedCharacter.class));
                  const spellSlotsTable: Record<number, number[]> = {
                    1: [2, 0, 0, 0, 0, 0, 0, 0, 0], 2: [3, 0, 0, 0, 0, 0, 0, 0, 0], 3: [4, 2, 0, 0, 0, 0, 0, 0, 0], 4: [4, 3, 0, 0, 0, 0, 0, 0, 0],
                    5: [4, 3, 2, 0, 0, 0, 0, 0, 0], 6: [4, 3, 3, 0, 0, 0, 0, 0, 0], 7: [4, 3, 3, 1, 0, 0, 0, 0, 0], 8: [4, 3, 3, 2, 0, 0, 0, 0, 0],
                    9: [4, 3, 3, 3, 1, 0, 0, 0, 0], 10: [4, 3, 3, 3, 2, 0, 0, 0, 0], 11: [4, 3, 3, 3, 2, 1, 0, 0, 0], 12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
                    13: [4, 3, 3, 3, 2, 1, 1, 0, 0], 14: [4, 3, 3, 3, 2, 1, 1, 0, 0], 15: [4, 3, 3, 3, 2, 1, 1, 1, 0], 16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
                    17: [4, 3, 3, 3, 2, 1, 1, 1, 1], 18: [4, 3, 3, 3, 3, 1, 1, 1, 1], 19: [4, 3, 3, 3, 3, 2, 1, 1, 1], 20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
                  };
                  const slots = spellSlotsTable[Math.min(charLevel, 20)] || spellSlotsTable[1];
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                      <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <div className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '6px' }}>CLASE LANZADORA</div>
                        <div style={{ color: 'var(--text-parchment)', fontSize: '1.1rem', fontWeight: 'bold' }}>
                          {allClassesList.filter(c => SPELLCASTING_CLASSES.includes(c)).join(' / ')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', margin: 0 }}>ESPACIOS DE CONJUROS</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                          {slots.map((maxSlots, i) => {
                            const nivel = i + 1;
                            const isAvailable = maxSlots > 0;
                            return (
                              <div key={nivel} style={{
                                background: isAvailable ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${isAvailable ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.06)'}`,
                                padding: '14px 12px', textAlign: 'center', opacity: isAvailable ? 1 : 0.3
                              }}>
                                <div className="font-cinzel" style={{ fontSize: '0.65rem', color: isAvailable ? '#a78bfa' : 'var(--text-secondary)', letterSpacing: '1px', marginBottom: '8px' }}>NIVEL {nivel}</div>
                                <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 'bold', color: isAvailable ? 'white' : 'var(--text-secondary)' }}>{maxSlots}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>disponibles</div>
                                {isAvailable && (
                                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '8px' }}>
                                    {Array.from({ length: maxSlots }).map((_, pi) => (
                                      <div key={pi} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 4px rgba(167,139,250,0.6)' }} />
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', margin: 0 }}>CONJUROS CONOCIDOS</h4>
                        <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px dashed rgba(139,92,246,0.25)', padding: '30px', textAlign: 'center' }}>
                          <div style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.3 }}>✨</div>
                          <div className="font-cinzel" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', letterSpacing: '1px' }}>0 conjuros preparados</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '8px', opacity: 0.6 }}>La gestion de conjuros estara disponible proximamente.</div>
                        </div>
                      </div>
                    </div>
                  );
                };

                return (
                  <>
                    {/* ===== TAB: HOJA ===== */}
                    {activeTabToRender === 'hoja' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                          <section>
                            <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>ATRIBUTOS</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                              {['fue', 'dex', 'con', 'int', 'sab', 'car'].map((key) => {
                                const value = charStats[key] || 10;
                                const mod = calcMod(value);
                                const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                                return (
                                  <div key={key} style={{ background: 'var(--bg-base)', padding: '12px 8px', border: '1px solid var(--border-color)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '110px' }} className="clipped-frame">
                                    <div style={{ fontSize: '0.65rem', color: 'var(--accent-gold)', fontWeight: 'bold', marginBottom: '4px', letterSpacing: '1.2px' }}>{key.toUpperCase()}</div>
                                    <div className="mono" style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'white', lineHeight: '1.1' }}>{modStr}</div>
                                    <div style={{ marginTop: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '2px 8px', borderRadius: '3px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'inline-block' }}>
                                      <span className="mono">{value}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {(() => {
                              const parsedInv = typeof selectedCharacter.inventory === 'string' ? JSON.parse(selectedCharacter.inventory || '{}') : (selectedCharacter.inventory || {});
                              const selectedSkills = parsedInv.habilidades || [];
                              const charLevel = selectedCharacter.level || 1;
                              const pb = getProficiencyBonus(charLevel);
                              
                              const phList = [
                                { label: 'Atletismo', key: 'fue' },
                                { label: 'Acrobacias', key: 'dex' }, { label: 'Juego de Manos', key: 'dex' }, { label: 'Sigilo', key: 'dex' },
                                { label: 'Arcanos', key: 'int' }, { label: 'Historia', key: 'int' }, { label: 'Investigación', key: 'int' }, { label: 'Naturaleza', key: 'int' }, { label: 'Religión', key: 'int' },
                                { label: 'Trato con Animales', key: 'sab' }, { label: 'Perspicacia', key: 'sab' }, { label: 'Medicina', key: 'sab' }, { label: 'Percepción', key: 'sab' }, { label: 'Supervivencia', key: 'sab' },
                                { label: 'Engaño', key: 'car' }, { label: 'Intimidación', key: 'car' }, { label: 'Interpretación', key: 'car' }, { label: 'Persuasión', key: 'car' }
                              ];

                              const tsList = [
                                { label: 'Fuerza', key: 'fue' },
                                { label: 'Destreza', key: 'dex' },
                                { label: 'Constitución', key: 'con' },
                                { label: 'Inteligencia', key: 'int' },
                                { label: 'Sabiduría', key: 'sab' },
                                { label: 'Carisma', key: 'car' }
                              ];

                              return (
                                <>
                                  {/* HABILIDADES */}
                                  <div style={{ marginTop: '20px' }}>
                                    <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '10px' }}>🎲 HABILIDADES</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', background: 'var(--bg-base)' }}>
                                      {phList.map((s, index) => {
                                        const baseMod = calcMod(charStats[s.key] || 10);
                                        const isProficient = selectedSkills.includes(s.label);
                                        const totalMod = baseMod + (isProficient ? pb : 0);
                                        const modStr = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;
                                        const rowStyle: React.CSSProperties = {
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          padding: '6px 12px',
                                          borderBottom: index === phList.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                                          background: isProficient ? 'rgba(200, 135, 42, 0.04)' : 'transparent',
                                        };
                                        const textStyle: React.CSSProperties = isProficient ? {
                                          color: '#ffd700',
                                          textShadow: '0 0 8px rgba(255, 215, 0, 0.6)',
                                          fontWeight: 'bold',
                                          fontSize: '0.82rem'
                                        } : {
                                          color: 'var(--text-parchment)',
                                          fontSize: '0.82rem'
                                        };
                                        return (
                                          <div key={s.label} style={rowStyle}>
                                            <span className="font-cinzel" style={textStyle}>
                                              {isProficient ? '✦ ' : ''}{s.label} ({s.key.toUpperCase()})
                                            </span>
                                            <span className="mono" style={{ ...textStyle, fontSize: '0.9rem' }}>{modStr}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* TIRADAS DE SALVACIÓN */}
                                  <div style={{ marginTop: '20px' }}>
                                    <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '10px' }}>🛡️ TIRADAS DE SALVACIÓN</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', background: 'var(--bg-base)' }}>
                                      {tsList.map((s, index) => {
                                        const baseMod = calcMod(charStats[s.key] || 10);
                                        const isProficient = (parsedInv.salvaciones || []).includes(s.key);
                                        const totalMod = baseMod + (isProficient ? pb : 0);
                                        const modStr = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;
                                        const rowStyle: React.CSSProperties = {
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          padding: '6px 12px',
                                          borderBottom: index === tsList.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                                          background: isProficient ? 'rgba(200, 135, 42, 0.04)' : 'transparent',
                                        };
                                        const textStyle: React.CSSProperties = isProficient ? {
                                          color: '#ffd700',
                                          textShadow: '0 0 8px rgba(255, 215, 0, 0.6)',
                                          fontWeight: 'bold',
                                          fontSize: '0.82rem'
                                        } : {
                                          color: 'var(--text-parchment)',
                                          fontSize: '0.82rem'
                                        };
                                        return (
                                          <div key={s.label} style={rowStyle}>
                                            <span className="font-cinzel" style={textStyle}>
                                              {isProficient ? '✦ ' : ''}{s.label} ({s.key.toUpperCase()})
                                            </span>
                                            <span className="mono" style={{ ...textStyle, fontSize: '0.9rem' }}>{modStr}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </>
                              );
                            })()}
                          </section>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                          {/* FOTO DE CUERPO COMPLETO (2:3) */}
                          <section>
                            <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>📸 FOTO DE CUERPO COMPLETO</h4>
                            <div style={{ 
                              width: '100%', 
                              maxWidth: '350px',
                              aspectRatio: '2/3', 
                              border: '1px dashed var(--accent-gold)', 
                              background: 'var(--bg-base)', 
                              display: 'flex', 
                              flexDirection: 'column', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              position: 'relative', 
                              overflow: 'hidden',
                              cursor: 'pointer'
                            }} className="clipped-frame torch-glow">
                              {selectedCharacter.full_body_image ? (
                                <img src={selectedCharacter.full_body_image} alt="Cuerpo Completo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
                                  <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>👤</div>
                                  <div>Subir Foto (2:3)</div>
                                </div>
                              )}
                              <input 
                                type="file" 
                                accept="image/*" 
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                onChange={async (e: any) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const formData = new FormData();
                                    formData.append('file', file);
                                    const backendUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
                                    const uploadUrl = `${backendUrl}/api/upload?folder=full_body`;
                                    try {
                                      const res = await fetch(uploadUrl, { method: 'POST', body: formData });
                                      const data = await res.json();
                                      if (data.success) {
                                        socket.emit('character:update', { ...selectedCharacter, full_body_image: data.url });
                                        setSelectedCharacter({ ...selectedCharacter, full_body_image: data.url });
                                      } else {
                                        alert('Error al subir la imagen: ' + data.error);
                                      }
                                    } catch (err) {
                                      console.error(err);
                                      alert('Error de conexión al subir la imagen');
                                    }
                                  }
                                }}
                              />
                            </div>
                          </section>

                          {/* LEYENDA (DESCRIPCIÓN) */}
                          <section>
                            <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>📜 LEYENDA</h4>
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', border: '1px solid var(--border-color)' }} className="clipped-frame">
                              <p
                                style={{ margin: 0, color: 'var(--text-parchment)', lineHeight: '1.8', fontSize: '1rem', fontStyle: selectedCharacter.description ? 'normal' : 'italic' }}
                                dangerouslySetInnerHTML={{ __html: formatDescription(selectedCharacter.description || "Esta leyenda aún no ha sido escrita...") }}
                              />
                            </div>
                          </section>

                          {/* INVENTARIO */}
                          <section>
                            {(() => {
                              const fue = charStats.fue || 10;
                              const maxWeight = fue * 6.8;
                              const slots = charInv.slots || {};
                              let currentWeight = 0;
                              Object.values(slots).forEach((item: any) => {
                                currentWeight += (item.weight || 0) * (item.quantity || 1);
                              });
                              const coins = charInv.coins || { pc: 0, pl: 0, el: 0, po: 0, pt: 0 };
                              const totalCoins = coins.pc + coins.pl + coins.el + coins.po + coins.pt;
                              currentWeight += (totalCoins / 100) * 0.9;
                              const overEncumbered = currentWeight >= maxWeight * 0.9;

                              return (
                                <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>INVENTARIO ({currentWeight.toFixed(1)} / {maxWeight.toFixed(1)} kg)</span>
                                  {overEncumbered && (
                                    <span style={{ color: 'white', background: 'var(--combat-red)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                      ⚠️ DESVENTAJA
                                    </span>
                                  )}
                                </h3>
                              );
                            })()}
                            
                            {/* Contenedor Flex para la cuadrícula y el indicador lateral */}
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(5, 1fr)',
                                gap: '15px',
                                background: 'rgba(0,0,0,0.2)',
                                padding: '20px',
                                border: '1px solid var(--border-color)',
                                flex: 1
                              }}>
                                {Array.from({ length: 20 }).map((_, index) => {
                                  if (index >= 15) {
                                    // Espacios de Monedas (15-19)
                                    const coinKeys = ['pc', 'pl', 'el', 'po', 'pt'] as const;
                                    const coinKey = coinKeys[index - 15];
                                    const coinIcons = {
                                      pc: pcCoin,
                                      pl: plCoin,
                                      el: elCoin,
                                      po: poCoin,
                                      pt: ptCoin
                                    };
                                    const coinIcon = coinIcons[coinKey];
                                    const coins = charInv.coins || { pc: 0, pl: 0, el: 0, po: 0, pt: 0 };
                                    const glowColors = {
                                      pc: 'rgba(180, 83, 9, 0.3)',   // Cobre
                                      pl: 'rgba(156, 163, 175, 0.3)', // Plata
                                      el: 'rgba(163, 230, 53, 0.2)',  // Electrum
                                      po: 'rgba(234, 179, 8, 0.3)',   // Oro
                                      pt: 'rgba(56, 189, 248, 0.3)'   // Platino
                                    };

                                    const coinLabels = {
                                      pc: 'COBRE',
                                      pl: 'PLATA',
                                      el: 'ELECTRUM',
                                      po: 'ORO',
                                      pt: 'PLATINO'
                                    };

                                    return (
                                      <div
                                        key={coinKey}
                                        style={{
                                          display: 'flex',
                                          flexDirection: 'column',
                                          alignItems: 'center',
                                          background: 'linear-gradient(135deg, rgba(30, 30, 30, 0.6), rgba(15, 15, 15, 0.8))',
                                          border: '1px solid rgba(200, 135, 42, 0.15)',
                                          borderRadius: '8px',
                                          padding: '10px 5px 8px 5px',
                                          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                          boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                                          position: 'relative',
                                          overflow: 'hidden'
                                        }}
                                        onMouseEnter={e => {
                                          e.currentTarget.style.borderColor = 'var(--accent-gold)';
                                          e.currentTarget.style.transform = 'translateY(-2px)';
                                          e.currentTarget.style.boxShadow = `0 6px 15px rgba(0,0,0,0.6), 0 0 12px ${glowColors[coinKey]}`;
                                        }}
                                        onMouseLeave={e => {
                                          e.currentTarget.style.borderColor = 'rgba(200, 135, 42, 0.15)';
                                          e.currentTarget.style.transform = 'translateY(0)';
                                          e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.4)';
                                        }}
                                      >
                                        {/* Coin Circle Frame */}
                                        <div style={{
                                          width: '52px',
                                          height: '52px',
                                          borderRadius: '50%',
                                          border: '2px solid rgba(200, 135, 42, 0.35)',
                                          background: 'radial-gradient(circle, rgba(45,45,45,0.9) 0%, rgba(20,20,20,0.95) 100%)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.4)',
                                          position: 'relative',
                                          overflow: 'hidden'
                                        }}>
                                          <div style={{
                                            position: 'absolute',
                                            top: '2px', left: '2px', right: '2px', bottom: '2px',
                                            borderRadius: '50%',
                                            border: '1px dashed rgba(200, 135, 42, 0.12)',
                                            pointerEvents: 'none'
                                          }} />
                                          <img
                                            src={coinIcon}
                                            alt={coinKey}
                                            style={{
                                              width: '100%',
                                              height: '100%',
                                              objectFit: 'contain',
                                              transform: 'scale(1.2)',
                                              filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.5))'
                                            }}
                                          />
                                        </div>

                                        {/* Premium Input Container */}
                                        <div
                                          style={{
                                            marginTop: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '2px',
                                            background: 'rgba(0,0,0,0.45)',
                                            border: '1px solid rgba(200, 135, 42, 0.25)',
                                            borderRadius: '4px',
                                            padding: '2px 5px',
                                            width: '90%',
                                            boxSizing: 'border-box',
                                            transition: 'all 0.2s ease',
                                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)'
                                          }}
                                          onFocus={e => {
                                            e.currentTarget.style.borderColor = 'var(--accent-gold)';
                                            e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(200,135,42,0.4)';
                                          }}
                                          onBlur={e => {
                                            e.currentTarget.style.borderColor = 'rgba(200, 135, 42, 0.25)';
                                            e.currentTarget.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.8)';
                                          }}
                                        >
                                          <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={coins[coinKey] ?? 0}
                                            onChange={(e) => {
                                              const digits = e.target.value.replace(/\D/g, '');
                                              const newVal = digits ? parseInt(digits, 10) : 0;
                                              const newInv = {
                                                ...charInv,
                                                coins: {
                                                  ...coins,
                                                  [coinKey]: newVal
                                                }
                                              };
                                              const updated = { ...selectedCharacter, inventory: JSON.stringify(newInv) };
                                              setSelectedCharacter(updated);
                                            }}
                                            onBlur={() => {
                                              if (selectedCharacter) {
                                                socket.emit('character:update', selectedCharacter);
                                              }
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                e.currentTarget.blur();
                                              }
                                            }}
                                            style={{
                                              width: '100%',
                                              background: 'transparent',
                                              border: 'none',
                                              color: 'white',
                                              textAlign: 'center',
                                              fontSize: '0.85rem',
                                              fontFamily: 'monospace',
                                              fontWeight: 'bold',
                                              outline: 'none',
                                              MozAppearance: 'textfield'
                                            }}
                                          />
                                        </div>

                                        {/* Premium Letter-spaced Label */}
                                        <span className="font-cinzel" style={{ fontSize: '0.55rem', color: 'var(--accent-gold)', fontWeight: 'bold', letterSpacing: '1px', marginTop: '4px', opacity: 0.85 }}>
                                          {coinLabels[coinKey]}
                                        </span>
                                      </div>
                                    );
                                  } else {
                                    // Slots de equipo normal (0-14)
                                    const slots = charInv.slots || {};
                                    const currentSlotItem = slots[index];
                                    
                                    return currentSlotItem ? (
                                      <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div
                                          className="clipped-frame torch-glow"
                                          onClick={() => {
                                            setViewingItemDetail(currentSlotItem);
                                          }}
                                          style={{
                                            width: '65px',
                                            height: '65px',
                                            border: currentSlotItem.attuned ? '2px solid var(--accent-gold)' : '1px solid var(--accent-gold)',
                                            background: currentSlotItem.attuned ? 'rgba(200, 135, 42, 0.15)' : 'rgba(200, 135, 42, 0.05)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            transition: 'all 0.2s',
                                            boxShadow: currentSlotItem.attuned ? '0 0 12px var(--accent-gold), inset 0 0 10px rgba(0,0,0,0.8)' : 'inset 0 0 10px rgba(0,0,0,0.8)'
                                          }}
                                          onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; }}
                                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; }}
                                        >
                                          {/* Botón de desequipar (X roja) */}
                                          <div
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (currentSlotItem.quantity === 1) {
                                                const newSlots = { ...slots };
                                                delete newSlots[index];
                                                const newInv = { ...charInv, slots: newSlots };
                                                const updated = { ...selectedCharacter, inventory: JSON.stringify(newInv) };
                                                socket.emit('character:update', updated);
                                                setSelectedCharacter(updated);
                                              } else {
                                                setUnequippingSlotIndex(index);
                                                setUnequipQuantity(1);
                                              }
                                            }}
                                            style={{
                                              position: 'absolute',
                                              top: '2px',
                                              right: '2px',
                                              width: '16px',
                                              height: '16px',
                                              background: 'rgba(239, 68, 68, 0.85)',
                                              borderRadius: '50%',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontSize: '0.55rem',
                                              color: 'white',
                                              fontWeight: 'bold',
                                              cursor: 'pointer',
                                              zIndex: 2,
                                              lineHeight: 1,
                                              boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
                                              transition: 'background 0.15s'
                                            }}
                                            onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(239, 68, 68, 1)'}
                                            onMouseLeave={ev => ev.currentTarget.style.background = 'rgba(239, 68, 68, 0.85)'}
                                            title="Desequipar objeto"
                                          >
                                            ✕
                                          </div>

                                          {currentSlotItem.image ? (
                                            <img
                                              src={currentSlotItem.image}
                                              alt={currentSlotItem.name}
                                              style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                transform: `translate(${(currentSlotItem.imagePosX ?? 0) * 0.5}px, ${(currentSlotItem.imagePosY ?? 0) * 0.5}px) scale(${currentSlotItem.imageZoom ?? 1})`,
                                                transformOrigin: 'center center'
                                              }}
                                            />
                                          ) : (
                                            <span style={{ fontSize: '1.5rem' }}>🎒</span>
                                          )}

                                          {/* Badge de cantidad */}
                                          {currentSlotItem.quantity > 1 && (
                                            <div style={{
                                              position: 'absolute',
                                              bottom: '2px',
                                              left: (currentSlotItem.attuned || currentSlotItem.requiresAttunement) ? '4px' : undefined,
                                              right: (currentSlotItem.attuned || currentSlotItem.requiresAttunement) ? undefined : '4px',
                                              background: 'rgba(0,0,0,0.7)',
                                              color: 'white',
                                              fontSize: '0.55rem',
                                              padding: '1px 3px',
                                              borderRadius: '3px',
                                              fontWeight: 'bold',
                                              lineHeight: 1.2
                                            }}>
                                              x{currentSlotItem.quantity}
                                            </div>
                                          )}

                                          {/* Indicador de sintonización */}
                                          {(currentSlotItem.attuned || currentSlotItem.requiresAttunement) && (
                                            <div style={{
                                              position: 'absolute',
                                              bottom: '2px',
                                              right: '4px',
                                              fontSize: '0.7rem',
                                              opacity: currentSlotItem.attuned ? 1 : 0.35,
                                              filter: currentSlotItem.attuned ? 'drop-shadow(0 0 3px rgba(255,215,0,0.8))' : 'none',
                                              lineHeight: 1
                                            }}>
                                              🔗
                                            </div>
                                          )}
                                        </div>
                                        <div style={{ height: '18px' }} />
                                      </div>
                                    ) : (
                                      <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div
                                          className="clipped-frame"
                                          onClick={() => {
                                            setActiveSlotIndex(index);
                                            setSlotSearchQuery('');
                                            setSlotQuantity(1);
                                          }}
                                          style={{
                                            width: '65px',
                                            height: '65px',
                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                            background: 'rgba(255, 255, 255, 0.01)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                          }}
                                          onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = 'var(--accent-gold)';
                                            e.currentTarget.style.background = 'rgba(200, 135, 42, 0.03)';
                                          }}
                                          onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
                                          }}
                                        >
                                          <span style={{ fontSize: '1.2rem', opacity: 0.35, color: 'var(--accent-gold)', fontWeight: 'bold' }}>+</span>
                                        </div>
                                        <div style={{ height: '18px' }} />
                                      </div>
                                    );
                                  }
                                })}
                              </div>

                              {/* Indicador de sintonización lateral */}
                              {(() => {
                                const slots = charInv.slots || {};
                                const attunedCount = Object.values(slots).filter((s: any) => s && s.attuned).length;
                                return (
                                  <div
                                    style={{
                                      display: 'flex', flexDirection: 'column', gap: '10px',
                                      alignItems: 'center', justifyContent: 'center',
                                      padding: '12px 6px',
                                      background: 'rgba(0,0,0,0.3)',
                                      border: '1px solid var(--border-color)',
                                      borderRadius: '20px',
                                      width: '24px',
                                      boxShadow: 'inset 0 0 8px rgba(0,0,0,0.8)'
                                    }}
                                    title={`${attunedCount}/3 Objetos Sintonizados`}
                                  >
                                    {Array.from({ length: 3 }).map((_, i) => {
                                      const isAttuned = i < attunedCount;
                                      return (
                                        <div key={i} style={{
                                          width: '10px', height: '10px', borderRadius: '50%',
                                          background: isAttuned ? '#ffffff' : 'transparent',
                                          border: '1.5px solid var(--accent-gold)',
                                          boxShadow: isAttuned ? '0 0 6px #ffffff, 0 0 10px var(--accent-gold)' : 'inset 0 0 3px rgba(0,0,0,0.6)',
                                          transition: 'all 0.3s ease'
                                        }} title={`Sintonizacion ${i + 1}/3 ${isAttuned ? '(Activa)' : '(Vacia)'}`} />
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                            </div>
                          </section>
                        </div>
                      </div>
                    )}

                    {/* ===== TAB: RASGOS ===== */}
                    {activeTabToRender === 'rasgos' && renderRasgos()}

                    {/* ===== TAB: CONJUROS ===== */}
                    {isSpellcaster && activeTabToRender === 'conjuros' && renderConjuros()}

                    {/* ===== BARRA DE TABS AL FINAL EN EL CENTRO ===== */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0', borderTop: '2px solid var(--border-color)', marginTop: '40px', paddingTop: '15px' }}>
                      {(['hoja', 'rasgos', 'conjuros'] as const)
                        .filter((tab) => tab !== 'conjuros' || isSpellcaster)
                        .map((tab) => {
                          const labels: Record<string, string> = { hoja: '📋 HOJA', rasgos: '⚔️ RASGOS', conjuros: '✨ CONJUROS' };
                          const isActive = activeTabToRender === tab;
                          return (
                            <button
                              key={tab}
                              className="font-cinzel"
                              onClick={() => setCharDetailTab(tab)}
                              style={{
                                padding: '12px 32px',
                                background: isActive ? 'rgba(200, 135, 42, 0.1)' : 'transparent',
                                border: 'none',
                                borderBottom: isActive ? '3px solid var(--accent-gold)' : '3px solid transparent',
                                borderTop: '1px solid transparent',
                                color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                fontWeight: isActive ? 'bold' : 'normal',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                letterSpacing: '1.5px',
                                transition: 'all 0.2s',
                                position: 'relative',
                                bottom: '-2px'
                              }}
                              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-parchment)'; }}
                              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)'; }}
                            >
                              {labels[tab]}
                            </button>
                          );
                        })}
                    </div>
                  </>
                );
              })()}
{/* SUB-MODAL DE SELECCIÓN DE OBJETO PARA SLOT */}
                                      {activeSlotIndex !== null && (() => {
                                        const slots = charInv.slots || {};
                                        const currentSlotItem = slots[activeSlotIndex];

                                        return (
                                          <div style={{
                                            position: 'fixed',
                                            top: 0,
                                            left: 0,
                                            width: '100vw',
                                            height: '100vh',
                                            background: 'rgba(0, 0, 0, 0.85)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 1100
                                          }} onClick={() => setActiveSlotIndex(null)}>
                                            <div
                                              className="clipped-frame"
                                              onClick={e => e.stopPropagation()}
                                              style={{
                                                background: 'var(--bg-surface)',
                                                border: '2px solid var(--accent-gold)',
                                                padding: '30px',
                                                width: '100%',
                                                maxWidth: '450px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '20px',
                                                boxShadow: '0 10px 50px rgba(0,0,0,0.9)'
                                              }}
                                            >
                                              <h3 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '1px' }}>
                                                {currentSlotItem ? 'MODIFICAR ESPACIO' : 'ASIGNAR OBJETO'} #{(activeSlotIndex + 1)}
                                              </h3>

                                              {/* Buscador */}
                                              <div>
                                                <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', marginBottom: '8px', display: 'block' }}>
                                                  BUSCAR OBJETO EN COMPENDIO
                                                </label>
                                                <input
                                                  className="font-cinzel"
                                                  style={{
                                                    padding: '10px 14px',
                                                    background: 'var(--bg-base)',
                                                    border: '1px solid var(--border-color)',
                                                    color: 'white',
                                                    width: '100%',
                                                    boxSizing: 'border-box',
                                                    outline: 'none'
                                                  }}
                                                  placeholder="Escribe el nombre del objeto..."
                                                  value={slotSearchQuery}
                                                  onChange={e => setSlotSearchQuery(e.target.value)}
                                                />
                                              </div>

                                              {/* Cantidad */}
                                              <div>
                                                <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', marginBottom: '8px', display: 'block' }}>
                                                  CANTIDAD EN ESTE ESPACIO
                                                </label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                  <button
                                                    onClick={() => {
                                                      const newQty = Math.max(1, slotQuantity - 1);
                                                      setSlotQuantity(newQty);
                                                      if (currentSlotItem) {
                                                        const newSlots = {
                                                          ...slots,
                                                          [activeSlotIndex]: {
                                                            ...currentSlotItem,
                                                            quantity: newQty
                                                          }
                                                        };
                                                        const newInv = {
                                                          ...charInv,
                                                          slots: newSlots
                                                        };
                                                        const updated = { ...selectedCharacter, inventory: JSON.stringify(newInv) };
                                                        socket.emit('character:update', updated);
                                                        setSelectedCharacter(updated);
                                                      }
                                                    }}
                                                    style={{
                                                      background: 'transparent',
                                                      border: '1px solid var(--border-color)',
                                                      color: 'var(--accent-gold)',
                                                      width: '32px',
                                                      height: '32px',
                                                      cursor: 'pointer',
                                                      fontWeight: 'bold'
                                                    }}
                                                  >
                                                    -
                                                  </button>
                                                  <span className="mono" style={{ fontSize: '1.2rem', color: 'white', minWidth: '30px', textAlign: 'center' }}>
                                                    {slotQuantity}
                                                  </span>
                                                  <button
                                                    onClick={() => {
                                                      const newQty = slotQuantity + 1;
                                                      setSlotQuantity(newQty);
                                                      if (currentSlotItem) {
                                                        const newSlots = {
                                                          ...slots,
                                                          [activeSlotIndex]: {
                                                            ...currentSlotItem,
                                                            quantity: newQty
                                                          }
                                                        };
                                                        const newInv = {
                                                          ...charInv,
                                                          slots: newSlots
                                                        };
                                                        const updated = { ...selectedCharacter, inventory: JSON.stringify(newInv) };
                                                        socket.emit('character:update', updated);
                                                        setSelectedCharacter(updated);
                                                      }
                                                    }}
                                                    style={{
                                                      background: 'transparent',
                                                      border: '1px solid var(--border-color)',
                                                      color: 'var(--accent-gold)',
                                                      width: '32px',
                                                      height: '32px',
                                                      cursor: 'pointer',
                                                      fontWeight: 'bold'
                                                    }}
                                                  >
                                                    +
                                                  </button>
                                                </div>
                                              </div>

                                              {currentSlotItem && currentSlotItem.requiresAttunement && (
                                                <div style={{ background: 'rgba(200, 135, 42, 0.05)', padding: '15px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }} className="clipped-frame">
                                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span className="font-cinzel" style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 'bold', letterSpacing: '1.2px' }}>🔗 SINTONIZACIÓN</span>
                                                    <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                      {Object.values(slots).filter((s: any) => s && s.attuned).length} / 3 Sintonizados
                                                    </span>
                                                  </div>

                                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        const isAttuning = !currentSlotItem.attuned;
                                                        const attunedList = Object.values(slots).filter((s: any) => s && s.attuned);

                                                        if (isAttuning && attunedList.length >= 3) {
                                                          alert("⚠️ Límite alcanzado: Un personaje solo puede tener un máximo de 3 objetos sintonizados simultáneamente.");
                                                          return;
                                                        }

                                                        const newSlots = {
                                                          ...slots,
                                                          [activeSlotIndex]: {
                                                            ...currentSlotItem,
                                                            attuned: isAttuning
                                                          }
                                                        };
                                                        const newInv = {
                                                          ...charInv,
                                                          slots: newSlots
                                                        };
                                                        const updated = { ...selectedCharacter, inventory: JSON.stringify(newInv) };
                                                        socket.emit('character:update', updated);
                                                        setSelectedCharacter(updated);
                                                      }}
                                                      title={currentSlotItem.attuned ? "Sintonizado: Hacé click para desintonizar" : "Hacé click para sintonizar este objeto"}
                                                      style={{
                                                        width: '50px',
                                                        height: '50px',
                                                        fontSize: '1.6rem',
                                                        background: currentSlotItem.attuned ? 'rgba(200, 135, 42, 0.25)' : 'var(--bg-base)',
                                                        border: `2px solid ${currentSlotItem.attuned ? 'var(--accent-gold)' : 'var(--border-color)'}`,
                                                        boxShadow: currentSlotItem.attuned ? '0 0 15px rgba(200, 135, 42, 0.4)' : 'none',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s ease',
                                                        borderRadius: '8px',
                                                        opacity: currentSlotItem.attuned ? 1 : 0.4
                                                      }}
                                                      onMouseEnter={e => {
                                                        e.currentTarget.style.opacity = '1';
                                                        if (!currentSlotItem.attuned) e.currentTarget.style.borderColor = 'rgba(200, 135, 42, 0.6)';
                                                      }}
                                                      onMouseLeave={e => {
                                                        e.currentTarget.style.opacity = currentSlotItem.attuned ? '1' : '0.4';
                                                        if (!currentSlotItem.attuned) e.currentTarget.style.borderColor = 'var(--border-color)';
                                                      }}
                                                    >
                                                      🔗
                                                    </button>
                                                    <span style={{ fontSize: '0.8rem', color: currentSlotItem.attuned ? 'var(--accent-gold)' : 'var(--text-secondary)', fontWeight: currentSlotItem.attuned ? 'bold' : 'normal' }}>
                                                      {currentSlotItem.attuned ? 'OBJETO SINTONIZADO' : 'SINTONIZAR OBJETO'}
                                                    </span>
                                                  </div>
                                                </div>
                                              )}

                                              {currentSlotItem && currentSlotItem.weight !== undefined && currentSlotItem.weight !== '' && (
                                                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '15px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="clipped-frame">
                                                  <span className="font-cinzel" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '1.2px' }}>⚖️ PESO TOTAL</span>
                                                  <span className="mono" style={{ fontSize: '0.95rem', color: 'white', fontWeight: 'bold' }}>
                                                    {currentSlotItem.weight} kg {currentSlotItem.quantity > 1 ? `(Total: ${(Number(currentSlotItem.weight) * currentSlotItem.quantity).toFixed(2).replace(/\.00$/, '')} kg)` : ''}
                                                  </span>
                                                </div>
                                              )}

                                              {/* Resultados del Compendio */}
                                              <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border-color)', background: 'var(--bg-base)' }}>
                                                {compendium
                                                  .filter((item: any) => item.type === 'item' && item.name.toLowerCase().includes(slotSearchQuery.toLowerCase()))
                                                  .map((item: any) => {
                                                    const itemData = item.data ? (typeof item.data === 'string' ? JSON.parse(item.data) : item.data) : {};
                                                    return (
                                                      <div
                                                        key={item.id}
                                                        onClick={() => {
                                                          const newSlots = {
                                                            ...slots,
                                                            [activeSlotIndex]: {
                                                              compId: item.id,
                                                              name: item.name,
                                                              image: itemData?.image || itemData?.img || '',
                                                              imageZoom: itemData?.imageZoom ?? 1,
                                                              imagePosX: itemData?.imagePosX ?? 0,
                                                              imagePosY: itemData?.imagePosY ?? 0,
                                                              quantity: slotQuantity,
                                                              requiresAttunement: !!itemData?.requiresAttunement,
                                                              weight: itemData?.weight || '',
                                                              attuned: false
                                                            }
                                                          };
                                                          const newInv = {
                                                            ...charInv,
                                                            slots: newSlots
                                                          };
                                                          const updated = { ...selectedCharacter, inventory: JSON.stringify(newInv) };
                                                          socket.emit('character:update', updated);
                                                          setSelectedCharacter(updated);
                                                          setActiveSlotIndex(null);
                                                        }}
                                                        style={{
                                                          padding: '10px 15px',
                                                          borderBottom: '1px solid rgba(255,255,255,0.02)',
                                                          cursor: 'pointer',
                                                          fontSize: '0.85rem',
                                                          color: 'var(--text-parchment)',
                                                          display: 'flex',
                                                          alignItems: 'center',
                                                          gap: '10px',
                                                          transition: 'background 0.2s'
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(200, 135, 42, 0.15)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                      >
                                                        {itemData?.image || itemData?.img ? (
                                                          <img src={itemData.image || itemData.img} alt={item.name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                                                        ) : (
                                                          <span style={{ fontSize: '1.2rem' }}>🎒</span>
                                                        )}
                                                        <span>{item.name}</span>
                                                      </div>
                                                    );
                                                  })}
                                                {compendium.filter((item: any) => item.type === 'item' && item.name.toLowerCase().includes(slotSearchQuery.toLowerCase())).length === 0 && (
                                                  <div style={{ padding: '15px', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.85rem', textAlign: 'center' }}>
                                                    No se encontraron objetos en la base de datos...
                                                  </div>
                                                )}
                                              </div>

                                              {/* Botones de acción */}
                                              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                                {currentSlotItem && (
                                                  <button
                                                    onClick={() => {
                                                      const newSlots = { ...slots };
                                                      delete newSlots[activeSlotIndex];
                                                      const newInv = {
                                                        ...charInv,
                                                        slots: newSlots
                                                      };
                                                      const updated = { ...selectedCharacter, inventory: JSON.stringify(newInv) };
                                                      socket.emit('character:update', updated);
                                                      setSelectedCharacter(updated);
                                                      setActiveSlotIndex(null);
                                                    }}
                                                    className="font-cinzel"
                                                    style={{
                                                      flex: 1,
                                                      background: 'rgba(239, 68, 68, 0.1)',
                                                      border: '1px solid var(--combat-red)',
                                                      color: 'var(--combat-red)',
                                                      padding: '10px',
                                                      cursor: 'pointer',
                                                      fontWeight: 'bold',
                                                      fontSize: '0.85rem'
                                                    }}
                                                  >
                                                    VACÍAR ESPACIO
                                                  </button>
                                                )}
                                                <button
                                                  onClick={() => setActiveSlotIndex(null)}
                                                  className="font-cinzel"
                                                  style={{
                                                    flex: 1,
                                                    background: 'transparent',
                                                    border: '1px solid var(--border-color)',
                                                    color: 'var(--text-secondary)',
                                                    padding: '10px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem'
                                                  }}
                                                >
                                                  CANCELAR
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })()}

                                      {/* MODAL DE DETALLES DE OBJETO */}
                                      {viewingItemDetail !== null && (() => {
                                        const slots = charInv.slots || {};
                                        const compItem = compendium.find((c: any) => c.id == viewingItemDetail.compId);
                                        const compData = compItem?.data ? (typeof compItem.data === 'string' ? JSON.parse(compItem.data) : compItem.data) : {};
                                        const itemDesc = compData?.description || compData?.desc || 'Sin descripción disponible en el compendio.';

                                        return (
                                          <div style={{
                                            position: 'fixed',
                                            top: 0,
                                            left: 0,
                                            width: '100vw',
                                            height: '100vh',
                                            background: 'rgba(0, 0, 0, 0.85)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 1100
                                          }} onClick={() => setViewingItemDetail(null)}>
                                            <div
                                              className="clipped-frame"
                                              onClick={e => e.stopPropagation()}
                                              style={{
                                                background: 'var(--bg-surface)',
                                                border: '2px solid var(--accent-gold)',
                                                padding: '30px',
                                                width: '100%',
                                                maxWidth: '500px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '20px',
                                                boxShadow: '0 10px 50px rgba(0,0,0,0.9)',
                                                color: 'var(--text-parchment)',
                                                position: 'relative'
                                              }}
                                            >
                                              {/* Botón cerrar */}
                                              <button
                                                onClick={() => setViewingItemDetail(null)}
                                                style={{
                                                  position: 'absolute',
                                                  top: '15px',
                                                  right: '20px',
                                                  background: 'none',
                                                  border: 'none',
                                                  color: 'var(--text-secondary)',
                                                  fontSize: '1.8rem',
                                                  cursor: 'pointer',
                                                  transition: 'color 0.2s'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.color = 'var(--combat-red)'}
                                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                                              >
                                                ✕
                                              </button>

                                              <h3 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '1px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                                                DETALLES DEL OBJETO
                                              </h3>

                                              {/* Header con imagen y nombre */}
                                              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                                <div className="clipped-frame" style={{
                                                  width: '80px',
                                                  height: '80px',
                                                  border: '1.5px solid var(--accent-gold)',
                                                  background: 'rgba(200, 135, 42, 0.05)',
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  overflow: 'hidden',
                                                  position: 'relative',
                                                  flexShrink: 0
                                                }}>
                                                  {viewingItemDetail.image ? (
                                                    <img
                                                      src={viewingItemDetail.image}
                                                      alt={viewingItemDetail.name}
                                                      style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        transform: `translate(${(viewingItemDetail.imagePosX ?? 0) * 0.5}px, ${(viewingItemDetail.imagePosY ?? 0) * 0.5}px) scale(${viewingItemDetail.imageZoom ?? 1})`,
                                                        transformOrigin: 'center center'
                                                      }}
                                                    />
                                                  ) : (
                                                    <span style={{ fontSize: '2.5rem' }}>🎒</span>
                                                  )}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                  <h4 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.3rem', letterSpacing: '0.5px' }}>
                                                    {viewingItemDetail.name}
                                                  </h4>
                                                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                    Cantidad: <span style={{ color: 'white', fontWeight: 'bold' }}>{viewingItemDetail.quantity}</span>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Peso */}
                                              {viewingItemDetail.weight !== undefined && viewingItemDetail.weight !== '' && (
                                                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 15px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className="clipped-frame">
                                                  <span className="font-cinzel" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '1px' }}>⚖️ Peso</span>
                                                  <span className="mono" style={{ fontSize: '0.95rem', color: 'white', fontWeight: 'bold' }}>
                                                    {viewingItemDetail.weight} kg {viewingItemDetail.quantity > 1 ? `(Total: ${(Number(viewingItemDetail.weight) * viewingItemDetail.quantity).toFixed(2).replace(/\.00$/, '')} kg)` : ''}
                                                  </span>
                                                </div>
                                              )}

                                              {/* Sintonización */}
                                              {viewingItemDetail.requiresAttunement && (
                                                <div style={{ background: 'rgba(200, 135, 42, 0.05)', padding: '15px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }} className="clipped-frame">
                                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span className="font-cinzel" style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 'bold', letterSpacing: '1px' }}>🔗 Sintonización</span>
                                                    <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                      {Object.values(slots).filter((s: any) => s && s.attuned).length} / 3 Sintonizados
                                                    </span>
                                                  </div>

                                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                                                    <button
                                                      type="button"
                                                      onClick={() => {
                                                        const isAttuning = !viewingItemDetail.attuned;
                                                        const attunedList = Object.values(slots).filter((s: any) => s && s.attuned);

                                                        if (isAttuning && attunedList.length >= 3) {
                                                          alert("⚠️ Límite alcanzado: Un personaje solo puede tener un máximo de 3 objetos sintonizados simultáneamente.");
                                                          return;
                                                        }

                                                        const newSlots = {
                                                          ...slots,
                                                          [viewingItemDetail.slotIndex]: {
                                                            ...viewingItemDetail,
                                                            attuned: isAttuning
                                                          }
                                                        };
                                                        const newInv = {
                                                          ...charInv,
                                                          slots: newSlots
                                                        };
                                                        const updated = { ...selectedCharacter, inventory: JSON.stringify(newInv) };
                                                        socket.emit('character:update', updated);
                                                        setSelectedCharacter(updated);

                                                        setViewingItemDetail({
                                                          ...viewingItemDetail,
                                                          attuned: isAttuning
                                                        });
                                                      }}
                                                      title={viewingItemDetail.attuned ? "Sintonizado: Hacé click para desintonizar" : "Hacé click para sintonizar este objeto"}
                                                      style={{
                                                        width: '45px',
                                                        height: '45px',
                                                        fontSize: '1.4rem',
                                                        background: viewingItemDetail.attuned ? 'rgba(200, 135, 42, 0.25)' : 'var(--bg-base)',
                                                        border: `2px solid ${viewingItemDetail.attuned ? 'var(--accent-gold)' : 'var(--border-color)'}`,
                                                        boxShadow: viewingItemDetail.attuned ? '0 0 15px rgba(200, 135, 42, 0.4)' : 'none',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 0.2s ease',
                                                        borderRadius: '6px',
                                                        opacity: viewingItemDetail.attuned ? 1 : 0.5
                                                      }}
                                                      onMouseEnter={e => {
                                                        e.currentTarget.style.opacity = '1';
                                                        if (!viewingItemDetail.attuned) e.currentTarget.style.borderColor = 'rgba(200, 135, 42, 0.6)';
                                                      }}
                                                      onMouseLeave={e => {
                                                        e.currentTarget.style.opacity = viewingItemDetail.attuned ? '1' : '0.5';
                                                        if (!viewingItemDetail.attuned) e.currentTarget.style.borderColor = 'var(--border-color)';
                                                      }}
                                                    >
                                                      🔗
                                                    </button>
                                                    <span style={{ fontSize: '0.8rem', color: viewingItemDetail.attuned ? 'var(--accent-gold)' : 'var(--text-secondary)', fontWeight: viewingItemDetail.attuned ? 'bold' : 'normal' }}>
                                                      {viewingItemDetail.attuned ? 'OBJETO SINTONIZADO' : 'SINTONIZAR OBJETO'}
                                                    </span>
                                                  </div>
                                                </div>
                                              )}

                                              {/* Descripción */}
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                                <h5 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', margin: 0, letterSpacing: '0.5px' }}>
                                                  DESCRIPCIÓN
                                                </h5>
                                                <div
                                                  style={{
                                                    maxHeight: '150px',
                                                    overflowY: 'auto',
                                                    background: 'rgba(0,0,0,0.15)',
                                                    border: '1px solid var(--border-color)',
                                                    padding: '12px',
                                                    fontSize: '0.9rem',
                                                    lineHeight: '1.5',
                                                    color: 'var(--text-secondary)'
                                                  }}
                                                  className="clipped-frame"
                                                  dangerouslySetInnerHTML={{ __html: formatDescription(itemDesc) }}
                                                />
                                              </div>

                                              {/* Botones de acción */}
                                              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                                <button
                                                  onClick={() => {
                                                    const slotIdx = viewingItemDetail.slotIndex;
                                                    setViewingItemDetail(null);
                                                    setActiveSlotIndex(slotIdx);
                                                    setSlotSearchQuery(viewingItemDetail.name);
                                                    setSlotQuantity(viewingItemDetail.quantity || 1);
                                                  }}
                                                  className="font-cinzel torch-glow"
                                                  style={{
                                                    flex: 1,
                                                    background: 'transparent',
                                                    border: '1px solid var(--accent-gold)',
                                                    color: 'var(--accent-gold)',
                                                    padding: '10px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 'bold'
                                                  }}
                                                >
                                                  MODIFICAR
                                                </button>
                                                <button
                                                  onClick={() => setViewingItemDetail(null)}
                                                  className="font-cinzel"
                                                  style={{
                                                    flex: 1,
                                                    background: 'transparent',
                                                    border: '1px solid var(--border-color)',
                                                    color: 'var(--text-secondary)',
                                                    padding: '10px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem'
                                                  }}
                                                >
                                                  CERRAR
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })()}

                                      {/* MODAL DE DESEQUIPAR CANTIDAD */}
                                      {unequippingSlotIndex !== null && (() => {
                                        const slots = charInv.slots || {};
                                        const unequippingItem = slots[unequippingSlotIndex];
                                        if (!unequippingItem) return null;

                                        return (
                                          <div style={{
                                            position: 'fixed',
                                            top: 0,
                                            left: 0,
                                            width: '100vw',
                                            height: '100vh',
                                            background: 'rgba(0, 0, 0, 0.85)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            zIndex: 1100
                                          }} onClick={() => setUnequippingSlotIndex(null)}>
                                            <div
                                              className="clipped-frame"
                                              onClick={e => e.stopPropagation()}
                                              style={{
                                                background: 'var(--bg-surface)',
                                                border: '2px solid var(--accent-gold)',
                                                padding: '30px',
                                                width: '100%',
                                                maxWidth: '400px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '20px',
                                                boxShadow: '0 10px 50px rgba(0,0,0,0.9)',
                                                color: 'var(--text-parchment)',
                                                position: 'relative'
                                              }}
                                            >
                                              {/* Botón cerrar */}
                                              <button
                                                onClick={() => setUnequippingSlotIndex(null)}
                                                style={{
                                                  position: 'absolute',
                                                  top: '15px',
                                                  right: '20px',
                                                  background: 'none',
                                                  border: 'none',
                                                  color: 'var(--text-secondary)',
                                                  fontSize: '1.8rem',
                                                  cursor: 'pointer'
                                                }}
                                              >
                                                ✕
                                              </button>

                                              <h3 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '1px' }}>
                                                DESEQUIPAR OBJETO
                                              </h3>

                                              <div style={{ textAlign: 'center' }}>
                                                <h4 className="font-cinzel" style={{ margin: 0, color: 'white', fontSize: '1.15rem' }}>
                                                  {unequippingItem.name}
                                                </h4>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '5px', display: 'block' }}>
                                                  Equipados: <strong style={{ color: 'var(--accent-gold)' }}>{unequippingItem.quantity}</strong> unidades
                                                </span>
                                              </div>

                                              {/* Selector numérico */}
                                              <div>
                                                <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', display: 'block', marginBottom: '10px', textAlign: 'center', letterSpacing: '0.5px' }}>
                                                  CANTIDAD A DESEQUIPAR
                                                </label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'center' }}>
                                                  <button
                                                    onClick={() => setUnequipQuantity(Math.max(1, unequipQuantity - 1))}
                                                    style={{
                                                      background: 'transparent',
                                                      border: '1px solid var(--border-color)',
                                                      color: 'var(--accent-gold)',
                                                      width: '36px',
                                                      height: '36px',
                                                      cursor: 'pointer',
                                                      fontWeight: 'bold',
                                                      fontSize: '1.2rem'
                                                    }}
                                                  >
                                                    -
                                                  </button>
                                                  <input
                                                    type="number"
                                                    min={1}
                                                    max={unequippingItem.quantity}
                                                    value={unequipQuantity}
                                                    onChange={e => {
                                                      const val = Math.max(1, Math.min(unequippingItem.quantity, parseInt(e.target.value) || 1));
                                                      setUnequipQuantity(val);
                                                    }}
                                                    style={{
                                                      width: '70px',
                                                      background: 'rgba(0,0,0,0.3)',
                                                      border: '1px solid var(--border-color)',
                                                      borderRadius: '4px',
                                                      color: 'white',
                                                      textAlign: 'center',
                                                      fontSize: '1.3rem',
                                                      padding: '5px 0',
                                                      outline: 'none',
                                                      fontWeight: 'bold',
                                                      fontFamily: 'monospace'
                                                    }}
                                                  />
                                                  <button
                                                    onClick={() => setUnequipQuantity(Math.min(unequippingItem.quantity, unequipQuantity + 1))}
                                                    style={{
                                                      background: 'transparent',
                                                      border: '1px solid var(--border-color)',
                                                      color: 'var(--accent-gold)',
                                                      width: '36px',
                                                      height: '36px',
                                                      cursor: 'pointer',
                                                      fontWeight: 'bold',
                                                      fontSize: '1.2rem'
                                                    }}
                                                  >
                                                    +
                                                  </button>
                                                </div>
                                              </div>

                                              {/* Botones de acción */}
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                                                <button
                                                  onClick={() => {
                                                    const newSlots = { ...slots };
                                                    if (unequipQuantity >= unequippingItem.quantity) {
                                                      delete newSlots[unequippingSlotIndex];
                                                    } else {
                                                      newSlots[unequippingSlotIndex] = {
                                                        ...unequippingItem,
                                                        quantity: unequippingItem.quantity - unequipQuantity
                                                      };
                                                    }
                                                    const newInv = {
                                                      ...charInv,
                                                      slots: newSlots
                                                    };
                                                    const updated = { ...selectedCharacter, inventory: JSON.stringify(newInv) };
                                                    socket.emit('character:update', updated);
                                                    setSelectedCharacter(updated);
                                                    setUnequippingSlotIndex(null);
                                                  }}
                                                  className="font-cinzel torch-glow"
                                                  style={{
                                                    background: 'var(--accent-gold)',
                                                    color: 'black',
                                                    border: 'none',
                                                    padding: '12px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.85rem'
                                                  }}
                                                >
                                                  DESEQUIPAR ({unequipQuantity})
                                                </button>

                                                <button
                                                  onClick={() => {
                                                    const newSlots = { ...slots };
                                                    delete newSlots[unequippingSlotIndex];
                                                    const newInv = {
                                                      ...charInv,
                                                      slots: newSlots
                                                    };
                                                    const updated = { ...selectedCharacter, inventory: JSON.stringify(newInv) };
                                                    socket.emit('character:update', updated);
                                                    setSelectedCharacter(updated);
                                                    setUnequippingSlotIndex(null);
                                                  }}
                                                  className="font-cinzel"
                                                  style={{
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    border: '1px solid var(--combat-red)',
                                                    color: 'var(--combat-red)',
                                                    padding: '10px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.85rem'
                                                  }}
                                                >
                                                  DESEQUIPAR TODO
                                                </button>

                                                <button
                                                  onClick={() => setUnequippingSlotIndex(null)}
                                                  className="font-cinzel"
                                                  style={{
                                                    flex: 1,
                                                    background: 'transparent',
                                                    border: '1px solid var(--border-color)',
                                                    color: 'var(--text-secondary)',
                                                    padding: '10px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem'
                                                  }}
                                                >
                                                  CANCELAR
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })()}

                                      {/* MODAL DE SUBIDA DE NIVEL */}
                                      {isLevelingUp && (
                                        <div style={{
                                          position: 'fixed',
                                          top: 0,
                                          left: 0,
                                          width: '100vw',
                                          height: '100vh',
                                          background: 'rgba(0, 0, 0, 0.85)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          zIndex: 1100
                                        }} onClick={() => setIsLevelingUp(false)}>
                                          <div
                                            className="clipped-frame"
                                            onClick={e => e.stopPropagation()}
                                            style={{
                                              background: 'var(--bg-surface)',
                                              border: '2px solid var(--accent-gold)',
                                              padding: '30px',
                                              width: '100%',
                                              maxWidth: '400px',
                                              display: 'flex',
                                              flexDirection: 'column',
                                              gap: '20px',
                                              boxShadow: '0 10px 50px rgba(0,0,0,0.9)',
                                              color: 'var(--text-parchment)',
                                              position: 'relative'
                                            }}
                                          >
                                            {/* Botón cerrar */}
                                            <button
                                              onClick={() => setIsLevelingUp(false)}
                                              style={{
                                                position: 'absolute',
                                                top: '15px',
                                                right: '20px',
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--text-secondary)',
                                                fontSize: '1.8rem',
                                                cursor: 'pointer',
                                                transition: 'color 0.2s'
                                              }}
                                              onMouseEnter={e => e.currentTarget.style.color = 'var(--combat-red)'}
                                              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                                            >
                                              ✕
                                            </button>

                                            <h3 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '1px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                                              ASCENSIÓN DE NIVEL
                                            </h3>

                                            <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                                              ¡Has adquirido suficiente experiencia! Selecciona la clase en la que deseas obtener tu nuevo nivel de poder.
                                            </div>

                                            <div>
                                              <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', display: 'block', marginBottom: '8px' }}>
                                                CLASE DE ASCENSIÓN
                                              </label>
                                              <select
                                                className="font-cinzel"
                                                style={{
                                                  width: '100%',
                                                  padding: '10px 14px',
                                                  background: 'var(--bg-base)',
                                                  color: 'white',
                                                  border: '1px solid var(--border-color)',
                                                  outline: 'none',
                                                  fontSize: '0.95rem'
                                                }}
                                                value={levelUpClass}
                                                onChange={(e) => setLevelUpClass(e.target.value)}
                                              >
                                                <option value="">-- ELIGE CLASE --</option>
                                                {Object.keys(classDesc).map(c => <option key={c} value={c}>{c}</option>)}
                                              </select>
                                            </div>

                                            {/* Botones de acción */}
                                            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                              <button
                                                onClick={() => {
                                                  if (!levelUpClass) {
                                                    alert("Elige una clase para tomar tu nuevo nivel.");
                                                    return;
                                                  }
                                                  handleLevelUp();
                                                  setIsLevelingUp(false);
                                                }}
                                                className="font-cinzel torch-glow"
                                                style={{
                                                  flex: 1,
                                                  background: 'var(--accent-gold)',
                                                  color: 'black',
                                                  border: 'none',
                                                  padding: '12px',
                                                  cursor: 'pointer',
                                                  fontWeight: 'bold',
                                                  fontSize: '0.85rem'
                                                }}
                                              >
                                                SUBIR NIVEL
                                              </button>
                                              <button
                                                onClick={() => setIsLevelingUp(false)}
                                                className="font-cinzel"
                                                style={{
                                                  flex: 1,
                                                  background: 'transparent',
                                                  border: '1px solid var(--border-color)',
                                                  color: 'var(--text-secondary)',
                                                  padding: '12px',
                                                  cursor: 'pointer',
                                                  fontSize: '0.85rem'
                                                }}
                                              >
                                                CANCELAR
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      )}
            </div>
                          </div>
                          );
      })()}
                        </div>
                      );
};