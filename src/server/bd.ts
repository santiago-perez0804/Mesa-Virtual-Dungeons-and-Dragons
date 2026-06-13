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

  // Insertar administrador y DM por defecto si no existen, hasheando contraseñas
  try {
    const adminCheck = db.prepare("SELECT count(*) as count FROM users WHERE username = 'admin'").get() as { count: number };
    if (adminCheck.count === 0) {
      const hashedAdmin = bcrypt.hashSync('admin', 10);
      db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run('admin', hashedAdmin, 'admin');
    }

    const dmCheck = db.prepare("SELECT count(*) as count FROM users WHERE role = 'dm'").get() as { count: number };
    if (dmCheck.count === 0) {
      const hashedDm = bcrypt.hashSync('dm', 10);
      db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run('Dungeon Master', hashedDm, 'dm');
    }

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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  try { db.exec("ALTER TABLE campaigns ADD COLUMN description TEXT"); } catch (e) { /* Columna ya existe */ }
  try { db.exec("ALTER TABLE campaigns ADD COLUMN image TEXT"); } catch (e) { /* Columna ya existe */ }
  try { db.exec("ALTER TABLE campaigns ADD COLUMN active_heroes TEXT"); } catch (e) { /* Columna ya existe */ }
  try { db.exec("ALTER TABLE campaigns ADD COLUMN is_ai_dm BOOLEAN DEFAULT 0"); } catch (e) { /* Columna ya existe */ }
  try { db.exec("ALTER TABLE campaigns ADD COLUMN is_active BOOLEAN DEFAULT 0"); } catch (e) { /* Columna ya existe */ }

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

      // Si no se pudo importar desde el JSON, usamos el fallback hardcodeado original
      if (!imported) {
        console.log("⚠️ No se pudo cargar desde la semilla. Iniciando seeders hardcodeados de emergencia...");
        
        // Bárbaro
        const insertBarbaro = db.prepare("INSERT INTO class_features (class_name, feature_name, level_acquired, description) VALUES (?, ?, ?, ?)");
        const transBarbaro = db.transaction((features) => {
          for (const f of features) {
            insertBarbaro.run(f.class_name, f.feature_name, f.level_acquired, f.description);
          }
        });
        transBarbaro([
          { class_name: 'Bárbaro', feature_name: 'Furia', level_acquired: 1, description: 'En combate, luchas con una ferocidad primigenia. En tu turno, puedes entrar en furia como acción adicional. Mientras estés en furia (y no lleves armadura pesada), tienes ventaja en las pruebas y salvaciones de Fuerza, obtienes un bonificador al daño con armas cuerpo a cuerpo basadas en Fuerza, y posees resistencia a los daños contundente, perforante y cortante. No puedes lanzar ni concentrarte en conjuros durante la furia. Dura 1 minuto.' },
          { class_name: 'Bárbaro', feature_name: 'Defensa sin Armadura', level_acquired: 1, description: 'Mientras no lleves armadura, tu Clase de Armadura es igual a 10 + tu modificador por Destreza + tu modificador por Constitución. Puedes usar un escudo y seguir obteniendo este beneficio.' },
          { class_name: 'Bárbaro', feature_name: 'Ataque Temerario', level_acquired: 2, description: 'A partir del nivel 2, puedes desechar toda preocupación por la defensa para atacar con feroz desesperación. Cuando realizas tu primer ataque en tu turno, puedes decidir atacar de forma temeraria. Hacerlo te da ventaja en las tiradas de ataque con armas cuerpo a cuerpo que usen Fuerza durante este turno, pero las tiradas de ataque contra ti tienen ventaja hasta tu siguiente turno.' },
          { class_name: 'Bárbaro', feature_name: 'Sentido del Peligro', level_acquired: 2, description: 'En el nivel 2, obtienes un sentido misterioso de cuándo las cosas no son como deberían, lo que te da ventaja en las tiradas de salvación de Destreza contra efectos que puedas ver, como trampas y conjuros. No debes estar cegado, ensordecido ni incapacitado.' },
          { class_name: 'Bárbaro', feature_name: 'Senda Primal', level_acquired: 3, description: 'En el nivel 3, eliges una senda que define la naturaleza de tu furia, como la Senda del Berserker. Tu elección te otorga rasgos en los niveles 3, 6, 10 y 14.' },
          { class_name: 'Bárbaro', feature_name: 'Mejora de Característica', level_acquired: 4, description: 'Cuando alcanzas el nivel 4, y nuevamente en los niveles 8, 12, 16 y 19, puedes aumentar una puntuación de característica de tu elección en 2, o dos puntuaciones de característica de tu elección en 1. Como es habitual, no puedes aumentar una puntuación de característica por encima de 20 con este rasgo.' },
          { class_name: 'Bárbaro', feature_name: 'Ataque Extra', level_acquired: 5, description: 'A partir del nivel 5, puedes atacar dos veces, en lugar de una, siempre que realices la acción de Atacar en tu turno.' },
          { class_name: 'Bárbaro', feature_name: 'Movimiento Rápido', level_acquired: 5, description: 'A partir del nivel 5, tu velocidad aumenta en 10 pies mientras no lleves armadura pesada.' },
          { class_name: 'Bárbaro', feature_name: 'Instinto Salvaje', level_acquired: 7, description: 'En el nivel 7, tus instintos están tan agudizados que tienes ventaja en las tiradas de iniciativa. Además, si te sorprenden en combate y no estás incapacitado, puedes actuar normalmente en tu primer turno si entras en furia antes de hacer cualquier otra cosa.' },
          { class_name: 'Bárbaro', feature_name: 'Mejora de Característica', level_acquired: 8, description: 'Cuando alcanzas el nivel 8, y de nuevo en los niveles 12, 16 y 19, puedes aumentar una puntuación de característica de tu elección en 2, o dos puntuaciones de característica en 1.' },
          { class_name: 'Bárbaro', feature_name: 'Crítico Brutal (1 dado)', level_acquired: 9, description: 'A partir del nivel 9, puedes tirar un dado de daño de arma adicional al determinar el daño extra de un golpe crítico con un ataque cuerpo a cuerpo.' },
          { class_name: 'Bárbaro', feature_name: 'Furia Implacable', level_acquired: 11, description: 'A partir del nivel 11, tu furia te mantiene luchando a pesar de heridas gravísimas. Si tus puntos de golpe caen a 0 mientras estás en furia y no mueres en el acto, puedes realizar una salvación de Constitución CD 10 para quedar a 1 punto de golpe. Cada uso posterior aumenta la CD en 5 hasta que termines un descanso corto o largo.' },
          { class_name: 'Bárbaro', feature_name: 'Mejora de Característica', level_acquired: 12, description: 'Cuando alcanzas el nivel 12, y de nuevo en los niveles 16 y 19, puedes aumentar una puntuación de característica de tu elección en 2, o dos puntuaciones de característica en 1.' },
          { class_name: 'Bárbaro', feature_name: 'Crítico Brutal (2 dados)', level_acquired: 13, description: 'A partir del nivel 13, puedes tirar dos dados de daño de arma adicionales al determinar el daño extra de un golpe crítico con un ataque cuerpo a cuerpo.' },
          { class_name: 'Bárbaro', feature_name: 'Furia Persistente', level_acquired: 15, description: 'A partir del nivel 15, tu furia es tan intensa que solo termina antes de tiempo si cae inconsciente o si decides finalizarla.' },
          { class_name: 'Bárbaro', feature_name: 'Mejora de Característica', level_acquired: 16, description: 'Cuando alcanzas el nivel 16, y de nuevo en el nivel 19, puedes aumentar una puntuación de característica de tu elección en 2, o dos puntuaciones de característica en 1.' },
          { class_name: 'Bárbaro', feature_name: 'Crítico Brutal (3 dados)', level_acquired: 17, description: 'A partir del nivel 17, puedes tirar tres dados de daño de arma adicionales al determinar el daño extra de un golpe crítico con un ataque cuerpo a cuerpo.' },
          { class_name: 'Bárbaro', feature_name: 'Poder Indómito', level_acquired: 18, description: 'A partir del nivel 18, si el total de tu prueba de Fuerza es menor que tu puntuación de Fuerza, puedes usar tu puntuación en lugar del resultado de la tirada.' },
          { class_name: 'Bárbaro', feature_name: 'Mejora de Característica', level_acquired: 19, description: 'Cuando alcanzas el nivel 19, puedes aumentar una puntuación de característica de tu elección en 2, o dos puntuaciones de característica en 1.' },
          { class_name: 'Bárbaro', feature_name: 'Campeón Primal', level_acquired: 20, description: 'En el nivel 20, encarnas el poder de la naturaleza salvaje. Tus puntuaciones de Fuerza y Constitución aumentan en 4, y tu máximo para estas puntuaciones pasa a ser 24.' }
        ]);
        console.log("⚔️ Seeder de rasgos del bárbaro insertado (fallback).");

        // Guerrero
        const insertGuerrero = db.prepare("INSERT INTO class_features (class_name, feature_name, level_acquired, description) VALUES (?, ?, ?, ?)");
        const transGuerrero = db.transaction((features) => {
          for (const f of features) {
            insertGuerrero.run(f.class_name, f.feature_name, f.level_acquired, f.description);
          }
        });
        transGuerrero([
          { class_name: 'Guerrero', feature_name: 'Estilo de Combate', level_acquired: 1, description: 'Adoptas un estilo de combate particular como tu especialidad. Elige una opción como Arquería (+2 a tiradas de ataque con armas a distancia), Defensa (+1 a la CA con armadura), Duelista (+2 al daño con un arma a una mano), Combate con Armas Grandes, Protección o Combate con Dos Armas.' },
          { class_name: 'Guerrero', feature_name: 'Segunda Oportunidad', level_acquired: 1, description: 'Tienes una reserva limitada de resistencia de la que puedes tirar para protegerte del daño. En tu turno, puedes usar una acción adicional para recuperar puntos de golpe equivalentes a 1d10 + tu nivel de guerrero. Debes terminar un descanso corto o largo para volver a usarlo.' },
          { class_name: 'Guerrero', feature_name: 'Acción en Oleada', level_acquired: 2, description: 'A partir del nivel 2, puedes superar tus límites por un instante. En tu turno, puedes realizar una acción adicional además de tu acción normal y posible acción adicional. Debes terminar un descanso corto o largo para volver a usarlo.' },
          { class_name: 'Guerrero', feature_name: 'Arquetipo Marcial', level_acquired: 3, description: 'En el nivel 3, eliges un arquetipo que emula el entrenamiento marcial de tu elección, como Campeón o Maestro de Batalla. Tu elección te otorga rasgos en los niveles 3, 7, 10, 15 y 18.' },
          { class_name: 'Guerrero', feature_name: 'Mejora de Característica', level_acquired: 4, description: 'Al llegar al nivel 4, y de nuevo en los niveles 6, 8, 12, 14, 16 y 19, puedes aumentar una puntuación de característica en 2, o dos en 1. No puedes superar el valor de 20 por este medio.' },
          { class_name: 'Guerrero', feature_name: 'Ataque Extra', level_acquired: 5, description: 'A partir del nivel 5, puedes atacar dos veces en lugar de una al realizar la acción de Atacar en tu turno. Esto aumenta a tres ataques a nivel 11 y a cuatro ataques a nivel 20.' },
          { class_name: 'Guerrero', feature_name: 'Mejora de Característica', level_acquired: 6, description: 'Al llegar al nivel 6, y de nuevo en los niveles 8, 12, 14, 16 y 19, puedes aumentar una puntuación de característica en 2, o dos en 1.' },
          { class_name: 'Guerrero', feature_name: 'Mejora de Característica', level_acquired: 8, description: 'Al llegar al nivel 8, y de nuevo en los niveles 12, 14, 16 y 19, puedes aumentar una puntuación de característica en 2, o dos en 1.' },
          { class_name: 'Guerrero', feature_name: 'Indomable', level_acquired: 9, description: 'A partir del nivel 9, puedes volver a tirar una salvación fallida. Si lo haces, debes usar el nuevo resultado. No puedes volver a usar este rasgo hasta terminar un descanso largo.' },
          { class_name: 'Guerrero', feature_name: 'Ataque Extra (2)', level_acquired: 11, description: 'Puedes atacar tres veces en lugar de dos siempre que realices la acción de Atacar en tu turno.' },
          { class_name: 'Guerrero', feature_name: 'Mejora de Característica', level_acquired: 12, description: 'Al llegar al nivel 12, y de nuevo en los niveles 14, 16 y 19, puedes aumentar una puntuación de característica en 2, o dos en 1.' },
          { class_name: 'Guerrero', feature_name: 'Indomable (2)', level_acquired: 13, description: 'A partir del nivel 13, puedes usar Indomable dos veces antes de requerir un descanso largo.' },
          { class_name: 'Guerrero', feature_name: 'Mejora de Característica', level_acquired: 14, description: 'Al llegar al nivel 14, y de nuevo en los niveles 16 y 19, puedes aumentar una puntuación de característica en 2, o dos en 1.' },
          { class_name: 'Guerrero', feature_name: 'Mejora de Característica', level_acquired: 16, description: 'Al llegar al nivel 16, y de nuevo en el nivel 19, puedes aumentar una puntuación de característica en 2, o dos en 1.' },
          { class_name: 'Guerrero', feature_name: 'Acción en Oleada (2)', level_acquired: 17, description: 'A partir del nivel 17, puedes realizar una Acción en Oleada dos veces antes de un descanso corto o largo.' },
          { class_name: 'Guerrero', feature_name: 'Indomable (3)', level_acquired: 17, description: 'A partir del nivel 17, puedes usar Indomable tres veces antes de requerir un descanso largo.' },
          { class_name: 'Guerrero', feature_name: 'Mejora de Característica', level_acquired: 19, description: 'Al llegar al nivel 19, puedes aumentar una puntuación de característica en 2, o dos en 1.' },
          { class_name: 'Guerrero', feature_name: 'Ataque Extra (3)', level_acquired: 20, description: 'Puedes atacar cuatro veces en lugar de tres siempre que realices la acción de Atacar en tu turno.' }
        ]);
        console.log("⚔️ Seeder de rasgos del guerrero insertado (fallback).");

        // Pícaro
        const insertPicaro = db.prepare("INSERT INTO class_features (class_name, feature_name, level_acquired, description) VALUES (?, ?, ?, ?)");
        const transPicaro = db.transaction((features) => {
          for (const f of features) {
            insertPicaro.run(f.class_name, f.feature_name, f.level_acquired, f.description);
          }
        });
        transPicaro([
          { class_name: 'Pícaro', feature_name: 'Pericia', level_acquired: 1, description: 'Elige dos de tus competencias en habilidades, o una competencia en habilidad y tu competencia con herramientas de ladrón. Tu bonificador de competencia se duplica para cualquier prueba de característica que use cualquiera de las competencias elegidas. A nivel 6 eliges dos más.' },
          { class_name: 'Pícaro', feature_name: 'Ataque Furtivo', level_acquired: 1, description: 'Sabes cómo golpear con precisión aprovechando la distracción de un enemigo. Una vez por turno, puedes infligir 1d6 de daño adicional a una criatura que golpees si tienes ventaja en la tirada de ataque. El ataque debe usar un arma sutil o a distancia. No necesitas ventaja si otro enemigo del objetivo está a 5 pies de él, este no está incapacitado y tú no tienes desventaja.' },
          { class_name: 'Pícaro', feature_name: 'Jerga de Ladrones', level_acquired: 1, description: 'Durante tu entrenamiento aprendiste la jerga de ladrones, una mezcla secreta de dialecto, jerga y claves que te permite ocultar mensajes en conversaciones normales. Solo otra criatura que conozca la jerga lo entenderá.' },
          { class_name: 'Pícaro', feature_name: 'Acción Astuta', level_acquired: 2, description: 'A partir del nivel 2, tu agilidad e ingenio te permiten moverte y actuar rápido. Puedes realizar una acción adicional en cada uno de tus turnos en combate. Esta acción solo se puede usar para Correr, Destrabarse o Esconderse.' },
          { class_name: 'Pícaro', feature_name: 'Arquetipo de Pícaro', level_acquired: 3, description: 'En el nivel 3, eliges un arquetipo que emula tus capacidades, como Ladrón o Asesino. Tu elección te otorga rasgos en los niveles 3, 9, 13 y 17.' },
          { class_name: 'Pícaro', feature_name: 'Mejora de Característica', level_acquired: 4, description: 'Al llegar al nivel 4, y de nuevo en los niveles 8, 10, 12, 16 y 19, puedes aumentar una puntuación de característica en 2, o dos en 1. No puedes superar el valor de 20 por este medio.' },
          { class_name: 'Pícaro', feature_name: 'Esquiva Asombrosa', level_acquired: 5, description: 'A partir del nivel 5, cuando un atacante que puedes ver te golpea con un ataque, puedes usar tu reacción para reducir a la mitad el daño que sufres.' },
          { class_name: 'Pícaro', feature_name: 'Pericia', level_acquired: 6, description: 'Puedes elegir otras dos de tus competencias en habilidades (o tu competencia con herramientas de ladrón) para duplicar tu bonificador de competencia.' },
          { class_name: 'Pícaro', feature_name: 'Evasión', level_acquired: 7, description: 'A partir del nivel 7, puedes esquivar ágilmente ciertos efectos de área. Cuando estés sujeto a un efecto que te permita hacer una salvación de Destreza para sufrir solo la mitad del daño, no sufres daño si tienes éxito, y solo la mitad si fallas.' },
          { class_name: 'Pícaro', feature_name: 'Mejora de Característica', level_acquired: 8, description: 'Al llegar al nivel 8, y de nuevo en los niveles 10, 12, 16 y 19, puedes aumentar una puntuación de característica en 2, o dos en 1.' },
          { class_name: 'Pícaro', feature_name: 'Mejora de Característica', level_acquired: 10, description: 'Al llegar al nivel 10, y de nuevo en los niveles 12, 16 y 19, puedes aumentar una puntuación de característica en 2, o dos en 1.' },
          { class_name: 'Pícaro', feature_name: 'Talento Seguro', level_acquired: 11, description: 'En el nivel 11, has perfeccionado tus habilidades elegidas hasta la casi perfección. Siempre que realices una prueba de característica que te permita añadir tu bonificador de competencia, puedes tratar cualquier tirada en el d20 de 9 o menos como si fuera un 10.' },
          { class_name: 'Pícaro', feature_name: 'Mejora de Característica', level_acquired: 12, description: 'Al llegar al nivel 12, y de nuevo en los niveles 16 y 19, puedes aumentar una puntuación de característica en 2, o dos en 1.' },
          { class_name: 'Pícaro', feature_name: 'Sentido Ciego', level_acquired: 14, description: 'A partir del nivel 14, si eres capaz de oír, eres consciente de la ubicación de cualquier criatura invisible o escondida a 10 pies de ti.' },
          { class_name: 'Pícaro', feature_name: 'Mente Escurridiza', level_acquired: 15, description: 'En el nivel 15, adquieres una mayor fuerza mental. Obtienes competencia en las tiradas de salvación de Sabiduría.' },
          { class_name: 'Pícaro', feature_name: 'Mejora de Característica', level_acquired: 16, description: 'Al llegar al nivel 16, y de nuevo en el nivel 19, puedes aumentar una puntuación de característica en 2, o dos en 1.' },
          { class_name: 'Pícaro', feature_name: 'Elusivo', level_acquired: 18, description: 'A partir del nivel 18, eres tan elusivo que los atacantes rara vez ganan ventaja contra ti. Ninguna tirada de ataque tiene ventaja contra ti mientras no estés incapacitado.' },
          { class_name: 'Pícaro', feature_name: 'Mejora de Característica', level_acquired: 19, description: 'Al llegar al nivel 19, puedes aumentar una puntuación de característica en 2, o dos en 1.' },
          { class_name: 'Pícaro', feature_name: 'Golpe de Suerte', level_acquired: 20, description: 'En el nivel 20, tienes un don increíble para tener éxito cuando lo necesitas. Si fallas un ataque contra un objetivo a tu alcance, puedes convertir el fallo en un impacto. O si fallas una prueba de característica, puedes tratar la tirada del d20 como un 20. Se recupera tras descanso corto o largo.' }
        ]);
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