import { useState, useEffect } from 'react';
import { User, Shield, Backpack, X, Link, Scale } from 'lucide-react';
import { HeroCard } from './ui/HeroCard';
import { formatDescription } from '../utils/format';
import pcCoin from '../assets/pc_coin_icon.png';
import plCoin from '../assets/pl_coin_icon.png';
import elCoin from '../assets/el_coin_icon.png';
import poCoin from '../assets/po_coin_icon.png';
import ptCoin from '../assets/pt_coin_icon.png';

import { classDesc, classHitDice, raceDesc, raceBonuses, skillList, statDescriptions, subraces } from '../modules/character/character.constants';
import { getPointCost, calcMod, getModStr, getProficiencyBonus, safeParseJSON, safeParseInventory, safeParseStats } from '../modules/character/character.utils';

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
  const [charDetailTab, setCharDetailTab] = useState<'hoja' | 'inventario' | 'conjuros' | 'trasfondo'>('hoja');
  const [classFeatures, setClassFeatures] = useState<any[]>([]);
  const [featuresLoading, setFeaturesLoading] = useState(false);
  const [activeFeaturesClass, setActiveFeaturesClass] = useState<string>('');

  const SPELLCASTING_CLASSES = ['Brujo', 'Bardo', 'Paladín', 'Mago', 'Hechicero', 'Druida', 'Clérigo'];

  const fetchClassFeatures = async (className: string) => {
    setActiveFeaturesClass(className);
    setFeaturesLoading(true);
    setClassFeatures([]);
    try {
      const host = window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin;
      const res = await fetch(`${host}/api/class-features/${encodeURIComponent(className)}`);
      const data = await res.json();
      setClassFeatures(Array.isArray(data) ? data : []);
    } catch (e) {
      setClassFeatures([]);
    }
    setFeaturesLoading(false);
  };

  useEffect(() => {
    if (isCreating && charClass) {
      fetchClassFeatures(charClass);
    }
  }, [isCreating, charClass]);

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
      alert(`🗡️ Tomaste un nivel en ${levelUpClass}.
Tiraste un d${hitDie} y sacaste ${roll}.
Modificador de CON: ${getModStr(charStats.con)}.
¡Tu Vida Máxima aumenta en ${hpGain} puntos!`);
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
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {/* Botón de Crear Nuevo Héroe (Dashed Card) */}
          <div
            onClick={() => { resetForm(); setIsCreating(true); }}
            style={{
              border: '2px dashed var(--accent-gold)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              minHeight: '220px',
              transition: 'all 0.2s ease',
              background: 'rgba(200, 135, 42, 0.05)',
              color: 'var(--accent-gold)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(200, 135, 42, 0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(200, 135, 42, 0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: '3rem', marginBottom: '10px' }}>+</span>
            <span className="font-cinzel" style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px' }}>NUEVO HÉROE</span>
          </div>

          {filteredCharacters.map((c: any) => {
            const parsedCls = parseClasses(c.class);
            const className = Object.keys(parsedCls)[0] || 'Clase';
            return (
              <HeroCard
                key={c.id}
                character={{ ...c, class: className }}
                onClick={() => openCharacterSheet(c)}
              />
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
                        <span style={{ color: 'var(--text-secondary)', fontSize: '2rem' }}><User className="w-full h-full p-2" /></span>
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
                    <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', marginBottom: '10px', fontSize: '1.1rem' }}><Shield className="w-4 h-4 inline-block mr-1" /> TIRADAS DE SALVACIÓN COMPETENTES</h3>
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
                    <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', marginBottom: '10px', fontSize: '1.1rem' }}><Backpack className="w-6 h-6 m-auto" /> EQUIPO DE TRASFONDO</h3>
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
                                  <Backpack className="w-6 h-6 m-auto" /> {selectedItemName}
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
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {featuresLoading ? (
                              <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.85rem' }}>Cargando rasgos...</div>
                            ) : classFeatures.filter(f => f.level_acquired === 1).length > 0 ? (
                              classFeatures.filter(f => f.level_acquired === 1).map((f, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', fontSize: '0.95rem', color: 'var(--text-parchment)', lineHeight: '1.5' }}>
                                  <span style={{ color: 'var(--accent-gold)', marginRight: '10px', fontSize: '1.1rem' }}>◈</span>
                                  <span><strong>{f.feature_name}:</strong> {f.description}</span>
                                </div>
                              ))
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'flex-start', fontSize: '0.95rem', color: 'var(--text-parchment)', lineHeight: '1.5' }}>
                                <span style={{ color: 'var(--accent-gold)', marginRight: '10px', fontSize: '1.1rem' }}>✦</span>
                                <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Sin rasgos registrados para Nivel 1.</span>
                              </div>
                            )}
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
                            <Shield className="w-4 h-4 inline-block mr-1" /> CLASE DE ARMADURA (CA)
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
          <>
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '40px', boxSizing: 'border-box' }} onClick={() => { setSelectedCharacter(null); if(onCloseOverlay) onCloseOverlay(); }}>
            <div className="clipped-frame" style={{ ...styles.card, width: '100%', maxWidth: '1250px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', display: 'flex', flexDirection: 'column', gap: '30px', boxShadow: '0 0 100px rgba(0,0,0,1)', padding: '40px' }} onClick={e => e.stopPropagation()}>
              <button onClick={() => { setSelectedCharacter(null); if(onCloseOverlay) onCloseOverlay(); }} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '2.5rem', cursor: 'pointer', zIndex: 10 }}><X className="w-4 h-4 m-auto" /></button>

              {/* [A] CABECERA */}
              <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-gold-subtle)' }}>
                  {selectedCharacter.image ? (
                    <img src={selectedCharacter.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}><User className="w-full h-full p-2" /></div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h1 className="font-cinzel" style={{ margin: 0, color: 'var(--gold-primary)', fontSize: '1.25rem' }}>{selectedCharacter.name}</h1>
                  <div className="font-cinzel" style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    {selectedCharacter.race || 'Humano'} • {classesDisplay} • Bono de Competencia +{getProficiencyBonus(selectedCharacter.level || 1)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div className="mono font-cinzel" style={{ fontSize: '2rem', color: 'var(--text-parchment)', fontWeight: 'bold' }}>Nv. {selectedCharacter.level || 1}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <button onClick={() => { setIsLevelingUp(true); setLevelUpClass(Object.keys(parsedClasses)[0] || 'Guerrero'); }} style={{ background: '#27ae60', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer', fontWeight: 'bold' }}>▲ SUBIR NIVEL</button>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => startEdit(selectedCharacter)} style={{ flex: 1, background: 'var(--gold-primary)', color: 'var(--bg-void)', border: 'none', padding: '4px', borderRadius: '2px', fontSize: '9px', cursor: 'pointer', fontWeight: 'bold' }}>EDITAR</button>
                      {(userRole === 'dm' || userRole === 'admin') && <button onClick={() => { handleDelete(selectedCharacter.id); setSelectedCharacter(null); if(onCloseOverlay) onCloseOverlay(); }} style={{ flex: 1, background: 'rgba(192,57,43,0.2)', color: 'var(--combat-red)', border: '1px solid rgba(192,57,43,0.4)', padding: '4px', borderRadius: '2px', fontSize: '9px', cursor: 'pointer', fontWeight: 'bold' }}>BORRAR</button>}
                    </div>
                  </div>
                </div>
              </div>

              {/* [B] BARRA HP */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div className="font-cinzel" style={{ color: '#27ae60', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' }}>PUNTOS DE GOLPE</div>
                  <div className="mono" style={{ fontSize: '1rem', color: 'white' }}>{selectedCharacter.current_hp || selectedCharacter.max_hp || 10} / <span style={{ color: 'var(--text-secondary)' }}>{selectedCharacter.max_hp || 10}</span></div>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'var(--bg-void)', borderRadius: '3px', overflow: 'hidden' }}>
                  {(() => {
                    const hpPercent = Math.min(100, Math.max(0, ((selectedCharacter.current_hp || selectedCharacter.max_hp || 10) / (selectedCharacter.max_hp || 10)) * 100));
                    const hpColor = hpPercent > 60 ? '#27ae60' : (hpPercent > 30 ? '#e67e22' : '#e74c3c');
                    return <div style={{ width: `${hpPercent}%`, height: '100%', background: hpColor, transition: 'width 0.3s ease, background 0.3s ease' }} />
                  })()}
                </div>
              </div>

              {/* [C] DASHBOARD DE COMBATE */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '15px', textAlign: 'center' }}>
                  <div className="font-cinzel" style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Clase de Armadura</div>
                  <div className="mono" style={{ fontSize: '1.8rem', color: 'var(--gold-primary)', fontWeight: 'bold' }}>{selectedCharacter.ac || (10 + calcMod(charStats.dex || 10))}</div>
                </div>
                {(() => {
                  const initMod = calcMod(charStats.dex || 10);
                  const initColor = initMod >= 0 ? '#27ae60' : '#e74c3c';
                  const initStr = initMod >= 0 ? `+${initMod}` : `${initMod}`;
                  return (
                    <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '15px', textAlign: 'center' }}>
                      <div className="font-cinzel" style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Iniciativa</div>
                      <div className="mono" style={{ fontSize: '1.8rem', color: initColor, fontWeight: 'bold' }}>{initStr}</div>
                    </div>
                  );
                })()}
                <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '15px', textAlign: 'center' }}>
                  <div className="font-cinzel" style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Velocidad</div>
                  <div className="mono" style={{ fontSize: '1.8rem', color: 'var(--text-parchment)', fontWeight: 'bold' }}>{selectedCharacter.speed || '6c'}</div>
                </div>
                <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '15px', textAlign: 'center' }}>
                  <div className="font-cinzel" style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Competencia</div>
                  <div className="mono" style={{ fontSize: '1.8rem', color: 'var(--text-parchment)', fontWeight: 'bold' }}>+{getProficiencyBonus(selectedCharacter.level || 1)}</div>
                </div>
              </div>

              {/* [D] CUERPO */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '30px' }}>
                {/* Columna Izquierda (Stats Panel) */}
                <CharacterStatsPanel character={selectedCharacter} charStats={charStats} selectedSavingThrows={selectedSavingThrows} selectedSkills={selectedSkills} />
                {/* Columna Derecha (Narrativa e Inventario / Tabs) */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  {(() => {
                    const activeTab = charDetailTab === 'hoja' || charDetailTab === 'inventario' ? 'hoja' : (charDetailTab === 'rasgos' || charDetailTab === 'trasfondo' ? 'rasgos' : 'conjuros');
                    const isSpellcaster = Object.keys(parsedClasses).some(c => SPELLCASTING_CLASSES.includes(c));
                    const activeTabToRender = activeTab === 'conjuros' && !isSpellcaster ? 'hoja' : activeTab;

                    ;

                    ;

                    if (activeTabToRender === 'hoja') {
                      return <CharacterInventoryTab character={selectedCharacter} setActiveSlotIndex={setActiveSlotIndex} />;
                     else if (activeTabToRender === 'rasgos') {
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                          <section>
                            <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>📜 LEYENDA (TRASFONDO)</h4>
                            <div style={{ background: 'var(--bg-surface)', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                              <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.9rem', fontStyle: selectedCharacter.description ? 'normal' : 'italic' }} dangerouslySetInnerHTML={{ __html: formatDescription(selectedCharacter.description || "Esta leyenda aún no ha sido escrita...") }} />
                            </div>
                          </section>
                          <section>
                            <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>⚔️ RASGOS DE CLASE</h4>
                            {renderRasgos()}
                          </section>
                        </div>
                      );
                    } else if (activeTabToRender === 'conjuros') {
                      return <CharacterSpellsTab character={selectedCharacter} />;
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* [E] TABS INFERIORES */}
              <div style={{ display: 'flex', gap: '20px', borderTop: '1px solid var(--border-color)', marginTop: '20px', paddingTop: '15px', overflowX: 'auto', justifyContent: 'center' }}>
                {[
                  { id: 'hoja', label: 'HOJA' },
                  { id: 'rasgos', label: 'RASGOS' },
                  { id: 'conjuros', label: 'CONJUROS' }
                ].map(tab => {
                  const isActive = charDetailTab === tab.id || (charDetailTab === 'inventario' && tab.id === 'hoja') || (charDetailTab === 'trasfondo' && tab.id === 'rasgos');
                  return (
                    <button
                      key={tab.id}
                      className="font-cinzel"
                      onClick={() => setCharDetailTab(tab.id as any)}
                      style={{
                        background: isActive ? 'var(--gold-primary)' : 'transparent',
                        border: '1px solid',
                        borderColor: isActive ? 'var(--gold-primary)' : 'var(--border-color)',
                        borderRadius: '4px',
                        color: isActive ? 'black' : 'var(--text-secondary)',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        padding: '8px 24px',
                        cursor: 'pointer',
                        letterSpacing: '1px',
                        transition: 'all 0.2s',
                        boxShadow: isActive ? '0 0 10px rgba(200,135,42,0.3)' : 'none'
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

            </div>
          </div>

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
                                                    <span className="font-cinzel" style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 'bold', letterSpacing: '1.2px' }}><Link className="w-4 h-4 inline-block mr-2" /> SINTONIZACIÓN</span>
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
                                                  <span className="font-cinzel" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '1.2px' }}><Scale className="w-4 h-4 inline-block mr-2" /> PESO TOTAL</span>
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
                                                          <span style={{ fontSize: '1.2rem' }}><Backpack className="w-8 h-8 m-auto" /></span>
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
                                                    <span style={{ fontSize: '2.5rem' }}><Backpack className="w-8 h-8 m-auto" /></span>
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
                                                  <span className="font-cinzel" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '1px' }}><Scale className="w-4 h-4 inline-block mr-2" /> Peso</span>
                                                  <span className="mono" style={{ fontSize: '0.95rem', color: 'white', fontWeight: 'bold' }}>
                                                    {viewingItemDetail.weight} kg {viewingItemDetail.quantity > 1 ? `(Total: ${(Number(viewingItemDetail.weight) * viewingItemDetail.quantity).toFixed(2).replace(/\.00$/, '')} kg)` : ''}
                                                  </span>
                                                </div>
                                              )}

                                              {/* Sintonización */}
                                              {viewingItemDetail.requiresAttunement && (
                                                <div style={{ background: 'rgba(200, 135, 42, 0.05)', padding: '15px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }} className="clipped-frame">
                                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span className="font-cinzel" style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 'bold', letterSpacing: '1px' }}><Link className="w-4 h-4 inline-block mr-2" /> Sintonización</span>
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
                          </>);
      })()}
                        </div>
                      );
};
