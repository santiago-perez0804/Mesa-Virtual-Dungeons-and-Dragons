import { useState, useEffect, useMemo } from 'react';
import { FeatureTooltip } from './FeatureTooltip';
import { formatDescription } from '../utils/format';

/*
const SPANISH_TO_ENGLISH_TRAITS: Record<string, string> = {
  // Bárbaro
  'furia': 'rage',
  'defensa sin armadura': 'unarmored defense',
  'ataque temerario': 'reckless attack',
  'sentido del peligro': 'danger sense',
  'senda primal (subclase)': 'primal path',
  'senda primal': 'primal path',
  'mejora de característica': 'ability score improvement',
  'ataque extra': 'extra attack',
  'movimiento rápido': 'fast movement',
  'instinto salvaje': 'feral instinct',
  'crítico brutal': 'brutal critical',
  'crítico brutal (1 dado)': 'brutal critical',
  'crítico brutal (2 dados)': 'brutal critical',
  'crítico brutal (3 dados)': 'brutal critical',
  'furia implacable': 'relentless rage',
  'furia persistente': 'persistent rage',
  'poder indómito': 'indomitable might',
  'campeón primal': 'primal champion',
  
  // Guerrero
  'estilo de combate': 'fighting style',
  'segunda oportunidad': 'second wind',
  'acción en oleada': 'action surge',
  'arquetipo marcial (subclase)': 'martial archetype',
  'arquetipo marcial': 'martial archetype',
  'indomable': 'indomitable',
  'indomable (2)': 'indomitable',
  'indomable (3)': 'indomitable',
  'ataque extra (2)': 'extra attack',
  'ataque extra (3)': 'extra attack',

  // Pícaro
  'pericia': 'expertise',
  'ataque furtivo': 'sneak attack',
  'jerga de ladrones': 'thieves\' cant',
  'acción astuta': 'cunning action',
  'arquetipo de pícaro (subclase)': 'roguish archetype',
  'arquetipo de pícaro': 'roguish archetype',
  'esquiva asombrosa': 'uncanny dodge',
  'evasión': 'evasion',
  'talento seguro': 'reliable talent',
  'sentido ciego': 'blindsense',
  'mente escurridiza': 'slippery mind',
  'elusivo': 'elusive',
  'golpe de suerte': 'stroke of luck'
};
*/

const typeIcons: any = {
  monster: '👾 Monstruos',
  spell: '📜 Hechizos',
  item: '⚔️ Objetos',
  class: '🛡️ Clases',
  subclass: '✨ Subclases',
  race: '👣 Razas',
  subrace: '🧬 Subrazas',
  condition: '⚠️ Estados',
  features: '⚡ Rasgos'
};
const ACTION_TYPES = ['Acción', 'Acción Adicional', 'Reacción', 'Acción Legendaria', 'Acción de Guarida'];
const DAMAGE_TYPES = ['contundente', 'perforante', 'cortante', 'acido', 'fuego', 'frio', 'relampago', 'trueno', 'fuerza', 'veneno', 'necrotico', 'radiante', 'psiquico'];

const EMERGENCY_SRD_CLASSES = [
  {
    name: "Guerrero",
    hit_dice: "d10",
    desc: "Un combatiente experto en el uso de una inmensa variedad de armas y armaduras, entrenado para resistir y dominar en la primera línea de batalla.",
    prof_saving_throws: "Fuerza, Constitución",
    prof_skills: "Atletismo, Acrobacias, Intuición, Intimidación, Percepción, Supervivencia",
    prof_armor: "Todas las armaduras, escudos",
    prof_weapons: "Armas simples, armas marciales",
    prof_tools: "Ninguna",
    subclass_level: 3,
    subclass_title: "Arquetipo Marcial",
    table: `| Nivel | Bono de Competencia | Rasgos |\n|---|---|---|\n| 1st | +2 | Estilo de Combate, Segunda Oportunidad |\n| 2nd | +2 | Acción en Oleada |\n| 3rd | +2 | Arquetipo Marcial (Subclase) |\n| 4th | +2 | Mejora de Característica |\n| 5th | +3 | Ataque Extra |\n| 6th | +3 | Mejora de Característica |\n| 7th | +3 | Rasgo de Arquetipo |\n| 8th | +3 | Mejora de Característica |\n| 9th | +4 | Indomable |\n| 10th | +4 | Rasgo de Arquetipo |\n| 11th | +4 | Ataque Extra (2) |\n| 12th | +4 | Mejora de Característica |\n| 13th | +5 | Indomable (2) |\n| 14th | +5 | Mejora de Característica |\n| 15th | +5 | Rasgo de Arquetipo |\n| 16th | +5 | Mejora de Característica |\n| 17th | +6 | Acción en Oleada (2), Indomable (3) |\n| 18th | +6 | Rasgo de Arquetipo |\n| 19th | +6 | Mejora de Característica |\n| 20th | +6 | Ataque Extra (3) |`,
    traits: [
      { level: 1, name: "Estilo de Combate", type: "Pasivo", desc: "Adoptas un estilo de combate particular como tu especialidad (Ej: Defensa +1 CA, Duelista +2 daño)." },
      { level: 1, name: "Segunda Oportunidad", type: "Activo", desc: "En tu turno, puedes usar una acción adicional para recuperar 1d10 + nivel PG. Reutilizable tras descanso corto." },
      { level: 2, name: "Acción en Oleada", type: "Activo", desc: "Puedes realizar una acción adicional en tu turno además de tu acción normal. Reutilizable tras descanso corto." },
      { level: 3, name: "Arquetipo Marcial", type: "Pasivo", desc: "Eliges un arquetipo que emula tu estilo. Otorga rasgos en nivel 3, 7, 10, 15 y 18." },
      { level: 4, name: "Mejora de Característica", type: "Pasivo", desc: "Puedes aumentar una puntuación de característica en 2, o dos en 1. No puedes superar el valor de 20 por este medio." },
      { level: 5, name: "Ataque Extra", type: "Pasivo", desc: "Puedes atacar dos veces en lugar de una al realizar la acción de Atacar en tu turno." },
      { level: 6, name: "Mejora de Característica", type: "Pasivo", desc: "Puedes aumentar una puntuación de característica en 2, o dos en 1." },
      { level: 8, name: "Mejora de Característica", type: "Pasivo", desc: "Puedes aumentar una puntuación de característica en 2, o dos en 1." },
      { level: 9, name: "Indomable", type: "Activo", desc: "Puedes volver a tirar una salvación fallida. Si lo haces, debes usar el nuevo resultado. Reutilizable tras descanso largo." },
      { level: 11, name: "Ataque Extra (2)", type: "Pasivo", desc: "Puedes atacar tres veces en lugar de dos siempre que realices la acción de Atacar en tu turno." },
      { level: 12, name: "Mejora de Característica", type: "Pasivo", desc: "Puedes aumentar una puntuación de característica en 2, o dos en 1." },
      { level: 13, name: "Indomable (2)", type: "Activo", desc: "Puedes usar Indomable dos veces antes de requerir un descanso largo." },
      { level: 14, name: "Mejora de Característica", type: "Pasivo", desc: "Puedes aumentar una puntuación de característica en 2, o dos en 1." },
      { level: 16, name: "Mejora de Característica", type: "Pasivo", desc: "Puedes aumentar una puntuación de característica en 2, o dos en 1." },
      { level: 17, name: "Acción en Oleada (2)", type: "Activo", desc: "Puedes realizar una Acción en Oleada dos veces antes de un descanso corto o largo." },
      { level: 17, name: "Indomable (3)", type: "Activo", desc: "Puedes usar Indomable tres veces antes de requerir un descanso largo." },
      { level: 19, name: "Mejora de Característica", type: "Pasivo", desc: "Puedes aumentar una puntuación de característica en 2, o dos en 1." },
      { level: 20, name: "Ataque Extra (3)", type: "Pasivo", desc: "Puedes atacar cuatro veces en lugar de tres siempre que realices la acción de Atacar en tu turno." }
    ],
    subclasses: [
      { name: "Campeón", desc: "Se enfoca en la potencia física pura, logrando golpes devastadores de forma más consistente.", traits: [
        { name: "Crítico Mejorado", level: 3, desc: "Tus ataques con armas logran un golpe crítico con un resultado de 19 o 20." },
        { name: "Atleta Notable", level: 7, desc: "Añades la mitad de tu bono de competencia a pruebas físicas que no lo usen ya." }
      ] },
      { name: "Maestro de Batalla", desc: "Emplea tácticas marciales sofisticadas y maniobras para controlar el campo de batalla.", traits: [
        { name: "Superioridad en Combate", level: 3, desc: "Obtienes dados de superioridad (d8) para ejecutar maniobras especiales como Derribar o Desarmar." },
        { name: "Estudiante de Guerra", level: 3, desc: "Obtienes competencia con un tipo de herramientas de artesano de tu elección." }
      ] }
    ]
  },
  {
    name: "Pícaro",
    hit_dice: "d8",
    desc: "Un especialista del sigilo, el ingenio y los golpes de precisión, capaz de encontrar debilidades y sortear peligros con agilidad asombrosa.",
    prof_saving_throws: "Destreza, Inteligencia",
    prof_skills: "Acrobacias, Atletismo, Engaño, Intuición, Intimidación, Investigación, Juego de Manos, Percepción, Interpretación, Persuasión, Sigilo, Juego",
    prof_armor: "Armaduras ligeras",
    prof_weapons: "Armas simples, ballestas de mano, espadas cortas, estoques, espadas anchas",
    prof_tools: "Herramientas de ladrón",
    subclass_level: 3,
    subclass_title: "Arquetipo de Pícaro",
    table: `| Nivel | Bono de Competencia | Ataque Furtivo | Rasgos |\n|---|---|---|---|\n| 1st | +2 | 1d6 | Pericia, Ataque Furtivo, Jerga de Ladrones |\n| 2nd | +2 | 1d6 | Acción Astuta |\n| 3rd | +2 | 2d6 | Arquetipo de Pícaro (Subclase) |\n| 4th | +2 | 2d6 | Mejora de Característica |\n| 5th | +3 | 3d6 | Esquiva Asombrosa |\n| 6th | +3 | 3d6 | Pericia |\n| 7th | +3 | 4d6 | Evasión |\n| 8th | +3 | 4d6 | Mejora de Característica |\n| 9th | +4 | 5d6 | Rasgo de Arquetipo |\n| 10th | +4 | 5d6 | Mejora de Característica |\n| 11th | +4 | 6d6 | Talento Seguro |\n| 12th | +4 | 6d6 | Mejora de Característica |\n| 13th | +5 | 7d6 | Rasgo de Arquetipo |\n| 14th | +5 | 7d6 | Sentido Ciego |\n| 15th | +5 | 8d6 | Mente Escurridiza |\n| 16th | +5 | 8d6 | Mejora de Característica |\n| 17th | +6 | 9d6 | Rasgo de Arquetipo |\n| 18th | +6 | 9d6 | Elusivo |\n| 19th | +6 | 10d6 | Mejora de Característica |\n| 20th | +6 | 10d6 | Golpe de Suerte |`,
    traits: [
      { level: 1, name: "Pericia", type: "Pasivo", desc: "Tu bono de competencia se duplica para dos de tus habilidades elegidas o herramientas de ladrón." },
      { level: 1, name: "Ataque Furtivo", type: "Pasivo", desc: "Una vez por turno, puedes infligir daño extra si tienes ventaja en tu tirada de ataque con armas sutiles o a distancia." },
      { level: 1, name: "Jerga de Ladrones", type: "Pasivo", desc: "Conoces un dialecto secreto mezclado con claves para ocultar mensajes en conversaciones normales." },
      { level: 2, name: "Acción Astuta", type: "Activo", desc: "Puedes realizar una acción adicional de Destrabar, Esconderse o Correr." },
      { level: 3, name: "Arquetipo de Pícaro", type: "Pasivo", desc: "Eliges un arquetipo que define tus capacidades, otorgando rasgos en niveles 3, 9, 13 y 17." },
      { level: 4, name: "Mejora de Característica", type: "Pasivo", desc: "Puedes aumentar una puntuación de característica en 2, o dos en 1. No puedes superar el valor de 20 por este medio." },
      { level: 5, name: "Esquiva Asombrosa", type: "Reacción", desc: "Cuando un atacante visible te golpea, puedes usar tu reacción para reducir a la mitad el daño sufrido." },
      { level: 6, name: "Pericia", type: "Pasivo", desc: "Puedes duplicar tu bonificador de competencia para otras dos habilidades o herramientas elegidas." },
      { level: 7, name: "Evasión", type: "Pasivo", desc: "Si superas una salvación de Destreza para reducir daño a la mitad, no sufres daño, y si fallas solo sufres la mitad." },
      { level: 8, name: "Mejora de Característica", type: "Pasivo", desc: "Puedes aumentar una puntuación de característica en 2, o dos en 1." },
      { level: 10, name: "Mejora de Característica", type: "Pasivo", desc: "Puedes aumentar una puntuación de característica en 2, o dos en 1." },
      { level: 11, name: "Talento Seguro", type: "Pasivo", desc: "Tratas cualquier tirada en el d20 de 9 o menos como un 10 para pruebas con competencia." },
      { level: 12, name: "Mejora de Característica", type: "Pasivo", desc: "Puedes aumentar una puntuación de característica en 2, o dos en 1." },
      { level: 14, name: "Sentido Ciego", type: "Pasivo", desc: "Si oyes, conoces la ubicación de cualquier criatura invisible o escondida a 10 pies de ti." },
      { level: 15, name: "Mente Escurridiza", type: "Pasivo", desc: "Obtienes competencia en tiradas de salvación de Sabiduría." },
      { level: 16, name: "Mejora de Característica", type: "Pasivo", desc: "Puedes aumentar una puntuación de característica en 2, o dos en 1." },
      { level: 18, name: "Elusivo", type: "Pasivo", desc: "Ningún ataque tiene ventaja contra ti mientras no estés incapacitado." },
      { level: 19, name: "Mejora de Característica", type: "Pasivo", desc: "Puedes aumentar una puntuación de característica en 2, o dos en 1." },
      { level: 20, name: "Golpe de Suerte", type: "Activo", desc: "Puedes convertir un fallo en impacto, o tratar un d20 como un 20. Reutilizable tras descanso corto o largo." }
    ],
    subclasses: [
      { name: "Ladrón", desc: "Especialista en infiltración y robo, ágil escalador y maestro del sigilo urbano.", traits: [
        { name: "Manos Rápidas", level: 3, desc: "Puedes usar la Acción Astuta para hacer pruebas de Juego de Manos o usar un objeto." },
        { name: "Trabajo en las Alturas", level: 3, desc: "Escalar ya no te cuesta movimiento adicional y saltas más lejos." }
      ] },
      { name: "Asesino", desc: "El asesino es letal ante objetivos desprevenidos, asestando golpes silenciosos y mortales.", traits: [
        { name: "Competencia en Infiltración", level: 3, desc: "Obtienes competencia con herramientas de envenenador y de disfraz." },
        { name: "Emboscada Letal", level: 3, desc: "Tienes ventaja contra criaturas que no hayan tenido su turno en combate, e infliges crítico si están sorprendidas." }
      ] }
    ]
  },
  {
    name: "Bárbaro",
    hit_dice: "d12",
    desc: "Un fiero guerrero de trasfondo primitivo que puede entrar en una furia salvaje para diezmar a sus oponentes.",
    prof_saving_throws: "Fuerza, Constitución",
    prof_skills: "Atletismo, Intimidación, Naturaleza, Percepción, Supervivencia, Trato con Animales",
    prof_armor: "Armaduras ligeras, armaduras intermedias, escudos",
    prof_weapons: "Armas simples, armas marciales",
    prof_tools: "Ninguna",
    subclass_level: 3,
    subclass_title: "Senda Primal",
    table: `| Nivel | Bono de Competencia | Rasgos |\n|---|---|---|\n| 1º | +2 | Furia, Defensa sin Armadura |\n| 2º | +2 | Ataque Temerario, Sentido del Peligro |\n| 3º | +2 | Senda Primal (Subclase) |\n| 4º | +2 | Mejora de Característica |\n| 5º | +3 | Ataque Extra, Movimiento Rápido |\n| 6º | +3 | Rasgo de Senda |\n| 7º | +3 | Instinto Salvaje |\n| 8º | +3 | Mejora de Característica |\n| 9º | +4 | Crítico Brutal (1 dado) |\n| 10º | +4 | Rasgo de Senda |\n| 11º | +4 | Furia Implacable |\n| 12º | +4 | Mejora de Característica |\n| 13º | +5 | Crítico Brutal (2 dados) |\n| 14º | +5 | Rasgo de Senda |\n| 15º | +5 | Furia Persistente |\n| 16º | +5 | Mejora de Característica |\n| 17º | +6 | Crítico Brutal (3 dados) |\n| 18º | +6 | Poder Indómito |\n| 19º | +6 | Mejora de Característica |\n| 20º | +6 | Campeón Primal |`,
    traits: [
      { level: 1, name: "Furia", type: "Activo", desc: "En combate peleas con ferocidad primitiva. Puedes entrar en Furia como acción adicional." },
      { level: 1, name: "Defensa sin Armadura", type: "Pasivo", desc: "Mientras no vistas armadura, tu CA es igual a 10 + mod Destreza + mod Constitución." },
      { level: 2, name: "Ataque Temerario", type: "Activo", desc: "A cambio de atacar con ventaja en armas cuerpo a cuerpo basadas en Fuerza, los ataques contra ti tienen ventaja hasta tu siguiente turno." },
      { level: 2, name: "Sentido del Peligro", type: "Pasivo", desc: "Tienes ventaja en tiradas de salvación de Destreza contra efectos que puedas ver." },
      { level: 3, name: "Senda Primal", type: "Pasivo", desc: "Eliges una senda que define tu furia. Otorga rasgos en nivel 3, 6, 10 y 14." },
      { level: 4, name: "Mejora de Característica", type: "Pasivo", desc: "Puedes aumentar una puntuación de característica en 2, o dos en 1. No puedes superar el valor de 20 por este medio." },
      { level: 5, name: "Ataque Extra", type: "Pasivo", desc: "Puedes atacar dos veces en lugar de una al realizar la acción de Atacar en tu turno." },
      { level: 5, name: "Movimiento Rápido", type: "Pasivo", desc: "Tu velocidad aumenta en 10 pies mientras no lleves armadura pesada." },
      { level: 7, name: "Instinto Salvaje", type: "Pasivo", desc: "Tienes ventaja en tiradas de iniciativa y puedes actuar en primer turno si entras en furia." },
      { level: 8, name: "Mejora de Característica", type: "Pasivo", desc: "Puedes aumentar una puntuación de característica en 2, o dos en 1." },
      { level: 9, name: "Crítico Brutal (1 dado)", type: "Pasivo", desc: "Tiras un dado de daño de arma adicional al determinar daño extra de un golpe crítico cuerpo a cuerpo." },
      { level: 11, name: "Furia Implacable", type: "Activo", desc: "Si tus PG caen a 0 en furia, puedes hacer salvación Con CD 10 para quedar a 1 PG. CD aumenta en 5 por uso." },
      { level: 12, name: "Mejora de Característica", type: "Pasivo", desc: "Puedes aumentar una puntuación de característica en 2, o dos en 1." },
      { level: 13, name: "Crítico Brutal (2 dados)", type: "Pasivo", desc: "Tiras dos dados de daño de arma adicionales al determinar daño extra de un golpe crítico cuerpo a cuerpo." },
      { level: 15, name: "Furia Persistente", type: "Pasivo", desc: "Tu furia solo termina antes de tiempo si cae inconsciente o si decides finalizarla." },
      { level: 16, name: "Mejora de Característica", type: "Pasivo", desc: "Puedes aumentar una puntuación de característica en 2, o dos en 1." },
      { level: 17, name: "Crítico Brutal (3 dados)", type: "Pasivo", desc: "Tiras tres dados de daño de arma adicionales al determinar daño extra de un golpe crítico cuerpo a cuerpo." },
      { level: 18, name: "Poder Indómito", type: "Pasivo", desc: "Si tu prueba de Fuerza es menor que tu puntuación de Fuerza, puedes usar tu puntuación en su lugar." },
      { level: 19, name: "Mejora de Característica", type: "Pasivo", desc: "Puedes aumentar una puntuación de característica en 2, o dos en 1." },
      { level: 20, name: "Campeón Primal", type: "Pasivo", desc: "Tus puntuaciones de Fuerza y Constitución aumentan en 4, y sus máximos pasan a ser 24." }
    ],
    subclasses: [
      { name: "Senda del Berserker", desc: "Para algunos bárbaros, la furia es un fin en sí mismo.", traits: [
        { name: "Frenesí", level: 3, desc: "Puedes entrar en un frenesí al enfurecerte, permitiéndote hacer un ataque de arma cuerpo a cuerpo adicional por turno como acción adicional. Sufres un nivel de cansancio al terminar tu furia." }
      ] }
    ]
  }
];

