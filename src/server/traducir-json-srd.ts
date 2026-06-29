import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import translate from 'google-translate-api-x';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JSON_DIR = path.join(__dirname, '../../public/temp_jsons_db');

function loadJson(filename: string): any[] {
  const p = path.join(JSON_DIR, filename);
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function saveJson(filename: string, data: any[]) {
  const p = path.join(JSON_DIR, filename);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Guardado: ${filename}`);
}

function isContainerEntry(item: any): boolean {
  return !item.variant && Array.isArray(item.variants) && item.variants.length > 0;
}

async function translateBatch(texts: string[]): Promise<string[]> {
  if (texts.length === 0) return [];
  const unique = [...new Set(texts.map(t => t?.trim()).filter(Boolean))];
  if (unique.length === 0) return texts.map(() => '');
  const res = await translate(unique, { to: 'es' });
  const arr = Array.isArray(res) ? res : [res];
  const map = new Map<string, string>();
  unique.forEach((orig, i) => map.set(orig, arr[i]?.text ?? orig));
  return texts.map(t => map.get(t?.trim()) ?? t);
}

async function translateMagicItems(items: any[], outFile: string, itemsPerSave = 50) {
  console.log(`\n🔮 Traduciendo ${items.length} objetos mágicos...`);
  let count = 0;
  for (const item of items) {
    if (isContainerEntry(item)) continue;
    if (item._translated_to_es) { count++; continue; }

    const batch: string[] = [];
    const indices: { field: string; idx?: number }[] = [];

    batch.push(item.name);
    indices.push({ field: 'name' });

    // Save attunement flag before translation mutates desc
    if (item.requiresAttunement === undefined) {
      const descText = Array.isArray(item.desc) ? item.desc.join(' ') : (item.desc ?? '');
      item.requiresAttunement = /requires attunement/i.test(descText);
    }

    if (item.desc?.length) {
      for (let i = 0; i < item.desc.length; i++) {
        batch.push(item.desc[i]);
        indices.push({ field: 'desc', idx: i });
      }
    }

    if (item.rarity?.name) {
      batch.push(item.rarity.name);
      indices.push({ field: 'rarity' });
    }

    if (item.equipment_category?.name) {
      batch.push(item.equipment_category.name);
      indices.push({ field: 'category' });
    }

    if (batch.length === 0) continue;

    try {
      const translated = await translateBatch(batch);
      let ti = 0;
      for (const entry of indices) {
        if (entry.field === 'name') item.name = translated[ti++];
        else if (entry.field === 'desc') item.desc[entry.idx!] = translated[ti++];
        else if (entry.field === 'rarity') item.rarity.name = translated[ti++];
        else if (entry.field === 'category') item.equipment_category.name = translated[ti++];
      }
      item._translated_to_es = true;
      count++;
      if (count % itemsPerSave === 0) {
        console.log(`  💾 ${count}/${items.length} — guardando progreso...`);
        saveJson(outFile, items);
      }
      if (count % 20 === 0) console.log(`  ${count}/${items.length} objetos traducidos...`);
      await new Promise(r => setTimeout(r, 200));
    } catch (e: any) {
      if (e.toString().includes('TooManyRequests')) {
        console.warn('  ⚠️ Rate limit, esperando 5s...');
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }
      console.error(`  ❌ Error traduciendo "${item.name}":`, e.message);
    }
  }
  console.log(`  ✅ ${count} objetos traducidos exitosamente`);
}

async function translateMonsters(items: any[], outFile: string, itemsPerSave = 50) {
  console.log(`\n👹 Traduciendo ${items.length} monstruos...`);
  let count = 0;
  for (const item of items) {
    if (item._translated_to_es) { count++; continue; }
    const batch: string[] = [];
    const indices: { field: string; idx?: number; sub?: string }[] = [];

    batch.push(item.name);
    indices.push({ field: 'name' });

    if (item.type) {
      batch.push(item.type);
      indices.push({ field: 'type' });
    }

    if (item.alignment) {
      batch.push(item.alignment);
      indices.push({ field: 'alignment' });
    }

    if (item.languages) {
      batch.push(item.languages);
      indices.push({ field: 'languages' });
    }

    if (item.size) {
      batch.push(item.size);
      indices.push({ field: 'size' });
    }

    for (const arrName of ['special_abilities', 'actions', 'legendary_actions']) {
      const arr = item[arrName];
      if (Array.isArray(arr)) {
        for (let i = 0; i < arr.length; i++) {
          const raw = arr[i];
          if (typeof raw === 'string' && raw.startsWith('@{')) {
            const parsed = parseAtNotation(raw);
            arr[i] = parsed;
            if (parsed.name) { batch.push(parsed.name); indices.push({ field: arrName, idx: i, sub: 'name' }); }
            if (parsed.desc) { batch.push(parsed.desc); indices.push({ field: arrName, idx: i, sub: 'desc' }); }
          } else if (typeof raw === 'object' && raw) {
            if (raw.name) { batch.push(raw.name); indices.push({ field: arrName, idx: i, sub: 'name' }); }
            if (raw.desc) { batch.push(raw.desc); indices.push({ field: arrName, idx: i, sub: 'desc' }); }
          }
        }
      }
    }

    if (batch.length === 0) continue;

    try {
      const translated = await translateBatch(batch);
      let ti = 0;
      for (const entry of indices) {
        const val = translated[ti++];
        if (entry.field === 'name') item.name = val;
        else if (entry.field === 'type') item.type = val;
        else if (entry.field === 'alignment') item.alignment = val;
        else if (entry.field === 'languages') item.languages = val;
        else if (entry.field === 'size') item.size = val;
        else if (entry.sub && item[entry.field]?.[entry.idx!]) {
          item[entry.field][entry.idx!][entry.sub] = val;
        }
      }
      item._translated_to_es = true;
      count++;
      if (count % itemsPerSave === 0) {
        console.log(`  💾 ${count}/${items.length} — guardando progreso...`);
        saveJson(outFile, items);
      }
      if (count % 20 === 0) console.log(`  ${count}/${items.length} monstruos traducidos...`);
      await new Promise(r => setTimeout(r, 200));
    } catch (e: any) {
      if (e.toString().includes('TooManyRequests')) {
        console.warn('  ⚠️ Rate limit, esperando 5s...');
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }
      console.error(`  ❌ Error traduciendo "${item.name}":`, e.message);
    }
  }
  console.log(`  ✅ ${count} monstruos traducidos exitosamente`);
}

function parseAtNotation(str: string): any {
  const obj: any = {};
  const inner = str.replace(/^@\{/, '').replace(/\}$/, '');
  const pairs = splitTopLevel(inner);
  for (const pair of pairs) {
    const eqIdx = pair.indexOf('=');
    if (eqIdx === -1) continue;
    const key = pair.slice(0, eqIdx).trim();
    let val: any = pair.slice(eqIdx + 1).trim();
    if (val.startsWith('@{')) val = parseAtNotation(val);
    obj[key] = val;
  }
  return obj;
}

function splitTopLevel(str: string): string[] {
  const result: string[] = [];
  let depth = 0;
  let current = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '@' && str.slice(i, i + 2) === '@{') { depth++; current += '@{'; i++; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    if (ch === ';' && depth === 0) { result.push(current.trim()); current = ''; continue; }
    current += ch;
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

async function translateSpells(items: any[]) {
  console.log(`\n📜 ${items.length} conjuros ya están en español. Saltando traducción.`);
  for (const item of items) item._translated_to_es = true;
}

async function main() {
  const files = [
    { file: '5e-SRD-Magic-Items.json', type: 'magic-items' },
    { file: '5e-SRD-Monsters.json', type: 'monsters' },
    { file: '5e-SRD-Spells.json', type: 'spells' },
  ];

  for (const { file, type } of files) {
    const esFile = file.replace('.json', '_es.json');
    const esPath = path.join(JSON_DIR, esFile);

    console.log(`\n═══════════════════════════════════`);
    console.log(`📂 Procesando: ${file}`);

    let items: any[];
    if (fs.existsSync(esPath)) {
      items = loadJson(esFile);
      console.log(`   Reanudando: ${items.length} registros (${items.filter((i: any) => i._translated_to_es).length} ya traducidos)`);
    } else {
      items = loadJson(file);
      console.log(`   ${items.length} registros cargados.`);
    }

    if (type === 'magic-items') {
      const realItems = items.filter((i: any) => !isContainerEntry(i));
      console.log(`   (${items.length - realItems.length} contenedores omitidos / ya filtrados)`);
      await translateMagicItems(realItems, esFile);
      saveJson(esFile, items);
    } else if (type === 'monsters') {
      await translateMonsters(items, esFile);
      saveJson(esFile, items);
    } else if (type === 'spells') {
      await translateSpells(items);
      saveJson(esFile, items);
    }
  }

  console.log(`\n✨ TRADUCCIÓN COMPLETADA`);
}

main().catch(e => console.error('Error fatal:', e));
