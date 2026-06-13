import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { db, initDB, updateCompendiumItem } from './bd.js';
import { runFullImport } from './sembrador.js';
import { initAI, startAISession, sendChatMessageToAI, sendDiceRollToAI, endAISession, isAISessionActive } from './ia-dm.js';
import { initImageAI, generateItemImage } from './ia-imagen.js';
import multer from 'multer';
import { uploadToS3 } from './services/servicioS3.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dnd-vtt-secret-key-fallback-2026';

// Helpers de Parseo Seguro de JSON para prevenir double-serialization o spreads corruptos
function safeParseJSON(field: any, defaultVal: any): any {
  if (!field) return defaultVal;
  let parsed = field;
  try {
    while (typeof parsed === 'string') {
      const nextParsed = JSON.parse(parsed);
      if (nextParsed === parsed) break;
      parsed = nextParsed;
    }
  } catch (e) {}
  
  if (parsed && typeof parsed === 'object') {
    if (parsed["0"] !== undefined && parsed["1"] !== undefined) {
      try {
        let reconstructedStr = "";
        let idx = 0;
        while (parsed[idx] !== undefined) {
          reconstructedStr += parsed[idx];
          idx++;
        }
        let recovered = JSON.parse(reconstructedStr);
        while (typeof recovered === 'string') {
          recovered = JSON.parse(recovered);
        }
        if (recovered && typeof recovered === 'object') {
          parsed = recovered;
        }
      } catch (e) {
        console.error("Error recovering corrupted spread JSON:", e);
      }
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return defaultVal;
  }
  return parsed;
}

function safeParseInventory(inventoryField: any): any {
  const defaultInventory = { armas: [], armaduras: [], consumibles: [], artefactos: [], coins: { pc: 0, pl: 0, el: 0, po: 0, pt: 0 }, slots: {}, habilidades: [], salvaciones: [], trasfondo: [] };
  const parsed = safeParseJSON(inventoryField, defaultInventory);
  return {
    armas: Array.isArray(parsed.armas) ? parsed.armas : [],
    armaduras: Array.isArray(parsed.armaduras) ? parsed.armaduras : [],
    consumibles: Array.isArray(parsed.consumibles) ? parsed.consumibles : [],
    artefactos: Array.isArray(parsed.artefactos) ? parsed.artefactos : [],
    coins: parsed.coins && typeof parsed.coins === 'object' ? parsed.coins : defaultInventory.coins,
    slots: parsed.slots && typeof parsed.slots === 'object' ? parsed.slots : {},
    habilidades: Array.isArray(parsed.habilidades) ? parsed.habilidades : [],
    salvaciones: Array.isArray(parsed.salvaciones) ? parsed.salvaciones : [],
    trasfondo: Array.isArray(parsed.trasfondo) ? parsed.trasfondo : []
  };
}

function safeParseStats(statsField: any): any {
  const defaultStats = { fue: 10, dex: 10, con: 10, int: 10, sab: 10, car: 10 };
  const parsed = safeParseJSON(statsField, defaultStats);
  return {
    ...parsed,
    fue: typeof parsed.fue === 'number' ? parsed.fue : 10,
    dex: typeof parsed.dex === 'number' ? parsed.dex : 10,
    con: typeof parsed.con === 'number' ? parsed.con : 10,
    int: typeof parsed.int === 'number' ? parsed.int : 10,
    sab: typeof parsed.sab === 'number' ? parsed.sab : 10,
    car: typeof parsed.car === 'number' ? parsed.car : 10
  };
}

function getSocketRole(socket: any): string {
  if (socket.data.role === 'admin') return 'admin';
  try {
    const activeCampaign = db.prepare("SELECT owner FROM campaigns WHERE is_active = 1").get() as { owner: string | null } | undefined;
    if (activeCampaign && activeCampaign.owner === socket.data.userName) {
      return 'dm';
    }
  } catch (e) {
    console.error("Error al obtener rol dinámico de socket:", e);
  }
  return 'player';
}

// Estado volátil del tablero: se sincroniza en tiempo real entre todos los clientes[cite: 1]
let boardTokens: any[] = [];
let currentGridBg: string = '';
let solidCells: string[] = []; // Track solid grid cells
let isNightMode: boolean = false; // Track day/night mode

// Estado del combate: Iniciativas y turnos
let combatState = {
  turnModeActive: false,
  initiativeOrder: [] as { tokenId: string; value: number }[],
  currentTurnIndex: 0
};


const app = express();
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });

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

