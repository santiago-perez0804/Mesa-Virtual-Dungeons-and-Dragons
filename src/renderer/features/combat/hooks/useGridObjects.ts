import { useState } from 'react';

export const useGridObjects = (
  socket: any,
  userRole: string,
  currentUser: any,
  boardTokens: any[],
  characters: any[],
  zoom: number,
  CELL_PX: number,
  GRID_SIZE: number,
  boardRef: React.RefObject<HTMLDivElement>,
  viewportRef: React.RefObject<HTMLDivElement>,
  pan: { x: number, y: number }
) => {
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

  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [selectedNoteToken, setSelectedNoteToken] = useState<any>(null);

  const [isCreatingImage, setIsCreatingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [selectedImageToken, setSelectedImageToken] = useState<any>(null);

  const [isCreatingAoe, setIsCreatingAoe] = useState(false);
  const [aoeForm, setAoeForm] = useState({ shape: 'circle', size1: 3, size2: 1, color: '#ef4444' });
  const [selectedAoeToken, setSelectedAoeToken] = useState<any>(null);
  const [activeAoeTool, setActiveAoeTool] = useState<string | null>(null);

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
        slots: Array(9).fill(null),
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
        text: `[COFRE] **${currentUser.name}** abrió un cofre con la contraseña correcta en la celda [${passwordPromptChest.x}, ${passwordPromptChest.y}].`,
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
    if (itData.isDamage || tags.includes('arma') || tags.includes('weapon') || tags.includes('armas')) return 'armas';
    if (itData.isProtect || tags.includes('armadura') || tags.includes('armor') || tags.includes('armaduras')) return 'armaduras';
    if (tags.includes('pocion') || tags.includes('pergamino') || tags.includes('consumible') || tags.includes('potion') || tags.includes('scroll') || tags.includes('consumibles')) return 'consumibles';
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
      text: `[INVENTARIO] **${char.name}** tomó **${item.name}** del cofre.`,
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
    if (!parsedInv.coins) parsedInv.coins = { pc: 0, pl: 0, el: 0, po: 0, pt: 0 };
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
      text: `[MONEDAS] **${char.name}** tomó las monedas del cofre: **${coinStrings.join(', ')}**.`,
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
      text: `[INVENTARIO] **${char.name}** recogió **${item.name}** del suelo en la celda [${selectedItemToken.x}, ${selectedItemToken.y}].`,
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
      noteData: { text: noteText }
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
      imageData: { url: imageUrlInput }
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
      const localX = (centerX - pan.x) / zoom;
      const localY = (centerY - pan.y) / zoom;
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

  return {
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
    
    handleBoardContextMenu,
    handleCreateChestSubmit,
    handleSpawnItem,
    handleVerifyPasswordSubmit,
    handleChestSlotClick,
    handleSelectItemForSlot,
    handleLootItemClick,
    handleLootAllCoins,
    handlePickupFloorItem,
    handleCreateNoteSubmit,
    handleCreateImageSubmit,
    handleImageFileChange,
    handleSpawnAoe
  };
};
