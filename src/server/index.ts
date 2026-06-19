import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { db, initDB, updateCompendiumItem } from './bd.js';
import { runFullImport } from './sembrador.js';
import { initAI, startAISession, sendChatMessageToAI, sendDiceRollToAI, endAISession, isAISessionActive } from './ia-dm.js';
import { initImageAI, generateItemImage } from './ia-imagen.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getRoomBoardState } from './estado.js';
import { safeParseInventory, safeParseStats } from './utils/parse.js';
import { syncClassTraitsToFeaturesTable } from './utils/classTraits.js';
import { registerClassFeaturesRoutes } from './routes/classFeatures.routes.js';
import { registerUploadRoutes } from './routes/upload.routes.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dnd-vtt-secret-key-fallback-2026';

function getSocketRole(socket: any): string {
  if (socket.data.role === 'admin') return 'admin';
  try {
    const campaignId = socket.data.campaignId;
    if (campaignId) {
      const campaign = db.prepare("SELECT owner FROM campaigns WHERE id = ?").get(campaignId) as { owner: string | null } | undefined;
      if (campaign && campaign.owner === socket.data.userName) {
        return 'dm';
      }
    } else {
      const activeCampaign = db.prepare("SELECT owner FROM campaigns WHERE is_active = 1").get() as { owner: string | null } | undefined;
      if (activeCampaign && activeCampaign.owner === socket.data.userName) {
        return 'dm';
      }
    }
  } catch (e) {
    console.error("Error al obtener rol dinámico de socket:", e);
  }
  return 'player';
}

const app = express();
app.use(express.json());

// Middleware de CORS para que el frontend (Vite en puerto 5173) pueda consumir la API
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" } // Clave para permitir conexiones remotas vía ngrok
});

// Rutas REST
registerClassFeaturesRoutes(app, io);
registerUploadRoutes(app);

