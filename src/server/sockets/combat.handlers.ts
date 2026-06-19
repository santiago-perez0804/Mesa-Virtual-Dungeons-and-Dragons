import type { Server, Socket } from 'socket.io';
import { getRoomBoardState } from '../estado.js';
import { getSocketRole } from '../utils/socketRol.js';

/** Combate e iniciativa por sala. */
export function registerCombatHandlers(io: Server, socket: Socket) {
  socket.on('combat:roll-initiative', (data: { tokenId: string; value: number }) => {
    const roomId = socket.data.campaignId;
    if (!roomId) return;
    const boardState = getRoomBoardState(roomId);

    boardState.combatState.initiativeOrder = boardState.combatState.initiativeOrder.filter(i => i.tokenId !== data.tokenId);
    boardState.combatState.initiativeOrder.push(data);
    boardState.combatState.initiativeOrder.sort((a, b) => b.value - a.value);
    io.to(`campaign-${roomId}`).emit('combat:state-update', boardState.combatState);

    const token = boardState.boardTokens.find(t => t.instanceId === data.tokenId);
    if (token) {
      io.to(`campaign-${roomId}`).emit('chat:message', {
        id: Date.now() + Math.random(),
        sender: 'Sistema',
        to: 'all',
        text: `\u{1F3B2} **${token.name}** tir\u00f3 Iniciativa y sac\u00f3 **${data.value}**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      });
    }
  });

  socket.on('combat:reorder-initiative', (newOrder: { tokenId: string; value: number }[]) => {
    const roomId = socket.data.campaignId;
    if (!roomId) return;
    const currentRole = getSocketRole(socket);
    if (currentRole === 'dm' || currentRole === 'admin') {
      const boardState = getRoomBoardState(roomId);
      boardState.combatState.initiativeOrder = newOrder;
      io.to(`campaign-${roomId}`).emit('combat:state-update', boardState.combatState);
    }
  });

  socket.on('combat:toggle-turn-mode', (isActive: boolean) => {
    const roomId = socket.data.campaignId;
    if (!roomId) return;
    const currentRole = getSocketRole(socket);
    if (currentRole === 'dm' || currentRole === 'admin') {
      const boardState = getRoomBoardState(roomId);
      boardState.combatState.turnModeActive = isActive;
      if (!isActive) {
        boardState.combatState.currentTurnIndex = 0;
      }
      io.to(`campaign-${roomId}`).emit('combat:state-update', boardState.combatState);

      io.to(`campaign-${roomId}`).emit('chat:message', {
        id: Date.now() + Math.random(),
        sender: 'Sistema',
        to: 'all',
        text: isActive
          ? `\u2694\uFE0F **\u00a1EL COMBATE HA COMENZADO!** (Modo Turnos activado)`
          : `\u{1F54A}\uFE0F **El combate ha terminado.** (Modo Turnos desactivado)`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      });
    }
  });

  socket.on('combat:next-turn', () => {
    const roomId = socket.data.campaignId;
    if (!roomId) return;
    const boardState = getRoomBoardState(roomId);
    if (boardState.combatState.turnModeActive && boardState.combatState.initiativeOrder.length > 0) {
      boardState.combatState.currentTurnIndex = (boardState.combatState.currentTurnIndex + 1) % boardState.combatState.initiativeOrder.length;
      io.to(`campaign-${roomId}`).emit('combat:state-update', boardState.combatState);
    }
  });

  socket.on('combat:reset', () => {
    const roomId = socket.data.campaignId;
    if (!roomId) return;
    const currentRole = getSocketRole(socket);
    if (currentRole === 'dm' || currentRole === 'admin') {
      const boardState = getRoomBoardState(roomId);
      boardState.combatState = { turnModeActive: false, initiativeOrder: [], currentTurnIndex: 0 };
      io.to(`campaign-${roomId}`).emit('combat:state-update', boardState.combatState);
    }
  });

  socket.on('combat:request-save', (data: { targetName: string; stat: string; statKey: string; dc: number }) => {
    const roomId = socket.data.campaignId;
    if (!roomId) return;
    const currentRole = getSocketRole(socket);
    if (currentRole === 'dm' || currentRole === 'admin') {
      io.to(`campaign-${roomId}`).emit('combat:save-notification', data);
    }
  });
}