// Helper Functions for Two-Way Sync between Class Traits and class_features Table
function syncClassTraitsToFeaturesTable(className: string, data: any) {
  try {
    const traits = data?.traits || [];
    
    // 1. Fetch current features for this class in DB
    const dbFeatures = db.prepare("SELECT id, feature_name, level_acquired FROM class_features WHERE LOWER(class_name) = LOWER(?)")
      .all(className) as { id: number, feature_name: string, level_acquired: number }[];

    // 2. Delete any DB features that are NOT in the new traits list
    for (const dbFeat of dbFeatures) {
      const existsInTraits = traits.some((t: any) => t.name.toLowerCase() === dbFeat.feature_name.toLowerCase() && parseInt(t.level) === dbFeat.level_acquired);
      if (!existsInTraits) {
        db.prepare("DELETE FROM class_features WHERE id = ?").run(dbFeat.id);
      }
    }

    // 3. Insert or update traits in the DB
    for (const trait of traits) {
      const existing = db.prepare("SELECT id FROM class_features WHERE LOWER(class_name) = LOWER(?) AND LOWER(feature_name) = LOWER(?) AND level_acquired = ?")
        .get(className, trait.name, parseInt(trait.level)) as { id: number } | undefined;

      if (existing) {
        db.prepare("UPDATE class_features SET description = ?, short_description = ? WHERE id = ?")
          .run(trait.desc || trait.description, trait.short_description || '', existing.id);
      } else {
        db.prepare("INSERT INTO class_features (class_name, feature_name, level_acquired, description, short_description) VALUES (?, ?, ?, ?, ?)")
          .run(className, trait.name, parseInt(trait.level), trait.desc || trait.description, trait.short_description || '');
      }
    }
  } catch (err: any) {
    console.error("Error syncing class traits to features table:", err.message);
  }
}

function syncFeatureToClassContentItem(
  className: string,
  featureName: string,
  level: number,
  description: string,
  shortDescription: string,
  oldClassName?: string,
  oldFeatureName?: string,
  oldLevel?: number
) {
  try {
    if (oldClassName && oldClassName.toLowerCase() !== className.toLowerCase()) {
      deleteFeatureFromClassContentItem(oldClassName, oldFeatureName || featureName, oldLevel);
    }

    const classRow = db.prepare("SELECT id, data FROM content_items WHERE type = 'class' AND LOWER(name) = LOWER(?)")
      .get(className) as { id: number, data: string } | undefined;

    if (!classRow) return;

    let data: any = {};
    try {
      data = JSON.parse(classRow.data);
    } catch {
      data = {};
    }

    if (!data.traits) data.traits = [];

    const targetName = oldFeatureName || featureName;
    const targetLevel = oldLevel !== undefined ? oldLevel : level;
    const existingIndex = data.traits.findIndex((t: any) => t.name.toLowerCase() === targetName.toLowerCase() && parseInt(t.level) === targetLevel);

    const newTrait = {
      level,
      name: featureName,
      type: (existingIndex >= 0 ? data.traits[existingIndex]?.type : null) || 'Pasivo',
      desc: description,
      short_description: shortDescription
    };

    if (existingIndex >= 0) {
      data.traits[existingIndex] = newTrait;
    } else {
      data.traits.push(newTrait);
    }

    data.traits.sort((a: any, b: any) => a.level - b.level);

    if (oldFeatureName && oldFeatureName !== featureName && data.table) {
      data.table = data.table.replace(new RegExp(escapeRegExp(oldFeatureName), 'g'), featureName);
    }

    db.prepare("UPDATE content_items SET data = ? WHERE id = ?")
      .run(JSON.stringify(data), classRow.id);

    if (io) {
      io.emit('content:list', db.prepare("SELECT * FROM content_items").all());
    }
  } catch (err: any) {
    console.error("Error in syncFeatureToClassContentItem:", err.message);
  }
}

