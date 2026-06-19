import type { Server, Socket } from 'socket.io';
import { db } from '../bd.js';
import { safeParseInventory, safeParseStats } from '../utils/parse.js';
import { getSocketRole } from '../utils/socketRol.js';
import { refreshAllCharacters } from '../utils/sync.js';

/** CRUD de personajes. */
export function registerCharacterHandlers(io: Server, socket: Socket) {
  socket.on('character:create', (charData: any) => {
    const { name, charClass, class: charClassAlt, description, stats, race, image, full_body_image, inventory, level, max_hp, current_hp, ac } = charData;
    const finalClass = charClass || charClassAlt;
    const owner = socket.data.userName || 'Anonimo';

    const statsStr = JSON.stringify(safeParseStats(stats));
    const invStr = JSON.stringify(safeParseInventory(inventory));

    db.prepare('INSERT INTO characters (name, class, description, stats, owner, race, image, full_body_image, inventory, level, max_hp, current_hp, ac) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(name, finalClass, description, statsStr, owner, race || 'Humano', image || null, full_body_image || null, invStr, level || 1, max_hp || 10, current_hp || 10, ac || 10);
    refreshAllCharacters(io);
  });

  socket.on('character:update', (data: any) => {
    const { id, name, charClass, class: charClassAlt, description, stats, race, image, full_body_image, inventory, level, max_hp, current_hp, ac } = data;
    const finalClass = charClass || charClassAlt;

    const statsStr = JSON.stringify(safeParseStats(stats));
    const invStr = JSON.stringify(safeParseInventory(inventory));

    db.prepare('UPDATE characters SET name = ?, class = ?, description = ?, stats = ?, race = ?, image = ?, full_body_image = ?, inventory = ?, level = ?, max_hp = ?, current_hp = ?, ac = ? WHERE id = ?')
      .run(name, finalClass, description, statsStr, race || 'Humano', image || null, full_body_image || null, invStr, level || 1, max_hp || 10, current_hp || 10, ac || 10, id);
    refreshAllCharacters(io);
  });

  socket.on('character:delete', (id: number) => {
    const currentRole = getSocketRole(socket);
    const character = db.prepare("SELECT owner FROM characters WHERE id = ?").get(id) as { owner: string } | undefined;
    if (character && (character.owner === socket.data.userName || currentRole === 'dm' || currentRole === 'admin')) {
      db.prepare('DELETE FROM characters WHERE id = ?').run(id);
      refreshAllCharacters(io);
    }
  });
}
