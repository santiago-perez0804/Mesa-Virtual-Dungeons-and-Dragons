import os
import re
import io

path = 'src/renderer/components/GestorPersonajes.tsx'
try:
    with io.open(path, 'r', encoding='utf-8') as f:
        content = f.read()
except UnicodeDecodeError:
    with io.open(path, 'r', encoding='utf-16') as f:
        content = f.read()

idx_main_return = content.find("  return (\n    <div style={styles.container}>")
idx_comp_start = content.find("export const CharacterManager =")

logic_chunk = content[idx_comp_start:idx_main_return]
logic_chunk = logic_chunk.replace("export const CharacterManager = ({ socket, characters, compendium, userRole, triggerDiceRoll, isOverlay, forceOpenId, onCloseOverlay }: any) => {", 
                                  "export const useGestorPersonajesState = ({ socket, characters, compendium, userRole, triggerDiceRoll, isOverlay, forceOpenId, onCloseOverlay }: any) => {")

hook_imports = """import { useState, useEffect, useRef, useMemo } from 'react';
import { calcMod, calculateHP, calculateAC, getRandomItem } from '../../utils/dnd-calculos';
import type { CharacterDraft, AlignmentType, AttributeKey } from '../../data/dnd-datos';
import { getPointCost, getModStr, getProficiencyBonus, safeParseInventory, safeParseStats } from '../../modules/personaje/personaje.utilidades';
import { skillList, statDescriptions } from '../../modules/personaje/personaje.constantes';

"""

hook_return = """
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
    selectedCharacter, setSelectedCharacter, charDetailTab, setCharDetailTab,
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
    handleSave, handleDelete, handleLevelUp, handleImageUpload, handleCropSave, filteredCharacters, parseClasses: parseClasses2,
    resetForm, getEffectiveStat, socket, triggerDiceRoll, compendium, characters, userRole, styles
  };
};
"""

os.makedirs('src/renderer/features/personaje/hooks', exist_ok=True)
with io.open('src/renderer/features/personaje/hooks/useGestorPersonajesState.ts', 'w', encoding='utf-8') as f:
    f.write(hook_imports + logic_chunk + hook_return)


# Now extract the chunks by matching line by line
lines = content[idx_main_return:].splitlines(True)
forja_idx = -1
crop_idx = -1
sheet_idx = -1

for i, line in enumerate(lines):
    if "isCreating && (" in line:
        forja_idx = i
    if "showCropModal && cropImageSrc && (" in line:
        crop_idx = i
    if "selectedCharacter && (() => {" in line:
        sheet_idx = i

print(f"forja_idx: {forja_idx}, crop_idx: {crop_idx}, sheet_idx: {sheet_idx}")

hero_grid_lines = lines[3:forja_idx-1] # skip the initial return div section
forja_lines = lines[forja_idx:crop_idx-1]
crop_lines = lines[crop_idx:sheet_idx-1]
sheet_lines = lines[sheet_idx:-3] # omit the closing tags

os.makedirs('src/renderer/features/personaje/components', exist_ok=True)

with io.open('src/renderer/features/personaje/components/HeroGrid.tsx', 'w', encoding='utf-8') as f:
    f.write("""import React from 'react';
import { HeroCard } from '../../../components/ui/CartaHeroe';

export const HeroGrid = (props: any) => {
  const { isOverlay, searchTerm, setSearchTerm, filteredCharacters, parseClasses, openCharacterSheet, resetForm, setIsCreating, styles } = props;
  return (
    <>
""")
    f.write(''.join(hero_grid_lines))
    f.write("""    </>
  );
};
""")

with io.open('src/renderer/features/personaje/components/CharacterCreatorWizard.tsx', 'w', encoding='utf-8') as f:
    f.write("""import React from 'react';
import { User, Shield, Backpack, Check, Dices } from 'lucide-react';

export const CharacterCreatorWizard = (props: any) => {
  const { isCreating, setIsCreating, creationStep, setCreationStep, creationErrors, draft, setDraft,
          name, setName, charClass, setCharClass, race, setRace, subrace, setSubrace, description, setDescription,
          image, setImage, fullBodyImage, setFullBodyImage, editingId, stats, setStats, hitDieValue, setHitDieValue,
          showTraits, setShowTraits, selectedSkills, setSelectedSkills, selectedSavingThrows, setSelectedSavingThrows,
          backgroundItems, setBackgroundItems, skillQuery, setSkillQuery, skillDropdownOpen, setSkillDropdownOpen,
          itemQuery0, setItemQuery0, itemDropdownOpen0, setItemDropdownOpen0, itemQuery1, setItemQuery1, itemDropdownOpen1, setItemDropdownOpen1,
          dbClasses, dbRaces, dbAlignments, getHitDieForClass, handleSave, handleImageUpload, setCropMode, portraitInputRef,
          styles, getPointCost, getModStr, skillList, statDescriptions } = props;
  return (
    <>
""")
    f.write(''.join(forja_lines))
    f.write("""    </>
  );
};
""")

