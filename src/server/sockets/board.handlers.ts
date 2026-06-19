import type { Server, Socket } from 'socket.io';
import { getRoomBoardState } from '../estado.js';
import { getSocketRole } from '../utils/socketRol.js';

/** Tablero por sala: tokens, mapa, celdas solidas, noche y limpieza. */
export function registerBoardHandlers(io: Server, socket: Socket) {
  socket.on('token:spawn', (data) => {
    const roomId = socket.data.campaignId;
    if (!roomId) return;
    const currentRole = getSocketRole(socket);
    if (currentRole === 'dm' || currentRole === 'admin') {
      const boardState = getRoomBoardState(roomId);
      const newToken = {
        instanceId: `${data.type}-${data.id}-${Date.now()}`,
        originalId: data.id,
        name: data.name,
        type: data.type,
        hp: data.current_hp || data.hp || 10,
        max_hp: data.max_hp || data.hp || 10,
        ac: data.ac,
        image: data.image || null,
        owner: data.owner || null,
        x: data.x !== undefined ? data.x : 0,
        y: data.y !== undefined ? data.y : 0,
        chestData: data.chestData || null,
        itemData: data.itemData || null,
        noteData: data.noteData || null,
        imageData: data.imageData || null,
        aoeData: data.aoeData || null,
        rotation: data.rotation || 0,
        teamColor: data.teamColor || null,
      };
      boardState.boardTokens.push(newToken);
      io.to(`campaign-${roomId}`).emit('token:board-list', boardState.boardTokens);
    }
  });

  socket.on('token:update-chest', (data: { tokenId: string; chestData: any; name?: string }) => {
    const roomId = socket.data.campaignId;
    if (!roomId) return;
    const boardState = getRoomBoardState(roomId);
    const token = boardState.boardTokens.find(t => t.instanceId === data.tokenId);
    if (token && token.type === 'chest') {
      token.chestData = { ...token.chestData, ...data.chestData };
      if (data.name) {
        token.name = data.name;
      }
      io.to(`campaign-${roomId}`).emit('token:board-list', boardState.boardTokens);
    }
  });

  socket.on('token:update-aoe', (data: { tokenId: string; aoeData: any }) => {
    const roomId = socket.data.campaignId;
    if (!roomId) return;
    const boardState = getRoomBoardState(roomId);
    const token = boardState.boardTokens.find(t => t.instanceId === data.tokenId);
    if (token && token.type === 'aoe') {
      token.aoeData = { ...token.aoeData, ...data.aoeData };
      io.to(`campaign-${roomId}`).emit('token:board-list', boardState.boardTokens);
    }
  });

  socket.on('token:move', (moveData) => {
    const roomId = socket.data.campaignId;
    if (!roomId) return;
    const boardState = getRoomBoardState(roomId);
    const token = boardState.boardTokens.find(t => t.instanceId === moveData.tokenId);
    if (token) {
      token.x = moveData.x;
      token.y = moveData.y;
      io.to(`campaign-${roomId}`).emit('token:board-list', boardState.boardTokens);
    }
  });

  socket.on('token:update-hp', (data: { tokenId: string; amount: number }) => {
    const roomId = socket.data.campaignId;
    if (!roomId) return;
    const currentRole = getSocketRole(socket);
    if (currentRole === 'dm' || currentRole === 'admin') {
      const boardState = getRoomBoardState(roomId);
      const token = boardState.boardTokens.find(t => t.instanceId === data.tokenId);
      if (token) {
        token.hp = Math.max(0, Math.min(token.hp + data.amount, token.max_hp));
        io.to(`campaign-${roomId}`).emit('token:board-list', boardState.boardTokens);
      }
    }
  });

  socket.on('token:update-combat-state', (data: { tokenId: string; hp?: number; max_hp?: number; tempHp?: number; condition?: string | null }) => {
    const roomId = socket.data.campaignId;
    if (!roomId) return;
    const currentRole = getSocketRole(socket);
    if (currentRole === 'dm' || currentRole === 'admin') {
      const boardState = getRoomBoardState(roomId);
      const token = boardState.boardTokens.find(t => t.instanceId === data.tokenId);
      if (token) {
        if (data.hp !== undefined) token.hp = data.hp;
        if (data.max_hp !== undefined) token.max_hp = data.max_hp;
        if (data.tempHp !== undefined) token.tempHp = data.tempHp;
        if (data.condition !== undefined) token.condition = data.condition;
        io.to(`campaign-${roomId}`).emit('token:board-list', boardState.boardTokens);
      }
    }
  });

  socket.on('token:update-team', (data: { tokenId: string; color: string | null }) => {
    const roomId = socket.data.campaignId;
    if (!roomId) return;
    const currentRole = getSocketRole(socket);
    if (currentRole === 'dm' || currentRole === 'admin') {
      const boardState = getRoomBoardState(roomId);
      const token = boardState.boardTokens.find(t => t.instanceId === data.tokenId);
      if (token) {
        token.teamColor = data.color;
        io.to(`campaign-${roomId}`).emit('token:board-list', boardState.boardTokens);
      }
    }
  });

  socket.on('token:remove', (instanceId) => {
    const roomId = socket.data.campaignId;
    if (!roomId) return;
    const currentRole = getSocketRole(socket);
    if (currentRole === 'dm' || currentRole === 'admin') {
      const boardState = getRoomBoardState(roomId);
      boardState.boardTokens = boardState.boardTokens.filter(t => t.instanceId !== instanceId);
      io.to(`campaign-${roomId}`).emit('token:board-list', boardState.boardTokens);
    }
  });

  socket.on('grid:set-bg', (imageUrl: string) => {
    const roomId = socket.data.campaignId;
    if (!roomId) return;
    const currentRole = getSocketRole(socket);
    if (currentRole === 'dm' || currentRole === 'admin') {
      const boardState = getRoomBoardState(roomId);
      boardState.currentGridBg = imageUrl;
      io.to(`campaign-${roomId}`).emit('grid:bg-update', imageUrl);
    }
  });

  socket.on('grid:update-solid', (cells: string[]) => {
    const roomId = socket.data.campaignId;
    if (!roomId) return;
    const currentRole = getSocketRole(socket);
    if (currentRole === 'dm' || currentRole === 'admin') {
      const boardState = getRoomBoardState(roomId);
      boardState.solidCells = cells;
      io.to(`campaign-${roomId}`).emit('grid:solid-update', boardState.solidCells);
    }
  });

  socket.on('grid:set-night', (isNight: boolean) => {
    const roomId = socket.data.campaignId;
    if (!roomId) return;
    const currentRole = getSocketRole(socket);
    if (currentRole === 'dm' || currentRole === 'admin') {
      const boardState = getRoomBoardState(roomId);
      boardState.isNightMode = isNight;
      io.to(`campaign-${roomId}`).emit('grid:night-update', boardState.isNightMode);
    }
  });

  socket.on('board:clear', () => {
    const roomId = socket.data.campaignId;
    if (!roomId) return;
    const currentRole = getSocketRole(socket);
    if (currentRole === 'dm' || currentRole === 'admin') {
      const boardState = getRoomBoardState(roomId);
      boardState.boardTokens = [];
      boardState.currentGridBg = '';
      boardState.solidCells = [];
      boardState.isNightMode = false;
      boardState.combatState = { turnModeActive: false, initiativeOrder: [], currentTurnIndex: 0 };

      io.to(`campaign-${roomId}`).emit('token:board-list', boardState.boardTokens);
      io.to(`campaign-${roomId}`).emit('grid:bg-update', '');
      io.to(`campaign-${roomId}`).emit('grid:solid-update', []);
      io.to(`campaign-${roomId}`).emit('grid:night-update', false);
      io.to(`campaign-${roomId}`).emit('combat:state-update', boardState.combatState);
    }
  });
}
