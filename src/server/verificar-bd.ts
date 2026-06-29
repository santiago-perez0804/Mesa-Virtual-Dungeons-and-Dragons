import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  let db: any = null;
  try {
    const { default: Database } = await import('better-sqlite3');
    const dbPath = path.join(__dirname, '../../vtt_database.bd');
    db = new Database(dbPath);
  } catch (e: any) {
    console.error('❌ No se pudo conectar:', e.message);
    process.exit(1);
  }

  console.log('═══════════════════════════════════');
  console.log('🔍 VERIFICACIÓN DE BASE DE DATOS');
  console.log('═══════════════════════════════════\n');

  // Total counts
  const total = db.prepare('SELECT COUNT(*) as cnt FROM content_items').get();
  console.log(`📊 Total content_items: ${total.cnt}`);

  // By type
  const byType = db.prepare('SELECT type, COUNT(*) as cnt FROM content_items GROUP BY type ORDER BY type').all();
  console.log('\n📂 Por tipo:');
  for (const t of byType) {
    console.log(`  ${t.type.padEnd(15)} ${t.cnt}`);
  }

  // By source
  const bySource = db.prepare('SELECT source, COUNT(*) as cnt FROM content_items GROUP BY source ORDER BY source').all();
  console.log('\n📂 Por fuente:');
  for (const s of bySource) {
    console.log(`  ${s.source.padEnd(15)} ${s.cnt}`);
  }

  // By book_id
  const byBook = db.prepare('SELECT book_id, COUNT(*) as cnt FROM content_items GROUP BY book_id ORDER BY book_id').all();
  console.log('\n📂 Por libro (book_id):');
  for (const b of byBook) {
    console.log(`  book_id=${b.book_id}`.padEnd(25) + ` ${b.cnt}`);
  }

  // Sample items
  console.log('\n📝 Muestras:');
  for (const type of ['item', 'monster', 'spell']) {
    const samples = db.prepare('SELECT id, name, source FROM content_items WHERE type = ? LIMIT 5').all(type);
    if (samples.length > 0) {
      console.log(`\n  --- ${type.toUpperCase()} (primeros ${samples.length}) ---`);
      for (const s of samples) {
        console.log(`    [${s.id}] ${s.name} (${s.source})`);
      }
    }
  }

  // Check data JSON validity
  console.log('\n🔎 Verificando integridad del JSON data...');
  const allItems = db.prepare('SELECT id, name, type, data FROM content_items').all();
  let badJson = 0;
  for (const item of allItems) {
    try {
      JSON.parse(item.data);
    } catch {
      console.log(`  ❌ [${item.id}] ${item.name} (${item.type}): data no es JSON válido`);
      badJson++;
    }
  }
  if (badJson === 0) {
    console.log('  ✅ Todos los registros tienen data JSON válido');
  } else {
    console.log(`  ⚠️ ${badJson} registros con data inválido`);
  }

  // Detect English content (approximate check)
  console.log('\n🔎 Detectando contenido en inglés...');
  const potentialEnglish = allItems.filter((item: any) => {
    try {
      const data = JSON.parse(item.data);
      const desc = data.desc ?? data.description ?? '';
      const text = Array.isArray(desc) ? desc.join(' ') : String(desc);
      return /the |a |an |is |are |has |have |this |that /i.test(text.slice(0, 100));
    } catch { return false; }
  });
  console.log(`  ${potentialEnglish.length} registros con posible contenido en inglés`);
  if (potentialEnglish.length > 0) {
    for (const item of potentialEnglish.slice(0, 5)) {
      console.log(`    [${item.id}] ${item.name} (${item.type})`);
    }
  }

  // Check attunement
  console.log('\n🔎 Objetos con sintonización (requiresAttunement):');
  const itemsAtt = db.prepare('SELECT id, name, data FROM content_items WHERE type = ?').all('item');
  let attCount = 0;
  for (const item of itemsAtt) {
    try {
      const data = JSON.parse(item.data);
      if (data.requiresAttunement) {
        attCount++;
      }
    } catch {}
  }
  console.log(`  ${attCount}/${itemsAtt.length} objetos requieren sintonización`);

  db.close();
  console.log('\n✅ VERIFICACIÓN COMPLETADA');
}

main().catch(e => console.error('Error:', e));
