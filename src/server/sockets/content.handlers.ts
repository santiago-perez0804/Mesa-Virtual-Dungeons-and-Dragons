import type { Server, Socket } from 'socket.io';
import { db, updateCompendiumItem } from '../bd.js';
import { generateItemImage } from '../ia-imagen.js';
import { getSocketRole } from '../utils/socketRol.js';
import { syncClassTraitsToFeaturesTable } from '../utils/classTraits.js';

/** Compendio general: CRUD y generacion de imagenes IA para monstruos/items. */
export function registerContentHandlers(io: Server, socket: Socket) {
  socket.on('content:request', () => {
    const allContent = db.prepare("SELECT * FROM content_items").all();
    socket.emit('content:list', allContent);
  });

  socket.on('content:create', async (payload) => {
    const currentRole = getSocketRole(socket);
    if (currentRole === 'admin' || currentRole === 'dm') {
      const { name, type, data, source } = payload;
      const result = db.prepare("INSERT INTO content_items (name, type, data, source) VALUES (?, ?, ?, ?)")
        .run(name, type, JSON.stringify(data), source || 'homebrew');

      if (type === 'class') {
        syncClassTraitsToFeaturesTable(name, data);
      }

      const allContent = db.prepare("SELECT * FROM content_items").all();
      io.emit('content:list', allContent);

      if ((type === 'monster' || type === 'item') && !data.image) {
        const newId = result.lastInsertRowid as number;
        io.emit('content:generating_image', { id: newId, name });
        console.log(`Generando imagen IA para: ${name} (${type})...`);

        generateItemImage(type, name, data.description || data.desc || '')
          .then((imageUrl) => {
            if (imageUrl) {
              const updatedData = { ...data, image: imageUrl };
              updateCompendiumItem(newId, name, type, updatedData);
              const refreshed = db.prepare("SELECT * FROM content_items").all();
              io.emit('content:list', refreshed);
              io.emit('content:image_ready', { id: newId, name });
              console.log(`Imagen generada para: ${name}`);
            } else {
              io.emit('content:image_failed', { id: newId, name });
            }
          })
          .catch((e) => {
            console.error(`Error generando imagen para ${name}:`, e.message);
            io.emit('content:image_failed', { id: newId, name });
          });
      }
    }
  });

  socket.on('content:update', (payload) => {
    const currentRole = getSocketRole(socket);
    if (currentRole === 'admin' || currentRole === 'dm') {
      const { id, name, type, data } = payload;
      updateCompendiumItem(id, name, type, data);

      if (type === 'class') {
        syncClassTraitsToFeaturesTable(name, data);
      }

      const allContent = db.prepare("SELECT * FROM content_items").all();
      io.emit('content:list', allContent);
    }
  });

  socket.on('content:delete', (id) => {
    const currentRole = getSocketRole(socket);
    if (currentRole === 'admin' || currentRole === 'dm') {
      db.prepare("DELETE FROM content_items WHERE id = ?").run(id);
      const allContent = db.prepare("SELECT * FROM content_items").all();
      io.emit('content:list', allContent);
    }
  });
}
