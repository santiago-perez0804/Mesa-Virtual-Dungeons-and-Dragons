import React, { useEffect, useState, useRef } from 'react';
import { ChatPanel } from './ChatPanel';

const CELL_PX = 50;
const GRID_SIZE = 30;
const BOARD_PX = GRID_SIZE * CELL_PX;

const NoteTokenIcon = () => (
  <svg viewBox="0 0 64 64" style={{ width: '100%', height: '100%', display: 'block' }}>
    <rect x="12" y="8" width="40" height="48" rx="3" fill="#ecd5b0" stroke="#5c4327" strokeWidth="2.5" />
    <path d="M 12 18 L 52 18" stroke="#5c4327" strokeWidth="1.5" />
    <line x1="18" y1="26" x2="46" y2="26" stroke="#8c6d4f" strokeWidth="2" strokeDasharray="3 3" />
    <line x1="18" y1="34" x2="46" y2="34" stroke="#8c6d4f" strokeWidth="2" strokeDasharray="3 3" />
    <line x1="18" y1="42" x2="36" y2="42" stroke="#8c6d4f" strokeWidth="2" strokeDasharray="3 3" />
    <circle cx="44" cy="44" r="4" fill="#9b2c2c" stroke="#5f1d1d" strokeWidth="1" />
  </svg>
);

const ImageTokenIcon = () => (
  <svg viewBox="0 0 64 64" style={{ width: '100%', height: '100%', display: 'block' }}>
    <rect x="8" y="8" width="48" height="48" rx="4" fill="#2d3748" stroke="#b7791f" strokeWidth="2.5" />
    <rect x="12" y="12" width="40" height="40" fill="#1a202c" />
    <path d="M 14 44 L 26 30 L 34 38 L 42 32 L 50 44 Z" fill="#2b6cb0" opacity="0.8" />
    <circle cx="22" cy="20" r="3.5" fill="#ecc94b" />
  </svg>
);

const ClosedChestIcon = () => (
  <svg viewBox="0 0 64 64" style={{ width: '100%', height: '100%', display: 'block' }}>
    <rect x="8" y="26" width="48" height="30" rx="3" fill="#5c3a21" stroke="#2b1a0f" strokeWidth="2.5" />
    <path d="M 8 26 C 8 12, 56 12, 56 26 Z" fill="#784c2b" stroke="#2b1a0f" strokeWidth="2.5" />
    <rect x="18" y="14" width="6" height="42" fill="#4a5568" stroke="#1a202c" strokeWidth="1" />
    <rect x="40" y="14" width="6" height="42" fill="#4a5568" stroke="#1a202c" strokeWidth="1" />
    <circle cx="21" cy="26" r="1.5" fill="#ecc94b" />
    <circle cx="43" cy="26" r="1.5" fill="#ecc94b" />
    <circle cx="21" cy="45" r="1.5" fill="#ecc94b" />
    <circle cx="43" cy="45" r="1.5" fill="#ecc94b" />
    <rect x="28" y="24" width="8" height="10" rx="1.5" fill="#ecc94b" stroke="#744210" strokeWidth="1" />
    <circle cx="32" cy="28" r="1.8" fill="#000" />
    <path d="M 32 30 L 32 33" stroke="#000" strokeWidth="1.5" />
  </svg>
);

const OpenChestIcon = () => (
  <svg viewBox="0 0 64 64" style={{ width: '100%', height: '100%', display: 'block' }}>
    <path d="M 8 20 C 8 8, 56 8, 56 20 Z" fill="#4a301c" stroke="#1c110a" strokeWidth="2" transform="translate(0, -10) scale(1, 0.8)" />
    <rect x="18" y="0" width="6" height="12" fill="#2d3748" stroke="#1a202c" />
    <rect x="40" y="0" width="6" height="12" fill="#2d3748" stroke="#1a202c" />
    <ellipse cx="32" cy="24" rx="20" ry="7" fill="rgba(214, 158, 46, 0.6)" filter="blur(3px)" />
    <rect x="8" y="26" width="48" height="30" rx="3" fill="#5c3a21" stroke="#2b1a0f" strokeWidth="2.5" />
    <rect x="18" y="26" width="6" height="30" fill="#4a5568" stroke="#1a202c" strokeWidth="1" />
    <rect x="40" y="26" width="6" height="30" fill="#4a5568" stroke="#1a202c" strokeWidth="1" />
    <circle cx="20" cy="28" r="4.5" fill="#ecc94b" />
    <circle cx="28" cy="27" r="5" fill="#ecc94b" />
    <circle cx="36" cy="28" r="4.5" fill="#d69e2e" />
    <circle cx="44" cy="27" r="5" fill="#ecc94b" />
    <circle cx="24" cy="29" r="4" fill="#d69e2e" />
    <circle cx="32" cy="29" r="4" fill="#d69e2e" />
    <circle cx="40" cy="29" r="4" fill="#d69e2e" />
    <polygon points="26,26 29,23 32,26 29,29" fill="#e53e3e" />
    <polygon points="34,25 36,22 38,25 36,28" fill="#3182ce" />
    <polygon points="21,29 23,27 25,29 23,31" fill="#38a169" />
    <polygon points="41,28 43,26 45,28 43,30" fill="#805ad5" />
  </svg>
);

