import os

path = 'src/renderer/components/GrillaCombate.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

end_marker = "  return (\n    <div style={{ display: 'flex'"
start_idx = content.find(end_marker)

if start_idx == -1:
    print("Could not find return statement")
    exit(1)

new_return = """  const uiProps = {
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
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-base)', position: 'relative' }} onClick={() => { setActiveTokenId(null); setContextMenu(null); }}>
      <CombatToolbar {...uiProps} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <CombatSidebar {...uiProps} />
        <CombatBoard {...uiProps} />
      </div>
      <CombatModals {...uiProps} />
    </div>
  );
};
"""

# Add imports for the 4 components at the top
import_str = """import { CombatToolbar } from '../features/combat/components/CombatToolbar';
import { CombatSidebar } from '../features/combat/components/CombatSidebar';
import { CombatBoard } from '../features/combat/components/CombatBoard';
import { CombatModals } from '../features/combat/components/CombatModals';
"""

content = content[:start_idx] + new_return
# Insert imports after standard react imports
import_idx = content.find("import { useFogOfWar }")
if import_idx != -1:
    content = content[:import_idx] + import_str + "\n" + content[import_idx:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced JSX in GrillaCombate.tsx")
