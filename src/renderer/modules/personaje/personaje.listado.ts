export type CharacterSortKey = 'none' | 'level-asc' | 'level-desc' | 'class' | 'hp';

export const parseCharacterClasses = (classValue: string) => {
  try {
    const parsed = JSON.parse(classValue);
    if (typeof parsed === 'object' && parsed !== null) return parsed;
  } catch {
    // Legacy characters store the class as a plain string.
  }

  return { [classValue || 'Guerrero']: 1 };
};

export const filterCharacters = (characters: any[], searchTerm: string) => {
  const normalizedSearch = searchTerm.toLowerCase();
  return characters.filter((character: any) =>
    character.name.toLowerCase().includes(normalizedSearch) ||
    character.owner?.toLowerCase().includes(normalizedSearch)
  );
};

export const sortCharacters = (characters: any[], sortBy: CharacterSortKey) => {
  const result = [...characters];

  if (sortBy === 'level-asc') {
    result.sort((a, b) => (a.level || 1) - (b.level || 1));
  } else if (sortBy === 'level-desc') {
    result.sort((a, b) => (b.level || 1) - (a.level || 1));
  } else if (sortBy === 'class') {
    result.sort((a, b) => {
      const classA = Object.keys(parseCharacterClasses(a.class))[0] || '';
      const classB = Object.keys(parseCharacterClasses(b.class))[0] || '';
      return classA.localeCompare(classB);
    });
  } else if (sortBy === 'hp') {
    result.sort((a, b) => (b.max_hp || 0) - (a.max_hp || 0));
  }

  return result;
};
