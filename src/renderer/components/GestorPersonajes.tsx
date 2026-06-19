import { useState, useEffect, useRef, useMemo } from 'react';
import { User, Shield, Backpack, X, Link, Scale, ChevronLeft, ChevronRight, Check, Dices, ChevronUp, Pencil, Heart, Zap, Footprints, Award, Search, Filter } from 'lucide-react';
import { classes } from '../../data/dnd-datos';
import type { CharacterDraft } from '../../data/dnd-datos';
import { calcMod } from '../../utils/dnd-calculos';
import { HeroCard } from './ui/CartaHeroe';
import { formatDescription } from '../utils/formateador';
import {
  getPointCost,
  getModStr,
  getProficiencyBonus,
  safeParseInventory,
  safeParseStats,
  getSkillsOptionsAndLimit
} from '../modules/personaje/personaje.utilidades';
import {
  buildDbAlignments,
  buildDbClasses,
  buildDbItems,
  buildDbRaces,
  findBaseSpeedForRace,
  findHitDieForClass
} from '../modules/personaje/personaje.compendio';
import {
  createDefaultAttributes,
  createDefaultDraft,
  createDefaultInventory
} from '../modules/personaje/personaje.defaults';
import { characterManagerStyles as styles } from '../modules/personaje/personaje.styles';

import { CharacterInventoryTab } from './personaje/PestanaInventarioPersonaje';
import { CharacterTraitsTab } from './personaje/PestanaRasgosPersonaje';
import { CharacterSpellsTab } from './personaje/PestanaHechizosPersonaje';
import { CharacterStatsPanel } from './personaje/PanelEstadisticasPersonaje';
import { ACModifierModal } from './personaje/ACModifierModal';
import { InitiativeModifierModal } from './personaje/InitiativeModifierModal';
import { SpeedModifierModal } from './personaje/SpeedModifierModal';
import { ProficiencyModifierModal } from './personaje/ProficiencyModifierModal';
import { AttributeModifierModal } from './personaje/AttributeModifierModal';
import { SavingThrowModifierModal } from './personaje/SavingThrowModifierModal';
import { SkillModifierModal } from './personaje/SkillModifierModal';

import { skillList, statDescriptions } from '../modules/personaje/personaje.constantes';

