const fs = require('fs');
const path = 'src/renderer/components/GrillaCombate.tsx';
const content = fs.readFileSync(path, 'utf8');

const returnIdx = content.indexOf("  return (\\n    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-base)', position: 'relative' }}");

if (returnIdx === -1) {
    console.error("Could not find return statement");
    process.exit(1);
}

const importsAndTop = `import React, { useEffect, useState, useRef } from 'react';
import { Ghost, HeartCrack, Flame, Snowflake, Moon, Shield, Zap, Biohazard, Activity, X, User, Backpack, Dices, StickyNote, Box, Lock, Coins, Swords, ArrowRight } from 'lucide-react';
import { ChatPanel } from './PanelChat';
import { NoteTokenIcon, ImageTokenIcon, ClosedChestIcon, OpenChestIcon, ItemDropIcon, CompassIcon, LineAoeIcon, ConeAoeIcon, CircleAoeIcon, SquareAoeIcon, getAoeIcon } from '../shared/components/iconos';

import { useFogOfWar } from '../features/combat/hooks/useFogOfWar';
import { useBoardInteraction } from '../features/combat/hooks/useBoardInteraction';
import { useCombatState } from '../features/combat/hooks/useCombatState';
import { useGridObjects } from '../features/combat/hooks/useGridObjects';

const CELL_PX = 50;
const GRID_SIZE = 30;
const BOARD_PX = GRID_SIZE * CELL_PX;

const renderConditionIcon = (emo: string) => {
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
    default: return emo as any;
  }
};

export const CombatGrid = ({ socket, userRole, currentUser, boardTokens, characters, monsters, chatMessages, compendium = [], onOpenCharacterSheet, onOpenMonsterSheet }: any) => {
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

  // Visibilidad en el Panel de Combatientes (Sidebar)
  const canSeeInSidebar = (t: any) => {
    if (t.type === 'chest' || t.type === 'item' || t.type === 'note' || t.type === 'image' || t.type === 'aoe') return false;
    if (userRole === 'dm' || userRole === 'admin') return true;
    const myCharToken = boardTokens.find((charToken: any) => charToken.type === 'character' && charToken.owner === currentUser?.name);
    const myTeam = myCharToken?.teamColor;
    if (!myTeam || !t.teamColor) return false;
    return t.teamColor === myTeam;
  };
`;

const newContent = importsAndTop + '\n' + content.substring(returnIdx);

fs.writeFileSync(path, newContent);
console.log('Updated GrillaCombate.tsx logic successfully!');
