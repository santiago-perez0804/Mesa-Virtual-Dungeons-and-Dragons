export type AlignmentType = 'lawful-good' | 'neutral-good' | 'chaotic-good' | 'lawful-neutral' | 'true-neutral' | 'chaotic-neutral' | 'lawful-evil' | 'neutral-evil' | 'chaotic-evil';

export type AttributeKey = 'fue' | 'dex' | 'con' | 'int' | 'sab' | 'car';


export interface CharacterDraft {
  // PASO 1 - Identidad
  name: string;
  avatarUrl: string | null;
  age: number | null;
  height: string;
  weight: string;
  gender: string;
  alignment: AlignmentType | null;
  languages: string[];
  backstoryText: string;

  // PASO 2 - Linaje & Poder
  race: string | null;
  subrace: string | null;
  class: string | null;
  attributes: {
    fue: number;
    dex: number;
    con: number;
    int: number;
    sab: number;
    car: number;
  };
  savingThrows: AttributeKey[];

  // PASO 3 - Trasfondo & Habilidades
  background: string | null;
  skillProficiencies: string[];
  equipment: any[];
  personalityTrait: string;
  ideal: string;
  bond: string;
  flaw: string;
}

