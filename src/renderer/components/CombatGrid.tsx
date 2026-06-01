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

export const CombatGrid = ({ socket, userRole, currentUser, boardTokens, characters, monsters, chatMessages, compendium = [] }: any) => {
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgInputUrl, setBgInputUrl] = useState('');
  const [zoom, setZoom] = useState(1);
  const [showGridLines, setShowGridLines] = useState(true);
  const [gridOpacity] = useState(0.2);
  const [saveNotification, setSaveNotification] = useState<any>(null);
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



  const [pan, setPan] = useState({ x: 0, y: 0 });

  const viewportRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Drag con refs para evitar re-renders en cada mousemove
  const dragRef = useRef<any>(null);          // datos del drag activo
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

  const handleImageFileChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageUrlInput(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    socket.on('grid:bg-update', (img: string) => setBgImage(img));
    socket.on('combat:save-notification', (data: any) => setSaveNotification(data));
    return () => {
      socket.off('grid:bg-update');
      socket.off('combat:save-notification');
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
    if (e.button === 1 || (e.button === 0 && !dragRef.current)) {
      isPanningRef.current = true;
      startPanPosRef.current = { x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y };
    }
  };

  // Registrar listeners UNA vez; todo usa refs para no re-registrar
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
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
        if (ghostRef.current) {
          ghostRef.current.style.left = freeX + 'px';
          ghostRef.current.style.top = freeY + 'px';
        }
        // Snap indicator
        let cellX = Math.max(0, Math.min(Math.floor(localX / CELL_PX), GRID_SIZE - 1));
        let cellY = Math.max(0, Math.min(Math.floor(localY / CELL_PX), GRID_SIZE - 1));
        if (snapRef.current) {
          snapRef.current.style.left = (cellX * CELL_PX) + 'px';
          snapRef.current.style.top = (cellY * CELL_PX) + 'px';
          snapRef.current.style.display = 'block';
        }
        dragRef.current.snapX = cellX;
        dragRef.current.snapY = cellY;
      }
    };

    const handleMouseUp = () => {
      isPanningRef.current = false;
      if (dragRef.current) {
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
    e.stopPropagation();
    const token = boardTokens.find((t: any) => t.instanceId === tokenId);
    if (!token) return;
    setActiveTokenId(tokenId);
    if (userRole !== 'dm' && (token.type !== 'character' || token.owner !== currentUser?.name)) return;
    dragRef.current = {
      tokenId,
      startX: e.clientX,
      startY: e.clientY,
      tokenStartX: token.x * CELL_PX,
      tokenStartY: token.y * CELL_PX,
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

  // Visibilidad en la Grilla (Mapa)
  const canSeeOnGrid = (_t: any) => {
    return true; // En el mapa todos pueden ver a todos
  };

  // Visibilidad en el Panel de Combatientes (Sidebar)
  const canSeeInSidebar = (t: any) => {
    if (t.type === 'chest' || t.type === 'item' || t.type === 'note' || t.type === 'image') return false; // Excluir objetos, notas e imágenes de la sección de combatientes
    if (userRole === 'dm' || userRole === 'admin') return true; // El DM/Admin ve todos
    
    // Si es un jugador, debe tener un personaje con color asignado
    const myCharToken = boardTokens.find((charToken: any) => charToken.type === 'character' && charToken.owner === currentUser?.name);
    const myTeam = myCharToken?.teamColor;
    
    if (!myTeam || !t.teamColor) return false;
    return t.teamColor === myTeam;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-base)', position: 'relative' }} onClick={() => { setActiveTokenId(null); setContextMenu(null); }}>

      {/* TOOLBAR SUPERIOR */}
      <div style={{ padding: '12px 20px', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.2rem', letterSpacing: '1px' }}>⚔️ COMBATE</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Zoom:</span>
            <input type="range" min="0.2" max="2" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} style={{ width: '80px', accentColor: 'var(--accent-gold)' }} />
          </div>
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
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowGridLines(!showGridLines)} className="font-cinzel"
            style={{ background: showGridLines ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
            {showGridLines ? '👁️ Grilla' : '🙈 Grilla'}
          </button>
          <button onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }} className="font-cinzel"
            style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>🎯 Reset</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* COLUMNA IZQ: COMBATIENTES u OBJETOS */}
        <div style={{ width: '320px', background: 'rgba(0,0,0,0.2)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          
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
                <span style={{
                  fontSize: '1rem',
                  filter: sidebarTab === 'combatants' ? 'drop-shadow(0 0 4px rgba(200,135,42,0.9))' : 'none',
                  transition: 'filter 0.25s ease'
                }}>⚔️</span>
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
                <span style={{
                  fontSize: '1rem',
                  filter: sidebarTab === 'objects' ? 'drop-shadow(0 0 4px rgba(200,135,42,0.9))' : 'none',
                  transition: 'filter 0.25s ease'
                }}>🎒</span>
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
              {boardTokens.filter(canSeeInSidebar).map((t: any, idx: number) => (
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
                  onClick={(e) => { e.stopPropagation(); setActiveTokenId(t.instanceId); }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative', width: '42px', height: '42px', border: `2px solid ${t.teamColor || 'var(--border-color)'}`, overflow: 'hidden', flexShrink: 0 }}>
                      {t.image ? <img src={t.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.2rem' }}>{t.type === 'character' ? '👤' : '👾'}</span>}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div className="font-cinzel" style={{ color: 'white', fontSize: '0.95rem', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onClick={(e) => { e.stopPropagation(); setViewingToken(t); }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: t.type === 'character' ? 'var(--accent-gold)' : 'var(--combat-red)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{t.type === 'character' ? 'Héroe' : 'Criatura'}</div>
                    </div>
                    {(userRole === 'dm' || t.owner === currentUser.name) && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <div className="mono" style={{ color: 'var(--natural-green)', fontSize: '0.9rem', fontWeight: 'bold' }}>{t.hp} <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>/ {t.max_hp}</span></div>
                        <div style={{ width: '40px', height: '3px', background: 'rgba(0,0,0,0.4)', marginTop: '4px' }}>
                          <div style={{ width: `${Math.min(100, (t.hp / t.max_hp) * 100)}%`, height: '100%', background: t.hp / t.max_hp > 0.5 ? 'var(--natural-green)' : 'var(--combat-red)', transition: 'width 0.4s ease' }} />
                        </div>
                      </div>
                    )}
                  </div>
                  {activeTokenId === t.instanceId && (userRole === 'dm' || userRole === 'admin') && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }} onClick={e => e.stopPropagation()}>
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
              ))}
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

        {/* COLUMNA CENTRAL: MAPA */}
        <div ref={viewportRef} style={{ position: 'relative', flex: 1, overflow: 'hidden', background: '#000' }} onMouseDown={handleViewportMouseDown}>
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

            <div ref={snapRef} style={{ display: 'none', position: 'absolute', width: CELL_PX, height: CELL_PX, background: 'rgba(200, 135, 42, 0.1)', border: '2px dashed var(--accent-gold)', borderRadius: '50%', pointerEvents: 'none', zIndex: 99 }} />

            <div ref={ghostRef} style={{ display: 'none', position: 'absolute', width: CELL_PX, height: CELL_PX, borderRadius: '50%', background: 'var(--accent-gold)', border: '3px solid white', opacity: 0.85, zIndex: 100, pointerEvents: 'none', boxShadow: '0 8px 25px rgba(0,0,0,0.5)', transform: 'scale(1.1)', overflow: 'hidden' }} />

            {boardTokens.filter(canSeeOnGrid).map((t: any) => {
              const isDragging = drag === t.instanceId;
              const isMyTeam = (userRole === 'dm' || (t.teamColor && t.teamColor === myTeam) || (currentUser && t.owner === currentUser.name));
              const tokenOpacity = isDragging ? 0 : 1;
              
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
                    boxShadow: isChest || isItem || isNote || isImage ? 'none' : (t.teamColor ? `0 0 15px ${t.teamColor}` : '0 4px 10px rgba(0,0,0,0.5)'),
                    transform: activeTokenId === t.instanceId ? 'scale(1.1)' : 'scale(0.9)',
                    transition: 'transform 0.1s'
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
        <div style={{ width: '300px', display: 'flex', borderLeft: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
          <ChatPanel socket={socket} currentUser={currentUser} characters={characters} messages={chatMessages} />
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
                  {Object.entries(stats).map(([key, val]: [string, any]) => (
                    <div key={key} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', padding: '12px', textAlign: 'center' }}>
                      <div className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 'bold', textTransform: 'uppercase' }}>{key}</div>
                      <div className="mono" style={{ fontSize: '1.4rem', color: 'white', fontWeight: 'bold' }}>{val}</div>
                      <div className="mono" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{statMod(val)}</div>
                    </div>
                  ))}
                </div>

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
                  <ItemDropIcon rarity={item.rarity || 'Común'} />
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

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 30px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
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