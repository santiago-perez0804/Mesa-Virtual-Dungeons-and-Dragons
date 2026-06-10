export const calcMod = (score: number): number => Math.floor((score - 10) / 2);

export const calculateHP = (classHitDice: number, conScore: number): number => {
  if (!classHitDice) return 10 + calcMod(conScore);
  return classHitDice + calcMod(conScore);
};

export const calculateAC = (dexScore: number): number => {
  return 10 + calcMod(dexScore);
};

export const getRandomItem = <T>(arr: T[]): T | null => {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
};
