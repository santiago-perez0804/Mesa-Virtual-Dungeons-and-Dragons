import React, { useEffect, useState } from 'react';
import { Ghost, User, Backpack, Dices, StickyNote, Box, Lock, Coins, Swords, ArrowRight } from 'lucide-react';
import { ChatPanel } from './PanelChat';
import { NoteTokenIcon, ImageTokenIcon, ClosedChestIcon, OpenChestIcon, ItemDropIcon, LineAoeIcon, ConeAoeIcon, CircleAoeIcon, SquareAoeIcon, getAoeIcon } from '../shared/components/iconos';
import { CELL_PX, GRID_SIZE, BOARD_PX } from '../modules/combate/grilla.constantes';
import { getGridItemCategory, safeParseGridInventory } from '../modules/combate/grilla.inventario';
import { renderConditionIcon } from './combate/ConditionIcon';
import { NotificacionSalvacion } from './combate/NotificacionSalvacion';
import { ModalCrearNota } from './combate/modales/ModalCrearNota';
import { ModalColocarImagen } from './combate/modales/ModalColocarImagen';
import { ModalNotaMapa } from './combate/modales/ModalNotaMapa';
import { ModalImagenMapa } from './combate/modales/ModalImagenMapa';
import { ModalObjetoSuelo } from './combate/modales/ModalObjetoSuelo';
import { ModalCrearAoe, ModalEditarAoe } from './combate/modales/ModalesAoe';
import { ModalCrearCofre, ModalSeleccionarObjeto, ModalContrasenaCofre } from './combate/modales/ModalesCofre';
import { useNieblaGuerra } from '../modules/combate/hooks/useNieblaGuerra';
import { useArrastrarYPaneo } from '../modules/combate/hooks/useArrastrarYPaneo';
import { useSincronizacionTablero } from '../modules/combate/hooks/useSincronizacionTablero';