export const startServer = async () => {
  // 1. Inicialización de persistencia y datos del SRD
  initDB();
  await runFullImport();
  initAI();
  initImageAI();

  let activeAiCampaignId: number | null = null;

  // 2. Gestión de Sockets
  io.on('connection', (socket) => {
    console.log('⚡ Conexión establecida:', socket.id);

    // AUTENTICACIÓN
    socket.on('auth:login', ({ username, password }) => {
      try {
        const user: any = db.prepare("SELECT id, username, password, role, profile_image FROM users WHERE username = ?").get(username);
        if (user && bcrypt.compareSync(password, user.password)) {
          socket.data.userId = user.id;
          socket.data.userName = user.username;
          socket.data.role = user.role;

          const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          const safeUser = { id: user.id, username: user.username, role: user.role, profile_image: user.profile_image };
          socket.emit('auth:success', { user: safeUser, token });
          console.log(`👤 ${user.username} entró como ${user.role} (JWT generado)`);

          // Enviar datos necesarios para arrancar la interfaz
          sendCharactersToSocket(socket);
          const monsters = db.prepare("SELECT * FROM content_items WHERE type = 'monster'").all();
          socket.emit('monsters:list', monsters);
        } else {
          socket.emit('auth:error', 'Usuario o contraseña incorrectos.');
        }
      } catch (e) {
        console.error(e);
        socket.emit('auth:error', 'Error interno en el servidor.');
      }
    });

    socket.on('auth:register', ({ username, password, role, profile_image }) => {
      try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const result = db.prepare("INSERT INTO users (username, password, role, profile_image) VALUES (?, ?, ?, ?)")
          .run(username, hashedPassword, role || 'player', profile_image || null);

        const newUserId = result.lastInsertRowid;
        const token = jwt.sign(
          { userId: newUserId, username, role: role || 'player' },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        const safeUser = { id: newUserId, username, role: role || 'player', profile_image: profile_image || null };

        socket.data.userId = newUserId;
        socket.data.userName = username;
        socket.data.role = role || 'player';

        socket.emit('auth:register_success', 'Usuario creado exitosamente.');
        socket.emit('auth:success', { user: safeUser, token });
        console.log(`👤 Nuevo aventurero registrado: ${username} como ${role || 'player'}`);

        // Enviar datos necesarios para arrancar la interfaz
        sendCharactersToSocket(socket);
        const monsters = db.prepare("SELECT * FROM content_items WHERE type = 'monster'").all();
        socket.emit('monsters:list', monsters);
      } catch (e: any) {
        if (e.message.includes('UNIQUE constraint failed')) {
          socket.emit('auth:error', 'Ese nombre de usuario ya existe.');
        } else {
          socket.emit('auth:error', 'Error al crear la cuenta.');
        }
      }
    });

    socket.on('auth:token_login', ({ token }) => {
      try {
        if (!token) {
          socket.emit('auth:token_invalid');
          return;
        }
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        const user: any = db.prepare("SELECT id, username, role, profile_image FROM users WHERE id = ?").get(decoded.userId);

        if (user) {
          socket.data.userId = user.id;
          socket.data.userName = user.username;
          socket.data.role = user.role;

          socket.emit('auth:success', { user, token });
          console.log(`👤 Re-autenticación automática exitosa para: ${user.username}`);

          // Enviar datos necesarios para arrancar la interfaz
          sendCharactersToSocket(socket);
          const monsters = db.prepare("SELECT * FROM content_items WHERE type = 'monster'").all();
          socket.emit('monsters:list', monsters);
        } else {
          socket.emit('auth:token_invalid');
        }
      } catch (e) {
        socket.emit('auth:token_invalid');
      }
    });

    socket.on('auth:update_profile', ({ profile_image }) => {
      if (socket.data.userId) {
        try {
          db.prepare("UPDATE users SET profile_image = ? WHERE id = ?").run(profile_image, socket.data.userId);
          const user: any = db.prepare("SELECT id, username, role, profile_image FROM users WHERE id = ?").get(socket.data.userId);
          socket.emit('auth:success', { user }); // Actualizamos el estado local del cliente
        } catch (e) {
          socket.emit('auth:error', 'Error al actualizar perfil.');
        }
      }
    });

    // GESTIÓN DE SALAS (ROOMS)
    socket.on('room:join', ({ campaignId, characterId }) => {
      const id = Number(campaignId);
      if (isNaN(id)) return;

      const oldRoomId = socket.data.campaignId;
      if (oldRoomId) {
        socket.leave(`campaign-${oldRoomId}`);
        console.log(`🚪 Socket ${socket.id} (${socket.data.userName}) salió de la sala campaña-${oldRoomId}`);
      }

      socket.join(`campaign-${id}`);
      socket.data.campaignId = id;
      console.log(`🔑 Socket ${socket.id} (${socket.data.userName}) se unió a la sala campaña-${id}`);

      // Si se pasa un characterId, registrarlo en active_heroes de la campaña
      if (characterId) {
        const charIdNum = Number(characterId);
        const campaign = db.prepare("SELECT active_heroes FROM campaigns WHERE id = ?").get(id) as { active_heroes: string } | undefined;
        if (campaign) {
          let heroes: number[] = [];
          try { heroes = JSON.parse(campaign.active_heroes || '[]'); } catch {}
          if (!heroes.includes(charIdNum)) {
            heroes.push(charIdNum);
            db.prepare("UPDATE campaigns SET active_heroes = ? WHERE id = ?").run(JSON.stringify(heroes), id);
            console.log(`✅ Personaje ${charIdNum} registrado en campaña ${id} para ${socket.data.userName}`);
            // Actualizar la lista de campañas visible para todos (el jugador ahora verá esta campaña)
            refreshAllCampaigns();
          }
        }
      }

      // Enviar el estado del tablero específico de esa sala
      const boardState = getRoomBoardState(id);
      socket.emit('token:board-list', boardState.boardTokens);
      socket.emit('grid:bg-update', boardState.currentGridBg);
      socket.emit('grid:solid-update', boardState.solidCells);
      socket.emit('grid:night-update', boardState.isNightMode);
      socket.emit('combat:state-update', boardState.combatState);

      // Sincronizar personajes según su rol dinámico en la nueva campaña activa
      sendCharactersToSocket(socket);
    });

    socket.on('room:leave', () => {
      const roomId = socket.data.campaignId;
      if (roomId) {
        socket.leave(`campaign-${roomId}`);
        socket.data.campaignId = null;
        console.log(`🚪 Socket ${socket.id} (${socket.data.userName}) salió de la sala campaña-${roomId}`);
        sendCharactersToSocket(socket);
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
          let finalPassword = password;
          if (password && !password.startsWith('$2a$') && !password.startsWith('$2b$') && !password.startsWith('$2y$')) {
            finalPassword = bcrypt.hashSync(password, 10);
          }
          db.prepare("UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?").run(username, finalPassword, role, id);
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

        // Generar imagen con IA en background para monstruos e ítems
        if ((type === 'monster' || type === 'item') && !data.image) {
          const newId = result.lastInsertRowid as number;
          io.emit('content:generating_image', { id: newId, name });
          console.log(`🎨 Generando imagen IA para: ${name} (${type})...`);

          generateItemImage(type, name, data.description || data.desc || '')
            .then((imageUrl) => {
              if (imageUrl) {
                const updatedData = { ...data, image: imageUrl };
                updateCompendiumItem(newId, name, type, updatedData);
                const refreshed = db.prepare("SELECT * FROM content_items").all();
                io.emit('content:list', refreshed);
                io.emit('content:image_ready', { id: newId, name });
                console.log(`✅ Imagen generada para: ${name}`);
              } else {
                io.emit('content:image_failed', { id: newId, name });
              }
            })
            .catch((e) => {
              console.error(`❌ Error generando imagen para ${name}:`, e.message);
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

    // MOTOR DE TOKENS (GRID)[cite: 1]
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
          owner: data.owner || null, // Guardamos el dueño para los personajes
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
        io.to(`campaign-${roomId}`).emit('token:board-list', boardState.boardTokens); // Sync de posición en sala
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
        io.to(`campaign-${roomId}`).emit('grid:bg-update', imageUrl); // Cambia el mapa para todos los jugadores en la sala
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

    // --- EVENTOS DE COMBATE Y TURNOS ---
    socket.on('combat:roll-initiative', (data: { tokenId: string; value: number }) => {
      const roomId = socket.data.campaignId;
      if (!roomId) return;
      const boardState = getRoomBoardState(roomId);
      // Remover si ya existe
      boardState.combatState.initiativeOrder = boardState.combatState.initiativeOrder.filter(i => i.tokenId !== data.tokenId);
      // Agregar y ordenar descendente
      boardState.combatState.initiativeOrder.push(data);
      boardState.combatState.initiativeOrder.sort((a, b) => b.value - a.value);
      io.to(`campaign-${roomId}`).emit('combat:state-update', boardState.combatState);
      
      const token = boardState.boardTokens.find(t => t.instanceId === data.tokenId);
      if (token) {
        io.to(`campaign-${roomId}`).emit('chat:message', {
          id: Date.now() + Math.random(),
          sender: 'Sistema',
          to: 'all',
          text: `🎲 **${token.name}** tiró Iniciativa y sacó **${data.value}**.`,
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
          text: isActive ? `⚔️ **¡EL COMBATE HA COMENZADO!** (Modo Turnos activado)` : `🕊️ **El combate ha terminado.** (Modo Turnos desactivado)`,
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

    // GESTIÓN DE PERSONAJES (CRUD)
    socket.on('character:create', (charData: any) => {
      const { name, charClass, class: charClassAlt, description, stats, race, image, full_body_image, inventory, level, max_hp, current_hp, ac } = charData;
      const finalClass = charClass || charClassAlt;
      const owner = socket.data.userName || 'Anónimo';
      
      const statsStr = JSON.stringify(safeParseStats(stats));
      const invStr = JSON.stringify(safeParseInventory(inventory));

      db.prepare('INSERT INTO characters (name, class, description, stats, owner, race, image, full_body_image, inventory, level, max_hp, current_hp, ac) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
        .run(name, finalClass, description, statsStr, owner, race || 'Humano', image || null, full_body_image || null, invStr, level || 1, max_hp || 10, current_hp || 10, ac || 10);
      refreshAllCharacters();
    });

    socket.on('character:update', (data: any) => {
      // Permitimos que DM o el dueño edite (simplificado asumiendo confianza en los players o verificando owner)
      const { id, name, charClass, class: charClassAlt, description, stats, race, image, full_body_image, inventory, level, max_hp, current_hp, ac } = data;
      const finalClass = charClass || charClassAlt;
      
      const statsStr = JSON.stringify(safeParseStats(stats));
      const invStr = JSON.stringify(safeParseInventory(inventory));

      db.prepare('UPDATE characters SET name = ?, class = ?, description = ?, stats = ?, race = ?, image = ?, full_body_image = ?, inventory = ?, level = ?, max_hp = ?, current_hp = ?, ac = ? WHERE id = ?')
        .run(name, finalClass, description, statsStr, race || 'Humano', image || null, full_body_image || null, invStr, level || 1, max_hp || 10, current_hp || 10, ac || 10, id);
      refreshAllCharacters();
    });

    socket.on('character:delete', (id: number) => {
      const currentRole = getSocketRole(socket);
      const character = db.prepare("SELECT owner FROM characters WHERE id = ?").get(id) as { owner: string } | undefined;
      if (character && (character.owner === socket.data.userName || currentRole === 'dm' || currentRole === 'admin')) {
        db.prepare('DELETE FROM characters WHERE id = ?').run(id);
        refreshAllCharacters();
      }
    });

    // ACCIONES DE JUEGO[cite: 1]
    socket.on('dice:roll', async (data: { die: number; to?: string }) => {
      const roomId = socket.data.campaignId;
      if (!roomId) return;
      const roll = Math.floor(Math.random() * data.die) + 1;
      const resultObj = {
        user: socket.data.userName,
        die: `d${data.die}`,
        value: roll,
        to: data.to || 'all',
        timestamp: Date.now()
      };
      io.to(`campaign-${roomId}`).emit('dice:result', resultObj);

      // Notificar a la IA si hay una sesión activa en esta campaña
      if (isAISessionActive(roomId)) {
        const aiResponse = await sendDiceRollToAI(roomId, socket.data.userName, roll, `d${data.die}`);
        if (aiResponse) {
          io.to(`campaign-${roomId}`).emit('chat:message', { sender: 'DM IA', text: aiResponse, timestamp: Date.now(), isAI: true });
        }
      }
    });

    // CHAT DEL GRUPO
    socket.on('chat:send', async (msg) => {
      const roomId = socket.data.campaignId;
      if (!roomId) return;
      io.to(`campaign-${roomId}`).emit('chat:message', msg);
      
      // Notificar a la IA si hay una sesión activa en esta campaña
      if (isAISessionActive(roomId) && msg.sender !== 'DM IA') {
        const aiResponse = await sendChatMessageToAI(roomId, msg.sender, msg.text);
        if (aiResponse) {
          io.to(`campaign-${roomId}`).emit('chat:message', { sender: 'DM IA', text: aiResponse, timestamp: Date.now(), isAI: true });
        }
      }
    });

    // GESTIÓN DE CAMPAÑAS
    socket.on('campaign:request', () => {
      sendCampaignsToSocket(socket);
    });

    socket.on('campaign:create', (data: any) => {
      console.log(`[Campaign Create] Solicitando creación. Datos:`, data, `Usuario: ${socket.data.userName}`);
      if (socket.data.userName) {
        const { name, description, image, active_heroes, is_ai_dm } = data;
        db.prepare('INSERT INTO campaigns (name, description, image, active_heroes, is_ai_dm, owner) VALUES (?, ?, ?, ?, ?, ?)')
          .run(name, description || null, image || null, JSON.stringify(active_heroes || []), is_ai_dm ? 1 : 0, socket.data.userName);
        console.log(`[Campaign Create] Campaña creada con éxito.`);
        refreshAllCampaigns();
      } else {
        console.log(`[Campaign Create] Rechazado: socket.data.userName no está definido.`);
      }
    });

    socket.on('campaign:update', (data: any) => {
      const { id, name, description, image, active_heroes, is_ai_dm } = data;
      const campaign = db.prepare("SELECT owner FROM campaigns WHERE id = ?").get(id) as { owner: string | null } | undefined;
      if (campaign && (campaign.owner === socket.data.userName || !campaign.owner || socket.data.role === 'admin')) {
        const finalOwner = campaign.owner || socket.data.userName;
        db.prepare('UPDATE campaigns SET name = ?, description = ?, image = ?, active_heroes = ?, is_ai_dm = ?, owner = ? WHERE id = ?')
          .run(name, description || null, image || null, JSON.stringify(active_heroes || []), is_ai_dm ? 1 : 0, finalOwner, id);
        refreshAllCampaigns();
      }
    });

    socket.on('campaign:set_active', (id: number) => {
      console.log(`[Campaign Set Active] ID solicitado: ${id}. Usuario: ${socket.data.userName}, role: ${socket.data.role}`);
      const campaign = db.prepare("SELECT * FROM campaigns WHERE id = ?").get(id) as any;
      console.log(`[Campaign Set Active] Campaña encontrada en DB:`, campaign);
      if (campaign && (campaign.owner === socket.data.userName || !campaign.owner || socket.data.role === 'admin')) {
        console.log(`[Campaign Set Active] Validación exitosa.`);
        if (!campaign.owner) {
          console.log(`[Campaign Set Active] Campaña heredada/adoptada por: ${socket.data.userName}`);
          db.prepare('UPDATE campaigns SET owner = ? WHERE id = ?').run(socket.data.userName, id);
        }
        db.prepare('UPDATE campaigns SET is_active = 0').run();
        db.prepare('UPDATE campaigns SET is_active = 1 WHERE id = ?').run(id);
        refreshAllCampaigns();

        // Auto-login AI si la campaña lo tiene
        const fullCampaign: any = db.prepare("SELECT * FROM campaigns WHERE id = ?").get(id);
        if (fullCampaign && fullCampaign.is_ai_dm) {
          handleStartAiSession(id);
        } else {
          handleEndAiSession(id);
        }

        // Re-sincronizar personajes de todos los usuarios según su rol dinámico en la nueva campaña activa
        refreshAllCharacters();
      } else {
        console.log(`[Campaign Set Active] Validación rechazada. Owner en DB: ${campaign?.owner}, Solicitante: ${socket.data.userName}`);
      }
    });

    socket.on('campaign:delete', (id: number) => {
      const campaign = db.prepare("SELECT owner FROM campaigns WHERE id = ?").get(id) as { owner: string | null } | undefined;
      if (campaign && (campaign.owner === socket.data.userName || !campaign.owner || socket.data.role === 'admin')) {
        db.prepare('DELETE FROM campaigns WHERE id = ?').run(id);
        db.prepare('DELETE FROM campaign_diary WHERE campaign_id = ?').run(id);
        refreshAllCampaigns();
      }
    });

    socket.on('campaign:diary:request', (campaign_id: number) => {
      const diary = db.prepare("SELECT * FROM campaign_diary WHERE campaign_id = ? ORDER BY created_at ASC").all(campaign_id);
      socket.emit('campaign:diary:list', { campaign_id, diary });
    });

    socket.on('campaign:diary:add', (data: any) => {
      const { campaign_id, content, image } = data;
      const author = socket.data.userName || 'Anónimo';
      db.prepare('INSERT INTO campaign_diary (campaign_id, author, content, image) VALUES (?, ?, ?, ?)')
        .run(campaign_id, author, content, image || null);
      
      const diary = db.prepare("SELECT * FROM campaign_diary WHERE campaign_id = ? ORDER BY created_at ASC").all(campaign_id);
      io.emit('campaign:diary:list', { campaign_id, diary });
    });

    function handleStartAiSession(campaignId: number) {
      const campaign: any = db.prepare("SELECT * FROM campaigns WHERE id = ?").get(campaignId);
      if (campaign && campaign.is_ai_dm) {
        const spawnMonsterCb = (monsterName: string, count: number) => {
          const m = db.prepare("SELECT * FROM content_items WHERE type = 'monster' AND name LIKE ? LIMIT 1").get(`%${monsterName}%`) as any;
          if (m) {
            const mData = JSON.parse(m.data);
            const boardState = getRoomBoardState(campaignId);
            for (let i=0; i<count; i++) {
              const hpText = mData.hit_points || mData.hp || '10';
              const hp = parseInt(String(hpText).split('d')[0]) || 10;
              
              const newToken = {
                instanceId: `monster-${m.id}-${Date.now()}-${i}`,
                originalId: m.id,
                name: m.name + (count > 1 ? ` ${i+1}` : ''),
                type: 'monster',
                hp: hp,
                max_hp: hp,
                ac: mData.armor_class || 10,
                image: mData.image || null,
                owner: null,
                x: 0,
                y: 0
              };
              boardState.boardTokens.push(newToken);
            }
            io.to(`campaign-${campaignId}`).emit('token:board-list', boardState.boardTokens);
          }
        };

        const started = startAISession(campaignId, campaign.name, campaign.description, spawnMonsterCb);
        if (started) {
          io.to(`campaign-${campaignId}`).emit('chat:message', { sender: 'DM IA', text: `¡Saludos aventureros! Soy el DM IA. La campaña "${campaign.name}" ha comenzado.`, timestamp: Date.now(), isAI: true });
          io.to(`campaign-${campaignId}`).emit('ai:session_status', { campaignId, active: true });
        }
      }
    }

    function handleEndAiSession(campaignId: number) {
      endAISession(campaignId);
      io.to(`campaign-${campaignId}`).emit('chat:message', { sender: 'DM IA', text: `La sesión de IA ha finalizado. Hasta la próxima aventura.`, timestamp: Date.now(), isAI: true });
      io.to(`campaign-${campaignId}`).emit('ai:session_status', { campaignId, active: false });
    }

    // IA DM SESSION
    socket.on('ai:start_session', (campaignId: number) => {
      const currentRole = getSocketRole(socket);
      if (currentRole === 'dm' || currentRole === 'admin' || currentRole === 'player') {
        handleStartAiSession(campaignId);
      }
    });

    socket.on('ai:end_session', (campaignId: number) => {
      handleEndAiSession(campaignId);
    });

    socket.on('disconnect', () => console.log('❌ Jugador desconectado'));
  });

  // HELPERS DE SINCRONIZACIÓN[cite: 1]
  function sendCharactersToSocket(s: any) {
    const currentRole = getSocketRole(s);
    const list = (currentRole === 'dm' || currentRole === 'admin')
      ? db.prepare('SELECT * FROM characters').all()
      : db.prepare('SELECT * FROM characters WHERE owner = ?').all(s.data.userName);
    s.emit('character:list', list);
  }

  function sendCampaignsToSocket(s: any) {
    if (!s.data.userName) return;
    const userName = s.data.userName;
    // Una campaña es visible para el usuario si:
    // 1. Es el owner/creador de la campaña
    // 2. Tiene al menos un personaje listado en active_heroes de esa campaña
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

  function refreshAllCampaigns() {
    const allSockets = Array.from(io.sockets.sockets.values());
    allSockets.forEach(s => sendCampaignsToSocket(s));
  }

  function refreshAllCharacters() {
    const allSockets = Array.from(io.sockets.sockets.values());
    allSockets.forEach(s => sendCharactersToSocket(s));
  }

  httpServer.listen(3000, () => console.log('🚀 Server en http://localhost:3000'));
};

// Si se ejecuta directamente en Node/EC2 (fuera de Electron), arranca automáticamente
if (!process.versions.electron) {
  startServer();
}