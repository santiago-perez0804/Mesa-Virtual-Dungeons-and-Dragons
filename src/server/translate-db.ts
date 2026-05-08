import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import translate from 'google-translate-api-x';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../vtt_database.db');

let db: Database.Database;
try {
  db = new Database(dbPath);
} catch (error) {
  console.error('Error al abrir la base de datos:', error);
  process.exit(1);
}

async function translateDB() {
  console.log('Iniciando traducción de la base de datos...');

  let items: any[] = [];
  try {
    items = db.prepare('SELECT * FROM content_items').all() as any[];
  } catch (error) {
    console.error('Error al leer content_items:', error);
    return;
  }

  console.log(`Encontrados ${items.length} elementos para procesar.`);

  const updateStmt = db.prepare('UPDATE content_items SET name = ?, data = ? WHERE id = ?');

  let translatedCount = 0;
  let skippedCount = 0;

  for (const item of items) {
    try {
      let data: any;
      try {
        data = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
      } catch (e) {
        console.error(`Error parseando data para item ${item.id} (${item.name}):`, e);
        continue;
      }

      // Chequear si ya fue traducido
      if (data._translated_to_es) {
        skippedCount++;
        continue;
      }

      console.log(`[${translatedCount + skippedCount + 1}/${items.length}] Traduciendo: ${item.name}`);

      let toTranslate = [item.name];
      let hasDesc = false;
      if (data.desc) {
        toTranslate.push(data.desc);
        hasDesc = true;
      } else if (data.description) {
        toTranslate.push(data.description);
        hasDesc = true;
      }

      const res = await translate(toTranslate, { to: 'es' });
      const texts = Array.isArray(res) ? res.map(r => r.text) : [res.text];

      const newName = texts[0];

      if (hasDesc) {
        if (data.desc) data.desc = texts[1];
        else if (data.description) data.description = texts[1];
      }

      // Traducir el tipo (e.g., 'Medium humanoid')
      if (data.type && typeof data.type === 'string') {
        const typeRes = await translate(data.type, { to: 'es' });
        data.type = typeRes.text;
      }

      data._translated_to_es = true;

      updateStmt.run(newName, JSON.stringify(data), item.id);
      translatedCount++;

      // Pausa para evitar rate limits
      await new Promise(resolve => setTimeout(resolve, 400));
    } catch (e: any) {
      console.error(`Error traduciendo ${item.name}:`, e);
      if (e.toString().includes('TooManyRequests') || e.code === 'TOO_MANY_REQUESTS') {
        console.log("Ban de Google Translate o límite alcanzado, deteniendo...");
        break;
      }
    }
  }

  console.log(`\nTraducción completada.`);
  console.log(`- Traducidos: ${translatedCount}`);
  console.log(`- Saltados: ${skippedCount}`);
}

translateDB().catch(err => {
  console.error('Error fatal en translateDB:', err);
});
