/*
export const SPANISH_TO_ENGLISH_TRAITS: Record<string, string> = {
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

export const ACTION_TYPES = ['Acción', 'Acción Adicional', 'Reacción', 'Acción Legendaria', 'Acción de Guarida'];
export const DAMAGE_TYPES = ['contundente', 'perforante', 'cortante', 'acido', 'fuego', 'frio', 'relampago', 'trueno', 'fuerza', 'veneno', 'necrotico', 'radiante', 'psiquico'];

export const EMERGENCY_SRD_CLASSES = [
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
