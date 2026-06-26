import type { Server } from 'socket.io';
import { db } from '../bd.js';
import { getSocketRole } from './socketRol.js';

/** Envia a un socket la lista de personajes segun su rol dinamico. */
export function sendCharactersToSocket(s: any) {
  const currentRole = getSocketRole(s);
  const list = (currentRole === 'dm' || currentRole === 'admin')
    ? db.prepare('SELECT * FROM characters').all()
    : db.prepare('SELECT * FROM characters WHERE owner = ?').all(s.data.userName);
  s.emit('character:list', list);
}

/** Envia a un socket solo las campanas visibles para el: owner o con un heroe activo. */
export function sendCampaignsToSocket(s: any) {
  if (!s.data.userName) return;
  const userName = s.data.userName;
  const allCampaigns = db.prepare("SELECT * FROM campaigns").all() as any[];
  const userCharacters = db.prepare("SELECT id FROM characters WHERE owner = ?").all(userName) as { id: number }[];
  const userCharacterIds = new Set(userCharacters.map(c => c.id));

  const visible = allCampaigns.filter(c => {
    if (c.owner === userName) return true;
    try {
      const heroes: number[] = JSON.parse(c.active_heroes || '[]');
      return heroes.some(hId => userCharacterIds.has(hId));
    } catch { return false; }
  });
  s.emit('campaign:list', visible);
}

export function refreshAllCampaigns(io: Server) {
  Array.from(io.sockets.sockets.values()).forEach(s => sendCampaignsToSocket(s));
}

export function refreshAllCharacters(io: Server) {
  Array.from(io.sockets.sockets.values()).forEach(s => sendCharactersToSocket(s));
}
