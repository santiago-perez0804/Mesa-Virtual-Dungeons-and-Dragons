import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 1. Configuración de rutas para ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta a la raíz del proyecto para el archivo .db
const dbPath = path.join(__dirname, '../../vtt_database.db');

// 2. Instancia de la base de datos
export const db = new Database(dbPath);

export const initDB = () => {
  // --- TABLAS DEL ROADMAP (Fase Fundación) ---

  // Gestión de Campañas
  db.exec(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Omni-tabla para el SRD (Monstruos, Hechizos, Ítems)
  db.exec(`
    CREATE TABLE IF NOT EXISTS content_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'monster', 'spell', 'item'[cite: 1]
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

export default db;