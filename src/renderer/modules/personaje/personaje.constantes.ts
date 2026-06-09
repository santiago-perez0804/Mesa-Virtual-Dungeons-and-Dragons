export const classDesc: any = {
  "Artífice": "Maestros de la invención, imbuyen magia en objetos cotidianos.",
  "Bárbaro": "Feroces guerreros impulsados por la ira y el instinto puro.",
  "Bardo": "Artistas mágicos cuyas actuaciones inspiran aliados y confunden enemigos.",
  "Brujo": "Invocadores que han hecho pactos con seres de otro mundo.",
  "Clérigo": "Canalizadores de magia divina, curanderos y protectores de su fe.",
  "Druida": "Sacerdotes de la vieja fe que asumen formas animales y usan magia de la naturaleza.",
  "Explorador": "Guerreros de los bosques, expertos en rastreo y combate con armas.",
  "Guerrero": "Maestros del combate marcial, expertos con diversas armas y armaduras.",
  "Hechicero": "Lanzadores de conjuros cuya magia proviene de un don innato.",
  "Mago": "Estudiosos de lo arcano, capaces de alterar la realidad con magia.",
  "Monje": "Maestros de las artes marciales que aprovechan la energía de su cuerpo.",
  "Paladín": "Caballeros sagrados, juramentados a la justicia y portadores de magia divina.",
  "Pícaro": "Expertos en sigilo, trampas y ataques precisos en los puntos débiles."
};

export const classHitDice: any = {
  "Hechicero": 6, "Mago": 6,
  "Artífice": 8, "Bardo": 8, "Brujo": 8, "Clérigo": 8, "Druida": 8, "Monje": 8, "Pícaro": 8,
  "Explorador": 10, "Guerrero": 10, "Paladín": 10,
  "Bárbaro": 12
};

export const raceDesc: any = {
  "Humano": "Versátiles, adaptables y ambiciosos. (+1 a todo)",
  "Elfo": "Ágiles, longevos y en sintonía con la magia. (+2 Destreza)",
  "Enano": "Robustos y resistentes, grandes artesanos. (+2 Constitución)",
  "Gnomo": "Pequeños inventores con mentes brillantes. (+2 Inteligencia)",
  "Mediano": "Pequeños, suertudos y ágiles. (+2 Destreza)",
  "Orco": "Fuertes, salvajes y temibles. (+2 Fuerza)",
  "Dracónido": "Humanoides con rasgos dracónicos. (+2 Fuerza, +1 Carisma)"
};

export const raceBonuses: any = {
  "Humano": { fue: 1, dex: 1, con: 1, int: 1, sab: 1, car: 1 },
  "Elfo": { dex: 2 },
  "Enano": { con: 2 },
  "Gnomo": { int: 2 },
  "Mediano": { dex: 2 },
  "Orco": { fue: 2 },
  "Dracónido": { fue: 2, car: 1 }
};

export const skillList = [
  "Acrobacias", "Atletismo", "Arcanos", "Engaño", "Historia",
  "Intuición", "Intimidación", "Investigación", "Medicina",
  "Naturaleza", "Percepción", "Interpretación", "Persuasión",
  "Religión", "Juego de Manos", "Sigilo", "Supervivencia", "Trato con Animales"
];

export const statDescriptions: any = {
  fue: "Fuerza física y potencia muscular.",
  dex: "Agilidad, reflejos y equilibrio.",
  con: "Salud, resistencia y vitalidad.",
  int: "Razonamiento, memoria y lógica.",
  sab: "Percepción, intuición y empatía.",
  car: "Presencia y fuerza de personalidad."
};

export const subraces: any = {
  "Humano": ["Estándar"],
  "Elfo": ["Alto Elfo", "Elfo de los Bosques", "Elfo Oscuro (Drow)"],
  "Enano": ["Enano de las Colinas", "Enano de las Montañas"],
  "Gnomo": ["Gnomo de los Bosques", "Gnomo de las Rocas"],
  "Mediano": ["Piesligeros", "Fuertecorazón"],
  "Orco": ["Semiorco", "Orco de las Estepas"],
  "Dracónido": ["Rojo", "Azul", "Dorado", "Plateado", "Verde"]
};
