import { useEffect, useState } from 'react';
import { Ghost, HeartCrack, Flame, Snowflake, Moon, Shield, Zap, Biohazard, Activity, X } from 'lucide-react';


import { CombatToolbar } from '../features/combat/components/CombatToolbar';
import { CombatSidebar } from '../features/combat/components/CombatSidebar';
import { CombatBoard } from '../features/combat/components/CombatBoard';
import { CombatModals } from '../features/combat/components/CombatModals';

import { useFogOfWar } from '../features/combat/hooks/useFogOfWar';
import { useBoardInteraction } from '../features/combat/hooks/useBoardInteraction';
import { useCombatState } from '../features/combat/hooks/useCombatState';
import { useGridObjects } from '../features/combat/hooks/useGridObjects';

const CELL_PX = 50;
const GRID_SIZE = 30;
const BOARD_PX = GRID_SIZE * CELL_PX;


const renderConditionIcon = (emo) => {
  switch (emo) {
    case '😵': return <Ghost className="w-4 h-4 m-auto" />;
    case '😨': return <HeartCrack className="w-4 h-4 m-auto" />;
    case '🔥': return <Flame className="w-4 h-4 m-auto" />;
    case '❄️': return <Snowflake className="w-4 h-4 m-auto" />;
    case '💤': return <Moon className="w-4 h-4 m-auto" />;
    case '🛡️': return <Shield className="w-4 h-4 m-auto" />;
    case '⚡': return <Zap className="w-4 h-4 m-auto" />;
    case '🤢': return <Biohazard className="w-4 h-4 m-auto" />;
    case '😡': return <Activity className="w-4 h-4 m-auto" />;
    case '🤸': return <Activity className="w-4 h-4 m-auto" />;
    case '❌': return <X className="w-3 h-3 m-auto" />;
    case '': return <X className="w-4 h-4 m-auto" />;
    default: return emo;
  }
};

export const CombatGrid = ({ socket, userRole, currentUser, boardTokens, characters, monsters, chatMessages, compendium = [], onOpenCharacterSheet, onOpenMonsterSheet, campaignImage }: any) => {
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgInputUrl, setBgInputUrl] = useState('');
  const [showGridLines, setShowGridLines] = useState(true);
  const [gridOpacity] = useState(0.2);
  const [saveNotification, setSaveNotification] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);

  const [viewingToken, setViewingToken] = useState<any>(null);
  const [sidebarTab, setSidebarTab] = useState<'combatants' | 'objects'>('combatants');
  const [prevSidebarTab, setPrevSidebarTab] = useState<'combatants' | 'objects' | null>(null);
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);

  const [healthModalToken, setHealthModalToken] = useState<any>(null);
  const [healthInput, setHealthInput] = useState<string>('');
  const [conditionInput, setConditionInput] = useState<string>('');
  const [activeActionMenu, setActiveActionMenu] = useState<'PH' | 'TS' | null>(null);
  const [isRadialOpen, setIsRadialOpen] = useState(false);

  const switchTab = (tab: 'combatants' | 'objects') => {
    if (tab === sidebarTab || isTabTransitioning) return;
    setPrevSidebarTab(sidebarTab);
    setIsTabTransitioning(true);
    setTimeout(() => {
      setSidebarTab(tab);
      setIsTabTransitioning(false);
      setPrevSidebarTab(null);
    }, 220);
  };

  const {
    combatState, setCombatState,
    activeTokenId, setActiveTokenId,
    currentTurnTokenId, currentToken,
    isMyTurn, blockRolls, allCombatantsRolled
  } = useCombatState(socket, userRole, currentUser, boardTokens);

  useEffect(() => {
    setActiveActionMenu(null);
  }, [activeTokenId]);

  const {
    isEditingSurface, setIsEditingSurface,
    solidCells, setSolidCells,
    isNightMode, setIsNightMode,
    isEditingSurfaceRef, solidCellsRef,
    isCellVisible, getLineCells
  } = useFogOfWar(socket, GRID_SIZE);

  const {
    zoom, setZoom,
    pan, setPan,
    viewportRef, boardRef,
    ghostRef, snapRef,
    drag, wasDraggingRef,
    handleViewportMouseDown,
    handleTokenMouseDown
  } = useBoardInteraction({
    socket,
    CELL_PX,
    GRID_SIZE,
    isEditingSurfaceRef,
    solidCellsRef,
    boardTokens,
    userRole,
    currentUser,
    setActiveTokenId
  });

  const {
    contextMenu, setContextMenu,
    isCreatingChest, setIsCreatingChest,
    chestPassword, setChestPassword,
    isSelectingCompendiumItem, setIsSelectingCompendiumItem,
    itemSearchQuery, setItemSearchQuery,
    selectedChestToken, setSelectedChestToken,
    passwordPromptChest, setPasswordPromptChest,
    enteredPassword, setEnteredPassword,
    passwordError, setPasswordError,
    selectedItemToken, setSelectedItemToken,
    compendiumSlotIndex, setCompendiumSlotIndex,
    isCreatingNote, setIsCreatingNote,
    noteText, setNoteText,
    selectedNoteToken, setSelectedNoteToken,
    isCreatingImage, setIsCreatingImage,
    imageUrlInput, setImageUrlInput,
    selectedImageToken, setSelectedImageToken,
    isCreatingAoe, setIsCreatingAoe,
    aoeForm, setAoeForm,
    selectedAoeToken, setSelectedAoeToken,
    activeAoeTool, setActiveAoeTool,
    handleBoardContextMenu, handleCreateChestSubmit, handleSpawnItem,
    handleVerifyPasswordSubmit, handleChestSlotClick, handleSelectItemForSlot,
    handleLootItemClick, handleLootAllCoins, handlePickupFloorItem,
    handleCreateNoteSubmit, handleCreateImageSubmit, handleImageFileChange,
    handleSpawnAoe
  } = useGridObjects(
    socket, userRole, currentUser, boardTokens, characters, zoom, CELL_PX, GRID_SIZE, boardRef, viewportRef, pan
  );

  useEffect(() => {
    socket.on('grid:bg-update', (img: string) => setBgImage(img));
    socket.on('combat:save-notification', (data: any) => setSaveNotification(data));
    return () => {
      socket.off('grid:bg-update');
      socket.off('combat:save-notification');
    };
  }, [socket]);

  const uiProps = {
    socket, userRole, currentUser, boardTokens, characters, monsters, chatMessages, compendium,
    onOpenCharacterSheet, onOpenMonsterSheet, campaignImage,
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
