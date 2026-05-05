import { createServer } from 'http';
import { Server } from 'socket.io';
import { db, initDB } from './db.js';
import { runFullImport } from './seeder.js';

// Estado volátil del tablero: se sincroniza en tiempo real entre todos los clientes[cite: 1]
let boardTokens: any[] = [];

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

    // LOGIN & SYNC INICIAL[cite: 1]
    socket.on('player:join', (data) => {
      socket.data.userName = data.name;
      socket.data.role = data.role;
      console.log(`👤 ${data.name} entró como ${data.role}`);

      // Enviar datos necesarios para arrancar la interfaz
      sendCharactersToSocket(socket);
      
      const monsters = db.prepare("SELECT * FROM content_items WHERE type = 'monster'").all();
      socket.emit('monsters:list', monsters);
      
      socket.emit('token:board-list', boardTokens);
    });

    // MOTOR DE TOKENS (GRID)[cite: 1]
    socket.on('token:spawn', (data) => {
      if (socket.data.role === 'dm') {
        const newToken = {
          instanceId: `${data.type}-${data.id}-${Date.now()}`,
          originalId: data.id,
          name: data.name,
          type: data.type,
          hp: data.hp, // Stats extraídos del JSON del SRD[cite: 1]
          ac: data.ac,
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

    socket.on('token:remove', (instanceId) => {
      if (socket.data.role === 'dm') {
        boardTokens = boardTokens.filter(t => t.instanceId !== instanceId);
        io.emit('token:board-list', boardTokens);
      }
    });

    socket.on('grid:set-bg', (imageUrl: string) => {
      if (socket.data.role === 'dm') {
        io.emit('grid:bg-update', imageUrl); // Cambia el mapa para todos los jugadores[cite: 1]
      }
    });

    // GESTIÓN DE PERSONAJES (CRUD)[cite: 1]
    socket.on('character:create', (charData) => {
      const { name, charClass, description, stats } = charData;
      const owner = socket.data.userName || 'Anónimo';
      db.prepare('INSERT INTO characters (name, class, description, stats, owner) VALUES (?, ?, ?, ?, ?)')
        .run(name, charClass, description, JSON.stringify(stats), owner);
      refreshAllCharacters();
    });

    socket.on('character:update', (data: any) => {
      if (socket.data.role === 'dm') {
        const { id, name, charClass, description, stats } = data;
        db.prepare('UPDATE characters SET name = ?, class = ?, description = ?, stats = ? WHERE id = ?')
          .run(name, charClass, description, JSON.stringify(stats), id);
        refreshAllCharacters();
      }
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