import { useState, useEffect, useRef, useMemo } from 'react';
import { calcMod } from '../../../../utils/dnd-calculos';
import type { CharacterDraft } from '../../../../data/dnd-datos';
import { getPointCost, getModStr, safeParseInventory, safeParseStats } from '../../../modules/personaje/personaje.utilidades';
import { skillList, statDescriptions } from '../../../modules/personaje/personaje.constantes';

export const useGestorPersonajesState = ({ socket, characters, compendium, userRole, triggerDiceRoll, isOverlay, forceOpenId, onCloseOverlay }: any) => {
  const dbClasses = useMemo(() => {
    if (!compendium) return [];
    return compendium
      .filter((item: any) => item.type === 'class')
      .map((item: any) => {
        let parsedData: any = {};
        try {
          parsedData = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
        } catch (e) {
          parsedData = {};
        }
        return {
          id: item.name,
          name: item.name,
          description: parsedData.description || parsedData.desc || '',
          hitDice: parsedData.hit_die || parsedData.hit_dice || 8,
          savingThrows: item.name === 'Bárbaro' ? ['fue', 'con'] :
                        item.name === 'Bardo' ? ['dex', 'car'] :
                        item.name === 'Clérigo' ? ['sab', 'car'] :
                        item.name === 'Druida' ? ['int', 'sab'] :
                        item.name === 'Guerrero' ? ['fue', 'con'] :
                        item.name === 'Monje' ? ['fue', 'dex'] :
                        item.name === 'Paladín' ? ['sab', 'car'] :
                        item.name === 'Explorador' ? ['fue', 'dex'] :
                        item.name === 'Pícaro' ? ['dex', 'int'] :
                        item.name === 'Hechicero' ? ['con', 'car'] :
                        item.name === 'Brujo' ? ['sab', 'car'] :
                        item.name === 'Mago' ? ['int', 'sab'] : ['fue', 'con']
        };
      });
  }, [compendium]);

  const getHitDieForClass = (className: string) => {
    const found = dbClasses.find(c => c.name === className || c.id === className);
    if (found) return found.hitDice;
    return 10;
  };

  const dbRaces = useMemo(() => {
    if (!compendium) return [];
    return compendium
      .filter((item: any) => item.type === 'race')
      .map((item: any) => {
        let parsedData: any = {};
        try {
          parsedData = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
        } catch (e) {
          parsedData = {};
        }
        
        const subr = (parsedData.subraces || []).map((s: any) => ({
          id: s.name,
          name: s.name,
          description: s.desc || s.description || 'Sin descripción.',
          bonuses: s.ability_bonuses || {},
          bonusText: ''
        }));

        const bonuses: any = {};
        if (Array.isArray(parsedData.ability_bonuses)) {
          parsedData.ability_bonuses.forEach((b: any) => {
            if (b.ability_score && b.ability_score.index) {
              bonuses[b.ability_score.index] = b.bonus;
            }
          });
        }

        const bonusTexts = [];
        for (const [attr, val] of Object.entries(bonuses)) {
          bonusTexts.push(`+${val} ${attr.toUpperCase()}`);
        }

        const languagesKnown = (parsedData.languages_known || []).map((l: string) => 
          l.charAt(0).toUpperCase() + l.slice(1)
        );

        return {
          id: item.name,
          name: item.name,
          description: parsedData.size_description || parsedData.age || 'Sin descripción.',
          age: parsedData.age || '',
          size: parsedData.size || 'Medio',
          speed: parsedData.speed || 30,
          bonuses: bonuses,
          bonusText: bonusTexts.length > 0 ? bonusTexts.join(', ') : '+1 a todo',
          subraces: subr,
          languages: languagesKnown.length > 0 ? languagesKnown : ['Común'],
          alignment: parsedData.alignment || '',
          alignmentDesc: parsedData.alignment_desc || '',
          image: parsedData.image || ''
        };
      });
  }, [compendium]);

  const getCharacterBaseSpeed = (charRaceStr: string) => {
    if (!charRaceStr) return 6;
    const baseRace = charRaceStr.split('(')[0].trim();
    const found = dbRaces.find(r => r.name === baseRace || r.id === baseRace);
    if (found) {
      return Math.floor(found.speed / 5);
    }
    if (baseRace === 'Enano' || baseRace === 'Mediano' || baseRace === 'Gnomo') return 5;
    return 6;
  };

  const dbAlignments = useMemo(() => {
    if (!compendium) return [];
    return compendium
      .filter((item: any) => item.type === 'alignment')
      .map((item: any) => {
        let parsedData: any = {};
        try {
          parsedData = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
        } catch (e) {
          parsedData = {};
        }
        let id = parsedData.index || item.name;
        if (id === 'neutral') id = 'true-neutral';
        return {
          id: id,
          label: item.name,
          desc: parsedData.desc || ''
        };
      });
  }, [compendium]);



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
  const [hitDieValue, setHitDieValue] = useState<number | ''>(10);
  const [showTraits, setShowTraits] = useState(false);

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedSavingThrows, setSelectedSavingThrows] = useState<string[]>(['fue', 'con']);
  const [backgroundItems, setBackgroundItems] = useState<string[]>(['', '']);
  const [skillQuery, setSkillQuery] = useState('');
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);
  const [itemQuery0, setItemQuery0] = useState('');
  const [itemDropdownOpen0, setItemDropdownOpen0] = useState(false);
  const [itemQuery1, setItemQuery1] = useState('');
  const [itemDropdownOpen1, setItemDropdownOpen1] = useState(false);


  const defaultInventory = { armas: [], armaduras: [], consumibles: [], artefactos: [], coins: { pc: 0, pl: 0, el: 0, po: 0, pt: 0 }, slots: {} };
  const [inventory, setInventory] = useState<any>(defaultInventory);


  const defaultDraft: CharacterDraft = {
    name: '',
    avatarUrl: '',
    age: null,
    height: '',
    weight: '',
    gender: '',
    alignment: null,
    languages: ['Común'],
    backstoryText: '',
    race: 'Humano',
    subrace: 'Estándar',
    class: 'Guerrero',
    attributes: { fue: 8, dex: 8, con: 8, int: 8, sab: 8, car: 8 },
    savingThrows: ['fue', 'con'],
    background: null,
    skillProficiencies: [],
    equipment: [],
    personalityTrait: '',
    ideal: '',
    bond: '',
    flaw: ''
  };

  const [draft, setDraft] = useState<CharacterDraft>(defaultDraft);

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

  // Estados añadidos para resolver inconsistencias y soportar modales/inventario
  const [creationErrors, setCreationErrors] = useState<Record<string, string>>({});
  const [showHitDiceModal, setShowHitDiceModal] = useState(false);
  const [showHpModal, setShowHpModal] = useState(false);
  const [hpModifierAmount, setHpModifierAmount] = useState(0);
  const [showLongRestModal, setShowLongRestModal] = useState(false);
  const [showPortraitModal, setShowPortraitModal] = useState(false);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [showDeathSavesModal, setShowDeathSavesModal] = useState(false);
  const [deathSavesState, setDeathSavesState] = useState<any>({ successes: 0, failures: 0 });
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [activeAttributeForModal, setActiveAttributeForModal] = useState<string | null>(null);
  const [showSavingThrowModal, setShowSavingThrowModal] = useState(false);
  const [activeSavingThrowForModal, setActiveSavingThrowForModal] = useState<string | null>(null);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [activeSkillForModal, setActiveSkillForModal] = useState<any>(null);
  const [showClassTooltip, setShowClassTooltip] = useState(false);
  const [inventoryTab, setInventoryTab] = useState<'items' | 'attunement'>('items');
  const [currentEditItem, setCurrentEditItem] = useState<any>(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemType, setNewItemType] = useState('item');
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [showEquipDropdown, setShowEquipDropdown] = useState<number | null>(null);
  const [unequippingItem, setUnequippingItem] = useState<any>(null);
  const [selectedItemForSlot, setSelectedItemForSlot] = useState<any>(null);
  const [showItemMenu, setShowItemMenu] = useState<number | null>(null);

  const getEffectiveStat = (statKey: string) => {
    if (!selectedCharacter) return 10;
    const charStats = safeParseStats(selectedCharacter.stats);
    const baseVal = charStats[statKey] || 10;
    const mods = charStats[`custom_${statKey}_modifiers`] || [];
    const customSum = mods.reduce((acc: number, m: any) => acc + m.value, 0);
    return baseVal + customSum;
  };

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



  // --- CÁLCULO POINT BUY ---
  const spentPoints = Object.values(stats).reduce((acc, val) => acc + getPointCost(val), 0);

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
    const finalName = draft.name || name;
    if (!finalName) return alert("¡Tu héroe necesita un nombre!");

    let payloadMaxHp = 10;
    let payloadClass = charClass;
    const payloadLevel = 1;

    if (!editingId) {
      // Creación: Vida configurada por el usuario (mínimo 1 de vida)
      payloadMaxHp = Math.max(1, (hitDieValue === '' ? 1 : hitDieValue) + calcMod(stats.con));
      // Guardamos la clase como JSON para soportar multiclase futura
      payloadClass = JSON.stringify({ [draft.class || charClass]: 1 });
    }

    const finalStats = { ...stats };
    if (!editingId) {
      const baseRace = (draft.race || race).split('(')[0].trim();
      const dbRaceObj = dbRaces.find(r => r.name === baseRace || r.id === baseRace);
      const bonuses = dbRaceObj?.bonuses || {};
      Object.keys(bonuses).forEach((s: string) => {
        (finalStats as any)[s] += bonuses[s];
      });
    }

    const dexMod = calcMod(finalStats.dex);
    const ac = 10 + dexMod;

    const payload = {
      name: finalName,
      charClass: payloadClass,
      race: `${draft.race || race} (${draft.subrace || subrace})`,
      description: draft.backstoryText || description,
      stats: finalStats,
      image,
      full_body_image: fullBodyImage,
      inventory: JSON.stringify({
        ...inventory,
        trasfondo: backgroundItems.filter(i => i.trim() !== ''),
        habilidades: selectedSkills,
        salvaciones: selectedSavingThrows,
        idiomas: draft.languages,
        edad: draft.age,
        altura: draft.height,
        peso: draft.weight,
        pronombres: draft.gender,
        alineamiento: draft.alignment,
        rasgoPersonalidad: draft.personalityTrait,
        ideal: draft.ideal,
        vinculo: draft.bond,
        defecto: draft.flaw
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
    setSelectedSavingThrows(['fue', 'con']);
    setBackgroundItems(['', '']);
    setHitDieValue(10);
    setShowTraits(false);
    setDraft(defaultDraft);
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
        text: `­ƒÄ▓ **${selectedCharacter.name}** subió a nivel **${newLevel}** (${levelUpClass}) y tiró **d${hitDie}** para su vida sacando **${roll}** (Mod CON: ${getModStr(charStats.con)}). ¡Su vida máxima aumentó en **+${hpGain}**!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      };
      socket.emit('chat:send', chatMsg);
    };

    if (triggerDiceRoll) {
      triggerDiceRoll(`d${hitDie}` as any, roll, applyUpdate);
    } else {
      alert(`­ƒùí´©Å Tomaste un nivel en ${levelUpClass}.
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
      padding: 'var(--search-input-padding)',
      background: 'rgba(0, 0, 0, 0.45)',
      border: '1px solid rgba(200, 135, 42, 0.3)',
      borderRadius: '4px',
      color: 'white',
      width: '100%',
      boxSizing: 'border-box' as const,
      outline: 'none',
      transition: 'border-color 0.2s, background 0.2s'
    },
    statLabel: {
      fontSize: '0.9rem',
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


  return {
    name, setName, charClass, setCharClass, race, setRace, subrace, setSubrace,
    description, setDescription, image, setImage, fullBodyImage, setFullBodyImage,
    editingId, setEditingId, stats, setStats, hitDieValue, setHitDieValue,
    showTraits, setShowTraits, selectedSkills, setSelectedSkills,
    selectedSavingThrows, setSelectedSavingThrows, backgroundItems, setBackgroundItems,
    skillQuery, setSkillQuery, skillDropdownOpen, setSkillDropdownOpen,
    itemQuery0, setItemQuery0, itemDropdownOpen0, setItemDropdownOpen0,
    itemQuery1, setItemQuery1, itemDropdownOpen1, setItemDropdownOpen1,
    inventory, setInventory, draft, setDraft, isCreating, setIsCreating,
    creationStep, setCreationStep, creationErrors, setCreationErrors,
    dbClasses, dbRaces, dbAlignments, getHitDieForClass, getCharacterBaseSpeed,
    selectedCharacter, setSelectedCharacter, charDetailTab, setCharDetailTab, openCharacterSheet,
    showHitDiceModal, setShowHitDiceModal, showHpModal, setShowHpModal,
    hpModifierAmount, setHpModifierAmount, showLongRestModal, setShowLongRestModal,
    showPortraitModal, setShowPortraitModal, showLevelUpModal, setShowLevelUpModal,
    isLevelingUp, setIsLevelingUp, levelUpClass, setLevelUpClass, showDeathSavesModal, setShowDeathSavesModal,
    deathSavesState, setDeathSavesState, showACModal, setShowACModal, showInitiativeModal, setShowInitiativeModal,
    showSpeedModal, setShowSpeedModal, showProficiencyModal, setShowProficiencyModal,
    showAttributeModal, setShowAttributeModal, activeAttributeForModal, setActiveAttributeForModal,
    showSavingThrowModal, setShowSavingThrowModal, activeSavingThrowForModal, setActiveSavingThrowForModal,
    showSkillModal, setShowSkillModal, activeSkillForModal, setActiveSkillForModal,
    showCropModal, setShowCropModal, cropImageSrc, setCropImageSrc, cropMode, setCropMode,
    cropScale, setCropScale, cropOffsetX, setCropOffsetX, cropOffsetY, setCropOffsetY,
    isCropDragging, setIsCropDragging, cropDragStart, setCropDragStart, cropImgDims, setCropImgDims,
    cropImgRef, portraitInputRef, searchTerm, setSearchTerm, showClassTooltip, setShowClassTooltip,
    inventoryTab, setInventoryTab, currentEditItem, setCurrentEditItem, showAddItemModal, setShowAddItemModal,
    newItemType, setNewItemType, newItemName, setNewItemName, newItemQuantity, setNewItemQuantity,
    showEquipDropdown, setShowEquipDropdown, activeSlotIndex, setActiveSlotIndex, unequippingItem, setUnequippingItem,
    selectedItemForSlot, setSelectedItemForSlot, showItemMenu, setShowItemMenu, isOverlay, forceOpenId, onCloseOverlay,
    handleSave, handleDelete, handleLevelUp, handleImageUpload, handleCropSave, filteredCharacters, parseClasses,
    resetForm, getEffectiveStat, socket, triggerDiceRoll, compendium, characters, userRole, styles,
    raceQuery, setRaceQuery, raceDropdownOpen, setRaceDropdownOpen,
    subraceQuery, setSubraceQuery, subraceDropdownOpen, setSubraceDropdownOpen,
    classQuery, setClassQuery, classDropdownOpen, setClassDropdownOpen,
    bgSkillQuery, setBgSkillQuery, bgSkillDropdownOpen, setBgSkillDropdownOpen,
    bgItemQuery, setBgItemQuery, bgItemDropdownOpen, setBgItemDropdownOpen,
    slotSearchQuery, setSlotSearchQuery, slotQuantity, setSlotQuantity,
    coinInputVal, setCoinInputVal, customItemName, setCustomItemName,
    customItemNote, setCustomItemNote, viewingItemDetail, setViewingItemDetail,
    unequippingSlotIndex, setUnequippingSlotIndex, unequipQuantity, setUnequipQuantity,
    selectedAttributeForModal, setSelectedAttributeForModal,
    selectedSavingThrowForModal, setSelectedSavingThrowForModal,
    selectedSkillForModal, setSelectedSkillForModal,
    classFeatures, setClassFeatures, featuresLoading, setFeaturesLoading,
    activeFeaturesClass, setActiveFeaturesClass, startEdit, updateStat,
    skillList, statDescriptions
  };
};
