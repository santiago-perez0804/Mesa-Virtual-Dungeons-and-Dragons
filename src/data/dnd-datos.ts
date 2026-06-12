export type AlignmentType = 'lawful-good' | 'neutral-good' | 'chaotic-good' | 'lawful-neutral' | 'true-neutral' | 'chaotic-neutral' | 'lawful-evil' | 'neutral-evil' | 'chaotic-evil';

export type AttributeKey = 'fue' | 'dex' | 'con' | 'int' | 'sab' | 'car';

export interface RaceType {
  id: string;
  name: string;
  icon: string;
  description: string;
  bonuses: Partial<Record<AttributeKey, number>>;
  bonusText: string;
  baseLanguages: string[];
  subraces: SubraceType[];
  ageRange: { min: number, max: number };
}

export interface SubraceType {
  id: string;
  name: string;
  bonuses: Partial<Record<AttributeKey, number>>;
  bonusText: string;
  description: string;
}

export interface ClassType {
  id: string;
  name: string;
  icon: string;
  hitDice: number;
  flavor: string;
  savingThrows: AttributeKey[];
}

export interface BackgroundType {
  id: string;
  name: string;
  description: string;
  skills: string[];
  extraLanguages: number;
  tools: string[];
  equipment: { name: string; quantity: number }[];
  personalityTraits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
}

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

export const alignments = [
  { id: 'lawful-good', label: 'Legal Bueno', desc: 'Hacen lo correcto como se espera de la sociedad.' },
  { id: 'neutral-good', label: 'Neutral Bueno', desc: 'Ayudan a los demás según sus necesidades.' },
  { id: 'chaotic-good', label: 'Caótico Bueno', desc: 'Siguen su propia moral para hacer el bien.' },
  { id: 'lawful-neutral', label: 'Legal Neutral', desc: 'Actúan según la ley, tradición o códigos.' },
  { id: 'true-neutral', label: 'Neutral Auténtico', desc: 'Prefieren evitar los extremos morales.' },
  { id: 'chaotic-neutral', label: 'Caótico Neutral', desc: 'Siguen sus caprichos valorando su libertad.' },
  { id: 'lawful-evil', label: 'Legal Malvado', desc: 'Toman lo que quieren dentro de los límites de un código.' },
  { id: 'neutral-evil', label: 'Neutral Malvado', desc: 'Hacen cualquier cosa para salir impunes.' },
  { id: 'chaotic-evil', label: 'Caótico Malvado', desc: 'Actúan con violencia impredecible.' },
];

export const races: RaceType[] = [];

export const classes: ClassType[] = [
  { id: 'Bárbaro', name: 'Bárbaro', icon: '🪓', hitDice: 12, flavor: 'Furia de batalla indomable.', savingThrows: ['fue', 'con'] },
  { id: 'Bardo', name: 'Bardo', icon: '🪕', hitDice: 8, flavor: 'Magia a través del arte.', savingThrows: ['dex', 'car'] },
  { id: 'Clérigo', name: 'Clérigo', icon: '⚕️', hitDice: 8, flavor: 'Poder divino sanador y destructor.', savingThrows: ['sab', 'car'] },
  { id: 'Druida', name: 'Druida', icon: '🌿', hitDice: 8, flavor: 'Magia antigua de la naturaleza.', savingThrows: ['int', 'sab'] },
  { id: 'Guerrero', name: 'Guerrero', icon: '⚔️', hitDice: 10, flavor: 'Maestro del combate marcial.', savingThrows: ['fue', 'con'] },
  { id: 'Monje', name: 'Monje', icon: '🥋', hitDice: 8, flavor: 'Artes marciales místicas.', savingThrows: ['fue', 'dex'] },
  { id: 'Paladín', name: 'Paladín', icon: '🛡️', hitDice: 10, flavor: 'Guerrero sagrado bajo un juramento.', savingThrows: ['sab', 'car'] },
  { id: 'Explorador', name: 'Explorador', icon: '🏹', hitDice: 10, flavor: 'Cazador de los bosques y bestias.', savingThrows: ['fue', 'dex'] },
  { id: 'Pícaro', name: 'Pícaro', icon: '🗡️', hitDice: 8, flavor: 'Sigiloso, letal y astuto.', savingThrows: ['dex', 'int'] },
  { id: 'Hechicero', name: 'Hechicero', icon: '✨', hitDice: 6, flavor: 'Magia innata en la sangre.', savingThrows: ['con', 'car'] },
  { id: 'Brujo', name: 'Brujo', icon: '🧿', hitDice: 8, flavor: 'Magia obtenida por un pacto oscuro.', savingThrows: ['sab', 'car'] },
  { id: 'Mago', name: 'Mago', icon: '🧙‍♂️', hitDice: 6, flavor: 'Estudioso de los conjuros arcanos.', savingThrows: ['int', 'sab'] },
];

