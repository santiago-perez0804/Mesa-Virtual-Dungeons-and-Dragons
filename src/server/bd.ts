import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

// 1. Configuración de rutas para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta a la raíz del proyecto para el archivo .db
const dbPath = path.join(__dirname, '../../vtt_database.bd');

// 2. Instancia de la base de datos
export const db = new Database(dbPath);

export const initDB = () => {
  // --- TABLAS DEL ROADMAP (Fase Fundación) ---

  // Gestión de Usuarios (Autenticación)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL, -- 'admin', 'dm', 'player'
      profile_image TEXT
    )
  `);

  try { db.exec("ALTER TABLE users ADD COLUMN profile_image TEXT"); } catch (e) { /* Columna ya existe */ }

  // Insertar administrador por defecto si no existe, hasheando contraseñas
  try {
    const adminCheck = db.prepare("SELECT count(*) as count FROM users WHERE username = 'admin'").get() as { count: number };
    if (adminCheck.count === 0) {
      const hashedAdmin = bcrypt.hashSync('admin', 10);
      db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run('admin', hashedAdmin, 'admin');
    }

    // Eliminar el Dungeon Master por defecto si existe
    db.prepare("DELETE FROM users WHERE username = 'Dungeon Master' AND role = 'dm'").run();

    // Migrar cualquier contraseña existente en texto plano a hash de bcrypt
    const allUsers = db.prepare("SELECT id, password FROM users").all() as { id: number, password: string }[];
    for (const u of allUsers) {
      if (!u.password.startsWith('$2a$') && !u.password.startsWith('$2b$') && !u.password.startsWith('$2y$')) {
        const hashed = bcrypt.hashSync(u.password, 10);
        db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashed, u.id);
        console.log(`🔒 Contraseña del usuario ID ${u.id} migrada a bcrypt.`);
      }
    }
  } catch (e) {
    console.error("Error al crear o migrar cuentas de usuario:", e);
  }

  // Gestión de Campañas
  db.exec(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      image TEXT,
      active_heroes TEXT, -- JSON array of character IDs
      is_ai_dm BOOLEAN DEFAULT 0,
      is_active BOOLEAN DEFAULT 0,
      owner TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try { db.exec("ALTER TABLE campaigns ADD COLUMN description TEXT"); } catch (e) { /* Columna ya existe */ }
  try { db.exec("ALTER TABLE campaigns ADD COLUMN image TEXT"); } catch (e) { /* Columna ya existe */ }
  try { db.exec("ALTER TABLE campaigns ADD COLUMN active_heroes TEXT"); } catch (e) { /* Columna ya existe */ }
  try { db.exec("ALTER TABLE campaigns ADD COLUMN is_ai_dm BOOLEAN DEFAULT 0"); } catch (e) { /* Columna ya existe */ }
  try { db.exec("ALTER TABLE campaigns ADD COLUMN is_active BOOLEAN DEFAULT 0"); } catch (e) { /* Columna ya existe */ }
  try { db.exec("ALTER TABLE campaigns ADD COLUMN owner TEXT"); } catch (e) { /* Columna ya existe */ }

  // Diario de Campañas
  db.exec(`
    CREATE TABLE IF NOT EXISTS campaign_diary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaign_id INTEGER NOT NULL,
      author TEXT NOT NULL,
      content TEXT NOT NULL,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(campaign_id) REFERENCES campaigns(id)
    )
  `);

  // Personajes con sistema de propiedad
  db.exec(`
    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      class TEXT,
      description TEXT,
      stats TEXT, 
      owner TEXT NOT NULL, 
      race TEXT DEFAULT 'Humano',
      image TEXT,
      full_body_image TEXT,
      inventory TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migración para añadir nuevas columnas a db existentes
  try { db.exec("ALTER TABLE characters ADD COLUMN race TEXT DEFAULT 'Humano'"); } catch (e) { /* Columna ya existe */ }
  try { db.exec("ALTER TABLE characters ADD COLUMN image TEXT"); } catch (e) { /* Columna ya existe */ }
  try { db.exec("ALTER TABLE characters ADD COLUMN full_body_image TEXT"); } catch (e) { /* Columna ya existe */ }
  try { db.exec("ALTER TABLE characters ADD COLUMN inventory TEXT"); } catch (e) { /* Columna ya existe */ }
  try { db.exec("ALTER TABLE characters ADD COLUMN level INTEGER DEFAULT 1"); } catch (e) { /* Columna ya existe */ }
  try { db.exec("ALTER TABLE characters ADD COLUMN max_hp INTEGER DEFAULT 10"); } catch (e) { /* Columna ya existe */ }
  try { db.exec("ALTER TABLE characters ADD COLUMN current_hp INTEGER DEFAULT 10"); } catch (e) { /* Columna ya existe */ }
  try { db.exec("ALTER TABLE characters ADD COLUMN ac INTEGER DEFAULT 10"); } catch (e) { /* Columna ya existe */ }

  // Omni-tabla para el SRD (Monstruos, Hechizos, Ítems)
  db.exec(`
    CREATE TABLE IF NOT EXISTS content_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'monster', 'spell', 'item', 'condition', 'subrace', 'language'
      data TEXT NOT NULL, -- JSON con el detalle completo de la API
      source TEXT DEFAULT 'srd'
    )
  `);

  // Seguimiento de Encuentros y Combate[cite: 1]
  db.exec(`
    CREATE TABLE IF NOT EXISTS encounters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      monsters_json TEXT, -- Lista de instancias de monstruos en el mapa
      status TEXT DEFAULT 'active'
    )
  `);

  // Inventario y Slots de Hechizos (Semana 2)[cite: 1]
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id INTEGER,
      item_json TEXT,
      FOREIGN KEY(character_id) REFERENCES characters(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS spell_slots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      character_id INTEGER,
      slots_json TEXT,
      FOREIGN KEY(character_id) REFERENCES characters(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS class_features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_name TEXT NOT NULL,         -- ej: 'barbarian'
      feature_name TEXT NOT NULL,       -- ej: 'Rage'
      level_acquired INTEGER NOT NULL,  -- nivel en que se obtiene
      description TEXT NOT NULL,        -- descripción completa
      short_description TEXT            -- descripción corta (opcional)
    )
  `);

  try {
    db.prepare("ALTER TABLE class_features ADD COLUMN short_description TEXT").run();
    console.log("⚡ Columna short_description añadida a class_features.");
  } catch (err) {
    // La columna ya existe, ignoramos
  }

  try {
    const checkFeatures = db.prepare("SELECT count(*) as count FROM class_features").get() as { count: number };
    if (checkFeatures.count === 0) {
      const seedPath = path.join(__dirname, 'semillas/compendio_semilla.json');
      let imported = false;

      if (fs.existsSync(seedPath)) {
        try {
          console.log("🌱 Detectada semilla JSON. Importando class_features...");
          const semilla = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
          if (semilla.class_features && semilla.class_features.length > 0) {
            const insert = db.prepare("INSERT INTO class_features (class_name, feature_name, level_acquired, description, short_description) VALUES (?, ?, ?, ?, ?)");
            const transaction = db.transaction((features) => {
              for (const f of features) {
                insert.run(f.class_name, f.feature_name, f.level_acquired, f.description, f.short_description || '');
              }
            });
            transaction(semilla.class_features);
            console.log(`✅ Se importaron ${semilla.class_features.length} rasgos de clase desde la semilla JSON.`);
            imported = true;
          }
        } catch (err) {
          console.error("❌ Error leyendo o parseando la semilla JSON para class_features:", err);
        }
      }

      // Si no se pudo importar desde el JSON, se loguea una advertencia
      if (!imported) {
        console.warn("⚠️ No se pudo cargar desde la semilla JSON.");
      }
    }
  } catch (e) {
    console.error("Error al crear o sembrar class_features:", e);
  }

  // --- SEED DE EMERGENCIA (Para testeo inmediato) ---
  // Esto asegura que mañana, aunque no corras el seeder, tengas algo que buscar[cite: 1].
  const check = db.prepare("SELECT count(*) as count FROM content_items WHERE name = ?").get('Poro Guerrero') as { count: number };

  if (check.count === 0) {
    const insert = db.prepare("INSERT INTO content_items (name, type, data, source) VALUES (?, ?, ?, ?)");
    insert.run(
      'Poro Guerrero',
      'monster',
      JSON.stringify({ hp: 20, ac: 12, str: 10, dex: 14, description: "Un valiente Poro con armadura." }),
      'homebrew'
    );
    console.log("⚠️ Insertado 'Poro Guerrero' para pruebas iniciales.");
  }

  console.log(`✅ Database SQLite: LISTA y ESTRUCTURADA en ${dbPath}`);
};

export const updateCompendiumItem = (id: number, name: string, type: string, data: any) => {
  const update = db.prepare("UPDATE content_items SET name = ?, type = ?, data = ? WHERE id = ?");
  update.run(name, type, JSON.stringify(data), id);
};

export default db;