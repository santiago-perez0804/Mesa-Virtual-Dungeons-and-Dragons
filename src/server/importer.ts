import db from './db.js';

// 1. Agregamos /v1 al final de la URL base
const API_URL = 'https://api.open5e.com/v1';

async function fetchAndStore(endpoint: string, type: string) {
  console.log(`Importando ${type}...`);
  try {
    const response = await fetch(`${API_URL}/${endpoint}/?format=json`);

    // 2. Verificamos si la respuesta es correcta antes de seguir
    if (!response.ok) {
      throw new Error(`Error en el servidor: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const insert = db.prepare('INSERT INTO content_items (name, type, data, source) VALUES (?, ?, ?, ?)');

    const transaction = db.transaction((items) => {
      for (const item of items) {
        insert.run(item.name, type, JSON.stringify(item), 'srd');
      }
    });

    transaction(data.results);
    console.log(`${type} importados con éxito.`);
  } catch (error) {
    console.error(`Error importando ${type}:`, error);
  }
}

export const runSRDImport = async () => {
  const count = db.prepare('SELECT COUNT(*) as total FROM content_items').get() as { total: number };

  if (count.total === 0) {
    console.log("Iniciando importación inicial del SRD...");
    await fetchAndStore('monsters', 'monster');
    await fetchAndStore('spells', 'spell');
    // Probamos con magicitems que es el estándar del SRD
    await fetchAndStore('magicitems', 'item');
  } else {
    console.log("El SRD ya está cargado en la base de datos.");
  }
};