export const backgrounds: BackgroundType[] = [
  {
    id: 'Acólito',
    name: 'Acólito',
    description: 'Sirves en un templo a un dios o panteón específico.',
    skills: ['Perspicacia', 'Religión'],
    extraLanguages: 2,
    tools: [],
    equipment: [{ name: 'Símbolo Sagrado', quantity: 1 }, { name: 'Libro de Rezos', quantity: 1 }, { name: 'Incienso', quantity: 5 }],
    personalityTraits: ['Idolatro a un héroe de mi fe.', 'Veo portentos en todos lados.', 'Nada puede sacudir mi actitud optimista.'],
    ideals: ['Tradición. Las antiguas doctrinas deben ser respetadas.', 'Caridad. Siempre trato de ayudar a los necesitados.'],
    bonds: ['Moriría por recuperar una reliquia antigua perdida.', 'Protegeré el templo en el que serví.'],
    flaws: ['Juzgo a los demás muy duramente.', 'Confío ciegamente en mis superiores del templo.']
  },
  {
    id: 'Charlatán',
    name: 'Charlatán',
    description: 'Siempre tienes una estafa preparada.',
    skills: ['Engaño', 'Juego de Manos'],
    extraLanguages: 0,
    tools: ['Kit de disfraz', 'Kit de falsificación'],
    equipment: [{ name: 'Ropas finas', quantity: 1 }, { name: 'Kit de disfraz', quantity: 1 }],
    personalityTraits: ['Me enamoro o desenamoro fácilmente.', 'Un problema se arregla mejor mintiendo.'],
    ideals: ['Independencia. Nadie me dice qué hacer.', 'Creatividad. Siempre pienso una solución original.'],
    bonds: ['Estafé a la persona equivocada, ahora me buscan.', 'Debo proteger a mi compañero de crímenes.'],
    flaws: ['No puedo resistirme a estafar a los ricos.', 'Soy cobarde cuando las cosas se ponen difíciles.']
  },
  {
    id: 'Criminal',
    name: 'Criminal',
    description: 'Eres un delincuente con contactos en el bajo mundo.',
    skills: ['Engaño', 'Sigilo'],
    extraLanguages: 0,
    tools: ['Herramientas de ladrón', 'Juego de mesa'],
    equipment: [{ name: 'Palanca', quantity: 1 }, { name: 'Ropas oscuras', quantity: 1 }],
    personalityTraits: ['No presto atención a los riesgos.', 'Siempre tengo un plan de escape.'],
    ideals: ['Honor. No robo a otros de mi misma profesión.', 'Libertad. Las cadenas son para romperse.'],
    bonds: ['Debo pagar una gran deuda al gremio de ladrones.', 'Algo valioso me fue robado.'],
    flaws: ['Robo las cosas sin darme cuenta.', 'Mi arrogancia me llevará a la ruina.']
  },
  {
    id: 'Soldado',
    name: 'Soldado',
    description: 'Entrenaste para la guerra y las batallas.',
    skills: ['Atletismo', 'Intimidación'],
    extraLanguages: 0,
    tools: ['Vehículos terrestres', 'Juego de cartas'],
    equipment: [{ name: 'Insignia de rango', quantity: 1 }, { name: 'Trofeo del enemigo', quantity: 1 }],
    personalityTraits: ['Soy directo y respetuoso.', 'Puedo mirar fijamente a un perro infernal sin pestañear.'],
    ideals: ['Nación. Mi ciudad/nación es lo único que importa.', 'Poder. En la vida, el más fuerte manda.'],
    bonds: ['Mi honor es mi vida.', 'Aún busco a mis compañeros de armas.'],
    flaws: ['Cometí un terrible error en batalla que costó vidas.', 'Odio ciegamente al enemigo que luché.']
  },
  {
    id: 'Sabio',
    name: 'Sabio',
    description: 'Pasaste años estudiando las artes místicas o historia.',
    skills: ['Arcanos', 'Historia'],
    extraLanguages: 2,
    tools: [],
    equipment: [{ name: 'Botella de tinta', quantity: 1 }, { name: 'Pluma', quantity: 1 }, { name: 'Cuchillo', quantity: 1 }],
    personalityTraits: ['Uso palabras grandilocuentes.', 'Leo todos los libros que caen en mis manos.'],
    ideals: ['Conocimiento. El camino hacia el poder y la perfección.', 'Belleza. Lo que es bello apunta hacia la verdad.'],
    bonds: ['He dedicado mi vida a investigar cierto misterio.', 'Busco un libro sumamente raro.'],
    flaws: ['Me distraigo fácilmente al prometer una nueva información.', 'Tengo un oscuro secreto que arruinaría mi vida.']
  },
  {
    id: 'Héroe del Pueblo',
    name: 'Héroe del Pueblo',
    description: 'Salvaste a tu gente de un desastre local.',
    skills: ['Trato con Animales', 'Supervivencia'],
    extraLanguages: 0,
    tools: ['Herramientas de artesano', 'Vehículos terrestres'],
    equipment: [{ name: 'Herramientas de artesano', quantity: 1 }, { name: 'Pala', quantity: 1 }],
    personalityTraits: ['Juzgo a la gente por sus acciones.', 'Si alguien está en problemas, siempre ayudo.'],
    ideals: ['Respeto. Las personas merecen ser tratadas con dignidad.', 'Equidad. Nadie debería tener todos los privilegios.'],
    bonds: ['Tengo una familia a la que proteger.', 'Protejo a todos los débiles de mi pueblo.'],
    flaws: ['El tirano del que hui aún me persigue.', 'Confío de más en los forasteros.']
  }
];

export const skillsGroupedByStat = {
  fue: [
    { id: 'Atletismo', label: 'Atletismo' }
  ],
  dex: [
    { id: 'Acrobacias', label: 'Acrobacias' },
    { id: 'Juego de Manos', label: 'Juego de Manos' },
    { id: 'Sigilo', label: 'Sigilo' }
  ],
  int: [
    { id: 'Arcanos', label: 'Arcanos' },
    { id: 'Historia', label: 'Historia' },
    { id: 'Investigación', label: 'Investigación' },
    { id: 'Naturaleza', label: 'Naturaleza' },
    { id: 'Religión', label: 'Religión' }
  ],
  sab: [
    { id: 'Trato con Animales', label: 'Trato con Animales' },
    { id: 'Perspicacia', label: 'Perspicacia' },
    { id: 'Medicina', label: 'Medicina' },
    { id: 'Percepción', label: 'Percepción' },
    { id: 'Supervivencia', label: 'Supervivencia' }
  ],
  car: [
    { id: 'Engaño', label: 'Engaño' },
    { id: 'Intimidación', label: 'Intimidación' },
    { id: 'Actuación', label: 'Actuación' },
    { id: 'Persuasión', label: 'Persuasión' }
  ]
};
