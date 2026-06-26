import type { Server, Socket } from 'socket.io';
import { db } from '../bd.js';
import { getRoomBoardState } from '../estado.js';
import { refreshAllCampaigns, sendCharactersToSocket } from '../utils/sync.js';

/** Salas por campana: une/saca sockets y sincroniza el estado de tablero de esa campana. */
export function registerRoomHandlers(io: Server, socket: Socket) {
  socket.on('room:join', ({ campaignId, characterId }) => {
    const id = Number(campaignId);
    if (isNaN(id)) return;

    const oldRoomId = socket.data.campaignId;
    if (oldRoomId) {
      socket.leave(`campaign-${oldRoomId}`);
      console.log(`Socket ${socket.id} (${socket.data.userName}) salio de la sala campana-${oldRoomId}`);
    }

    socket.join(`campaign-${id}`);
    socket.data.campaignId = id;
    console.log(`Socket ${socket.id} (${socket.data.userName}) se unio a la sala campana-${id}`);

    if (characterId) {
      const charIdNum = Number(characterId);
      const campaign = db.prepare("SELECT active_heroes FROM campaigns WHERE id = ?").get(id) as { active_heroes: string } | undefined;
      if (campaign) {
        let heroes: number[] = [];
        try { heroes = JSON.parse(campaign.active_heroes || '[]'); } catch {}
        if (!heroes.includes(charIdNum)) {
          heroes.push(charIdNum);
          db.prepare("UPDATE campaigns SET active_heroes = ? WHERE id = ?").run(JSON.stringify(heroes), id);
          console.log(`Personaje ${charIdNum} registrado en campana ${id} para ${socket.data.userName}`);
          refreshAllCampaigns(io);
        }
      }
    }

    const boardState = getRoomBoardState(id);
    socket.emit('token:board-list', boardState.boardTokens);
    socket.emit('grid:bg-update', boardState.currentGridBg);
    socket.emit('grid:solid-update', boardState.solidCells);
    socket.emit('grid:night-update', boardState.isNightMode);
    socket.emit('combat:state-update', boardState.combatState);

    sendCharactersToSocket(socket);
  });

  socket.on('room:leave', () => {
    const roomId = socket.data.campaignId;
    if (roomId) {
      socket.leave(`campaign-${roomId}`);
      socket.data.campaignId = null;
      console.log(`Socket ${socket.id} (${socket.data.userName}) salio de la sala campana-${roomId}`);
      sendCharactersToSocket(socket);
    }
  });
}
