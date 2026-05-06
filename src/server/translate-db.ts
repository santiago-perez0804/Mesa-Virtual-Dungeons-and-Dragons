import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import translate from 'google-translate-api-x';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../vtt_database.db');
const db = new Database(dbPath);

async function translateDB() {
  console.log('Iniciando traducción de la base de datos...');
  const items = db.prepare('SELECT * FROM content_items').all() as any[];

  console.log(`Encontrados ${items.length} elementos para traducir.`);

  const updateStmt = db.prepare('UPDATE content_items SET name = ?, data = ? WHERE id = ?');

  let translatedCount = 0;
  for (const item of items) {
    try {
      const data = JSON.parse(item.data);

      // Chequear si ya fue traducido (usando un flag custom que le pondremos)
      if (data._translated_to_es) {
        console.log(`Saltando ${item.name} (ya traducido)`);
        continue;
      }

      console.log(`Traduciendo: ${item.name} (${translatedCount}/${items.length})`);

      let toTranslate = [item.name];
      if (data.desc) toTranslate.push(data.desc);
      else if (data.description) toTranslate.push(data.description);

      const res = await translate(toTranslate, { to: 'es' });

      // google-translate-api-x maneja array si le pasas array
      // pero si solo hay 1 elemento, puede devolver un solo objeto.
      const texts = Array.isArray(res) ? res.map(r => r.text) : [res.text];

      const newName = texts[0];

      if (data.desc) data.desc = texts[1];
      else if (data.description) data.description = texts[1];

      // Traducir el tipo (e.g., 'Medium humanoid')
      if (data.type && typeof data.type === 'string') {
        const typeRes = await translate(data.type, { to: 'es' });
        data.type = typeRes.text;
      }

      data._translated_to_es = true;

      updateStmt.run(newName, JSON.stringify(data), item.id);
      translatedCount++;

      // Pausa para evitar rate limits
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (e) {
      console.error(`Error traduciendo ${item.name}:`, e);
      // Romper el loop si hay ban de IP
      if (e.toString().includes('TooManyRequests')) {
        console.log("Ban de Google Translate, deteniendo...");
        break;
      }
    }
  }

  console.log(`Traducción completada. Se tradujeron ${translatedCount} elementos.`);
}

translateDB().catch(console.error);
