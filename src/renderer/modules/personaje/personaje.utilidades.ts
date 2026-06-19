import { skillList } from './personaje.constantes';

const normalizeText = (value: string) => value
  .toLowerCase()
  .replace(/\u00c3\u00a1/g, 'a')
  .replace(/\u00c3\u00a9/g, 'e')
  .replace(/\u00c3\u00ad/g, 'i')
  .replace(/\u00c3\u00b3/g, 'o')
  .replace(/\u00c3\u00ba/g, 'u')
  .replace(/\u00c3\u00b1/g, 'n')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

export const mapEnglishStatToSpanish = (engStat: string): string => {
  const mapping: Record<string, string> = {
    str: 'fue',
    dex: 'dex',
    con: 'con',
    int: 'int',
    wis: 'sab',
    cha: 'car'
  };
  return mapping[engStat.toLowerCase()] || engStat.toLowerCase();
};

export const mapSpanishNameToKey = (name: string): string => {
  const normalizedName = normalizeText(name.trim());
  const mapping: Record<string, string> = {
    'fuerza': 'fue',
    'destreza': 'dex',
    'constitucion': 'con',
    'inteligencia': 'int',
    'sabiduria': 'sab',
    'carisma': 'car'
  };
  return mapping[normalizedName] || normalizedName;
};

export const parseHitDie = (val: any): number => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const cleaned = val.toLowerCase().replace('d', '').trim();
    const num = parseInt(cleaned, 10);
    if (!isNaN(num)) return num;
  }
  return 8;
};

export const getSkillsOptionsAndLimit = (profSkillsStr: string, name: string) => {
  let limit = 2;
  let allowed = skillList;

  if (!profSkillsStr) {
    return { limit, allowed };
  }

  const matchLimit = profSkillsStr.match(/(?:elige|choose|select)\s+(\d+)/i);
  if (matchLimit && matchLimit[1]) {
    limit = parseInt(matchLimit[1], 10);
  } else if (name === 'Bardo' || name === 'Explorador') {
    limit = 3;
  } else if (normalizeText(name) === 'picaro') {
    limit = 4;
  }

  const normalizedProfSkills = normalizeText(profSkillsStr);
  if (normalizedProfSkills.includes("todas") || normalizedProfSkills.includes("any")) {
    allowed = skillList;
  } else {
    allowed = skillList.filter(s => {
      const normSkill = normalizeText(s);
      const normStr = normalizedProfSkills;

      if (normStr.includes(normSkill)) return true;
      if (normSkill === 'interpretacion' && (normStr.includes('interpretacion') || normStr.includes('actuacion'))) return true;
      if (normSkill === 'percepcion' && normStr.includes('percepcion')) return true;
      if (normSkill === 'intuicion' && (normStr.includes('intuicion') || normStr.includes('perspicacia'))) return true;
      if (normSkill === 'investigacion' && normStr.includes('investigacion')) return true;
      if (normSkill === 'religion' && normStr.includes('religion')) return true;
      if (normSkill === 'engano' && normStr.includes('engano')) return true;
      return false;
    });

    if (allowed.length === 0) {
      allowed = skillList;
    }
  }

  return { limit, allowed };
};

export const getPointCost = (val: number) => {
  if (val <= 8) return 0;
  if (val === 9) return 1;
  if (val === 10) return 2;
  if (val === 11) return 3;
  if (val === 12) return 4;
  if (val === 13) return 5;
  if (val === 14) return 7;
  if (val === 15) return 9;
  return 0; // Fuera del rango de creación
};

export const calcMod = (val: number) => Math.floor((val - 10) / 2);
export const getModStr = (val: number) => {
  const mod = calcMod(val);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

export const getProficiencyBonus = (level: number) => {
  if (level <= 4) return 2;
  if (level <= 8) return 3;
  if (level <= 12) return 4;
  if (level <= 16) return 5;
  return 6;
};

// Helpers de Parseo Seguro de JSON para prevenir double-serialization o spreads corruptos
export function safeParseJSON(field: any, defaultVal: any): any {
  if (!field) return defaultVal;
  let parsed = field;
  try {
    while (typeof parsed === 'string') {
      const nextParsed = JSON.parse(parsed);
      if (nextParsed === parsed) break;
      parsed = nextParsed;
    }
  } catch (e) { }

  if (parsed && typeof parsed === 'object') {
    if (parsed["0"] !== undefined && parsed["1"] !== undefined) {
      try {
        let reconstructedStr = "";
        let idx = 0;
        while (parsed[idx] !== undefined) {
          reconstructedStr += parsed[idx];
          idx++;
        }
        let recovered = JSON.parse(reconstructedStr);
        while (typeof recovered === 'string') {
          recovered = JSON.parse(recovered);
        }
        if (recovered && typeof recovered === 'object') {
          parsed = recovered;
        }
      } catch (e) {
        console.error("Error recovering corrupted spread JSON:", e);
      }
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return defaultVal;
  }
  return parsed;
}

export function safeParseInventory(inventoryField: any): any {
  const defaultInventory = { armas: [], armaduras: [], consumibles: [], artefactos: [], coins: { pc: 0, pl: 0, el: 0, po: 0, pt: 0 }, slots: {}, habilidades: [], salvaciones: [] };
  const parsed = safeParseJSON(inventoryField, defaultInventory);
  return {
    armas: Array.isArray(parsed.armas) ? parsed.armas : [],
    armaduras: Array.isArray(parsed.armaduras) ? parsed.armaduras : [],
    consumibles: Array.isArray(parsed.consumibles) ? parsed.consumibles : [],
    artefactos: Array.isArray(parsed.artefactos) ? parsed.artefactos : [],
    coins: parsed.coins && typeof parsed.coins === 'object' ? parsed.coins : defaultInventory.coins,
    slots: parsed.slots && typeof parsed.slots === 'object' ? parsed.slots : {},
    habilidades: Array.isArray(parsed.habilidades) ? parsed.habilidades : [],
    salvaciones: Array.isArray(parsed.salvaciones) ? parsed.salvaciones : []
  };
}

export function safeParseStats(statsField: any): any {
  const defaultStats = { fue: 10, dex: 10, con: 10, int: 10, sab: 10, car: 10 };
  const parsed = safeParseJSON(statsField, defaultStats);
  return {
    ...parsed,
    fue: typeof parsed.fue === 'number' ? parsed.fue : 10,
    dex: typeof parsed.dex === 'number' ? parsed.dex : 10,
    con: typeof parsed.con === 'number' ? parsed.con : 10,
    int: typeof parsed.int === 'number' ? parsed.int : 10,
    sab: typeof parsed.sab === 'number' ? parsed.sab : 10,
    car: typeof parsed.car === 'number' ? parsed.car : 10
  };
}
