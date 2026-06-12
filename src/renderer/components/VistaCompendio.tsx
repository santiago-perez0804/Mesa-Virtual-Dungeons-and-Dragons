import { useState, useEffect, useMemo } from 'react';
import { Ghost, Scroll, Swords, Shield, Sparkles, Footprints, Dna, AlertTriangle, Zap, BarChart, BookOpen } from 'lucide-react';
import { FeatureTooltip } from './TooltipRasgos';
import { CompendiumCard } from './ui/CartaCompendio';
import { DatabaseDetail } from './compendium/DetalleBaseDatos';
import { DatabaseCreateForm } from './compendium/FormularioCrearBaseDatos';
import { ClassWizardModal } from './compendium/ModalAsistenteClases';
import { SubclassModal } from './compendium/ModalSubclase';

import { FeatureDetail } from './compendium/DetalleRasgo';
import { formatDescription } from '../utils/formateador';
import { useDatabaseForms } from '../modules/compendium/hooks/useFormulariosBaseDatos';

import { ACTION_TYPES, DAMAGE_TYPES, EMERGENCY_SRD_CLASSES } from '../modules/compendium/compendio.traducciones';

export const typeIcons: Record<string, React.ReactNode> = {
  monster: <><Ghost className="w-4 h-4 inline-block mr-1" /> Monstruos</>,
  spell: <><Scroll className="w-4 h-4 inline-block mr-1" /> Hechizos</>,
  item: <><Swords className="w-4 h-4 inline-block mr-1" /> Objetos</>,
  class: <><Shield className="w-4 h-4 inline-block mr-1" /> Clases</>,
  subclass: <><Sparkles className="w-4 h-4 inline-block mr-1" /> Subclases</>,
  race: <><Footprints className="w-4 h-4 inline-block mr-1" /> Razas</>,
  subrace: <><Dna className="w-4 h-4 inline-block mr-1" /> Subrazas</>,
  condition: <><AlertTriangle className="w-4 h-4 inline-block mr-1" /> Estados</>,
  features: <><Zap className="w-4 h-4 inline-block mr-1" /> Rasgos</>
};
/*
const parseMarkdownTable = (tableStr: string) => {
  if (!tableStr) return null;
  const lines = tableStr.trim().split('\n');
  if (lines.length < 2) return null;
  const contentLines = lines.filter(l => !l.includes('---') && l.trim().startsWith('|'));
  if (contentLines.length === 0) return null;
  const headers = contentLines[0].split('|').slice(1, -1).map(h => h.trim());
  const rows = contentLines.slice(1).map(line => line.split('|').slice(1, -1).map(c => c.trim()));
  return { headers, rows };
};
*/

const cleanNameForMatching = (name: string): string => {
  if (!name) return '';
  let s = name.toLowerCase();

  // Remove common parenthesized details, like '(subclase)', '(2)', '(1 dado)', etc.
  s = s.replace(/\s*\(.*\)/g, '');

  // Remove trailing numbers (e.g. 'extra attack 2' -> 'extra attack')
  s = s.replace(/\s+\d+$/g, '');

  // Standardize common encoding issues or vowel accent errors in D&D terms
  s = s.replace(/caracter[^s\s]{1,3}stica/gi, 'caracteristica');
  s = s.replace(/acci[^n\s]{1,3}n/gi, 'accion');
  s = s.replace(/b[^r\s]{1,3}rbaro/gi, 'barbaro');
  s = s.replace(/cl[^r\s]{1,3}rigo/gi, 'clerigo');
  s = s.replace(/campe[^n\s]{1,3}n/gi, 'campeon');
  s = s.replace(/cr[^t\s]{1,3}tico/gi, 'critico');
  s = s.replace(/palad[^n\s]{1,3}n/gi, 'paladin');
  s = s.replace(/elusi[^v\s]{1,3}o/gi, 'elusivo');
  s = s.replace(/evasi[^n\s]{1,3}n/gi, 'evasion');
  s = s.replace(/perici[^a\s]{1,3}a/gi, 'pericia');
  s = s.replace(/bendici[^n\s]{1,3}n/gi, 'bendicion');
  s = s.replace(/protecci[^n\s]{1,3}n/gi, 'proteccion');
  s = s.replace(/artifici[^e\s]{1,3}l/gi, 'artificial');

  // Strip standard diacritics
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Strip all non-alphanumeric characters entirely for tight matching
  s = s.replace(/[^a-z0-9]/g, '');
  
  return s;
};