function deleteFeatureFromClassContentItem(className: string, featureName: string, level?: number) {
  try {
    const classRow = db.prepare("SELECT id, data FROM content_items WHERE type = 'class' AND LOWER(name) = LOWER(?)")
      .get(className) as { id: number, data: string } | undefined;

    if (!classRow) return;

    let data: any = {};
    try {
      data = JSON.parse(classRow.data);
    } catch {
      data = {};
    }

    if (!data.traits) return;

    if (level !== undefined) {
      data.traits = data.traits.filter((t: any) => !(t.name.toLowerCase() === featureName.toLowerCase() && parseInt(t.level) === level));
    } else {
      data.traits = data.traits.filter((t: any) => t.name.toLowerCase() !== featureName.toLowerCase());
    }

    if (data.table) {
      let table = data.table;
      table = table.replace(new RegExp(`,\\s*${escapeRegExp(featureName)}`, 'gi'), '');
      table = table.replace(new RegExp(`${escapeRegExp(featureName)}\\s*,?`, 'gi'), '');
      data.table = table;
    }

    db.prepare("UPDATE content_items SET data = ? WHERE id = ?")
      .run(JSON.stringify(data), classRow.id);

    if (io) {
      io.emit('content:list', db.prepare("SELECT * FROM content_items").all());
    }
  } catch (err: any) {
    console.error("Error in deleteFeatureFromClassContentItem:", err.message);
  }
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Endpoint REST para TODOS los rasgos de clases
app.get('/api/class-features', (_req, res) => {
  try {
    const features = db.prepare("SELECT id, class_name, feature_name, level_acquired, description, short_description FROM class_features ORDER BY class_name ASC, level_acquired ASC").all();
    const mapped = features.map((f: any) => ({
      id: String(f.id),
      name: f.feature_name,
      class: f.class_name,
      level: f.level_acquired,
      description: f.description,
      short_description: f.short_description || ''
    }));
    res.json(mapped);
  } catch (err: any) {
    console.error("Error en API /api/class-features (all):", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Crear un nuevo rasgo
app.post('/api/class-features', (req, res) => {
  try {
    const { class_name, feature_name, level_acquired, description, short_description } = req.body;
    if (!class_name || !feature_name || !level_acquired || !description) {
      res.status(400).json({ error: "Faltan campos requeridos" });
      return;
    }
    const result = db.prepare("INSERT INTO class_features (class_name, feature_name, level_acquired, description, short_description) VALUES (?, ?, ?, ?, ?)")
      .run(class_name, feature_name, parseInt(level_acquired), description, short_description || '');
    
    const newId = String(result.lastInsertRowid);
    syncFeatureToClassContentItem(class_name, feature_name, parseInt(level_acquired), description, short_description || '');

    res.json({ id: newId, class_name, feature_name, level_acquired, description, short_description });
  } catch (err: any) {
    console.error("Error en POST /api/class-features:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Editar un rasgo existente
app.put('/api/class-features/:id', (req, res) => {
  try {
    const id = req.params.id;
    const { class_name, feature_name, level_acquired, description, short_description } = req.body;
    if (!class_name || !feature_name || !level_acquired || !description) {
      res.status(400).json({ error: "Faltan campos requeridos" });
      return;
    }

    const oldFeature = db.prepare("SELECT class_name, feature_name, level_acquired FROM class_features WHERE id = ?").get(id) as { class_name: string, feature_name: string, level_acquired: number } | undefined;

    db.prepare("UPDATE class_features SET class_name = ?, feature_name = ?, level_acquired = ?, description = ?, short_description = ? WHERE id = ?")
      .run(class_name, feature_name, parseInt(level_acquired), description, short_description || '', id);
    
    if (oldFeature) {
      syncFeatureToClassContentItem(
        class_name,
        feature_name,
        parseInt(level_acquired),
        description,
        short_description || '',
        oldFeature.class_name,
        oldFeature.feature_name,
        oldFeature.level_acquired
      );
    }

    res.json({ id, class_name, feature_name, level_acquired, description, short_description });
  } catch (err: any) {
    console.error("Error en PUT /api/class-features:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Eliminar un rasgo
app.delete('/api/class-features/:id', (req, res) => {
  try {
    const id = req.params.id;
    const oldFeature = db.prepare("SELECT class_name, feature_name, level_acquired FROM class_features WHERE id = ?").get(id) as { class_name: string, feature_name: string, level_acquired: number } | undefined;

    db.prepare("DELETE FROM class_features WHERE id = ?").run(id);

    if (oldFeature) {
      deleteFeatureFromClassContentItem(oldFeature.class_name, oldFeature.feature_name, oldFeature.level_acquired);
    }

    res.json({ success: true, id });
  } catch (err: any) {
    console.error("Error en DELETE /api/class-features:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Endpoint REST para rasgos de una clase específica (bilingüe y tolerante)
app.get('/api/class-features/:className', (req, res) => {
  try {
    const rawClassName = req.params.className;
    
    const nameMap: Record<string, string> = {
      'bárbaro': 'barbarian',
      'barbarian': 'bárbaro',
      'guerrero': 'fighter',
      'fighter': 'guerrero',
      'pícaro': 'rogue',
      'rogue': 'pícaro',
      'mago': 'wizard',
      'wizard': 'mago',
      'clérigo': 'cleric',
      'cleric': 'clérigo',
      'paladín': 'paladin',
      'paladin': 'paladín',
      'bardo': 'bard',
      'bard': 'bardo',
      'druida': 'druid',
      'druid': 'druida',
      'monje': 'monk',
      'monk': 'monje',
      'explorador': 'ranger',
      'ranger': 'explorador',
      'hechicero': 'sorcerer',
      'sorcerer': 'hechicero',
      'brujo': 'warlock',
      'warlock': 'brujo'
    };

    const cleanName = rawClassName.toLowerCase();
    const mappedName = (nameMap[cleanName] || cleanName).toLowerCase();
    
    const features = db.prepare("SELECT feature_name, level_acquired, description FROM class_features WHERE LOWER(class_name) = ? OR LOWER(class_name) = ? ORDER BY level_acquired ASC").all(cleanName, mappedName);
    
    res.json(features);
  } catch (err: any) {
    console.error("Error en API /api/class-features spec:", err.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" } // Clave para permitir conexiones remotas vía ngrok[cite: 1]
});

export const startServer = async () => {
  // 1. Inicialización de persistencia y datos del SRD[cite: 1]
  initDB();
  await runFullImport();
  initAI();
  initImageAI();

  app.post('/api/upload', upload.single('file'), async (req: any, res: any) => {
    try {
      const archivo = req.file;
      const folder = req.query.folder || 'misc'; // Se lee la ruta/carpeta por query param

      if (!archivo) {
        res.status(400).json({ error: 'No se subió ninguna imagen' });
        return;
      }

      // 1. Subir a AWS S3
      const uniqueName = `${Date.now()}_${Math.round(Math.random() * 1E9)}_${archivo.originalname.replace(/\s+/g, '_')}`;
      const urlS3 = await uploadToS3(uniqueName, archivo.buffer, archivo.mimetype, folder);

      res.json({ 
        success: true, 
        message: 'Archivo subido correctamente', 
        url: urlS3 
      });

    } catch (error: any) {
      console.error("Error al subir archivo a S3:", error);
      res.status(500).json({ error: 'Error al procesar el archivo', details: error.message });
    }
  });

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
          socket.emit('token:board-list', boardTokens);
          if (currentGridBg) socket.emit('grid:bg-update', currentGridBg);
          socket.emit('grid:solid-update', solidCells);
          socket.emit('grid:night-update', isNightMode);
          socket.emit('combat:state-update', combatState);
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
        socket.emit('token:board-list', boardTokens);
        if (currentGridBg) socket.emit('grid:bg-update', currentGridBg);
        socket.emit('grid:solid-update', solidCells);
        socket.emit('grid:night-update', isNightMode);
        socket.emit('combat:state-update', combatState);
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
          socket.emit('token:board-list', boardTokens);
          if (currentGridBg) socket.emit('grid:bg-update', currentGridBg);
          socket.emit('grid:solid-update', solidCells);
          socket.emit('grid:night-update', isNightMode);
          socket.emit('combat:state-update', combatState);
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
      const currentRole = getSocketRole(socket);
      if (currentRole === 'dm' || currentRole === 'admin') {
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
        boardTokens.push(newToken);
        io.emit('token:board-list', boardTokens);
      }
    });

    socket.on('token:update-chest', (data: { tokenId: string; chestData: any; name?: string }) => {
      const token = boardTokens.find(t => t.instanceId === data.tokenId);
      if (token && token.type === 'chest') {
        token.chestData = { ...token.chestData, ...data.chestData };
        if (data.name) {
          token.name = data.name;
        }
        io.emit('token:board-list', boardTokens);
      }
    });

    socket.on('token:update-aoe', (data: { tokenId: string; aoeData: any }) => {
      const token = boardTokens.find(t => t.instanceId === data.tokenId);
      if (token && token.type === 'aoe') {
        token.aoeData = { ...token.aoeData, ...data.aoeData };
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
      const currentRole = getSocketRole(socket);
      if (currentRole === 'dm' || currentRole === 'admin') {
        const token = boardTokens.find(t => t.instanceId === data.tokenId);
        if (token) {
          token.hp = Math.max(0, Math.min(token.hp + data.amount, token.max_hp));
          io.emit('token:board-list', boardTokens);
        }
      }
    });

    socket.on('token:update-combat-state', (data: { tokenId: string; hp?: number; max_hp?: number; tempHp?: number; condition?: string | null }) => {
      const currentRole = getSocketRole(socket);
      if (currentRole === 'dm' || currentRole === 'admin') {
        const token = boardTokens.find(t => t.instanceId === data.tokenId);
        if (token) {
          if (data.hp !== undefined) token.hp = data.hp;
          if (data.max_hp !== undefined) token.max_hp = data.max_hp;
          if (data.tempHp !== undefined) token.tempHp = data.tempHp;
          if (data.condition !== undefined) token.condition = data.condition;
          io.emit('token:board-list', boardTokens);
        }
      }
    });

    socket.on('token:update-team', (data: { tokenId: string; color: string | null }) => {
      const currentRole = getSocketRole(socket);
      if (currentRole === 'dm' || currentRole === 'admin') {
        const token = boardTokens.find(t => t.instanceId === data.tokenId);
        if (token) {
          token.teamColor = data.color;
          io.emit('token:board-list', boardTokens);
        }
      }
    });

    socket.on('token:remove', (instanceId) => {
      const currentRole = getSocketRole(socket);
      if (currentRole === 'dm' || currentRole === 'admin') {
        boardTokens = boardTokens.filter(t => t.instanceId !== instanceId);
        io.emit('token:board-list', boardTokens);
      }
    });

    socket.on('grid:set-bg', (imageUrl: string) => {
      const currentRole = getSocketRole(socket);
      if (currentRole === 'dm' || currentRole === 'admin') {
        currentGridBg = imageUrl;
        io.emit('grid:bg-update', imageUrl); // Cambia el mapa para todos los jugadores
      }
    });

    socket.on('grid:update-solid', (cells: string[]) => {
      const currentRole = getSocketRole(socket);
      if (currentRole === 'dm' || currentRole === 'admin') {
        solidCells = cells;
        io.emit('grid:solid-update', solidCells);
      }
    });

    socket.on('grid:set-night', (isNight: boolean) => {
      const currentRole = getSocketRole(socket);
      if (currentRole === 'dm' || currentRole === 'admin') {
        isNightMode = isNight;
        io.emit('grid:night-update', isNightMode);
      }
    });

    socket.on('board:clear', () => {
      const currentRole = getSocketRole(socket);
      if (currentRole === 'dm' || currentRole === 'admin') {
        boardTokens = [];
        currentGridBg = '';
        solidCells = [];
        isNightMode = false;
        io.emit('token:board-list', boardTokens);
        io.emit('grid:bg-update', '');
        io.emit('grid:solid-update', []);
        io.emit('grid:night-update', false);
        combatState = { turnModeActive: false, initiativeOrder: [], currentTurnIndex: 0 };
        io.emit('combat:state-update', combatState);
      }
    });

    // --- EVENTOS DE COMBATE Y TURNOS ---
    socket.on('combat:roll-initiative', (data: { tokenId: string; value: number }) => {
      // Remover si ya existe
      combatState.initiativeOrder = combatState.initiativeOrder.filter(i => i.tokenId !== data.tokenId);
      // Agregar y ordenar descendente
      combatState.initiativeOrder.push(data);
      combatState.initiativeOrder.sort((a, b) => b.value - a.value);
      io.emit('combat:state-update', combatState);
      
      const token = boardTokens.find(t => t.instanceId === data.tokenId);
      if (token) {
        io.emit('chat:send', {
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
      const currentRole = getSocketRole(socket);
      if (currentRole === 'dm' || currentRole === 'admin') {
        combatState.initiativeOrder = newOrder;
        io.emit('combat:state-update', combatState);
      }
    });

    socket.on('combat:toggle-turn-mode', (isActive: boolean) => {
      const currentRole = getSocketRole(socket);
      if (currentRole === 'dm' || currentRole === 'admin') {
        combatState.turnModeActive = isActive;
        if (!isActive) {
          combatState.currentTurnIndex = 0;
        }
        io.emit('combat:state-update', combatState);
        
        io.emit('chat:send', {
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
      // The DM or the player whose turn it is can pass the turn
      // We will trust the client validation for now, or we can check here.
      if (combatState.turnModeActive && combatState.initiativeOrder.length > 0) {
        combatState.currentTurnIndex = (combatState.currentTurnIndex + 1) % combatState.initiativeOrder.length;
        io.emit('combat:state-update', combatState);
      }
    });

    socket.on('combat:reset', () => {
      const currentRole = getSocketRole(socket);
      if (currentRole === 'dm' || currentRole === 'admin') {
        combatState = { turnModeActive: false, initiativeOrder: [], currentTurnIndex: 0 };
        io.emit('combat:state-update', combatState);
      }
    });

    socket.on('combat:request-save', (data: { targetName: string; stat: string; statKey: string; dc: number }) => {
      const currentRole = getSocketRole(socket);
      if (currentRole === 'dm' || currentRole === 'admin') {
        io.emit('combat:save-notification', data);
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
      const roll = Math.floor(Math.random() * data.die) + 1;
      const resultObj = {
        user: socket.data.userName,
        die: `d${data.die}`,
        value: roll,
        to: data.to || 'all',
        timestamp: Date.now()
      };
      io.emit('dice:result', resultObj);

      // Notificar a la IA si hay una sesión activa
      if (activeAiCampaignId !== null && isAISessionActive(activeAiCampaignId)) {
        const aiResponse = await sendDiceRollToAI(activeAiCampaignId, socket.data.userName, roll, `d${data.die}`);
        if (aiResponse) {
          io.emit('chat:message', { sender: 'DM IA', text: aiResponse, timestamp: Date.now(), isAI: true });
        }
      }
    });

    // CHAT DEL GRUPO
    socket.on('chat:send', async (msg) => {
      io.emit('chat:message', msg);
      
      // Notificar a la IA si hay una sesión activa
      if (activeAiCampaignId !== null && isAISessionActive(activeAiCampaignId) && msg.sender !== 'DM IA') {
        const aiResponse = await sendChatMessageToAI(activeAiCampaignId, msg.sender, msg.text);
        if (aiResponse) {
          io.emit('chat:message', { sender: 'DM IA', text: aiResponse, timestamp: Date.now(), isAI: true });
        }
      }
    });

    // GESTIÓN DE CAMPAÑAS
    socket.on('campaign:request', () => {
      const campaigns = db.prepare("SELECT * FROM campaigns").all();
      socket.emit('campaign:list', campaigns);
    });

    socket.on('campaign:create', (data: any) => {
      if (socket.data.userName) {
        const { name, description, image, active_heroes, is_ai_dm } = data;
        db.prepare('INSERT INTO campaigns (name, description, image, active_heroes, is_ai_dm, owner) VALUES (?, ?, ?, ?, ?, ?)')
          .run(name, description || null, image || null, JSON.stringify(active_heroes || []), is_ai_dm ? 1 : 0, socket.data.userName);
        const allCampaigns = db.prepare("SELECT * FROM campaigns").all();
        io.emit('campaign:list', allCampaigns);
      }
    });

    socket.on('campaign:update', (data: any) => {
      const { id, name, description, image, active_heroes, is_ai_dm } = data;
      const campaign = db.prepare("SELECT owner FROM campaigns WHERE id = ?").get(id) as { owner: string | null } | undefined;
      if (campaign && (campaign.owner === socket.data.userName || socket.data.role === 'admin')) {
        db.prepare('UPDATE campaigns SET name = ?, description = ?, image = ?, active_heroes = ?, is_ai_dm = ? WHERE id = ?')
          .run(name, description || null, image || null, JSON.stringify(active_heroes || []), is_ai_dm ? 1 : 0, id);
        const allCampaigns = db.prepare("SELECT * FROM campaigns").all();
        io.emit('campaign:list', allCampaigns);
      }
    });

    socket.on('campaign:set_active', (id: number) => {
      const campaign = db.prepare("SELECT owner FROM campaigns WHERE id = ?").get(id) as { owner: string | null } | undefined;
      if (campaign && (campaign.owner === socket.data.userName || socket.data.role === 'admin')) {
        db.prepare('UPDATE campaigns SET is_active = 0').run();
        db.prepare('UPDATE campaigns SET is_active = 1 WHERE id = ?').run(id);
        const allCampaigns = db.prepare("SELECT * FROM campaigns").all();
        io.emit('campaign:list', allCampaigns);

        // Auto-login AI si la campaña lo tiene
        const fullCampaign: any = db.prepare("SELECT * FROM campaigns WHERE id = ?").get(id);
        if (fullCampaign && fullCampaign.is_ai_dm) {
          handleStartAiSession(id);
        } else if (activeAiCampaignId !== null) {
          handleEndAiSession(activeAiCampaignId);
        }

        // Re-sincronizar personajes de todos los usuarios según su rol dinámico en la nueva campaña activa
        refreshAllCharacters();
      }
    });

    socket.on('campaign:delete', (id: number) => {
      const campaign = db.prepare("SELECT owner FROM campaigns WHERE id = ?").get(id) as { owner: string | null } | undefined;
      if (campaign && (campaign.owner === socket.data.userName || socket.data.role === 'admin')) {
        db.prepare('DELETE FROM campaigns WHERE id = ?').run(id);
        db.prepare('DELETE FROM campaign_diary WHERE campaign_id = ?').run(id);
        const allCampaigns = db.prepare("SELECT * FROM campaigns").all();
        io.emit('campaign:list', allCampaigns);
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
        activeAiCampaignId = campaignId;
        
        const spawnMonsterCb = (monsterName: string, count: number) => {
          const m = db.prepare("SELECT * FROM content_items WHERE type = 'monster' AND name LIKE ? LIMIT 1").get(`%${monsterName}%`) as any;
          if (m) {
            const mData = JSON.parse(m.data);
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
              boardTokens.push(newToken);
            }
            io.emit('token:board-list', boardTokens);
          }
        };

        const started = startAISession(campaignId, campaign.name, campaign.description, spawnMonsterCb);
        if (started) {
          io.emit('chat:message', { sender: 'DM IA', text: `¡Saludos aventureros! Soy el DM IA. La campaña "${campaign.name}" ha comenzado.`, timestamp: Date.now(), isAI: true });
          io.emit('ai:session_status', { campaignId, active: true });
        }
      }
    }

    function handleEndAiSession(campaignId: number) {
      if (activeAiCampaignId === campaignId) {
        endAISession(campaignId);
        activeAiCampaignId = null;
        io.emit('chat:message', { sender: 'DM IA', text: `La sesión de IA ha finalizado. Hasta la próxima aventura.`, timestamp: Date.now(), isAI: true });
        io.emit('ai:session_status', { campaignId, active: false });
      }
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