with io.open('src/renderer/features/personaje/components/ImageCropModal.tsx', 'w', encoding='utf-8') as f:
    f.write("""import React from 'react';

export const ImageCropModal = (props: any) => {
  const { showCropModal, setShowCropModal, cropImageSrc, setCropImageSrc, cropMode, setCropMode,
          cropScale, setCropScale, cropOffsetX, setCropOffsetX, cropOffsetY, setCropOffsetY,
          isCropDragging, setIsCropDragging, cropDragStart, setCropDragStart, cropImgDims, setCropImgDims,
          cropImgRef, handleCropSave } = props;
  return (
    <>
      {
""")
    f.write(''.join(crop_lines))
    f.write("""      }
    </>
  );
};
""")

with io.open('src/renderer/features/personaje/components/CharacterSheetDetailed.tsx', 'w', encoding='utf-8') as f:
    f.write("""import React from 'react';
import { Shield, Footprints, Heart, Zap, Award, Pencil, Dices, X } from 'lucide-react';
import { CharacterInventoryTab } from '../../../components/personaje/PestanaInventarioPersonaje';
import { CharacterTraitsTab } from '../../../components/personaje/PestanaRasgosPersonaje';
import { CharacterSpellsTab } from '../../../components/personaje/PestanaHechizosPersonaje';
import { CharacterStatsPanel } from '../../../components/personaje/PanelEstadisticasPersonaje';
import { ACModifierModal } from '../../../components/personaje/ACModifierModal';
import { InitiativeModifierModal } from '../../../components/personaje/InitiativeModifierModal';
import { SpeedModifierModal } from '../../../components/personaje/SpeedModifierModal';
import { ProficiencyModifierModal } from '../../../components/personaje/ProficiencyModifierModal';
import { AttributeModifierModal } from '../../../components/personaje/AttributeModifierModal';
import { SavingThrowModifierModal } from '../../../components/personaje/SavingThrowModifierModal';
import { SkillModifierModal } from '../../../components/personaje/SkillModifierModal';
import { calcMod, calculateHP, calculateAC } from '../../../../utils/dnd-calculos';
import { getModStr, getProficiencyBonus, safeParseInventory, safeParseStats } from '../../../modules/personaje/personaje.utilidades';
import { formatDescription } from '../../../utils/formateador';

export const CharacterSheetDetailed = (props: any) => {
  const { selectedCharacter, setSelectedCharacter, isCreating, dbClasses, dbRaces, getCharacterBaseSpeed,
          getHitDieForClass, triggerDiceRoll, handleDelete, handleLevelUp, isLevelingUp, setIsLevelingUp,
          levelUpClass, setLevelUpClass, charDetailTab, setCharDetailTab, showACModal, setShowACModal,
          showInitiativeModal, setShowInitiativeModal, showSpeedModal, setShowSpeedModal, showProficiencyModal, setShowProficiencyModal,
          showAttributeModal, setShowAttributeModal, activeAttributeForModal, setActiveAttributeForModal,
          showSavingThrowModal, setShowSavingThrowModal, activeSavingThrowForModal, setActiveSavingThrowForModal,
          showSkillModal, setShowSkillModal, activeSkillForModal, setActiveSkillForModal, socket, styles, parseClasses } = props;
  
  // Auxiliary functions derived from character state
  const charStats = selectedCharacter ? safeParseStats(selectedCharacter.stats) : {};
  const getEffectiveStat = (statName: string) => {
    let base = charStats[statName] || 8;
    const mods = charStats.customStatModifiers?.[statName] || [];
    const totalMod = mods.reduce((acc: number, m: any) => acc + m.value, 0);
    return base + totalMod;
  };
  const customInitiative = (charStats.customInitiativeModifiers || []).reduce((acc: number, m: any) => acc + m.value, 0);
  const customSpeed = (charStats.customSpeedModifiers || []).reduce((acc: number, m: any) => acc + m.value, 0);

  return (
    <>
      {
""")
    f.write(''.join(sheet_lines))
    f.write("""      }
    </>
  );
};
""")

print("Successfully written 4 components!")
