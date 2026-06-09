
export const parseClasses = (clsStr: string) => {
  try {
    const parsed = JSON.parse(clsStr);
    if (typeof parsed === 'object' && parsed !== null) return parsed;
  } catch { }
  return { [clsStr || "Guerrero"]: 1 };
};

export const safeParseStats = (statsObj: any) => {
  if (typeof statsObj === 'string') {
    try { return JSON.parse(statsObj); } catch { return { fue: 10, des: 10, con: 10, int: 10, sab: 10, car: 10 }; }
  }
  return statsObj || { fue: 10, des: 10, con: 10, int: 10, sab: 10, car: 10 };
};

export const safeParseInventory = (invObj: any) => {
  if (typeof invObj === 'string') {
    try { return JSON.parse(invObj); } catch { return { armas: [], armaduras: [], consumibles: [], artefactos: [], coins: { pc: 0, pl: 0, el: 0, po: 0, pt: 0 }, slots: {} }; }
  }
  return invObj || { armas: [], armaduras: [], consumibles: [], artefactos: [], coins: { pc: 0, pl: 0, el: 0, po: 0, pt: 0 }, slots: {} };
};

export const calcMod = (val: number) => Math.floor((val - 10) / 2);
