const fs = require('fs');
const path = 'src/renderer/components/GestorPersonajes.tsx';
const lines = fs.readFileSync(path, 'utf8').split('\n');

const start = lines.findIndex(l => l.includes('{/* MODAL DE DETALLES DEL PERSONAJE */}'));
// The component is the last thing in the file before the final return `</div>); };`
// Actually, I can just slice from start+1 to the end, then trim off the last `  </div>); };`

let chunk = lines.slice(start + 1, lines.length - 2).join('\n'); // excluding `</section> </div> ); }` things

const imports = `import React from 'react';
import { Shield, Backpack, X, Link, Scale, Lock, RefreshCw, ChevronLeft, ChevronRight, Check, Dices, ChevronUp, Pencil, Heart, Zap, Footprints, Award } from 'lucide-react';
import { formatDescription } from '../../components/utils/formateador';
import { getModStr, getProficiencyBonus, safeParseInventory, safeParseStats } from '../../modules/personaje/personaje.utilidades';
import { CharacterInventoryTab } from '../../components/personaje/PestanaInventarioPersonaje';
import { CharacterTraitsTab } from '../../components/personaje/PestanaRasgosPersonaje';
import { CharacterSpellsTab } from '../../components/personaje/PestanaHechizosPersonaje';
import { CharacterStatsPanel } from '../../components/personaje/PanelEstadisticasPersonaje';
import { ACModifierModal } from '../../components/personaje/ACModifierModal';
import { InitiativeModifierModal } from '../../components/personaje/InitiativeModifierModal';
import { SpeedModifierModal } from '../../components/personaje/SpeedModifierModal';
import { ProficiencyModifierModal } from '../../components/personaje/ProficiencyModifierModal';
import { AttributeModifierModal } from '../../components/personaje/AttributeModifierModal';
import { SavingThrowModifierModal } from '../../components/personaje/SavingThrowModifierModal';
import { SkillModifierModal } from '../../components/personaje/SkillModifierModal';
import { calcMod, calculateAC, calculateHP, getRandomItem } from '../../../utils/dnd-calculos';

export const CharacterSheetDetailed = ({ formState, parseClasses, compendium, dbClasses, socket, triggerDiceRoll, handleDelete, handleLevelUp, getHitDieForClass, getCharacterBaseSpeed, styles }: any) => {
  const { selectedCharacter, setSelectedCharacter, activeSlotIndex, setActiveSlotIndex, slotSearchQuery, setSlotSearchQuery, slotQuantity, setSlotQuantity, coinInputVal, setCoinInputVal, customItemName, setCustomItemName, customItemNote, setCustomItemNote, viewingItemDetail, setViewingItemDetail, unequippingSlotIndex, setUnequippingSlotIndex, unequipQuantity, setUnequipQuantity, showACModal, setShowACModal, showInitiativeModal, setShowInitiativeModal, showSpeedModal, setShowSpeedModal, showProficiencyModal, setShowProficiencyModal, selectedAttributeForModal, setSelectedAttributeForModal, selectedSavingThrowForModal, setSelectedSavingThrowForModal, selectedSkillForModal, setSelectedSkillForModal, isLevelingUp, setIsLevelingUp, levelUpClass, setLevelUpClass, charDetailTab, setCharDetailTab, classFeatures, setClassFeatures, featuresLoading, setFeaturesLoading, activeFeaturesClass, setActiveFeaturesClass, updateStat } = formState;

  if (!selectedCharacter) return null;

  return (
`;

fs.writeFileSync('src/renderer/features/characters/components/CharacterSheetDetailed.tsx', imports + chunk + ');\n};\n');
console.log('Extraction complete for CharacterSheetDetailed');