const ItemDropIcon = ({ rarity }: { rarity: string }) => {
  let color = '#a0aec0';
  const r = String(rarity || 'Común').toLowerCase();
  if (r.includes('raro') || r.includes('rare') || r.includes('muy')) {
    if (r.includes('muy') || r.includes('very')) {
      color = '#a855f7';
    } else {
      color = '#3b82f6';
    }
  } else if (r.includes('legend') || r.includes('leyen')) {
    color = '#f59e0b';
  } else if (r.includes('poco') || r.includes('uncom')) {
    color = '#10b981';
  }

  return (
    <svg viewBox="0 0 64 64" style={{ width: '100%', height: '100%', display: 'block' }}>
      <circle cx="32" cy="32" r="26" fill="none" stroke={color} strokeWidth="2.5" strokeDasharray="5 4" style={{ opacity: 0.85, filter: 'drop-shadow(0 0 4px ' + color + ')' }} />
      <circle cx="32" cy="32" r="20" fill={color} style={{ opacity: 0.15, filter: 'blur(4px)' }} />
      <path d="M 22 46 C 22 52, 42 52, 42 46 C 42 36, 38 34, 38 27 C 38 23, 40 21, 38 17 C 36 13, 28 13, 26 17 C 24 21, 26 23, 26 27 C 26 34, 22 36, 22 46 Z" fill="#a0522d" stroke="#5c2e16" strokeWidth="2.5" />
      <ellipse cx="32" cy="27" rx="7" ry="2" fill="#ecc94b" stroke="#b7791f" strokeWidth="1" />
      <path d="M 26 37 L 38 37" stroke="#5c2e16" strokeWidth="1.5" opacity="0.4" />
      <path d="M 29 44 L 35 44" stroke="#5c2e16" strokeWidth="1.5" opacity="0.4" />
      <polygon points="14,20 16,16 18,20 16,24" fill={color} opacity="0.9" />
      <polygon points="48,42 50,38 52,42 50,46" fill={color} opacity="0.9" />
      <polygon points="44,17 45,14 46,17 45,20" fill="#fff" opacity="0.8" />
    </svg>
  );
};

