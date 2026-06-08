import { useState } from 'react';

export const useDatabaseForms = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [createType, setCreateType] = useState('monster');
  const [createName, setCreateName] = useState('');
  const [createImage, setCreateImage] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  
  const [createHp, setCreateHp] = useState('10');
  const [createAc, setCreateAc] = useState<number | string>(10);
  const [createCr, setCreateCr] = useState('1/4');
  const [createSpeed, setCreateSpeed] = useState('30 ft.');
  const [createStats, setCreateStats] = useState({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
  const [createAttacks, setCreateAttacks] = useState<any[]>([]);
  const [createTraits, setCreateTraits] = useState<any[]>([]);
  const [createVuln, setCreateVuln] = useState<string[]>([]);
  const [createRes, setCreateRes] = useState<string[]>([]);
  const [createImm, setCreateImm] = useState<string[]>([]);
  const [createSize, setCreateSize] = useState('Mediano');
  
  const [createShortDesc, setCreateShortDesc] = useState('');
  const [createSpellLevel, setCreateSpellLevel] = useState(0);
  const [createSpellComponents, setCreateSpellComponents] = useState({ V: false, S: false, M: false });
  const [createSpellRange, setCreateSpellRange] = useState('');
  const [createSpellDuration, setCreateSpellDuration] = useState('instantaneo');
  const [createSpellConcentration, setCreateSpellConcentration] = useState(false);
  
  const [isDamageItem, setIsDamageItem] = useState(false);
  const [itemAttackBonus, setItemAttackBonus] = useState('');
  const [itemDamageFormula, setItemDamageFormula] = useState('');
  const [itemDamageType, setItemDamageType] = useState('cortante');
  const [createTags, setCreateTags] = useState<string[]>([]);
  const [isProtectItem, setIsProtectItem] = useState(false);
  const [itemDefenseBonus, setItemDefenseBonus] = useState('');
  const [itemAttackName, setItemAttackName] = useState('');
  const [itemStatMod, setItemStatMod] = useState('');
  const [itemStatSelection, setItemStatSelection] = useState('FUE');
  const [itemTargetsCount, setItemTargetsCount] = useState('1');
  const [itemCritDamage, setItemCritDamage] = useState('');
  const [createArmorType, setCreateArmorType] = useState('ligera');
  const [createRequiresAttunement, setCreateRequiresAttunement] = useState(false);
  const [createWeight, setCreateWeight] = useState('');
  
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [classWizardStep, setClassWizardStep] = useState(1);
  const [cName, setCName] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cHitDie, setCHitDie] = useState('d8');
  const [cSubclassLvl, setCSubclassLvl] = useState(3);
  const [cSubclassTitle, setCSubclassTitle] = useState('Arquetipo Marcial');
  const [cArmors, setCArmors] = useState<string[]>([]);
  const [cWeapons, setCWeapons] = useState<string[]>([]);
  const [cTools, setCTools] = useState('');
  const [cSaves, setCSaves] = useState<string[]>([]);
  const [cSkills, setCSkills] = useState<string[]>([]);
  const [cSkillsLimit, setCSkillsLimit] = useState(2);
  const [cResourceName, setCResourceName] = useState('');
  const [cResourceProg, setCResourceProg] = useState('');
  
  const [isAddingSubclass, setIsAddingSubclass] = useState(false);
  const [subclassName, setSubclassName] = useState('');
  const [subclassDesc, setSubclassDesc] = useState('');
  const [subclassTraits, setSubclassTraits] = useState<any[]>([]);
  const [subclassTraitName, setSubclassTraitName] = useState('');
  const [subclassTraitLevel, setSubclassTraitLevel] = useState(3);
  const [subclassTraitDesc, setSubclassTraitDesc] = useState('');

  const [createRarity, setCreateRarity] = useState('Com�n');


  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setCreateName('');
    setCreateDesc('');
    setCreateImage('');
    setCreateHp('10');
    setCreateAc(10);
    setCreateCr('1/4');
    setCreateSpeed('30 ft.');
    setCreateStats({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
    setCreateAttacks([]);
    setCreateTraits([]);
    setCreateVuln([]);
    setCreateRes([]);
    setCreateImm([]);
    setCreateShortDesc('');
    setCreateSpellLevel(0);
    setCreateSpellComponents({ V: false, S: false, M: false });
    setCreateSpellRange('');
    setCreateSpellDuration('instantaneo');
    setCreateSpellConcentration(false);
    setIsDamageItem(false);
    setItemAttackBonus('');
    setItemDamageFormula('');
    setItemDamageType('cortante');
    setCreateTags([]);
    setIsProtectItem(false);
    setItemDefenseBonus('');
    setItemAttackName('');
    setItemStatMod('');
    setItemStatSelection('FUE');
    setItemTargetsCount('1');
    setItemCritDamage('');
    setCreateArmorType('ligera');
    setCreateRequiresAttunement(false);
    setCreateWeight('');
    setCreateRarity('Com�n');
  };
  
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosX, setImagePosX] = useState(0);
  const [imagePosY, setImagePosY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  return {

    imageZoom, setImageZoom,
    imagePosX, setImagePosX,
    imagePosY, setImagePosY,
    isDragging, setIsDragging,
    dragStart, setDragStart,

    isCreating, setIsCreating,
    editingId, setEditingId,
    createType, setCreateType,
    createName, setCreateName,
    createImage, setCreateImage,
    createDesc, setCreateDesc,
    createHp, setCreateHp,
    createAc, setCreateAc,
    createCr, setCreateCr,
    createSpeed, setCreateSpeed,
    createStats, setCreateStats,
    createAttacks, setCreateAttacks,
    createTraits, setCreateTraits,
    createVuln, setCreateVuln,
    createRes, setCreateRes,
    createImm, setCreateImm,
    createSize, setCreateSize,
    createShortDesc, setCreateShortDesc,
    createSpellLevel, setCreateSpellLevel,
    createSpellComponents, setCreateSpellComponents,
    createSpellRange, setCreateSpellRange,
    createSpellDuration, setCreateSpellDuration,
    createSpellConcentration, setCreateSpellConcentration,
    isDamageItem, setIsDamageItem,
    itemAttackBonus, setItemAttackBonus,
    itemDamageFormula, setItemDamageFormula,
    itemDamageType, setItemDamageType,
    createTags, setCreateTags,
    isProtectItem, setIsProtectItem,
    itemDefenseBonus, setItemDefenseBonus,
    itemAttackName, setItemAttackName,
    itemStatMod, setItemStatMod,
    itemStatSelection, setItemStatSelection,
    itemTargetsCount, setItemTargetsCount,
    itemCritDamage, setItemCritDamage,
    createArmorType, setCreateArmorType,
    createRequiresAttunement, setCreateRequiresAttunement,
    createWeight, setCreateWeight,
    createRarity, setCreateRarity,
    isCreatingClass, setIsCreatingClass,
    classWizardStep, setClassWizardStep,
    cName, setCName,
    cDesc, setCDesc,
    cHitDie, setCHitDie,
    cSubclassLvl, setCSubclassLvl,
    cSubclassTitle, setCSubclassTitle,
    cArmors, setCArmors,
    cWeapons, setCWeapons,
    cTools, setCTools,
    cSaves, setCSaves,
    cSkills, setCSkills,
    cSkillsLimit, setCSkillsLimit,
    cResourceName, setCResourceName,
    cResourceProg, setCResourceProg,
    isAddingSubclass, setIsAddingSubclass,
    subclassName, setSubclassName,
    subclassDesc, setSubclassDesc,
    subclassTraits, setSubclassTraits,
    subclassTraitName, setSubclassTraitName,
    subclassTraitLevel, setSubclassTraitLevel,
    subclassTraitDesc, setSubclassTraitDesc,
    resetForm
  };
};
