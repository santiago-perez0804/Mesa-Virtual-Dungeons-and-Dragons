export const cleanNameForMatching = (name: string): string => {
  if (!name) return '';
  let s = name.toLowerCase();

  s = s.replace(/\s*\(.*\)/g, '');
  s = s.replace(/\s+\d+$/g, '');

  s = s.replace(/caracter[^s\s]{1,3}stica/gi, 'caracteristica');
  s = s.replace(/acci[^n\s]{1,3}n/gi, 'accion');
  s = s.replace(/b[^r\s]{1,3}rbaro/gi, 'barbaro');
  s = s.replace(/cl[^r\s]{1,3}rigo/gi, 'clerigo');
  s = s.replace(/campe[^n\s]{1,3}n/gi, 'campeon');
  s = s.replace(/cr[^t\s]{1,3}tico/gi, 'critico');
  s = s.replace(/palad[^n\s]{1,3}n/gi, 'paladin');
  s = s.replace(/elusi[^v\s]{1,3}o/gi, 'elusivo');
  s = s.replace(/evasi[^n\s]{1,3}n/gi, 'evasion');
  s = s.replace(/perici[^a\s]{1,3}a/gi, 'pericia');
  s = s.replace(/bendici[^n\s]{1,3}n/gi, 'bendicion');
  s = s.replace(/protecci[^n\s]{1,3}n/gi, 'proteccion');
  s = s.replace(/artifici[^e\s]{1,3}l/gi, 'artificial');

  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  s = s.replace(/[^a-z0-9]/g, '');

  return s;
};

export const safeStr = (val: any) => val != null ? String(val) : '';
