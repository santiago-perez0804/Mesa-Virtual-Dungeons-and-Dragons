import db from './bd.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_BASE = 'https://api.open5e.com/v1';

/**
 * Función genérica para descargar datos de la API de Open5e con paginación.
 */
async function fetchAll(endpoint: string, type: string): Promise<void> {
  let nextUrl: string | null = `${API_BASE}/${endpoint}/?format=json`;
  let totalImported = 0;

  console.log(`🚀 Iniciando descarga masiva de ${type}s...`);

  while (nextUrl) {
    try {
      // Tipamos explícitamente para evitar el error ts(7022)
      const response: Response = await fetch(nextUrl);
      if (!response.ok) throw new Error(`Error en la API: ${response.statusText}`);

      const data: any = await response.json();

      const insert = db.prepare('INSERT INTO content_items (name, type, data, source) VALUES (?, ?, ?, ?)');

      const transaction = db.transaction((items: any[]) => {
        for (const item of items) {
          // Si el nombre falla, usamos el slug o un fallback string
          const safeName: string = item.name ?? item.slug ?? 'Sin Nombre';
          insert.run(safeName, type, JSON.stringify(item), 'srd');
        }
      });

      transaction(data.results);

      totalImported += data.results.length;
      console.log(`📦 ${type}: ${totalImported} procesados...`);

      nextUrl = data.next;
    } catch (error) {
      console.error(`❌ Error fatal importando ${type}:`, error);
      nextUrl = null;
    }
  }
}

/**
 * Orquestador de la importación del SRD.
 * Borrá cualquier otra versión de esta función que tengas en el archivo.
 */
export const runFullImport = async (): Promise<void> => {
  try {
    const check = db.prepare('SELECT COUNT(*) as total FROM content_items').get() as { total: number };

    if (check && check.total > 10) {
      console.log("⚠️ La base de datos ya tiene contenido. Saltando descarga.");
      return;
    }

    const seedPath = path.join(__dirname, 'semillas/compendio_semilla.json');
    let imported = false;

    if (fs.existsSync(seedPath)) {
      try {
        console.log("🌱 Detectada semilla JSON. Importando compendio traducido (monstruos, hechizos, ítems)...");
        const semilla = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
        
        if (semilla.content_items && semilla.content_items.length > 0) {
          const insert = db.prepare('INSERT INTO content_items (name, type, data, source) VALUES (?, ?, ?, ?)');
          const transaction = db.transaction((items: any[]) => {
            for (const item of items) {
              insert.run(item.name, item.type, item.data, item.source);
            }
          });
          transaction(semilla.content_items);
          console.log(`✅ Se importaron ${semilla.content_items.length} elementos de compendio desde la semilla JSON.`);
          imported = true;
        }
      } catch (err) {
        console.error("❌ Error importando semilla JSON para content_items:", err);
      }
    }

    if (!imported) {
      console.log("🛠️ Semilla JSON no encontrada o vacía. Iniciando descarga del SRD oficial desde Open5e...");
      await fetchAll('monsters', 'monster');
      await fetchAll('spells', 'spell');
      await fetchAll('magicitems', 'item');
    }

    console.log("✨ PROCESO FINALIZADO: Datos listos.");
  } catch (error) {
    console.error("❌ Falló la inicialización del seeder:", error);
  }
};