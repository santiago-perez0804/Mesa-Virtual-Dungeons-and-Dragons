import type { Server, Socket } from 'socket.io';
import { registerAdminHandlers } from './admin.handlers.js';
import { registerAuthHandlers } from './auth.handlers.js';
import { registerBoardHandlers } from './board.handlers.js';
import { registerCampaignHandlers } from './campaign.handlers.js';
import { registerCharacterHandlers } from './character.handlers.js';
import { registerCombatHandlers } from './combat.handlers.js';
import { registerContentHandlers } from './content.handlers.js';
import { registerGameHandlers } from './game.handlers.js';
import { registerRoomHandlers } from './room.handlers.js';

/** Registra todos los eventos Socket.IO de una conexion. */
export function registerSocketHandlers(io: Server, socket: Socket) {
  registerAuthHandlers(io, socket);
  registerRoomHandlers(io, socket);
  registerAdminHandlers(socket);
  registerContentHandlers(io, socket);
  registerBoardHandlers(io, socket);
  registerCombatHandlers(io, socket);
  registerCharacterHandlers(io, socket);
  registerGameHandlers(io, socket);
  registerCampaignHandlers(io, socket);
}
