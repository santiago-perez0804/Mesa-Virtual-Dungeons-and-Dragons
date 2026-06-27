const fs = require('fs');
const path = 'src/renderer/components/GestorPersonajes.tsx';
const lines = fs.readFileSync(path, 'utf8').split('\n');

const start = lines.findIndex(l => l.includes('{/* MODAL DE FORJA / EDICIÓN */}'));
const end = lines.findIndex((l, i) => i > start && l.includes('{/* MODAL DE RECORTE DE AVATAR */}'));

const chunk = lines.slice(start + 1, end).join('\n');

const imports = `import React from 'react';
import { User, Shield, Backpack, X, Link, Scale, Lock, RefreshCw, ChevronLeft, ChevronRight, Check, Dices, ChevronUp, Pencil, Heart, Zap, Footprints, Award } from 'lucide-react';
import { calcMod } from '../../../utils/dnd-calculos';
import { getPointCost } from '../../modules/personaje/personaje.utilidades';
import { skillList, statDescriptions } from '../../modules/personaje/personaje.constantes';

export const CharacterCreatorWizard = ({ formState, dbClasses, dbRaces, dbAlignments, getHitDieForClass, compendium, handleImageUpload, setCropMode, portraitInputRef, fullBodyImage, handleSave, styles }: any) => {
  const { name, setName, charClass, setCharClass, race, setRace, subrace, setSubrace, description, setDescription, image, setImage, editingId, setEditingId, stats, setStats, hitDieValue, setHitDieValue, showTraits, setShowTraits, selectedSkills, setSelectedSkills, selectedSavingThrows, setSelectedSavingThrows, backgroundItems, setBackgroundItems, skillQuery, setSkillQuery, skillDropdownOpen, setSkillDropdownOpen, itemQuery0, setItemQuery0, itemDropdownOpen0, setItemDropdownOpen0, itemQuery1, setItemQuery1, itemDropdownOpen1, setItemDropdownOpen1, inventory, setInventory, draft, setDraft, raceQuery, setRaceQuery, raceDropdownOpen, setRaceDropdownOpen, subraceQuery, setSubraceQuery, subraceDropdownOpen, setSubraceDropdownOpen, classQuery, setClassQuery, classDropdownOpen, setClassDropdownOpen, bgSkillQuery, setBgSkillQuery, bgSkillDropdownOpen, setBgSkillDropdownOpen, bgItemQuery, setBgItemQuery, bgItemDropdownOpen, setBgItemDropdownOpen, isCreating, setIsCreating, creationStep, setCreationStep, resetForm, startEdit } = formState;

  if (!isCreating) return null;

  return (
`;

fs.writeFileSync('src/renderer/features/characters/components/CharacterCreatorWizard.tsx', imports + chunk + ');\n};\n');
console.log('Extraction complete');
