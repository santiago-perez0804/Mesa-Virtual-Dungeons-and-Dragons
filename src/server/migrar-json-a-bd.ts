import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JSON_DIR = path.join(__dirname, '../../public/temp_jsons_db');

// ─── DB connection ───
let db: any = null;
async function getDb(): Promise<any> {
  if (db) return db;
  try {
    const { default: Database } = await import('better-sqlite3');
    const dbPath = path.join(__dirname, '../../vtt_database.bd');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    return db;
  } catch (e: any) {
    console.error('❌ No se pudo conectar a la base de datos:', e.message);
    process.exit(1);
  }
}

// ─── Helpers ───
function loadJson(filename: string): any[] {
  const p = path.join(JSON_DIR, filename);
  if (!fs.existsSync(p)) { console.warn(`⚠️ No existe: ${filename}`); return []; }
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function safeStr(v: any, fallback = ''): string {
  if (v === null || v === undefined) return fallback;
  return String(v);
}

function parseAC(ac: any): number {
  if (typeof ac === 'number') return ac;
  if (Array.isArray(ac)) {
    for (const entry of ac) {
      if (typeof entry === 'object' && entry?.value) return Number(entry.value);
      if (typeof entry === 'string') {
        const m = entry.match(/value\s*=\s*(\d+)/);
        if (m) return Number(m[1]);
      }
    }
    const first = ac[0];
    if (typeof first === 'object' && first) {
      if (first.value) return Number(first.value);
    }
    return 10;
  }
  if (typeof ac === 'object' && ac) {
    if (ac.value) return Number(ac.value);
    return 10;
  }
  return 10;
}

function parseACDisplay(ac: any): string {
  if (typeof ac === 'number') return String(ac);
  if (Array.isArray(ac)) {
    return ac.map((a: any) => {
      if (typeof a === 'object' && a) return `${a.value ?? '?'}${a.type ? ` (${a.type})` : ''}`;
      if (typeof a === 'string') {
        const m = a.match(/value\s*=\s*(\d+)/);
        const t = a.match(/type\s*=\s*(\w+)/);
        return m ? `${m[1]}${t ? ` (${t[1]})` : ''}` : a;
      }
      return String(a);
    }).join(', ');
  }
  if (typeof ac === 'object' && ac) return `${ac.value}${ac.type ? ` (${ac.type})` : ''}`;
  return String(ac ?? '10');
}

function parseSpeed(speed: any): string {
  if (!speed) return '30 ft.';
  if (typeof speed === 'string') return speed;
  if (typeof speed === 'object') {
    return Object.entries(speed)
      .map(([k, v]) => `${k} ${v}`)
      .join(', ');
  }
  return '30 ft.';
}

function cleanActions(arr: any[]): any[] {
  if (!Array.isArray(arr)) return [];
  return arr.map((a: any) => {
    if (typeof a === 'string' && a.startsWith('@{')) {
      try {
        const parsed = parseAtNotation(a);
        const name = parsed.name ?? '';
        const desc = parsed.desc ?? '';
        const attackBonus = parsed.attack_bonus ?? parsed.attackBonus ?? '';
        const dc = parsed.dc ?? '';
        const damage = parsed.damage ?? '';
        let damageFormula = '';
        let damageType = '';
        if (Array.isArray(damage)) {
          const dmgObj = damage[0];
          if (typeof dmgObj === 'object' && dmgObj) {
            damageFormula = dmgObj.damage_dice ?? dmgObj.damage_bonus ?? '';
            damageType = dmgObj.damage_type?.name ?? '';
          }
        } else if (typeof damage === 'string') {
          damageFormula = damage;
        }
        return { name, desc, attackBonus, dc, damageFormula, damageType, isAttack: !!attackBonus };
      } catch { return { name: a, desc: '' }; }
    }
    if (typeof a === 'object' && a) return a;
    return { name: String(a), desc: '' };
  });
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
    if (typeof val === 'string' && val.startsWith('@{')) val = parseAtNotation(val);
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

function detectAttunement(desc: any): boolean {
  if (!desc) return false;
  const text = Array.isArray(desc) ? desc.join(' ') : String(desc);
  return /requires attunement|requires attunment|requiere sintonizaci(o|ó)n/i.test(text);
}

function isValidNum(v: any): boolean {
  if (v === null || v === undefined) return false;
  const n = Number(v);
  return !isNaN(n);
}

// ─── Migrators ───

function migrateMagicItems(items: any[]) {
  const insert = db.prepare(
    'INSERT OR IGNORE INTO content_items (name, type, data, source, book_id) VALUES (?, ?, ?, ?, 1)'
  );
  let count = 0;
  let skipped = 0;

  const transaction = db.transaction(() => {
    for (const item of items) {
      if (!item.variant && Array.isArray(item.variants) && item.variants.length > 0) {
        skipped++;
        continue;
      }
      if (item.variant === false && Array.isArray(item.variants) && item.variants.length > 0) {
        skipped++;
        continue;
      }

      const data: any = {};

      data.rarity = item.rarity?.name ?? 'Común';
      data.equipment_category = item.equipment_category ? { name: item.equipment_category.name } : undefined;
      data.desc = item.desc ?? [];
      data.requiresAttunement = item.requiresAttunement === undefined ? detectAttunement(item.desc) : !!item.requiresAttunement;

      insert.run(
        item.name ?? 'Sin nombre',
        'item',
        JSON.stringify(data),
        'srd'
      );
      count++;
    }
  });

  transaction();
  return { count, skipped };
}

function migrateMonsters(items: any[]) {
  // Limpiar monstruos SRD existentes para evitar duplicados con el seed anterior
  db.prepare("DELETE FROM content_items WHERE type = 'monster' AND source = 'srd'").run();

  const insert = db.prepare(
    'INSERT OR IGNORE INTO content_items (name, type, data, source, book_id) VALUES (?, ?, ?, ?, 1)'
  );
  let count = 0;

  const transaction = db.transaction(() => {
    for (const item of items) {
      const data: any = {};

      data.size = item.size ?? 'Mediano';
      data.type = item.type ?? '';
      data.alignment = item.alignment ?? '';
      data.hit_points = item.hit_points ?? item.hp ?? 10;
      data.hit_dice = item.hit_dice ?? '';
      data.armor_class = parseAC(item.armor_class);
      data.armor_class_display = parseACDisplay(item.armor_class);
      data.speed = parseSpeed(item.speed);
      data.strength = item.strength ?? 10;
      data.dexterity = item.dexterity ?? 10;
      data.constitution = item.constitution ?? 10;
      data.intelligence = item.intelligence ?? 10;
      data.wisdom = item.wisdom ?? 10;
      data.charisma = item.charisma ?? 10;
      data.challenge_rating = item.challenge_rating ?? item.cr ?? '?';
      data.xp = item.xp ?? 0;
      data.proficiency_bonus = item.proficiency_bonus ?? 0;
      data.languages = item.languages ?? '';
      data.senses = item.senses ?? {};
      data.damage_vulnerabilities = item.damage_vulnerabilities ?? [];
      data.damage_resistances = item.damage_resistances ?? [];
      data.damage_immunities = item.damage_immunities ?? [];
      data.condition_immunities = item.condition_immunities ?? [];
      data.special_abilities = cleanActions(item.special_abilities);
      data.actions = cleanActions(item.actions);
      data.legendary_actions = cleanActions(item.legendary_actions);
      data.image = item.image ?? '';

      insert.run(
        item.name ?? 'Sin nombre',
        'monster',
        JSON.stringify(data),
        'srd'
      );
      count++;
    }
  });

  transaction();
  return { count };
}

function migrateSpells(items: any[]) {
  const insert = db.prepare(
    'INSERT OR IGNORE INTO content_items (name, type, data, source, book_id) VALUES (?, ?, ?, ?, 1)'
  );
  let count = 0;

  const transaction = db.transaction(() => {
    for (const item of items) {
      const data: any = {};

      data.level = item.level ?? 0;
      data.school = item.school ? { name: item.school.name } : undefined;
      data.components = item.components ?? [];
      data.material = item.material ?? '';
      data.ritual = !!item.ritual;
      data.concentration = !!item.concentration;
      data.casting_time = item.casting_time ?? '1 acción';
      data.range = item.range ?? 'Toque';
      data.duration = item.duration ?? 'Instantáneo';
      data.desc = item.desc ?? [];
      data.higher_level = item.higher_level ?? [];
      data.attack_type = item.attack_type ?? '';
      data.damage = item.damage ?? undefined;
      data.classes = item.classes ?? [];
      data.subclasses = item.subclasses ?? [];

      insert.run(
        item.name ?? 'Sin nombre',
        'spell',
        JSON.stringify(data),
        'srd'
      );
      count++;
    }
  });

  transaction();
  return { count };
}

// ─── Main ───

async function main() {
  const db = await getDb();

  console.log('═══════════════════════════════════');
  console.log('🚀 MIGRACIÓN SRD → BASE DE DATOS');
  console.log('═══════════════════════════════════');

  // 1. Magic Items
  let items = loadJson('5e-SRD-Magic-Items_es.json');
  if (items.length === 0) items = loadJson('5e-SRD-Magic-Items.json');
  if (items.length > 0) {
    console.log(`\n📦 Migrando ${items.length} objetos mágicos...`);
    const result = migrateMagicItems(items);
    console.log(`   ✅ ${result.count} insertados, ${result.skipped} contenedores omitidos`);
  } else {
    console.log('⚠️ No se encontró archivo de objetos mágicos');
  }

  // 2. Monsters
  items = loadJson('5e-SRD-Monsters_es.json');
  if (items.length === 0) items = loadJson('5e-SRD-Monsters.json');
  if (items.length > 0) {
    console.log(`\n📦 Migrando ${items.length} monstruos...`);
    const result = migrateMonsters(items);
    console.log(`   ✅ ${result.count} insertados`);
  } else {
    console.log('⚠️ No se encontró archivo de monstruos');
  }

  // 3. Spells
  items = loadJson('5e-SRD-Spells_es.json');
  if (items.length === 0) items = loadJson('5e-SRD-Spells.json');
  if (items.length > 0) {
    console.log(`\n📦 Migrando ${items.length} conjuros...`);
    const result = migrateSpells(items);
    console.log(`   ✅ ${result.count} insertados`);
  } else {
    console.log('⚠️ No se encontró archivo de conjuros');
  }

  console.log(`\n✅ MIGRACIÓN COMPLETADA`);
}

main().catch(e => console.error('Error fatal:', e));
