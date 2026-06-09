import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root path database
const dbPath = path.join(__dirname, '../vtt_database.bd');

console.log(`🔌 Abriendo base de datos para exportación en: ${dbPath}`);

if (!fs.existsSync(dbPath)) {
  console.error('❌ Error: No se encontró la base de datos vtt_database.bd en la raíz.');
  process.exit(1);
}

try {
  const db = new Database(dbPath);

  // Obtener items de compendio
  console.log('📦 Obteniendo datos de content_items...');
  const contentItems = db.prepare('SELECT name, type, data, source FROM content_items').all();
  console.log(`   Encontrados ${contentItems.length} elementos.`);

  // Obtener rasgos de clase
  console.log('⚔️ Obteniendo datos de class_features...');
  const classFeatures = db.prepare('SELECT class_name, feature_name, level_acquired, description, short_description FROM class_features').all();
  console.log(`   Encontrados ${classFeatures.length} rasgos.`);

  const semilla = {
    content_items: contentItems,
    class_features: classFeatures
  };

  const outputPath = path.join(__dirname, '../src/server/semillas/compendio_semilla.json');
  
  // Asegurar que la carpeta semillas exista
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  fs.writeFileSync(outputPath, JSON.stringify(semilla, null, 2), 'utf-8');
  console.log(`\n🌱 Semilla guardada correctamente en: ${outputPath}`);
  console.log('✅ ¡Exportación completada con éxito!');
  
  db.close();
} catch (error) {
  console.error('❌ Ocurrió un error al exportar la base de datos:', error);
  process.exit(1);
}
