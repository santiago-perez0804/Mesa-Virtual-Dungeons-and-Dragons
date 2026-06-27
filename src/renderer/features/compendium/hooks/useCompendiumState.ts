import { useState, useEffect, useMemo } from 'react';
import { EMERGENCY_SRD_CLASSES } from '../../../modules/compendium/compendio.traducciones';

export const useCompendiumState = (compendium: any[], isOverlay?: boolean, forceOpenId?: string) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<'all' | 'monster' | 'spell' | 'item' | 'class' | 'subclass' | 'race' | 'subrace' | 'condition' | 'language' | 'features' | 'rule' | 'rule_section'>('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRuleCategory, setExpandedRuleCategory] = useState<string | null>(null);
  const PAGE_SIZE = 24;

  // EFECTO PARA OVERLAY
  useEffect(() => {
    if (isOverlay && forceOpenId && compendium && compendium.length > 0) {
      const item = compendium.find((d: any) => d.id === forceOpenId || d.name === forceOpenId);
      if (item) setSelectedItem(item);
    }
  }, [isOverlay, forceOpenId, compendium]);

  // --- ESTADOS PARA COMPENDIO DE CLASES ---
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isImportingClasses, setIsImportingClasses] = useState(false);
  const [expandedTraits, setExpandedTraits] = useState<any>({});
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [srdDisconnected, setSrdDisconnected] = useState(false);

  // --- ESTADOS PARA COMPENDIO DE RASGOS ---
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
  const [featureFormShortDesc, setFeatureFormShortDesc] = useState('');
  const [featureFormDesc, setFeatureFormDesc] = useState('');

  const [isEditingRule, setIsEditingRule] = useState(false);
  const [ruleFormId, setRuleFormId] = useState<number | null>(null);
  const [ruleFormType, setRuleFormType] = useState<string>('rule');
  const [ruleFormName, setRuleFormName] = useState('');
  const [ruleFormDesc, setRuleFormDesc] = useState('');
  const [ruleFormSubsections, setRuleFormSubsections] = useState<any[]>([]);
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

  const handleImportSRD = async () => {
    setIsImportingClasses(true);
    setTimeout(() => {
      setSrdDisconnected(false);
      setIsImportingClasses(false);
    }, 1000);
  };

  const filteredCompendium = useMemo(() => {
    return compendium
      .filter((item: any) => {
        const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category === 'all' || item.type === category || (category === 'rule' && item.type === 'rule_section');
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
          displaySource: dbCls.source === 'manual' || dbCls.source === 'srd' ? 'srd' : 'modified',
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
          displaySource: dbCls.source === 'manual' || dbCls.source === 'srd' ? 'srd' : 'custom',
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

  return {
    searchTerm, setSearchTerm,
    category, setCategory,
    selectedItem, setSelectedItem,
    currentPage, setCurrentPage,
    expandedRuleCategory, setExpandedRuleCategory,
    selectedClass, setSelectedClass,
    isImportingClasses, setIsImportingClasses,
    expandedTraits, setExpandedTraits,
    editingClassId, setEditingClassId,
    srdDisconnected, setSrdDisconnected,
    classFeatures, setClassFeatures,
    loadingFeatures, setLoadingFeatures,
    selectedFeatureClass, setSelectedFeatureClass,
    selectedFeatureLevel, setSelectedFeatureLevel,
    selectedFeature, setSelectedFeature,
    isEditingFeature, setIsEditingFeature,
    featureFormId, setFeatureFormId,
    featureFormClass, setFeatureFormClass,
    featureFormName, setFeatureFormName,
    featureFormLevel, setFeatureFormLevel,
    featureFormShortDesc, setFeatureFormShortDesc,
    featureFormDesc, setFeatureFormDesc,
    isEditingRule, setIsEditingRule,
    ruleFormId, setRuleFormId,
    ruleFormType, setRuleFormType,
    ruleFormName, setRuleFormName,
    ruleFormDesc, setRuleFormDesc,
    ruleFormSubsections, setRuleFormSubsections,
    hoveredCardId, setHoveredCardId,

    handleSearch,
    handleCategory,
    refreshFeaturesList,
    handleImportSRD,
    filteredCompendium,
    pagedItems,
    totalPages,
    classesList,
    allMergedFeatures,
    PAGE_SIZE
  };
};