const safeStr = (val: any) => val != null ? String(val) : '';
export const DatabaseView = ({ compendium, socket, userRole, isOverlay, forceOpenId, onCloseOverlay }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<'all' | 'monster' | 'spell' | 'item' | 'class' | 'subclass' | 'race' | 'subrace' | 'condition' | 'features'>('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 24;

  // EFECTO PARA OVERLAY
  useEffect(() => {
    if (isOverlay && forceOpenId && compendium && compendium.length > 0) {
      const item = compendium.find((d: any) => d.id === forceOpenId || d.name === forceOpenId);
      if (item) setSelectedItem(item);
    }
  }, [isOverlay, forceOpenId, compendium]);

  // Estados de Creación / Edición

  const formState = useDatabaseForms();
  const {
    isCreating, setIsCreating,
    editingId, setEditingId,
    createType, setCreateType,
    createName, setCreateName,
    createImage, setCreateImage,
    createDesc, setCreateDesc,
    createShortDesc, setCreateShortDesc,
    createSpellLevel, setCreateSpellLevel,
    createSpellComponents, setCreateSpellComponents,
    createSpellRange, setCreateSpellRange,
    createSpellDuration, setCreateSpellDuration,
    createSpellConcentration, setCreateSpellConcentration,
    createHp, setCreateHp,
    createAc, setCreateAc,
    createCr, setCreateCr,
    createSpeed, setCreateSpeed,
    createStats, setCreateStats,
    createAttacks, setCreateAttacks,
    createVuln, setCreateVuln,
    createRes, setCreateRes,
    createImm, setCreateImm,
    createSize, setCreateSize,
    createTraits, setCreateTraits,
    createRarity, setCreateRarity,
    isDamageItem, setIsDamageItem,
    itemAttackBonus, setItemAttackBonus,
    itemDamageFormula, setItemDamageFormula,
    itemDamageType, setItemDamageType,
    createTags, setCreateTags,
    createArmorType, setCreateArmorType,
    createRequiresAttunement, setCreateRequiresAttunement,
    createWeight, setCreateWeight,
    
    
    
    
    
    isProtectItem, setIsProtectItem,
    itemDefenseBonus, setItemDefenseBonus,
    itemAttackName, setItemAttackName,
    itemStatMod, setItemStatMod,
    itemStatSelection, setItemStatSelection,
    itemTargetsCount, setItemTargetsCount,
    itemCritDamage, setItemCritDamage,

    setImageZoom,
    
    
    
    

    isCreatingClass, setIsCreatingClass,

    setImagePosX,
    setImagePosY,
    setClassWizardStep,
    setCName,
    setCDesc,
    setCHitDie,
    setCSubclassLvl,
    setCSubclassTitle,
    setCArmors,
    setCWeapons,
    setCTools,
    setCSaves,
    setCSkills,
    setCSkillsLimit,
    setCResourceName,
    setCResourceProg,
    setSubclassName,
    setSubclassDesc,
    setSubclassTraits,
    isAddingSubclass, setIsAddingSubclass,
    
    
    
    
    
    

    resetForm
  } = formState;



  // --- ESTADOS ADICIONALES PARA COMPENDIO DE CLASES ---
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isImportingClasses, setIsImportingClasses] = useState(false);
  const [expandedTraits, setExpandedTraits] = useState<any>({});
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [srdDisconnected, setSrdDisconnected] = useState(false);
  
  /*
  const [featuresMap, setFeaturesMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!selectedClass) {
      setFeaturesMap({});
      return;
    }

    const host = window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin;
    const cleanClassName = selectedClass.name.toLowerCase();

    fetch(`${host}/api/class-features/${cleanClassName}`)
      .then(res => {
        if (!res.ok) throw new Error("Error fetching class features");
        return res.json();
      })
      .then((data: any[]) => {
        const map: Record<string, string> = {};
        data.forEach(item => {
          map[item.feature_name.toLowerCase()] = item.description;
        });
        setFeaturesMap(map);
      })
      .catch(err => {
        console.error("Failed to load class features:", err);
        setFeaturesMap({});
      });
  }, [selectedClass]);
  */
  
  // --- ESTADOS ADICIONALES PARA COMPENDIO DE RASGOS ---
  const [classFeatures, setClassFeatures] = useState<any[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  const [selectedFeatureClass, setSelectedFeatureClass] = useState<string>('all');
  const [selectedFeatureLevel, setSelectedFeatureLevel] = useState<string>('all');
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  // --- FORMULARIO DE RASGOS ---
  const [isEditingFeature, setIsEditingFeature] = useState(false);
  const [featureFormId, setFeatureFormId] = useState<string | null>(null);
  const [featureFormClass, setFeatureFormClass] = useState('');
  const [featureFormName, setFeatureFormName] = useState('');
  const [featureFormLevel, setFeatureFormLevel] = useState(1);
  const [featureFormDesc, setFeatureFormDesc] = useState('');
  const [featureFormShortDesc, setFeatureFormShortDesc] = useState('');
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  useEffect(() => {
    setLoadingFeatures(true);
    const host = window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin;
    fetch(`${host}/api/class-features`)
      .then(res => {
        if (!res.ok) throw new Error("Error al obtener los rasgos de clase");
        return res.json();
      })
      .then((data: any[]) => {
        setClassFeatures(data);
        setLoadingFeatures(false);
      })
      .catch(err => {
        console.error("No se pudieron cargar los rasgos de clase:", err);
        setLoadingFeatures(false);
      });
  }, []);

  const refreshFeaturesList = () => {
    const host = window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin;
    fetch(`${host}/api/class-features`)
      .then(res => res.json())
      .then(data => setClassFeatures(data))
      .catch(err => console.error("Error al refrescar rasgos:", err));
  };

  const openCreateFeatureForm = () => {
    setFeatureFormId(null);
    setFeatureFormClass('');
    setFeatureFormName('');
    setFeatureFormLevel(1);
    setFeatureFormDesc('');
    setFeatureFormShortDesc('');
    setIsEditingFeature(true);
  };

  const openEditFeatureForm = (feat: any) => {
    setFeatureFormId(feat.id);
    setFeatureFormClass(feat.class);
    setFeatureFormName(feat.name);
    setFeatureFormLevel(feat.level);
    setFeatureFormDesc(feat.description);
    setFeatureFormShortDesc(feat.short_description || '');
    setIsEditingFeature(true);
  };

  const handleSaveFeature = () => {
    if (!featureFormClass || !featureFormName || !featureFormDesc) {
      alert("Todos los campos son requeridos.");
      return;
    }

    const host = window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin;
    const payload = {
      class_name: featureFormClass,
      feature_name: featureFormName,
      level_acquired: featureFormLevel,
      description: featureFormDesc,
      short_description: featureFormShortDesc
    };

    if (featureFormId && !isNaN(Number(featureFormId))) {
      fetch(`${host}/api/class-features/${featureFormId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => {
        if (!res.ok) throw new Error("Error al actualizar el rasgo");
        return res.json();
      })
      .then(() => {
        setIsEditingFeature(false);
        refreshFeaturesList();
      })
      .catch(err => alert(err.message));
    } else {
      fetch(`${host}/api/class-features`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => {
        if (!res.ok) throw new Error("Error al crear el rasgo");
        return res.json();
      })
      .then(() => {
        setIsEditingFeature(false);
        refreshFeaturesList();
      })
      .catch(err => alert(err.message));
    }
  };

  const handleDeleteFeature = (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este rasgo de clase de forma permanente?")) return;

    const host = window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin;
    fetch(`${host}/api/class-features/${id}`, {
      method: 'DELETE'
    })
    .then(res => {
      if (!res.ok) throw new Error("Error al eliminar el rasgo");
      return res.json();
    })
    .then(() => {
      refreshFeaturesList();
      setSelectedFeature(null);
    })
    .catch(err => alert(err.message));
  };
  
  // Wizard Crear Clase



  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const backendUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
      const uploadUrl = `${backendUrl}/api/upload?folder=compendium`;
      
      try {
        const res = await fetch(uploadUrl, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          setCreateImage(data.url);
        } else {
          alert('Error al subir imagen: ' + data.error);
        }
      } catch (err) {
        console.error(err);
        alert('Error de conexión al subir la imagen');
      }
    }
  };

  // const toggleDamage = (type: string, current: string[], setter: (val: string[]) => void) => {
  //   if (current.includes(type)) {
  //     setter(current.filter(t => t !== type));
  //   } else {
  //     setter([...current, type]);
  //   }
  // };

  const handleSave = () => {
    if (!createName) return alert("El elemento necesita un nombre");

    let data: any = { description: createDesc };
    if (createImage) {
      data.image = createImage;
      
      
      
    }

    if (createType === 'monster') {
      data.hit_points = createHp;
      data.armor_class = createAc;
      data.challenge_rating = createCr;
      data.speed = createSpeed;
      data.strength = createStats.str;
      data.dexterity = createStats.dex;
      data.constitution = createStats.con;
      data.intelligence = createStats.int;
      data.wisdom = createStats.wis;
      data.charisma = createStats.cha;
      data.type = "homebrew_monster";
      data.actions = createAttacks.filter(a => a.name || a.desc);
      data.vulnerabilities = createVuln;
      data.resistances = createRes;
      data.immunities = createImm;
      data.size = createSize;
      data.traits = createTraits.filter(t => t.name || t.desc);
    } else if (createType === 'spell') {
      data.short_description = createShortDesc;
      data.level = createSpellLevel;
      data.components = createSpellComponents;
      data.range = createSpellRange;
      data.duration = createSpellDuration;
      data.concentration = createSpellConcentration;
    } else {
      data.rarity = createRarity;
      data.isDamage = isDamageItem;
      data.isProtect = isProtectItem;
      if (isProtectItem) {
        data.defenseBonus = itemDefenseBonus;
      }
      if (isDamageItem) {
        data.attackName = itemAttackName;
        data.attackBonus = itemAttackBonus;
        data.statMod = itemStatMod;
        data.statSelection = itemStatSelection;
        data.targetsCount = itemTargetsCount;
        data.damage = itemDamageFormula;
        data.damageType = itemDamageType;
        data.critDamage = itemCritDamage;
      }
      data.tags = createTags;
      if (createTags.includes('armadura')) {
        data.armorType = createArmorType;
      }
      data.requiresAttunement = createRequiresAttunement;
      data.weight = createWeight;
    }

    if (editingId) {
      socket.emit('content:update', { id: editingId, name: createName, type: createType, data });
    } else {
      socket.emit('content:create', { name: createName, type: createType, data });
    }

    // Reset
    resetForm();
  };



  const handleEditClick = (item: any) => {
    resetForm();
    setSelectedItem(null);
    setIsCreating(true);
    setEditingId(item.id);
    const validTypes = ['monster', 'item', 'class', 'subclass', 'race', 'subrace', 'condition', 'spell'];
    setCreateType(validTypes.includes(item.type) ? (item.type as any) : 'item');
    setCreateName(item.name ?? '');

    let data: any = {};
    try {
      if (item.data) {
        data = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
      }
    } catch { data = {}; }
    if (!data) data = {};

    
    
    

    setCreateDesc(safeStr(data.description ?? data.desc ?? ''));
    setCreateImage(safeStr(data.image ?? ''));
    setImageZoom(data.imageZoom ?? 1);
    setImagePosX(data.imagePosX ?? 0);
    setImagePosY(data.imagePosY ?? 0);

    if (item.type === 'monster') {
      let parsedAc = 10;
      if (typeof data.armor_class === 'number') parsedAc = data.armor_class;
      else if (Array.isArray(data.armor_class)) parsedAc = data.armor_class[0]?.value ?? 10;
      else if (typeof data.armor_class === 'object' && data.armor_class !== null) parsedAc = data.armor_class.value ?? 10;
      else parsedAc = parseInt(data.armor_class ?? data.ac) || 10;

      let parsedSpeed = '30 ft.';
      if (data.speed && typeof data.speed === 'object') {
        parsedSpeed = Object.entries(data.speed).map(([k, v]) => `${k} ${v}`).join(', ');
      } else if (data.speed) {
        parsedSpeed = String(data.speed);
      }

      setCreateHp(safeStr(data.hit_points ?? data.hp ?? '10'));
      setCreateAc(parsedAc);
      setCreateCr(safeStr(data.challenge_rating ?? data.cr ?? ''));
      setCreateSpeed(safeStr(parsedSpeed));
      setCreateStats({
        str: parseInt(data.strength ?? data.str) || 10,
        dex: parseInt(data.dexterity ?? data.dex) || 10,
        con: parseInt(data.constitution ?? data.con) || 10,
        int: parseInt(data.intelligence ?? data.int) || 10,
        wis: parseInt(data.wisdom ?? data.wis) || 10,
        cha: parseInt(data.charisma ?? data.cha) || 10,
      });

      const actionsArray = [
        ...(Array.isArray(data.actions) ? data.actions : []),
        ...(Array.isArray(data.legendary_actions) ? data.legendary_actions : []),
        ...(Array.isArray(data.reactions) ? data.reactions : [])
      ];
      const safeActions = actionsArray.map((a: any) => ({
        name: safeStr(a.name ?? ''),
        desc: safeStr(a.desc ?? a.description ?? ''),
        isAttack: !!a.isAttack,
        actionType: safeStr(a.actionType ?? 'Acción'),
        attackBonus: safeStr(a.attackBonus ?? ''),
        damageFormula: safeStr(a.damageFormula ?? ''),
        damageType: safeStr(a.damageType ?? 'cortante'),
        range: safeStr(a.range ?? '')
      }));
      setCreateAttacks(safeActions.length > 0 ? safeActions : [{ name: '', desc: '', isAttack: false, actionType: 'Acción', attackBonus: '', damageFormula: '', damageType: 'cortante', range: '' }]);
      setCreateVuln(Array.isArray(data.vulnerabilities) ? data.vulnerabilities : []);
      setCreateRes(Array.isArray(data.resistances) ? data.resistances : []);
      setCreateImm(Array.isArray(data.immunities) ? data.immunities : []);
      setCreateSize(safeStr(data.size ?? 'Mediano'));
      const traitsArray = Array.isArray(data.traits) ? data.traits : (Array.isArray(data.special_abilities) ? data.special_abilities : []);
      setCreateTraits(traitsArray.length > 0 ? traitsArray : [{ name: '', desc: '' }]);
    } else if (item.type === 'spell') {
      setCreateShortDesc(safeStr(data.short_description ?? ''));
      setCreateSpellLevel(parseInt(data.level) || 0);
      let comps = { V: false, S: false, M: false };
      if (data.components) {
        if (typeof data.components === 'object') {
          comps = {
            V: !!data.components.V,
            S: !!data.components.S,
            M: !!data.components.M
          };
        } else if (typeof data.components === 'string') {
          const s = data.components.toUpperCase();
          comps = {
            V: s.includes('V'),
            S: s.includes('S'),
            M: s.includes('M')
          };
        }
      }
      setCreateSpellComponents(comps);
      setCreateSpellRange(safeStr(data.range ?? ''));
      setCreateSpellDuration(safeStr(data.duration ?? 'instantaneo'));
      setCreateSpellConcentration(!!data.concentration);
    } else {
      setCreateRarity(safeStr(data.rarity ?? 'Común'));
      setIsDamageItem(!!data.isDamage);
      setItemAttackBonus(safeStr(data.attackBonus ?? ''));
      setItemDamageFormula(safeStr(data.damage ?? ''));
      setItemDamageType(safeStr(data.damageType ?? 'cortante'));
      setCreateTags(Array.isArray(data.tags) ? data.tags : []);
      setCreateArmorType(safeStr(data.armorType ?? 'ligera'));
      setCreateRequiresAttunement(!!data.requiresAttunement);
      setCreateWeight(safeStr(data.weight ?? ''));

      // Cargar nuevos campos avanzados para objetos
      setIsProtectItem(!!data.isProtect);
      setItemDefenseBonus(safeStr(data.defenseBonus ?? ''));
      setItemAttackName(safeStr(data.attackName ?? ''));
      setItemStatMod(safeStr(data.statMod ?? ''));
      setItemStatSelection(safeStr(data.statSelection ?? 'FUE'));
      setItemTargetsCount(safeStr(data.targetsCount ?? '1'));
      setItemCritDamage(safeStr(data.critDamage ?? ''));
    }
  };

  const filteredCompendium = useMemo(() => {
    return compendium
      .filter((item: any) => {
        const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category === 'all' || item.type === category;
        return matchesSearch && matchesCategory;
      })
      .sort((a: any, b: any) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
      });
  }, [compendium, searchTerm, category]);

  const totalPages = Math.max(1, Math.ceil(filteredCompendium.length / PAGE_SIZE));
  const pagedItems = filteredCompendium.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearchTerm(val); setCurrentPage(1); };
  const handleCategory = (val: any) => { setCategory(val); setCurrentPage(1); };


  // --- HELPERS Y WIZARDS DE CLASES ---
  
  const classesList = useMemo(() => {
    const srdList = srdDisconnected ? [] : EMERGENCY_SRD_CLASSES.map((cls: any) => ({
      ...cls,
      id: `srd-${cls.name}`,
      displaySource: 'srd',
      data: {
        description: cls.desc,
        hit_dice: cls.hit_dice,
        subclass_level: cls.subclass_level,
        subclass_title: cls.subclass_title,
        prof_saving_throws: cls.prof_saving_throws,
        prof_skills: cls.prof_skills,
        prof_armor: cls.prof_armor,
        prof_weapons: cls.prof_weapons,
        prof_tools: cls.prof_tools,
        table: cls.table,
        traits: cls.traits,
        subclasses: cls.subclasses,
      }
    }));

    const dbClasses = compendium.filter((item: any) => item.type === 'class');
    const merged: any[] = [];
    const dbClassNames = new Set(dbClasses.map((c: any) => c.name.toLowerCase()));

    srdList.forEach((srdCls: any) => {
      const isOverridden = dbClassNames.has(srdCls.name.toLowerCase());
      if (isOverridden) {
        const dbCls = dbClasses.find((c: any) => c.name.toLowerCase() === srdCls.name.toLowerCase());
        merged.push({
          ...dbCls,
          displaySource: 'modified',
        });
      } else {
        merged.push(srdCls);
      }
    });

    dbClasses.forEach((dbCls: any) => {
      const isOverriding = EMERGENCY_SRD_CLASSES.some(srd => srd.name.toLowerCase() === dbCls.name.toLowerCase());
      if (!isOverriding) {
        merged.push({
          ...dbCls,
          displaySource: 'custom',
        });
      }
    });

    return merged;
  }, [compendium, srdDisconnected]);

  const allMergedFeatures = useMemo(() => {
    const merged: any[] = [];
    const seenKeys = new Set<string>();

    // 1. Add DB features
    classFeatures.forEach((f: any) => {
      const key = `${f.class.toLowerCase()}-${f.name.toLowerCase()}`;
      merged.push(f);
      seenKeys.add(key);
    });

    // 2. Add EMERGENCY_SRD_CLASSES traits
    EMERGENCY_SRD_CLASSES.forEach((cls: any) => {
      if (cls.traits) {
        cls.traits.forEach((t: any) => {
          const key = `${cls.name.toLowerCase()}-${t.name.toLowerCase()}`;
          if (!seenKeys.has(key)) {
            merged.push({
              id: `srd-${cls.name}-${t.name}`,
              name: t.name,
              class: cls.name,
              level: t.level,
              description: t.desc || t.description,
              source: 'srd'
            });
            seenKeys.add(key);
          }
        });
      }
    });

    // 3. Add custom classes traits from compendium
    compendium.filter((item: any) => item.type === 'class').forEach((cls: any) => {
      let cData: any = {};
      try {
        cData = cls.data ? (typeof cls.data === 'string' ? JSON.parse(cls.data) : cls.data) : {};
      } catch { cData = {}; }
      if (cData.traits) {
        cData.traits.forEach((t: any) => {
          const key = `${cls.name.toLowerCase()}-${t.name.toLowerCase()}`;
          if (!seenKeys.has(key)) {
            merged.push({
              id: `compendium-${cls.id}-${t.name}`,
              name: t.name,
              class: cls.name,
              level: t.level,
              description: t.desc || t.description,
              source: 'custom'
            });
            seenKeys.add(key);
          }
        });
      }
    });

    // 4. Add custom subclasses traits from compendium
    compendium.filter((item: any) => item.type === 'subclass').forEach((sub: any) => {
      let sData: any = {};
      try {
        sData = sub.data ? (typeof sub.data === 'string' ? JSON.parse(sub.data) : sub.data) : {};
      } catch { sData = {}; }
      if (sData.traits) {
        sData.traits.forEach((t: any) => {
          const key = `${sub.name.toLowerCase()}-${t.name.toLowerCase()}`;
          if (!seenKeys.has(key)) {
            merged.push({
              id: `subclass-${sub.id}-${t.name}`,
              name: t.name,
              class: sData.class_parent || 'Desconocida',
              subclass: sub.name,
              level: t.level,
              description: t.desc || t.description,
              source: 'custom'
            });
            seenKeys.add(key);
          }
        });
      }
    });

    return merged;
  }, [compendium, classFeatures]);

  const handleImportSRD = async () => {
    setIsImportingClasses(true);
    setTimeout(() => {
      setSrdDisconnected(false);
      setIsImportingClasses(false);
    }, 1000);
  };

  const handleEditClassClick = (cls: any) => {
    let cData: any = {};
    try {
      cData = cls.data ? (typeof cls.data === 'string' ? JSON.parse(cls.data) : cls.data) : {};
    } catch { cData = {}; }

    setEditingClassId(cls.id);
    setCName(cls.name || '');
    setCDesc(cData.desc || cData.description || '');
    setCHitDie(cData.hit_dice || 'd8');
    setCSubclassLvl(cData.subclass_level || 3);
    setCSubclassTitle(cData.subclass_title || 'Arquetipo');

    const parseStrArray = (val: any) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') return val.split(',').map((s: string) => s.trim()).filter(Boolean);
      return [];
    };

    setCArmors(parseStrArray(cData.prof_armor));
    setCWeapons(parseStrArray(cData.prof_weapons));
    setCTools(cData.prof_tools || '');
    setCSaves(parseStrArray(cData.prof_saving_throws));
    setCSkills(parseStrArray(cData.prof_skills));
    setCSkillsLimit(cData.skills_limit || 2);
    setCResourceName(cData.resource_name || '');
    setCResourceProg(cData.resource_progression || Array(20).fill(''));
    // setCTraits(cData.traits || []);

    setClassWizardStep(1);
    setIsCreatingClass!(true);
  };

  const generateTableMarkdown = (resourceName: string, resourceProg: string[], traitsList: any[]) => {
    let headers = ['Nivel', 'Bono de Competencia', 'Rasgos'];
    if (resourceName) {
      headers.push(resourceName);
    }
    
    let headerLine = `| ${headers.join(' | ')} |`;
    let dividerLine = `| ${headers.map(() => '---').join(' | ')} |`;
    
    let rows: string[] = [];
    for (let lvl = 1; lvl <= 20; lvl++) {
      const profBonus = `+${1 + Math.ceil(lvl / 4)}`;
      const lvlTraits = traitsList
        .filter((t: any) => parseInt(t.level) === lvl)
        .map((t: any) => t.name)
        .join(', ');
        
      let cells = [
        `${lvl}º`,
        profBonus,
        lvlTraits || 'Mejora de Característica'
      ];
      
      if (resourceName) {
        cells.push(resourceProg[lvl - 1] || '—');
      }
      
      rows.push(`| ${cells.join(' | ')} |`);
    }
    
    return [headerLine, dividerLine, ...rows].join('\n');
  };

  const getValidSubclassLevels = (clsName: string, activeData: any) => {
    const name = clsName?.toLowerCase() || '';
    if (name.includes('guerrero') || name.includes('fighter')) return [3, 7, 10, 15, 18];
    if (name.includes('pícaro') || name.includes('rogue')) return [3, 9, 13, 17];
    if (name.includes('mago') || name.includes('wizard')) return [2, 6, 10, 14];
    if (name.includes('clérigo') || name.includes('cleric')) return [1, 2, 6, 8, 17];
    if (name.includes('paladín') || name.includes('paladin')) return [3, 7, 15, 20];
    if (name.includes('bardo') || name.includes('bard')) return [3, 6, 14];
    if (name.includes('druida') || name.includes('druid')) return [2, 6, 10, 14];
    if (name.includes('monje') || name.includes('monk')) return [3, 6, 11, 17];
    if (name.includes('explorador') || name.includes('ranger')) return [3, 7, 11, 15];
    if (name.includes('hechicero') || name.includes('sorcerer')) return [1, 6, 14, 18];
    if (name.includes('warlock') || name.includes('brujo')) return [1, 6, 10, 14];
    if (name.includes('bárbaro') || name.includes('barbarian')) return [3, 6, 10, 14];
    
    const first = activeData?.subclass_level || 3;
    return [first, first + 4, first + 7, first + 12].filter((l: number) => l <= 20);
  };

  ;

  ;

  const renderFeatureCrudModal = () => {
    if (!isEditingFeature) return null;

    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 99999, overflowY: 'auto', padding: '40px 0'
      }} onClick={() => setIsEditingFeature(false)}>
        <div className="clipped-frame" style={{
          background: 'var(--bg-surface)', border: '2px solid var(--border-color)',
          width: '90%', maxWidth: '600px', padding: '25px', position: 'relative', maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 25px 80px rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', gap: '30px'
        }} onClick={e => e.stopPropagation()}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
            <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.8rem' }}>
              {featureFormId ? 'FORJAR RASGO MODIFICADO' : 'REGISTRAR NUEVO RASGO'}
            </h2>
            <button onClick={() => setIsEditingFeature(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.8rem', cursor: 'pointer' }}>✕</button>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>Nombre del Rasgo</label>
              <input 
                className="mono font-cinzel" 
                style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none', fontSize: '1.1rem' }} 
                placeholder="Ej: Furia, Acción en Oleada..." 
                value={featureFormName} 
                onChange={e => setFeatureFormName(e.target.value)} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              <div>
                <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>Clase Perteneciente</label>
                <input 
                  className="mono font-cinzel" 
                  style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }} 
                  placeholder="Ej: Guerrero, Bárbaro, Mago..." 
                  value={featureFormClass} 
                  onChange={e => setFeatureFormClass(e.target.value)} 
                />
              </div>

              <div>
                <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>Nivel de Obtención</label>
                <select 
                  className="mono" 
                  style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }} 
                  value={featureFormLevel} 
                  onChange={e => setFeatureFormLevel(parseInt(e.target.value) || 1)}
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map(lvl => (
                    <option key={lvl} value={lvl}>Nivel {lvl}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>Descripción Corta (se muestra al pasar el cursor)</label>
              <input 
                className="mono" 
                style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }} 
                placeholder="Ej: Adoptas un estilo de combate particular como tu especialidad ( CA +1, Duelista +2...)." 
                value={featureFormShortDesc} 
                onChange={e => setFeatureFormShortDesc(e.target.value)} 
              />
            </div>

            <div>
              <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>Descripción de la Habilidad</label>
              <textarea 
                className="mono" 
                style={{ width: '100%', height: '180px', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none', resize: 'none', lineHeight: '1.6' }} 
                placeholder="Escribe la descripción completa del rasgo de clase y sus efectos..." 
                value={featureFormDesc} 
                onChange={e => setFeatureFormDesc(e.target.value)} 
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <button onClick={() => setIsEditingFeature(false)} className="font-cinzel" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', padding: '10px 20px', cursor: 'pointer' }}>CANCELAR</button>
            <button onClick={handleSaveFeature} className="font-cinzel torch-glow" style={{ background: 'var(--accent-gold)', border: 'none', color: 'white', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold' }}>
              {featureFormId ? 'GUARDAR CAMBIOS' : 'FORJAR RASGO'}
            </button>
          </div>
        </div>
      </div>
    );
  };



  // When used as overlay, we only need the fixed-position detail modal.
  // The main layout must NOT render with display:none because position:fixed
  // children are clipped by it.
  if (isOverlay) {
    if (!selectedItem) return null;
    // Render just the detail panel trigger — the IIFE below will handle it
  }

  return (
    <div style={{ width: '100%', height: isOverlay ? 0 : 'var(--db-view-height, calc(100vh - 120px))', background: 'var(--bg-base)', display: 'flex', overflow: isOverlay ? 'visible' : 'hidden' }}>
      {/* SIDEBAR DE CATEGORÍAS */}
      <div style={{ width: 'var(--sidebar-width)', background: 'var(--bg-surface)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', padding: 'var(--sidebar-padding)' }}>
        <div style={{ padding: '0 20px', marginBottom: 'var(--sidebar-header-margin)' }}>
          <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: 'var(--sidebar-header-size)', letterSpacing: '2px' }}>BIBLIOTECA</h2>
          <div style={{ width: '40px', height: '2px', background: 'var(--accent-gold)', marginTop: '10px' }} />
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--sidebar-btn-gap)', overflowY: 'auto' }} className="custom-scrollbar">
          {['all', 'monster', 'spell', 'item', 'class', 'subclass', 'race', 'subrace', 'condition', 'features'].map(cat => (
            <button
              key={cat}
              onClick={() => handleCategory(cat as any)}
              className="font-cinzel torch-glow"
              style={{
                textAlign: 'left',
                padding: 'var(--sidebar-btn-padding)',
                background: category === cat ? 'rgba(200, 135, 42, 0.1)' : 'transparent',
                color: category === cat ? 'var(--accent-gold)' : 'var(--text-secondary)',
                border: 'none',
                borderLeft: category === cat ? '3px solid var(--accent-gold)' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: 'var(--sidebar-btn-size)',
                transition: 'all 0.2s'
              }}
            >
              {cat === 'all' ? 'Ver Todo' : typeIcons[cat]}
            </button>
          ))}
        </div>

        {(userRole === 'admin' || userRole === 'dm') && (() => {
          let btnText = '+ NUEVO';
          let btnAction = () => {
            resetForm();
            setIsCreating(true);
          };

          if (category === 'monster') {
            btnText = '+ NUEVO MONSTRUO';
            btnAction = () => {
              resetForm();
              setCreateType('monster');
              setIsCreating(true);
            };
          } else if (category === 'item') {
            btnText = '+ NUEVO OBJETO';
            btnAction = () => {
              resetForm();
              setCreateType('item');
              setIsCreating(true);
            };
          } else if (category === 'features') {
            btnText = '+ NUEVO RASGO';
            btnAction = () => {
              openCreateFeatureForm();
            };
          } else if (category === 'class') {
            btnText = '+ NUEVA CLASE';
            btnAction = () => {
              setEditingClassId(null);
              setCName('');
              setCDesc('');
              setCHitDie('d8');
              setCSubclassLvl(3);
              setCSubclassTitle('Arquetipo');
              setCArmors([]);
              setCWeapons([]);
              setCTools('');
              setCSaves([]);
              setCSkills([]);
              setCSkillsLimit(2);
              setCResourceName('');
              setCResourceProg('');
              // setCTraits([]);
              setClassWizardStep(1);
              setIsCreatingClass!(true);
            };
          } else if (category === 'spell') {
            btnText = '+ NUEVO HECHIZO';
            btnAction = () => {
              resetForm();
              setCreateType('spell');
              setIsCreating(true);
            };
          } else if (category === 'subclass') {
            btnText = '+ NUEVA SUBCLASE';
            btnAction = () => alert('La creación de subclases por separado no está disponible por ahora. Puedes añadir subclases editando una clase base.');
          } else if (category === 'race') {
            btnText = '+ NUEVA RAZA';
            btnAction = () => alert('La creación de razas personalizadas estará disponible próximamente.');
          } else if (category === 'subrace') {
            btnText = '+ NUEVA SUBRAZA';
            btnAction = () => alert('La creación de subrazas personalizadas estará disponible próximamente.');
          } else if (category === 'condition') {
            btnText = '+ NUEVO ESTADO';
            btnAction = () => alert('La creación de estados y condiciones personalizados estará disponible próximamente.');
          } else if (category === 'all') {
            btnText = '+ NUEVO REGISTRO';
            btnAction = () => alert('Por favor, selecciona una categoría específica (ej. Monstruos, Clases, Rasgos) en el menú lateral para crear un nuevo registro.');
          }

          const isPlaceholder = ['subclass', 'race', 'subrace', 'condition', 'all'].includes(category);

          return (
            <div style={{ padding: '0 20px', marginTop: 'var(--sidebar-create-margin)' }}>
              <button
                onClick={btnAction}
                className="font-cinzel torch-glow"
                style={{ 
                  width: '100%', 
                  background: isPlaceholder ? 'rgba(255,255,255,0.03)' : 'var(--accent-gold)', 
                  color: isPlaceholder ? 'var(--text-secondary)' : 'white', 
                  border: isPlaceholder ? '1px solid var(--border-color)' : 'none', 
                  padding: 'var(--sidebar-create-padding)', 
                  borderRadius: '4px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer', 
                  fontSize: 'var(--sidebar-create-size)',
                  opacity: isPlaceholder ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (isPlaceholder) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isPlaceholder) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }
                }}
              >
                {btnText}
              </button>
            </div>
          );
        })()}
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--compendium-content-padding)', position: 'relative' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--compendium-header-margin)', borderBottom: '2px solid var(--border-color)', paddingBottom: '20px' }}>
            <div>
              <h1 className="font-cinzel" style={{ margin: 0, color: 'var(--text-parchment)', fontSize: 'var(--compendium-title-size)', fontWeight: '900' }}>Compendio</h1>
              <p style={{ color: 'var(--text-secondary)', margin: '10px 0 0 0', textTransform: 'uppercase', letterSpacing: '2px', fontSize: 'var(--compendium-subtitle-size)' }}>Registros oficiales del reino</p>
            </div>
            <div style={{ width: 'var(--compendium-search-width)' }}>
              <input 
                className="mono clipped-frame"
                style={{ width: '100%', padding: 'var(--compendium-search-padding)', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }}
                placeholder="Buscar pergamino..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

              {category === 'class' ? (() => {
                const activeClass = selectedClass || classesList[0];
                let activeData: any = {};
                if (activeClass) {
                  try {
                    activeData = activeClass.data ? (typeof activeClass.data === 'string' ? JSON.parse(activeClass.data) : activeClass.data) : {};
                  } catch { activeData = {}; }
                }

                if (classesList.length === 0) {
                  return (
                    <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', background: 'var(--bg-base)' }}>
                      <div className="clipped-frame torch-glow" style={{
                        background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                        padding: '50px', textAlign: 'center', maxWidth: '600px',
                        boxShadow: '0 25px 80px rgba(0,0,0,0.6)'
                      }}>
                        <div style={{ fontSize: '4.5rem', marginBottom: '20px', filter: 'drop-shadow(0 0 10px var(--accent-gold))' }}>🛡️</div>
                        <h2 className="font-cinzel" style={{ margin: '0 0 15px 0', color: 'var(--text-parchment)', fontSize: '2rem' }}>El Compendio de Clases está Vacío</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '35px' }}>
                          No se han registrado clases en la biblioteca. Conecta el archivo SRD oficial para descargar las clases básicas o forja tu propia clase personalizada ahora mismo.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                          <button
                            onClick={handleImportSRD}
                            disabled={isImportingClasses}
                            className="font-cinzel torch-glow"
                            style={{
                              background: 'var(--accent-gold)', border: 'none', color: 'white',
                              padding: '12px 25px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px'
                            }}
                          >
                            {isImportingClasses ? 'CONECTANDO SRD...' : 'CONECTAR ARCHIVO SRD'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingClassId(null);
                              setCName(''); setCDesc(''); setCHitDie('d8'); setCSubclassLvl(3); setCSubclassTitle('Arquetipo');
                              setCArmors([]); setCWeapons([]); setCTools(''); setCSaves([]); setCSkills([]); setCSkillsLimit(2);
                              setCResourceName(''); setCResourceProg(''); // setCTraits([]);
                              setClassWizardStep(1);
                              setIsCreatingClass!(true);
                            }}
                            className="font-cinzel"
                            style={{
                              background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-parchment)',
                              padding: '12px 25px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px'
                            }}
                          >
                            CREAR CLASE
                          </button>
                        </div>
                      </div>
                      {isCreatingClass && <ClassWizardModal formState={formState} editingClassId={editingClassId} socket={socket} />}
                    </div>
                  );
                }

                const filteredClasses = classesList.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()));

                return (
                  <div style={{ flex: 1, display: 'flex', height: '100%', overflow: 'hidden' }}>
                    <div style={{ width: '320px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.15)' }}>
                      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
                        <input
                          className="mono"
                          style={{ width: '100%', padding: '10px 15px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }}
                          placeholder="Buscar clase..."
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                        {filteredClasses.map(cls => {
                          const isActive = activeClass && activeClass.id === cls.id;
                          let cData: any = {};
                          try {
                            cData = cls.data ? (typeof cls.data === 'string' ? JSON.parse(cls.data) : cls.data) : {};
                          } catch { cData = {}; }
                          
                          return (
                            <div
                              key={cls.id}
                              className={`clipped-frame ${isActive ? 'torch-glow' : ''}`}
                              onClick={() => setSelectedClass(cls)}
                              style={{
                                padding: '15px 20px', marginBottom: '12px', cursor: 'pointer',
                                background: isActive ? 'rgba(200, 135, 42, 0.1)' : 'var(--bg-surface)',
                                border: `1px solid ${isActive ? 'var(--accent-gold)' : 'var(--border-color)'}`,
                                transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                              }}
                            >
                              <div>
                                <h4 className="font-cinzel" style={{ margin: 0, color: isActive ? 'var(--accent-gold)' : 'var(--text-parchment)', fontSize: '1.05rem' }}>{cls.name}</h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dado de Golpe: {cData.hit_dice || 'd8'}</span>
                              </div>
                              {cls.displaySource === 'srd' && <span className="font-cinzel" style={{ border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', fontSize: '0.6rem', padding: '2px 6px', fontWeight: 'bold' }}>SRD</span>}
                              {cls.displaySource === 'custom' && <span className="font-cinzel" style={{ border: '1px solid #10b981', color: '#10b981', fontSize: '0.6rem', padding: '2px 6px', fontWeight: 'bold' }}>CUSTOM</span>}
                              {cls.displaySource === 'modified' && <span className="font-cinzel" style={{ border: '1px solid #f97316', color: '#f97316', fontSize: '0.6rem', padding: '2px 6px', fontWeight: 'bold' }}>MODIFICADO</span>}
                            </div>
                          );
                        })}
                      </div>

                      {(userRole === 'admin' || userRole === 'dm') && (
                        <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
                          <button
                            className="font-cinzel torch-glow"
                            onClick={() => {
                              setEditingClassId(null);
                              setCName(''); setCDesc(''); setCHitDie('d8'); setCSubclassLvl(3); setCSubclassTitle('Arquetipo');
                              setCArmors([]); setCWeapons([]); setCTools(''); setCSaves([]); setCSkills([]); setCSkillsLimit(2);
                              setCResourceName(''); setCResourceProg(''); // setCTraits([]);
                              setClassWizardStep(1);
                              setIsCreatingClass!(true);
                            }}
                            style={{ width: '100%', padding: '12px', background: 'var(--accent-gold)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px' }}
                          >
                            + NUEVA CLASE
                          </button>
                        </div>
                      )}
                    </div>

                    {activeClass ? (
                      <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-color)', paddingBottom: '20px', marginBottom: '30px' }}>
                          <div>
                            <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '2.5rem' }}>{activeClass.name}</h2>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '8px' }}>
                              <span className="mono" style={{ color: 'var(--text-secondary)' }}>Dado de Golpe: {activeData.hit_dice ? activeData.hit_dice : <span style={{ color: '#f97316' }}>[DATO FALTANTE: hit_dice]</span>}</span>
                              <span style={{ color: 'var(--text-secondary)' }}>•</span>
                              <span className="mono" style={{ color: 'var(--text-secondary)' }}>Subclase al nivel {activeData.subclass_level || 3} ({activeData.subclass_title || 'Subclase'})</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '10px' }}>
                            {(userRole === 'admin' || userRole === 'dm') && (
                              <>
                                <button
                                  className="font-cinzel"
                                  onClick={() => {
                                    setSubclassName(''); setSubclassDesc(''); setSubclassTraits([]);
                                    setIsAddingSubclass(true);
                                  }}
                                  style={{ background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}
                                >
                                  + NUEVA SUBCLASE
                                </button>
                                <>
                                  <button
                                    className="font-cinzel"
                                    onClick={() => handleEditClassClick(activeClass)}
                                    style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}
                                  >
                                    EDITAR
                                  </button>
                                  {!String(activeClass.id).startsWith('srd-') && (
                                    <button
                                      onClick={() => { if (confirm(`¿Eliminar la clase ${activeClass.name}?`)) socket.emit('content:delete', activeClass.id); }}
                                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--combat-red)', color: 'var(--combat-red)', padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}
                                    >
                                      ELIMINAR
                                    </button>
                                  )}
                                </>
                              </>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                          <section>
                            <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}><Scroll className="w-5 h-5 inline-block mr-2" /> Lore y Descripción</h3>
                            <p 
                              style={{ color: 'var(--text-parchment)', lineHeight: '1.8', fontSize: '1rem' }}
                              dangerouslySetInnerHTML={{ __html: formatDescription(activeData.desc || activeData.description || '[DATO FALTANTE: description]') }}
                            />
                          </section>

                          <section>
                            <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '15px' }}>🛡️ Competencias Iniciales</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', border: '1px solid var(--border-color)' }}>
                                <div style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px' }}>Salvaciones y Habilidades</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-parchment)' }}>
                                  <div><b>Tiradas de Salvación:</b> {activeData.prof_saving_throws ? activeData.prof_saving_throws : <span style={{ color: '#f97316' }}>[DATO FALTANTE: prof_saving_throws]</span>}</div>
                                  <div><b>Habilidades:</b> {activeData.prof_skills ? activeData.prof_skills : <span style={{ color: '#f97316' }}>[DATO FALTANTE: prof_skills]</span>}</div>
                                </div>
                              </div>
                              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', border: '1px solid var(--border-color)' }}>
                                <div style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px' }}>Equipo y Herramientas</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-parchment)' }}>
                                  <div><b>Armaduras:</b> {activeData.prof_armor ? activeData.prof_armor : <span style={{ color: '#f97316' }}>[DATO FALTANTE: prof_armor]</span>}</div>
                                  <div><b>Armas:</b> {activeData.prof_weapons ? activeData.prof_weapons : <span style={{ color: '#f97316' }}>[DATO FALTANTE: prof_weapons]</span>}</div>
                                  <div><b>Herramientas:</b> {activeData.prof_tools ? activeData.prof_tools : <span style={{ color: '#f97316' }}>[DATO FALTANTE: prof_tools]</span>}</div>
                                </div>
                              </div>
                            </div>
                          </section>

                          <section>
                            <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '15px' }}><BarChart className="w-5 h-5 inline-block mr-2" /> Tabla de Progresión (Nivel 1-20)</h3>
                            {(() => {
                              const getTraitsForLevel = (lvl: number) => {
                                const merged: { name: string; desc: string; shortDesc?: string }[] = [];
                                const seen = new Set<string>();

                                // 1. Gather from local activeData.traits
                                if (activeData && activeData.traits) {
                                  activeData.traits.forEach((t: any) => {
                                    if (parseInt(t.level) === lvl) {
                                      const norm = cleanNameForMatching(t.name);
                                      if (!seen.has(norm)) {
                                        seen.add(norm);
                                        merged.push({
                                          name: t.name,
                                          desc: t.desc || t.description,
                                          shortDesc: t.short_description || ''
                                        });
                                      }
                                    }
                                  });
                                }

                                // 2. Gather from global classFeatures
                                if (classFeatures) {
                                  classFeatures.forEach((f: any) => {
                                    const isSameClass = f.class && activeClass && cleanNameForMatching(f.class) === cleanNameForMatching(activeClass.name);
                                    if (isSameClass && parseInt(f.level) === lvl) {
                                      const norm = cleanNameForMatching(f.name);
                                      if (!seen.has(norm)) {
                                        seen.add(norm);
                                        merged.push({
                                          name: f.name,
                                          desc: f.description,
                                          shortDesc: f.short_description || ''
                                        });
                                      }
                                    }
                                  });
                                }

                                return merged;
                              };

                              const resourceName = activeData.resource_name;
                              const resourceProg = activeData.resource_progression || [];
                              const isGuerrero = activeClass && (activeClass.name.toLowerCase() === 'guerrero' || activeClass.name.toLowerCase() === 'fighter');
                              
                              return (
                                <div style={{ width: '100%', overflowX: 'auto', border: '1px solid var(--border-color)' }}>
                                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                    <thead>
                                      <tr style={{ background: 'var(--bg-surface)', borderBottom: '2px solid var(--border-color)' }}>
                                        <th className="font-cinzel" style={{ padding: '12px 15px', color: 'var(--accent-gold)', borderRight: '1px solid var(--border-color)' }}>Nivel</th>
                                        <th className="font-cinzel" style={{ padding: '12px 15px', color: 'var(--accent-gold)', borderRight: '1px solid var(--border-color)' }}>Bono de Competencia</th>
                                        {isGuerrero && (
                                          <th className="font-cinzel" style={{ padding: '12px 15px', color: 'var(--accent-gold)', borderRight: '1px solid var(--border-color)' }}>Ataques Extra</th>
                                        )}
                                        <th className="font-cinzel" style={{ padding: '12px 15px', color: 'var(--accent-gold)', borderRight: '1px solid var(--border-color)' }}>Rasgos</th>
                                        {resourceName && (
                                          <th className="font-cinzel" style={{ padding: '12px 15px', color: 'var(--accent-gold)', borderRight: '1px solid var(--border-color)' }}>{resourceName}</th>
                                        )}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {Array.from({ length: 20 }, (_, i) => {
                                        const lvl = i + 1;
                                        const profBonus = `+${1 + Math.ceil(lvl / 4)}`;
                                        const traits = getTraitsForLevel(lvl);
                                        
                                        let extraAttacks = '—';
                                        if (lvl >= 5 && lvl < 11) extraAttacks = '1 extra (2 ataques)';
                                        else if (lvl >= 11 && lvl < 20) extraAttacks = '2 extra (3 ataques)';
                                        else if (lvl === 20) extraAttacks = '3 extra (4 ataques)';
                                        
                                        return (
                                          <tr key={lvl} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '10px 15px', color: 'var(--text-parchment)', borderRight: '1px solid var(--border-color)', fontWeight: 'bold' }}>{lvl}º</td>
                                            <td style={{ padding: '10px 15px', color: 'var(--text-parchment)', borderRight: '1px solid var(--border-color)' }}>{profBonus}</td>
                                            {isGuerrero && (
                                              <td style={{ padding: '10px 15px', color: 'var(--text-parchment)', borderRight: '1px solid var(--border-color)' }}>
                                                {extraAttacks}
                                              </td>
                                            )}
                                            <td style={{ padding: '10px 15px', color: 'var(--text-parchment)', borderRight: '1px solid var(--border-color)', position: 'relative' }}>
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                                {traits.length > 0 ? (
                                                  traits.map((t: any, tIdx: number) => (
                                                    <FeatureTooltip 
                                                      key={tIdx} 
                                                      featureName={t.name} 
                                                      description={t.desc} 
                                                      shortDescription={t.shortDesc} 
                                                    />
                                                  ))
                                                ) : (
                                                  <span style={{ padding: '4px 8px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>—</span>
                                                )}
                                              </div>
                                            </td>
                                            {resourceName && (
                                              <td style={{ padding: '10px 15px', color: 'var(--text-parchment)', borderRight: '1px solid var(--border-color)' }}>
                                                {resourceProg[lvl - 1] || '—'}
                                              </td>
                                            )}
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              );
                            })()}
                          </section>

                          <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '30px' }}>
                            <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.4rem', marginBottom: '20px' }}><BookOpen className="w-5 h-5 inline-block mr-2" /> Subclases disponibles</h3>
                            {(() => {
                              const apiSubclasses = activeData.subclasses || [];
                              const customSubclasses = compendium.filter((item: any) => {
                                if (item.type !== 'subclass') return false;
                                let sData: any = {};
                                try { sData = item.data ? (typeof item.data === 'string' ? JSON.parse(item.data) : item.data) : {}; } catch { sData = {}; }
                                return sData.class_parent?.toLowerCase() === activeClass.name?.toLowerCase();
                              }).map((item: any) => {
                                let sData: any = {};
                                try { sData = item.data ? (typeof item.data === 'string' ? JSON.parse(item.data) : item.data) : {}; } catch { sData = {}; }
                                return { id: item.id, name: item.name, desc: sData.description || sData.desc || '', traits: sData.traits || [], isCustom: true };
                              });
                              const allSubs = [...apiSubclasses, ...customSubclasses];
                              if (allSubs.length === 0) return <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>No hay subclases asociadas a esta clase. ¡Crea una ahora!</div>;
                              return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                  {allSubs.map((sub, sIdx) => {
                                    const isExpanded = expandedTraits[`sub-${sIdx}`];
                                    return (
                                      <div key={sIdx} className="clipped-frame" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
                                        <div onClick={() => setExpandedTraits({ ...expandedTraits, [`sub-${sIdx}`]: !isExpanded })} style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}>
                                          <div>
                                            <h4 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.2rem' }}>
                                              {sub.name}{' '}
                                              {sub.isCustom ? <span style={{ border: '1px solid #10b981', color: '#10b981', fontSize: '0.55rem', padding: '2px 4px', marginLeft: '10px', verticalAlign: 'middle' }}>CUSTOM</span> : <span style={{ border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', fontSize: '0.55rem', padding: '2px 4px', marginLeft: '10px', verticalAlign: 'middle' }}>SRD</span>}
                                            </h4>
                                          </div>
                                          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                            {sub.isCustom && (userRole === 'admin' || userRole === 'dm') && (
                                              <button onClick={e => { e.stopPropagation(); if (confirm(`¿Eliminar la subclase ${sub.name}?`)) socket.emit('content:delete', sub.id); }} style={{ background: 'transparent', border: 'none', color: 'var(--combat-red)', cursor: 'pointer', fontSize: '1rem' }}>🗑️</button>
                                            )}
                                            <span style={{ color: 'var(--accent-gold)', fontSize: '1.2rem' }}>{isExpanded ? '▴' : '▾'}</span>
                                          </div>
                                        </div>
                                        {isExpanded && (
                                          <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.15)' }}>
                                            <p style={{ margin: '0 0 20px 0', color: 'var(--text-parchment)', lineHeight: '1.6', fontSize: '0.95rem' }}>{sub.desc || sub.description}</p>
                                            {sub.traits && sub.traits.length > 0 && (
                                              <div>
                                                <div style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px', marginBottom: '10px' }}>Rasgos de Subclase</div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                  {sub.traits.map((st: any, stIdx: number) => (
                                                    <div key={stIdx}><span className="font-cinzel" style={{ fontWeight: 'bold', color: 'var(--text-parchment)', fontSize: '0.9rem' }}>Nivel {st.level} — {st.name}:</span>{' '}<span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>{st.desc || st.description}</span></div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </section>
                        </div>
                      </div>
                    ) : (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Selecciona una clase del compendio para ver su detalle</div>
                    )}
                    {isCreatingClass && <ClassWizardModal formState={formState} editingClassId={editingClassId} socket={socket} />}
                    {isAddingSubclass && <SubclassModal formState={formState} parentClass={activeClass} socket={socket} />}
                  </div>
                );
              })() : category === 'features' ? (() => {

                // Filter features
                const filteredFeatures = allMergedFeatures.filter((f: any) => {
                  const matchesSearch = f.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                        f.description?.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesClass = selectedFeatureClass === 'all' || f.class?.toLowerCase() === selectedFeatureClass.toLowerCase();
                  const matchesLevel = selectedFeatureLevel === 'all' || parseInt(f.level) === parseInt(selectedFeatureLevel);
                  return matchesSearch && matchesClass && matchesLevel;
                });

                // Class list for filter dropdown
                const uniqueClasses = Array.from(new Set(allMergedFeatures.map((f: any) => f.class))).sort();

                // Pagination logic for features (24 at a time)
                const totalFeaturePages = Math.max(1, Math.ceil(filteredFeatures.length / PAGE_SIZE));
                const pagedFeatures = filteredFeatures.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* FILTROS INTERNOS DE RASGOS */}
                    <div style={{ display: 'flex', gap: '20px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '20px', alignItems: 'center' }} className="clipped-frame">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                        <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', letterSpacing: '1px' }}>FILTRAR POR CLASE</label>
                        <select 
                          className="mono" 
                          style={{ width: '100%', padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }}
                          value={selectedFeatureClass}
                          onChange={e => { setSelectedFeatureClass(e.target.value); setCurrentPage(1); }}
                        >
                          <option value="all">Todas las Clases</option>
                          {uniqueClasses.map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '180px' }}>
                        <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', letterSpacing: '1px' }}>FILTRAR POR NIVEL</label>
                        <select 
                          className="mono" 
                          style={{ width: '100%', padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }}
                          value={selectedFeatureLevel}
                          onChange={e => { setSelectedFeatureLevel(e.target.value); setCurrentPage(1); }}
                        >
                          <option value="all">Todos los niveles</option>
                          {Array.from({ length: 20 }, (_, i) => i + 1).map(lvl => (
                            <option key={lvl} value={lvl}>Nivel {lvl}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* LISTA / GRILLA DE TARJETAS */}
                    {loadingFeatures ? (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--accent-gold)', fontSize: '1.2rem' }}>
                        Cargando rasgos...
                      </div>
                    ) : filteredFeatures.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '50px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }} className="clipped-frame">
                        No se encontraron rasgos con los filtros actuales.
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
                          {pagedFeatures.map((feat: any, idx: number) => {
                            const isHovered = hoveredCardId === (feat.id || idx.toString());
                            return (
                              <div 
                                key={feat.id || idx} 
                                className="clipped-frame torch-glow" 
                                onClick={() => setSelectedFeature(feat)}
                                onMouseEnter={() => setHoveredCardId(feat.id || idx.toString())}
                                onMouseLeave={() => setHoveredCardId(null)}
                                style={{ 
                                  background: 'var(--bg-surface)', 
                                  border: '1px solid var(--border-color)', 
                                  padding: '25px', 
                                  cursor: 'pointer', 
                                  transition: 'all 0.3s ease',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '15px',
                                  position: 'relative',
                                  minHeight: '190px',
                                  overflow: 'hidden'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span className="font-cinzel" style={{ border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', fontSize: '0.65rem', padding: '3px 8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                    {feat.class}{feat.subclass ? `: ${feat.subclass}` : ''}
                                  </span>
                                  
                                  <span className="mono" style={{ 
                                    background: 'rgba(200, 135, 42, 0.1)', 
                                    border: '1px solid rgba(200, 135, 42, 0.3)', 
                                    color: 'var(--accent-gold)',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold'
                                  }} title={`Nivel ${feat.level}`}>
                                    {feat.level}
                                  </span>
                                </div>

                                <div>
                                  <h3 className="font-cinzel" style={{ margin: '5px 0 0 0', color: 'var(--text-parchment)', fontSize: '1.25rem' }}>{feat.name}</h3>
                                </div>

                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <div style={{ width: '60px', height: '1px', background: 'var(--border-color)' }} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', letterSpacing: '1px' }}>
                                    <span>HAZ CLIC PARA DETALLES</span> <span>🡒</span>
                                  </div>
                                </div>

                                {/* HOVER OVERLAY FOR SHORT DESCRIPTION */}
                                <div 
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    background: 'rgba(16, 12, 8, 0.98)',
                                    border: '1px solid var(--accent-gold)',
                                    padding: '25px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    opacity: isHovered ? 1 : 0,
                                    transition: 'opacity 0.2s ease',
                                    pointerEvents: 'none',
                                    zIndex: 2
                                  }}
                                >
                                  <div className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.7rem', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}><Zap className="w-3 h-3 inline-block mr-1" /> RESUMEN</div>
                                  <p style={{
                                    margin: 0,
                                    color: 'var(--text-parchment)',
                                    fontSize: '0.85rem',
                                    lineHeight: '1.6',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 4,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    fontFamily: 'var(--font-body)'
                                  }}>
                                    {feat.short_description || (feat.description ? (feat.description.slice(0, 110) + (feat.description.length > 110 ? '...' : '')) : 'Sin resumen.')}
                                  </p>
                                </div>

                                {/* EDIT/DELETE ACTIONS (rendered on top of hover overlay if user is admin) */}
                                {(userRole === 'admin' || userRole === 'dm') && (
                                  <div 
                                    style={{ 
                                      position: 'absolute', 
                                      bottom: '15px', 
                                      left: '25px', 
                                      right: '25px', 
                                      display: isHovered ? 'flex' : 'none', 
                                      gap: '15px', 
                                      zIndex: 3 
                                    }}
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); openEditFeatureForm(feat); }} 
                                      className="font-cinzel" 
                                      style={{ flex: 1, background: 'rgba(200, 135, 42, 0.1)', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)', padding: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                                    >
                                      EDITAR
                                    </button>
                                    {feat.id && !isNaN(Number(feat.id)) ? (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteFeature(feat.id); }} 
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--combat-red)', border: '1px solid var(--combat-red)', padding: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
                                      >
                                        🗑️
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); alert("Los rasgos nativos o integrados del sistema no se pueden eliminar, pero puedes editarlos para modificarlos."); }} 
                                        style={{ background: 'transparent', color: 'var(--text-secondary)', opacity: 0.5, border: 'none', padding: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
                                        title="Los rasgos base del sistema no se pueden eliminar, solo editar."
                                      >
                                        🗑️
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {totalFeaturePages > 1 && (
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '50px' }}>
                            <button 
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="font-cinzel"
                              style={{ background: 'transparent', border: '1px solid var(--border-color)', color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--text-parchment)', padding: '8px 20px', cursor: 'pointer' }}
                            >ANTERIOR</button>
                            <span className="mono" style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>PÁGINA {currentPage} DE {totalFeaturePages}</span>
                            <button 
                              onClick={() => setCurrentPage(p => Math.min(totalFeaturePages, p + 1))}
                              disabled={currentPage === totalFeaturePages}
                              className="font-cinzel"
                              style={{ background: 'transparent', border: '1px solid var(--border-color)', color: currentPage === totalFeaturePages ? 'var(--text-secondary)' : 'var(--text-parchment)', padding: '8px 20px', cursor: 'pointer' }}
                            >SIGUIENTE</button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })() : (
                <>

                    {isCreating ? (<DatabaseCreateForm formState={formState} handleImageUpload={handleImageUpload} handleSave={handleSave} userRole={userRole} />) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(var(--compendium-grid-minmax), 1fr))', gap: 'var(--compendium-grid-gap)' }}>
                        {pagedItems.map((item: any) => {
                          let data: any = {};
                          try {
                            data = item.data ? (typeof item.data === 'string' ? JSON.parse(item.data) : item.data) : {};
                          } catch { data = {}; }
                          if (!data) data = {};
                          return (
                            <CompendiumCard
                              key={item.id}
                              title={item.name}
                              subtitle={(() => {
                                const desc = data.description || data.desc || "";
                                return Array.isArray(desc) ? desc.join('\n') : String(desc);
                              })()}
                              image={data.image}
                              chips={[{ label: item.type, variant: 'primary' }]}
                              onClick={() => setSelectedItem(item)}
                            >
                              {userRole === 'admin' && (
                                <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                                  <button onClick={(e) => { e.stopPropagation(); handleEditClick(item); }} className="font-cinzel" style={{ flex: 1, background: 'transparent', color: 'var(--text-parchment)', border: '1px solid var(--border-color)', padding: '8px', cursor: 'pointer', fontSize: '0.75rem' }}>EDITAR</button>
                                  <button onClick={(e) => { e.stopPropagation(); if (confirm(`¿Eliminar ${item.name}?`)) socket.emit('content:delete', item.id); }} style={{ background: 'transparent', color: 'var(--combat-red)', border: 'none', padding: '8px', cursor: 'pointer', fontSize: '1.1rem' }}>🗑️</button>
                                </div>
                              )}
                            </CompendiumCard>
                          );
                        })}
                      </div>
                    )}

                    {!isCreating && totalPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '50px' }}>
                        <button 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="font-cinzel"
                          style={{ background: 'transparent', border: '1px solid var(--border-color)', color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--text-parchment)', padding: '8px 20px', cursor: 'pointer' }}
                        >ANTERIOR</button>
                        <span className="mono" style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>PÁGINA {currentPage} DE {totalPages}</span>
                        <button 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="font-cinzel"
                          style={{ background: 'transparent', border: '1px solid var(--border-color)', color: currentPage === totalPages ? 'var(--text-secondary)' : 'var(--text-parchment)', padding: '8px 20px', cursor: 'pointer' }}
                        >SIGUIENTE</button>
                      </div>
                    )}
                </>
              )}

              {selectedItem && category !== 'class' && (
                <DatabaseDetail selectedItem={selectedItem} setSelectedItem={setSelectedItem} isOverlay={isOverlay} onCloseOverlay={onCloseOverlay} userRole={userRole} />
              )}
              {/* MODAL DE DETALLE DE RASGO */}
              <FeatureDetail selectedFeature={selectedFeature} setSelectedFeature={setSelectedFeature} openEditFeatureForm={openEditFeatureForm} handleDeleteFeature={handleDeleteFeature} userRole={userRole} />
            </div>
          </div>
        </div>
      );
    ;

};