export const CombatGrid = ({ socket, userRole, currentUser, boardTokens, characters, monsters, chatMessages, compendium = [], onOpenCharacterSheet, onOpenMonsterSheet }: any) => {
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgInputUrl, setBgInputUrl] = useState('');
  const [zoom, setZoom] = useState(1);
  const [showGridLines, setShowGridLines] = useState(true);
  const [gridOpacity] = useState(0.2);
  const [saveNotification, setSaveNotification] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);

  // Estado del combate
  const [combatState, setCombatState] = useState<{ turnModeActive: boolean, initiativeOrder: {tokenId: string, value: number}[], currentTurnIndex: number }>({
    turnModeActive: false,
    initiativeOrder: [],
    currentTurnIndex: 0
  });

  const currentTurnTokenId = combatState.initiativeOrder[combatState.currentTurnIndex]?.tokenId;
  const currentToken = boardTokens.find((t: any) => t.instanceId === currentTurnTokenId);
  const isMyTurn = currentToken && currentToken.owner === currentUser?.name;
  const blockRolls = userRole !== 'dm' && userRole !== 'admin' && combatState.turnModeActive && !isMyTurn;

  const [activeTokenId, setActiveTokenId] = useState<string | null>(null);
  const [viewingToken, setViewingToken] = useState<any>(null);
  const [sidebarTab, setSidebarTab] = useState<'combatants' | 'objects'>('combatants');
  const [prevSidebarTab, setPrevSidebarTab] = useState<'combatants' | 'objects' | null>(null);
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);

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
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isCreatingImage, setIsCreatingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [selectedNoteToken, setSelectedNoteToken] = useState<any>(null);
  const [selectedImageToken, setSelectedImageToken] = useState<any>(null);

  // Estados para Áreas de Efecto
  const [isCreatingAoe, setIsCreatingAoe] = useState(false);
  const [aoeForm, setAoeForm] = useState({ shape: 'circle', size1: 3, size2: 1, color: '#ef4444' });
  const [selectedAoeToken, setSelectedAoeToken] = useState<any>(null);
  const [activeActionMenu, setActiveActionMenu] = useState<'PH' | 'TS' | null>(null);
  const [isRadialOpen, setIsRadialOpen] = useState(false);
  const [activeAoeTool, setActiveAoeTool] = useState<string | null>(null);

  useEffect(() => {
    setActiveActionMenu(null);
  }, [activeTokenId]);

  // Estados para Salud y Condiciones
  const [healthModalToken, setHealthModalToken] = useState<any>(null);
  const [healthInput, setHealthInput] = useState<string>('');
  const [conditionInput, setConditionInput] = useState<string>('');

  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Estados para Fog of War y Edición de Mapa
  const [isEditingSurface, setIsEditingSurface] = useState(false);
  const [solidCells, setSolidCells] = useState<Set<string>>(new Set());
  const [isNightMode, setIsNightMode] = useState(false);

  
  const [drag, setDrag] = useState<any>(null); // solo para forzar re-render al soltar

  // Arrastre de tokens, paneo, pintado de muros y zoom (ver useArrastrarYPaneo)
  const {
    viewportRef, boardRef, ghostRef, snapRef, wasDraggingRef, panRef,
    handleViewportMouseDown, handleTokenMouseDown,
  } = useArrastrarYPaneo({
    socket, zoom, setZoom, isEditingSurface, solidCells, setSolidCells,
    userRole, currentUser, boardTokens, setActiveTokenId, setDrag, setPan,
  });

  // Estados para Cofres y Objetos Interactivos
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, cellX: number, cellY: number } | null>(null);
  const [isCreatingChest, setIsCreatingChest] = useState(false);
  const [chestPassword, setChestPassword] = useState('');
  const [isSelectingCompendiumItem, setIsSelectingCompendiumItem] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [selectedChestToken, setSelectedChestToken] = useState<any>(null);
  const [passwordPromptChest, setPasswordPromptChest] = useState<any>(null);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedItemToken, setSelectedItemToken] = useState<any>(null);
  const [compendiumSlotIndex, setCompendiumSlotIndex] = useState<number | null>(null);

  // Helpers para Cofres y Objetos Interactivos
  const handleBoardContextMenu = (e: React.MouseEvent) => {
    if (userRole !== 'dm' && userRole !== 'admin') return;
    e.preventDefault();
    e.stopPropagation();
    const bRect = boardRef.current?.getBoundingClientRect();
    if (!bRect) return;
    const localX = (e.clientX - bRect.left) / zoom;
    const localY = (e.clientY - bRect.top) / zoom;
    const cellX = Math.floor(localX / CELL_PX);
    const cellY = Math.floor(localY / CELL_PX);
    if (cellX >= 0 && cellX < GRID_SIZE && cellY >= 0 && cellY < GRID_SIZE) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        cellX,
        cellY
      });
    }
  };

  const handleCreateChestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contextMenu) return;
    if (!chestPassword.trim()) {
      alert("Debes ingresar una contraseña para el cofre.");
      return;
    }
    
    socket.emit('token:spawn', {
      id: 'chest',
      name: 'Cofre Cerrado',
      type: 'chest',
      hp: 10,
      max_hp: 10,
      ac: 15,
      x: contextMenu.cellX,
      y: contextMenu.cellY,
      image: 'chest_closed',
      chestData: {
        password: chestPassword,
        isOpen: false,
        slots: Array(9).fill(null), // 3x3 slots
        coins: { pc: 0, pl: 0, el: 0, po: 0, pt: 0 }
      }
    });
    
    setIsCreatingChest(false);
    setChestPassword('');
    setContextMenu(null);
  };

  const handleSpawnItem = (item: any) => {
    if (!contextMenu) return;
    let itemData: any = {};
    try {
      itemData = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
    } catch {
      itemData = item.data || {};
    }
    
    socket.emit('token:spawn', {
      id: item.id,
      name: item.name,
      type: 'item',
      hp: 10,
      max_hp: 10,
      ac: 10,
      x: contextMenu.cellX,
      y: contextMenu.cellY,
      image: itemData.image || null,
      itemData: {
        id: item.id,
        name: item.name,
        description: itemData.description || itemData.desc || '',
        rarity: itemData.rarity || 'Común',
        data: itemData
      }
    });
    
    setIsSelectingCompendiumItem(false);
    setItemSearchQuery('');
    setContextMenu(null);
  };

  const handleVerifyPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordPromptChest) return;
    
    if (enteredPassword === passwordPromptChest.chestData?.password) {
      socket.emit('token:update-chest', {
        tokenId: passwordPromptChest.instanceId,
        name: 'Cofre Abierto',
        chestData: { isOpen: true }
      });
      
      socket.emit('chat:send', {
        id: Date.now() + Math.random(),
        sender: 'Sistema',
        to: 'all',
        text: `🔓 **${currentUser.name}** abrió un cofre con la contraseña correcta en la celda [${passwordPromptChest.x}, ${passwordPromptChest.y}].`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      });
      
      setSelectedChestToken(passwordPromptChest);
      setPasswordPromptChest(null);
      setEnteredPassword('');
      setPasswordError('');
    } else {
      setPasswordError('Contraseña incorrecta. Inténtalo de nuevo.');
    }
  };

  const handleChestSlotClick = (index: number) => {
    if (userRole !== 'dm' && userRole !== 'admin') return;
    
    const activeChest = boardTokens.find((t: any) => t.instanceId === selectedChestToken?.instanceId);
    if (!activeChest) return;
    
    const itemInSlot = activeChest.chestData?.slots[index];
    if (itemInSlot) {
      if (confirm(`¿Quitar "${itemInSlot.name}" del cofre?`)) {
        const newSlots = [...activeChest.chestData.slots];
        newSlots[index] = null;
        socket.emit('token:update-chest', {
          tokenId: activeChest.instanceId,
          chestData: { slots: newSlots }
        });
      }
    } else {
      setCompendiumSlotIndex(index);
    }
  };

  const handleSelectItemForSlot = (item: any) => {
    const activeChest = boardTokens.find((t: any) => t.instanceId === selectedChestToken?.instanceId);
    if (!activeChest || compendiumSlotIndex === null) return;
    
    let itemData: any = {};
    try {
      itemData = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
    } catch {
      itemData = item.data || {};
    }
    
    const newSlots = [...activeChest.chestData.slots];
    newSlots[compendiumSlotIndex] = {
      id: item.id,
      name: item.name,
      description: itemData.description || itemData.desc || '',
      rarity: itemData.rarity || 'Común',
      data: itemData
    };
    
    socket.emit('token:update-chest', {
      tokenId: activeChest.instanceId,
      chestData: { slots: newSlots }
    });
    
    setCompendiumSlotIndex(null);
  };

  const safeParseInventory = safeParseGridInventory;
  const getItemCategory = getGridItemCategory;

  const handleLootItemClick = (index: number) => {
    const activeChest = boardTokens.find((t: any) => t.instanceId === selectedChestToken?.instanceId);
    if (!activeChest) return;
    
    const item = activeChest.chestData?.slots[index];
    if (!item) return;
    
    const char = characters.find((c: any) => userRole === 'dm' || c.owner === currentUser.name);
    if (!char) {
      alert("No tienes ningún personaje activo para equipar este objeto.");
      return;
    }

    const parsedInv = safeParseInventory(char.inventory);
    const category = getItemCategory(item.data || {});
    parsedInv[category].push({
      name: item.name,
      description: item.description,
      rarity: item.rarity,
      ...item.data
    });
    
    socket.emit('character:update', {
      ...char,
      inventory: JSON.stringify(parsedInv)
    });
    
    const newSlots = [...activeChest.chestData.slots];
    newSlots[index] = null;
    socket.emit('token:update-chest', {
      tokenId: activeChest.instanceId,
      chestData: { slots: newSlots }
    });
    
    socket.emit('chat:send', {
      id: Date.now() + Math.random(),
      sender: 'Sistema',
      to: 'all',
      text: `🎒 **${char.name}** tomó **${item.name}** del cofre.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    });
  };

  const handleLootAllCoins = () => {
    const activeChest = boardTokens.find((t: any) => t.instanceId === selectedChestToken?.instanceId);
    if (!activeChest) return;
    
    const coins = activeChest.chestData?.coins;
    if (!coins) return;
    
    const totalCoins = (Number(coins.pc) || 0) + (Number(coins.pl) || 0) + (Number(coins.el) || 0) + (Number(coins.po) || 0) + (Number(coins.pt) || 0);
    if (totalCoins === 0) {
      alert("El cofre no tiene monedas.");
      return;
    }
    
    const char = characters.find((c: any) => userRole === 'dm' || c.owner === currentUser.name);
    if (!char) {
      alert("No tienes ningún personaje activo para recibir las monedas.");
      return;
    }
    
    const parsedInv = safeParseInventory(char.inventory);
    if (!parsedInv.coins) {
      parsedInv.coins = { pc: 0, pl: 0, el: 0, po: 0, pt: 0 };
    }
    
    parsedInv.coins.pc = (Number(parsedInv.coins.pc) || 0) + (Number(coins.pc) || 0);
    parsedInv.coins.pl = (Number(parsedInv.coins.pl) || 0) + (Number(coins.pl) || 0);
    parsedInv.coins.el = (Number(parsedInv.coins.el) || 0) + (Number(coins.el) || 0);
    parsedInv.coins.po = (Number(parsedInv.coins.po) || 0) + (Number(coins.po) || 0);
    parsedInv.coins.pt = (Number(parsedInv.coins.pt) || 0) + (Number(coins.pt) || 0);
    
    socket.emit('character:update', {
      ...char,
      inventory: JSON.stringify(parsedInv)
    });
    
    socket.emit('token:update-chest', {
      tokenId: activeChest.instanceId,
      chestData: { coins: { pc: 0, pl: 0, el: 0, po: 0, pt: 0 } }
    });
    
    const coinStrings: string[] = [];
    if (Number(coins.pc) > 0) coinStrings.push(`${coins.pc} pc`);
    if (Number(coins.pl) > 0) coinStrings.push(`${coins.pl} pl`);
    if (Number(coins.el) > 0) coinStrings.push(`${coins.el} el`);
    if (Number(coins.po) > 0) coinStrings.push(`${coins.po} po`);
    if (Number(coins.pt) > 0) coinStrings.push(`${coins.pt} pt`);
    
    socket.emit('chat:send', {
      id: Date.now() + Math.random(),
      sender: 'Sistema',
      to: 'all',
      text: `💰 **${char.name}** tomó las monedas del cofre: **${coinStrings.join(', ')}**.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    });
  };

  const handlePickupFloorItem = () => {
    if (!selectedItemToken) return;
    
    const char = characters.find((c: any) => userRole === 'dm' || c.owner === currentUser.name);
    if (!char) {
      alert("No tienes ningún personaje activo para recoger este objeto.");
      return;
    }
    
    const item = selectedItemToken.itemData;
    if (!item) return;
    
    const parsedInv = safeParseInventory(char.inventory);
    const category = getItemCategory(item.data || {});
    parsedInv[category].push({
      name: item.name,
      description: item.description,
      rarity: item.rarity,
      ...item.data
    });
    
    socket.emit('character:update', {
      ...char,
      inventory: JSON.stringify(parsedInv)
    });
    
    socket.emit('token:remove', selectedItemToken.instanceId);
    
    socket.emit('chat:send', {
      id: Date.now() + Math.random(),
      sender: 'Sistema',
      to: 'all',
      text: `🎒 **${char.name}** recogió **${item.name}** del suelo en la celda [${selectedItemToken.x}, ${selectedItemToken.y}].`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    });
    
    setSelectedItemToken(null);
  };

  const handleCreateNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contextMenu) return;
    if (!noteText.trim()) {
      alert("Debes ingresar el texto para la nota.");
      return;
    }
    
    socket.emit('token:spawn', {
      id: 'note',
      name: 'Nota de la Grilla',
      type: 'note',
      hp: 10,
      max_hp: 10,
      ac: 10,
      x: contextMenu.cellX,
      y: contextMenu.cellY,
      image: 'note_icon',
      noteData: {
        text: noteText
      }
    });
    
    setIsCreatingNote(false);
    setNoteText('');
    setContextMenu(null);
  };

  const handleCreateImageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contextMenu) return;
    if (!imageUrlInput.trim()) {
      alert("Debes cargar una imagen.");
      return;
    }
    
    socket.emit('token:spawn', {
      id: 'image_token',
      name: 'Imagen de la Grilla',
      type: 'image',
      hp: 10,
      max_hp: 10,
      ac: 10,
      x: contextMenu.cellX,
      y: contextMenu.cellY,
      image: 'image_icon',
      imageData: {
        url: imageUrlInput
      }
    });
    
    setIsCreatingImage(false);
    setImageUrlInput('');
    setContextMenu(null);
  };

  const handleImageFileChange = async (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const backendUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
      const uploadUrl = `${backendUrl}/api/upload?folder=misc`;
      
      try {
        const res = await fetch(uploadUrl, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          setImageUrlInput(data.url);
        } else {
          alert('Error al subir imagen: ' + data.error);
        }
      } catch (err) {
        console.error(err);
        alert('Error de conexión al subir la imagen');
      }
    }
  };

  const handleSpawnAoe = (e: React.FormEvent) => {
    e.preventDefault();
    let cellX = Math.floor(GRID_SIZE / 2);
    let cellY = Math.floor(GRID_SIZE / 2);
    
    if (viewportRef.current) {
      const vRect = viewportRef.current.getBoundingClientRect();
      const centerX = vRect.width / 2;
      const centerY = vRect.height / 2;
      const localX = (centerX - panRef.current.x) / zoom;
      const localY = (centerY - panRef.current.y) / zoom;
      cellX = Math.max(0, Math.min(Math.floor(localX / CELL_PX), GRID_SIZE - 1));
      cellY = Math.max(0, Math.min(Math.floor(localY / CELL_PX), GRID_SIZE - 1));
    }
    
    socket.emit('token:spawn', {
      id: `aoe_${Date.now()}`,
      name: `Área de Efecto`,
      type: 'aoe',
      hp: 1,
      max_hp: 1,
      ac: 10,
      x: cellX,
      y: cellY,
      aoeData: {
        shape: aoeForm.shape,
        size1: aoeForm.size1,
        size2: aoeForm.size2,
        color: aoeForm.color,
        rotation: 0
      }
    });
    
    setIsCreatingAoe(false);
  };

  useSincronizacionTablero({ socket, setBgImage, setSaveNotification, setSolidCells, setIsNightMode, setCombatState });

  const myCharToken = boardTokens.find((t: any) => t.type === 'character' && t.owner === currentUser?.name);
  const myTeam = myCharToken?.teamColor || null;

  // Niebla de guerra: celdas visibles + canvas de máscara (ver useNieblaGuerra)
  const { visibleCells, fowCanvasRef } = useNieblaGuerra({ boardTokens, solidCells, myTeam, currentUser, userRole, isNightMode });


  // Visibilidad en la Grilla (Mapa)
  const canSeeOnGrid = (t: any) => {
    if (userRole === 'dm' || userRole === 'admin') return true; // El DM siempre ve todos los tokens
    if (t.owner === currentUser?.name || (myTeam && t.teamColor === myTeam)) return true; // Veo a mis aliados siempre
    if (t.type === 'aoe') return true; // Por ahora las áreas son siempre visibles
    
    const tx = Math.floor(t.x);
    const ty = Math.floor(t.y);
    return visibleCells.has(`${tx},${ty}`);
  };

  // Visibilidad en el Panel de Combatientes (Sidebar)
  const canSeeInSidebar = (t: any) => {
    if (t.type === 'chest' || t.type === 'item' || t.type === 'note' || t.type === 'image' || t.type === 'aoe') return false; // Excluir objetos, notas, imágenes y áreas de la sección de combatientes
    if (userRole === 'dm' || userRole === 'admin') return true; // El DM/Admin ve todos
    
    // Si es un jugador, debe tener un personaje con color asignado
    const myCharToken = boardTokens.find((charToken: any) => charToken.type === 'character' && charToken.owner === currentUser?.name);
    const myTeam = myCharToken?.teamColor;
    
    if (!myTeam || !t.teamColor) return false;
    return t.teamColor === myTeam;
  };

  // Derived state for Turns
  const allCombatantsRolled = React.useMemo(() => {
    const combatTokens = boardTokens.filter((t: any) => t.type === 'character' || t.type === 'monster');
    if (combatTokens.length === 0) return false;
    return combatTokens.every((t: any) => combatState.initiativeOrder.some(i => i.tokenId === t.instanceId));
  }, [boardTokens, combatState.initiativeOrder]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-base)', position: 'relative' }} onClick={() => { setActiveTokenId(null); setContextMenu(null); }}>

      {/* TOOLBAR SUPERIOR */}
      <div style={{ padding: '8px 0px', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '15px', alignItems: 'center', zIndex: 100 }}>
        
        {/* COLUMNA 1 — Panel de personajes (izquierda fija, alineada con panel lateral) */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          alignItems: 'center', 
          flexShrink: 0,
          width: isSidebarOpen ? '320px' : '190px',
          paddingLeft: '20px',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxSizing: 'border-box',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}>
          <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.2rem', letterSpacing: '1px' }}>COMBATE</h2>
          
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="torch-glow"
            style={{
              position: 'relative',
              background: isSidebarOpen ? 'rgba(200,135,42,0.15)' : 'rgba(0,0,0,0.5)',
              border: `1.5px solid ${isSidebarOpen ? 'var(--accent-gold)' : 'var(--border-color)'}`,
              color: isSidebarOpen ? 'var(--accent-gold)' : 'var(--text-secondary)',
              width: '40px',
              height: '32px',
              padding: 0,
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: isSidebarOpen ? '0 0 8px rgba(201,168,76,0.4)' : 'none',
              flexShrink: 0
            }}
            title={isSidebarOpen ? "Ocultar panel de combatientes" : "Mostrar panel de combatientes"}
          >
            {isSidebarOpen ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'block' }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
            )}
          </button>
        </div>

        {/* Separador 1 */}
        <div className="divider" style={{ width: '1px', height: '24px', background: 'rgba(201,168,76,0.3)', alignSelf: 'center', flexShrink: 0 }} />

        {/* COLUMNA 2 — Controles principales (centro, flex-grow: 1) */}
        <div style={{ display: 'flex', flexGrow: 1, justifyContent: 'space-between', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingRight: '10px' }}>
          {/* Lado izquierdo de Columna 2 */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {(userRole === 'dm' || userRole === 'admin') && (
              <>
                <input
                  className="mono"
                  style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '6px 10px', fontSize: '0.75rem', width: 'clamp(90px, 12vw, 180px)' }}
                  placeholder="URL del Mapa..."
                  value={bgInputUrl}
                  onChange={(e) => setBgInputUrl(e.target.value)}
                />
                
                {/* APLICAR (Checkmark icon) */}
                <button
                  onClick={() => { if (bgInputUrl) socket.emit('grid:set-bg', bgInputUrl); }}
                  className="torch-glow"
                  style={{ 
                    background: 'var(--accent-gold)', 
                    color: 'white', 
                    border: 'none', 
                    width: '32px', 
                    height: '30px', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: 0 
                  }}
                  title="APLICAR"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>

                {/* LIMPIAR MAPA (Trash icon, neutral color) */}
                <button 
                  onClick={() => { if (confirm("¿Limpiar todo el mapa?")) socket.emit('board:clear'); }} 
                  className="torch-glow" 
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    color: 'var(--text-secondary)', 
                    border: '1px solid var(--border-color)', 
                    width: '32px', 
                    height: '30px', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: 0 
                  }}
                  title="LIMPIAR MAPA"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>

                {/* EDITAR SUPERFICIE (Pencil icon) */}
                <button 
                  onClick={() => setIsEditingSurface(!isEditingSurface)} 
                  className="torch-glow" 
                  style={{ 
                    background: isEditingSurface ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)', 
                    color: isEditingSurface ? 'var(--bg-base)' : 'var(--text-secondary)', 
                    border: '1px solid var(--border-color)', 
                    width: '32px', 
                    height: '30px', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: 0 
                  }}
                  title={isEditingSurface ? 'Terminar Edición de Superficie' : 'Editar Superficie del Mapa'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Lado derecho de Columna 2 */}
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {/* TURNOS */}
            {(userRole === 'dm' || userRole === 'admin') && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {!combatState.turnModeActive ? (
                  <button
                    onClick={() => {
                      if (allCombatantsRolled) {
                        socket.emit('combat:toggle-turn-mode', true);
                      }
                    }}
                    disabled={!allCombatantsRolled}
                    className="torch-glow"
                    style={{
                      background: 'var(--accent-gold)',
                      color: 'var(--bg-base)',
                      border: 'none',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      cursor: !allCombatantsRolled ? 'not-allowed' : 'pointer',
                      opacity: !allCombatantsRolled ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Modo Turnos"
                  >
                    <Swords className="w-5 h-5" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => socket.emit('combat:toggle-turn-mode', false)}
                      className="font-cinzel torch-glow"
                      style={{
                        background: 'transparent',
                        color: 'var(--accent-gold)',
                        border: '1px solid var(--accent-gold)',
                        padding: '6px 14px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        letterSpacing: '1px'
                      }}
                    >
                      FINALIZAR
                    </button>
                    <button
                      onClick={() => socket.emit('combat:next-turn')}
                      className="torch-glow"
                      style={{ 
                        background: 'transparent', 
                        color: 'var(--natural-green)', 
                        border: '1px solid var(--natural-green)', 
                        padding: '6px 10px', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Siguiente Turno"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Pasar Turno para Jugadores */}
            {(userRole !== 'dm' && userRole !== 'admin') && combatState.turnModeActive && (() => {
              const currentTurnTokenId = combatState.initiativeOrder[combatState.currentTurnIndex]?.tokenId;
              const currentToken = boardTokens.find((t: any) => t.instanceId === currentTurnTokenId);
              const isMyTurn = currentToken && currentToken.owner === currentUser?.name;
              
              return (
                <button
                  onClick={() => {
                    if (isMyTurn) socket.emit('combat:next-turn');
                  }}
                  disabled={!isMyTurn}
                  className="font-cinzel torch-glow"
                  style={{ 
                    background: isMyTurn ? 'var(--natural-green)' : 'rgba(255,255,255,0.1)', 
                    color: isMyTurn ? 'white' : 'var(--text-secondary)', 
                    border: '1px solid ' + (isMyTurn ? 'var(--natural-green)' : 'var(--border-color)'), 
                    padding: '6px 14px', 
                    borderRadius: '4px', 
                    cursor: isMyTurn ? 'pointer' : 'default', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold', 
                    animation: isMyTurn ? 'pulse 2s infinite' : 'none' 
                  }}
                >
                  {isMyTurn ? 'Terminar mi Turno ➡️' : 'Turno de otro ➡️'}
                </button>
              );
            })()}

            {/* DIA / NOCHE */}
            {(userRole === 'dm' || userRole === 'admin') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: isNightMode ? 0.4 : 1, transition: 'opacity 0.3s ease', display: 'block' }}>
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>

                <button
                  onClick={() => socket.emit('grid:set-night', !isNightMode)}
                  style={{
                    position: 'relative', width: '46px', height: '24px', borderRadius: '12px',
                    background: isNightMode ? '#1e293b' : '#f59e0b',
                    border: '1px solid ' + (isNightMode ? '#334155' : '#fbbf24'),
                    cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isNightMode ? 'inset 0 2px 4px rgba(0,0,0,0.6)' : 'inset 0 2px 4px rgba(255,255,255,0.3)',
                    overflow: 'hidden'
                  }}
                  title={isNightMode ? 'Modo Noche activo' : 'Modo Día activo'}
                >
                  <div style={{
                    position: 'absolute', left: isNightMode ? '24px' : '2px', width: '18px', height: '18px',
                    borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {isNightMode ? '🌙' : '☀️'}
                  </div>
                </button>

                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: isNightMode ? 1 : 0.4, transition: 'opacity 0.3s ease', display: 'block' }}>
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Separador 2 */}
        <div className="divider" style={{ width: '1px', height: '24px', background: 'rgba(201,168,76,0.3)', alignSelf: 'center', flexShrink: 0 }} />

        {/* COLUMNA 3 — Panel de mesa/chat (derecha fija, alineada con panel de chat) */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          alignItems: 'center', 
          justifyContent: 'flex-end',
          flexShrink: 0,
          width: isChatOpen ? '300px' : '130px',
          paddingRight: '20px',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxSizing: 'border-box',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}>
          {/* GRILLA (Grid icon, no text) */}
          <button
            onClick={() => setShowGridLines(!showGridLines)}
            className="torch-glow"
            style={{
              position: 'relative',
              background: 'rgba(0,0,0,0.5)',
              border: `1.5px solid ${showGridLines ? 'var(--accent-gold)' : 'var(--border-color)'}`,
              color: showGridLines ? 'var(--accent-gold)' : 'var(--text-secondary)',
              width: '40px',
              height: '32px',
              padding: 0,
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: showGridLines ? '0 0 8px rgba(201,168,76,0.4)' : 'none',
              flexShrink: 0
            }}
            title={showGridLines ? "Ocultar grilla" : "Mostrar grilla"}
          >
            {showGridLines ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <line x1="15" y1="3" x2="15" y2="21" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="3" y1="15" x2="21" y2="15" />
                </svg>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'block' }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <line x1="15" y1="3" x2="15" y2="21" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="3" y1="15" x2="21" y2="15" />
                  <line x1="3" y1="3" x2="21" y2="21" stroke="var(--text-secondary)" strokeWidth="2" />
                </svg>
              </div>
            )}
          </button>
          
          {/* CHAT TOGGLE */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="torch-glow"
            style={{
              position: 'relative',
              background: 'rgba(0,0,0,0.5)',
              border: `1.5px solid ${isChatOpen ? 'var(--accent-gold)' : 'var(--border-color)'}`,
              color: isChatOpen ? 'var(--accent-gold)' : 'var(--text-secondary)',
              width: '40px',
              height: '32px',
              padding: 0,
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: isChatOpen ? '0 0 8px rgba(201,168,76,0.4)' : 'none',
              flexShrink: 0
            }}
            title={isChatOpen ? "Ocultar chat" : "Mostrar chat"}
          >
            {isChatOpen ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'block' }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <line x1="3" y1="3" x2="21" y2="21" stroke="var(--text-secondary)" strokeWidth="2" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* COLUMNA IZQ: COMBATIENTES u OBJETOS */}
        <div style={{
          width: isSidebarOpen ? '320px' : '0px',
          minWidth: isSidebarOpen ? '320px' : '0px',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'rgba(0,0,0,0.2)',
          borderRight: isSidebarOpen ? '1px solid var(--border-color)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          <div style={{ width: '320px', height: '100%', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          
          {/* ── HEADER DE PESTAÑAS PREMIUM ── */}
          <div style={{ padding: '14px 16px 0', background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '4px', position: 'relative' }}>
              {/* Pill deslizante */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: sidebarTab === 'combatants' ? '0%' : '50%',
                width: '50%',
                height: '2px',
                background: 'var(--accent-gold)',
                boxShadow: '0 0 8px rgba(200,135,42,0.8)',
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: '2px 2px 0 0'
              }} />

              <button
                onClick={() => switchTab('combatants')}
                className="font-cinzel"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: sidebarTab === 'combatants' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  padding: '10px 8px 14px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  letterSpacing: '1.2px',
                  fontWeight: 'bold',
                  transition: 'color 0.25s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  textTransform: 'uppercase'
                }}
              >
                Combatientes
              </button>

              <button
                onClick={() => switchTab('objects')}
                className="font-cinzel"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: sidebarTab === 'objects' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  padding: '10px 8px 14px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  letterSpacing: '1.2px',
                  fontWeight: 'bold',
                  transition: 'color 0.25s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  textTransform: 'uppercase'
                }}
              >
                Objetos
              </button>
            </div>
          </div>

          {/* ── CONTENIDO CON SLIDE + FADE ── */}
          <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
            {/* Panel Combatientes */}
            <div style={{
              position: 'absolute',
              inset: 0,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              overflowY: 'auto',
              animation: sidebarTab === 'combatants'
                ? (prevSidebarTab === 'objects' ? 'slideInFromLeft 0.28s cubic-bezier(0.4,0,0.2,1) forwards' : 'fadeInPanel 0.2s ease forwards')
                : (isTabTransitioning && prevSidebarTab === 'combatants' ? 'slideOutToLeft 0.22s cubic-bezier(0.4,0,0.2,1) forwards' : 'none'),
              pointerEvents: sidebarTab === 'combatants' ? 'auto' : 'none',
              visibility: sidebarTab === 'combatants' || (isTabTransitioning && prevSidebarTab === 'combatants') ? 'visible' : 'hidden'
            }}>
              {(() => {
                const sortedCombatants = [...boardTokens].filter(canSeeInSidebar).sort((a: any, b: any) => {
                  const aInit = combatState.initiativeOrder.findIndex(i => i.tokenId === a.instanceId);
                  const bInit = combatState.initiativeOrder.findIndex(i => i.tokenId === b.instanceId);
                  if (aInit !== -1 && bInit !== -1) return aInit - bInit;
                  if (aInit !== -1) return -1;
                  if (bInit !== -1) return 1;
                  return 0;
                });

                  return sortedCombatants.map((t: any, idx: number) => {
                    const isChar = t.type === 'character';
                  const initIndex = combatState.initiativeOrder.findIndex(i => i.tokenId === t.instanceId);
                  const isTheirTurn = combatState.turnModeActive && initIndex !== -1 && combatState.currentTurnIndex === initIndex;

                  return (
                  <div key={t.instanceId}
                    className={`clipped-frame torch-glow ${activeTokenId === t.instanceId ? 'active' : ''}`}
                    draggable={userRole === 'dm' || userRole === 'admin'}
                    onDragStart={(e) => { e.dataTransfer.setData('text/plain', t.instanceId); }}
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const draggedId = e.dataTransfer.getData('text/plain');
                      if (draggedId !== t.instanceId && (userRole === 'dm' || userRole === 'admin')) {
                        const newOrder = [...combatState.initiativeOrder];
                        const draggedIndex = newOrder.findIndex(i => i.tokenId === draggedId);
                        const dropIndex = newOrder.findIndex(i => i.tokenId === t.instanceId);
                        if (draggedIndex !== -1 && dropIndex !== -1) {
                          const [draggedItem] = newOrder.splice(draggedIndex, 1);
                          newOrder.splice(dropIndex, 0, draggedItem);
                          socket.emit('combat:reorder-initiative', newOrder);
                        }
                      }
                    }}
                    style={{
                      padding: '12px',
                      border: isTheirTurn ? '1px solid var(--natural-green)' : (activeTokenId === t.instanceId ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)'),
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, background 0.2s',
                      background: isTheirTurn ? 'rgba(34, 197, 94, 0.15)' : (activeTokenId === t.instanceId ? 'rgba(200, 135, 42, 0.1)' : 'var(--bg-surface)'),
                      animation: `sidebarItemIn 0.3s ease both`,
                      animationDelay: `${idx * 40}ms`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      position: 'relative'
                    }}
                    onClick={(e) => { e.stopPropagation(); setActiveTokenId(t.instanceId); }}
                  >
                    {(() => {
                      if (initIndex !== -1) {
                        return (
                          <div style={{ position: 'absolute', top: '4px', right: '4px', width: '22px', height: '22px', background: isTheirTurn ? 'var(--natural-green)' : 'var(--accent-gold)', borderRadius: '50%', color: isTheirTurn ? 'white' : 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 5, boxShadow: '0 0 5px rgba(0,0,0,0.5)' }}>
                            {initIndex + 1}
                          </div>
                        );
                      } else {
                        let dexMod = 0;
                        if (t.type === 'character') {
                           const c = characters.find((ch: any) => ch.id === t.originalId);
                           if (c && c.stats && c.stats.DEX) dexMod = Math.floor((c.stats.DEX - 10) / 2);
                        } else {
                           const m = monsters.find((mo: any) => mo.name === t.name);
                           if (m && m.stats && m.stats.DEX) dexMod = Math.floor((m.stats.DEX - 10) / 2);
                        }
                        const modStr = dexMod >= 0 ? `+${dexMod}` : `${dexMod}`;
                        return (
                          <div 
                            title="Iniciativa"
                            onClick={(e) => {
                              e.stopPropagation(); e.preventDefault();
                              const roll = Math.floor(Math.random() * 20) + 1;
                              const total = roll + dexMod;
                              socket.emit('combat:roll-initiative', { tokenId: t.instanceId, value: total });
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                            style={{ position: 'absolute', top: '4px', right: '4px', width: '22px', height: '22px', background: 'var(--bg-surface)', border: '1px solid var(--accent-gold)', borderRadius: '50%', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', zIndex: 5, boxShadow: '0 0 5px rgba(0,0,0,0.5)', cursor: 'pointer', transition: 'transform 0.1s' }}
                          >
                            {modStr}
                          </div>
                        );
                      }
                    })()}
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ position: 'relative', width: '42px', height: '42px', border: `2px solid ${t.teamColor || 'var(--border-color)'}`, overflow: 'hidden', flexShrink: 0, borderRadius: '4px' }}>
                        {t.image ? <img src={t.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.2rem' }}>{isChar ? <User className="w-full h-full p-2" /> : <Ghost className="w-full h-full p-2" />}</span>}
                      {t.condition && (
                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: 'rgba(0,0,0,0.8)', borderRadius: '50%', fontSize: '0.8rem', padding: '2px', border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {t.condition}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div className="font-cinzel" style={{ color: 'white', fontSize: '0.95rem', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={(e) => { 
                        e.stopPropagation(); 
                        if (isChar) {
                          if (onOpenCharacterSheet) onOpenCharacterSheet(t.originalId || t.instanceId);
                        } else {
                          if (onOpenMonsterSheet) onOpenMonsterSheet(t.originalId || t.name);
                        }
                      }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: isChar ? 'var(--accent-gold)' : 'var(--combat-red)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{isChar ? 'Héroe' : 'Criatura'}</div>
                    </div>
                  </div>

                  {/* spell slots quick-view removed — visible only in health modal */}

                  {(userRole === 'dm' || t.owner === currentUser.name) && (
                    <div 
                       onClick={(e) => { 
                         e.stopPropagation();
                         if (userRole === 'dm') {
                           setHealthModalToken(t);
                           setHealthInput('');
                           setConditionInput(t.condition || '');
                         }
                       }}
                       style={{ 
                         width: '100%', 
                         height: '22px', 
                         background: 'rgba(0,0,0,0.5)', 
                         position: 'relative', 
                         borderRadius: '4px',
                         overflow: 'hidden',
                         border: '1px solid var(--border-color)',
                         cursor: userRole === 'dm' ? 'pointer' : 'default',
                         marginTop: '4px'
                       }}
                    >
                      <div style={{ 
                        width: `${Math.min(100, (t.hp / Math.max(1, t.max_hp)) * 100)}%`, 
                        height: '100%', 
                        background: t.hp / Math.max(1, t.max_hp) > 0.5 ? 'var(--natural-green)' : 'var(--combat-red)', 
                        transition: 'width 0.4s ease' 
                      }} />
                      {(t.tempHp || 0) > 0 && (
                        <div style={{
                          position: 'absolute', top: 0, right: 0, height: '100%',
                          background: 'rgba(59, 130, 246, 0.6)', 
                          width: `${Math.min(100, ((t.tempHp || 0) / Math.max(1, t.max_hp)) * 100)}%`,
                          transition: 'width 0.4s ease'
                        }} />
                      )}
                      <div className="mono" style={{ 
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.8rem', fontWeight: 'bold',
                        textShadow: '1px 1px 2px black'
                      }}>
                        {t.hp}{(t.tempHp || 0) > 0 ? ` (+${t.tempHp})` : ''} / {t.max_hp}
                      </div>
                    </div>
                  )}

                  {(userRole === 'dm' || userRole === 'admin') && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.05)' }} onClick={e => e.stopPropagation()}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginRight: '4px' }}>Equipo:</span>
                      {[
                        { name: 'Ninguno', color: null },
                        { name: 'Rojo', color: '#ef4444' },
                        { name: 'Azul', color: '#3b82f6' },
                        { name: 'Verde', color: '#10b981' },
                        { name: 'Dorado', color: '#ecc94b' }
                      ].map(team => (
                        <button
                          key={team.name}
                          title={team.name}
                          onClick={() => socket.emit('token:update-team', { tokenId: t.instanceId, color: team.color })}
                          style={{
                            width: '18px', height: '18px', borderRadius: '50%', border: t.teamColor === team.color ? '2px solid white' : '1px solid #555',
                            background: team.color || 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.65rem', padding: 0, outline: 'none', transition: 'transform 0.15s'
                          }}
                          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.85)'}
                          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          {!team.color && '×'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            });
          })()}
              {boardTokens.filter(canSeeInSidebar).length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '30px 20px', opacity: 0.6 }}>
                  <div style={{ marginBottom: '8px' }}><Swords size={32} style={{ margin: '0 auto', opacity: 0.5, color: 'var(--text-secondary)' }} /></div>
                  Sin combatientes en el mapa
                </div>
              )}
            </div>

            {/* Panel Objetos */}
            <div style={{
              position: 'absolute',
              inset: 0,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              overflowY: 'auto',
              animation: sidebarTab === 'objects'
                ? (prevSidebarTab === 'combatants' ? 'slideInFromRight 0.28s cubic-bezier(0.4,0,0.2,1) forwards' : 'fadeInPanel 0.2s ease forwards')
                : (isTabTransitioning && prevSidebarTab === 'objects' ? 'slideOutToRight 0.22s cubic-bezier(0.4,0,0.2,1) forwards' : 'none'),
              pointerEvents: sidebarTab === 'objects' ? 'auto' : 'none',
              visibility: sidebarTab === 'objects' || (isTabTransitioning && prevSidebarTab === 'objects') ? 'visible' : 'hidden'
            }}>
              {boardTokens.filter((t: any) => t.type === 'chest' || t.type === 'item' || t.type === 'note').map((t: any, idx: number) => {
                const isChest = t.type === 'chest';
                const isItem = t.type === 'item';
                const isNote = t.type === 'note';
                const isImage = t.type === 'image';

                let icon = null;
                let statusText = '';
                if (isChest) {
                  icon = t.chestData?.isOpen ? <OpenChestIcon /> : <ClosedChestIcon />;
                  statusText = t.chestData?.isOpen ? 'Abierto' : 'Cerrado';
                } else if (isItem) {
                  icon = <ItemDropIcon rarity={t.itemData?.rarity || 'Común'} />;
                  statusText = t.itemData?.rarity || 'Común';
                } else if (isNote) {
                  icon = <NoteTokenIcon />;
                  statusText = 'Nota';
                } else if (isImage) {
                  icon = t.imageData?.url ? <img src={t.imageData.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} /> : <ImageTokenIcon />;
                  statusText = 'Imagen';
                }

                return (
                  <div key={t.instanceId}
                    className={`clipped-frame torch-glow ${activeTokenId === t.instanceId ? 'active' : ''}`}
                    style={{
                      padding: '12px',
                      border: activeTokenId === t.instanceId ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, background 0.2s',
                      background: activeTokenId === t.instanceId ? 'rgba(200, 135, 42, 0.1)' : 'var(--bg-surface)',
                      animation: `sidebarItemIn 0.3s ease both`,
                      animationDelay: `${idx * 40}ms`
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTokenId(t.instanceId);
                      if (isChest) {
                        if (userRole === 'dm' || userRole === 'admin' || t.chestData?.isOpen) {
                          setSelectedChestToken(t);
                        } else {
                          setPasswordPromptChest(t);
                          setEnteredPassword('');
                          setPasswordError('');
                        }
                      } else if (isItem) {
                        setSelectedItemToken(t);
                      } else if (isNote) {
                        setSelectedNoteToken(t);
                      } else if (isImage) {
                        setSelectedImageToken(t);
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ position: 'relative', width: '42px', height: '42px', border: '1px solid var(--border-color)', overflow: 'hidden', flexShrink: 0, padding: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
                        {icon}
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div className="font-cinzel" style={{ color: 'white', fontSize: '0.95rem', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.name}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: isChest ? 'var(--accent-gold)' : 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {isChest ? `Cofre • ${statusText}` : (isItem ? `Objeto • ${statusText}` : (isNote ? 'Nota' : 'Imagen'))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {boardTokens.filter((t: any) => t.type === 'chest' || t.type === 'item' || t.type === 'note').length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '30px 20px', opacity: 0.6 }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}><Backpack className="w-10 h-10 m-auto" /></div>
                  Sin objetos en el mapa
                </div>
              )}
            </div>
          </div>
          </div>
        </div>

        {/* COLUMNA CENTRAL: MAPA */}
        <div ref={viewportRef} style={{ position: 'relative', flex: 1, overflow: 'hidden', background: '#000' }} onMouseDown={handleViewportMouseDown}>
          
          {/* BOTONES FLOTANTES DE ACCIÓN (PH / TS) */}
          {(() => {
            if (!activeTokenId) return null;
            const t = boardTokens.find((t: any) => t.instanceId === activeTokenId);
            if (!t || t.type !== 'character') return null;
            const isOwner = userRole === 'dm' || userRole === 'admin' || t.owner === currentUser?.name;
            if (!isOwner) return null;

            const charSource = characters.find((c: any) => c.id === t.originalId);
            if (!charSource) return null;
            
            const stats = typeof charSource.stats === 'string' ? JSON.parse(charSource.stats) : (charSource.stats || {});
            const safeParse = (val: any) => {
              if (typeof val !== 'string') return val;
              try {
                const p = JSON.parse(val);
                if (typeof p === 'string') return safeParse(p);
                return p;
              } catch { return val; }
            };
            const parsedInv = safeParse(charSource.inventory) || {};
            const selectedSkills = parsedInv.habilidades || [];
            const selectedSavingThrows = parsedInv.salvaciones || [];
            const level = charSource.level || 1;
            
            const getProficiencyBonus = (lvl: number) => {
              if (lvl <= 4) return 2;
              if (lvl <= 8) return 3;
              if (lvl <= 12) return 4;
              if (lvl <= 16) return 5;
              return 6;
            };
            const pb = getProficiencyBonus(level);

            const getMod = (stat: string) => Math.floor(((stats[stat] || 10) - 10) / 2);

            const performRoll = (name: string, statKey: string, isSkill: boolean) => {
              const isSavingThrow = !isSkill;
              if (blockRolls && !isSavingThrow) {
                alert("No puedes tirar dados fuera de tu turno!");
                return;
              }
              let mod = getMod(statKey);
              if (isSkill && selectedSkills.includes(name)) {
                mod += pb;
              } else if (isSavingThrow && selectedSavingThrows.includes(statKey)) {
                mod += pb;
              }
              const roll = Math.floor(Math.random() * 20) + 1;
              const total = roll + mod;
              socket.emit('dice:roll', { die: 20 });
              socket.emit('chat:send', { 
                user: currentUser?.name, 
                text: `🎲 **${t.name}** lanzó **${name}**: d20(${roll}) ${mod >= 0 ? '+' : '-'} ${Math.abs(mod)} = **${total}**`, 
                timestamp: Date.now() 
              });
              setActiveActionMenu(null);
            };

            const tsList = [
              { label: 'FUE', key: 'fue' }, { label: 'DES', key: 'dex' }, { label: 'CON', key: 'con' },
              { label: 'INT', key: 'int' }, { label: 'SAB', key: 'sab' }, { label: 'CAR', key: 'car' }
            ];

            const phList = [
              { label: 'Atletismo', key: 'fue' },
              { label: 'Acrobacias', key: 'dex' }, { label: 'Juego de Manos', key: 'dex' }, { label: 'Sigilo', key: 'dex' },
              { label: 'Arcanos', key: 'int' }, { label: 'Historia', key: 'int' }, { label: 'Investigación', key: 'int' }, { label: 'Naturaleza', key: 'int' }, { label: 'Religión', key: 'int' },
              { label: 'Trato con Animales', key: 'sab' }, { label: 'Perspicacia', key: 'sab' }, { label: 'Medicina', key: 'sab' }, { label: 'Percepción', key: 'sab' }, { label: 'Supervivencia', key: 'sab' },
              { label: 'Engaño', key: 'car' }, { label: 'Intimidación', key: 'car' }, { label: 'Interpretación', key: 'car' }, { label: 'Persuasión', key: 'car' }
            ];

            return (
              <div 
                style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }} 
                onMouseDown={e => { e.stopPropagation(); e.preventDefault(); }} 
                onClick={e => { e.stopPropagation(); e.preventDefault(); }}
              >
                
                {activeActionMenu === 'TS' && (
                  <div className="clipped-frame" style={{ background: 'rgba(0,0,0,0.85)', padding: '12px', border: '2px solid var(--accent-gold)', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '320px', animation: 'healthModalIn 0.2s ease-out' }}>
                    <div className="font-cinzel" style={{ width: '100%', textAlign: 'center', color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px', letterSpacing: '1px' }}>TIRADAS DE SALVACIÓN</div>
                    {tsList.map(s => {
                      const isProficient = selectedSavingThrows.includes(s.key);
                      return (
                        <button 
                          key={s.label} 
                          onMouseDown={e => { e.stopPropagation(); e.preventDefault(); }}
                          onClick={(e) => { e.stopPropagation(); performRoll(`Salvación de ${s.label}`, s.key, false); }} 
                          className="font-cinzel" 
                          style={{ 
                            background: 'var(--bg-surface)', 
                            border: isProficient ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-color)', 
                            color: isProficient ? 'var(--accent-gold)' : 'white', 
                            padding: '6px 12px', 
                            borderRadius: '4px', 
                            cursor: 'pointer', 
                            fontSize: '0.8rem', 
                            transition: 'all 0.15s',
                            textShadow: isProficient ? '0 0 5px rgba(255, 215, 0, 0.5)' : 'none',
                            fontWeight: isProficient ? 'bold' : 'normal'
                          }} 
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; e.currentTarget.style.transform = 'scale(1.05)'; }} 
                          onMouseLeave={e => { e.currentTarget.style.borderColor = isProficient ? 'var(--accent-gold)' : 'var(--border-color)'; e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {activeActionMenu === 'PH' && (
                  <div className="clipped-frame" style={{ background: 'rgba(0,0,0,0.85)', padding: '14px', border: '2px solid var(--accent-gold)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', maxWidth: '480px', animation: 'healthModalIn 0.2s ease-out', maxHeight: '55vh', overflowY: 'auto' }}>
                    <div className="font-cinzel" style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '6px', letterSpacing: '1px' }}>PRUEBAS DE HABILIDAD</div>
                    {phList.map(s => {
                      const isProficient = selectedSkills.includes(s.label);
                      return (
                        <button 
                          key={s.label} 
                          onMouseDown={e => { e.stopPropagation(); e.preventDefault(); }}
                          onClick={(e) => { e.stopPropagation(); performRoll(s.label, s.key, true); }} 
                          className="font-cinzel" 
                          style={{ 
                            background: 'var(--bg-surface)', 
                            border: isProficient ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-color)', 
                            color: isProficient ? 'var(--accent-gold)' : 'white', 
                            padding: '8px 6px', 
                            borderRadius: '4px', 
                            cursor: 'pointer', 
                            fontSize: '0.7rem', 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            transition: 'all 0.15s',
                            textShadow: isProficient ? '0 0 5px rgba(255, 215, 0, 0.5)' : 'none',
                            fontWeight: isProficient ? 'bold' : 'normal'
                          }} 
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; e.currentTarget.style.transform = 'scale(1.02)'; }} 
                          onMouseLeave={e => { e.currentTarget.style.borderColor = isProficient ? 'var(--accent-gold)' : 'var(--border-color)'; e.currentTarget.style.transform = 'scale(1)'; }} 
                          title={s.label}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '15px' }} onMouseDown={e => { e.stopPropagation(); e.preventDefault(); }} onClick={e => { e.stopPropagation(); e.preventDefault(); }}>

                  <button 
                    onMouseDown={e => { e.stopPropagation(); e.preventDefault(); }}
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); setActiveActionMenu(activeActionMenu === 'PH' ? null : 'PH'); }} 
                    className="font-cinzel torch-glow" 
                    style={{ background: activeActionMenu === 'PH' ? 'var(--accent-gold)' : 'var(--bg-surface)', color: activeActionMenu === 'PH' ? '#000' : 'white', border: '2px solid var(--accent-gold)', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem', boxShadow: '0 4px 15px rgba(0,0,0,0.6)', transition: 'all 0.2s' }}
                  >
                    PH
                  </button>
                  <button 
                    onMouseDown={e => { e.stopPropagation(); e.preventDefault(); }}
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); setActiveActionMenu(activeActionMenu === 'TS' ? null : 'TS'); }} 
                    className="font-cinzel torch-glow" 
                    style={{ background: activeActionMenu === 'TS' ? 'var(--accent-gold)' : 'var(--bg-surface)', color: activeActionMenu === 'TS' ? '#000' : 'white', border: '2px solid var(--accent-gold)', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem', boxShadow: '0 4px 15px rgba(0,0,0,0.6)', transition: 'all 0.2s' }}
                  >
                    TS
                  </button>
                </div>
              </div>
            );
          })()}
          
          {/* BOTONES FLOTANTES AoE (MENÚ RADIAL) */}
          <div 
            className="radial-container"
            style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 200 }} 
            onMouseDown={e => e.stopPropagation()} 
            onClick={e => e.stopPropagation()}
          >
            {/* Child 1: Línea */}
            <button 
              title="Línea" 
              onClick={() => { setAoeForm({...aoeForm, shape: 'line'}); setActiveAoeTool('line'); setIsCreatingAoe(true); setIsRadialOpen(false); }} 
              className={`radial-child torch-glow ${isRadialOpen ? 'open' : ''}`} 
              style={{ left: '-100px', top: '0px', transitionDelay: isRadialOpen ? '0ms' : '0ms', padding: 0 }}
            >
              <LineAoeIcon />
            </button>
            
            {/* Child 2: Cono */}
            <button 
              title="Cono" 
              onClick={() => { setAoeForm({...aoeForm, shape: 'cone'}); setActiveAoeTool('cone'); setIsCreatingAoe(true); setIsRadialOpen(false); }} 
              className={`radial-child torch-glow ${isRadialOpen ? 'open' : ''}`} 
              style={{ left: '-86.6px', top: '-50px', transitionDelay: isRadialOpen ? '70ms' : '0ms', padding: 0 }}
            >
              <ConeAoeIcon />
            </button>
            
            {/* Child 3: Círculo */}
            <button 
              title="Círculo" 
              onClick={() => { setAoeForm({...aoeForm, shape: 'circle'}); setActiveAoeTool('circle'); setIsCreatingAoe(true); setIsRadialOpen(false); }} 
              className={`radial-child torch-glow ${isRadialOpen ? 'open' : ''}`} 
              style={{ left: '-50px', top: '-86.6px', transitionDelay: isRadialOpen ? '140ms' : '0ms', padding: 0 }}
            >
              <CircleAoeIcon />
            </button>
            
            {/* Child 4: Cuadrado / Cubo */}
            <button 
              title="Cubo" 
              onClick={() => { setAoeForm({...aoeForm, shape: 'cube'}); setActiveAoeTool('cube'); setIsCreatingAoe(true); setIsRadialOpen(false); }} 
              className={`radial-child torch-glow ${isRadialOpen ? 'open' : ''}`} 
              style={{ left: '0px', top: '-100px', transitionDelay: isRadialOpen ? '210ms' : '0ms', padding: 0 }}
            >
              <SquareAoeIcon />
            </button>

            {/* Parent Button */}
            <button
              title="Herramientas de Medición AoE"
              onClick={() => setIsRadialOpen(!isRadialOpen)}
              className="torch-glow"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                background: 'var(--bg-surface)',
                border: '2px solid var(--accent-gold)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                zIndex: 201,
                padding: 0
              }}
            >
              {getAoeIcon(activeAoeTool)}
            </button>
          </div>

          <div
            ref={boardRef}
            onContextMenu={handleBoardContextMenu}
            style={{
              position: 'absolute',
              top: pan.y, left: pan.x,
              width: BOARD_PX, height: BOARD_PX,
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              backgroundImage: bgImage ? `url("${bgImage}")` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {showGridLines && (
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundImage: `linear-gradient(rgba(200, 135, 42, ${gridOpacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(200, 135, 42, ${gridOpacity}) 1px, transparent 1px)`,
                backgroundSize: `${CELL_PX}px ${CELL_PX}px`,
                pointerEvents: 'none'
              }} />
            )}
            
            <canvas 
              ref={fowCanvasRef}
              width={BOARD_PX} 
              height={BOARD_PX}
              style={{
                position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1,
                opacity: (userRole === 'dm' || userRole === 'admin') ? 0.35 : 1
              }}
            />
            
            {(userRole === 'dm' || userRole === 'admin') && Array.from(solidCells).map(cellKey => {
              const [cx, cy] = cellKey.split(',').map(Number);
              return (
                <div key={`wall-${cellKey}`} style={{
                  position: 'absolute',
                  left: cx * CELL_PX,
                  top: cy * CELL_PX,
                  width: CELL_PX,
                  height: CELL_PX,
                  background: 'repeating-linear-gradient(45deg, #222 0px, #222 10px, #000 10px, #000 20px)',
                  border: '1px solid #444',
                  boxShadow: 'inset 0 0 15px black',
                  pointerEvents: 'none',
                  opacity: 0.8,
                  zIndex: 2
                }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, fontSize: '24px' }}>
                    ❌
                  </div>
                </div>
              );
            })}

            <div ref={snapRef} style={{ display: 'none', position: 'absolute', width: CELL_PX, height: CELL_PX, background: 'rgba(200, 135, 42, 0.1)', border: '2px dashed var(--accent-gold)', borderRadius: '50%', pointerEvents: 'none', zIndex: 99 }} />

            <div ref={ghostRef} style={{ display: 'none', position: 'absolute', width: CELL_PX, height: CELL_PX, borderRadius: '50%', background: 'var(--accent-gold)', border: '3px solid white', opacity: 0.85, zIndex: 100, pointerEvents: 'none', boxShadow: '0 8px 25px rgba(0,0,0,0.5)', transform: 'scale(1.1)', overflow: 'hidden' }} />

            {boardTokens.filter(canSeeOnGrid).map((t: any) => {
              const isDragging = drag === t.instanceId;
              const isMyTeam = (userRole === 'dm' || (t.teamColor && t.teamColor === myTeam) || (currentUser && t.owner === currentUser.name));
              const isAoe = t.type === 'aoe';
              const tokenOpacity = isDragging && !isAoe ? 0 : 1;

              if (isAoe) {
                const aoe = t.aoeData;
                const r = aoe?.rotation || 0;
                let svgContent = null;
                let w = CELL_PX;
                let h = CELL_PX;
                
                if (aoe?.shape === 'circle') {
                  const radPx = (aoe.size1 * CELL_PX);
                  w = radPx * 2;
                  h = radPx * 2;
                  svgContent = <circle cx={radPx} cy={radPx} r={radPx} fill={aoe.color} fillOpacity={0.4} stroke={aoe.color} strokeWidth={2} />;
                } else if (aoe?.shape === 'line') {
                  const lengthPx = aoe.size1 * CELL_PX;
                  const widthPx = aoe.size2 * CELL_PX;
                  w = lengthPx;
                  h = widthPx;
                  svgContent = <rect x={0} y={0} width={lengthPx} height={widthPx} fill={aoe.color} fillOpacity={0.4} stroke={aoe.color} strokeWidth={2} />;
                } else if (aoe?.shape === 'cone') {
                  const lengthPx = aoe.size1 * CELL_PX;
                  w = lengthPx;
                  h = lengthPx;
                  svgContent = <polygon points={`0,${lengthPx/2} ${lengthPx},0 ${lengthPx},${lengthPx}`} fill={aoe.color} fillOpacity={0.4} stroke={aoe.color} strokeWidth={2} strokeLinejoin="round" />;
                } else if (aoe?.shape === 'cube') {
                  const sizePx = aoe.size1 * CELL_PX;
                  w = sizePx;
                  h = sizePx;
                  svgContent = <rect x={0} y={0} width={sizePx} height={sizePx} fill={aoe.color} fillOpacity={0.4} stroke={aoe.color} strokeWidth={2} />;
                }
                
                let leftOffset = (t.x + 0.5) * CELL_PX - w / 2;
                let topOffset = (t.y + 0.5) * CELL_PX - h / 2;
                let transformOrigin = 'center';
                
                return (
                  <div
                    id={`token-${t.instanceId}`}
                    data-rotation={r}
                    key={t.instanceId}
                    onMouseDown={(e) => handleTokenMouseDown(e, t.instanceId)}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (wasDraggingRef.current) return;
                      setSelectedAoeToken(t); 
                      setActiveTokenId(t.instanceId); 
                    }}
                    style={{
                      position: 'absolute',
                      left: leftOffset,
                      top: topOffset,
                      width: w,
                      height: h,
                      cursor: isDragging ? 'grabbing' : 'pointer',
                      zIndex: isDragging ? 1 : 5,
                      opacity: tokenOpacity,
                      transform: `rotate(${r}deg) ${activeTokenId === t.instanceId ? 'scale(1.05)' : ''}`,
                      transformOrigin: transformOrigin,
                      transition: isDragging ? 'none' : 'left 0.15s ease, top 0.15s ease, transform 0.2s',
                      pointerEvents: 'none'
                    }}
                  >
                    <svg width="100%" height="100%" style={{ display: 'block', pointerEvents: 'visiblePainted' }}>
                      {svgContent}
                    </svg>
                  </div>
                );
              }

              // Check if token is inside any AoE
              let inAoeColor: string | null = null;
              if (t.type === 'character' || t.type === 'monster') {
                const tx = t.x + 0.5;
                const ty = t.y + 0.5;
                for (const a of boardTokens) {
                  if (a.type === 'aoe' && a.aoeData) {
                    const ax = a.x + 0.5;
                    const ay = a.y + 0.5;
                    const rRad = (a.aoeData.rotation || 0) * Math.PI / 180;
                    
                    const dx = tx - ax;
                    const dy = ty - ay;
                    const rdx = dx * Math.cos(-rRad) - dy * Math.sin(-rRad);
                    const rdy = dx * Math.sin(-rRad) + dy * Math.cos(-rRad);
                    
                    let inside = false;
                    if (a.aoeData.shape === 'circle') {
                      const dist = Math.sqrt(dx*dx + dy*dy);
                      if (dist <= a.aoeData.size1) inside = true;
                    } else if (a.aoeData.shape === 'line') {
                      const len = a.aoeData.size1;
                      const wid = a.aoeData.size2;
                      if (rdx >= 0 && rdx <= len && Math.abs(rdy) <= wid / 2) inside = true;
                    } else if (a.aoeData.shape === 'cone') {
                      const len = a.aoeData.size1;
                      if (rdx >= 0 && rdx <= len && Math.abs(rdy) <= rdx / 2) inside = true;
                    } else if (a.aoeData.shape === 'cube') {
                      const s = a.aoeData.size1;
                      const ctx = tx - a.x;
                      const cty = ty - a.y;
                      if (ctx >= 0 && ctx <= s && cty >= 0 && cty <= s) inside = true;
                    }
                    
                    if (inside) {
                      inAoeColor = a.aoeData.color;
                      break;
                    }
                  }
                }
              }

              const isChest = t.type === 'chest';
              const isItem = t.type === 'item';
              const isNote = t.type === 'note';
              const isImage = t.type === 'image';
              const showHpBar = isMyTeam && !isDragging && !isChest && !isItem && !isNote && !isImage;

              let innerDisplay = null;
              if (isChest) {
                innerDisplay = t.chestData?.isOpen ? <OpenChestIcon /> : <ClosedChestIcon />;
              } else if (isItem) {
                innerDisplay = <ItemDropIcon rarity={t.itemData?.rarity || 'Común'} />;
              } else if (isNote) {
                innerDisplay = <NoteTokenIcon />;
              } else if (isImage) {
                innerDisplay = t.imageData?.url ? <img src={t.imageData.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageTokenIcon />;
              } else {
                innerDisplay = t.image ? <img src={t.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontWeight: 'bold' }}>{t.name[0]}</span>;
              }

              return (
                <div
                  key={t.instanceId}
                  onMouseDown={(e) => handleTokenMouseDown(e, t.instanceId)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isChest) {
                      if (userRole === 'dm' || userRole === 'admin') {
                        setSelectedChestToken(t);
                      } else {
                        if (t.chestData?.isOpen) {
                          setSelectedChestToken(t);
                        } else {
                          setPasswordPromptChest(t);
                          setEnteredPassword('');
                          setPasswordError('');
                        }
                      }
                    } else if (isItem) {
                      setSelectedItemToken(t);
                    } else if (isNote) {
                      setSelectedNoteToken(t);
                    } else if (isImage) {
                      setSelectedImageToken(t);
                    } else {
                      setActiveTokenId(t.instanceId);
                    }
                  }}
                  style={{
                    position: 'absolute',
                    left: t.x * CELL_PX,
                    top: t.y * CELL_PX,
                    width: CELL_PX, height: CELL_PX,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    zIndex: isDragging ? 1 : 10,
                    opacity: tokenOpacity,
                    transition: isDragging ? 'none' : 'left 0.15s ease, top 0.15s ease',
                  }}
                >
                  <div style={{
                    width: '100%', height: '100%', borderRadius: isChest || isItem || isNote || isImage ? '8px' : '50%',
                    background: isChest || isItem || isNote || isImage ? 'transparent' : (t.type === 'character' ? 'var(--accent-gold)' : 'var(--combat-red)'),
                    border: activeTokenId === t.instanceId ? '4px solid white' : (isChest || isItem || isNote || isImage ? '1px dashed rgba(255,255,255,0.4)' : '2px solid rgba(255,255,255,0.3)'),
                    overflow: isChest || isItem || isNote || isImage ? 'visible' : 'hidden',
                    boxShadow: inAoeColor ? `0 0 20px 5px ${inAoeColor}, inset 0 0 10px ${inAoeColor}` : (isChest || isItem || isNote || isImage ? 'none' : (t.teamColor ? `0 0 15px ${t.teamColor}` : '0 4px 10px rgba(0,0,0,0.5)')),
                    transform: activeTokenId === t.instanceId ? 'scale(1.1)' : 'scale(0.9)',
                    transition: 'transform 0.1s, box-shadow 0.3s'
                  }}>
                    {innerDisplay}
                  </div>
                  {showHpBar && (
                    <div style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', width: '85%', height: '5px', background: '#000', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                      <div style={{ width: `${(t.hp / t.max_hp) * 100}%`, height: '100%', background: t.hp > 0 ? (t.hp / t.max_hp > 0.5 ? 'var(--natural-green)' : 'var(--combat-red)') : '#6b7280', transition: 'width 0.3s' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMNA DER: CHAT Y DADOS */}
        <div style={{
          width: isChatOpen ? '300px' : '0px',
          minWidth: isChatOpen ? '300px' : '0px',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          flexShrink: 0,
          display: 'flex',
          borderLeft: isChatOpen ? '1px solid var(--border-color)' : 'none',
          background: 'var(--bg-surface)',
          overflow: 'hidden'
        }}>
          <div style={{ width: '300px', height: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            <ChatPanel socket={socket} currentUser={currentUser} characters={characters} messages={chatMessages} blockRolls={blockRolls} />
          </div>
        </div>
      </div>

      <NotificacionSalvacion
        saveNotification={saveNotification}
        currentUser={currentUser}
        userRole={userRole}
        characters={characters}
        socket={socket}
        onClose={() => setSaveNotification(null)}
      />

      {/* MODAL DETALLE DE COMBATIENTE */}
      {viewingToken && (() => {
        const item = boardTokens.find((t: any) => t.instanceId === viewingToken.instanceId) || viewingToken;
        const isChar = item.type === 'character';
        let inventory: any = null;
        let stats: any = {};
        let description: any = "";
        let classes = "";
        let race = "";
        let type = "";

        const safeParse = (val: any) => {
          if (typeof val !== 'string') return val;
          try {
            const p = JSON.parse(val);
            if (typeof p === 'string') return safeParse(p);
            return p;
          } catch { return val; }
        };

        if (isChar) {
          const charSource = characters.find((c: any) => c.id === item.originalId);
          stats = safeParse(charSource?.stats || {});
          description = charSource?.description || "Sin descripción.";
          race = charSource?.race || "Humano";
          inventory = safeParse(charSource?.inventory) || null;
          try {
            const parsedCls = safeParse(charSource?.class);
            classes = Object.entries(parsedCls).map(([c, l]) => `${c} ${l}`).join(' / ');
          } catch {
            classes = charSource?.class || "Guerrero";
          }
        } else {
          const mSource = monsters.find((m: any) => m.id === item.originalId);
          const mData = safeParse(mSource?.data || {});
          stats = { fue: mData.strength || 10, dex: mData.dexterity || 10, con: mData.constitution || 10, int: mData.intelligence || 10, sab: mData.wisdom || 10, car: mData.charisma || 10 };
          description = mData.description || mData.desc || "Sin descripción.";
          type = mData.type || "Monstruo";
        }

        const statMod = (v: number) => {
          const mod = Math.floor((v - 10) / 2);
          return (mod >= 0 ? '+' : '') + mod;
        };

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }} onClick={() => setViewingToken(null)}>
            <div className="clipped-frame" style={{ width: '100%', maxWidth: '900px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
              {/* MODAL HEADER */}
              <div style={{ padding: '25px 30px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '20px', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ width: '80px', height: '80px', border: '2px solid var(--accent-gold)', overflow: 'hidden', flexShrink: 0 }}>
                  {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '2.5rem' }}>{isChar ? <User className="w-full h-full p-2" /> : <Ghost className="w-full h-full p-2" />}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 className="font-cinzel" style={{ margin: 0, fontSize: '2rem', color: 'var(--accent-gold)' }}>{item.name}</h2>
                  <p className="font-cinzel" style={{ margin: '4px 0 0 0', color: 'var(--text-parchment)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {isChar ? `${race} • ${classes}` : type}
                  </p>
                </div>
              </div>

              {/* MODAL BODY */}
              <div style={{ padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>

                {/* Atributos */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '15px' }}>
                  {Object.entries(stats).map(([key, val]: [string, any]) => {
                    const mod = statMod(val);
                    return (
                      <div key={key} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', padding: '12px', textAlign: 'center' }}>
                        <div className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 'bold', textTransform: 'uppercase' }}>{key}</div>
                        <div className="mono" style={{ fontSize: '1.4rem', color: 'white', fontWeight: 'bold' }}>{val}</div>
                        <div className="mono" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mod: {mod}</div>
                        {isChar && <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', marginTop: '4px', fontWeight: 'bold' }}>TS: {mod}</div>}
                      </div>
                    );
                  })}
                </div>

                {isChar && (() => {
                  const selectedSkills = inventory?.habilidades || [];
                  const level = characters.find((c: any) => c.id === item.originalId)?.level || 1;
                  const pb = 1 + Math.ceil(level / 4);
                  
                  const phList = [
                    { label: 'Atletismo', key: 'fue' },
                    { label: 'Acrobacias', key: 'dex' }, { label: 'Juego de Manos', key: 'dex' }, { label: 'Sigilo', key: 'dex' },
                    { label: 'Arcanos', key: 'int' }, { label: 'Historia', key: 'int' }, { label: 'Investigación', key: 'int' }, { label: 'Naturaleza', key: 'int' }, { label: 'Religión', key: 'int' },
                    { label: 'Trato con Animales', key: 'sab' }, { label: 'Perspicacia', key: 'sab' }, { label: 'Medicina', key: 'sab' }, { label: 'Percepción', key: 'sab' }, { label: 'Supervivencia', key: 'sab' },
                    { label: 'Engaño', key: 'car' }, { label: 'Intimidación', key: 'car' }, { label: 'Interpretación', key: 'car' }, { label: 'Persuasión', key: 'car' }
                  ];

                  return (
                    <div>
                      <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}><Dices className="w-5 h-5 inline-block mr-2" /> HABILIDADES</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {phList.map(s => {
                          const baseMod = Math.floor(((stats[s.key] || 10) - 10) / 2);
                          const isProficient = selectedSkills.includes(s.label);
                          const totalMod = baseMod + (isProficient ? pb : 0);
                          const modStr = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;
                          return (
                            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                              <span className="font-cinzel" style={{ fontSize: '0.75rem', color: isProficient ? 'var(--accent-gold)' : 'white' }}>{s.label} ({s.key.toUpperCase()})</span>
                              <span className="mono" style={{ fontSize: '1rem', fontWeight: 'bold', color: isProficient ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>{modStr}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Descripción */}
                <div>
                  <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}><StickyNote className="w-4 h-4 inline-block mr-2" /> DESCRIPCIÓN</h4>
                  <div style={{ color: 'var(--text-parchment)', lineHeight: '1.6', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
                    {Array.isArray(description) ? description.join('\n') : description}
                  </div>
                </div>

                {/* Inventario (solo héroes) */}
                {isChar && inventory && (
                  <div>
                    <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>⚔️ INVENTARIO</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      {Object.entries(inventory).map(([cat, items]: [string, any]) => (
                        items && items.length > 0 && (
                          <div key={cat} style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', border: '1px solid var(--border-color)' }}>
                            <h5 className="font-cinzel" style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{cat}</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {items.map((it: any, idx: number) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                                  <span style={{ fontSize: '0.9rem', color: 'white' }}>{it.name}</span>
                                  {it.damage && <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--combat-red)' }}>{it.damage}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* COFRE Y OBJETOS INTERACTIVOS OVERLAYS */}
      {contextMenu && (
        <div
          className="clipped-frame torch-glow"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            background: 'var(--bg-surface)',
            border: '2px solid var(--accent-gold)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            padding: '4px',
            minWidth: '150px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setIsCreatingChest(true);
              setChestPassword('');
            }}
            className="font-cinzel"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-parchment)',
              padding: '10px 14px',
              textAlign: 'left',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,135,42,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            📦 Agregar Cofre
          </button>
          <button
            onClick={() => {
              setIsSelectingCompendiumItem(true);
              setItemSearchQuery('');
            }}
            className="font-cinzel"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-parchment)',
              padding: '10px 14px',
              textAlign: 'left',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'background 0.2s',
              borderTop: '1px solid var(--border-color)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,135,42,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            ⚔️ Agregar Objeto
          </button>
          <button
            onClick={() => {
              setIsCreatingNote(true);
              setNoteText('');
            }}
            className="font-cinzel"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-parchment)',
              padding: '10px 14px',
              textAlign: 'left',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'background 0.2s',
              borderTop: '1px solid var(--border-color)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,135,42,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            📝 Agregar Nota
          </button>
          <button
            onClick={() => {
              setIsCreatingImage(true);
              setImageUrlInput('');
            }}
            className="font-cinzel"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-parchment)',
              padding: '10px 14px',
              textAlign: 'left',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'background 0.2s',
              borderTop: '1px solid var(--border-color)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,135,42,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            🖼️ Agregar Imagen
          </button>
        </div>
      )}

      {isCreatingAoe && (
        <ModalCrearAoe aoeForm={aoeForm} setAoeForm={setAoeForm} onSubmit={handleSpawnAoe} onClose={() => setIsCreatingAoe(false)} />
      )}

      {selectedAoeToken && (
        <ModalEditarAoe selectedAoeToken={selectedAoeToken} setSelectedAoeToken={setSelectedAoeToken} socket={socket} onClose={() => setSelectedAoeToken(null)} />
      )}

      {isCreatingChest && (
        <ModalCrearCofre chestPassword={chestPassword} setChestPassword={setChestPassword} onSubmit={handleCreateChestSubmit} onClose={() => setIsCreatingChest(false)} />
      )}

      {isSelectingCompendiumItem && (
        <ModalSeleccionarObjeto compendium={compendium} itemSearchQuery={itemSearchQuery} setItemSearchQuery={setItemSearchQuery} onSelect={handleSpawnItem} onClose={() => setIsSelectingCompendiumItem(false)} />
      )}

      {passwordPromptChest && (
        <ModalContrasenaCofre enteredPassword={enteredPassword} setEnteredPassword={setEnteredPassword} passwordError={passwordError} onSubmit={handleVerifyPasswordSubmit} onClose={() => setPasswordPromptChest(null)} />
      )}

      {selectedChestToken && (() => {
        const activeChest = boardTokens.find((t: any) => t.instanceId === selectedChestToken.instanceId);
        if (!activeChest) return null;
        
        const isDM = userRole === 'dm' || userRole === 'admin';
        const coins = activeChest.chestData?.coins || { pc: 0, pl: 0, el: 0, po: 0, pt: 0 };
        const slots = activeChest.chestData?.slots || Array(9).fill(null);

        const handleUpdateCoins = (key: string, value: number) => {
          const newCoins = { ...coins, [key]: Math.max(0, value) };
          socket.emit('token:update-chest', {
            tokenId: activeChest.instanceId,
            chestData: { coins: newCoins }
          });
        };

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }} onClick={() => setSelectedChestToken(null)}>
            <div className="clipped-frame" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 0 50px rgba(0,0,0,0.9)', border: '2px solid var(--accent-gold)' }} onClick={e => e.stopPropagation()}>
              
              {/* HEADER */}
              <div style={{ padding: '25px 30px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '20px', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ width: '60px', height: '60px', border: '2px solid var(--accent-gold)', overflow: 'hidden', flexShrink: 0, background: 'rgba(0,0,0,0.4)', padding: '5px' }}>
                  <OpenChestIcon />
                </div>
                <div style={{ flex: 1 }}>
                  <h2 className="font-cinzel" style={{ margin: 0, fontSize: '1.8rem', color: 'var(--accent-gold)' }}>INVENTARIO DEL COFRE</h2>
                  <p className="font-cinzel" style={{ margin: '4px 0 0 0', color: 'var(--text-parchment)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {isDM ? 'Panel del DM • Sin Contraseña' : 'Abierto • Contraseña Correcta'}
                  </p>
                </div>
                {isDM && (
                  <button
                    onClick={() => {
                      if (confirm("¿Estás seguro de que deseas eliminar este cofre y todo su contenido de forma permanente?")) {
                        socket.emit('token:remove', activeChest.instanceId);
                        setSelectedChestToken(null);
                      }
                    }}
                    className="font-cinzel"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--combat-red)', border: '1px solid var(--combat-red)', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    🗑️ ELIMINAR COFRE
                  </button>
                )}
              </div>

              {/* BODY */}
              <div style={{ padding: '30px', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', background: 'var(--bg-surface)' }}>
                
                {/* Lado Izquierdo: Slots 3x3 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 15px 0', fontSize: '1rem', letterSpacing: '1.5px', textTransform: 'uppercase', alignSelf: 'flex-start' }}><Box className="w-4 h-4 inline-block mr-2" /> Compartimentos (3x3)</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', width: 'fit-content' }}>
                    {slots.map((slot: any, idx: number) => {
                      let tagColor = 'var(--text-secondary)';
                      if (slot) {
                        const rarity = String(slot.rarity || 'Común');
                        const r = rarity.toLowerCase();
                        if (r.includes('raro') || r.includes('rare')) {
                          tagColor = r.includes('muy') ? '#a855f7' : '#3b82f6';
                        } else if (r.includes('legend')) {
                          tagColor = '#f59e0b';
                        } else if (r.includes('poco')) {
                          tagColor = '#10b981';
                        }
                      }

                      return (
                        <div
                          key={idx}
                          onClick={() => handleChestSlotClick(idx)}
                          style={{
                            width: '85px',
                            height: '85px',
                            background: slot ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.4)',
                            border: slot ? `1.5px solid ${tagColor}` : '1.5px dashed var(--border-color)',
                            borderRadius: '6px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            cursor: isDM ? 'pointer' : 'default',
                            overflow: 'hidden',
                            padding: '6px',
                            boxSizing: 'border-box',
                            textAlign: 'center',
                            transition: 'all 0.2s'
                          }}
                          className={isDM && !slot ? 'torch-glow' : ''}
                          onMouseEnter={e => {
                            if (isDM) {
                              e.currentTarget.style.borderColor = 'var(--accent-gold)';
                              e.currentTarget.style.background = 'rgba(200, 135, 42, 0.05)';
                            }
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = slot ? tagColor : '1.5px dashed var(--border-color)';
                            e.currentTarget.style.background = slot ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.4)';
                          }}
                        >
                          {slot ? (
                            <>
                              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'white', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word', lineHeight: '1.2' }}>{slot.name}</span>
                              <span style={{ fontSize: '0.6rem', color: tagColor, textTransform: 'uppercase', marginTop: '4px', fontWeight: 'bold', letterSpacing: '0.5px' }}>{slot.rarity}</span>
                              {!isDM && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLootItemClick(idx);
                                  }}
                                  className="font-cinzel"
                                  style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    width: '100%',
                                    background: 'var(--accent-gold)',
                                    color: '#000',
                                    border: 'none',
                                    padding: '2px 0',
                                    fontSize: '0.65rem',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    opacity: 0.9
                                  }}
                                >
                                  TOMAR
                                </button>
                              )}
                            </>
                          ) : (
                            <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', opacity: 0.4 }}>{isDM ? '+' : ''}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lado Derecho: Monedas */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 15px 0', fontSize: '1rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}><Coins className="w-4 h-4 inline-block mr-2" /> Monedas en el cofre</h4>
                  
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px', flex: 1, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { key: 'po', label: 'Oro (po)', color: '#ecc94b' },
                        { key: 'pt', label: 'Platino (pt)', color: '#a0aec0' },
                        { key: 'pl', label: 'Plata (pl)', color: '#cbd5e0' },
                        { key: 'pc', label: 'Cobre (pc)', color: '#b7791f' },
                        { key: 'el', label: 'Electrum (el)', color: '#319795' }
                      ].map(coin => (
                        <div key={coin.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.9rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: coin.color, display: 'inline-block' }} />
                            {coin.label}
                          </span>
                          
                          {isDM ? (
                            <input
                              type="number"
                              min="0"
                              value={coins[coin.key] || 0}
                              onChange={e => handleUpdateCoins(coin.key, parseInt(e.target.value) || 0)}
                              style={{
                                background: 'var(--bg-base)',
                                border: '1px solid var(--border-color)',
                                color: 'white',
                                padding: '6px 10px',
                                width: '80px',
                                borderRadius: '4px',
                                outline: 'none',
                                textAlign: 'right',
                                boxSizing: 'border-box'
                              }}
                            />
                          ) : (
                            <span className="mono" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: coin.color }}>{coins[coin.key] || 0}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {!isDM && (
                      <button
                        onClick={handleLootAllCoins}
                        className="font-cinzel torch-glow"
                        style={{
                          background: 'var(--accent-gold)',
                          color: '#000',
                          border: 'none',
                          padding: '12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '0.85rem',
                          marginTop: '20px',
                          width: '100%'
                        }}
                      >
                        <Coins className="w-4 h-4 inline-block mr-1" /> TOMAR TODAS LAS MONEDAS
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* FOOTER */}
              <div style={{ padding: '20px 30px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.2)' }}>
                <button onClick={() => setSelectedChestToken(null)} className="font-cinzel" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 25px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>CERRAR COFRE</button>
              </div>

            </div>
          </div>
        );
      })()}

      {compendiumSlotIndex !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002 }} onClick={() => setCompendiumSlotIndex(null)}>
          <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '500px', height: '550px', display: 'flex', flexDirection: 'column', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '25px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 className="font-cinzel" style={{ margin: '0 0 15px 0', color: 'var(--accent-gold)' }}><Box className="w-5 h-5 inline-block mr-2" /> CARGAR OBJETO A COFRE</h3>
              <input
                type="text"
                value={itemSearchQuery}
                onChange={e => setItemSearchQuery(e.target.value)}
                placeholder="🔍 Buscar objeto en el compendio..."
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  color: 'white',
                  padding: '12px',
                  width: '100%',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(compendium || [])
                .filter((item: any) => item.type === 'item' && item.name?.toLowerCase().includes(itemSearchQuery.toLowerCase()))
                .slice(0, 50)
                .map((item: any) => {
                  let itemData: any = {};
                  try {
                    itemData = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
                  } catch { itemData = item.data || {}; }
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItemForSlot(item)}
                      style={{
                        padding: '12px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'border-color 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 'bold', color: 'white' }}>{item.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{itemData.rarity || 'Común'}</span>
                      </div>
                      <span style={{ fontSize: '1.2rem' }}>+</span>
                    </div>
                  );
                })}
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setCompendiumSlotIndex(null)} className="font-cinzel" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {isCreatingNote && (
        <ModalCrearNota noteText={noteText} setNoteText={setNoteText} onSubmit={handleCreateNoteSubmit} onClose={() => setIsCreatingNote(false)} />
      )}

      {isCreatingImage && (
        <ModalColocarImagen imageUrlInput={imageUrlInput} onFileChange={handleImageFileChange} onSubmit={handleCreateImageSubmit} onClose={() => setIsCreatingImage(false)} />
      )}

      {selectedNoteToken && (
        <ModalNotaMapa selectedNoteToken={selectedNoteToken} boardTokens={boardTokens} userRole={userRole} socket={socket} onClose={() => setSelectedNoteToken(null)} />
      )}

      {selectedImageToken && (
        <ModalImagenMapa selectedImageToken={selectedImageToken} boardTokens={boardTokens} userRole={userRole} socket={socket} onClose={() => setSelectedImageToken(null)} />
      )}

      {selectedItemToken && (
        <ModalObjetoSuelo selectedItemToken={selectedItemToken} userRole={userRole} characters={characters} currentUser={currentUser} socket={socket} onPickup={handlePickupFloorItem} onClose={() => setSelectedItemToken(null)} />
      )}

      {/* MODAL DE VIDA Y CONDICION */}
      {healthModalToken && (() => {
        const SPELLCASTING_CLASSES = ['Brujo', 'Bardo', 'Paladín', 'Mago', 'Hechicero', 'Druida', 'Clérigo'];
        const SPELL_SLOTS_TABLE: Record<number, number[]> = {
          1:[2,0,0,0,0,0,0,0,0], 2:[3,0,0,0,0,0,0,0,0], 3:[4,2,0,0,0,0,0,0,0], 4:[4,3,0,0,0,0,0,0,0],
          5:[4,3,2,0,0,0,0,0,0], 6:[4,3,3,0,0,0,0,0,0], 7:[4,3,3,1,0,0,0,0,0], 8:[4,3,3,2,0,0,0,0,0],
          9:[4,3,3,3,1,0,0,0,0], 10:[4,3,3,3,2,0,0,0,0], 11:[4,3,3,3,2,1,0,0,0], 12:[4,3,3,3,2,1,0,0,0],
          13:[4,3,3,3,2,1,1,0,0], 14:[4,3,3,3,2,1,1,0,0], 15:[4,3,3,3,2,1,1,1,0], 16:[4,3,3,3,2,1,1,1,0],
          17:[4,3,3,3,2,1,1,1,1], 18:[4,3,3,3,3,1,1,1,1], 19:[4,3,3,3,3,2,1,1,1], 20:[4,3,3,3,3,2,2,1,1],
        };
        const charSource = healthModalToken.type === 'character'
          ? characters.find((c: any) => c.id === healthModalToken.originalId)
          : null;
        let parsedInv: any = {};
        if (charSource?.inventory) {
          try {
            let tmp = charSource.inventory;
            if (typeof tmp === 'string') tmp = JSON.parse(tmp);
            if (typeof tmp === 'string') tmp = JSON.parse(tmp);
            parsedInv = tmp || {};
          } catch {}
        }
        let isSpellcaster = false;
        let charLevel = 1;
        if (charSource) {
          charLevel = charSource.level || 1;
          try {
            const cls = typeof charSource.class === 'string' ? JSON.parse(charSource.class) : charSource.class;
            isSpellcaster = Object.keys(cls || {}).some((c: string) => SPELLCASTING_CLASSES.includes(c));
          } catch { isSpellcaster = SPELLCASTING_CLASSES.includes(charSource.class || ''); }
          // Also treat as spellcaster if they have stored spell slots
          if (!isSpellcaster && parsedInv?.slots && Object.keys(parsedInv.slots).length > 0) isSpellcaster = true;
        }
        const rawSpellSlots = parsedInv?.slots || {};
        const spellSlotsUsed: Record<number, number> = {};
        Object.entries(rawSpellSlots).forEach(([lvl, data]: [string, any]) => {
          spellSlotsUsed[parseInt(lvl)] = parseInt(data?.used) || 0;
        });
        const effectiveUsed: Record<number, number> = { ...spellSlotsUsed, ...(healthModalToken._spellSlotsUsed || {}) };
        const slotTable = SPELL_SLOTS_TABLE[Math.min(charLevel, 20)] || SPELL_SLOTS_TABLE[1];
        const handleSpellSlotToggle = (level: number, slotIndex: number) => {
          if (!charSource) return;
          const maxForLevel = slotTable[level - 1];
          const currentUsed = effectiveUsed[level] || 0;
          const newUsed = Math.min(slotIndex < currentUsed ? slotIndex : slotIndex + 1, maxForLevel);
          const newRawSlots = { ...rawSpellSlots, [level]: { max: maxForLevel, used: newUsed } };
          const newInv = { ...parsedInv, slots: newRawSlots };
          socket.emit('character:update', { ...charSource, inventory: JSON.stringify(newInv) });
          setHealthModalToken({ ...healthModalToken, _spellSlotsUsed: { ...(healthModalToken._spellSlotsUsed || {}), [level]: newUsed } });
        };
        const hpPct = Math.min(100, (healthModalToken.hp / Math.max(1, healthModalToken.max_hp)) * 100);
        const tmpPct = Math.min(100, ((healthModalToken.tempHp || 0) / Math.max(1, healthModalToken.max_hp)) * 100);
        const hpColor = hpPct > 60 ? '#22c55e' : hpPct > 30 ? '#f59e0b' : '#ef4444';
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001, backdropFilter: 'blur(4px)' }} onClick={() => setHealthModalToken(null)}>
            <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '560px', padding: '28px 32px', boxShadow: '0 0 80px rgba(0,0,0,0.95), 0 0 40px rgba(200,135,42,0.15)', animation: 'healthModalIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both' }} onClick={e => e.stopPropagation()}>

              {/* HEADER */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--accent-gold)', flexShrink: 0, background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {healthModalToken.image ? <img src={healthModalToken.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.4rem' }}>{healthModalToken.type === 'character' ? <User className="w-6 h-6 m-auto" /> : <Ghost className="w-6 h-6 m-auto" />}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="font-cinzel" style={{ color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '1rem' }}>{healthModalToken.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {healthModalToken.type === 'character' ? 'Héroe' : 'Criatura'} · {(healthModalToken.tempHp || 0) > 0 ? `${healthModalToken.tempHp} temp. HP` : 'Sin temp HP'}
                  </div>
                </div>
                <button onClick={() => setHealthModalToken(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.6rem', cursor: 'pointer', lineHeight: 1, padding: '4px' }}>✕</button>
              </div>

              {/* HEALTH BAR */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="font-cinzel" style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', letterSpacing: '1.5px' }}>PUNTOS DE GOLPE</span>
                  <span className="mono" style={{ color: 'white', fontWeight: 'bold' }}>
                    {healthModalToken.hp} <span style={{ color: 'var(--text-secondary)' }}>/ {healthModalToken.max_hp}</span>
                    {(healthModalToken.tempHp || 0) > 0 && <span style={{ color: '#60a5fa', marginLeft: '6px' }}>+{healthModalToken.tempHp}</span>}
                  </span>
                </div>
                <div style={{ width: '100%', height: '16px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', position: 'relative' }}>
                  <div style={{ height: '100%', width: `${hpPct}%`, background: `linear-gradient(90deg, ${hpColor}cc, ${hpColor})`, borderRadius: '8px', transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1), background 0.4s ease', boxShadow: `0 0 10px ${hpColor}80` }} />
                  {(healthModalToken.tempHp || 0) > 0 && (
                    <div style={{ position: 'absolute', top: 0, right: 0, height: '100%', width: `${tmpPct}%`, background: 'linear-gradient(90deg, rgba(96,165,250,0.4), rgba(96,165,250,0.8))', borderRadius: '0 8px 8px 0', transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
                  )}
                </div>
              </div>

              {/* INPUT + 3 BUTTONS ROW */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
                <input
                  type="number"
                  min="0"
                  value={healthInput}
                  onChange={e => setHealthInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const amt = parseInt(healthInput) || 0;
                      if (amt > 0) {
                        const newHp = Math.min(healthModalToken.max_hp, healthModalToken.hp + amt);
                        socket.emit('token:update-combat-state', { tokenId: healthModalToken.instanceId, hp: newHp });
                        setHealthModalToken({ ...healthModalToken, hp: newHp });
                        setHealthInput('');
                      }
                    }
                  }}
                  placeholder="Cantidad..."
                  style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '9px 14px', borderRadius: '6px', outline: 'none', fontSize: '1rem', fontFamily: 'monospace', fontWeight: 'bold', textAlign: 'center', boxSizing: 'border-box' }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      const amt = parseInt(healthInput) || 0;
                      if (amt > 0) {
                        const newHp = Math.min(healthModalToken.max_hp, healthModalToken.hp + amt);
                        socket.emit('token:update-combat-state', { tokenId: healthModalToken.instanceId, hp: newHp });
                        setHealthModalToken({ ...healthModalToken, hp: newHp });
                        setHealthInput('');
                      }
                    }}
                    className="font-cinzel"
                    style={{ flex: 1, background: '#16a34a', color: 'white', border: 'none', padding: '9px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.72rem', letterSpacing: '0.5px', transition: 'filter 0.15s, transform 0.1s', boxShadow: '0 2px 8px rgba(22,163,74,0.35)' }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  >+ CURAR</button>
                  <button
                    onClick={() => {
                      let amt = parseInt(healthInput) || 0;
                      if (amt > 0) {
                        let tempLeft = healthModalToken.tempHp || 0;
                        let realHp = healthModalToken.hp;
                        if (tempLeft >= amt) { tempLeft -= amt; }
                        else { amt -= tempLeft; tempLeft = 0; realHp = Math.max(0, realHp - amt); }
                        socket.emit('token:update-combat-state', { tokenId: healthModalToken.instanceId, hp: realHp, tempHp: tempLeft });
                        setHealthModalToken({ ...healthModalToken, hp: realHp, tempHp: tempLeft });
                        setHealthInput('');
                      }
                    }}
                    className="font-cinzel"
                    style={{ flex: 1, background: '#dc2626', color: 'white', border: 'none', padding: '9px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.72rem', letterSpacing: '0.5px', transition: 'filter 0.15s, transform 0.1s', boxShadow: '0 2px 8px rgba(220,38,38,0.35)' }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  >− DAÑO</button>
                  <button
                    onClick={() => {
                      const amt = parseInt(healthInput) || 0;
                      const newTemp = Math.max(0, (healthModalToken.tempHp || 0) + amt);
                      socket.emit('token:update-combat-state', { tokenId: healthModalToken.instanceId, tempHp: newTemp });
                      setHealthModalToken({ ...healthModalToken, tempHp: newTemp });
                      setHealthInput('');
                    }}
                    className="font-cinzel"
                    style={{ flex: 1, background: '#475569', color: 'white', border: 'none', padding: '9px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.72rem', letterSpacing: '0.5px', transition: 'filter 0.15s, transform 0.1s', boxShadow: '0 2px 8px rgba(71,85,105,0.35)' }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  >TEMP</button>
                </div>
              </div>

              {/* ESTADO / CONDICION */}
              <div style={{ marginBottom: isSpellcaster ? '18px' : '0' }}>
                <div className="font-cinzel" style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', letterSpacing: '1.5px', marginBottom: '8px' }}>ESTADO</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {['', '😵', '😨', '🔥', '❄️', '💤', '🛡️', '⚡', '🤢', '😡', '🤸'].map(emo => (
                    <button
                      key={emo || 'none'}
                      onClick={() => setConditionInput(emo)}
                      title={emo || 'Sin estado'}
                      style={{ width: '34px', height: '34px', borderRadius: '6px', background: conditionInput === emo ? 'rgba(200,135,42,0.25)' : 'var(--bg-base)', border: conditionInput === emo ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)', cursor: 'pointer', fontSize: '1.2rem', padding: 0, transition: 'all 0.15s', boxShadow: conditionInput === emo ? '0 0 8px rgba(200,135,42,0.4)' : 'none' }}
                    >{renderConditionIcon(emo)}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={conditionInput}
                    onChange={e => setConditionInput(e.target.value)}
                    placeholder="Emoji o texto corto..."
                    maxLength={5}
                    style={{ flex: 1, background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '8px 12px', borderRadius: '6px', outline: 'none' }}
                  />
                  <button
                    onClick={() => {
                      socket.emit('token:update-combat-state', { tokenId: healthModalToken.instanceId, condition: conditionInput || null });
                      setHealthModalToken({ ...healthModalToken, condition: conditionInput || null });
                    }}
                    className="font-cinzel"
                    style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                  >APLICAR</button>
                </div>
              </div>

              {/* SPELL SLOTS */}
              {isSpellcaster && (
                <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                  <div className="font-cinzel" style={{ fontSize: '0.68rem', color: '#a78bfa', letterSpacing: '1.5px', marginBottom: '10px' }}>ESPACIOS DE CONJUROS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {slotTable.map((maxSlots, i) => {
                      const level = i + 1;
                      if (maxSlots === 0) return null;
                      const used = effectiveUsed[level] || 0;
                      return (
                        <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="mono" style={{ fontSize: '0.65rem', color: '#a78bfa', width: '24px', flexShrink: 0, textAlign: 'center', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '4px', padding: '2px 0' }}>N{level}</span>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {Array.from({ length: maxSlots }).map((_, si) => {
                              const isSpent = si < used;
                              return (
                                <div
                                  key={si}
                                  onClick={() => handleSpellSlotToggle(level, si)}
                                  title={isSpent ? `Espacio ${si+1} gastado — clic para recuperar` : `Gastar espacio ${si+1}`}
                                  style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${isSpent ? 'rgba(167,139,250,0.25)' : '#a78bfa'}`, background: isSpent ? 'transparent' : 'rgba(167,139,250,0.85)', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: isSpent ? 'none' : '0 0 10px rgba(167,139,250,0.55)', transform: isSpent ? 'scale(0.8)' : 'scale(1)' }}
                                />
                              );
                            })}
                          </div>
                          <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginLeft: 'auto', flexShrink: 0 }}>{maxSlots - used}/{maxSlots}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 30px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes healthModalIn {
          from { opacity: 0; transform: scale(0.88) translateY(24px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes tsEntry {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutToRight {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(32px); }
        }
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutToLeft {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-32px); }
        }
        @keyframes fadeInPanel {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes sidebarItemIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