export const CharacterManager = ({ socket, characters, compendium, userRole, triggerDiceRoll, isOverlay, forceOpenId, onCloseOverlay }: any) => {
  const dbClasses = useMemo(() => buildDbClasses(compendium), [compendium]);
  const getHitDieForClass = (className: string) => findHitDieForClass(dbClasses, className);
  const dbRaces = useMemo(() => buildDbRaces(compendium), [compendium]);
  const dbItems = useMemo(() => buildDbItems(compendium), [compendium]);
  const getCharacterBaseSpeed = (charRaceStr: string) => findBaseSpeedForRace(dbRaces, charRaceStr);
  const dbAlignments = useMemo(() => buildDbAlignments(compendium), [compendium]);



  // --- ESTADOS DEL FORMULARIO DE CREACIÓN ---
  const [name, setName] = useState('');
  const [charClass, setCharClass] = useState('Guerrero');
  const [race, setRace] = useState('Humano');
  const [subrace, setSubrace] = useState('Estándar');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [fullBodyImage, setFullBodyImage] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [stats, setStats] = useState(createDefaultAttributes);
  const [hitDieValue, setHitDieValue] = useState<number | ''>(10);
  const [showTraits, setShowTraits] = useState(false);

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedClassSkills, setSelectedClassSkills] = useState<string[]>([]);
  const [selectedSavingThrows, setSelectedSavingThrows] = useState<string[]>(['fue', 'con']);
  const [backgroundItems, setBackgroundItems] = useState<string[]>(['', '']);


  const [inventory, setInventory] = useState<any>(createDefaultInventory);
  const [draft, setDraft] = useState<CharacterDraft>(createDefaultDraft);

  // --- ESTADOS PARA RECORTE DE AVATAR (CROP) ---
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropScale, setCropScale] = useState(1);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);
  const [isCropDragging, setIsCropDragging] = useState(false);
  const [cropDragStart, setCropDragStart] = useState({ x: 0, y: 0 });
  const [cropImgDims, setCropImgDims] = useState({ width: 0, height: 0 });
  const [cropMode, setCropMode] = useState<'avatar' | 'portrait'>('avatar');
  const cropImgRef = useRef<HTMLImageElement>(null);
  const portraitInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!cropImgDims.width || !cropImgDims.height) return;
    
    const viewportW = 260;
    const viewportH = cropMode === 'avatar' ? 260 : 390;
    
    const imgAspect = cropImgDims.width / cropImgDims.height;
    const viewportAspect = viewportW / viewportH;
    const fitsHeight = imgAspect > viewportAspect;
    
    const baseWidth = fitsHeight ? viewportH * imgAspect : viewportW;
    const baseHeight = fitsHeight ? viewportH : viewportW / imgAspect;
    
    const W = baseWidth * cropScale;
    const H = baseHeight * cropScale;
    
    const maxOffsetX = Math.max(0, (W - viewportW) / 2);
    const maxOffsetY = Math.max(0, (H - viewportH) / 2);
    
    setCropOffsetX(prev => Math.min(maxOffsetX, Math.max(-maxOffsetX, prev)));
    setCropOffsetY(prev => Math.min(maxOffsetY, Math.max(-maxOffsetY, prev)));
  }, [cropScale, cropImgDims, cropMode]);





  const [raceQuery, setRaceQuery] = useState(draft.race || '');
  const [raceDropdownOpen, setRaceDropdownOpen] = useState(false);
  const [subraceQuery, setSubraceQuery] = useState(draft.subrace || '');
  const [subraceDropdownOpen, setSubraceDropdownOpen] = useState(false);
  const [classQuery, setClassQuery] = useState(draft.class || '');
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [bgSkillQuery, setBgSkillQuery] = useState('');
  const [bgSkillDropdownOpen, setBgSkillDropdownOpen] = useState(false);
  const [bgItemQuery, setBgItemQuery] = useState('');
  const [bgItemDropdownOpen, setBgItemDropdownOpen] = useState(false);

  useEffect(() => {
    setRaceQuery(draft.race || '');
    setSubraceQuery(draft.subrace || '');
    setClassQuery(draft.class || '');
    if (draft.race) setRace(draft.race);
    if (draft.subrace) setSubrace(draft.subrace);
  }, [draft.race, draft.subrace, draft.class]);

  useEffect(() => {
    setHitDieValue(getHitDieForClass(charClass));
  }, [charClass, dbClasses]);

  // --- ESTADOS DE VISTA ---
  
  useEffect(() => {
    // Sincronizar draft con los estados viejos para que la Fase 2/3 y guardado no se rompan
    setName(draft.name);
    setImage(draft.avatarUrl || '');
    setDescription(draft.backstoryText);
  }, [draft]);

  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState(1);
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
  const [levelUpClass, setLevelUpClass] = useState('');

  // --- ESTADOS DE BÚSQUEDA ---
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'none' | 'level-asc' | 'level-desc' | 'class' | 'hp'>('none');

  useEffect(() => {
    if (!sortDropdownOpen) return;
    const handleOutsideClick = () => setSortDropdownOpen(false);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [sortDropdownOpen]);

  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);
  const [slotSearchQuery, setSlotSearchQuery] = useState('');
  const [slotQuantity, setSlotQuantity] = useState(1);
  const [coinInputVal, setCoinInputVal] = useState<string>('');
  const [customItemName, setCustomItemName] = useState('');
  const [customItemNote, setCustomItemNote] = useState('');

  // --- MEJORAS DE INVENTARIO ---
  const [viewingItemDetail, setViewingItemDetail] = useState<any>(null);
  const [unequippingSlotIndex, setUnequippingSlotIndex] = useState<number | null>(null);
  const [unequipQuantity, setUnequipQuantity] = useState<number>(1);
  const [showACModal, setShowACModal] = useState(false);
  const [showInitiativeModal, setShowInitiativeModal] = useState(false);
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [showProficiencyModal, setShowProficiencyModal] = useState(false);
  const [selectedAttributeForModal, setSelectedAttributeForModal] = useState<string | null>(null);
  const [selectedSavingThrowForModal, setSelectedSavingThrowForModal] = useState<string | null>(null);
  const [selectedSkillForModal, setSelectedSkillForModal] = useState<{ label: string, key: string } | null>(null);


  const [isLevelingUp, setIsLevelingUp] = useState(false);

  // --- TABS DE LA FICHA DE PERSONAJE ---
  const [charDetailTab, setCharDetailTab] = useState<'hoja' | 'inventario' | 'conjuros' | 'trasfondo' | 'rasgos'>('hoja');
  const [classFeatures, setClassFeatures] = useState<any[]>([]);
  const [featuresLoading, setFeaturesLoading] = useState(false);
  const [activeFeaturesClass, setActiveFeaturesClass] = useState<string>('');

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

  // EFECTO PARA INICIALIZAR INPUT DE MONEDAS
  useEffect(() => {
    if (activeSlotIndex !== null && activeSlotIndex >= 20 && selectedCharacter) {
      const charInv = safeParseInventory(selectedCharacter.inventory);
      const coinKeys = ['pc', 'pl', 'el', 'po', 'pt'];
      const coinKey = coinKeys[activeSlotIndex - 20];
      const qty = charInv.coins?.[coinKey] || 0;
      setCoinInputVal(qty.toString());
    }
  }, [activeSlotIndex]);

  // --- LÓGICA DE PERSONAJES ---

  const handleImageUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageSrc(reader.result as string);
        setCropScale(1);
        setCropOffsetX(0);
        setCropOffsetY(0);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleCropSave = async () => {
    const canvas = document.createElement('canvas');
    const canvasW = cropMode === 'avatar' ? 300 : 520;
    const canvasH = cropMode === 'avatar' ? 300 : 780;
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d');
    if (ctx && cropImgRef.current) {
      // Fondo transparente/negro
      ctx.fillStyle = '#0f0c08';
      ctx.fillRect(0, 0, canvasW, canvasH);

      const img = cropImgRef.current;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;

      const viewportW = 260;
      const viewportH = cropMode === 'avatar' ? 260 : 390;

      const imgAspect = iw / ih;
      const viewportAspect = viewportW / viewportH;
      const fitsHeight = imgAspect > viewportAspect;

      const baseScale = fitsHeight ? (canvasH / ih) : (canvasW / iw);
      const finalScale = baseScale * cropScale;

      const dw = iw * finalScale;
      const dh = ih * finalScale;

      const scaleX = canvasW / viewportW;
      const scaleY = canvasH / viewportH;

      // Dibujar con los desplazamientos de arrastre
      const dx = (canvasW / 2) - dw / 2 + (cropOffsetX * scaleX);
      const dy = (canvasH / 2) - dh / 2 + (cropOffsetY * scaleY);

      ctx.drawImage(img, dx, dy, dw, dh);

      const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9);

      try {
        const blob = await (await fetch(croppedDataUrl)).blob();
        const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });

        const formData = new FormData();
        formData.append('file', file);
        const backendUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
        const uploadUrl = `${backendUrl}/api/upload?folder=avatars`;

        const res = await fetch(uploadUrl, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          if (cropMode === 'avatar') {
            setImage(data.url);
            setDraft(prev => ({ ...prev, avatarUrl: data.url }));
          } else {
            setFullBodyImage(data.url);
          }
          setShowCropModal(false);
          setCropImageSrc(null);
        } else {
          alert('Error al subir imagen recortada: ' + data.error);
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
      // Creación: Vida configurada por el usuario (mínimo 1 de vida)
      payloadMaxHp = Math.max(1, (hitDieValue === '' ? 1 : hitDieValue) + calcMod(stats.con));
      // Guardamos la clase como JSON para soportar multiclase futura
      payloadClass = JSON.stringify({ [charClass]: 1 });
    }

    const finalStats = { ...stats };
    if (!editingId) {
      const baseRace = race.split('(')[0].trim();
      const dbRaceObj = dbRaces.find((r: any) => r.name === baseRace || r.id === baseRace);
      const bonuses = dbRaceObj?.bonuses || {};
      Object.keys(bonuses).forEach((s: string) => {
        (finalStats as any)[s] += bonuses[s];
      });
      const subraceObj = dbRaceObj?.subraces?.find((sr: any) => sr.id === subrace || sr.name === subrace);
      const subraceBonuses = subraceObj?.bonuses || {};
      Object.keys(subraceBonuses).forEach((s: string) => {
        (finalStats as any)[s] += subraceBonuses[s];
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
        habilidades: [...selectedSkills, ...selectedClassSkills],
        salvaciones: selectedSavingThrows,
        idiomas: draft.languages
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
    setInventory(createDefaultInventory());
    setStats(createDefaultAttributes());
    setDraft(createDefaultDraft());
    setSelectedSkills([]);
    setSelectedClassSkills([]);
    setSelectedSavingThrows(['fue', 'con']);
    setBackgroundItems(['', '']);
    setHitDieValue(10);
    setShowTraits(false);
    if (isOverlay && onCloseOverlay) {
      onCloseOverlay();
    }
  };

  const startEdit = (c: any) => {
    setIsCreating(true);
    setEditingId(c.id);
    setName(c.name);
    let currentClass = 'Guerrero';
    try {
      const parsed = JSON.parse(c.class);
      currentClass = Object.keys(parsed)[0];
      setCharClass(currentClass);
    } catch {
      currentClass = c.class;
      setCharClass(currentClass);
    }
    setRace(c.race || 'Humano');
    setDescription(c.description);
    setImage(c.image || '');
    setFullBodyImage(c.full_body_image || '');
    setStats(safeParseStats(c.stats));
    const parsedInv = safeParseInventory(c.inventory);
    setInventory(parsedInv);

    // Split skills between background skills and class skills
    const foundDbClass = dbClasses.find((cls: any) => cls.name === currentClass || cls.id === currentClass);
    let allSkills = parsedInv.habilidades || [];
    let bgSkills: string[] = [];
    let clsSkills: string[] = [];
    
    if (foundDbClass) {
      const classItem = compendium.find((item: any) => item.type === 'class' && (item.name === currentClass));
      let profSkillsStr = "";
      if (classItem) {
        try {
          const parsedData = typeof classItem.data === 'string' ? JSON.parse(classItem.data) : classItem.data;
          profSkillsStr = parsedData.prof_skills || "";
        } catch {}
      }
      const { limit, allowed } = getSkillsOptionsAndLimit(profSkillsStr, currentClass);
      
      allSkills.forEach((skill: string) => {
        if (allowed.includes(skill) && clsSkills.length < limit) {
          clsSkills.push(skill);
        } else {
          bgSkills.push(skill);
        }
      });
    } else {
      bgSkills = allSkills;
    }

    setSelectedSkills(bgSkills);
    setSelectedClassSkills(clsSkills);
    setSelectedSavingThrows(parsedInv.salvaciones || []);
    setSelectedCharacter(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este aventurero?")) {
      socket.emit('character:delete', id);
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

    const hitDie = getHitDieForClass(levelUpClass);
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

  const filteredCharacters = characters.filter((c: any) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.owner?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCharacters = useMemo(() => {
    let result = [...filteredCharacters];
    if (sortBy === 'level-asc') {
      result.sort((a, b) => (a.level || 1) - (b.level || 1));
    } else if (sortBy === 'level-desc') {
      result.sort((a, b) => (b.level || 1) - (a.level || 1));
    } else if (sortBy === 'class') {
      result.sort((a, b) => {
        const classA = Object.keys(parseClasses(a.class))[0] || '';
        const classB = Object.keys(parseClasses(b.class))[0] || '';
        return classA.localeCompare(classB);
      });
    } else if (sortBy === 'hp') {
      result.sort((a, b) => (b.max_hp || 0) - (a.max_hp || 0));
    }
    return result;
  }, [filteredCharacters, sortBy]);

  return (
    <div style={styles.container}>
      <section style={{ display: isOverlay ? 'none' : 'block' }}>
        <div style={{ position: 'relative', marginBottom: 'var(--search-container-margin)' }}>
          {/* Fondo recortado que tiene clip-path */}
          <div className="clipped-frame" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', zIndex: 0 }} />

          {/* Contenedor flex frontal que NO se recorta, permitiendo que el dropdown sobresalga */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: 'var(--search-container-padding)', position: 'relative', zIndex: 1 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                className="mono"
                style={{ ...styles.input, paddingLeft: 'var(--search-input-padding-left)' }}
                placeholder="Buscar héroe en la reserva..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={18} style={{ position: 'absolute', left: 'var(--search-icon-left)', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            </div>

            {/* Botón de Filtro */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => { e.stopPropagation(); setSortDropdownOpen(!sortDropdownOpen); }}
                className="font-cinzel torch-glow"
                style={{
                  background: 'transparent',
                  color: 'var(--accent-gold)',
                  border: '1px solid var(--accent-gold)',
                  padding: 'var(--search-input-padding)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(200, 135, 42, 0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Filter size={16} />
                <span className="mono" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  {sortBy === 'none' ? 'Filtrar' : 
                   sortBy === 'level-asc' ? 'Nivel (Asc)' :
                   sortBy === 'level-desc' ? 'Nivel (Desc)' :
                   sortBy === 'class' ? 'Clase' : 'PG'}
                </span>
              </button>

              {sortDropdownOpen && (
                <div
                  className="clipped-frame"
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--accent-gold)',
                    borderRadius: '4px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.8)',
                    zIndex: 100,
                    minWidth: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '5px 0'
                  }}
                >
                  {[
                    { key: 'none', label: 'Sin ordenar' },
                    { key: 'level-asc', label: 'Nivel (asc)' },
                    { key: 'level-desc', label: 'Nivel (desc)' },
                    { key: 'class', label: 'Por clase' },
                    { key: 'hp', label: 'Por PG' }
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        setSortBy(opt.key as any);
                        setSortDropdownOpen(false);
                      }}
                      style={{
                        background: sortBy === opt.key ? 'rgba(200, 135, 42, 0.15)' : 'transparent',
                        border: 'none',
                        color: sortBy === opt.key ? 'var(--accent-gold)' : 'var(--text-parchment)',
                        padding: '10px 15px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-body)',
                        width: '100%',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(200, 135, 42, 0.25)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = sortBy === opt.key ? 'rgba(200, 135, 42, 0.15)' : 'transparent';
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => { resetForm(); setIsCreating(true); }}
              className="font-cinzel torch-glow"
              style={{
                background: 'transparent',
                color: 'var(--accent-gold)',
                border: '1px solid var(--accent-gold)',
                padding: 'var(--search-input-padding)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                letterSpacing: '1px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--accent-gold)';
                e.currentTarget.style.color = '#111';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--accent-gold)';
              }}
            >
              <span style={{ fontSize: '1.1rem', lineHeight: '1' }}>+</span> Nuevo Héroe
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(var(--char-grid-minmax), 1fr))', gap: 'var(--char-grid-gap)' }}>

          {sortedCharacters.map((c: any) => {
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
          {sortedCharacters.length === 0 && <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>No se encontraron aventureros...</div>}
        </div>
      </section>

      {/* MODAL DE FORJA / EDICIÓN */}
      {isCreating && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001, padding: '40px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 'min(1200px, 80vw)', height: '90vh', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <div style={{ ...styles.card, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', border: '2px solid var(--accent-gold)', padding: 0, overflow: 'hidden', position: 'relative' }} className="clipped-frame">
              <button onClick={() => resetForm()} style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '2.5rem', cursor: 'pointer', zIndex: 10 }}><X className="w-6 h-6 m-auto" /></button>

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
                    <div className="mono" style={circleStyle} title={s === 1 ? 'ESENCIA' : s === 2 ? 'COMPETENCIAS' : 'VITALIDAD'}>
                      {isCompleted ? '✓' : s}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CONTENIDO SCROLLABLE */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '30px 40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>

              {creationStep === 1 && (
                <>
                  {/* Header: nombre del héroe (input full-width) y avatar */}
                  <div style={{ width: '100%' }}>
                    <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '1.5px', marginBottom: '8px', display: 'block' }}>NOMBRE DEL HÉROE</label>
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

                  {/* Sección de Raza y Subraza en dos columnas */}
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
                            {dbRaces.filter((r: any) => r.name.toLowerCase().includes(raceQuery.toLowerCase())).map((r: any) => (
                              <div
                                key={r.id}
                                onClick={() => {
                                  const defaultAlign = r.alignment || 'true-neutral';
                                  setDraft(prev => ({
                                    ...prev,
                                    race: r.id,
                                    subrace: r.subraces.length > 0 ? r.subraces[0].id : null,
                                    languages: r.languages || ['Común'],
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

                        {/* Descripción de Raza */}
                        {draft.race && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-parchment)', opacity: 0.9, fontStyle: 'italic', padding: '12px 18px', background: 'rgba(200, 135, 42, 0.04)', borderLeft: '3px solid var(--accent-gold)', marginTop: '8px' }}>
                            {dbRaces.find((r: any) => r.id === draft.race || r.name === draft.race)?.description}
                          </div>
                        )}
                      </div>

                      {/* Buscador de Subraza (si la raza elegida tiene subrazas) */}
                      {(() => {
                        const selectedRaceObj = dbRaces.find((r: any) => r.id === draft.race || r.name === draft.race);
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
                                {selectedRaceObj.subraces.filter((sr: any) => sr.name.toLowerCase().includes(subraceQuery.toLowerCase())).map((sr: any) => (
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

                            {/* Descripción de Subraza */}
                            {draft.subrace && (
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-parchment)', opacity: 0.9, fontStyle: 'italic', padding: '12px 18px', background: 'rgba(200, 135, 42, 0.04)', borderLeft: '3px solid var(--accent-gold)', marginTop: '8px' }}>
                                {selectedRaceObj.subraces.find((sr: any) => sr.id === draft.subrace)?.description}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Columna Derecha: Foto de Raza (Tamaño Fijo 2:3) */}
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
                              ✎
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
                        {draft.race && (fullBodyImage || dbRaces.find((r: any) => r.id === draft.race || r.name === draft.race)?.image) ? (
                          <img
                            src={fullBodyImage || dbRaces.find((r: any) => r.id === draft.race || r.name === draft.race)?.image}
                            alt={draft.race}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ textAlign: 'center', padding: '10px', color: 'var(--text-secondary)' }}>
                            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>⚔️</span>
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

                  {/* Detalles Físicos */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    <div>
                      <label className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>EDAD</label>
                      <input
                        type="number"
                        className="font-cinzel"
                        style={styles.input}
                        placeholder="Años"
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
                        placeholder="Ej: Él / Ella / Ellos"
                        value={draft.gender}
                        onChange={(e) => setDraft(prev => ({ ...prev, gender: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Alineamiento (3x3 Grid) */}
                  <div>
                    <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '1.5px', marginBottom: '12px', display: 'block' }}>ALINEAMIENTO</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
                      {dbAlignments.map((align: any) => {
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
                      {/* Información Completa del Alineamiento Elegido */}
                      {(() => {
                        const selectedAlignObj = dbAlignments.find((a: any) => a.id === draft.alignment);
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

                      {/* Guía de Alineamiento según la Raza */}
                      {(() => {
                        const selectedRaceObj = dbRaces.find((r: any) => r.id === draft.race || r.name === draft.race);
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
                            <strong>Inclinación de la raza:</strong> {alignDesc}
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
                            {lang !== 'Común' && (
                              <button
                                type="button"
                                onClick={() => setDraft(prev => ({ ...prev, languages: prev.languages.filter(l => l !== lang) }))}
                                style={{ background: 'none', border: 'none', color: 'var(--combat-red)', cursor: 'pointer', padding: 0, fontWeight: 'bold', fontSize: '0.85rem', marginLeft: '4px' }}
                              >
                                ✕
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
                      placeholder="Escribe la leyenda de tu héroe..."
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
                                ✦ {skill}
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
                            ✕
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
                                📦 {item.name}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Chips de Objetos seleccionados */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                      {backgroundItems.filter(i => i.trim() !== '').map(itemName => (
                        <div key={itemName} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(200, 135, 42, 0.1)', padding: '6px 14px', border: '1px solid var(--accent-gold)', borderRadius: '20px', fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                          <span>📦 {itemName}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newItems = backgroundItems.map(i => i === itemName ? '' : i);
                              setBackgroundItems(newItems);
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--combat-red)', cursor: 'pointer', padding: 0, fontSize: '1rem', fontWeight: 'bold' }}
                          >
                            ✕
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
                    const spentPoints = Object.values(draft.attributes).reduce((acc, val) => acc + getPointCost(val), 0);
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
                    <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '1.5px', marginBottom: '15px', display: 'block' }}>ATRIBUTOS Y TIRADAS DE SALVACIÓN</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                      {Object.entries(draft.attributes).map(([key, value]) => {
                        const baseRace = (draft.race || 'Humano').split('(')[0].trim();
                        const dbRaceObj = dbRaces.find((r: any) => r.name === baseRace || r.id === baseRace);
                        const raceBonus = dbRaceObj?.bonuses?.[key] || 0;
                        const subraceObj = dbRaceObj?.subraces?.find((sr: any) => sr.id === draft.subrace || sr.name === draft.subrace);
                        const subraceBonus = subraceObj?.bonuses?.[key] || 0;
                        const total = value + raceBonus + subraceBonus;
                        const mod = calcMod(total);
                        const modStr = mod >= 0 ? "+" + mod : "" + mod;
                        const modColor = mod > 0 ? 'var(--natural-green)' : mod < 0 ? 'var(--combat-red)' : 'var(--text-parchment)';
                        const statNames: Record<string, string> = {
                          fue: 'FUERZA',
                          dex: 'DESTREZA',
                          con: 'CONSTITUCIÓN',
                          int: 'INTELIGENCIA',
                          sab: 'SABIDURÍA',
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
                              alert("Solo puedes seleccionar hasta 2 tiradas de salvación competentes.");
                              return;
                            }
                            newSavingThrows = [...draft.savingThrows, key as any];
                          }
                          setDraft(prev => ({ ...prev, savingThrows: newSavingThrows }));
                          setSelectedSavingThrows(newSavingThrows);
                        };

                        const updateAttributeValue = (val: number) => {
                          if (val < 8 || val > 15) return;
                          const spentPoints = Object.values(draft.attributes).reduce((acc, v) => acc + getPointCost(v), 0);
                          const remainingPoints = 27 - spentPoints;
                          
                          const currentCost = getPointCost(draft.attributes[key as keyof typeof draft.attributes]);
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
                            {/* Indicador de Salvación arriba al centro */}
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
                              ✦ SALVACIÓN
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
                                    Base: {value} {raceBonus > 0 ? `| +${raceBonus} Raza` : ""} {subraceBonus > 0 ? `| +${subraceBonus} Subraza` : ""}
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

                                {/* Descripción corta debajo */}
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
                          {(dbClasses.length > 0 ? dbClasses : classes).filter((c: any) => c.name.toLowerCase().includes(classQuery.toLowerCase())).map((cls: any) => (
                            <div
                              key={cls.id}
                              onClick={() => {
                                setDraft(prev => ({
                                  ...prev,
                                  class: cls.id,
                                  savingThrows: cls.savingThrows
                                }));
                                setCharClass(cls.id || 'Guerrero');
                                setSelectedClassSkills([]);
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

                    {/* Descripción Detallada de la Clase Elegida */}
                    {(() => {
                      const selectedDbClass = dbClasses.find((c: any) => c.name === draft.class || c.id === draft.class);
                      const descToShow = selectedDbClass?.description || '';
                      if (!descToShow) return null;
                      return (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-parchment)', opacity: 0.9, fontStyle: 'italic', padding: '15px 20px', background: 'rgba(200, 135, 42, 0.04)', borderLeft: '3px solid var(--accent-gold)', marginTop: '12px', lineHeight: '1.5' }}>
                          {descToShow}
                        </div>
                      );
                    })()}

                    {/* Selector de Habilidades de Clase */}
                    {(() => {
                      const selectedDbClass = dbClasses.find((c: any) => c.name === draft.class || c.id === draft.class);
                      if (!selectedDbClass) return null;

                      let profSkillsStr = "";
                      try {
                        const classItem = compendium.find((item: any) => item.type === 'class' && (item.name === selectedDbClass.name));
                        if (classItem) {
                          const parsedData = typeof classItem.data === 'string' ? JSON.parse(classItem.data) : classItem.data;
                          profSkillsStr = parsedData.prof_skills || "";
                        }
                      } catch {}

                      const { limit, allowed } = getSkillsOptionsAndLimit(profSkillsStr, selectedDbClass.name);

                      return (
                        <div style={{ marginTop: '25px', width: '100%' }}>
                          <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '1.5px', display: 'block', marginBottom: '8px' }}>
                            HABILIDADES DE CLASE (Elige {limit})
                          </label>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
                            Opciones permitidas: {profSkillsStr || "Cualquier habilidad"}
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '8px' }}>
                            {allowed.map((skill: string) => {
                              const isSelected = selectedClassSkills.includes(skill);
                              const isBgSkill = selectedSkills.includes(skill);
                              return (
                                <button
                                  key={skill}
                                  type="button"
                                  disabled={isBgSkill || (!isSelected && selectedClassSkills.length >= limit)}
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedClassSkills(selectedClassSkills.filter(s => s !== skill));
                                    } else {
                                      setSelectedClassSkills([...selectedClassSkills, skill]);
                                    }
                                  }}
                                  className="mono"
                                  style={{
                                    padding: '8px',
                                    background: isBgSkill ? 'rgba(255,255,255,0.03)' : (isSelected ? 'rgba(200, 135, 42, 0.15)' : 'var(--bg-base)'),
                                    border: `1px solid ${isBgSkill ? 'rgba(255,255,255,0.08)' : (isSelected ? 'var(--accent-gold)' : 'var(--border-color)')}`,
                                    color: isBgSkill ? 'var(--text-secondary)' : (isSelected ? 'var(--accent-gold)' : 'white'),
                                    cursor: isBgSkill ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.1s',
                                    fontSize: '0.75rem',
                                    textAlign: 'center',
                                    borderRadius: '4px'
                                  }}
                                >
                                  {skill} {isBgSkill && " (Trasfondo)"}
                                </button>
                              );
                            })}
                          </div>
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
                        {draft.name || 'Héroe sin Nombre'}
                      </h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {charClass} • {race} ({subrace})
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
                      DADO DE VIDA & CONSTITUCIÓN
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
                          <span>Modificador de Constitución:</span>
                          <span className="mono" style={{ color: calcMod(stats.con) >= 0 ? 'var(--natural-green)' : 'var(--combat-red)' }}>
                            {calcMod(stats.con) >= 0 ? '+' : ''}{calcMod(stats.con)}
                          </span>
                        </div>
                        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '6px', fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', gap: '30px' }}>
                          <span>Vida Máxima Total:</span>
                          <span className="mono">{hitDieValue === '' ? '-' : Math.max(1, hitDieValue + calcMod(stats.con))} HP</span>
                        </div>
                      </div>

                    </div>

                    <p style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', margin: '15px 0 0 0', fontStyle: 'italic', opacity: 0.8 }}>
                      * Aviso: En el primer nivel se recomienda utilizar el valor máximo del dado de vida de tu clase.
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
                        ▼
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
                            <strong>Descripción:</strong> {dbRaces.find((r: any) => r.id === race || r.name === race)?.description} <span style={{ color: 'var(--accent-gold)' }}>({dbRaces.find((r: any) => r.id === race || r.name === race)?.bonusText})</span>
                          </div>
                          {subrace && subrace !== 'Estándar' && (
                            <div>
                              <strong>Subraza:</strong> {dbRaces.find((r: any) => r.id === race || r.name === race)?.subraces.find((sr: any) => sr.id === subrace || sr.name === subrace)?.description}
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
                            <span style={{ color: 'var(--accent-gold)', marginRight: '8px' }}>✦</span>
                            <span>Competencias: <strong>{charClass === 'Mago' ? 'Dagas y Bastones' : 'Armas Marciales'}</strong>.</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                            <span style={{ color: 'var(--accent-gold)', marginRight: '8px' }}>✦</span>
                            <span>Salvaciones fijas de clase: <strong>{charClass === 'Guerrero' ? 'FUE y CON' : 'INT y SAB'}</strong>.</span>
                          </div>
                          
                          {/* Dynamic database class features at Level 1 */}
                          {featuresLoading ? (
                            <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Cargando rasgos...</div>
                          ) : classFeatures.filter(f => f.level_acquired === 1).length > 0 ? (
                            classFeatures.filter(f => f.level_acquired === 1).map((f, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <span style={{ color: 'var(--accent-gold)', marginRight: '8px' }}>◈</span>
                                <span><strong>{f.feature_name}:</strong> {f.description}</span>
                              </div>
                            ))
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'flex-start', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                              <span style={{ marginRight: '8px' }}>✦</span>
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
                className="creator-nav-btn-prev"
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
                title="Atrás"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <button
              type="button"
              className="creator-nav-btn-next"
              disabled={creationStep === 3 && hitDieValue === ''}
              onClick={() => {
                if (creationStep === 3) {
                  if (hitDieValue === '') return;
                  handleSave();
                } else {
                  if (creationStep === 1 && !draft.name) {
                    alert("¡Tu héroe necesita un nombre!");
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



      {/* MODAL DE RECORTE DE AVATAR */}
      {showCropModal && cropImageSrc && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(5, 4, 3, 0.92)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div className="clipped-frame" style={{
            background: 'var(--bg-surface)',
            border: '2px solid var(--accent-gold)',
            boxShadow: '0 0 50px rgba(0,0,0,0.8)',
            padding: '30px',
            width: '100%',
            maxWidth: '450px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            alignItems: 'center',
            borderRadius: '8px'
          }}>
            <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', margin: 0, letterSpacing: '1px' }}>
              {cropMode === 'avatar' ? 'AJUSTAR AVATAR' : 'AJUSTAR RETRATO'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0 0 10px 0', textAlign: 'center' }}>
              Arrastra la imagen para centrarla y usa la barra para hacer zoom.
            </p>

            {/* Viewport de recorte (circular o rectangular) */}
            <div style={{
              width: '260px',
              height: cropMode === 'avatar' ? '260px' : '390px',
              borderRadius: cropMode === 'avatar' ? '50%' : '4px',
              border: '2px solid var(--accent-gold)',
              overflow: 'hidden',
              position: 'relative',
              background: '#0d0b09',
              cursor: isCropDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
            }}
            onMouseDown={(e) => {
              setIsCropDragging(true);
              setCropDragStart({ x: e.clientX - cropOffsetX, y: e.clientY - cropOffsetY });
            }}
            onMouseMove={(e) => {
              if (isCropDragging && cropImgDims.width && cropImgDims.height) {
                const targetX = e.clientX - cropDragStart.x;
                const targetY = e.clientY - cropDragStart.y;
                
                const viewportW = 260;
                const viewportH = cropMode === 'avatar' ? 260 : 390;

                const imgAspect = cropImgDims.width / cropImgDims.height;
                const viewportAspect = viewportW / viewportH;
                const fitsHeight = imgAspect > viewportAspect;
                
                const baseWidth = fitsHeight ? viewportH * imgAspect : viewportW;
                const baseHeight = fitsHeight ? viewportH : viewportW / imgAspect;
                
                const W = baseWidth * cropScale;
                const H = baseHeight * cropScale;
                
                const maxOffsetX = Math.max(0, (W - viewportW) / 2);
                const maxOffsetY = Math.max(0, (H - viewportH) / 2);
                
                setCropOffsetX(Math.min(maxOffsetX, Math.max(-maxOffsetX, targetX)));
                setCropOffsetY(Math.min(maxOffsetY, Math.max(-maxOffsetY, targetY)));
              }
            }}
            onMouseUp={() => setIsCropDragging(false)}
            onMouseLeave={() => setIsCropDragging(false)}
            >
              <img
                ref={cropImgRef}
                src={cropImageSrc}
                alt="Para recortar"
                draggable={false}
                onLoad={(e) => {
                  setCropImgDims({
                    width: e.currentTarget.naturalWidth,
                    height: e.currentTarget.naturalHeight
                  });
                }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: (cropImgDims.width / cropImgDims.height) > (cropMode === 'avatar' ? 1 : 260/390) ? 'auto' : '100%',
                  height: (cropImgDims.width / cropImgDims.height) > (cropMode === 'avatar' ? 1 : 260/390) ? '100%' : 'auto',
                  transform: `translate(-50%, -50%) translate(${cropOffsetX}px, ${cropOffsetY}px) scale(${cropScale})`,
                  transformOrigin: 'center',
                  maxWidth: 'none',
                  maxHeight: 'none',
                  pointerEvents: 'none',
                  userSelect: 'none'
                }}
              />
            </div>

            {/* Control de Zoom */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span className="font-cinzel">ZOOM</span>
                <span className="mono">{Math.round(cropScale * 100)}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={cropScale}
                onChange={(e) => setCropScale(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--accent-gold)',
                  background: 'var(--bg-void)',
                  height: '6px',
                  borderRadius: '3px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Botones de acción */}
            <div style={{ display: 'flex', gap: '15px', width: '100%', marginTop: '10px' }}>
              <button
                type="button"
                className="font-cinzel"
                onClick={() => {
                  setShowCropModal(false);
                  setCropImageSrc(null);
                }}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.85rem'
                }}
              >
                CANCELAR
              </button>
              <button
                type="button"
                onClick={handleCropSave}
                style={{
                  flex: 1,
                  background: 'var(--accent-gold)',
                  border: 'none',
                  color: 'var(--bg-base)',
                  padding: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.85rem',
                  boxShadow: '0 0 10px rgba(200,135,42,0.4)'
                }}
              >
                ACEPTAR
              </button>
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
        const isSpellcaster = Object.keys(parsedClasses).some(cls => {
          const clsLower = cls.toLowerCase().trim();
          const castList = [
            'brujo', 'warlock', 
            'bardo', 'bard', 
            'paladin', 'paladín', 
            'mago', 'wizard', 
            'hechicero', 'sorcerer', 
            'druida', 'druid', 
            'clerigo', 'clérigo', 'cleric', 
            'explorador', 'ranger', 
            'artifice', 'artífice', 'artificer'
          ];
          const clsClean = clsLower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const isBaseCaster = castList.some(c => {
            const cClean = c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return clsClean === cClean;
          });
          if (isBaseCaster) return true;

          const hasThirdCasterKeyword = clsClean.includes('mistico') || 
                                       clsClean.includes('arcano') || 
                                       clsClean.includes('eldritch knight') || 
                                       clsClean.includes('arcane trickster');
          if (hasThirdCasterKeyword) return true;

          return false;
        });

        return (
          <>
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--char-sheet-modal-padding)', boxSizing: 'border-box' }}>
            <div className="clipped-frame" style={{ ...styles.card, width: '100%', maxWidth: 'var(--char-sheet-card-max-w)', height: 'var(--char-sheet-card-height)', maxHeight: 'var(--char-sheet-card-height)', overflowY: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', gap: 'var(--char-sheet-card-gap)', boxShadow: '0 0 100px rgba(0,0,0,1)', padding: 'var(--char-sheet-card-padding)' }}>
              <div style={{ position: 'absolute', top: 'var(--char-sheet-header-btn-top)', right: 'var(--char-sheet-header-btn-right)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 }}>
                <button 
                  onClick={() => startEdit(selectedCharacter)} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', transition: 'all 0.2s' }} 
                  onMouseOver={(e) => e.currentTarget.style.color = 'var(--gold-primary)'} 
                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'} 
                  title="Editar Personaje"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => { setSelectedCharacter(null); if(onCloseOverlay) onCloseOverlay(); }} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', transition: 'all 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.color = 'var(--combat-red)'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                  title="Cerrar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* [A] CABECERA */}
              <div style={{ display: 'grid', gridTemplateColumns: 'var(--char-sheet-header-grid)', gap: 'var(--char-sheet-header-gap)', alignItems: 'center' }}>
                <div style={{ width: 'var(--char-sheet-header-avatar-size)', height: 'var(--char-sheet-header-avatar-size)', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--gold-primary)', boxShadow: '0 0 20px rgba(200,135,42,0.4)' }}>
                  {selectedCharacter.image ? (
                    <img src={selectedCharacter.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--char-sheet-header-avatar-font)' }}><User className="w-full h-full p-2" /></div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <h1 className="font-cinzel" style={{ margin: 0, color: 'var(--gold-primary)', fontSize: 'var(--char-sheet-header-name-size)', lineHeight: '1.1', textShadow: '0 0 10px rgba(200,135,42,0.2)' }}>{selectedCharacter.name}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
                        <span className="font-cinzel" style={{ fontSize: 'var(--char-sheet-header-level-size)', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Nivel {selectedCharacter.level || 1}</span>
                      </div>
                      <button 
                        onClick={() => { setIsLevelingUp(true); setLevelUpClass(Object.keys(parsedClasses)[0] || 'Guerrero'); }} 
                        style={{ background: 'none', border: 'none', color: '#27ae60', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', transition: 'all 0.2s' }}
                        onMouseOver={(e) => { e.currentTarget.style.color = '#2ecc71'; e.currentTarget.style.transform = 'scale(1.2)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.color = '#27ae60'; e.currentTarget.style.transform = 'scale(1)'; }}
                        title="Subir Nivel"
                      >
                        <ChevronUp className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                  <div className="font-cinzel" style={{ fontSize: 'var(--char-sheet-header-race-size)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {selectedCharacter.race || 'Humano'} • {classesDisplay}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {(userRole === 'dm' || userRole === 'admin') && <button onClick={() => { handleDelete(selectedCharacter.id); setSelectedCharacter(null); if(onCloseOverlay) onCloseOverlay(); }} style={{ background: 'rgba(192,57,43,0.2)', color: 'var(--combat-red)', border: '1px solid rgba(192,57,43,0.4)', padding: '8px 16px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>BORRAR</button>}
                </div>
              </div>

              {/* [E] TABS (Fixed/static header at the top of content) */}
              <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', overflowX: 'auto', justifyContent: 'center', background: 'transparent', zIndex: 50, padding: '10px 0' }}>
                {(() => {
                  const tabsList = [
                    { id: 'hoja', label: 'HOJA' },
                    { id: 'rasgos', label: 'RASGOS' }
                  ];
                  if (isSpellcaster) {
                    tabsList.push({ id: 'conjuros', label: 'CONJUROS' });
                  }
                  return tabsList.map(tab => {
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
                  });
                })()}
              </div>
                {/* CONTENIDO PRINCIPAL BASADO EN TAB (Scrollable container) */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingRight: '20px' }}>
              {(() => {
                const activeTab = charDetailTab === 'hoja' || charDetailTab === 'inventario' ? 'hoja' : (charDetailTab === 'rasgos' || charDetailTab === 'trasfondo' ? 'rasgos' : 'conjuros');
                const activeTabToRender = activeTab === 'conjuros' && !isSpellcaster ? 'hoja' : activeTab;

                if (activeTabToRender === 'hoja') {
                  const getEffectiveStat = (statKey: string) => {
                    const baseVal = charStats[statKey] || 10;
                    const mods = charStats[`custom_${statKey}_modifiers`] || [];
                    const customSum = mods.reduce((acc: number, m: any) => acc + m.value, 0);
                    return baseVal + customSum;
                  };

                  return (
                    <>
                      {/* [C] DASHBOARD DE COMBATE */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'var(--char-sheet-dash-columns)', gap: 'var(--char-sheet-dash-gap)', justifyContent: 'center', marginBottom: '10px' }}>
                        <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: 'var(--char-sheet-dash-padding)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 'var(--char-sheet-dash-min-height)' }}>
                          <Heart size={20} style={{ color: 'var(--gold-primary)', alignSelf: 'center', marginBottom: '8px', width: 'var(--char-sheet-dash-icon-size)', height: 'var(--char-sheet-dash-icon-size)' }} />
                          <div className="font-cinzel" style={{ fontSize: 'var(--char-sheet-dash-label-size)', color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Puntos de Golpe</div>
                          <div className="mono" style={{ fontSize: 'var(--char-sheet-dash-hp-size)', color: 'var(--gold-primary)', fontWeight: 'bold' }}>
                            {selectedCharacter.current_hp || selectedCharacter.max_hp || 10}<span style={{ color: 'rgba(200, 135, 42, 0.6)', fontSize: 'var(--char-sheet-dash-hp-slash-size)', fontWeight: 'normal' }}>/{selectedCharacter.max_hp || 10}</span>
                          </div>
                        </div>
                        <div 
                          onClick={() => setShowACModal(true)}
                          style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: 'var(--char-sheet-dash-padding)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 'var(--char-sheet-dash-min-height)' }}
                          onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                          onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                          title="Editar Clase de Armadura"
                        >
                          <Shield size={20} style={{ color: 'var(--gold-primary)', alignSelf: 'center', marginBottom: '8px', width: 'var(--char-sheet-dash-icon-size)', height: 'var(--char-sheet-dash-icon-size)' }} />
                          <div className="font-cinzel" style={{ fontSize: 'var(--char-sheet-dash-label-size)', color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Clase de Armadura</div>
                          <div className="mono" style={{ fontSize: 'var(--char-sheet-dash-value-size)', color: 'var(--gold-primary)', fontWeight: 'bold' }}>{selectedCharacter.ac || (10 + calcMod(getEffectiveStat('dex')))}</div>
                        </div>
                        {(() => {
                          const customInitiative = (charStats.customInitiativeModifiers || []).reduce((acc: number, m: any) => acc + m.value, 0);
                          const totalInitiativeVal = calcMod(getEffectiveStat('dex')) + customInitiative;
                          const initStr = totalInitiativeVal >= 0 ? `+${totalInitiativeVal}` : `${totalInitiativeVal}`;
                          return (
                            <div 
                              onClick={() => setShowInitiativeModal(true)}
                              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: 'var(--char-sheet-dash-padding)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 'var(--char-sheet-dash-min-height)' }}
                              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                              title="Editar Iniciativa"
                            >
                              <Zap size={20} style={{ color: 'var(--gold-primary)', alignSelf: 'center', marginBottom: '8px', width: 'var(--char-sheet-dash-icon-size)', height: 'var(--char-sheet-dash-icon-size)' }} />
                              <div className="font-cinzel" style={{ fontSize: 'var(--char-sheet-dash-label-size)', color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Iniciativa</div>
                              <div className="mono" style={{ fontSize: 'var(--char-sheet-dash-value-size)', color: 'var(--gold-primary)', fontWeight: 'bold' }}>{initStr}</div>
                            </div>
                          );
                        })()}
                        {(() => {
                          const customSpeed = (charStats.customSpeedModifiers || []).reduce((acc: number, m: any) => acc + m.value, 0);
                          const baseSpeedVal = getCharacterBaseSpeed(selectedCharacter.race);
                          const totalSpeed = baseSpeedVal + customSpeed;
                          return (
                            <div 
                              onClick={() => setShowSpeedModal(true)}
                              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: 'var(--char-sheet-dash-padding)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 'var(--char-sheet-dash-min-height)' }}
                              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                              title="Editar Velocidad"
                            >
                              <Footprints size={20} style={{ color: 'var(--gold-primary)', alignSelf: 'center', marginBottom: '8px', width: 'var(--char-sheet-dash-icon-size)', height: 'var(--char-sheet-dash-icon-size)' }} />
                              <div className="font-cinzel" style={{ fontSize: 'var(--char-sheet-dash-label-size)', color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Velocidad</div>
                              <div className="mono" style={{ fontSize: 'var(--char-sheet-dash-value-size)', color: 'var(--gold-primary)', fontWeight: 'bold' }}>{totalSpeed}</div>
                            </div>
                          );
                        })()}
                        {(() => {
                          const customProficiency = (charStats.customProficiencyModifiers || []).reduce((acc: number, m: any) => acc + m.value, 0);
                          const totalProficiency = getProficiencyBonus(selectedCharacter.level || 1) + customProficiency;
                          return (
                            <div 
                              onClick={() => setShowProficiencyModal(true)}
                              style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: 'var(--char-sheet-dash-padding)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 'var(--char-sheet-dash-min-height)' }}
                              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                              title="Editar Competencia"
                            >
                              <Award size={20} style={{ color: 'var(--gold-primary)', alignSelf: 'center', marginBottom: '8px', width: 'var(--char-sheet-dash-icon-size)', height: 'var(--char-sheet-dash-icon-size)' }} />
                              <div className="font-cinzel" style={{ fontSize: 'var(--char-sheet-dash-label-size)', color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Competencia</div>
                              <div className="mono" style={{ fontSize: 'var(--char-sheet-dash-value-size)', color: 'var(--gold-primary)', fontWeight: 'bold' }}>+{totalProficiency}</div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* [D] CUERPO */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'var(--char-sheet-body-columns)', gap: 'var(--char-sheet-body-gap)' }}>
                        {/* Columna Izquierda (Stats Panel) */}
                        <CharacterStatsPanel 
                          character={selectedCharacter} 
                          charStats={charStats} 
                          selectedSavingThrows={selectedSavingThrows} 
                          selectedSkills={selectedSkills}
                          onSelectSavingThrow={(key: string) => setSelectedSavingThrowForModal(key)}
                          onSelectSkill={(label: string, key: string) => setSelectedSkillForModal({ label, key })}
                          dbRaces={dbRaces}
                        />
                        {/* Columna Derecha (Atributos + Inventario) */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--char-sheet-body-gap)' }}>
                          {/* Atributos */}
                          <div>
                            <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '10px', fontSize: '0.8rem' }}>ATRIBUTOS</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(var(--char-sheet-attr-minmax), 1fr))', gap: 'var(--char-sheet-attr-gap)' }}>
                              {['fue', 'dex', 'con', 'int', 'sab', 'car'].map((key) => {
                                const effectiveValue = getEffectiveStat(key);
                                const mod = calcMod(effectiveValue);
                                const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                                const modColor = mod > 0 ? 'var(--gold-primary)' : (mod < 0 ? '#e74c3c' : 'white');
                                return (
                                  <div 
                                    key={key} 
                                    className="attribute-card-hover" 
                                    onClick={() => setSelectedAttributeForModal(key)}
                                    style={{ 
                                      background: 'var(--bg-base)', 
                                      border: '1px solid var(--border-color)', 
                                      borderRadius: '6px', 
                                      padding: 'var(--char-sheet-attr-padding)', 
                                      textAlign: 'center', 
                                      display: 'flex', 
                                      flexDirection: 'column', 
                                      alignItems: 'center', 
                                      justifyContent: 'center', 
                                      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <div className="font-cinzel" style={{ fontSize: 'var(--char-sheet-attr-title-size)', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '0.5px' }}>{key.toUpperCase()}</div>
                                    <div className="mono" style={{ fontSize: 'var(--char-sheet-attr-val-size)', fontWeight: 'bold', color: modColor, margin: '6px 0', textShadow: '0 0 5px rgba(255,255,255,0.05)' }}>{modStr}</div>
                                    <div className="mono" style={{ fontSize: 'var(--char-sheet-attr-base-size)', background: 'rgba(255,255,255,0.05)', padding: '3px 12px', borderRadius: '4px', color: 'var(--text-secondary)' }}>{effectiveValue}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          {/* Imagen Fullbody y Descripción */}
                          <div style={{ display: 'flex', gap: 'var(--char-sheet-portrait-gap)', alignItems: 'flex-start', marginTop: '10px', flexDirection: 'var(--char-sheet-portrait-direction)' as any }}>
                            {/* Imagen 2:3 */}
                             <div style={{ width: 'var(--char-sheet-portrait-w)', height: 'var(--char-sheet-portrait-h)', borderRadius: '4px', border: '1px solid var(--border-color)', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                               {(() => {
                                 const baseRace = (selectedCharacter.race || 'Humano').split(' ')[0].trim();
                                  const dbRaceMatch = dbRaces.find((r: any) => r.name === baseRace || r.id === baseRace);
                                 const defaultPortrait = dbRaceMatch?.image || '';
                                 const displayImage = selectedCharacter.full_body_image || defaultPortrait;
                                 return (
                                   <img src={displayImage} alt="Cuerpo Entero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                 );
                               })()}
                             </div>
                            {/* Descripción */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', height: 'var(--char-sheet-portrait-desc-h, var(--char-sheet-portrait-h))', width: '100%' }}>
                              <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: 0, fontSize: '0.8rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', letterSpacing: '1px' }}>TRASFONDO</h4>
                              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.5', fontSize: '0.85rem', fontStyle: selectedCharacter.description ? 'normal' : 'italic' }} dangerouslySetInnerHTML={{ __html: formatDescription(selectedCharacter.description || "Este aventurero aún no tiene una descripción escrita...") }} />
                              </div>
                            </div>
                          </div>
                          <CharacterInventoryTab character={selectedCharacter} setActiveSlotIndex={setActiveSlotIndex} />
                        </div>
                      </div>
                    </>
                  );
                } else if (activeTabToRender === 'rasgos') {
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
                      <CharacterTraitsTab 
                        character={selectedCharacter} 
                        classFeatures={classFeatures} 
                        activeFeaturesClass={activeFeaturesClass} 
                        featuresLoading={featuresLoading} 
                        fetchClassFeatures={fetchClassFeatures} 
                        socket={socket}
                        onUpdate={setSelectedCharacter}
                        dbRaces={dbRaces}
                        dbClasses={dbClasses}
                      />
                    </div>
                  );
                } else if (activeTabToRender === 'conjuros') {
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
                      <CharacterSpellsTab character={selectedCharacter} socket={socket} />
                    </div>
                  );
                }
                return null;
              })()}
              </div>

              {showACModal && (
                <ACModifierModal 
                  character={selectedCharacter} 
                  socket={socket} 
                  onClose={() => setShowACModal(false)} 
                  onUpdate={setSelectedCharacter}
                />
              )}

              {showInitiativeModal && (
                <InitiativeModifierModal 
                  character={selectedCharacter} 
                  socket={socket} 
                  onClose={() => setShowInitiativeModal(false)} 
                  onUpdate={setSelectedCharacter}
                />
              )}

              {showSpeedModal && (
                <SpeedModifierModal 
                  character={selectedCharacter} 
                  socket={socket} 
                  onClose={() => setShowSpeedModal(false)} 
                  onUpdate={setSelectedCharacter}
                />
              )}

              {selectedAttributeForModal && (
                <AttributeModifierModal 
                  character={selectedCharacter} 
                  socket={socket} 
                  attributeKey={selectedAttributeForModal as any}
                  onClose={() => setSelectedAttributeForModal(null)} 
                  onUpdate={setSelectedCharacter}
                />
              )}

              {selectedSavingThrowForModal && (
                <SavingThrowModifierModal 
                  character={selectedCharacter} 
                  socket={socket} 
                  attributeKey={selectedSavingThrowForModal as any}
                  onClose={() => setSelectedSavingThrowForModal(null)} 
                  onUpdate={setSelectedCharacter}
                />
              )}

              {selectedSkillForModal && (
                <SkillModifierModal 
                  character={selectedCharacter} 
                  socket={socket} 
                  skillLabel={selectedSkillForModal.label}
                  attributeKey={selectedSkillForModal.key as any}
                  onClose={() => setSelectedSkillForModal(null)} 
                  onUpdate={setSelectedCharacter}
                />
              )}

              {showProficiencyModal && (
                <ProficiencyModifierModal 
                  character={selectedCharacter} 
                  socket={socket} 
                  onClose={() => setShowProficiencyModal(false)} 
                  onUpdate={setSelectedCharacter}
                />
              )}

            </div>
          </div>

{/* SUB-MODAL DE SELECCIÓN DE OBJETO PARA SLOT */}
                                      {activeSlotIndex !== null && (() => {
                                        const slots = charInv.slots || {};
                                        
                                        if (activeSlotIndex >= 20) {
                                          const coinKeys = ['pc', 'pl', 'el', 'po', 'pt'];
                                          const coinLabels = ['Cobre (PC)', 'Plata (PL)', 'Electrum (EL)', 'Oro (PO)', 'Platino (PT)'];
                                          const coinIdx = activeSlotIndex - 20;
                                          const coinKey = coinKeys[coinIdx];
                                          const coinLabel = coinLabels[coinIdx];
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
                                                  maxWidth: '350px',
                                                  display: 'flex',
                                                  flexDirection: 'column',
                                                  gap: '20px',
                                                  boxShadow: '0 10px 50px rgba(0,0,0,0.9)'
                                                }}
                                              >
                                                <h3 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '1px' }}>
                                                  MODIFICAR MONEDAS
                                                </h3>
                                                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                                                  {coinLabel}
                                                  <input
                                                    type="text"
                                                    className="mono"
                                                    style={{
                                                      padding: '10px 14px',
                                                      background: 'var(--bg-base)',
                                                      border: '1px solid var(--border-color)',
                                                      color: 'white',
                                                      width: '140px',
                                                      textAlign: 'center',
                                                      fontSize: '1.5rem',
                                                      outline: 'none',
                                                      borderRadius: '4px',
                                                      display: 'block',
                                                      margin: '10px auto'
                                                    }}
                                                    value={coinInputVal}
                                                    onChange={e => {
                                                      setCoinInputVal(e.target.value);
                                                    }}
                                                  />
                                                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px', justifyContent: 'center' }}>
                                                    {[-10, -1, 1, 10].map((step) => (
                                                      <button
                                                        key={step}
                                                        onClick={() => {
                                                          const currentVal = parseInt(coinInputVal) || 0;
                                                          const newQty = Math.max(0, currentVal + step);
                                                          setCoinInputVal(newQty.toString());
                                                        }}
                                                        style={{
                                                          background: 'transparent',
                                                          border: '1px solid var(--border-color)',
                                                          color: 'var(--accent-gold)',
                                                          padding: '6px 12px',
                                                          cursor: 'pointer',
                                                          borderRadius: '4px',
                                                          fontWeight: 'bold',
                                                          minWidth: '45px'
                                                        }}
                                                      >
                                                        {step > 0 ? `+${step}` : step}
                                                      </button>
                                                    ))}
                                                  </div>
                                                </div>

                                                <button
                                                  onClick={() => {
                                                    const val = parseInt(coinInputVal) || 0;
                                                    const newCoins = {
                                                      ...(charInv.coins || { pc: 0, pl: 0, el: 0, po: 0, pt: 0 }),
                                                      [coinKey]: Math.max(0, val)
                                                    };
                                                    const newInv = {
                                                      ...charInv,
                                                      coins: newCoins
                                                    };
                                                    const updated = { ...selectedCharacter, inventory: JSON.stringify(newInv) };
                                                    socket.emit('character:update', updated);
                                                    setSelectedCharacter(updated);
                                                    setActiveSlotIndex(null);
                                                  }}
                                                  className="font-cinzel"
                                                  style={{
                                                    background: 'var(--accent-gold)',
                                                    border: 'none',
                                                    color: 'var(--bg-base)',
                                                    padding: '10px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    width: '100%',
                                                    marginTop: '10px',
                                                    letterSpacing: '1px'
                                                  }}
                                                >
                                                  CONFIRMAR
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        }

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
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '16px',
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
                                                {(() => {
                                                  const query = slotSearchQuery.toLowerCase().trim();
                                                  const filtered = dbItems
                                                    .filter((item: any) => item.name.toLowerCase().includes(query))
                                                    .slice(0, 40); // Limit to maximum 40 items

                                                  if (filtered.length === 0) {
                                                    return (
                                                      <div style={{ padding: '15px', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.85rem', textAlign: 'center' }}>
                                                        No se encontraron objetos en la base de datos...
                                                      </div>
                                                    );
                                                  }

                                                  return filtered.map((item: any) => {
                                                    const itemData = item.data || {};
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
                                                  });
                                                })()}
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


                                          {/* Panel lateral: Ítem Personalizado */}
                                          <div
                                            onClick={e => e.stopPropagation()}
                                            style={{
                                              background: 'var(--bg-surface)',
                                              border: '1px solid rgba(200,135,42,0.35)',
                                              padding: '20px',
                                              width: '230px',
                                              flexShrink: 0,
                                              display: 'flex',
                                              flexDirection: 'column',
                                              gap: '12px',
                                              boxShadow: '0 10px 50px rgba(0,0,0,0.9)',
                                              alignSelf: 'center',
                                            }}
                                          >
                                            <div className="font-cinzel" style={{ fontSize: '0.65rem', color: 'var(--accent-gold)', letterSpacing: '1px', borderBottom: '1px solid rgba(200,135,42,0.25)', paddingBottom: '8px' }}>✦ ÍTEM PERSONALIZADO</div>
                                            <input
                                              className="font-cinzel"
                                              style={{ padding: '8px 10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', width: '100%', boxSizing: 'border-box', outline: 'none', fontSize: '0.82rem', borderRadius: '3px' }}
                                              placeholder="Nombre del material..."
                                              value={customItemName}
                                              onChange={e => setCustomItemName(e.target.value)}
                                            />
                                            <input
                                              style={{ padding: '7px 10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', width: '100%', boxSizing: 'border-box', outline: 'none', fontSize: '0.75rem', borderRadius: '3px' }}
                                              placeholder="Nota (ej: para Bola de Fuego)"
                                              value={customItemNote}
                                              onChange={e => setCustomItemNote(e.target.value)}
                                            />
                                            <button
                                              className="font-cinzel"
                                              disabled={!customItemName.trim()}
                                              onClick={() => {
                                                if (!customItemName.trim()) return;
                                                const newSlots = {
                                                  ...slots,
                                                  [activeSlotIndex]: {
                                                    name: customItemName.trim(),
                                                    note: customItemNote.trim(),
                                                    quantity: slotQuantity,
                                                    custom: true,
                                                    type: 'material',
                                                  }
                                                };
                                                const newInv = { ...charInv, slots: newSlots };
                                                const updated = { ...selectedCharacter, inventory: JSON.stringify(newInv) };
                                                socket.emit('character:update', updated);
                                                setSelectedCharacter(updated);
                                                setCustomItemName('');
                                                setCustomItemNote('');
                                                setActiveSlotIndex(null);
                                              }}
                                              style={{
                                                background: customItemName.trim() ? 'rgba(200,135,42,0.2)' : 'transparent',
                                                border: `1px solid ${customItemName.trim() ? 'var(--accent-gold)' : 'var(--border-color)'}`,
                                                color: customItemName.trim() ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                                padding: '8px',
                                                cursor: customItemName.trim() ? 'pointer' : 'not-allowed',
                                                fontWeight: 'bold',
                                                fontSize: '0.75rem',
                                                letterSpacing: '1px',
                                                width: '100%',
                                                borderRadius: '3px',
                                                transition: 'all 0.2s'
                                              }}
                                            >
                                              GUARDAR
                                            </button>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.6, lineHeight: 1.4 }}>Para materiales de conjuro, consumibles improvisados o cualquier cosa que no esté en el compendio.</div>
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
                                                {(() => {
                                                  const classNamesList = dbClasses.map((c: any) => c.name);
                                                  return classNamesList.map((c: string) => <option key={c} value={c}>{c}</option>);
                                                })()}
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
