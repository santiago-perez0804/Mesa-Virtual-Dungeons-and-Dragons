/**
 * migrate-traits.js
 * 
 * Script para migrar, limpiar y unificar rasgos de clases a español.
 * 1. Elimina rasgos en inglés (barbarian, fighter, rogue) de 'class_features'.
 * 2. Renombra el rasgo 'Rabia' a 'Furia' en la clase 'Bárbaro' de 'content_items'.
 * 3. Extrae todos los rasgos de las 11 clases oficiales en 'content_items' y los siembra en 'class_features'.
 */

import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../vtt_database.bd');

const db = new Database(dbPath);

console.log("🛠️  Iniciando Migración y Unificación de Rasgos...");

try {
  // 1. Eliminar rasgos viejos en inglés
  const delEnglish = db.prepare("DELETE FROM class_features WHERE class_name IN ('barbarian', 'fighter', 'rogue')").run();
  console.log(`🧹 Eliminados ${delEnglish.changes} rasgos antiguos en inglés de 'class_features'.`);

  // 2. Renombrar 'Rabia' a 'Furia' en la clase Bárbaro
  const barbaroRow = db.prepare("SELECT id, name, data FROM content_items WHERE type = 'class' AND (name = 'Bárbaro' OR name = 'Barbaro')").get();

  if (barbaroRow) {
    let data;
    try {
      data = JSON.parse(barbaroRow.data);
    } catch {
      data = {};
    }

    let modified = false;

    // Renombrar en traits array
    if (Array.isArray(data.traits)) {
      data.traits = data.traits.map(t => {
        if (t.name === 'Rabia') {
          console.log("🦁 Renombrando trait 'Rabia' a 'Furia' en el array de rasgos del Bárbaro.");
          t.name = 'Furia';
          modified = true;
        }
        return t;
      });
    }

    // Renombrar en tabla markdown
    if (typeof data.table === 'string' && data.table.includes('Rabia')) {
      console.log("🦁 Renombrando 'Rabia' a 'Furia' en la tabla de progresión del Bárbaro.");
      data.table = data.table.replace(/Rabia/g, 'Furia');
      modified = true;
    }

    if (modified) {
      db.prepare("UPDATE content_items SET data = ? WHERE id = ?").run(JSON.stringify(data), barbaroRow.id);
      console.log("✅ Clase Bárbaro actualizada en 'content_items' con 'Furia'.");
    }
  } else {
    console.log("⚠️  No se encontró la clase Bárbaro en 'content_items' para renombrar 'Rabia'.");
  }

  // 3. Extraer rasgos de las clases y sembrar en class_features
  const classes = db.prepare("SELECT id, name, data FROM content_items WHERE type = 'class'").all();
  console.log(`📖 Leyendo ${classes.length} clases de 'content_items'...`);

  let featuresInserted = 0;
  let featuresUpdated = 0;

  for (const cls of classes) {
    let cData;
    try {
      cData = JSON.parse(cls.data);
    } catch {
      cData = {};
    }

    const traits = cData.traits || [];
    if (traits.length === 0) continue;

    console.log(`   👉 Procesando ${traits.length} rasgos para la clase '${cls.name}'...`);

    for (const t of traits) {
      const traitName = t.name;
      const desc = t.desc || t.description || '';
      const shortDesc = t.short_description || '';
      const level = parseInt(t.level) || 1;

      // Buscar si ya existe por nombre, clase y nivel
      const existing = db.prepare("SELECT id FROM class_features WHERE LOWER(class_name) = LOWER(?) AND LOWER(feature_name) = LOWER(?) AND level_acquired = ?")
        .get(cls.name, traitName, level);

      if (existing) {
        db.prepare("UPDATE class_features SET class_name = ?, feature_name = ?, description = ?, short_description = ? WHERE id = ?")
          .run(cls.name, traitName, desc, shortDesc, existing.id);
        featuresUpdated++;
      } else {
        db.prepare("INSERT INTO class_features (class_name, feature_name, level_acquired, description, short_description) VALUES (?, ?, ?, ?, ?)")
          .run(cls.name, traitName, level, desc, shortDesc);
        featuresInserted++;
      }
    }
  }

  console.log(`\n✨ MIGRACIÓN TERMINADA EXITOSAMENTE:`);
  console.log(`   ➕ Rasgos Insertados: ${featuresInserted}`);
  console.log(`   🔄 Rasgos Actualizados: ${featuresUpdated}`);

} catch (err) {
  console.error("❌ Error en la migración:", err.message);
  process.exit(1);
}
