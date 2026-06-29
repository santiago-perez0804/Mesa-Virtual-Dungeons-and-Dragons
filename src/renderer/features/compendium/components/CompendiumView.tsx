import { useState, useEffect, useMemo } from 'react';
import { Ghost, Scroll, Swords, Shield, Sparkles, Footprints, Dna, AlertTriangle, Zap, BarChart, BookOpen, Languages, Book, Bookmark } from 'lucide-react';
import { FeatureTooltip } from '../../../components/TooltipRasgos';
import { CompendiumCard } from '../../../components/ui/CartaCompendio';
import { DatabaseDetail } from '../../../components/compendium/DetalleBaseDatos';
import { DatabaseCreateForm } from '../../../components/compendium/FormularioCrearBaseDatos';
import { CompendiumFeatureModal, CompendiumRuleModal } from './CompendiumModals';
import { CompendiumSidebar } from './CompendiumSidebar';
import { CompendiumGrid } from './CompendiumGrid';
import { ClassWizardModal } from '../../../components/compendium/ModalAsistenteClases';
import { SubclassModal } from '../../../components/compendium/ModalSubclase';
import { BooksLibrary } from '../../books/components/BooksLibrary';

import { FeatureDetail } from '../../../components/compendium/DetalleRasgo';
import { formatDescription } from '../../../utils/formateador';
import { useDatabaseForms } from '../../../modules/compendium/hooks/useFormulariosBaseDatos';
import { useCompendiumState } from '../hooks/useCompendiumState';
import { useCompendiumSave } from '../hooks/useCompendiumSave';
import { CompendiumService } from '../services/CompendiumService';

import { ACTION_TYPES, DAMAGE_TYPES, EMERGENCY_SRD_CLASSES } from '../../../modules/compendium/compendio.traducciones';
const safeStr = (val: any) => val != null ? String(val) : '';
export const CompendiumView = ({ compendium, socket, userRole, isOverlay, forceOpenId, onCloseOverlay }: any) => {
  const [showBooks, setShowBooks] = useState(false);

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
    resetForm,
    createRuleCategory, setCreateRuleCategory
  } = formState;

  const compendiumService = useMemo(() => new CompendiumService(socket), [socket]);
  const compendiumState = useCompendiumState(compendiumService, compendium, isOverlay, forceOpenId);
  const {
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
  } = compendiumState;

  const compendiumSave = useCompendiumSave({ compendiumService, formState, setIsEditingFeature, refreshFeaturesList, setSelectedFeature, setIsEditingRule });
  const { handleImageUpload, handleSave, handleSaveFeature, handleDeleteFeature, handleSaveRule } = compendiumSave;

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
  const handleEditClick = (item: any) => {
    if (item.type === 'rule' || item.type === 'rule_section') {
      let data: any = {};
      try {
        if (item.data) data = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
      } catch { data = {}; }
      
      setRuleFormId(item.id);
      setRuleFormType(item.type);
      setRuleFormName(item.name || '');
      
      const desc = data.desc || data.description || '';
      setRuleFormDesc(Array.isArray(desc) ? desc.join('\n\n') : desc);
      
      setRuleFormSubsections(data.subsections || []);
      setIsEditingRule(true);
      return;
    }

    resetForm();
    setSelectedItem(null);
    setIsCreating(true);
    setEditingId(item.id);
    const validTypes = ['monster', 'item', 'class', 'subclass', 'race', 'subrace', 'condition', 'language', 'spell', 'rule'];
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
    
    if (item.type === 'rule' && data.category) {
      formState.setCreateRuleCategory(data.category);
    }

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
      <CompendiumSidebar compendiumState={compendiumState} formState={formState} openCreateFeatureForm={openCreateFeatureForm} userRole={userRole} onOpenBooks={() => setShowBooks(true)} />

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

              <CompendiumGrid 
                compendiumState={compendiumState} 
                compendiumSave={compendiumSave} 
                formState={formState} 
                handleEditClick={handleEditClick} 
                handleEditClassClick={handleEditClassClick} 
                socket={socket} 
                userRole={userRole} 
                compendium={compendium} 
                isOverlay={isOverlay} 
                onCloseOverlay={onCloseOverlay} 
              />

              {selectedItem && category !== 'class' && (
                <DatabaseDetail selectedItem={selectedItem} setSelectedItem={setSelectedItem} isOverlay={isOverlay} onCloseOverlay={onCloseOverlay} userRole={userRole} />
              )}
              {/* MODAL DE DETALLE DE RASGO */}
              <FeatureDetail selectedFeature={selectedFeature} setSelectedFeature={setSelectedFeature} openEditFeatureForm={openEditFeatureForm} handleDeleteFeature={handleDeleteFeature} userRole={userRole} />
              
              <CompendiumFeatureModal formState={formState} compendiumSave={compendiumSave} setIsEditingFeature={setIsEditingFeature} />
              <CompendiumRuleModal formState={formState} compendiumSave={compendiumSave} setIsEditingRule={setIsEditingRule} />
            </div>
          </div>
        </div>
        {showBooks && <BooksLibrary socket={socket} onClose={() => setShowBooks(false)} />}
      );
};
