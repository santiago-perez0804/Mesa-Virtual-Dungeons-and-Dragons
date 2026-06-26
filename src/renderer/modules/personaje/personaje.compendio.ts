import {
  mapEnglishStatToSpanish,
  mapSpanishNameToKey,
  parseHitDie
} from './personaje.utilidades';

type CompendiumItem = {
  id?: string | number;
  name: string;
  type: string;
  data?: any;
};

const defaultSavingThrowsByClass: Record<string, string[]> = {
  Bárbaro: ['fue', 'con'],
  Bardo: ['dex', 'car'],
  Clérigo: ['sab', 'car'],
  Druida: ['int', 'sab'],
  Guerrero: ['fue', 'con'],
  Monje: ['fue', 'dex'],
  Paladín: ['sab', 'car'],
  Explorador: ['fue', 'dex'],
  Pícaro: ['dex', 'int'],
  Hechicero: ['con', 'car'],
  Brujo: ['sab', 'car'],
  Mago: ['int', 'sab']
};

const parseCompendiumData = (item: CompendiumItem): any => {
  try {
    return typeof item.data === 'string' ? JSON.parse(item.data) : (item.data || {});
  } catch {
    return {};
  }
};

const buildAbilityBonuses = (abilityBonuses: any[]): Record<string, number> => {
  const bonuses: Record<string, number> = {};
  if (!Array.isArray(abilityBonuses)) return bonuses;

  abilityBonuses.forEach((bonus: any) => {
    if (bonus.ability_score?.index) {
      const key = mapEnglishStatToSpanish(bonus.ability_score.index);
      bonuses[key] = bonus.bonus;
    }
  });

  return bonuses;
};

const formatKnownLanguages = (languages: string[]): string[] => {
  if (!Array.isArray(languages)) return [];
  return languages.map(language => language.charAt(0).toUpperCase() + language.slice(1));
};

const findSubraceCompendiumItem = (compendium: CompendiumItem[], subrace: any) => {
  return compendium.find((item: CompendiumItem) => {
    if (item.type !== 'subrace') return false;
    if (item.name.toLowerCase() === subrace.name.toLowerCase()) return true;

    const data = parseCompendiumData(item);
    return data.index === subrace.index;
  });
};

export const buildDbClasses = (compendium: CompendiumItem[] = []) => {
  return compendium
    .filter((item: CompendiumItem) => item.type === 'class')
    .map((item: CompendiumItem) => {
      const parsedData = parseCompendiumData(item);
      const rawSaves = parsedData.prof_saving_throws;
      const savingThrows = rawSaves
        ? rawSaves.split(',').map((save: string) => mapSpanishNameToKey(save))
        : (defaultSavingThrowsByClass[item.name] || ['fue', 'con']);

      return {
        id: item.name,
        name: item.name,
        description: parsedData.description || parsedData.desc || '',
        hitDice: parseHitDie(parsedData.hit_die || parsedData.hit_dice || 8),
        savingThrows
      };
    });
};

export const findHitDieForClass = (classes: any[], className: string) => {
  const found = classes.find((item: any) => item.name === className || item.id === className);
  return found?.hitDice || 10;
};

export const buildDbRaces = (compendium: CompendiumItem[] = []) => {
  return compendium
    .filter((item: CompendiumItem) => item.type === 'race')
    .map((item: CompendiumItem) => {
      const parsedData = parseCompendiumData(item);
      const subraces = (parsedData.subraces || []).map((subrace: any) => {
        const subraceCompendiumItem = findSubraceCompendiumItem(compendium, subrace);
        let subraceDesc = 'Sin descripción.';
        let subraceBonuses: Record<string, number> = {};

        if (subraceCompendiumItem) {
          const subraceData = parseCompendiumData(subraceCompendiumItem);
          subraceDesc = subraceData.desc || subraceData.description || 'Sin descripción.';
          subraceBonuses = buildAbilityBonuses(subraceData.ability_bonuses);
        }

        return {
          id: subrace.name,
          name: subrace.name,
          description: subraceDesc,
          bonuses: subraceBonuses,
          bonusText: ''
        };
      });

      const bonuses = buildAbilityBonuses(parsedData.ability_bonuses);
      const bonusText = Object.entries(bonuses)
        .map(([attr, value]) => `+${value} ${attr.toUpperCase()}`)
        .join(', ');
      const languagesKnown = formatKnownLanguages(parsedData.languages_known);

      return {
        id: item.name,
        name: item.name,
        description: parsedData.size_description || parsedData.age || 'Sin descripción.',
        age: parsedData.age || '',
        size: parsedData.size || 'Medio',
        speed: parsedData.speed || 30,
        bonuses,
        bonusText: bonusText || '+1 a todo',
        subraces,
        languages: languagesKnown.length > 0 ? languagesKnown : ['Común'],
        alignment: parsedData.alignment || '',
        alignmentDesc: parsedData.alignment_desc || '',
        image: parsedData.image || ''
      };
    });
};

export const buildDbItems = (compendium: CompendiumItem[] = []) => {
  return compendium
    .filter((item: CompendiumItem) => item.type === 'item')
    .map((item: CompendiumItem) => ({
      id: item.id,
      name: item.name,
      data: parseCompendiumData(item)
    }));
};

export const findBaseSpeedForRace = (races: any[], characterRace: string) => {
  if (!characterRace) return 6;
  const baseRace = characterRace.split('(')[0].trim();
  const found = races.find((race: any) => race.name === baseRace || race.id === baseRace);
  if (found) return Math.floor(found.speed / 5);
  if (baseRace === 'Enano' || baseRace === 'Mediano' || baseRace === 'Gnomo') return 5;
  return 6;
};

export const buildDbAlignments = (compendium: CompendiumItem[] = []) => {
  return compendium
    .filter((item: CompendiumItem) => item.type === 'alignment')
    .map((item: CompendiumItem) => {
      const parsedData = parseCompendiumData(item);
      const id = parsedData.index === 'neutral'
        ? 'true-neutral'
        : (parsedData.index || item.name);

      return {
        id,
        label: item.name,
        desc: parsedData.desc || ''
      };
    });
};
