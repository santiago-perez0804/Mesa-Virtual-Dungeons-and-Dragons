import os
import re

path = 'src/renderer/components/GestorPersonajes.tsx'
try:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
except UnicodeDecodeError:
    with open(path, 'r', encoding='utf-16') as f:
        content = f.read()

# 1. State hook logic
# Everything from `export const CharacterManager = ({ ... }) => {` up to line 705.
idx_comp_start = content.find("export const CharacterManager = ({ socket, characters, compendium, userRole, triggerDiceRoll, isOverlay, forceOpenId, onCloseOverlay }: any) => {")
idx_main_return = content.find("  return (\n      <div style={styles.container}>")

logic_chunk = content[idx_comp_start:idx_main_return]
logic_chunk = logic_chunk.replace("export const CharacterManager = ({ socket, characters, compendium, userRole, triggerDiceRoll, isOverlay, forceOpenId, onCloseOverlay }: any) => {", 
                                  "export const useGestorPersonajesState = ({ socket, characters, compendium, userRole, triggerDiceRoll, isOverlay, forceOpenId, onCloseOverlay }: any) => {")

# Generate the hook file
hook_imports = """import { useState, useEffect, useRef, useMemo } from 'react';
import { calcMod, calculateHP, calculateAC, getRandomItem } from '../../utils/dnd-calculos';
import type { CharacterDraft, AlignmentType, AttributeKey } from '../../data/dnd-datos';
import { getPointCost, getModStr, getProficiencyBonus, safeParseInventory, safeParseStats } from './personaje.utilidades';
import { skillList, statDescriptions } from './personaje.constantes';

"""

hook_return = """
  return {
    // Basic state
    name, setName, charClass, setCharClass, race, setRace, subrace, setSubrace,
    description, setDescription, image, setImage, fullBodyImage, setFullBodyImage,
    editingId, setEditingId, stats, setStats, hitDieValue, setHitDieValue,
    showTraits, setShowTraits, selectedSkills, setSelectedSkills,
    selectedSavingThrows, setSelectedSavingThrows, backgroundItems, setBackgroundItems,
    skillQuery, setSkillQuery, skillDropdownOpen, setSkillDropdownOpen,
    itemQuery0, setItemQuery0, itemDropdownOpen0, setItemDropdownOpen0,
    itemQuery1, setItemQuery1, itemDropdownOpen1, setItemDropdownOpen1,
    inventory, setInventory,
    
    // Draft & Wizard state
    draft, setDraft, isCreating, setIsCreating, creationStep, setCreationStep,
    creationErrors, setCreationErrors, dbClasses, dbRaces, dbAlignments,
    getHitDieForClass, getCharacterBaseSpeed,
    
    // Detailed sheet state
    selectedCharacter, setSelectedCharacter,
    charDetailTab, setCharDetailTab, showHitDiceModal, setShowHitDiceModal,
    showHpModal, setShowHpModal, hpModifierAmount, setHpModifierAmount,
    showLongRestModal, setShowLongRestModal, showPortraitModal, setShowPortraitModal,
    showLevelUpModal, setShowLevelUpModal, isLevelingUp, setIsLevelingUp,
    levelUpClass, setLevelUpClass, showDeathSavesModal, setShowDeathSavesModal,
    deathSavesState, setDeathSavesState,
    showACModal, setShowACModal, showInitiativeModal, setShowInitiativeModal,
    showSpeedModal, setShowSpeedModal, showProficiencyModal, setShowProficiencyModal,
    showAttributeModal, setShowAttributeModal, activeAttributeForModal, setActiveAttributeForModal,
    showSavingThrowModal, setShowSavingThrowModal, activeSavingThrowForModal, setActiveSavingThrowForModal,
    showSkillModal, setShowSkillModal, activeSkillForModal, setActiveSkillForModal,
    
    // Crop state
    showCropModal, setShowCropModal, cropImageSrc, setCropImageSrc,
    cropMode, setCropMode, cropScale, setCropScale, cropOffsetX, setCropOffsetX,
    cropOffsetY, setCropOffsetY, isCropDragging, setIsCropDragging,
    cropDragStart, setCropDragStart, cropImgDims, setCropImgDims,
    cropImgRef, portraitInputRef,
    
    // Misc state & search
    searchTerm, setSearchTerm, showClassTooltip, setShowClassTooltip,
    inventoryTab, setInventoryTab, currentEditItem, setCurrentEditItem,
    showAddItemModal, setShowAddItemModal, newItemType, setNewItemType,
    newItemName, setNewItemName, newItemQuantity, setNewItemQuantity,
    showEquipDropdown, setShowEquipDropdown, activeSlotIndex, setActiveSlotIndex,
    unequippingItem, setUnequippingItem, selectedItemForSlot, setSelectedItemForSlot,
    showItemMenu, setShowItemMenu, isOverlay, forceOpenId, onCloseOverlay,
    
    // Handlers
    handleSave, handleDelete, handleLevelUp, handleImageUpload, handleCropSave,
    filteredCharacters, parseClasses: parseClasses2, resetForm
  };
}
"""

with open('src/renderer/modules/personaje/hooks/useGestorPersonajesState.ts', 'w', encoding='utf-8') as f:
    f.write(hook_imports + logic_chunk + hook_return)

# Now extract the 4 UI chunks
jsx_chunk = content[idx_main_return:]

idx_forja = jsx_chunk.find("{/* MODAL DE FORJA / EDICIÓN */}")
idx_crop = jsx_chunk.find("{/* MODAL CROP PARA RECORTAR IMAGEN */}")
if idx_crop == -1: idx_crop = jsx_chunk.find("{/* MODAL PARA RECORTAR IMAGEN")
if idx_crop == -1: idx_crop = jsx_chunk.find("showCropModal")
idx_sheet = jsx_chunk.find("{/* MODAL HOJA DE PERSONAJE DETALLADA */}")

print(f"forja: {idx_forja}, crop: {idx_crop}, sheet: {idx_sheet}")

hero_grid_jsx = jsx_chunk[:idx_forja].strip()
forja_jsx = jsx_chunk[idx_forja:idx_crop].strip()
crop_jsx = jsx_chunk[idx_crop:idx_sheet].strip()
sheet_jsx = jsx_chunk[idx_sheet:].strip()

# Wait, `idx_crop` is finding "showCropModal" which could be deep inside. Let's trace it properly.
