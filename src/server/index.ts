import { createServer } from 'http';
import { Server } from 'socket.io';
import { db, initDB, updateCompendiumItem } from './db.js';
import { runFullImport } from './seeder.js';

// Estado volátil del tablero: se sincroniza en tiempo real entre todos los clientes[cite: 1]
let boardTokens: any[] = [];
let currentGridBg: string = '';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" } // Clave para permitir conexiones remotas vía ngrok[cite: 1]
});

export const startServer = async () => {
  // 1. Inicialización de persistencia y datos del SRD[cite: 1]
  initDB();
  await runFullImport();

  // 2. Gestión de Sockets
  io.on('connection', (socket) => {
    console.log('⚡ Conexión establecida:', socket.id);

    // AUTENTICACIÓN
    socket.on('auth:get_profiles', () => {
      const profiles = db.prepare("SELECT id, username, role, profile_image FROM users").all();
      socket.emit('auth:profiles_list', profiles);
    });

    socket.on('auth:login', ({ username, password }) => {
      const user: any = db.prepare("SELECT id, username, role, profile_image FROM users WHERE username = ? AND password = ?").get(username, password);
      if (user) {
        socket.data.userId = user.id;
        socket.data.userName = user.username;
        socket.data.role = user.role;
        socket.emit('auth:success', user);
        console.log(`👤 ${user.username} entró como ${user.role}`);

        if (user.role !== 'admin') {
          // Enviar datos necesarios para arrancar la interfaz
          sendCharactersToSocket(socket);
          const monsters = db.prepare("SELECT * FROM content_items WHERE type = 'monster'").all();
          socket.emit('monsters:list', monsters);
          socket.emit('token:board-list', boardTokens);
          if (currentGridBg) socket.emit('grid:bg-update', currentGridBg);
        }
      } else {
        socket.emit('auth:error', 'Usuario o contraseña incorrectos.');
      }
    });

    socket.on('auth:register', ({ username, password, role, profile_image }) => {
      try {
        db.prepare("INSERT INTO users (username, password, role, profile_image) VALUES (?, ?, ?, ?)").run(username, password, role, profile_image || null);
        socket.emit('auth:register_success', 'Usuario creado exitosamente. Por favor, inicia sesión.');
      } catch (e: any) {
        if (e.message.includes('UNIQUE constraint failed')) {
          socket.emit('auth:error', 'Ese nombre de usuario ya existe.');
        } else {
          socket.emit('auth:error', 'Error al crear la cuenta.');
        }
      }
    });

    socket.on('auth:update_profile', ({ profile_image }) => {
      if (socket.data.userId) {
        try {
          db.prepare("UPDATE users SET profile_image = ? WHERE id = ?").run(profile_image, socket.data.userId);
          const user: any = db.prepare("SELECT id, username, role, profile_image FROM users WHERE id = ?").get(socket.data.userId);
          socket.emit('auth:success', user); // Actualizamos el estado local del cliente
        } catch (e) {
          socket.emit('auth:error', 'Error al actualizar perfil.');
        }
      }
    });

    // ADMINISTRACIÓN
    socket.on('admin:get_users', () => {
      if (socket.data.role === 'admin') {
        const users = db.prepare("SELECT id, username, password, role FROM users").all();
        socket.emit('admin:users_list', users);
      }
    });

    socket.on('admin:update_user', ({ id, username, password, role }) => {
      if (socket.data.role === 'admin') {
        try {
          db.prepare("UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?").run(username, password, role, id);
          const users = db.prepare("SELECT id, username, password, role FROM users").all();
          socket.emit('admin:users_list', users);
        } catch (e) {
          socket.emit('admin:error', 'Error al actualizar usuario.');
        }
      }
    });

    socket.on('admin:delete_user', (id) => {
      if (socket.data.role === 'admin') {
        const target: any = db.prepare("SELECT username FROM users WHERE id = ?").get(id);
        if (target && target.username === 'admin') {
          socket.emit('admin:error', 'No puedes borrar a la cuenta admin principal.');
          return;
        }
        db.prepare("DELETE FROM users WHERE id = ?").run(id);
        const users = db.prepare("SELECT id, username, password, role FROM users").all();
        socket.emit('admin:users_list', users);
      }
    });

    // COMPENDIO GENERAL
    socket.on('content:request', () => {
      const allContent = db.prepare("SELECT * FROM content_items").all();
      socket.emit('content:list', allContent);
    });

    socket.on('content:create', (payload) => {
      if (socket.data.role === 'admin') {
        const { name, type, data } = payload;
        db.prepare("INSERT INTO content_items (name, type, data, source) VALUES (?, ?, ?, 'homebrew')")
          .run(name, type, JSON.stringify(data));

        const allContent = db.prepare("SELECT * FROM content_items").all();
        io.emit('content:list', allContent); 
      }
    });

    socket.on('content:update', (payload) => {
      if (socket.data.role === 'admin') {
        const { id, name, type, data } = payload;
        updateCompendiumItem(id, name, type, data);

        const allContent = db.prepare("SELECT * FROM content_items").all();
        io.emit('content:list', allContent);
      }
    });

    socket.on('content:delete', (id) => {
      if (socket.data.role === 'admin') {
        db.prepare("DELETE FROM content_items WHERE id = ?").run(id);
        const allContent = db.prepare("SELECT * FROM content_items").all();
        io.emit('content:list', allContent);
      }
    });

    // MOTOR DE TOKENS (GRID)[cite: 1]
    socket.on('token:spawn', (data) => {
      if (socket.data.role === 'dm') {
        const newToken = {
          instanceId: `${data.type}-${data.id}-${Date.now()}`,
          originalId: data.id,
          name: data.name,
          type: data.type,
          hp: data.current_hp || data.hp || 10,
          max_hp: data.max_hp || data.hp || 10,
          ac: data.ac,
          image: data.image || null,
          owner: data.owner || null, // Guardamos el dueño para los personajes
          x: 0,
          y: 0
        };
        boardTokens.push(newToken);
        io.emit('token:board-list', boardTokens);
      }
    });

    socket.on('token:move', (moveData) => {
      const token = boardTokens.find(t => t.instanceId === moveData.tokenId);
      if (token) {
        token.x = moveData.x;
        token.y = moveData.y;
        io.emit('token:board-list', boardTokens); // Sync de posición global[cite: 1]
      }
    });

    socket.on('token:update-hp', (data: { tokenId: string; amount: number }) => {
      if (socket.data.role === 'dm') {
        const token = boardTokens.find(t => t.instanceId === data.tokenId);
        if (token) {
          token.hp = Math.max(0, Math.min(token.hp + data.amount, token.max_hp));
          io.emit('token:board-list', boardTokens);
        }
      }
    });

    socket.on('token:update-team', (data: { tokenId: string; color: string | null }) => {
      if (socket.data.role === 'dm') {
        const token = boardTokens.find(t => t.instanceId === data.tokenId);
        if (token) {
          token.teamColor = data.color;
          io.emit('token:board-list', boardTokens);
        }
      }
    });

    socket.on('token:remove', (instanceId) => {
      if (socket.data.role === 'dm') {
        boardTokens = boardTokens.filter(t => t.instanceId !== instanceId);
        io.emit('token:board-list', boardTokens);
      }
    });

    socket.on('grid:set-bg', (imageUrl: string) => {
      if (socket.data.role === 'dm') {
        currentGridBg = imageUrl;
        io.emit('grid:bg-update', imageUrl); // Cambia el mapa para todos los jugadores
      }
    });

    socket.on('combat:request-save', (data: { targetName: string; stat: string; statKey: string; dc: number }) => {
      if (socket.data.role === 'dm') {
        io.emit('combat:save-notification', data);
      }
    });

    // GESTIÓN DE PERSONAJES (CRUD)
    socket.on('character:create', (charData) => {
      const { name, charClass, description, stats, race, image, inventory, level, max_hp, current_hp } = charData;
      const owner = socket.data.userName || 'Anónimo';
      db.prepare('INSERT INTO characters (name, class, description, stats, owner, race, image, inventory, level, max_hp, current_hp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(name, charClass, description, JSON.stringify(stats), owner, race || 'Humano', image || null, JSON.stringify(inventory || { armas: [], armaduras: [], consumibles: [], artefactos: [] }), level || 1, max_hp || 10, current_hp || 10);
      refreshAllCharacters();
    });

    socket.on('character:update', (data: any) => {
      // Permitimos que DM o el dueño edite (simplificado asumiendo confianza en los players o verificando owner)
      const { id, name, charClass, description, stats, race, image, inventory, level, max_hp, current_hp } = data;
      db.prepare('UPDATE characters SET name = ?, class = ?, description = ?, stats = ?, race = ?, image = ?, inventory = ?, level = ?, max_hp = ?, current_hp = ? WHERE id = ?')
        .run(name, charClass, description, JSON.stringify(stats), race || 'Humano', image || null, JSON.stringify(inventory || { armas: [], armaduras: [], consumibles: [], artefactos: [] }), level || 1, max_hp || 10, current_hp || 10, id);
      refreshAllCharacters();
    });

    socket.on('character:delete', (id: number) => {
      if (socket.data.role === 'dm') {
        db.prepare('DELETE FROM characters WHERE id = ?').run(id);
        refreshAllCharacters();
      }
    });

    // ACCIONES DE JUEGO[cite: 1]
    socket.on('dice:roll', (data: { die: number }) => {
      const roll = Math.floor(Math.random() * data.die) + 1;
      io.emit('dice:result', {
        user: socket.data.userName,
        die: `d${data.die}`,
        value: roll,
        timestamp: Date.now()
      });
    });

    // CHAT DEL GRUPO
    socket.on('chat:send', (msg) => {
      io.emit('chat:message', msg);
    });

    socket.on('disconnect', () => console.log('❌ Jugador desconectado'));
  });

  // HELPERS DE SINCRONIZACIÓN[cite: 1]
  function sendCharactersToSocket(s: any) {
    const list = s.data.role === 'dm'
      ? db.prepare('SELECT * FROM characters').all()
      : db.prepare('SELECT * FROM characters WHERE owner = ?').all(s.data.userName);
    s.emit('character:list', list);
  }

  async function refreshAllCharacters() {
    const allSockets = await io.fetchSockets();
    allSockets.forEach(s => sendCharactersToSocket(s));
  }

  httpServer.listen(3000, () => console.log('🚀 Server en http://localhost:3000'));
};