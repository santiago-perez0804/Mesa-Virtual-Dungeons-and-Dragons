const defaultInventory = {
  armas: [],
  armaduras: [],
  consumibles: [],
  artefactos: [],
  coins: {
    pc: 0,
    pl: 0,
    el: 0,
    po: 0,
    pt: 0
  },
  slots: {}
};

export const safeParseGridInventory = (inventoryField: any): any => {
  if (!inventoryField) return defaultInventory;

  let parsed = inventoryField;
  try {
    while (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }
  } catch {
    return defaultInventory;
  }

  if (!parsed || typeof parsed !== 'object') return defaultInventory;

  return {
    armas: Array.isArray(parsed.armas) ? parsed.armas : [],
    armaduras: Array.isArray(parsed.armaduras) ? parsed.armaduras : [],
    consumibles: Array.isArray(parsed.consumibles) ? parsed.consumibles : [],
    artefactos: Array.isArray(parsed.artefactos) ? parsed.artefactos : [],
    coins: parsed.coins && typeof parsed.coins === 'object' ? parsed.coins : defaultInventory.coins,
    slots: parsed.slots && typeof parsed.slots === 'object' ? parsed.slots : {}
  };
};

export const getGridItemCategory = (itemData: any) => {
  const tags = Array.isArray(itemData.tags) ? itemData.tags.map((tag: string) => tag.toLowerCase()) : [];
  if (itemData.isDamage || tags.includes('arma') || tags.includes('weapon') || tags.includes('armas')) {
    return 'armas';
  }
  if (itemData.isProtect || tags.includes('armadura') || tags.includes('armor') || tags.includes('armaduras')) {
    return 'armaduras';
  }
  if (tags.includes('pocion') || tags.includes('pergamino') || tags.includes('consumible') || tags.includes('potion') || tags.includes('scroll') || tags.includes('consumibles')) {
    return 'consumibles';
  }
  return 'artefactos';
};