/*
const parseMarkdownTable = (tableStr: string) => {
  if (!tableStr) return null;
  const lines = tableStr.trim().split('\n');
  if (lines.length < 2) return null;
  const contentLines = lines.filter(l => !l.includes('---') && l.trim().startsWith('|'));
  if (contentLines.length === 0) return null;
  const headers = contentLines[0].split('|').slice(1, -1).map(h => h.trim());
  const rows = contentLines.slice(1).map(line => line.split('|').slice(1, -1).map(c => c.trim()));
  return { headers, rows };
};
*/

const cleanNameForMatching = (name: string): string => {
  if (!name) return '';
  let s = name.toLowerCase();

  // Remove common parenthesized details, like '(subclase)', '(2)', '(1 dado)', etc.
  s = s.replace(/\s*\(.*\)/g, '');

  // Remove trailing numbers (e.g. 'extra attack 2' -> 'extra attack')
  s = s.replace(/\s+\d+$/g, '');

  // Standardize common encoding issues or vowel accent errors in D&D terms
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

  // Strip standard diacritics
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Strip all non-alphanumeric characters entirely for tight matching
  s = s.replace(/[^a-z0-9]/g, '');
  
  return s;
};

export const DatabaseView = ({ compendium, socket, userRole, isOverlay, forceOpenId, onCloseOverlay }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<'all' | 'monster' | 'spell' | 'item' | 'class' | 'subclass' | 'race' | 'subrace' | 'condition' | 'features'>('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 24;

  // EFECTO PARA OVERLAY
  useEffect(() => {
    if (isOverlay && forceOpenId && compendium && compendium.length > 0) {
      const item = compendium.find((d: any) => d.id === forceOpenId || d.name === forceOpenId);
      if (item) setSelectedItem(item);
    }
  }, [isOverlay, forceOpenId, compendium]);

  // Estados de Creación / Edición
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [createType, setCreateType] = useState<'monster' | 'item' | 'class' | 'subclass' | 'race' | 'subrace' | 'condition' | 'spell'>('monster');
  const [createName, setCreateName] = useState('');
  const [createImage, setCreateImage] = useState('');
  const [createDesc, setCreateDesc] = useState('');

  // Spell stats
  const [createShortDesc, setCreateShortDesc] = useState('');
  const [createSpellLevel, setCreateSpellLevel] = useState<number>(0);
  const [createSpellComponents, setCreateSpellComponents] = useState({ V: false, S: false, M: false });
  const [createSpellRange, setCreateSpellRange] = useState('');
  const [createSpellDuration, setCreateSpellDuration] = useState('instantaneo');
  const [createSpellConcentration, setCreateSpellConcentration] = useState(false);

  // Monster stats
  const [createHp, setCreateHp] = useState<string>('10');
  const [createAc, setCreateAc] = useState(10);
  const [createCr, setCreateCr] = useState('');
  const [createSpeed, setCreateSpeed] = useState('30 ft.');
  const [createStats, setCreateStats] = useState({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
  const [createAttacks, setCreateAttacks] = useState([{ 
    name: '', desc: '', isAttack: false, actionType: 'Acción', 
    attackBonus: '', damageFormula: '', damageType: 'cortante', range: '' 
  }]);
  const [createVuln, setCreateVuln] = useState<string[]>([]);
  const [createRes, setCreateRes] = useState<string[]>([]);
  const [createImm, setCreateImm] = useState<string[]>([]);
  const [createSize, setCreateSize] = useState('Mediano');
  const [createTraits, setCreateTraits] = useState([{ name: '', desc: '' }]);

  // Item stats
  const [createRarity, setCreateRarity] = useState('Común');
  const [isDamageItem, setIsDamageItem] = useState(false);
  const [itemAttackBonus, setItemAttackBonus] = useState('');
  const [itemDamageFormula, setItemDamageFormula] = useState('');
  const [itemDamageType, setItemDamageType] = useState('cortante');
  const [createTags, setCreateTags] = useState<string[]>([]);
  const [createArmorType, setCreateArmorType] = useState<string>('ligera');
  const [createRequiresAttunement, setCreateRequiresAttunement] = useState<boolean>(false);
  const [createWeight, setCreateWeight] = useState<string>('');
  const [imageZoom, setImageZoom] = useState<number>(1);
  const [imagePosX, setImagePosX] = useState<number>(0);
  const [imagePosY, setImagePosY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  // Nuevos estados para items (Daño y Protección avanzados)
  const [isProtectItem, setIsProtectItem] = useState(false);
  const [itemDefenseBonus, setItemDefenseBonus] = useState('');
  const [itemAttackName, setItemAttackName] = useState('');
  const [itemStatMod, setItemStatMod] = useState('');
  const [itemStatSelection, setItemStatSelection] = useState('FUE');
  const [itemTargetsCount, setItemTargetsCount] = useState('1');
  const [itemCritDamage, setItemCritDamage] = useState('');

  // --- ESTADOS ADICIONALES PARA COMPENDIO DE CLASES ---
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isImportingClasses, setIsImportingClasses] = useState(false);
  const [expandedTraits, setExpandedTraits] = useState<any>({});
  const [editingClassId, setEditingClassId] = useState<number | null>(null);
  const [srdDisconnected, setSrdDisconnected] = useState(false);
  
  /*
  const [featuresMap, setFeaturesMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!selectedClass) {
      setFeaturesMap({});
      return;
    }

    const host = window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin;
    const cleanClassName = selectedClass.name.toLowerCase();

    fetch(`${host}/api/class-features/${cleanClassName}`)
      .then(res => {
        if (!res.ok) throw new Error("Error fetching class features");
        return res.json();
      })
      .then((data: any[]) => {
        const map: Record<string, string> = {};
        data.forEach(item => {
          map[item.feature_name.toLowerCase()] = item.description;
        });
        setFeaturesMap(map);
      })
      .catch(err => {
        console.error("Failed to load class features:", err);
        setFeaturesMap({});
      });
  }, [selectedClass]);
  */
  
  // --- ESTADOS ADICIONALES PARA COMPENDIO DE RASGOS ---
  const [classFeatures, setClassFeatures] = useState<any[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState(false);
  const [selectedFeatureClass, setSelectedFeatureClass] = useState<string>('all');
  const [selectedFeatureLevel, setSelectedFeatureLevel] = useState<string>('all');
  const [selectedFeature, setSelectedFeature] = useState<any>(null);

  // --- FORMULARIO DE RASGOS ---
  const [isEditingFeature, setIsEditingFeature] = useState(false);
  const [featureFormId, setFeatureFormId] = useState<string | null>(null);
  const [featureFormClass, setFeatureFormClass] = useState('');
  const [featureFormName, setFeatureFormName] = useState('');
  const [featureFormLevel, setFeatureFormLevel] = useState(1);
  const [featureFormDesc, setFeatureFormDesc] = useState('');
  const [featureFormShortDesc, setFeatureFormShortDesc] = useState('');
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  useEffect(() => {
    setLoadingFeatures(true);
    const host = window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin;
    fetch(`${host}/api/class-features`)
      .then(res => {
        if (!res.ok) throw new Error("Error al obtener los rasgos de clase");
        return res.json();
      })
      .then((data: any[]) => {
        setClassFeatures(data);
        setLoadingFeatures(false);
      })
      .catch(err => {
        console.error("No se pudieron cargar los rasgos de clase:", err);
        setLoadingFeatures(false);
      });
  }, []);

  const refreshFeaturesList = () => {
    const host = window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin;
    fetch(`${host}/api/class-features`)
      .then(res => res.json())
      .then(data => setClassFeatures(data))
      .catch(err => console.error("Error al refrescar rasgos:", err));
  };

  const openCreateFeatureForm = () => {
    setFeatureFormId(null);
    setFeatureFormClass('');
    setFeatureFormName('');
    setFeatureFormLevel(1);
    setFeatureFormDesc('');
    setFeatureFormShortDesc('');
    setIsEditingFeature(true);
  };

  const openEditFeatureForm = (feat: any) => {
    setFeatureFormId(feat.id);
    setFeatureFormClass(feat.class);
    setFeatureFormName(feat.name);
    setFeatureFormLevel(feat.level);
    setFeatureFormDesc(feat.description);
    setFeatureFormShortDesc(feat.short_description || '');
    setIsEditingFeature(true);
  };

  const handleSaveFeature = () => {
    if (!featureFormClass || !featureFormName || !featureFormDesc) {
      alert("Todos los campos son requeridos.");
      return;
    }

    const host = window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin;
    const payload = {
      class_name: featureFormClass,
      feature_name: featureFormName,
      level_acquired: featureFormLevel,
      description: featureFormDesc,
      short_description: featureFormShortDesc
    };

    if (featureFormId && !isNaN(Number(featureFormId))) {
      fetch(`${host}/api/class-features/${featureFormId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => {
        if (!res.ok) throw new Error("Error al actualizar el rasgo");
        return res.json();
      })
      .then(() => {
        setIsEditingFeature(false);
        refreshFeaturesList();
      })
      .catch(err => alert(err.message));
    } else {
      fetch(`${host}/api/class-features`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => {
        if (!res.ok) throw new Error("Error al crear el rasgo");
        return res.json();
      })
      .then(() => {
        setIsEditingFeature(false);
        refreshFeaturesList();
      })
      .catch(err => alert(err.message));
    }
  };

  const handleDeleteFeature = (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este rasgo de clase de forma permanente?")) return;

    const host = window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin;
    fetch(`${host}/api/class-features/${id}`, {
      method: 'DELETE'
    })
    .then(res => {
      if (!res.ok) throw new Error("Error al eliminar el rasgo");
      return res.json();
    })
    .then(() => {
      refreshFeaturesList();
      setSelectedFeature(null);
    })
    .catch(err => alert(err.message));
  };
  
  // Wizard Crear Clase
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [classWizardStep, setClassWizardStep] = useState(1);
  const [cName, setCName] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cHitDie, setCHitDie] = useState('d8');
  const [cSubclassLvl, setCSubclassLvl] = useState(3);
  const [cSubclassTitle, setCSubclassTitle] = useState('Arquetipo');
  
  const [cArmors, setCArmors] = useState<string[]>([]);
  const [cWeapons, setCWeapons] = useState<string[]>([]);
  const [cTools, setCTools] = useState('');
  const [cSaves, setCSaves] = useState<string[]>([]);
  const [cSkills, setCSkills] = useState<string[]>([]);
  const [cSkillsLimit, setCSkillsLimit] = useState(2);
  
  const [cResourceName, setCResourceName] = useState('');
  const [cResourceProg, setCResourceProg] = useState<string[]>(Array(20).fill(''));
  
  /*
  // Rasgo temporal en el form de rasgos
  const [cTraitName, setCTraitName] = useState('');
  const [cTraitLevel, setCTraitLevel] = useState(1);
  const [cTraitType, setCTraitType] = useState<'Pasivo' | 'Activo' | 'Reacción'>('Pasivo');
  const [cTraitDesc, setCTraitDesc] = useState('');
  
  const [cTraits, setCTraits] = useState<any[]>([]);
  */

  // Estados para Añadir Subclase
  const [isAddingSubclass, setIsAddingSubclass] = useState(false);
  const [subclassName, setSubclassName] = useState('');
  const [subclassDesc, setSubclassDesc] = useState('');
  const [subclassTraits, setSubclassTraits] = useState<any[]>([]);
  
  // Rasgo temporal de subclase
  const [subclassTraitName, setSubclassTraitName] = useState('');
  const [subclassTraitLevel, setSubclassTraitLevel] = useState(3);
  const [subclassTraitDesc, setSubclassTraitDesc] = useState('');


  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const backendUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
      const uploadUrl = `${backendUrl}/api/upload?folder=compendium`;
      
      try {
        const res = await fetch(uploadUrl, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          setCreateImage(data.url);
        } else {
          alert('Error al subir imagen: ' + data.error);
        }
      } catch (err) {
        console.error(err);
        alert('Error de conexión al subir la imagen');
      }
    }
  };

  // const toggleDamage = (type: string, current: string[], setter: (val: string[]) => void) => {
  //   if (current.includes(type)) {
  //     setter(current.filter(t => t !== type));
  //   } else {
  //     setter([...current, type]);
  //   }
  // };

  const handleSave = () => {
    if (!createName) return alert("El elemento necesita un nombre");

    let data: any = { description: createDesc };
    if (createImage) {
      data.image = createImage;
      data.imageZoom = imageZoom;
      data.imagePosX = imagePosX;
      data.imagePosY = imagePosY;
    }

    if (createType === 'monster') {
      data.hit_points = createHp;
      data.armor_class = createAc;
      data.challenge_rating = createCr;
      data.speed = createSpeed;
      data.strength = createStats.str;
      data.dexterity = createStats.dex;
      data.constitution = createStats.con;
      data.intelligence = createStats.int;
      data.wisdom = createStats.wis;
      data.charisma = createStats.cha;
      data.type = "homebrew_monster";
      data.actions = createAttacks.filter(a => a.name || a.desc);
      data.vulnerabilities = createVuln;
      data.resistances = createRes;
      data.immunities = createImm;
      data.size = createSize;
      data.traits = createTraits.filter(t => t.name || t.desc);
    } else if (createType === 'spell') {
      data.short_description = createShortDesc;
      data.level = createSpellLevel;
      data.components = createSpellComponents;
      data.range = createSpellRange;
      data.duration = createSpellDuration;
      data.concentration = createSpellConcentration;
    } else {
      data.rarity = createRarity;
      data.isDamage = isDamageItem;
      data.isProtect = isProtectItem;
      if (isProtectItem) {
        data.defenseBonus = itemDefenseBonus;
      }
      if (isDamageItem) {
        data.attackName = itemAttackName;
        data.attackBonus = itemAttackBonus;
        data.statMod = itemStatMod;
        data.statSelection = itemStatSelection;
        data.targetsCount = itemTargetsCount;
        data.damage = itemDamageFormula;
        data.damageType = itemDamageType;
        data.critDamage = itemCritDamage;
      }
      data.tags = createTags;
      if (createTags.includes('armadura')) {
        data.armorType = createArmorType;
      }
      data.requiresAttunement = createRequiresAttunement;
      data.weight = createWeight;
    }

    if (editingId) {
      socket.emit('content:update', { id: editingId, name: createName, type: createType, data });
    } else {
      socket.emit('content:create', { name: createName, type: createType, data });
    }

    // Reset
    resetForm();
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setCreateName('');
    setCreateDesc('');
    setCreateImage('');
    setCreateType('monster');
    setCreateHp('10');
    setCreateAc(10);
    setCreateCr('');
    setCreateSpeed('30 ft.');
    setCreateStats({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
    setCreateAttacks([{ name: '', desc: '', isAttack: false, actionType: 'Acción', attackBonus: '', damageFormula: '', damageType: 'cortante', range: '' }]);
    setCreateTraits([{ name: '', desc: '' }]);
    setCreateVuln([]);
    setCreateRes([]);
    setCreateImm([]);
    setIsDamageItem(false);
    setItemAttackBonus('');
    setItemDamageFormula('');
    setItemDamageType('cortante');
    setCreateTags([]);

    // Reset spell states
    setCreateShortDesc('');
    setCreateSpellLevel(0);
    setCreateSpellComponents({ V: false, S: false, M: false });
    setCreateSpellRange('');
    setCreateSpellDuration('instantaneo');
    setCreateSpellConcentration(false);

    // Reset item states
    setIsProtectItem(false);
    setItemDefenseBonus('');
    setItemAttackName('');
    setItemStatMod('');
    setItemStatSelection('FUE');
    setItemTargetsCount('1');
    setItemCritDamage('');
    setCreateArmorType('ligera');
    setCreateRequiresAttunement(false);
    setCreateWeight('');
    setImageZoom(1);
    setImagePosX(0);
    setImagePosY(0);
  };

  const handleEditClick = (item: any) => {
    const safeStr = (v: any) => {
      if (typeof v === 'string') return v;
      if (Array.isArray(v)) return v.join('\n');
      return String(v ?? '');
    };

    setSelectedItem(null);
    setIsCreating(true);
    setEditingId(item.id);
    const validTypes = ['monster', 'item', 'class', 'subclass', 'race', 'subrace', 'condition', 'spell'];
    setCreateType(validTypes.includes(item.type) ? (item.type as any) : 'item');
    setCreateName(item.name ?? '');

    let data: any = {};
    try {
      if (item.data) {
        data = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
      }
    } catch { data = {}; }
    if (!data) data = {};

    setImageZoom(data.imageZoom ?? 1);
    setImagePosX(data.imagePosX ?? 0);
    setImagePosY(data.imagePosY ?? 0);

    setCreateDesc(safeStr(data.description ?? data.desc ?? ''));
    setCreateImage(safeStr(data.image ?? ''));

    if (item.type === 'monster') {
      let parsedAc = 10;
      if (typeof data.armor_class === 'number') parsedAc = data.armor_class;
      else if (Array.isArray(data.armor_class)) parsedAc = data.armor_class[0]?.value ?? 10;
      else if (typeof data.armor_class === 'object' && data.armor_class !== null) parsedAc = data.armor_class.value ?? 10;
      else parsedAc = parseInt(data.armor_class ?? data.ac) || 10;

      let parsedSpeed = '30 ft.';
      if (data.speed && typeof data.speed === 'object') {
        parsedSpeed = Object.entries(data.speed).map(([k, v]) => `${k} ${v}`).join(', ');
      } else if (data.speed) {
        parsedSpeed = String(data.speed);
      }

      setCreateHp(safeStr(data.hit_points ?? data.hp ?? '10'));
      setCreateAc(parsedAc);
      setCreateCr(safeStr(data.challenge_rating ?? data.cr ?? ''));
      setCreateSpeed(safeStr(parsedSpeed));
      setCreateStats({
        str: parseInt(data.strength ?? data.str) || 10,
        dex: parseInt(data.dexterity ?? data.dex) || 10,
        con: parseInt(data.constitution ?? data.con) || 10,
        int: parseInt(data.intelligence ?? data.int) || 10,
        wis: parseInt(data.wisdom ?? data.wis) || 10,
        cha: parseInt(data.charisma ?? data.cha) || 10,
      });

      const actionsArray = [
        ...(Array.isArray(data.actions) ? data.actions : []),
        ...(Array.isArray(data.legendary_actions) ? data.legendary_actions : []),
        ...(Array.isArray(data.reactions) ? data.reactions : [])
      ];
      const safeActions = actionsArray.map((a: any) => ({
        name: safeStr(a.name ?? ''),
        desc: safeStr(a.desc ?? a.description ?? ''),
        isAttack: !!a.isAttack,
        actionType: safeStr(a.actionType ?? 'Acción'),
        attackBonus: safeStr(a.attackBonus ?? ''),
        damageFormula: safeStr(a.damageFormula ?? ''),
        damageType: safeStr(a.damageType ?? 'cortante'),
        range: safeStr(a.range ?? '')
      }));
      setCreateAttacks(safeActions.length > 0 ? safeActions : [{ name: '', desc: '', isAttack: false, actionType: 'Acción', attackBonus: '', damageFormula: '', damageType: 'cortante', range: '' }]);
      setCreateVuln(Array.isArray(data.vulnerabilities) ? data.vulnerabilities : []);
      setCreateRes(Array.isArray(data.resistances) ? data.resistances : []);
      setCreateImm(Array.isArray(data.immunities) ? data.immunities : []);
      setCreateSize(safeStr(data.size ?? 'Mediano'));
      const traitsArray = Array.isArray(data.traits) ? data.traits : (Array.isArray(data.special_abilities) ? data.special_abilities : []);
      setCreateTraits(traitsArray.length > 0 ? traitsArray : [{ name: '', desc: '' }]);
    } else if (item.type === 'spell') {
      setCreateShortDesc(safeStr(data.short_description ?? ''));
      setCreateSpellLevel(parseInt(data.level) || 0);
      let comps = { V: false, S: false, M: false };
      if (data.components) {
        if (typeof data.components === 'object') {
          comps = {
            V: !!data.components.V,
            S: !!data.components.S,
            M: !!data.components.M
          };
        } else if (typeof data.components === 'string') {
          const s = data.components.toUpperCase();
          comps = {
            V: s.includes('V'),
            S: s.includes('S'),
            M: s.includes('M')
          };
        }
      }
      setCreateSpellComponents(comps);
      setCreateSpellRange(safeStr(data.range ?? ''));
      setCreateSpellDuration(safeStr(data.duration ?? 'instantaneo'));
      setCreateSpellConcentration(!!data.concentration);
    } else {
      setCreateRarity(safeStr(data.rarity ?? 'Común'));
      setIsDamageItem(!!data.isDamage);
      setItemAttackBonus(safeStr(data.attackBonus ?? ''));
      setItemDamageFormula(safeStr(data.damage ?? ''));
      setItemDamageType(safeStr(data.damageType ?? 'cortante'));
      setCreateTags(Array.isArray(data.tags) ? data.tags : []);
      setCreateArmorType(safeStr(data.armorType ?? 'ligera'));
      setCreateRequiresAttunement(!!data.requiresAttunement);
      setCreateWeight(safeStr(data.weight ?? ''));

      // Cargar nuevos campos avanzados para objetos
      setIsProtectItem(!!data.isProtect);
      setItemDefenseBonus(safeStr(data.defenseBonus ?? ''));
      setItemAttackName(safeStr(data.attackName ?? ''));
      setItemStatMod(safeStr(data.statMod ?? ''));
      setItemStatSelection(safeStr(data.statSelection ?? 'FUE'));
      setItemTargetsCount(safeStr(data.targetsCount ?? '1'));
      setItemCritDamage(safeStr(data.critDamage ?? ''));
    }
  };

  const filteredCompendium = useMemo(() => {
    return compendium
      .filter((item: any) => {
        const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = category === 'all' || item.type === category;
        return matchesSearch && matchesCategory;
      })
      .sort((a: any, b: any) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
      });
  }, [compendium, searchTerm, category]);

  const totalPages = Math.max(1, Math.ceil(filteredCompendium.length / PAGE_SIZE));
  const pagedItems = filteredCompendium.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (val: string) => { setSearchTerm(val); setCurrentPage(1); };
  const handleCategory = (val: any) => { setCategory(val); setCurrentPage(1); };


  // --- HELPERS Y WIZARDS DE CLASES ---
  
  const classesList = useMemo(() => {
    const srdList = srdDisconnected ? [] : EMERGENCY_SRD_CLASSES.map((cls: any) => ({
      ...cls,
      id: `srd-${cls.name}`,
      displaySource: 'srd',
      data: {
        description: cls.desc,
        hit_dice: cls.hit_dice,
        subclass_level: cls.subclass_level,
        subclass_title: cls.subclass_title,
        prof_saving_throws: cls.prof_saving_throws,
        prof_skills: cls.prof_skills,
        prof_armor: cls.prof_armor,
        prof_weapons: cls.prof_weapons,
        prof_tools: cls.prof_tools,
        table: cls.table,
        traits: cls.traits,
        subclasses: cls.subclasses,
      }
    }));

    const dbClasses = compendium.filter((item: any) => item.type === 'class');
    const merged: any[] = [];
    const dbClassNames = new Set(dbClasses.map((c: any) => c.name.toLowerCase()));

    srdList.forEach((srdCls: any) => {
      const isOverridden = dbClassNames.has(srdCls.name.toLowerCase());
      if (isOverridden) {
        const dbCls = dbClasses.find((c: any) => c.name.toLowerCase() === srdCls.name.toLowerCase());
        merged.push({
          ...dbCls,
          displaySource: 'modified',
        });
      } else {
        merged.push(srdCls);
      }
    });

    dbClasses.forEach((dbCls: any) => {
      const isOverriding = EMERGENCY_SRD_CLASSES.some(srd => srd.name.toLowerCase() === dbCls.name.toLowerCase());
      if (!isOverriding) {
        merged.push({
          ...dbCls,
          displaySource: 'custom',
        });
      }
    });

    return merged;
  }, [compendium, srdDisconnected]);

  const allMergedFeatures = useMemo(() => {
    const merged: any[] = [];
    const seenKeys = new Set<string>();

    // 1. Add DB features
    classFeatures.forEach((f: any) => {
      const key = `${f.class.toLowerCase()}-${f.name.toLowerCase()}`;
      merged.push(f);
      seenKeys.add(key);
    });

    // 2. Add EMERGENCY_SRD_CLASSES traits
    EMERGENCY_SRD_CLASSES.forEach((cls: any) => {
      if (cls.traits) {
        cls.traits.forEach((t: any) => {
          const key = `${cls.name.toLowerCase()}-${t.name.toLowerCase()}`;
          if (!seenKeys.has(key)) {
            merged.push({
              id: `srd-${cls.name}-${t.name}`,
              name: t.name,
              class: cls.name,
              level: t.level,
              description: t.desc || t.description,
              source: 'srd'
            });
            seenKeys.add(key);
          }
        });
      }
    });

    // 3. Add custom classes traits from compendium
    compendium.filter((item: any) => item.type === 'class').forEach((cls: any) => {
      let cData: any = {};
      try {
        cData = cls.data ? (typeof cls.data === 'string' ? JSON.parse(cls.data) : cls.data) : {};
      } catch { cData = {}; }
      if (cData.traits) {
        cData.traits.forEach((t: any) => {
          const key = `${cls.name.toLowerCase()}-${t.name.toLowerCase()}`;
          if (!seenKeys.has(key)) {
            merged.push({
              id: `compendium-${cls.id}-${t.name}`,
              name: t.name,
              class: cls.name,
              level: t.level,
              description: t.desc || t.description,
              source: 'custom'
            });
            seenKeys.add(key);
          }
        });
      }
    });

    // 4. Add custom subclasses traits from compendium
    compendium.filter((item: any) => item.type === 'subclass').forEach((sub: any) => {
      let sData: any = {};
      try {
        sData = sub.data ? (typeof sub.data === 'string' ? JSON.parse(sub.data) : sub.data) : {};
      } catch { sData = {}; }
      if (sData.traits) {
        sData.traits.forEach((t: any) => {
          const key = `${sub.name.toLowerCase()}-${t.name.toLowerCase()}`;
          if (!seenKeys.has(key)) {
            merged.push({
              id: `subclass-${sub.id}-${t.name}`,
              name: t.name,
              class: sData.class_parent || 'Desconocida',
              subclass: sub.name,
              level: t.level,
              description: t.desc || t.description,
              source: 'custom'
            });
            seenKeys.add(key);
          }
        });
      }
    });

    return merged;
  }, [compendium, classFeatures]);

  const handleImportSRD = async () => {
    setIsImportingClasses(true);
    setTimeout(() => {
      setSrdDisconnected(false);
      setIsImportingClasses(false);
    }, 1000);
  };

  const handleEditClassClick = (cls: any) => {
    let cData: any = {};
    try {
      cData = cls.data ? (typeof cls.data === 'string' ? JSON.parse(cls.data) : cls.data) : {};
    } catch { cData = {}; }

    setEditingClassId(cls.id);
    setCName(cls.name || '');
    setCDesc(cData.desc || cData.description || '');
    setCHitDie(cData.hit_dice || 'd8');
    setCSubclassLvl(cData.subclass_level || 3);
    setCSubclassTitle(cData.subclass_title || 'Arquetipo');

    const parseStrArray = (val: any) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') return val.split(',').map((s: string) => s.trim()).filter(Boolean);
      return [];
    };

    setCArmors(parseStrArray(cData.prof_armor));
    setCWeapons(parseStrArray(cData.prof_weapons));
    setCTools(cData.prof_tools || '');
    setCSaves(parseStrArray(cData.prof_saving_throws));
    setCSkills(parseStrArray(cData.prof_skills));
    setCSkillsLimit(cData.skills_limit || 2);
    setCResourceName(cData.resource_name || '');
    setCResourceProg(cData.resource_progression || Array(20).fill(''));
    // setCTraits(cData.traits || []);

    setClassWizardStep(1);
    setIsCreatingClass(true);
  };

  const generateTableMarkdown = (resourceName: string, resourceProg: string[], traitsList: any[]) => {
    let headers = ['Nivel', 'Bono de Competencia', 'Rasgos'];
    if (resourceName) {
      headers.push(resourceName);
    }
    
    let headerLine = `| ${headers.join(' | ')} |`;
    let dividerLine = `| ${headers.map(() => '---').join(' | ')} |`;
    
    let rows: string[] = [];
    for (let lvl = 1; lvl <= 20; lvl++) {
      const profBonus = `+${1 + Math.ceil(lvl / 4)}`;
      const lvlTraits = traitsList
        .filter((t: any) => parseInt(t.level) === lvl)
        .map((t: any) => t.name)
        .join(', ');
        
      let cells = [
        `${lvl}º`,
        profBonus,
        lvlTraits || 'Mejora de Característica'
      ];
      
      if (resourceName) {
        cells.push(resourceProg[lvl - 1] || '—');
      }
      
      rows.push(`| ${cells.join(' | ')} |`);
    }
    
    return [headerLine, dividerLine, ...rows].join('\n');
  };

  const getValidSubclassLevels = (clsName: string, activeData: any) => {
    const name = clsName?.toLowerCase() || '';
    if (name.includes('guerrero') || name.includes('fighter')) return [3, 7, 10, 15, 18];
    if (name.includes('pícaro') || name.includes('rogue')) return [3, 9, 13, 17];
    if (name.includes('mago') || name.includes('wizard')) return [2, 6, 10, 14];
    if (name.includes('clérigo') || name.includes('cleric')) return [1, 2, 6, 8, 17];
    if (name.includes('paladín') || name.includes('paladin')) return [3, 7, 15, 20];
    if (name.includes('bardo') || name.includes('bard')) return [3, 6, 14];
    if (name.includes('druida') || name.includes('druid')) return [2, 6, 10, 14];
    if (name.includes('monje') || name.includes('monk')) return [3, 6, 11, 17];
    if (name.includes('explorador') || name.includes('ranger')) return [3, 7, 11, 15];
    if (name.includes('hechicero') || name.includes('sorcerer')) return [1, 6, 14, 18];
    if (name.includes('warlock') || name.includes('brujo')) return [1, 6, 10, 14];
    if (name.includes('bárbaro') || name.includes('barbarian')) return [3, 6, 10, 14];
    
    const first = activeData?.subclass_level || 3;
    return [first, first + 4, first + 7, first + 12].filter((l: number) => l <= 20);
  };

  const renderClassWizardModal = () => {
    if (!isCreatingClass) return null;

    const steps = [
      { num: 1, name: 'Identidad' },
      { num: 2, name: 'Competencias' },
      { num: 3, name: 'Recursos' },
      { num: 4, name: 'Revisión' }
    ];

    const armorOptions = ['Acolchada', 'Cuero', 'Piel', 'Cota de Malla', 'Placas', 'Escudos', 'Todas las armaduras'];
    const weaponOptions = ['Armas Simples', 'Armas Marciales', 'Ballestas de mano', 'Espadas cortas', 'Estoques'];
    const saveOptions = ['Fuerza', 'Destreza', 'Constitución', 'Inteligencia', 'Sabiduría', 'Carisma'];
    const skillOptions = [
      'Atletismo', 'Acrobacias', 'Juego de Manos', 'Sigilo',
      'Arcanos', 'Historia', 'Investigación', 'Naturaleza', 'Religión',
      'Trato con Animales', 'Intuición', 'Medicina', 'Percepción', 'Supervivencia',
      'Engaño', 'Intimidación', 'Interpretación', 'Persuasión'
    ];

    const handleArmorToggle = (val: string) => {
      setCArmors(cArmors.includes(val) ? cArmors.filter(x => x !== val) : [...cArmors, val]);
    };

    const handleWeaponToggle = (val: string) => {
      setCWeapons(cWeapons.includes(val) ? cWeapons.filter(x => x !== val) : [...cWeapons, val]);
    };

    const handleSaveToggle = (val: string) => {
      if (cSaves.includes(val)) {
        setCSaves(cSaves.filter(x => x !== val));
      } else {
        if (cSaves.length >= 2) {
          setCSaves([cSaves[1], val]);
        } else {
          setCSaves([...cSaves, val]);
        }
      }
    };

    const handleSkillToggle = (val: string) => {
      if (cSkills.includes(val)) {
        setCSkills(cSkills.filter(x => x !== val));
      } else {
        if (cSkills.length < cSkillsLimit) {
          setCSkills([...cSkills, val]);
        } else {
          alert(`Solo puedes elegir hasta ${cSkillsLimit} habilidades.`);
        }
      }
    };

    const handleSaveClass = () => {
      if (!cName) return alert("La clase requiere un nombre.");
      
      const data = {
        description: cDesc,
        hit_dice: cHitDie,
        subclass_level: cSubclassLvl,
        subclass_title: cSubclassTitle,
        prof_saving_throws: cSaves.join(', '),
        prof_skills: cSkills.join(', '),
        prof_armor: cArmors.join(', '),
        prof_weapons: cWeapons.join(', '),
        prof_tools: cTools,
        resource_name: cResourceName,
        resource_progression: cResourceProg,
        table: generateTableMarkdown(cResourceName, cResourceProg, []),
        traits: []
      };

      if (editingClassId && !String(editingClassId).startsWith('srd-')) {
        socket.emit('content:update', { id: editingClassId, name: cName, type: 'class', data });
      } else {
        socket.emit('content:create', { name: cName, type: 'class', data, source: 'custom' });
      }

      setIsCreatingClass(false);
    };

    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, overflowY: 'auto', padding: '40px 0'
      }}>
        <div className="clipped-frame" style={{
          background: 'var(--bg-surface)', border: '2px solid var(--border-color)',
          width: '90%', maxWidth: '800px', padding: '40px', position: 'relative',
          boxShadow: '0 25px 80px rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', gap: '30px'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.8rem' }}>
              {editingClassId ? 'FORJAR CLASE MODIFICADA' : 'FORJAR NUEVA CLASE'}
            </h2>
            <button onClick={() => setIsCreatingClass(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.8rem', cursor: 'pointer' }}>✕</button>
          </div>

          {/* Steps Indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
            {steps.map(s => (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="mono" style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: classWizardStep === s.num ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                  color: classWizardStep === s.num ? 'white' : 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem',
                  border: `1px solid ${classWizardStep === s.num ? 'var(--accent-gold)' : 'var(--border-color)'}`
                }}>{s.num}</span>
                <span className="font-cinzel" style={{
                  color: classWizardStep === s.num ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  fontSize: '0.85rem', fontWeight: classWizardStep === s.num ? 'bold' : 'normal'
                }}>{s.name}</span>
              </div>
            ))}
          </div>

          {/* Step Contents */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '55vh', overflowY: 'auto', paddingRight: '10px' }}>
            {classWizardStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Nombre de la Clase</label>
                  <input className="mono" style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }} placeholder="Ej: Guerrero, Bárbaro..." value={cName} onChange={e => setCName(e.target.value)} />
                </div>
                <div>
                  <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Descripción / Lore de la Clase</label>
                  <textarea className="mono" style={{ width: '100%', height: '120px', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none', resize: 'none' }} placeholder="Escribe el lore o historia de la clase..." value={cDesc} onChange={e => setCDesc(e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <div>
                    <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Dado de Golpe</label>
                    <select className="mono" style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)' }} value={cHitDie} onChange={e => setCHitDie(e.target.value)}>
                      {['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].map(hd => <option key={hd} value={hd}>{hd}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Nivel de Subclase</label>
                    <input className="mono" type="number" min="1" max="20" style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)' }} value={cSubclassLvl} onChange={e => setCSubclassLvl(parseInt(e.target.value) || 3)} />
                  </div>
                  <div>
                    <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Título de Elección</label>
                    <input className="mono" style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)' }} placeholder="Ej: Arquetipo, Colegio..." value={cSubclassTitle} onChange={e => setCSubclassTitle(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {classWizardStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div>
                  <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Tiradas de Salvación (Elige exactamente 2)</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {saveOptions.map(save => {
                      const selected = cSaves.includes(save);
                      return (
                        <button key={save} onClick={() => handleSaveToggle(save)} className="mono" style={{
                          padding: '8px 16px', background: selected ? 'rgba(200, 135, 42, 0.2)' : 'var(--bg-base)',
                          border: `1px solid ${selected ? 'var(--accent-gold)' : 'var(--border-color)'}`,
                          color: selected ? 'var(--accent-gold)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s'
                        }}>{save}</button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Competencias en Armaduras</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {armorOptions.map(a => (
                        <label key={a} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-parchment)', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input type="checkbox" checked={cArmors.includes(a)} onChange={() => handleArmorToggle(a)} /> {a}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Competencias en Armas</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {weaponOptions.map(w => (
                        <label key={w} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-parchment)', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input type="checkbox" checked={cWeapons.includes(w)} onChange={() => handleWeaponToggle(w)} /> {w}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'flex-end' }}>
                  <div>
                    <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Herramientas y Otros</label>
                    <input className="mono" style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)' }} placeholder="Ej: Herramientas de Ladrón..." value={cTools} onChange={e => setCTools(e.target.value)} />
                  </div>
                  <div>
                    <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Límite Habilidades</label>
                    <input className="mono" type="number" min="1" max="10" style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)' }} value={cSkillsLimit} onChange={e => setCSkillsLimit(parseInt(e.target.value) || 2)} />
                  </div>
                </div>

                <div>
                  <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Elegir Habilidades Disponibles</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                    {skillOptions.map(sk => {
                      const selected = cSkills.includes(sk);
                      return (
                        <button key={sk} onClick={() => handleSkillToggle(sk)} className="mono" style={{
                          padding: '6px', background: selected ? 'rgba(200, 135, 42, 0.15)' : 'var(--bg-base)',
                          border: `1px solid ${selected ? 'var(--accent-gold)' : 'var(--border-color)'}`,
                          color: selected ? 'var(--accent-gold)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.1s', fontSize: '0.75rem'
                        }}>{sk}</button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {classWizardStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Nombre del Recurso de Clase (Opcional)</label>
                  <input className="mono" style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }} placeholder="Ej: Puntos de Furia, Puntos de Ki..." value={cResourceName} onChange={e => setCResourceName(e.target.value)} />
                </div>

                {cResourceName && (
                  <div>
                    <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '12px' }}>Progreso del Recurso por Nivel (1-20)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                      {Array(20).fill(0).map((_, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span className="mono" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', width: '30px' }}>N{i+1}:</span>
                          <input className="mono" style={{ width: '60px', padding: '6px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', textAlign: 'center' }} placeholder="—" value={cResourceProg[i]} onChange={e => {
                            const newProg = [...cResourceProg];
                            newProg[i] = e.target.value;
                            setCResourceProg(newProg);
                          }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {classWizardStep === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', background: 'rgba(0,0,0,0.15)', padding: '25px', border: '1px solid var(--border-color)' }}>
                <h3 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.6rem', textAlign: 'center' }}>📋 REVISIÓN DE LA CREACIÓN</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', color: 'var(--text-parchment)', fontSize: '0.95rem' }}>
                  <div><b>Nombre de la Clase:</b> {cName || <span style={{ color: 'red' }}>Requerido</span>}</div>
                  <div><b>Dado de Golpe:</b> {cHitDie}</div>
                  <div><b>Descripción / Lore:</b> <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', margin: '5px 0 0 0', fontSize: '0.85rem' }}>{cDesc || 'Sin descripción.'}</p></div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                    <div>
                      <div style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '5px' }}>Competencias</div>
                      <div><b>Salvaciones:</b> {cSaves.join(', ') || 'Ninguna'}</div>
                      <div><b>Armadura:</b> {cArmors.join(', ') || 'Ninguna'}</div>
                      <div><b>Armas:</b> {cWeapons.join(', ') || 'Ninguna'}</div>
                      <div><b>Herramientas:</b> {cTools || 'Ninguna'}</div>
                      <div><b>Habilidades:</b> {cSkills.join(', ') || 'Ninguna'}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '5px' }}>Estructura</div>
                      <div><b>Subclase:</b> Nivel {cSubclassLvl} ({cSubclassTitle})</div>
                      <div><b>Recurso:</b> {cResourceName || 'Ninguno'}</div>
                      <div><b>Tabla Progresión:</b> Se generará una tabla del nivel 1 al 20 vacía de rasgos por defecto.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <button
              disabled={classWizardStep === 1}
              onClick={() => setClassWizardStep(classWizardStep - 1)}
              className="font-cinzel"
              style={{
                background: 'transparent', border: '1px solid var(--border-color)', color: classWizardStep === 1 ? 'var(--text-secondary)' : 'var(--text-parchment)',
                padding: '10px 20px', cursor: classWizardStep === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              ATRÁS
            </button>

            {classWizardStep < 4 ? (
              <button
                onClick={() => setClassWizardStep(classWizardStep + 1)}
                className="font-cinzel torch-glow"
                style={{ background: 'var(--accent-gold)', border: 'none', color: 'white', padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                SIGUIENTE
              </button>
            ) : (
              <button
                onClick={handleSaveClass}
                className="font-cinzel torch-glow"
                style={{ background: '#10b981', border: 'none', color: 'white', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {editingClassId ? 'GUARDAR CAMBIOS' : 'FORJAR CLASE'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSubclassModal = (parentClass: any) => {
    if (!isAddingSubclass || !parentClass) return null;

    let activeData: any = {};
    try {
      activeData = parentClass.data ? (typeof parentClass.data === 'string' ? JSON.parse(parentClass.data) : parentClass.data) : {};
    } catch { activeData = {}; }

    const validLevels = getValidSubclassLevels(parentClass.name, activeData);

    const addSubclassTrait = () => {
      if (!subclassTraitName || !subclassTraitDesc) return alert("Nombre y descripción del rasgo de subclase son requeridos.");
      const newTrait = {
        name: subclassTraitName,
        level: subclassTraitLevel,
        desc: subclassTraitDesc
      };
      setSubclassTraits([...subclassTraits, newTrait].sort((a,b) => a.level - b.level));
      setSubclassTraitName('');
      setSubclassTraitDesc('');
    };

    const removeSubclassTrait = (idx: number) => {
      setSubclassTraits(subclassTraits.filter((_, i) => i !== idx));
    };

    const handleSaveSubclass = () => {
      if (!subclassName) return alert("La subclase requiere un nombre.");
      
      const data = {
        class_parent: parentClass.name,
        description: subclassDesc,
        traits: subclassTraits
      };

      socket.emit('content:create', {
        name: subclassName,
        type: 'subclass',
        data,
        source: 'custom'
      });

      setIsAddingSubclass(false);
    };

    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, overflowY: 'auto', padding: '40px 0'
      }}>
        <div className="clipped-frame" style={{
          background: 'var(--bg-surface)', border: '2px solid var(--border-color)',
          width: '90%', maxWidth: '700px', padding: '40px', position: 'relative',
          boxShadow: '0 25px 80px rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', gap: '25px'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.6rem' }}>
              AGREGAR SUBCLASE A {parentClass.name.toUpperCase()}
            </h2>
            <button onClick={() => setIsAddingSubclass(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.8rem', cursor: 'pointer' }}>✕</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
            <div>
              <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Nombre de la Subclase</label>
              <input className="mono" style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }} placeholder={`Ej: Juramento de la Devoción, Asesino...`} value={subclassName} onChange={e => setSubclassName(e.target.value)} />
            </div>

            <div>
              <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px' }}>Descripción de la Subclase</label>
              <textarea className="mono" style={{ width: '100%', height: '100px', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none', resize: 'none' }} placeholder="Escribe el trasfondo o lore de esta especialización..." value={subclassDesc} onChange={e => setSubclassDesc(e.target.value)} />
            </div>

            {/* Agregar rasgo */}
            <div style={{ border: '1px solid var(--border-color)', padding: '15px', background: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '0.9rem' }}>🛡️ AGREGAR RASGO DE SUBCLASE</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nombre del Rasgo</label>
                  <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={subclassTraitName} onChange={e => setSubclassTraitName(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nivel de Obtención</label>
                  <select className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={subclassTraitLevel} onChange={e => setSubclassTraitLevel(parseInt(e.target.value) || 3)}>
                    {validLevels.map(lvl => <option key={lvl} value={lvl}>Nivel {lvl}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Descripción del Rasgo</label>
                <textarea className="mono" style={{ width: '100%', height: '60px', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', resize: 'none' }} value={subclassTraitDesc} onChange={e => setSubclassTraitDesc(e.target.value)} />
              </div>
              <button onClick={addSubclassTrait} className="font-cinzel torch-glow" style={{ width: '100%', background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', padding: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>+ AGREGAR RASGO DE SUBCLASE</button>
            </div>

            <div>
              <h4 className="font-cinzel" style={{ margin: '0 0 10px 0', color: 'var(--text-parchment)', fontSize: '0.95rem' }}>Rasgos de Subclase definidos ({subclassTraits.length})</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {subclassTraits.map((t, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '8px 12px', fontSize: '0.85rem' }}>
                    <div>
                      <span className="font-cinzel" style={{ fontWeight: 'bold', color: 'var(--accent-gold)' }}>Nivel {t.level} — {t.name}</span>
                    </div>
                    <button onClick={() => removeSubclassTrait(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--combat-red)', cursor: 'pointer', fontSize: '1rem' }}>🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <button onClick={() => setIsAddingSubclass(false)} className="font-cinzel" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', padding: '10px 20px', cursor: 'pointer' }}>CANCELAR</button>
            <button onClick={handleSaveSubclass} className="font-cinzel torch-glow" style={{ background: '#10b981', border: 'none', color: 'white', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold' }}>CREAR SUBCLASE</button>
          </div>
        </div>
      </div>
    );
  };

  const renderFeatureCrudModal = () => {
    if (!isEditingFeature) return null;

    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 99999, overflowY: 'auto', padding: '40px 0'
      }} onClick={() => setIsEditingFeature(false)}>
        <div className="clipped-frame" style={{
          background: 'var(--bg-surface)', border: '2px solid var(--border-color)',
          width: '90%', maxWidth: '600px', padding: '40px', position: 'relative',
          boxShadow: '0 25px 80px rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', gap: '30px'
        }} onClick={e => e.stopPropagation()}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
            <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.8rem' }}>
              {featureFormId ? 'FORJAR RASGO MODIFICADO' : 'REGISTRAR NUEVO RASGO'}
            </h2>
            <button onClick={() => setIsEditingFeature(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '1.8rem', cursor: 'pointer' }}>✕</button>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>Nombre del Rasgo</label>
              <input 
                className="mono font-cinzel" 
                style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none', fontSize: '1.1rem' }} 
                placeholder="Ej: Furia, Acción en Oleada..." 
                value={featureFormName} 
                onChange={e => setFeatureFormName(e.target.value)} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              <div>
                <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>Clase Perteneciente</label>
                <input 
                  className="mono font-cinzel" 
                  style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }} 
                  placeholder="Ej: Guerrero, Bárbaro, Mago..." 
                  value={featureFormClass} 
                  onChange={e => setFeatureFormClass(e.target.value)} 
                />
              </div>

              <div>
                <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>Nivel de Obtención</label>
                <select 
                  className="mono" 
                  style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }} 
                  value={featureFormLevel} 
                  onChange={e => setFeatureFormLevel(parseInt(e.target.value) || 1)}
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map(lvl => (
                    <option key={lvl} value={lvl}>Nivel {lvl}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>Descripción Corta (se muestra al pasar el cursor)</label>
              <input 
                className="mono" 
                style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }} 
                placeholder="Ej: Adoptas un estilo de combate particular como tu especialidad ( CA +1, Duelista +2...)." 
                value={featureFormShortDesc} 
                onChange={e => setFeatureFormShortDesc(e.target.value)} 
              />
            </div>

            <div>
              <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>Descripción de la Habilidad</label>
              <textarea 
                className="mono" 
                style={{ width: '100%', height: '180px', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none', resize: 'none', lineHeight: '1.6' }} 
                placeholder="Escribe la descripción completa del rasgo de clase y sus efectos..." 
                value={featureFormDesc} 
                onChange={e => setFeatureFormDesc(e.target.value)} 
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <button onClick={() => setIsEditingFeature(false)} className="font-cinzel" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', padding: '10px 20px', cursor: 'pointer' }}>CANCELAR</button>
            <button onClick={handleSaveFeature} className="font-cinzel torch-glow" style={{ background: 'var(--accent-gold)', border: 'none', color: 'white', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold' }}>
              {featureFormId ? 'GUARDAR CAMBIOS' : 'FORJAR RASGO'}
            </button>
          </div>
        </div>
      </div>
    );
  };



  // When used as overlay, we only need the fixed-position detail modal.
  // The main layout must NOT render with display:none because position:fixed
  // children are clipped by it.
  if (isOverlay) {
    if (!selectedItem) return null;
    // Render just the detail panel trigger — the IIFE below will handle it
  }

  return (
    <div style={{ width: '100%', height: isOverlay ? 0 : 'calc(100vh - 120px)', background: 'var(--bg-base)', display: 'flex', overflow: isOverlay ? 'visible' : 'hidden' }}>
      {/* SIDEBAR DE CATEGORÍAS */}
      <div style={{ width: '220px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', padding: '30px 0' }}>
        <div style={{ padding: '0 20px', marginBottom: '30px' }}>
          <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.2rem', letterSpacing: '2px' }}>BIBLIOTECA</h2>
          <div style={{ width: '40px', height: '2px', background: 'var(--accent-gold)', marginTop: '10px' }} />
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {['all', 'monster', 'spell', 'item', 'class', 'subclass', 'race', 'subrace', 'condition', 'features'].map(cat => (
            <button
              key={cat}
              onClick={() => handleCategory(cat as any)}
              className="font-cinzel torch-glow"
              style={{
                textAlign: 'left',
                padding: '12px 25px',
                background: category === cat ? 'rgba(200, 135, 42, 0.1)' : 'transparent',
                color: category === cat ? 'var(--accent-gold)' : 'var(--text-secondary)',
                border: 'none',
                borderLeft: category === cat ? '3px solid var(--accent-gold)' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.2s'
              }}
            >
              {cat === 'all' ? 'Ver Todo' : typeIcons[cat]}
            </button>
          ))}
        </div>

        {(userRole === 'admin' || userRole === 'dm') && (() => {
          let btnText = '+ NUEVO';
          let btnAction = () => {
            resetForm();
            setIsCreating(true);
          };

          if (category === 'monster') {
            btnText = '+ NUEVO MONSTRUO';
            btnAction = () => {
              resetForm();
              setCreateType('monster');
              setIsCreating(true);
            };
          } else if (category === 'item') {
            btnText = '+ NUEVO OBJETO';
            btnAction = () => {
              resetForm();
              setCreateType('item');
              setIsCreating(true);
            };
          } else if (category === 'features') {
            btnText = '+ NUEVO RASGO';
            btnAction = () => {
              openCreateFeatureForm();
            };
          } else if (category === 'class') {
            btnText = '+ NUEVA CLASE';
            btnAction = () => {
              setEditingClassId(null);
              setCName('');
              setCDesc('');
              setCHitDie('d8');
              setCSubclassLvl(3);
              setCSubclassTitle('Arquetipo');
              setCArmors([]);
              setCWeapons([]);
              setCTools('');
              setCSaves([]);
              setCSkills([]);
              setCSkillsLimit(2);
              setCResourceName('');
              setCResourceProg(Array(20).fill(''));
              // setCTraits([]);
              setClassWizardStep(1);
              setIsCreatingClass(true);
            };
          } else if (category === 'spell') {
            btnText = '+ NUEVO HECHIZO';
            btnAction = () => {
              resetForm();
              setCreateType('spell');
              setIsCreating(true);
            };
          } else if (category === 'subclass') {
            btnText = '+ NUEVA SUBCLASE';
            btnAction = () => alert('La creación de subclases por separado no está disponible por ahora. Puedes añadir subclases editando una clase base.');
          } else if (category === 'race') {
            btnText = '+ NUEVA RAZA';
            btnAction = () => alert('La creación de razas personalizadas estará disponible próximamente.');
          } else if (category === 'subrace') {
            btnText = '+ NUEVA SUBRAZA';
            btnAction = () => alert('La creación de subrazas personalizadas estará disponible próximamente.');
          } else if (category === 'condition') {
            btnText = '+ NUEVO ESTADO';
            btnAction = () => alert('La creación de estados y condiciones personalizados estará disponible próximamente.');
          } else if (category === 'all') {
            btnText = '+ NUEVO REGISTRO';
            btnAction = () => alert('Por favor, selecciona una categoría específica (ej. Monstruos, Clases, Rasgos) en el menú lateral para crear un nuevo registro.');
          }

          const isPlaceholder = ['subclass', 'race', 'subrace', 'condition', 'all'].includes(category);

          return (
            <div style={{ padding: '0 20px', marginTop: '20px' }}>
              <button
                onClick={btnAction}
                className="font-cinzel torch-glow"
                style={{ 
                  width: '100%', 
                  background: isPlaceholder ? 'rgba(255,255,255,0.03)' : 'var(--accent-gold)', 
                  color: isPlaceholder ? 'var(--text-secondary)' : 'white', 
                  border: isPlaceholder ? '1px solid var(--border-color)' : 'none', 
                  padding: '12px', 
                  borderRadius: '4px', 
                  fontWeight: 'bold', 
                  cursor: 'pointer', 
                  fontSize: '0.75rem',
                  opacity: isPlaceholder ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (isPlaceholder) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isPlaceholder) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  }
                }}
              >
                {btnText}
              </button>
            </div>
          );
        })()}
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '60px', position: 'relative' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px', borderBottom: '2px solid var(--border-color)', paddingBottom: '20px' }}>
            <div>
              <h1 className="font-cinzel" style={{ margin: 0, color: 'var(--text-parchment)', fontSize: '3rem', fontWeight: '900' }}>Compendio</h1>
              <p style={{ color: 'var(--text-secondary)', margin: '10px 0 0 0', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>Registros oficiales del reino</p>
            </div>
            <div style={{ width: '350px' }}>
              <input 
                className="mono clipped-frame"
                style={{ width: '100%', padding: '12px 20px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }}
                placeholder="Buscar pergamino..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

              {category === 'class' ? (() => {
                const activeClass = selectedClass || classesList[0];
                let activeData: any = {};
                if (activeClass) {
                  try {
                    activeData = activeClass.data ? (typeof activeClass.data === 'string' ? JSON.parse(activeClass.data) : activeClass.data) : {};
                  } catch { activeData = {}; }
                }

                if (classesList.length === 0) {
                  return (
                    <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', background: 'var(--bg-base)' }}>
                      <div className="clipped-frame torch-glow" style={{
                        background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                        padding: '50px', textAlign: 'center', maxWidth: '600px',
                        boxShadow: '0 25px 80px rgba(0,0,0,0.6)'
                      }}>
                        <div style={{ fontSize: '4.5rem', marginBottom: '20px', filter: 'drop-shadow(0 0 10px var(--accent-gold))' }}>🛡️</div>
                        <h2 className="font-cinzel" style={{ margin: '0 0 15px 0', color: 'var(--text-parchment)', fontSize: '2rem' }}>El Compendio de Clases está Vacío</h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '35px' }}>
                          No se han registrado clases en la biblioteca. Conecta el archivo SRD oficial para descargar las clases básicas o forja tu propia clase personalizada ahora mismo.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                          <button
                            onClick={handleImportSRD}
                            disabled={isImportingClasses}
                            className="font-cinzel torch-glow"
                            style={{
                              background: 'var(--accent-gold)', border: 'none', color: 'white',
                              padding: '12px 25px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px'
                            }}
                          >
                            {isImportingClasses ? 'CONECTANDO SRD...' : 'CONECTAR ARCHIVO SRD'}
                          </button>
                          <button
                            onClick={() => {
                              setEditingClassId(null);
                              setCName(''); setCDesc(''); setCHitDie('d8'); setCSubclassLvl(3); setCSubclassTitle('Arquetipo');
                              setCArmors([]); setCWeapons([]); setCTools(''); setCSaves([]); setCSkills([]); setCSkillsLimit(2);
                              setCResourceName(''); setCResourceProg(Array(20).fill('')); // setCTraits([]);
                              setClassWizardStep(1);
                              setIsCreatingClass(true);
                            }}
                            className="font-cinzel"
                            style={{
                              background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-parchment)',
                              padding: '12px 25px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px'
                            }}
                          >
                            CREAR CLASE
                          </button>
                        </div>
                      </div>
                      {renderClassWizardModal()}
                    </div>
                  );
                }

                const filteredClasses = classesList.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()));

                return (
                  <div style={{ flex: 1, display: 'flex', height: '100%', overflow: 'hidden' }}>
                    <div style={{ width: '320px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.15)' }}>
                      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
                        <input
                          className="mono"
                          style={{ width: '100%', padding: '10px 15px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }}
                          placeholder="Buscar clase..."
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                        />
                      </div>
                      
                      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                        {filteredClasses.map(cls => {
                          const isActive = activeClass && activeClass.id === cls.id;
                          let cData: any = {};
                          try {
                            cData = cls.data ? (typeof cls.data === 'string' ? JSON.parse(cls.data) : cls.data) : {};
                          } catch { cData = {}; }
                          
                          return (
                            <div
                              key={cls.id}
                              className={`clipped-frame ${isActive ? 'torch-glow' : ''}`}
                              onClick={() => setSelectedClass(cls)}
                              style={{
                                padding: '15px 20px', marginBottom: '12px', cursor: 'pointer',
                                background: isActive ? 'rgba(200, 135, 42, 0.1)' : 'var(--bg-surface)',
                                border: `1px solid ${isActive ? 'var(--accent-gold)' : 'var(--border-color)'}`,
                                transition: 'all 0.2s', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                              }}
                            >
                              <div>
                                <h4 className="font-cinzel" style={{ margin: 0, color: isActive ? 'var(--accent-gold)' : 'var(--text-parchment)', fontSize: '1.05rem' }}>{cls.name}</h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dado de Golpe: {cData.hit_dice || 'd8'}</span>
                              </div>
                              {cls.displaySource === 'srd' && <span className="font-cinzel" style={{ border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', fontSize: '0.6rem', padding: '2px 6px', fontWeight: 'bold' }}>SRD</span>}
                              {cls.displaySource === 'custom' && <span className="font-cinzel" style={{ border: '1px solid #10b981', color: '#10b981', fontSize: '0.6rem', padding: '2px 6px', fontWeight: 'bold' }}>CUSTOM</span>}
                              {cls.displaySource === 'modified' && <span className="font-cinzel" style={{ border: '1px solid #f97316', color: '#f97316', fontSize: '0.6rem', padding: '2px 6px', fontWeight: 'bold' }}>MODIFICADO</span>}
                            </div>
                          );
                        })}
                      </div>

                      {(userRole === 'admin' || userRole === 'dm') && (
                        <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
                          <button
                            className="font-cinzel torch-glow"
                            onClick={() => {
                              setEditingClassId(null);
                              setCName(''); setCDesc(''); setCHitDie('d8'); setCSubclassLvl(3); setCSubclassTitle('Arquetipo');
                              setCArmors([]); setCWeapons([]); setCTools(''); setCSaves([]); setCSkills([]); setCSkillsLimit(2);
                              setCResourceName(''); setCResourceProg(Array(20).fill('')); // setCTraits([]);
                              setClassWizardStep(1);
                              setIsCreatingClass(true);
                            }}
                            style={{ width: '100%', padding: '12px', background: 'var(--accent-gold)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px' }}
                          >
                            + NUEVA CLASE
                          </button>
                        </div>
                      )}
                    </div>

                    {activeClass ? (
                      <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-color)', paddingBottom: '20px', marginBottom: '30px' }}>
                          <div>
                            <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '2.5rem' }}>{activeClass.name}</h2>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '8px' }}>
                              <span className="mono" style={{ color: 'var(--text-secondary)' }}>Dado de Golpe: {activeData.hit_dice ? activeData.hit_dice : <span style={{ color: '#f97316' }}>[DATO FALTANTE: hit_dice]</span>}</span>
                              <span style={{ color: 'var(--text-secondary)' }}>•</span>
                              <span className="mono" style={{ color: 'var(--text-secondary)' }}>Subclase al nivel {activeData.subclass_level || 3} ({activeData.subclass_title || 'Subclase'})</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '10px' }}>
                            {(userRole === 'admin' || userRole === 'dm') && (
                              <>
                                <button
                                  className="font-cinzel"
                                  onClick={() => {
                                    setSubclassName(''); setSubclassDesc(''); setSubclassTraits([]);
                                    setIsAddingSubclass(true);
                                  }}
                                  style={{ background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}
                                >
                                  + NUEVA SUBCLASE
                                </button>
                                <>
                                  <button
                                    className="font-cinzel"
                                    onClick={() => handleEditClassClick(activeClass)}
                                    style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}
                                  >
                                    EDITAR
                                  </button>
                                  {!String(activeClass.id).startsWith('srd-') && (
                                    <button
                                      onClick={() => { if (confirm(`¿Eliminar la clase ${activeClass.name}?`)) socket.emit('content:delete', activeClass.id); }}
                                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--combat-red)', color: 'var(--combat-red)', padding: '8px 16px', fontSize: '0.8rem', cursor: 'pointer' }}
                                    >
                                      ELIMINAR
                                    </button>
                                  )}
                                </>
                              </>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                          <section>
                            <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>📜 Lore y Descripción</h3>
                            <p 
                              style={{ color: 'var(--text-parchment)', lineHeight: '1.8', fontSize: '1rem' }}
                              dangerouslySetInnerHTML={{ __html: formatDescription(activeData.desc || activeData.description || '[DATO FALTANTE: description]') }}
                            />
                          </section>

                          <section>
                            <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '15px' }}>🛡️ Competencias Iniciales</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', border: '1px solid var(--border-color)' }}>
                                <div style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px' }}>Salvaciones y Habilidades</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-parchment)' }}>
                                  <div><b>Tiradas de Salvación:</b> {activeData.prof_saving_throws ? activeData.prof_saving_throws : <span style={{ color: '#f97316' }}>[DATO FALTANTE: prof_saving_throws]</span>}</div>
                                  <div><b>Habilidades:</b> {activeData.prof_skills ? activeData.prof_skills : <span style={{ color: '#f97316' }}>[DATO FALTANTE: prof_skills]</span>}</div>
                                </div>
                              </div>
                              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', border: '1px solid var(--border-color)' }}>
                                <div style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px' }}>Equipo y Herramientas</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-parchment)' }}>
                                  <div><b>Armaduras:</b> {activeData.prof_armor ? activeData.prof_armor : <span style={{ color: '#f97316' }}>[DATO FALTANTE: prof_armor]</span>}</div>
                                  <div><b>Armas:</b> {activeData.prof_weapons ? activeData.prof_weapons : <span style={{ color: '#f97316' }}>[DATO FALTANTE: prof_weapons]</span>}</div>
                                  <div><b>Herramientas:</b> {activeData.prof_tools ? activeData.prof_tools : <span style={{ color: '#f97316' }}>[DATO FALTANTE: prof_tools]</span>}</div>
                                </div>
                              </div>
                            </div>
                          </section>

                          <section>
                            <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '15px' }}>📊 Tabla de Progresión (Nivel 1-20)</h3>
                            {(() => {
                              const getTraitsForLevel = (lvl: number) => {
                                const merged: { name: string; desc: string; shortDesc?: string }[] = [];
                                const seen = new Set<string>();

                                // 1. Gather from local activeData.traits
                                if (activeData && activeData.traits) {
                                  activeData.traits.forEach((t: any) => {
                                    if (parseInt(t.level) === lvl) {
                                      const norm = cleanNameForMatching(t.name);
                                      if (!seen.has(norm)) {
                                        seen.add(norm);
                                        merged.push({
                                          name: t.name,
                                          desc: t.desc || t.description,
                                          shortDesc: t.short_description || ''
                                        });
                                      }
                                    }
                                  });
                                }

                                // 2. Gather from global classFeatures
                                if (classFeatures) {
                                  classFeatures.forEach((f: any) => {
                                    const isSameClass = f.class && activeClass && cleanNameForMatching(f.class) === cleanNameForMatching(activeClass.name);
                                    if (isSameClass && parseInt(f.level) === lvl) {
                                      const norm = cleanNameForMatching(f.name);
                                      if (!seen.has(norm)) {
                                        seen.add(norm);
                                        merged.push({
                                          name: f.name,
                                          desc: f.description,
                                          shortDesc: f.short_description || ''
                                        });
                                      }
                                    }
                                  });
                                }

                                return merged;
                              };

                              const resourceName = activeData.resource_name;
                              const resourceProg = activeData.resource_progression || [];
                              const isGuerrero = activeClass && (activeClass.name.toLowerCase() === 'guerrero' || activeClass.name.toLowerCase() === 'fighter');
                              
                              return (
                                <div style={{ width: '100%', overflowX: 'auto', border: '1px solid var(--border-color)' }}>
                                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                    <thead>
                                      <tr style={{ background: 'var(--bg-surface)', borderBottom: '2px solid var(--border-color)' }}>
                                        <th className="font-cinzel" style={{ padding: '12px 15px', color: 'var(--accent-gold)', borderRight: '1px solid var(--border-color)' }}>Nivel</th>
                                        <th className="font-cinzel" style={{ padding: '12px 15px', color: 'var(--accent-gold)', borderRight: '1px solid var(--border-color)' }}>Bono de Competencia</th>
                                        {isGuerrero && (
                                          <th className="font-cinzel" style={{ padding: '12px 15px', color: 'var(--accent-gold)', borderRight: '1px solid var(--border-color)' }}>Ataques Extra</th>
                                        )}
                                        <th className="font-cinzel" style={{ padding: '12px 15px', color: 'var(--accent-gold)', borderRight: '1px solid var(--border-color)' }}>Rasgos</th>
                                        {resourceName && (
                                          <th className="font-cinzel" style={{ padding: '12px 15px', color: 'var(--accent-gold)', borderRight: '1px solid var(--border-color)' }}>{resourceName}</th>
                                        )}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {Array.from({ length: 20 }, (_, i) => {
                                        const lvl = i + 1;
                                        const profBonus = `+${1 + Math.ceil(lvl / 4)}`;
                                        const traits = getTraitsForLevel(lvl);
                                        
                                        let extraAttacks = '—';
                                        if (lvl >= 5 && lvl < 11) extraAttacks = '1 extra (2 ataques)';
                                        else if (lvl >= 11 && lvl < 20) extraAttacks = '2 extra (3 ataques)';
                                        else if (lvl === 20) extraAttacks = '3 extra (4 ataques)';
                                        
                                        return (
                                          <tr key={lvl} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '10px 15px', color: 'var(--text-parchment)', borderRight: '1px solid var(--border-color)', fontWeight: 'bold' }}>{lvl}º</td>
                                            <td style={{ padding: '10px 15px', color: 'var(--text-parchment)', borderRight: '1px solid var(--border-color)' }}>{profBonus}</td>
                                            {isGuerrero && (
                                              <td style={{ padding: '10px 15px', color: 'var(--text-parchment)', borderRight: '1px solid var(--border-color)' }}>
                                                {extraAttacks}
                                              </td>
                                            )}
                                            <td style={{ padding: '10px 15px', color: 'var(--text-parchment)', borderRight: '1px solid var(--border-color)', position: 'relative' }}>
                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                                {traits.length > 0 ? (
                                                  traits.map((t: any, tIdx: number) => (
                                                    <FeatureTooltip 
                                                      key={tIdx} 
                                                      featureName={t.name} 
                                                      description={t.desc} 
                                                      shortDescription={t.shortDesc} 
                                                    />
                                                  ))
                                                ) : (
                                                  <span style={{ padding: '4px 8px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>—</span>
                                                )}
                                              </div>
                                            </td>
                                            {resourceName && (
                                              <td style={{ padding: '10px 15px', color: 'var(--text-parchment)', borderRight: '1px solid var(--border-color)' }}>
                                                {resourceProg[lvl - 1] || '—'}
                                              </td>
                                            )}
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              );
                            })()}
                          </section>

                          <section style={{ borderTop: '1px solid var(--border-color)', paddingTop: '30px' }}>
                            <h3 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '1.4rem', marginBottom: '20px' }}>📚 Subclases disponibles</h3>
                            {(() => {
                              const apiSubclasses = activeData.subclasses || [];
                              const customSubclasses = compendium.filter((item: any) => {
                                if (item.type !== 'subclass') return false;
                                let sData: any = {};
                                try { sData = item.data ? (typeof item.data === 'string' ? JSON.parse(item.data) : item.data) : {}; } catch { sData = {}; }
                                return sData.class_parent?.toLowerCase() === activeClass.name?.toLowerCase();
                              }).map((item: any) => {
                                let sData: any = {};
                                try { sData = item.data ? (typeof item.data === 'string' ? JSON.parse(item.data) : item.data) : {}; } catch { sData = {}; }
                                return { id: item.id, name: item.name, desc: sData.description || sData.desc || '', traits: sData.traits || [], isCustom: true };
                              });
                              const allSubs = [...apiSubclasses, ...customSubclasses];
                              if (allSubs.length === 0) return <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.9rem' }}>No hay subclases asociadas a esta clase. ¡Crea una ahora!</div>;
                              return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                  {allSubs.map((sub, sIdx) => {
                                    const isExpanded = expandedTraits[`sub-${sIdx}`];
                                    return (
                                      <div key={sIdx} className="clipped-frame" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
                                        <div onClick={() => setExpandedTraits({ ...expandedTraits, [`sub-${sIdx}`]: !isExpanded })} style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}>
                                          <div>
                                            <h4 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.2rem' }}>
                                              {sub.name}{' '}
                                              {sub.isCustom ? <span style={{ border: '1px solid #10b981', color: '#10b981', fontSize: '0.55rem', padding: '2px 4px', marginLeft: '10px', verticalAlign: 'middle' }}>CUSTOM</span> : <span style={{ border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', fontSize: '0.55rem', padding: '2px 4px', marginLeft: '10px', verticalAlign: 'middle' }}>SRD</span>}
                                            </h4>
                                          </div>
                                          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                            {sub.isCustom && (userRole === 'admin' || userRole === 'dm') && (
                                              <button onClick={e => { e.stopPropagation(); if (confirm(`¿Eliminar la subclase ${sub.name}?`)) socket.emit('content:delete', sub.id); }} style={{ background: 'transparent', border: 'none', color: 'var(--combat-red)', cursor: 'pointer', fontSize: '1rem' }}>🗑️</button>
                                            )}
                                            <span style={{ color: 'var(--accent-gold)', fontSize: '1.2rem' }}>{isExpanded ? '▴' : '▾'}</span>
                                          </div>
                                        </div>
                                        {isExpanded && (
                                          <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.15)' }}>
                                            <p style={{ margin: '0 0 20px 0', color: 'var(--text-parchment)', lineHeight: '1.6', fontSize: '0.95rem' }}>{sub.desc || sub.description}</p>
                                            {sub.traits && sub.traits.length > 0 && (
                                              <div>
                                                <div style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)', paddingBottom: '5px', marginBottom: '10px' }}>Rasgos de Subclase</div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                  {sub.traits.map((st: any, stIdx: number) => (
                                                    <div key={stIdx}><span className="font-cinzel" style={{ fontWeight: 'bold', color: 'var(--text-parchment)', fontSize: '0.9rem' }}>Nivel {st.level} — {st.name}:</span>{' '}<span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.4' }}>{st.desc || st.description}</span></div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </section>
                        </div>
                      </div>
                    ) : (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Selecciona una clase del compendio para ver su detalle</div>
                    )}
                    {renderClassWizardModal()}
                    {renderSubclassModal(activeClass)}
                  </div>
                );
              })() : category === 'features' ? (() => {

                // Filter features
                const filteredFeatures = allMergedFeatures.filter((f: any) => {
                  const matchesSearch = f.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                        f.description?.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesClass = selectedFeatureClass === 'all' || f.class?.toLowerCase() === selectedFeatureClass.toLowerCase();
                  const matchesLevel = selectedFeatureLevel === 'all' || parseInt(f.level) === parseInt(selectedFeatureLevel);
                  return matchesSearch && matchesClass && matchesLevel;
                });

                // Class list for filter dropdown
                const uniqueClasses = Array.from(new Set(allMergedFeatures.map((f: any) => f.class))).sort();

                // Pagination logic for features (24 at a time)
                const totalFeaturePages = Math.max(1, Math.ceil(filteredFeatures.length / PAGE_SIZE));
                const pagedFeatures = filteredFeatures.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* FILTROS INTERNOS DE RASGOS */}
                    <div style={{ display: 'flex', gap: '20px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '20px', alignItems: 'center' }} className="clipped-frame">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                        <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', letterSpacing: '1px' }}>FILTRAR POR CLASE</label>
                        <select 
                          className="mono" 
                          style={{ width: '100%', padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }}
                          value={selectedFeatureClass}
                          onChange={e => { setSelectedFeatureClass(e.target.value); setCurrentPage(1); }}
                        >
                          <option value="all">Todas las Clases</option>
                          {uniqueClasses.map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '180px' }}>
                        <label className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', letterSpacing: '1px' }}>FILTRAR POR NIVEL</label>
                        <select 
                          className="mono" 
                          style={{ width: '100%', padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }}
                          value={selectedFeatureLevel}
                          onChange={e => { setSelectedFeatureLevel(e.target.value); setCurrentPage(1); }}
                        >
                          <option value="all">Todos los niveles</option>
                          {Array.from({ length: 20 }, (_, i) => i + 1).map(lvl => (
                            <option key={lvl} value={lvl}>Nivel {lvl}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* LISTA / GRILLA DE TARJETAS */}
                    {loadingFeatures ? (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: 'var(--accent-gold)', fontSize: '1.2rem' }}>
                        Cargando rasgos...
                      </div>
                    ) : filteredFeatures.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '50px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }} className="clipped-frame">
                        No se encontraron rasgos con los filtros actuales.
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
                          {pagedFeatures.map((feat: any, idx: number) => {
                            const isHovered = hoveredCardId === (feat.id || idx.toString());
                            return (
                              <div 
                                key={feat.id || idx} 
                                className="clipped-frame torch-glow" 
                                onClick={() => setSelectedFeature(feat)}
                                onMouseEnter={() => setHoveredCardId(feat.id || idx.toString())}
                                onMouseLeave={() => setHoveredCardId(null)}
                                style={{ 
                                  background: 'var(--bg-surface)', 
                                  border: '1px solid var(--border-color)', 
                                  padding: '25px', 
                                  cursor: 'pointer', 
                                  transition: 'all 0.3s ease',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '15px',
                                  position: 'relative',
                                  minHeight: '190px',
                                  overflow: 'hidden'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span className="font-cinzel" style={{ border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', fontSize: '0.65rem', padding: '3px 8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                    {feat.class}{feat.subclass ? `: ${feat.subclass}` : ''}
                                  </span>
                                  
                                  <span className="mono" style={{ 
                                    background: 'rgba(200, 135, 42, 0.1)', 
                                    border: '1px solid rgba(200, 135, 42, 0.3)', 
                                    color: 'var(--accent-gold)',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold'
                                  }} title={`Nivel ${feat.level}`}>
                                    {feat.level}
                                  </span>
                                </div>

                                <div>
                                  <h3 className="font-cinzel" style={{ margin: '5px 0 0 0', color: 'var(--text-parchment)', fontSize: '1.25rem' }}>{feat.name}</h3>
                                </div>

                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <div style={{ width: '60px', height: '1px', background: 'var(--border-color)' }} />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px', letterSpacing: '1px' }}>
                                    <span>HAZ CLIC PARA DETALLES</span> <span>🡒</span>
                                  </div>
                                </div>

                                {/* HOVER OVERLAY FOR SHORT DESCRIPTION */}
                                <div 
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    background: 'rgba(16, 12, 8, 0.98)',
                                    border: '1px solid var(--accent-gold)',
                                    padding: '25px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    opacity: isHovered ? 1 : 0,
                                    transition: 'opacity 0.2s ease',
                                    pointerEvents: 'none',
                                    zIndex: 2
                                  }}
                                >
                                  <div className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '0.7rem', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>⚡ RESUMEN</div>
                                  <p style={{
                                    margin: 0,
                                    color: 'var(--text-parchment)',
                                    fontSize: '0.85rem',
                                    lineHeight: '1.6',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 4,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    fontFamily: 'var(--font-body)'
                                  }}>
                                    {feat.short_description || (feat.description ? (feat.description.slice(0, 110) + (feat.description.length > 110 ? '...' : '')) : 'Sin resumen.')}
                                  </p>
                                </div>

                                {/* EDIT/DELETE ACTIONS (rendered on top of hover overlay if user is admin) */}
                                {(userRole === 'admin' || userRole === 'dm') && (
                                  <div 
                                    style={{ 
                                      position: 'absolute', 
                                      bottom: '15px', 
                                      left: '25px', 
                                      right: '25px', 
                                      display: isHovered ? 'flex' : 'none', 
                                      gap: '15px', 
                                      zIndex: 3 
                                    }}
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); openEditFeatureForm(feat); }} 
                                      className="font-cinzel" 
                                      style={{ flex: 1, background: 'rgba(200, 135, 42, 0.1)', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)', padding: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                                    >
                                      EDITAR
                                    </button>
                                    {feat.id && !isNaN(Number(feat.id)) ? (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteFeature(feat.id); }} 
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--combat-red)', border: '1px solid var(--combat-red)', padding: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
                                      >
                                        🗑️
                                      </button>
                                    ) : (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); alert("Los rasgos nativos o integrados del sistema no se pueden eliminar, pero puedes editarlos para modificarlos."); }} 
                                        style={{ background: 'transparent', color: 'var(--text-secondary)', opacity: 0.5, border: 'none', padding: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
                                        title="Los rasgos base del sistema no se pueden eliminar, solo editar."
                                      >
                                        🗑️
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {totalFeaturePages > 1 && (
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '50px' }}>
                            <button 
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="font-cinzel"
                              style={{ background: 'transparent', border: '1px solid var(--border-color)', color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--text-parchment)', padding: '8px 20px', cursor: 'pointer' }}
                            >ANTERIOR</button>
                            <span className="mono" style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>PÁGINA {currentPage} DE {totalFeaturePages}</span>
                            <button 
                              onClick={() => setCurrentPage(p => Math.min(totalFeaturePages, p + 1))}
                              disabled={currentPage === totalFeaturePages}
                              className="font-cinzel"
                              style={{ background: 'transparent', border: '1px solid var(--border-color)', color: currentPage === totalFeaturePages ? 'var(--text-secondary)' : 'var(--text-parchment)', padding: '8px 20px', cursor: 'pointer' }}
                            >SIGUIENTE</button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })() : (
                <>

                    {isCreating ? (
                      <div className="clipped-frame" style={{ background: 'var(--bg-surface)', padding: '40px', border: '1px solid var(--border-color)', boxShadow: '0 25px 80px rgba(0,0,0,0.8)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                          <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)' }}>
                            {editingId 
                              ? (createType === 'monster' ? '👾 EDITAR MONSTRUO' : createType === 'spell' ? '📜 EDITAR HECHIZO' : '⚔️ EDITAR OBJETO') 
                              : (createType === 'monster' ? '👾 NUEVO MONSTRUO' : createType === 'spell' ? '📜 NUEVO HECHIZO' : '⚔️ NUEVO OBJETO')
                            }
                          </h2>
                          <button onClick={() => setIsCreating(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '2rem', cursor: 'pointer' }}>✕</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', marginBottom: '30px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div 
                              onMouseDown={(e) => {
                                if (!createImage) return;
                                e.preventDefault();
                                setIsDragging(true);
                                setDragStart({ x: e.clientX - imagePosX, y: e.clientY - imagePosY });
                              }}
                              onMouseMove={(e) => {
                                if (!isDragging) return;
                                setImagePosX(e.clientX - dragStart.x);
                                setImagePosY(e.clientY - dragStart.y);
                              }}
                              onMouseUp={() => setIsDragging(false)}
                              onMouseLeave={() => setIsDragging(false)}
                              style={{ 
                                width: '100%', 
                                aspectRatio: '1/1', 
                                background: 'var(--bg-base)', 
                                border: '2px dashed var(--border-color)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                cursor: createImage ? (isDragging ? 'grabbing' : 'grab') : 'pointer', 
                                overflow: 'hidden', 
                                position: 'relative' 
                              }}
                              onClick={() => { 
                                if (!createImage) {
                                  document.getElementById('imageUpload')?.click(); 
                                }
                              }}
                            >
                              {createImage ? (
                                <img 
                                  src={createImage} 
                                  alt="" 
                                  draggable={false}
                                  style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                    transform: `translate(${imagePosX}px, ${imagePosY}px) scale(${imageZoom})`,
                                    transformOrigin: 'center',
                                    transition: isDragging ? 'none' : 'transform 0.1s ease',
                                    pointerEvents: 'none'
                                  }} 
                                />
                              ) : (
                                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>📷 Cargar Imagen</div>
                              )}
                              <input id="imageUpload" type="file" hidden accept="image/*" onChange={handleImageUpload} />
                            </div>

                            {createImage && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.15)', padding: '12px', border: '1px solid var(--border-color)', marginTop: '-10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '0.5px' }}>🔍 ZOOM DE IMAGEN</span>
                                  <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{imageZoom.toFixed(2)}x</span>
                                </div>
                                <input 
                                  type="range" 
                                  min="1" 
                                  max="4" 
                                  step="0.05" 
                                  value={imageZoom} 
                                  onChange={e => setImageZoom(parseFloat(e.target.value))} 
                                  style={{ width: '100%', accentColor: 'var(--accent-gold)', cursor: 'pointer' }}
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '5px' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setImagePosX(0);
                                      setImagePosY(0);
                                      setImageZoom(1);
                                    }}
                                    className="font-cinzel"
                                    style={{ 
                                      background: 'transparent', 
                                      border: '1px solid var(--border-color)', 
                                      color: 'var(--text-secondary)', 
                                      padding: '6px', 
                                      fontSize: '0.65rem', 
                                      cursor: 'pointer',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-parchment)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                                  >
                                    🔄 REINICIAR
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => document.getElementById('imageUpload')?.click()}
                                    className="font-cinzel"
                                    style={{ 
                                      background: 'transparent', 
                                      border: '1px solid var(--accent-gold)', 
                                      color: 'var(--accent-gold)', 
                                      padding: '6px', 
                                      fontSize: '0.65rem', 
                                      cursor: 'pointer',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,135,42,0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                  >
                                    📷 CAMBIAR
                                  </button>
                                </div>
                              </div>
                            )}

                            {createType === 'item' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Rareza del Objeto</label>
                                    <select className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={createRarity} onChange={e => setCreateRarity(e.target.value)}>
                                      {['Común', 'Poco Común', 'Raro', 'Muy Raro', 'Legendario', 'Artefacto'].map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                                    </select>
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Peso (kg)</label>
                                    <input className="mono" type="text" placeholder="Ej: 2 o 1.5" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }} value={createWeight} onChange={e => setCreateWeight(e.target.value)} />
                                  </div>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.15)', padding: '15px', border: '1px solid var(--border-color)' }}>
                                  <label style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>Propiedades del Objeto</label>
                                  <div style={{ display: 'flex', gap: '15px', justifyContent: 'space-around', padding: '5px 0' }}>
                                    
                                    {/* Botón Daño (Espada) */}
                                    <button
                                      type="button"
                                      onClick={() => setIsDamageItem(!isDamageItem)}
                                      title={isDamageItem ? "Hace Daño: ACTIVO" : "Activar: Hace Daño"}
                                      style={{
                                        width: '45px',
                                        height: '45px',
                                        fontSize: '1.4rem',
                                        background: isDamageItem ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-base)',
                                        border: `2px solid ${isDamageItem ? '#ef4444' : 'var(--border-color)'}`,
                                        boxShadow: isDamageItem ? '0 0 10px rgba(239, 68, 68, 0.3)' : 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease',
                                        borderRadius: '4px',
                                        opacity: isDamageItem ? 1 : 0.4
                                      }}
                                      onMouseEnter={e => {
                                        e.currentTarget.style.opacity = '1';
                                        if (!isDamageItem) e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                                      }}
                                      onMouseLeave={e => {
                                        e.currentTarget.style.opacity = isDamageItem ? '1' : '0.4';
                                        if (!isDamageItem) e.currentTarget.style.borderColor = 'var(--border-color)';
                                      }}
                                    >
                                      ⚔️
                                    </button>

                                    {/* Botón Escudo (Protege) */}
                                    <button
                                      type="button"
                                      onClick={() => setIsProtectItem(!isProtectItem)}
                                      title={isProtectItem ? "Protege: ACTIVO" : "Activar: Protege"}
                                      style={{
                                        width: '45px',
                                        height: '45px',
                                        fontSize: '1.4rem',
                                        background: isProtectItem ? 'rgba(74, 222, 128, 0.2)' : 'var(--bg-base)',
                                        border: `2px solid ${isProtectItem ? '#4ade80' : 'var(--border-color)'}`,
                                        boxShadow: isProtectItem ? '0 0 10px rgba(74, 222, 128, 0.3)' : 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease',
                                        borderRadius: '4px',
                                        opacity: isProtectItem ? 1 : 0.4
                                      }}
                                      onMouseEnter={e => {
                                        e.currentTarget.style.opacity = '1';
                                        if (!isProtectItem) e.currentTarget.style.borderColor = 'rgba(74, 222, 128, 0.5)';
                                      }}
                                      onMouseLeave={e => {
                                        e.currentTarget.style.opacity = isProtectItem ? '1' : '0.4';
                                        if (!isProtectItem) e.currentTarget.style.borderColor = 'var(--border-color)';
                                      }}
                                    >
                                      🛡️
                                    </button>

                                    {/* Botón Sintonización (Cadena) */}
                                    <button
                                      type="button"
                                      onClick={() => setCreateRequiresAttunement(!createRequiresAttunement)}
                                      title={createRequiresAttunement ? "Requiere Sintonización: ACTIVO" : "Activar: Requiere Sintonización"}
                                      style={{
                                        width: '45px',
                                        height: '45px',
                                        fontSize: '1.4rem',
                                        background: createRequiresAttunement ? 'rgba(200, 135, 42, 0.2)' : 'var(--bg-base)',
                                        border: `2px solid ${createRequiresAttunement ? 'var(--accent-gold)' : 'var(--border-color)'}`,
                                        boxShadow: createRequiresAttunement ? '0 0 10px rgba(200, 135, 42, 0.3)' : 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease',
                                        borderRadius: '4px',
                                        opacity: createRequiresAttunement ? 1 : 0.4
                                      }}
                                      onMouseEnter={e => {
                                        e.currentTarget.style.opacity = '1';
                                        if (!createRequiresAttunement) e.currentTarget.style.borderColor = 'rgba(200, 135, 42, 0.5)';
                                      }}
                                      onMouseLeave={e => {
                                        e.currentTarget.style.opacity = createRequiresAttunement ? '1' : '0.4';
                                        if (!createRequiresAttunement) e.currentTarget.style.borderColor = 'var(--border-color)';
                                      }}
                                    >
                                      🔗
                                    </button>
                                  </div>
                                </div>

                                {isProtectItem && (
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Bono Defensa / CA (Ej: +2)</label>
                                    <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={itemDefenseBonus} onChange={e => setItemDefenseBonus(e.target.value)} />
                                  </div>
                                )}
                              </div>
                            )}

                            {createType === 'item' && (
                              <div>
                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Categoría / Tag</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                  {['arma', 'armadura', 'consumible', 'artefacto'].map(tag => (
                                    <button
                                      key={tag}
                                      onClick={() => {
                                        if (createTags.includes(tag)) setCreateTags(createTags.filter(t => t !== tag));
                                        else setCreateTags([...createTags, tag]);
                                      }}
                                      className="font-cinzel"
                                      style={{
                                        flex: 1, padding: '8px', fontSize: '0.7rem', cursor: 'pointer',
                                        background: createTags.includes(tag) ? 'var(--accent-gold)' : 'var(--bg-base)',
                                        color: createTags.includes(tag) ? 'black' : 'var(--text-secondary)',
                                        border: `1px solid ${createTags.includes(tag) ? 'var(--accent-gold)' : 'var(--border-color)'}`
                                      }}
                                    >
                                      {tag.toUpperCase()}
                                    </button>
                                  ))}
                                </div>
                                {createTags.includes('armadura') && (
                                  <div style={{ marginTop: '15px' }}>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>Tipo de Armadura</label>
                                    <select 
                                      className="mono" 
                                      style={{ width: '100%', padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }} 
                                      value={createArmorType} 
                                      onChange={e => setCreateArmorType(e.target.value)}
                                    >
                                      <option value="ligera">🛡️ Armadura Ligera</option>
                                      <option value="media">🛡️ Armadura Media</option>
                                      <option value="pesada">🛡️ Armadura Pesada</option>
                                    </select>
                                  </div>
                                )}
                              </div>
                            )}

                            {createType === 'spell' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                                <div>
                                  <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Nivel de Hechizo</label>
                                  <select className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={createSpellLevel} onChange={e => setCreateSpellLevel(parseInt(e.target.value) || 0)}>
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(lvl => <option key={lvl} value={lvl}>{lvl === 0 ? 'TRUCO (0)' : `NIVEL ${lvl}`}</option>)}
                                  </select>
                                </div>
                                
                                <div>
                                  <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Componentes</label>
                                  <div style={{ display: 'flex', gap: '15px' }}>
                                    {['V', 'S', 'M'].map(comp => (
                                      <label key={comp} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-parchment)', cursor: 'pointer' }}>
                                        <input 
                                          type="checkbox" 
                                          checked={(createSpellComponents as any)[comp]} 
                                          onChange={e => setCreateSpellComponents({ ...createSpellComponents, [comp]: e.target.checked })} 
                                        />
                                        {comp}
                                      </label>
                                    ))}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '5px' }}>
                                  <input type="checkbox" id="isConcentrationCheck" checked={createSpellConcentration} onChange={e => setCreateSpellConcentration(e.target.checked)} />
                                  <label htmlFor="isConcentrationCheck" style={{ fontSize: '0.8rem', color: 'var(--text-parchment)', cursor: 'pointer' }}>¿Concentración?</label>
                                </div>
                              </div>
                            )}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div>
                              <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>Nombre</label>
                              <input className="mono font-cinzel" style={{ width: '100%', padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1.2rem', outline: 'none' }} value={createName} onChange={(e) => setCreateName(e.target.value)} />
                            </div>

                            {createType !== 'spell' ? (
                              <div>
                                <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>Descripción / Lore</label>
                                <textarea style={{ width: '100%', height: '120px', padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', resize: 'vertical', outline: 'none', lineHeight: '1.5' }} value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} />
                              </div>
                            ) : (
                              <>
                                <div>
                                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>Descripción Corta</label>
                                  <input className="mono" style={{ width: '100%', padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', outline: 'none' }} placeholder="Escribe una breve sinopsis..." value={createShortDesc} onChange={(e) => setCreateShortDesc(e.target.value)} />
                                </div>
                                <div>
                                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: '5px', textTransform: 'uppercase' }}>Descripción Completa</label>
                                  <textarea style={{ width: '100%', height: '120px', padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', resize: 'vertical', outline: 'none', lineHeight: '1.5' }} placeholder="Escribe los detalles y efectos del hechizo..." value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} />
                                </div>
                              </>
                            )}

                            {createType === 'spell' && (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                                <div>
                                  <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Alcance (en casillas)</label>
                                  <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} placeholder="Ej: 6 casillas, toque, personal..." value={createSpellRange} onChange={e => setCreateSpellRange(e.target.value)} />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Duración</label>
                                  <select className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={createSpellDuration} onChange={e => setCreateSpellDuration(e.target.value)}>
                                    {['instantaneo', '1 turno', '1 asalto', '1 minuto', '10 minutos'].map(dur => <option key={dur} value={dur}>{dur.toUpperCase()}</option>)}
                                  </select>
                                </div>
                              </div>
                            )}

                            {createType === 'item' && isDamageItem && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', borderTop: '1px solid var(--border-color)', paddingTop: '20px', background: 'rgba(0,0,0,0.15)', padding: '20px', border: '1px solid var(--border-color)' }}>
                                <h4 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '0.9rem', letterSpacing: '1px' }}>⚔️ AJUSTES DE ATAQUE Y DAÑO</h4>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '15px' }}>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Nombre del Ataque (Ej: Golpe con Mandoble)</label>
                                    <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={itemAttackName} onChange={e => setItemAttackName(e.target.value)} />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Bono Ataque (Ej: +5)</label>
                                    <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={itemAttackBonus} onChange={e => setItemAttackBonus(e.target.value)} />
                                  </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Otro Bonificador</label>
                                    <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} placeholder="Ej: +2" value={itemStatMod} onChange={e => setItemStatMod(e.target.value)} />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Estadística Base</label>
                                    <select className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={itemStatSelection} onChange={e => setItemStatSelection(e.target.value)}>
                                      {['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'].map(st => <option key={st} value={st}>{st}</option>)}
                                    </select>
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Objetivos Afectados</label>
                                    <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} type="number" min="1" value={itemTargetsCount} onChange={e => setItemTargetsCount(e.target.value)} />
                                  </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Daño (Ej: 1d8+3)</label>
                                    <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={itemDamageFormula} onChange={e => setItemDamageFormula(e.target.value)} />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Daño Crítico (Ej: 2d8)</label>
                                    <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={itemCritDamage} onChange={e => setItemCritDamage(e.target.value)} />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Tipo de Daño</label>
                                    <select className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={itemDamageType} onChange={e => setItemDamageType(e.target.value)}>
                                      {DAMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                  </div>
                                </div>
                              </div>
                            )}

                            {createType === 'monster' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>HP (Ej: 10 o 2d8+2)</label>
                                    <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={createHp} onChange={e => setCreateHp(e.target.value)} />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Armadura (CA)</label>
                                    <input type="number" className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={createAc} onChange={e => setCreateAc(parseInt(e.target.value) || 10)} />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Desafío (CR)</label>
                                    <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={createCr} onChange={e => setCreateCr(e.target.value)} />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Velocidad</label>
                                    <input className="mono" style={{ width: '100%', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={createSpeed} onChange={e => setCreateSpeed(e.target.value)} />
                                  </div>
                                </div>

                                <div>
                                  <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Atributos</label>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                                    {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(st => (
                                      <div key={st} style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{st.toUpperCase()}</div>
                                        <input 
                                          type="number" className="mono"
                                          style={{ width: '100%', padding: '5px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', textAlign: 'center' }} 
                                          value={(createStats as any)[st]} 
                                          onChange={e => setCreateStats({ ...createStats, [st]: parseInt(e.target.value) || 10 })} 
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Vulnerabilidades</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '5px' }}>
                                      {DAMAGE_TYPES.map(dt => (
                                        <label key={dt} style={{ fontSize: '0.7rem', display: 'flex', gap: '5px', cursor: 'pointer' }}>
                                          <input type="checkbox" checked={createVuln.includes(dt)} onChange={e => e.target.checked ? setCreateVuln([...createVuln, dt]) : setCreateVuln(createVuln.filter(v => v !== dt))} /> {dt}
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Resistencias</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '5px' }}>
                                      {DAMAGE_TYPES.map(dt => (
                                        <label key={dt} style={{ fontSize: '0.7rem', display: 'flex', gap: '5px', cursor: 'pointer' }}>
                                          <input type="checkbox" checked={createRes.includes(dt)} onChange={e => e.target.checked ? setCreateRes([...createRes, dt]) : setCreateRes(createRes.filter(v => v !== dt))} /> {dt}
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>Inmunidades</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '5px' }}>
                                      {DAMAGE_TYPES.map(dt => (
                                        <label key={dt} style={{ fontSize: '0.7rem', display: 'flex', gap: '5px', cursor: 'pointer' }}>
                                          <input type="checkbox" checked={createImm.includes(dt)} onChange={e => e.target.checked ? setCreateImm([...createImm, dt]) : setCreateImm(createImm.filter(v => v !== dt))} /> {dt}
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Rasgos Especiales</label>
                                    <button onClick={() => setCreateTraits([...createTraits, { name: '', desc: '' }])} style={{ background: 'transparent', border: 'none', color: 'var(--accent-gold)', fontSize: '0.75rem', cursor: 'pointer' }}>+ Añadir Rasgo</button>
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {createTraits.map((t, idx) => (
                                      <div key={idx} style={{ display: 'flex', gap: '10px' }}>
                                        <input placeholder="Nombre (Ej: Anfíbio)" style={{ flex: 1, padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={t.name} onChange={e => {
                                          const list = [...createTraits];
                                          list[idx].name = e.target.value;
                                          setCreateTraits(list);
                                        }} />
                                        <input placeholder="Descripción del efecto..." style={{ flex: 2, padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={t.desc} onChange={e => {
                                          const list = [...createTraits];
                                          list[idx].desc = e.target.value;
                                          setCreateTraits(list);
                                        }} />
                                        {createTraits.length > 1 && (
                                          <button onClick={() => setCreateTraits(createTraits.filter((_, i) => i !== idx))} style={{ background: 'transparent', border: 'none', color: 'var(--combat-red)', cursor: 'pointer' }}>✕</button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <label style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Acciones de Combate</label>
                                    <button onClick={() => setCreateAttacks([...createAttacks, { name: '', desc: '', isAttack: false, actionType: 'Acción', attackBonus: '', damageFormula: '', damageType: 'cortante', range: '' }])} style={{ background: 'transparent', border: 'none', color: 'var(--accent-gold)', fontSize: '0.75rem', cursor: 'pointer' }}>+ Añadir Acción</button>
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {createAttacks.map((a, idx) => (
                                      <div key={idx} className="clipped-frame" style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                          <input placeholder="Nombre de la Acción (Ej: Mordisco)" style={{ flex: 2, padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={a.name} onChange={e => {
                                            const list = [...createAttacks];
                                            list[idx].name = e.target.value;
                                            setCreateAttacks(list);
                                          }} />
                                          <select className="mono" style={{ flex: 1, padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={a.actionType} onChange={e => {
                                            const list = [...createAttacks];
                                            list[idx].actionType = e.target.value;
                                            setCreateAttacks(list);
                                          }} >
                                            {ACTION_TYPES.map(act => <option key={act} value={act}>{act}</option>)}
                                          </select>
                                          {createAttacks.length > 1 && (
                                            <button onClick={() => setCreateAttacks(createAttacks.filter((_, i) => i !== idx))} style={{ background: 'transparent', border: 'none', color: 'var(--combat-red)', cursor: 'pointer' }}>✕</button>
                                          )}
                                        </div>
                                        <textarea placeholder="Descripción del ataque o efecto..." style={{ width: '100%', height: '50px', padding: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', resize: 'vertical' }} value={a.desc} onChange={e => {
                                          const list = [...createAttacks];
                                          list[idx].desc = e.target.value;
                                          setCreateAttacks(list);
                                        }} />
                                        
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                          <input type="checkbox" id={`isAtt-${idx}`} checked={a.isAttack} onChange={e => {
                                            const list = [...createAttacks];
                                            list[idx].isAttack = e.target.checked;
                                            setCreateAttacks(list);
                                          }} />
                                          <label htmlFor={`isAtt-${idx}`} style={{ fontSize: '0.7rem', color: 'var(--text-parchment)', cursor: 'pointer' }}>¿Es un Ataque?</label>
                                        </div>

                                        {a.isAttack && (
                                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.5fr 1fr', gap: '10px' }}>
                                            <div>
                                              <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Bono (+5)</label>
                                              <input className="mono" style={{ width: '100%', padding: '6px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={a.attackBonus} onChange={e => {
                                                const list = [...createAttacks];
                                                list[idx].attackBonus = e.target.value;
                                                setCreateAttacks(list);
                                              }} />
                                            </div>
                                            <div>
                                              <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Fórmula Daño (2d6+3)</label>
                                              <input className="mono" style={{ width: '100%', padding: '6px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={a.damageFormula} onChange={e => {
                                                const list = [...createAttacks];
                                                list[idx].damageFormula = e.target.value;
                                                setCreateAttacks(list);
                                              }} />
                                            </div>
                                            <div>
                                              <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Tipo Daño</label>
                                              <select className="mono" style={{ width: '100%', padding: '6px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={a.damageType} onChange={e => {
                                                const list = [...createAttacks];
                                                list[idx].damageType = e.target.value;
                                                setCreateAttacks(list);
                                              }} >
                                                {DAMAGE_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                                              </select>
                                            </div>
                                            <div>
                                              <label style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Rango (5 ft)</label>
                                              <input className="mono" style={{ width: '100%', padding: '6px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white' }} value={a.range} onChange={e => {
                                                const list = [...createAttacks];
                                                list[idx].range = e.target.value;
                                                setCreateAttacks(list);
                                              }} />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <button onClick={handleSave} className="font-cinzel torch-glow" style={{ width: '100%', background: 'var(--accent-gold)', color: 'white', border: 'none', padding: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', letterSpacing: '2px', marginTop: '30px' }}>
                          {editingId ? 'GUARDAR CAMBIOS' : 'AÑADIR AL COMPENDIO'}
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                        {pagedItems.map((item: any) => {
                          let data: any = {};
                          try {
                            data = item.data ? (typeof item.data === 'string' ? JSON.parse(item.data) : item.data) : {};
                          } catch { data = {}; }
                          if (!data) data = {};
                          return (
                            <div key={item.id} className="clipped-frame torch-glow" 
                              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'all 0.3s' }} 
                              onClick={() => setSelectedItem(item)}
                            >
                              <div style={{ width: '100%', aspectRatio: '4/3', background: 'var(--bg-base)', overflow: 'hidden', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
                                {data.image ? (
                                  <img 
                                    src={data.image} 
                                    alt="" 
                                    style={{ 
                                      width: '100%', 
                                      height: '100%', 
                                      objectFit: 'cover', 
                                      opacity: 0.8,
                                      transform: `translate(${data.imagePosX ?? 0}px, ${data.imagePosY ?? 0}px) scale(${data.imageZoom ?? 1})`,
                                      transformOrigin: 'center'
                                    }} 
                                  />
                                ) : (
                                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', color: 'var(--text-secondary)' }}>
                                    {typeIcons[item.type]?.split(' ')[0]}
                                  </div>
                                )}
                              </div>
                              <div style={{ padding: '25px', flex: 1 }}>
                                <div className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>{item.type}</div>
                                <h3 className="font-cinzel" style={{ margin: '0 0 12px 0', color: 'var(--text-parchment)', fontSize: '1.3rem' }}>{item.name}</h3>
                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  {(() => {
                                    const desc = data.description || data.desc || "";
                                    return Array.isArray(desc) ? desc.join('\n') : String(desc);
                                  })()}
                                </p>
                              </div>
                              {userRole === 'admin' && (
                                <div style={{ padding: '15px 25px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '15px', background: 'rgba(0,0,0,0.1)' }}>
                                  <button onClick={(e) => { e.stopPropagation(); handleEditClick(item); }} className="font-cinzel" style={{ flex: 1, background: 'transparent', color: 'var(--text-parchment)', border: '1px solid var(--border-color)', padding: '8px', cursor: 'pointer', fontSize: '0.75rem' }}>EDITAR</button>
                                  <button onClick={(e) => { e.stopPropagation(); if (confirm(`¿Eliminar ${item.name}?`)) socket.emit('content:delete', item.id); }} style={{ background: 'transparent', color: 'var(--combat-red)', border: 'none', padding: '8px', cursor: 'pointer', fontSize: '1.1rem' }}>🗑️</button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {!isCreating && totalPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '50px' }}>
                        <button 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="font-cinzel"
                          style={{ background: 'transparent', border: '1px solid var(--border-color)', color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--text-parchment)', padding: '8px 20px', cursor: 'pointer' }}
                        >ANTERIOR</button>
                        <span className="mono" style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>PÁGINA {currentPage} DE {totalPages}</span>
                        <button 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="font-cinzel"
                          style={{ background: 'transparent', border: '1px solid var(--border-color)', color: currentPage === totalPages ? 'var(--text-secondary)' : 'var(--text-parchment)', padding: '8px 20px', cursor: 'pointer' }}
                        >SIGUIENTE</button>
                      </div>
                    )}
                </>
              )}

              {selectedItem && category !== 'class' && (() => {
                let d: any = {};
                try {
                  d = selectedItem.data ? (typeof selectedItem.data === 'string' ? JSON.parse(selectedItem.data) : selectedItem.data) : {};
                } catch { d = {}; }
                if (!d) d = {};
                
                const isMonster = selectedItem.type === 'monster';
                // const hp = d.hp || d.hit_points || '—';
                // const ac = d.ac || d.armor_class || '—';
                const cr = d.cr || d.challenge_rating || '—';
                // const speed = d.speed || '—';
                // const desc = d.description || d.desc || '';
                
                // const stats = [
                //   { label: 'STR', val: d.strength || d.str || 10 },
                //   { label: 'DEX', val: d.dexterity || d.dex || 10 },
                //   { label: 'CON', val: d.constitution || d.con || 10 },
                //   { label: 'INT', val: d.intelligence || d.int || 10 },
                //   { label: 'WIS', val: d.wisdom || d.wis || 10 },
                //   { label: 'CHA', val: d.charisma || d.cha || 10 }
                // ];

                // const getMod = (val: number) => {
                //   const mod = Math.floor((val - 10) / 2);
                //   return mod >= 0 ? `+${mod}` : `${mod}`;
                // };

                return (
                  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '40px' }} onClick={() => { setSelectedItem(null); if (isOverlay && onCloseOverlay) onCloseOverlay(); }}>
                    <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '40px', boxShadow: '0 0 100px rgba(0,0,0,1)' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', borderBottom: '2px solid var(--border-color)', paddingBottom: '20px' }}>
                        <div>
                          <h1 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '2.8rem', textShadow: '0 0 20px rgba(200, 135, 42, 0.2)' }}>{selectedItem.name}</h1>
                          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '5px' }}>
                            <span className="font-cinzel" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem' }}>{selectedItem.type === 'monster' ? '👾 MONSTRUO' : selectedItem.type === 'spell' ? '📜 HECHIZO' : '⚔️ OBJETO'}</span>
                            {isMonster && d.size && <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>• {d.size}</span>}
                            {isMonster && cr !== '—' && <span style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', fontWeight: 'bold' }}>• CR {cr}</span>}
                          </div>
                        </div>
                        <button onClick={() => setSelectedItem(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '2.5rem', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--combat-red)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>✕</button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '50px' }}>
                        <div>
                          <div style={{ position: 'relative', marginBottom: '30px' }}>
                            <div style={{ width: '100%', aspectRatio: '1/1', background: 'var(--bg-base)', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                              {d.image ? (
                                <img 
                                  src={d.image} 
                                  alt="" 
                                  style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                    transform: `translate(${d.imagePosX ?? 0}px, ${d.imagePosY ?? 0}px) scale(${d.imageZoom ?? 1})`,
                                    transformOrigin: 'center'
                                  }} 
                                />
                              ) : (
                                <div style={{ fontSize: '5rem', opacity: 0.2 }}>{typeIcons[selectedItem.type]?.split(' ')[0]}</div>
                              )}
                            </div>
                            <div style={{ position: 'absolute', bottom: '-10px', left: '10px', right: '10px', height: '4px', background: 'var(--accent-gold)', boxShadow: '0 0 15px var(--accent-gold)' }} />
                          </div>
                        </div>

                        {/* Detalles en Columna Derecha (2fr) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', color: 'var(--text-parchment)' }}>
                          {selectedItem.type === 'monster' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', background: 'rgba(0,0,0,0.2)', padding: '15px', border: '1px solid var(--border-color)' }}>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Puntos de Golpe</div>
                                  <div className="mono font-cinzel" style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{d.hit_points || d.hp || '—'}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Clase Armadura</div>
                                  <div className="mono font-cinzel" style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{d.armor_class || d.ac || '—'}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Desafío (CR)</div>
                                  <div className="mono font-cinzel" style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{d.challenge_rating || d.cr || '—'}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Velocidad</div>
                                  <div className="mono font-cinzel" style={{ fontSize: '1rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{d.speed || '—'}</div>
                                </div>
                              </div>

                              {/* Atributos */}
                              <div>
                                <h3 className="font-cinzel" style={{ fontSize: '1rem', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', margin: '0 0 10px 0' }}>Atributos</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
                                  {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(attr => {
                                    const val = d[attr] || d[attr.substring(0,3)] || 10;
                                    const mod = Math.floor((val - 10) / 2);
                                    const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                                    return (
                                      <div key={attr} style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', padding: '8px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>{attr.substring(0, 3).toUpperCase()}</div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '2px 0' }}>{val}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>({modStr})</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Resistencias / Vulnerabilidades */}
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                <div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Vulnerabilidades</div>
                                  <div style={{ fontSize: '0.85rem' }}>{(() => {
                                    const val = d.vulnerabilities || d.damage_vulnerabilities;
                                    if (!val) return 'Ninguna';
                                    if (Array.isArray(val)) return val.length > 0 ? val.join(', ') : 'Ninguna';
                                    return String(val);
                                  })()}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Resistencias</div>
                                  <div style={{ fontSize: '0.85rem' }}>{(() => {
                                    const val = d.resistances || d.damage_resistances;
                                    if (!val) return 'Ninguna';
                                    if (Array.isArray(val)) return val.length > 0 ? val.join(', ') : 'Ninguna';
                                    return String(val);
                                  })()}</div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Inmunidades</div>
                                  <div style={{ fontSize: '0.85rem' }}>{(() => {
                                    const val = d.immunities || d.damage_immunities;
                                    if (!val) return 'Ninguna';
                                    if (Array.isArray(val)) return val.length > 0 ? val.join(', ') : 'Ninguna';
                                    return String(val);
                                  })()}</div>
                                </div>
                              </div>

                              {/* Descripción */}
                              <div>
                                <h3 className="font-cinzel" style={{ fontSize: '1rem', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', margin: '0 0 10px 0' }}>Descripción</h3>
                                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', margin: 0, color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: formatDescription(d.description || d.desc || 'Sin descripción.') }}>

                                </p>
                              </div>

                              {/* Rasgos Especiales */}
                              {((Array.isArray(d.traits) && d.traits.length > 0) || (Array.isArray(d.special_abilities) && d.special_abilities.length > 0)) && (
                                <div>
                                  <h3 className="font-cinzel" style={{ fontSize: '1rem', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', margin: '0 0 10px 0' }}>Rasgos Especiales</h3>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {(d.traits || d.special_abilities).map((t: any, idx: number) => (
                                      <div key={idx} style={{ fontSize: '0.9rem' }}>
                                        <b style={{ color: 'var(--text-parchment)' }}>{t.name}:</b> <span style={{ color: 'var(--text-secondary)' }}>{t.desc || t.description}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Acciones */}
                              {Array.isArray(d.actions) && d.actions.length > 0 && (
                                <div>
                                  <h3 className="font-cinzel" style={{ fontSize: '1rem', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', margin: '0 0 10px 0' }}>Acciones</h3>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {d.actions.map((act: any, idx: number) => (
                                      <div key={idx} style={{ fontSize: '0.9rem', background: 'rgba(255,255,255,0.02)', padding: '10px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                          <b style={{ color: 'var(--accent-gold)', fontSize: '0.95rem' }}>{act.name}</b>
                                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{act.actionType || 'Acción'}</span>
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>{act.desc || act.description}</div>
                                        {act.isAttack && (
                                          <div style={{ display: 'flex', gap: '15px', marginTop: '6px', fontSize: '0.8rem', color: 'var(--text-parchment)' }}>
                                            {act.attackBonus && <span><b>Bono:</b> {act.attackBonus}</span>}
                                            {act.damageFormula && <span><b>Daño:</b> {act.damageFormula} ({act.damageType})</span>}
                                            {act.range && <span><b>Alcance:</b> {act.range}</span>}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {selectedItem.type === 'item' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                              {/* Rarity & Tags Header */}
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${2 + (d.armorType ? 1 : 0) + (d.weight !== undefined && d.weight !== '' ? 1 : 0)}, 1fr)`,
                                gap: '15px',
                                background: 'rgba(0,0,0,0.3)',
                                padding: '15px',
                                border: '1px solid var(--border-color)',
                                boxShadow: 'inset 0 0 15px rgba(200, 135, 42, 0.05)'
                              }}>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Rareza</div>
                                  <div className="mono font-cinzel" style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', fontWeight: 'bold', textShadow: '0 0 10px rgba(200, 135, 42, 0.2)' }}>{d.rarity || 'Común'}</div>
                                </div>
                                {d.armorType && (
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tipo</div>
                                    <div className="mono font-cinzel" style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', fontWeight: 'bold', textShadow: '0 0 10px rgba(200, 135, 42, 0.2)' }}>{`ARMADURA ${d.armorType.toUpperCase()}`}</div>
                                  </div>
                                )}
                                {d.weight !== undefined && d.weight !== '' && (
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Peso</div>
                                    <div className="mono font-cinzel" style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', fontWeight: 'bold', textShadow: '0 0 10px rgba(200, 135, 42, 0.2)' }}>{`${d.weight} kg`}</div>
                                  </div>
                                )}
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tags</div>
                                  <div className="mono font-cinzel" style={{ fontSize: '1.0rem', color: 'var(--text-parchment)', letterSpacing: '0.5px' }}>{Array.isArray(d.tags) && d.tags.length > 0 ? d.tags.join(', ').toUpperCase() : 'ÍTEM'}</div>
                                </div>
                              </div>

                              {/* Protection Block */}
                              {d.isProtect && (
                                <div style={{ background: 'rgba(0, 50, 20, 0.15)', border: '1px solid rgba(46, 117, 89, 0.3)', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', borderRadius: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                  <div style={{ fontSize: '2rem', color: '#4ade80', filter: 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.3))' }}>🛡️</div>
                                  <div style={{ flex: 1 }}>
                                    <div className="font-cinzel" style={{ fontSize: '0.9rem', color: 'var(--text-parchment)', fontWeight: 'bold', letterSpacing: '1px' }}>PROPIEDAD: PROTECTOR</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Este objeto otorga protección adicional al portador.</div>
                                  </div>
                                  <div style={{ textAlign: 'right', padding: '0 10px' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Bono CA</div>
                                    <div className="mono font-cinzel" style={{ fontSize: '1.6rem', color: '#4ade80', fontWeight: 'bold' }}>
                                      {d.defenseBonus ? (d.defenseBonus.startsWith('+') || d.defenseBonus.startsWith('-') ? d.defenseBonus : `+${d.defenseBonus}`) : '+0'}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Attunement Block */}
                              {d.requiresAttunement && (
                                <div style={{ background: 'rgba(200, 135, 42, 0.08)', border: '1px solid rgba(200, 135, 42, 0.25)', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', borderRadius: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                  <div style={{ fontSize: '1.8rem', color: 'var(--accent-gold)', filter: 'drop-shadow(0 0 8px rgba(200, 135, 42, 0.3))' }}>🔗</div>
                                  <div style={{ flex: 1 }}>
                                    <div className="font-cinzel" style={{ fontSize: '0.9rem', color: 'var(--text-parchment)', fontWeight: 'bold', letterSpacing: '1px' }}>SINTONIZACIÓN REQUERIDA</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Este objeto debe ser sintonizado con el personaje para activar sus propiedades.</div>
                                  </div>
                                </div>
                              )}

                              {/* Combat / Attack Block */}
                              {d.isDamage && (
                                <div style={{ background: 'rgba(50, 0, 0, 0.15)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '18px', display: 'flex', flexDirection: 'column', gap: '15px', borderRadius: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(239, 68, 68, 0.2)', paddingBottom: '10px' }}>
                                    <span style={{ fontSize: '1.3rem' }}>⚔️</span>
                                    <h4 className="font-cinzel" style={{ margin: 0, color: 'var(--combat-red)', fontSize: '1.05rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                                      {d.attackName || 'Ataque de Combate'}
                                    </h4>
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                    {/* Attack Roll Column */}
                                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', border: '1px solid var(--border-color)' }}>
                                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Tirada de Ataque</div>
                                      <div className="mono" style={{ fontSize: '1.25rem', color: 'var(--text-parchment)', fontWeight: 'bold' }}>
                                        {d.attackBonus ? (d.attackBonus.startsWith('+') || d.attackBonus.startsWith('-') ? d.attackBonus : `+${d.attackBonus}`) : '+0'}
                                      </div>
                                      {d.statSelection && (
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                          Base: <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>{d.statSelection}</span> {d.statMod ? `(${d.statMod})` : ''}
                                        </div>
                                      )}
                                    </div>

                                    {/* Damage Formula Column */}
                                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', border: '1px solid var(--border-color)' }}>
                                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Daño Estándar</div>
                                      <div className="mono" style={{ fontSize: '1.25rem', color: 'var(--combat-red)', fontWeight: 'bold' }}>
                                        {d.damage || '—'}
                                      </div>
                                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', textTransform: 'uppercase' }}>
                                        Tipo: <span style={{ color: 'var(--text-parchment)' }}>{d.damageType || 'físico'}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    {/* Critical Damage */}
                                    <div style={{ background: 'rgba(0,0,0,0.15)', padding: '8px 12px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>
                                      <span style={{ color: 'var(--text-secondary)' }}>Daño Crítico: </span>
                                      <span className="mono" style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>{d.critDamage || 'Doble de dados'}</span>
                                    </div>
                                    {/* Targets Count */}
                                    <div style={{ background: 'rgba(0,0,0,0.15)', padding: '8px 12px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>
                                      <span style={{ color: 'var(--text-secondary)' }}>Objetivos: </span>
                                      <span className="mono" style={{ color: 'var(--text-parchment)', fontWeight: 'bold' }}>{d.targetsCount || '1'} {parseInt(d.targetsCount) === 1 ? 'unidad' : 'unidades'}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Description Section */}
                              <div>
                                <h3 className="font-cinzel" style={{ fontSize: '1rem', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', margin: '0 0 10px 0' }}>Descripción</h3>
                                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', margin: 0, color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: formatDescription(d.description || d.desc || 'Sin descripción.') }}>

                                </p>
                              </div>
                            </div>
                          ) }

                          {selectedItem.type === 'spell' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', background: 'rgba(0,0,0,0.2)', padding: '15px', border: '1px solid var(--border-color)' }}>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Nivel</div>
                                  <div className="mono font-cinzel" style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{String(d.level) === '0' || d.level === 'cantrip' || d.level === 'Cantrip' ? 'TRUCO' : `NIVEL ${d.level}`}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Alcance</div>
                                  <div className="mono font-cinzel" style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{d.range ? `${d.range} ${typeof d.range === 'number' || !isNaN(Number(d.range)) ? 'casillas' : ''}` : '—'}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Duración</div>
                                  <div className="mono font-cinzel" style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{d.duration || '—'}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Concentración</div>
                                  <div className="mono font-cinzel" style={{ fontSize: '1.1rem', color: d.concentration ? 'var(--accent-gold)' : 'var(--text-secondary)', fontWeight: 'bold' }}>{d.concentration && (d.concentration === 'yes' || d.concentration === true) ? 'SÍ' : 'NO'}</div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Componentes:</span>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                  {['V', 'S', 'M'].map(c => {
                                    const has = d.components && (typeof d.components === 'object' ? d.components[c] : d.components.toUpperCase().includes(c));
                                    return (
                                      <span key={c} style={{ 
                                        padding: '4px 10px', 
                                        background: has ? 'rgba(200,135,42,0.15)' : 'rgba(255,255,255,0.02)', 
                                        border: `1px solid ${has ? 'var(--accent-gold)' : 'var(--border-color)'}`,
                                        color: has ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold'
                                      }}>
                                        {c}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>

                              {d.short_description && (
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '5px' }}>Descripción Corta</div>
                                  <p style={{ fontSize: '0.95rem', margin: 0, fontStyle: 'italic', color: 'var(--text-parchment)' }}>
                                    "{d.short_description}"
                                  </p>
                                </div>
                              )}

                              <div>
                                <h3 className="font-cinzel" style={{ fontSize: '1rem', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', margin: '0 0 10px 0' }}>Descripción Completa</h3>
                                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', margin: 0, color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: formatDescription(d.description || d.desc || 'Sin descripción.') }}>

                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* MODAL DE DETALLE DE RASGO */}
              {selectedFeature && (
                <div 
                  style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    background: 'rgba(0,0,0,0.95)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    zIndex: 10000, 
                    padding: '40px' 
                  }} 
                  onClick={() => setSelectedFeature(null)}
                >
                  <div 
                    className="clipped-frame" 
                    style={{ 
                      background: 'var(--bg-surface)', 
                      border: '1px solid var(--border-color)', 
                      width: '100%', 
                      maxWidth: '650px', 
                      maxHeight: '85vh', 
                      overflowY: 'auto', 
                      padding: '40px', 
                      boxShadow: '0 0 100px rgba(0,0,0,1)',
                      position: 'relative'
                    }} 
                    onClick={e => e.stopPropagation()}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', borderBottom: '2px solid var(--border-color)', paddingBottom: '20px' }}>
                      <div>
                        <h1 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '2.4rem', textShadow: '0 0 20px rgba(200, 135, 42, 0.2)' }}>{selectedFeature.name}</h1>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '10px' }}>
                          <span className="font-cinzel" style={{ border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', fontSize: '0.75rem', padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {selectedFeature.class}{selectedFeature.subclass ? `: ${selectedFeature.subclass}` : ''}
                          </span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>•</span>
                          <span className="mono" style={{ color: 'var(--text-parchment)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                            Nivel de obtención: {selectedFeature.level}º
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedFeature(null)} 
                        style={{ 
                          background: 'transparent', 
                          border: 'none', 
                          color: 'var(--text-secondary)', 
                          fontSize: '2rem', 
                          cursor: 'pointer', 
                          transition: 'color 0.2s' 
                        }} 
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--combat-red)'} 
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                      >
                        ✕
                      </button>
                    </div>

                    <div style={{ color: 'var(--text-parchment)', lineHeight: '1.8', fontSize: '1.05rem', fontFamily: 'var(--font-body)', marginBottom: '30px' }} dangerouslySetInnerHTML={{ __html: formatDescription(selectedFeature.description) }}>

                    </div>

                    {(userRole === 'admin' || userRole === 'dm') && selectedFeature.id && (
                      <div style={{ padding: '20px 0 0 0', borderTop: '2px solid var(--border-color)', display: 'flex', gap: '20px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => { openEditFeatureForm(selectedFeature); setSelectedFeature(null); }} 
                          className="font-cinzel" 
                          style={{ background: 'transparent', color: 'var(--text-parchment)', border: '1px solid var(--border-color)', padding: '10px 25px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          EDITAR RASGO
                        </button>
                        {selectedFeature.id && !isNaN(Number(selectedFeature.id)) ? (
                          <button 
                            onClick={() => handleDeleteFeature(selectedFeature.id)} 
                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--combat-red)', color: 'var(--combat-red)', padding: '10px 25px', cursor: 'pointer', fontSize: '0.85rem' }}
                            className="font-cinzel"
                          >
                            ELIMINAR RASGO
                          </button>
                        ) : (
                          <button 
                            onClick={() => alert("Los rasgos nativos o integrados del sistema no se pueden eliminar, pero puedes editarlos para modificarlos.")} 
                            style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', opacity: 0.5, padding: '10px 25px', cursor: 'pointer', fontSize: '0.85rem' }}
                            className="font-cinzel"
                            title="Los rasgos base del sistema no se pueden eliminar, solo editar."
                          >
                            ELIMINAR RASGO
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {renderFeatureCrudModal()}
            </div>
          </div>
        </div>
      );
    };
