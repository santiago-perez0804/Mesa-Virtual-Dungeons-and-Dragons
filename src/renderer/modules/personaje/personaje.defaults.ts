import type { CharacterDraft } from '../../../data/dnd-datos';

export const createDefaultAttributes = () => ({
  fue: 8,
  dex: 8,
  con: 8,
  int: 8,
  sab: 8,
  car: 8
});

export const createDefaultInventory = () => ({
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
});

export const createDefaultDraft = (): CharacterDraft => ({
  name: '',
  avatarUrl: '',
  age: null,
  height: '',
  weight: '',
  gender: '',
  alignment: null,
  languages: ['Común'],
  backstoryText: '',
  race: 'Humano',
  subrace: 'Estándar',
  class: 'Guerrero',
  attributes: createDefaultAttributes(),
  savingThrows: ['fue', 'con'],
  background: null,
  skillProficiencies: [],
  equipment: [],
  personalityTrait: '',
  ideal: '',
  bond: '',
  flaw: ''
});