const getLineCells = (x0: number, y0: number, x1: number, y1: number) => {
  const cells: [number, number][] = [];
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  let sx = (x0 < x1) ? 1 : -1;
  let sy = (y0 < y1) ? 1 : -1;
  let err = dx - dy;

  while (true) {
    cells.push([x0, y0]);
    if (x0 === x1 && y0 === y1) break;
    let e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
  return cells;
};

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

  
  const isEditingSurfaceRef = useRef(isEditingSurface);
  const solidCellsRef = useRef(solidCells);
  const isPaintingWallRef = useRef(false);
  const paintModeRef = useRef<'add' | 'remove'>('add');
  const zoomRef = useRef(zoom);
  const fowCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { isEditingSurfaceRef.current = isEditingSurface; }, [isEditingSurface]);
  useEffect(() => { solidCellsRef.current = solidCells; }, [solidCells]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Drag con refs para evitar re-renders en cada mousemove
  const dragRef = useRef<any>(null);          // datos del drag activo
  const wasDraggingRef = useRef(false);       // previene click después de soltar drag
  const ghostRef = useRef<HTMLDivElement>(null); // elemento visual flotante
  const snapRef = useRef<HTMLDivElement>(null);  // indicador de casilla destino
  const panRef = useRef({ x: 0, y: 0 });        // pan sin re-render
  const isPanningRef = useRef(false);
  const startPanPosRef = useRef({ x: 0, y: 0 });
  const [drag, setDrag] = useState<any>(null); // solo para forzar re-render al soltar

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

  const safeParseInventory = (inventoryField: any): any => {
    const defaultInventory = { armas: [], armaduras: [], consumibles: [], artefactos: [], coins: { pc: 0, pl: 0, el: 0, po: 0, pt: 0 }, slots: {} };
    if (!inventoryField) return defaultInventory;
    let parsed = inventoryField;
    try {
      while (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
    } catch (e) {}
    if (!parsed || typeof parsed !== 'object') return defaultInventory;
    return {
      armas: Array.isArray(parsed.armas) ? parsed.armas : [],
      armaduras: Array.isArray(parsed.armaduras) ? parsed.armaduras : [],
      consumibles: Array.isArray(parsed.consumibles) ? parsed.consumibles : [],
      artefactos: Array.isArray(parsed.artefactos) ? parsed.artefactos : [],
      coins: parsed.coins && typeof parsed.coins === 'object' ? parsed.coins : defaultInventory.coins,
      slots: parsed.slots && typeof parsed.slots === 'object' ? parsed.slots : {}
    };
  };

  const getItemCategory = (itData: any) => {
    const tags = Array.isArray(itData.tags) ? itData.tags.map((t: string) => t.toLowerCase()) : [];
    if (itData.isDamage || tags.includes('arma') || tags.includes('weapon') || tags.includes('armas')) {
      return 'armas';
    }
    if (itData.isProtect || tags.includes('armadura') || tags.includes('armor') || tags.includes('armaduras')) {
      return 'armaduras';
    }
    if (tags.includes('pocion') || tags.includes('pergamino') || tags.includes('consumible') || tags.includes('potion') || tags.includes('scroll') || tags.includes('consumibles')) {
      return 'consumibles';
    }
    return 'artefactos';
  };

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

  useEffect(() => {
    socket.on('grid:bg-update', (img: string) => setBgImage(img));
    socket.on('combat:save-notification', (data: any) => setSaveNotification(data));
    socket.on('grid:solid-update', (cells: string[]) => setSolidCells(new Set(cells)));
    socket.on('grid:night-update', (isNight: boolean) => setIsNightMode(isNight));
    socket.on('combat:state-update', (state: any) => setCombatState(state));
    return () => {
      socket.off('grid:bg-update');
      socket.off('combat:save-notification');
      socket.off('grid:solid-update');
      socket.off('grid:night-update');
      socket.off('combat:state-update');
    };

  }, [socket]);

  useEffect(() => {
    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSpeed = 0.1;
      setZoom(prev => {
        const newZoom = e.deltaY < 0 ? prev + zoomSpeed : prev - zoomSpeed;
        return Math.max(0.3, Math.min(newZoom, 4));
      });
    };
    const viewport = viewportRef.current;
    if (viewport) viewport.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => { if (viewport) viewport.removeEventListener('wheel', handleNativeWheel); };
  }, []);

  const handleViewportMouseDown = (e: React.MouseEvent) => {
    if (isEditingSurfaceRef.current && e.button === 0) {
      // Comenzar a pintar/borrar paredes
      const bRect = boardRef.current?.getBoundingClientRect();
      if (!bRect) return;
      const localX = (e.clientX - bRect.left) / zoom;
      const localY = (e.clientY - bRect.top) / zoom;
      const cellX = Math.floor(localX / CELL_PX);
      const cellY = Math.floor(localY / CELL_PX);
      if (cellX >= 0 && cellX < GRID_SIZE && cellY >= 0 && cellY < GRID_SIZE) {
        const cellKey = `${cellX},${cellY}`;
        const newSet = new Set(solidCellsRef.current);
        if (newSet.has(cellKey)) {
          paintModeRef.current = 'remove';
          newSet.delete(cellKey);
        } else {
          paintModeRef.current = 'add';
          newSet.add(cellKey);
        }
        isPaintingWallRef.current = true;
        setSolidCells(newSet);
        socket.emit('grid:update-solid', Array.from(newSet));
      }
      return;
    }

    if (e.button === 1 || (e.button === 0 && !dragRef.current)) {
      isPanningRef.current = true;
      startPanPosRef.current = { x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y };
    }
  };

  // Registrar listeners UNA vez; todo usa refs para no re-registrar
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPaintingWallRef.current && isEditingSurfaceRef.current && boardRef.current) {
        const bRect = boardRef.current.getBoundingClientRect();
        const localX = (e.clientX - bRect.left) / zoomRef.current;
        const localY = (e.clientY - bRect.top) / zoomRef.current;
        const cellX = Math.floor(localX / CELL_PX);
        const cellY = Math.floor(localY / CELL_PX);
        if (cellX >= 0 && cellX < GRID_SIZE && cellY >= 0 && cellY < GRID_SIZE) {
          const cellKey = `${cellX},${cellY}`;
          const currentSet = solidCellsRef.current;
          
          if (paintModeRef.current === 'add' && !currentSet.has(cellKey)) {
            const newSet = new Set(currentSet);
            newSet.add(cellKey);
            socket.emit('grid:update-solid', Array.from(newSet));
            // No podemos usar setSolidCells aquí de forma fiable sin causar re-renders excesivos
            // así que el broadcast del server nos actualizará, pero podemos emitirlo frecuentemente
          } else if (paintModeRef.current === 'remove' && currentSet.has(cellKey)) {
            const newSet = new Set(currentSet);
            newSet.delete(cellKey);
            socket.emit('grid:update-solid', Array.from(newSet));
          }
        }
        return;
      }
      // PAN
      if (isPanningRef.current && boardRef.current) {
        const nx = e.clientX - startPanPosRef.current.x;
        const ny = e.clientY - startPanPosRef.current.y;
        panRef.current = { x: nx, y: ny };
        if (boardRef.current) {
          boardRef.current.style.left = nx + 'px';
          boardRef.current.style.top = ny + 'px';
        }
      }
      // DRAG de token
      if (dragRef.current && boardRef.current) {
        const d = dragRef.current;
        const bRect = boardRef.current.getBoundingClientRect();
        const zoomNow = d.zoom;
        const localX = (e.clientX - bRect.left) / zoomNow;
        const localY = (e.clientY - bRect.top) / zoomNow;
        // Mover ghost flotante con el cursor (libre, sin snap)
        const freeX = d.tokenStartX + (e.clientX - d.startX) / zoomNow;
        const freeY = d.tokenStartY + (e.clientY - d.startY) / zoomNow;
        
        d.hasMoved = true;

        if (ghostRef.current) {
          ghostRef.current.style.left = freeX + 'px';
          ghostRef.current.style.top = freeY + 'px';
        }
        // Snap indicator
        let cellX = Math.max(0, Math.min(Math.floor(localX / CELL_PX), GRID_SIZE - 1));
        let cellY = Math.max(0, Math.min(Math.floor(localY / CELL_PX), GRID_SIZE - 1));

        if (d.type === 'aoe') {
          cellX = freeX / CELL_PX;
          cellY = freeY / CELL_PX;

          if (ghostRef.current) ghostRef.current.style.display = 'none';

          const el = document.getElementById(`token-${d.tokenId}`);
          if (el) {
            const dx = (e.clientX - d.startX) / zoomNow;
            const dy = (e.clientY - d.startY) / zoomNow;
            el.style.left = (d.initialLeft + dx) + 'px';
            el.style.top = (d.initialTop + dy) + 'px';
          }
        }

        if (snapRef.current) {
          snapRef.current.style.left = (cellX * CELL_PX) + 'px';
          snapRef.current.style.top = (cellY * CELL_PX) + 'px';
          if (d.type === 'aoe') {
            snapRef.current.style.display = 'none';
          } else {
            snapRef.current.style.display = 'block';
          }
        }
        dragRef.current.snapX = cellX;
        dragRef.current.snapY = cellY;
      }
    };

    const handleMouseUp = () => {
      if (isPaintingWallRef.current) {
        isPaintingWallRef.current = false;
        // La actualización final ya se envió durante mousemove
      }
      isPanningRef.current = false;
      if (dragRef.current) {
        if (dragRef.current.hasMoved) {
          wasDraggingRef.current = true;
          setTimeout(() => { wasDraggingRef.current = false; }, 50);
        }
        const { tokenId, snapX, snapY } = dragRef.current;
        socket.emit('token:move', { tokenId, x: snapX, y: snapY });
        dragRef.current = null;
        if (ghostRef.current) ghostRef.current.style.display = 'none';
        if (snapRef.current) snapRef.current.style.display = 'none';
        setDrag(null); // fuerza re-render para actualizar posición final
      }
      // Sync pan al state para que React sepa dónde está el board
      setPan({ ...panRef.current });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [socket]); // solo se registra UNA vez

  const handleTokenMouseDown = (e: React.MouseEvent, tokenId: string) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const token = boardTokens.find((t: any) => t.instanceId === tokenId);
    if (!token) return;
    setActiveTokenId(tokenId);
    if (userRole !== 'dm' && (token.type !== 'character' || token.owner !== currentUser?.name)) return;

    const el = document.getElementById(`token-${tokenId}`);
    const initialLeft = el ? parseFloat(el.style.left || '0') : token.x * CELL_PX;
    const initialTop = el ? parseFloat(el.style.top || '0') : token.y * CELL_PX;

    dragRef.current = {
      tokenId,
      startX: e.clientX,
      startY: e.clientY,
      tokenStartX: token.x * CELL_PX,
      tokenStartY: token.y * CELL_PX,
      initialLeft,
      initialTop,
      snapX: token.x,
      snapY: token.y,
      zoom,
      image: token.image,
      name: token.name,
      type: token.type,
    };
    if (ghostRef.current) {
      ghostRef.current.style.left = (token.x * CELL_PX) + 'px';
      ghostRef.current.style.top = (token.y * CELL_PX) + 'px';
      ghostRef.current.style.display = 'block';
    }
    setDrag(tokenId); // solo para re-render que oculte token original
  };

  const myCharToken = boardTokens.find((t: any) => t.type === 'character' && t.owner === currentUser?.name);
  const myTeam = myCharToken?.teamColor || null;

  // Fog of War (Visible Cells Computation)
  const visibleCells = React.useMemo(() => {
    const vis = new Set<string>();
    const RADIUS = isNightMode ? 6 : 12; // 30ft vision (6 squares) at night, 60ft (12 squares) during day

    const myTokens = boardTokens.filter((t: any) => t.type === 'character' && (t.teamColor === myTeam || t.owner === currentUser?.name));
    const sourceTokens = (userRole === 'dm' || userRole === 'admin') 
      ? boardTokens.filter((t: any) => t.type === 'character' || t.type === 'monster') 
      : myTokens;

    sourceTokens.forEach((t: any) => {
      const tx = Math.floor(t.x);
      const ty = Math.floor(t.y);
      vis.add(`${tx},${ty}`);

      for (let x = tx - RADIUS; x <= tx + RADIUS; x++) {
        for (let y = ty - RADIUS; y <= ty + RADIUS; y++) {
          if (x === tx - RADIUS || x === tx + RADIUS || y === ty - RADIUS || y === ty + RADIUS) {
            const line = getLineCells(tx, ty, x, y);
            for (const [cx, cy] of line) {
              if (Math.hypot(cx - tx, cy - ty) > RADIUS) break;
              vis.add(`${cx},${cy}`);
              if (solidCells.has(`${cx},${cy}`)) break; // bloqueado por pared
            }
          }
        }
      }
    });
    return vis;
  }, [boardTokens, solidCells, myTeam, currentUser, userRole, isNightMode]);


  useEffect(() => {
    const canvas = fowCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Classify visible cells into innerVisible (100% visible) and boundary (75% visible)
    const cellVisMap = new Map<string, number>();
    visibleCells.forEach(cellKey => {
      const [cx, cy] = cellKey.split(',').map(Number);
      let isBoundary = false;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
            if (!visibleCells.has(`${nx},${ny}`)) {
              isBoundary = true;
              break;
            }
          }
        }
        if (isBoundary) break;
      }
      cellVisMap.set(cellKey, isBoundary ? 0.75 : 1.0);
    });

    // 2. Create offscreen mask canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = BOARD_PX;
    tempCanvas.height = BOARD_PX;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      // Fill the mask with solid black (100% fog)
      tempCtx.fillStyle = '#000000';
      tempCtx.fillRect(0, 0, BOARD_PX, BOARD_PX);

      // destination-out to carve out the fog
      tempCtx.globalCompositeOperation = 'destination-out';

      // Draw boundary cells at 0.75 opacity (leaves 25% fog/black -> 75% visible)
      tempCtx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      cellVisMap.forEach((vis, cellKey) => {
        if (vis === 0.75) {
          const [cx, cy] = cellKey.split(',').map(Number);
          tempCtx.fillRect(cx * CELL_PX, cy * CELL_PX, CELL_PX, CELL_PX);
        }
      });

      // Draw inner cells at 1.0 opacity (leaves 0% fog/black -> 100% visible)
      tempCtx.fillStyle = 'rgba(255, 255, 255, 1.0)';
      cellVisMap.forEach((vis, cellKey) => {
        if (vis === 1.0) {
          const [cx, cy] = cellKey.split(',').map(Number);
          tempCtx.fillRect(cx * CELL_PX, cy * CELL_PX, CELL_PX, CELL_PX);
        }
      });
    }

    // 3. Clear main canvas and draw mask with filter blur
    ctx.clearRect(0, 0, BOARD_PX, BOARD_PX);
    ctx.filter = 'blur(10px)';
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.filter = 'none';
  }, [visibleCells]);


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
      <div style={{ padding: '8px 20px', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 }}>
        
        {/* LADO IZQUIERDO: COMBATE, URL, APLICAR, LIMPIAR, EDITAR */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.2rem', letterSpacing: '1px' }}>COMBATE</h2>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="font-cinzel torch-glow"
            style={{
              background: isSidebarOpen ? 'rgba(200,135,42,0.15)' : 'transparent',
              border: '1px solid var(--border-color)',
              color: isSidebarOpen ? 'var(--accent-gold)' : 'var(--text-secondary)',
              padding: '4px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
            title={isSidebarOpen ? "Ocultar panel de combatientes" : "Mostrar panel de combatientes"}
          >
            {isSidebarOpen ? '◀ Fichas' : '▶ Fichas'}
          </button>
          {(userRole === 'dm' || userRole === 'admin') && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="mono"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '6px 12px', fontSize: '0.75rem', width: '200px' }}
                placeholder="URL del Mapa..."
                value={bgInputUrl}
                onChange={(e) => setBgInputUrl(e.target.value)}
              />
              <button
                onClick={() => { if (bgInputUrl) socket.emit('grid:set-bg', bgInputUrl); }}
                className="torch-glow"
                style={{ background: 'var(--accent-gold)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}
              >
                APLICAR
              </button>
              <button onClick={() => socket.emit('board:clear')} className="torch-glow" style={{ background: 'var(--combat-red)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>Limpiar Mapa</button>
              <button 
                onClick={() => setIsEditingSurface(!isEditingSurface)} 
                className="torch-glow" 
                style={{ background: isEditingSurface ? 'var(--accent-gold)' : 'transparent', color: isEditingSurface ? '#000' : 'white', border: '1px solid var(--accent-gold)', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {isEditingSurface ? 'Terminar Edición' : 'Editar Superficie'}
              </button>
            </div>
          )}
        </div>

        {/* LADO DERECHO: TURNOS, DIA/NOCHE, GRILLA, RESET */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          
          {/* TURNOS */}
          {(userRole === 'dm' || userRole === 'admin') && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => {
                  if (combatState.turnModeActive) {
                    socket.emit('combat:toggle-turn-mode', false);
                  } else {
                    if (allCombatantsRolled) {
                      socket.emit('combat:toggle-turn-mode', true);
                    }
                  }
                }}
                disabled={!combatState.turnModeActive && !allCombatantsRolled}
                className="font-cinzel torch-glow"
                style={{
                  background: combatState.turnModeActive ? 'var(--combat-red)' : 'var(--accent-gold)',
                  color: 'white',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '4px',
                  cursor: (!combatState.turnModeActive && !allCombatantsRolled) ? 'not-allowed' : 'pointer',
                  opacity: (!combatState.turnModeActive && !allCombatantsRolled) ? 0.5 : 1,
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                {combatState.turnModeActive ? 'Terminar Combate' : 'Modo Turnos'}
              </button>
              
              {combatState.turnModeActive && (
                <button
                  onClick={() => socket.emit('combat:next-turn')}
                  className="font-cinzel torch-glow"
                  style={{ background: 'var(--natural-green)', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                >
                  Siguiente ➡️
                </button>
              )}
            </div>
          )}

          {/* Pasar Turno para Jugadores */}
          {(userRole !== 'dm' && userRole !== 'admin') && combatState.turnModeActive && (() => {
            const currentTurnTokenId = combatState.initiativeOrder[combatState.currentTurnIndex]?.tokenId;
            const currentToken = boardTokens.find((t: any) => t.instanceId === currentTurnTokenId);
            const isMyTurn = currentToken && currentToken.owner === currentUser?.name;
            
            // Para jugadores que no es su turno, igual renderizamos un botón deshabilitado o invisible para que sepan de quién es el turno
            // Pero según el requerimiento: "a los jugadores en ese lugar les aparecerá un boton con forma de flecha que no hará nada al tocarse, se usará mas adelante"
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

          <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }} />

          {/* DIA / NOCHE */}
          {(userRole === 'dm' || userRole === 'admin') && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Día</span>
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
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Noche</span>
            </div>
          )}

          <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', display: (userRole === 'dm' || userRole === 'admin') ? 'block' : 'none' }} />

          {/* GRILLA, RESET */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={() => setShowGridLines(!showGridLines)} className="font-cinzel"
              style={{ background: showGridLines ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
              {showGridLines ? '👁️ Grilla' : '🙈 Grilla'}
            </button>
            <button onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }} className="font-cinzel"
              style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>🎯 Reset</button>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="font-cinzel torch-glow"
              style={{
                background: isChatOpen ? 'rgba(200,135,42,0.15)' : 'transparent',
                border: '1px solid var(--border-color)',
                color: isChatOpen ? 'var(--accent-gold)' : 'var(--text-secondary)',
                padding: '6px 14px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
              title={isChatOpen ? "Ocultar chat" : "Mostrar chat"}
            >
              {isChatOpen ? 'Chat ◀' : 'Chat ▶'}
            </button>
          </div>
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
                  const charSource = isChar ? characters.find((c: any) => c.id === t.originalId) : null;
                  let parsedInv: any = {};
                  if (charSource && charSource.inventory) {
                    try {
                      let temp = charSource.inventory;
                      if (typeof temp === 'string') temp = JSON.parse(temp);
                      if (typeof temp === 'string') temp = JSON.parse(temp);
                      parsedInv = temp || {};
                    } catch(e) {}
                  }

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
                        {t.image ? <img src={t.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.2rem' }}>{isChar ? '👤' : '👾'}</span>}
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
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚔️</div>
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
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎒</div>
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
          
          {/* BOTONES FLOTANTES AoE */}
          <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 200, display: 'flex', flexDirection: 'column', gap: '10px' }} onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
            <button title="Línea" onClick={() => { setAoeForm({...aoeForm, shape: 'line'}); setIsCreatingAoe(true); }} className="torch-glow" style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', fontSize: '1.4rem', padding: 0 }}>📏</button>
            <button title="Cono" onClick={() => { setAoeForm({...aoeForm, shape: 'cone'}); setIsCreatingAoe(true); }} className="torch-glow" style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', fontSize: '1.4rem', padding: 0 }}>📐</button>
            <button title="Círculo" onClick={() => { setAoeForm({...aoeForm, shape: 'circle'}); setIsCreatingAoe(true); }} className="torch-glow" style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', fontSize: '1.4rem', padding: 0 }}>⭕</button>
            <button title="Cubo" onClick={() => { setAoeForm({...aoeForm, shape: 'cube'}); setIsCreatingAoe(true); }} className="torch-glow" style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', fontSize: '1.4rem', padding: 0 }}>🔲</button>
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

      {saveNotification && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--bg-base)', border: '2px solid var(--combat-red)', padding: '40px', borderRadius: '4px', textAlign: 'center', zIndex: 10000, boxShadow: '0 0 50px rgba(0,0,0,0.8)' }}>
          <h2 className="font-cinzel" style={{ color: 'var(--combat-red)', fontSize: '2rem' }}>¡TIRADA DE SALVACIÓN!</h2>
          <p style={{ color: 'var(--text-parchment)' }}>El DM solicita una tirada de {saveNotification.stat.toUpperCase()}</p>
          {((currentUser && currentUser.name === saveNotification.targetName) || userRole === 'dm') && (
            <button
              onClick={() => {
                const myChar = characters.find((c: any) => c.name === saveNotification.targetName);
                if (!myChar) return;
                const stats = typeof myChar.stats === 'string' ? JSON.parse(myChar.stats) : myChar.stats;
                const mod = Math.floor(((stats[saveNotification.statKey] || 10) - 10) / 2);
                const roll = Math.floor(Math.random() * 20) + 1;
                const total = roll + mod;
                const pass = total >= saveNotification.dc;
                socket.emit('dice:roll', { die: 20 });
                socket.emit('chat:send', { user: currentUser?.name, text: `🎲 **${saveNotification.targetName}** lanzó **${saveNotification.stat}**: d20(${roll}) + ${mod} = **${total}**. ${pass ? '✅ **SUPERADO**' : '❌ **FALLADO**'}`, timestamp: Date.now() });
                setSaveNotification(null);
              }}
              className="font-cinzel"
              style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 20px', marginTop: '20px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              LANZAR DADO
            </button>
          )}
        </div>
      )}

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
                  {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '2.5rem' }}>{isChar ? '👤' : '👾'}</span>}
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
                      <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>🎲 HABILIDADES</h4>
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
                  <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>📜 DESCRIPCIÓN</h4>
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
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={() => setIsCreatingAoe(false)}>
          <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '400px', padding: '30px', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
            <h3 className="font-cinzel" style={{ margin: '0 0 20px 0', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', textTransform: 'uppercase' }}>CREAR ÁREA DE EFECTO ({aoeForm.shape})</h3>
            <form onSubmit={handleSpawnAoe}>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>{aoeForm.shape === 'line' ? 'LARGO (Casillas)' : (aoeForm.shape === 'circle' ? 'RADIO (Casillas)' : 'TAMAÑO (Casillas)')}</label>
                  <input
                    type="number"
                    min="1"
                    value={aoeForm.size1}
                    onChange={e => setAoeForm({...aoeForm, size1: parseInt(e.target.value) || 1})}
                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '12px', width: '100%', borderRadius: '4px', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
                {aoeForm.shape === 'line' && (
                  <div style={{ flex: 1 }}>
                    <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>ANCHO (Casillas)</label>
                    <input
                      type="number"
                      min="1"
                      value={aoeForm.size2}
                      onChange={e => setAoeForm({...aoeForm, size2: parseInt(e.target.value) || 1})}
                      style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '12px', width: '100%', borderRadius: '4px', boxSizing: 'border-box', outline: 'none' }}
                    />
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>COLOR DEL ÁREA</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['#ef4444', '#3b82f6', '#10b981', '#ecc94b', '#a855f7', '#ec4899', '#f97316', '#64748b'].map(color => (
                    <div
                      key={color}
                      onClick={() => setAoeForm({...aoeForm, color})}
                      style={{ width: '30px', height: '30px', borderRadius: '50%', background: color, cursor: 'pointer', border: aoeForm.color === color ? '3px solid white' : '1px solid rgba(255,255,255,0.3)', transform: aoeForm.color === color ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.1s' }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsCreatingAoe(false)} className="font-cinzel" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Cancelar</button>
                <button type="submit" className="font-cinzel torch-glow" style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>INVOCAR</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedAoeToken && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={() => setSelectedAoeToken(null)}>
          <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '450px', padding: '30px', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
            <h3 className="font-cinzel" style={{ margin: '0 0 20px 0', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>EDITAR ÁREA DE EFECTO</h3>
            
            <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>ROTACIÓN (Grados)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={selectedAoeToken.aoeData?.rotation || 0}
                    onChange={e => {
                      const newRot = parseInt(e.target.value) || 0;
                      setSelectedAoeToken({...selectedAoeToken, aoeData: {...selectedAoeToken.aoeData, rotation: newRot}});
                      socket.emit('token:update-aoe', { tokenId: selectedAoeToken.instanceId, aoeData: {...selectedAoeToken.aoeData, rotation: newRot} });
                    }}
                    style={{ flex: 1, accentColor: 'var(--accent-gold)' }}
                  />
                  <span className="mono" style={{ color: 'white', width: '40px', textAlign: 'right' }}>{selectedAoeToken.aoeData?.rotation || 0}°</span>
                </div>
              </div>
              
              <div style={{ width: '60px', height: '60px', border: '1px solid var(--border-color)', background: '#0a0a0a', position: 'relative', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
                {(() => {
                  const aoe = selectedAoeToken.aoeData;
                  if (!aoe) return null;
                  
                  // Calculate dynamic cell size to fit shape inside 50px bounding box
                  let shapeW = aoe.size1 || 1;
                  let shapeH = aoe.size1 || 1;
                  if (aoe.shape === 'circle') {
                    shapeW = (aoe.size1 || 1) * 2;
                    shapeH = (aoe.size1 || 1) * 2;
                  } else if (aoe.shape === 'line') {
                    shapeW = aoe.size1 || 1;
                    shapeH = aoe.size2 || 1;
                  }
                  const maxDim = Math.max(shapeW, shapeH);
                  const miniCell = maxDim > 0 ? (50 / maxDim) : 10;
                  
                  const r = aoe.rotation || 0;
                  let svgContent = null;
                  let w = miniCell, h = miniCell;
                  let transformOrigin = 'center';
                  
                  if (aoe.shape === 'circle') {
                    const radPx = aoe.size1 * miniCell;
                    w = radPx * 2; h = radPx * 2;
                    svgContent = <circle cx={radPx} cy={radPx} r={radPx} fill={aoe.color} fillOpacity={0.6} stroke={aoe.color} strokeWidth={1} />;
                  } else if (aoe.shape === 'line') {
                    w = aoe.size1 * miniCell; h = aoe.size2 * miniCell;
                    svgContent = <rect x={0} y={0} width={w} height={h} fill={aoe.color} fillOpacity={0.6} stroke={aoe.color} strokeWidth={1} />;
                  } else if (aoe.shape === 'cone') {
                    w = aoe.size1 * miniCell; h = w;
                    svgContent = <polygon points={`0,${h/2} ${w},0 ${w},${h}`} fill={aoe.color} fillOpacity={0.6} stroke={aoe.color} strokeWidth={1} strokeLinejoin="round" />;
                  } else if (aoe.shape === 'cube') {
                    w = aoe.size1 * miniCell; h = w;
                    svgContent = <rect x={0} y={0} width={w} height={h} fill={aoe.color} fillOpacity={0.6} stroke={aoe.color} strokeWidth={1} />;
                  }
                  
                  return (
                    <div style={{ position: 'relative', width: w, height: h, transform: `rotate(${r}deg)`, transformOrigin }}>
                      <svg width={w} height={h} style={{ overflow: 'visible' }}>
                        {svgContent}
                      </svg>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>COLOR DEL ÁREA</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['#ef4444', '#3b82f6', '#10b981', '#ecc94b', '#a855f7', '#ec4899', '#f97316', '#64748b'].map(color => (
                  <div
                    key={color}
                    onClick={() => {
                      setSelectedAoeToken({...selectedAoeToken, aoeData: {...selectedAoeToken.aoeData, color}});
                      socket.emit('token:update-aoe', { tokenId: selectedAoeToken.instanceId, aoeData: {...selectedAoeToken.aoeData, color} });
                    }}
                    style={{ width: '30px', height: '30px', borderRadius: '50%', background: color, cursor: 'pointer', border: selectedAoeToken.aoeData?.color === color ? '3px solid white' : '1px solid rgba(255,255,255,0.3)', transform: selectedAoeToken.aoeData?.color === color ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.1s' }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <button
                onClick={() => {
                  socket.emit('token:remove', selectedAoeToken.instanceId);
                  setSelectedAoeToken(null);
                }}
                className="font-cinzel"
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--combat-red)', border: '1px solid var(--combat-red)', padding: '10px 15px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}
              >
                ELIMINAR ÁREA
              </button>
              <button onClick={() => setSelectedAoeToken(null)} className="font-cinzel" style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>LISTO</button>
            </div>
          </div>
        </div>
      )}

      {isCreatingChest && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={() => setIsCreatingChest(false)}>
          <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '400px', padding: '30px', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
            <h3 className="font-cinzel" style={{ margin: '0 0 20px 0', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>📦 CREAR COFRE</h3>
            <form onSubmit={handleCreateChestSubmit}>
              <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>CONTRASEÑA DEL COFRE</label>
              <input
                type="text"
                value={chestPassword}
                onChange={e => setChestPassword(e.target.value)}
                placeholder="Ingresa una contraseña..."
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  color: 'white',
                  padding: '12px',
                  width: '100%',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  fontSize: '1rem',
                  outline: 'none',
                  marginBottom: '20px'
                }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsCreatingChest(false)} className="font-cinzel" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Cancelar</button>
                <button type="submit" className="font-cinzel torch-glow" style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>COLOCAR</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSelectingCompendiumItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={() => setIsSelectingCompendiumItem(false)}>
          <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '500px', height: '600px', display: 'flex', flexDirection: 'column', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '25px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 className="font-cinzel" style={{ margin: '0 0 15px 0', color: 'var(--accent-gold)' }}>⚔️ SELECCIONAR OBJETO</h3>
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
                      onClick={() => handleSpawnItem(item)}
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
              <button onClick={() => setIsSelectingCompendiumItem(false)} className="font-cinzel" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {passwordPromptChest && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={() => setPasswordPromptChest(null)}>
          <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '400px', padding: '30px', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
            <h3 className="font-cinzel" style={{ margin: '0 0 20px 0', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>🔒 COFRE CERRADO</h3>
            <form onSubmit={handleVerifyPasswordSubmit}>
              <p style={{ color: 'var(--text-parchment)', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 20px 0' }}>Este cofre está cerrado bajo contraseña. Para abrirlo y tomar su botín debes ingresar la contraseña establecida por el DM.</p>
              <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>CONTRASEÑA</label>
              <input
                type="text"
                value={enteredPassword}
                onChange={e => setEnteredPassword(e.target.value)}
                placeholder="Ingresa la contraseña del cofre..."
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  color: 'white',
                  padding: '12px',
                  width: '100%',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  fontSize: '1rem',
                  outline: 'none',
                  marginBottom: '10px'
                }}
              />
              {passwordError && <p style={{ color: 'var(--combat-red)', fontSize: '0.8rem', margin: '0 0 20px 0', fontWeight: 'bold' }}>⚠️ {passwordError}</p>}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: passwordError ? '0' : '20px' }}>
                <button type="button" onClick={() => setPasswordPromptChest(null)} className="font-cinzel" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Cancelar</button>
                <button type="submit" className="font-cinzel torch-glow" style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>ABRIR</button>
              </div>
            </form>
          </div>
        </div>
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
                  <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 15px 0', fontSize: '1rem', letterSpacing: '1.5px', textTransform: 'uppercase', alignSelf: 'flex-start' }}>📦 Compartimentos (3x3)</h4>
                  
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
                  <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 15px 0', fontSize: '1rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>🪙 Monedas en el cofre</h4>
                  
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
                        🪙 TOMAR TODAS LAS MONEDAS
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
              <h3 className="font-cinzel" style={{ margin: '0 0 15px 0', color: 'var(--accent-gold)' }}>📦 CARGAR OBJETO A COFRE</h3>
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
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={() => setIsCreatingNote(false)}>
          <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '450px', padding: '30px', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
            <h3 className="font-cinzel" style={{ margin: '0 0 20px 0', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>📝 CREAR NOTA EN MAPA</h3>
            <form onSubmit={handleCreateNoteSubmit}>
              <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>CONTENIDO DE LA NOTA</label>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Escribe el texto de la nota aquí..."
                rows={5}
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  color: 'white',
                  padding: '12px',
                  width: '100%',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  fontSize: '0.95rem',
                  outline: 'none',
                  marginBottom: '20px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsCreatingNote(false)} className="font-cinzel" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Cancelar</button>
                <button type="submit" className="font-cinzel torch-glow" style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>COLOCAR</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCreatingImage && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={() => setIsCreatingImage(false)}>
          <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '450px', padding: '30px', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
            <h3 className="font-cinzel" style={{ margin: '0 0 20px 0', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>🖼️ COLOCAR IMAGEN</h3>
            <form onSubmit={handleCreateImageSubmit}>
              <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>CARGAR ARCHIVO DE IMAGEN</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                style={{
                  color: 'white',
                  marginBottom: '20px',
                  fontSize: '0.9rem'
                }}
              />
              {imageUrlInput && (
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>VISTA PREVIA</span>
                  <img src={imageUrlInput} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsCreatingImage(false)} className="font-cinzel" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Cancelar</button>
                <button type="submit" className="font-cinzel torch-glow" style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px', opacity: imageUrlInput ? 1 : 0.5 }} disabled={!imageUrlInput}>COLOCAR</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedNoteToken && (() => {
        const activeNote = boardTokens.find((t: any) => t.instanceId === selectedNoteToken.instanceId);
        if (!activeNote) return null;
        const isDM = userRole === 'dm' || userRole === 'admin';
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }} onClick={() => setSelectedNoteToken(null)}>
            <div className="clipped-frame" style={{ width: '100%', maxWidth: '500px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 0 50px rgba(0,0,0,0.9)', border: '2px solid var(--accent-gold)' }} onClick={e => e.stopPropagation()}>
              {/* HEADER */}
              <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ width: '40px', height: '40px', border: '1.5px solid var(--accent-gold)', flexShrink: 0, padding: '3px', background: 'rgba(0,0,0,0.3)' }}>
                  <NoteTokenIcon />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 className="font-cinzel" style={{ margin: 0, fontSize: '1.4rem', color: 'var(--accent-gold)' }}>NOTA DEL MAPA</h3>
                </div>
                {isDM && (
                  <button
                    onClick={() => {
                      if (confirm("¿Eliminar esta nota permanentemente?")) {
                        socket.emit('token:remove', activeNote.instanceId);
                        setSelectedNoteToken(null);
                      }
                    }}
                    className="font-cinzel"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--combat-red)', border: '1px solid var(--combat-red)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}
                  >
                    🗑️ ELIMINAR
                  </button>
                )}
              </div>

              {/* BODY */}
              <div style={{ padding: '30px', overflowY: 'auto', background: 'var(--bg-surface)' }}>
                <div style={{ color: 'var(--text-parchment)', fontSize: '1.05rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontFamily: 'serif', padding: '15px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                  {activeNote.noteData?.text || 'Esta nota está vacía.'}
                </div>
              </div>

              {/* FOOTER */}
              <div style={{ padding: '15px 25px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.2)' }}>
                <button onClick={() => setSelectedNoteToken(null)} className="font-cinzel" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '8px 20px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>CERRAR</button>
              </div>
            </div>
          </div>
        );
      })()}

      {selectedImageToken && (() => {
        const activeImage = boardTokens.find((t: any) => t.instanceId === selectedImageToken.instanceId);
        if (!activeImage) return null;
        const isDM = userRole === 'dm' || userRole === 'admin';
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }} onClick={() => setSelectedImageToken(null)}>
            <div className="clipped-frame" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 0 50px rgba(0,0,0,0.9)', border: '2px solid var(--accent-gold)' }} onClick={e => e.stopPropagation()}>
              {/* HEADER */}
              <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ width: '40px', height: '40px', border: '1.5px solid var(--accent-gold)', flexShrink: 0, padding: '3px', background: 'rgba(0,0,0,0.3)' }}>
                  <ImageTokenIcon />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 className="font-cinzel" style={{ margin: 0, fontSize: '1.4rem', color: 'var(--accent-gold)' }}>IMAGEN EN MAPA</h3>
                </div>
                {isDM && (
                  <button
                    onClick={() => {
                      if (confirm("¿Eliminar esta imagen del mapa?")) {
                        socket.emit('token:remove', activeImage.instanceId);
                        setSelectedImageToken(null);
                      }
                    }}
                    className="font-cinzel"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--combat-red)', border: '1px solid var(--combat-red)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}
                  >
                    🗑️ ELIMINAR
                  </button>
                )}
              </div>

              {/* BODY */}
              <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-surface)' }}>
                {activeImage.imageData?.url ? (
                  <img src={activeImage.imageData.url} alt="Image map content" style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} />
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>No hay ninguna imagen cargada.</p>
                )}
              </div>

              {/* FOOTER */}
              <div style={{ padding: '15px 25px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.2)' }}>
                <button onClick={() => setSelectedImageToken(null)} className="font-cinzel" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '8px 20px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>CERRAR</button>
              </div>
            </div>
          </div>
        );
      })()}

      {selectedItemToken && (() => {
        const item = selectedItemToken.itemData;
        if (!item) return null;
        
        const isDM = userRole === 'dm' || userRole === 'admin';
        const myChars = characters.filter((c: any) => userRole === 'dm' || c.owner === currentUser.name);

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }} onClick={() => setSelectedItemToken(null)}>
            <div className="clipped-frame" style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 0 50px rgba(0,0,0,0.9)', border: '2px solid var(--accent-gold)' }} onClick={e => e.stopPropagation()}>
              
              {/* HEADER */}
              <div style={{ padding: '25px 30px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '20px', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ width: '50px', height: '50px', border: '2px solid var(--accent-gold)', overflow: 'hidden', flexShrink: 0, background: 'rgba(0,0,0,0.4)', padding: '5px' }}>
                  {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ItemDropIcon rarity={item.rarity || 'Común'} />}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 className="font-cinzel" style={{ margin: 0, fontSize: '1.6rem', color: 'var(--accent-gold)' }}>{item.name}</h2>
                  <p className="font-cinzel" style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Objeto en el suelo • {item.rarity}
                  </p>
                </div>
                {isDM && (
                  <button
                    onClick={() => {
                      socket.emit('token:remove', selectedItemToken.instanceId);
                      setSelectedItemToken(null);
                    }}
                    className="font-cinzel"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--combat-red)', border: '1px solid var(--combat-red)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}
                  >
                    🗑️ ELIMINAR
                  </button>
                )}
              </div>

              {/* BODY */}
              <div style={{ padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--bg-surface)' }}>
                <div>
                  <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '10px', fontSize: '0.9rem' }}>📜 DESCRIPCIÓN</h4>
                  <p style={{ color: 'var(--text-parchment)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {item.description || 'Sin descripción disponible.'}
                  </p>
                </div>
                
                {myChars.length > 0 && (
                  <div style={{ marginTop: '10px', background: 'rgba(0,0,0,0.2)', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 4px 0', fontSize: '0.9rem' }}>🎒 RECOGER OBJETO</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>Se agregará directamente a tu inventario y desaparecerá del mapa.</p>
                    </div>
                    
                    <button
                      onClick={handlePickupFloorItem}
                      className="font-cinzel torch-glow"
                      style={{
                        background: 'var(--accent-gold)',
                        color: '#000',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.85rem'
                      }}
                    >
                      RECOGER
                    </button>
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div style={{ padding: '20px 30px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.2)' }}>
                <button onClick={() => setSelectedItemToken(null)} className="font-cinzel" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>CERRAR</button>
              </div>

            </div>
          </div>
        );
      })()}

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
                  {healthModalToken.image ? <img src={healthModalToken.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.4rem' }}>{healthModalToken.type === 'character' ? '👤' : '👾'}</span>}
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
                    >{emo || '✕'}</button>
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