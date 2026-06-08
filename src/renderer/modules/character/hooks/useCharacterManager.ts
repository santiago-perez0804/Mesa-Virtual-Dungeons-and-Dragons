
import { useState } from 'react';

// Tipos requeridos si no est�n exportados (puedes ajustarlos luego)
const defaultInventory = {
  head: null, shoulders: null, cloak: null, armor: null,
  hands: null, rings: [null, null], belt: null, boots: null,
  weapons: [null, null, null],
  backpack: Array(15).fill(null),
  currency: { gold: 0, silver: 0, copper: 0 }
};

export const useCharacterManager = () => {
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

  return {
    name, setName,
    charClass, setCharClass,
    race, setRace,
    subrace, setSubrace,
    description, setDescription,
    image, setImage,
    fullBodyImage, setFullBodyImage,
    editingId, setEditingId,
    stats, setStats,
    selectedSkills, setSelectedSkills,
    selectedSavingThrows, setSelectedSavingThrows,
    backgroundItems, setBackgroundItems,
    skillQuery, setSkillQuery,
    skillDropdownOpen, setSkillDropdownOpen,
    itemQuery0, setItemQuery0,
    itemDropdownOpen0, setItemDropdownOpen0,
    itemQuery1, setItemQuery1,
    itemDropdownOpen1, setItemDropdownOpen1,
    inventory, setInventory,
    isCreating, setIsCreating,
    creationStep, setCreationStep,
    selectedCharacter, setSelectedCharacter,
    levelUpClass, setLevelUpClass,
    searchTerm, setSearchTerm,
    activeSlotIndex, setActiveSlotIndex,
    slotSearchQuery, setSlotSearchQuery,
    slotQuantity, setSlotQuantity,
    viewingItemDetail, setViewingItemDetail,
    unequippingSlotIndex, setUnequippingSlotIndex,
    unequipQuantity, setUnequipQuantity,
    isLevelingUp, setIsLevelingUp,
    charDetailTab, setCharDetailTab,
    classFeatures, setClassFeatures,
    featuresLoading, setFeaturesLoading,
    activeFeaturesClass, setActiveFeaturesClass
  };
};
