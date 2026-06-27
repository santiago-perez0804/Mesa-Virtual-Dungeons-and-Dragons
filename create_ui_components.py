import os

path = 'src/renderer/components/GrillaCombate.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

def get_chunk(start_idx, end_idx):
    return "".join(lines[start_idx:end_idx])

# Based on line numbers:
# Toolbar: 175 - 588
# Contenedor Principal: 588 - 1542
# Sidebar: 589 - 992
# Board: 992 - 1530
# Modals: 1542 - 2910

toolbar_jsx = get_chunk(174, 587)
sidebar_jsx = get_chunk(589, 992)
board_jsx = get_chunk(992, 1535)
modals_jsx = get_chunk(1541, 2900) # up to the end of modals

def wrap_component(name, jsx):
    return f"""import React from 'react';
import {{ Ghost, HeartCrack, Flame, Snowflake, Moon, Shield, Zap, Biohazard, Activity, X, User, Backpack, Dices, StickyNote, Box, Lock, Coins, Swords, ArrowRight }} from 'lucide-react';
import {{ NoteTokenIcon, ImageTokenIcon, ClosedChestIcon, OpenChestIcon, ItemDropIcon, CompassIcon, LineAoeIcon, ConeAoeIcon, CircleAoeIcon, SquareAoeIcon, getAoeIcon }} from '../../shared/components/iconos';

export const {name} = (props: any) => {{
  const {{
    socket, userRole, currentUser, boardTokens, characters, monsters, chatMessages, compendium,
    onOpenCharacterSheet, onOpenMonsterSheet,
    bgImage, setBgImage, bgInputUrl, setBgInputUrl, showGridLines, setShowGridLines, gridOpacity,
    saveNotification, setSaveNotification, isSidebarOpen, setIsSidebarOpen, isChatOpen, setIsChatOpen,
    viewingToken, setViewingToken, sidebarTab, prevSidebarTab, isTabTransitioning, switchTab,
    healthModalToken, setHealthModalToken, healthInput, setHealthInput, conditionInput, setConditionInput,
    activeActionMenu, setActiveActionMenu, isRadialOpen, setIsRadialOpen,
    combatState, setCombatState, activeTokenId, setActiveTokenId, currentTurnTokenId, currentToken,
    isMyTurn, blockRolls, allCombatantsRolled,
    isEditingSurface, setIsEditingSurface, solidCells, setSolidCells, isNightMode, setIsNightMode,
    isEditingSurfaceRef, solidCellsRef, isCellVisible, getLineCells,
    zoom, setZoom, pan, setPan, viewportRef, boardRef, ghostRef, snapRef, drag, wasDraggingRef,
    handleViewportMouseDown, handleTokenMouseDown,
    contextMenu, setContextMenu, isCreatingChest, setIsCreatingChest, chestPassword, setChestPassword,
    isSelectingCompendiumItem, setIsSelectingCompendiumItem, itemSearchQuery, setItemSearchQuery,
    selectedChestToken, setSelectedChestToken, passwordPromptChest, setPasswordPromptChest,
    enteredPassword, setEnteredPassword, passwordError, setPasswordError, selectedItemToken, setSelectedItemToken,
    compendiumSlotIndex, setCompendiumSlotIndex, isCreatingNote, setIsCreatingNote, noteText, setNoteText,
    selectedNoteToken, setSelectedNoteToken, isCreatingImage, setIsCreatingImage, imageUrlInput, setImageUrlInput,
    selectedImageToken, setSelectedImageToken, isCreatingAoe, setIsCreatingAoe, aoeForm, setAoeForm,
    selectedAoeToken, setSelectedAoeToken, activeAoeTool, setActiveAoeTool,
    handleBoardContextMenu, handleCreateChestSubmit, handleSpawnItem, handleVerifyPasswordSubmit,
    handleChestSlotClick, handleSelectItemForSlot, handleLootItemClick, handleLootAllCoins, handlePickupFloorItem,
    handleCreateNoteSubmit, handleCreateImageSubmit, handleImageFileChange, handleSpawnAoe,
    CELL_PX, GRID_SIZE, BOARD_PX, renderConditionIcon
  }} = props;

  return (
    <>
{jsx}
    </>
  );
}};
"""

os.makedirs('src/renderer/features/combat/components', exist_ok=True)

with open('src/renderer/features/combat/components/CombatToolbar.tsx', 'w', encoding='utf-8') as f:
    f.write(wrap_component('CombatToolbar', toolbar_jsx))

with open('src/renderer/features/combat/components/CombatSidebar.tsx', 'w', encoding='utf-8') as f:
    f.write(wrap_component('CombatSidebar', sidebar_jsx))

with open('src/renderer/features/combat/components/CombatBoard.tsx', 'w', encoding='utf-8') as f:
    f.write(wrap_component('CombatBoard', board_jsx))

with open('src/renderer/features/combat/components/CombatModals.tsx', 'w', encoding='utf-8') as f:
    f.write(wrap_component('CombatModals', modals_jsx))

print("Created 4 UI components.")
