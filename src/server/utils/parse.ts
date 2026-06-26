/** Parseo seguro de JSON: previene doble-serialización y reconstruye spreads corruptos. */
export function safeParseJSON(field: any, defaultVal: any): any {
  if (!field) return defaultVal;
  let parsed = field;
  try {
    while (typeof parsed === 'string') {
      const nextParsed = JSON.parse(parsed);
      if (nextParsed === parsed) break;
      parsed = nextParsed;
    }
  } catch (e) {}

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
  const defaultInventory = { armas: [], armaduras: [], consumibles: [], artefactos: [], coins: { pc: 0, pl: 0, el: 0, po: 0, pt: 0 }, slots: {}, habilidades: [], salvaciones: [], trasfondo: [] };
  const parsed = safeParseJSON(inventoryField, defaultInventory);
  return {
    armas: Array.isArray(parsed.armas) ? parsed.armas : [],
    armaduras: Array.isArray(parsed.armaduras) ? parsed.armaduras : [],
    consumibles: Array.isArray(parsed.consumibles) ? parsed.consumibles : [],
    artefactos: Array.isArray(parsed.artefactos) ? parsed.artefactos : [],
    coins: parsed.coins && typeof parsed.coins === 'object' ? parsed.coins : defaultInventory.coins,
    slots: parsed.slots && typeof parsed.slots === 'object' ? parsed.slots : {},
    habilidades: Array.isArray(parsed.habilidades) ? parsed.habilidades : [],
    salvaciones: Array.isArray(parsed.salvaciones) ? parsed.salvaciones : [],
    trasfondo: Array.isArray(parsed.trasfondo) ? parsed.trasfondo : []
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

export function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
