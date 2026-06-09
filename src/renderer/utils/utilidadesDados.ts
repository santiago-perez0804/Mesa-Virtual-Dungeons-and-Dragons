/**
 * Utilidades para el lanzamiento de dados y parseo de fórmulas.
 */

/**
 * Lanza una fórmula de dados tipo "XdY+Z" o "XdY-Z" y retorna el total.
 */
export const rollFormula = (formula: string): number => {
  // Normalizar: quitar espacios y pasar a minúsculas
  const f = formula.replace(/\s+/g, '').toLowerCase();

  // Regex para XdY (+/- Z)
  // Grupo 1: cantidad, Grupo 2: caras, Grupo 3: operador (+/-), Grupo 4: modificador
  const match = f.match(/^(\d+)d(\d+)(?:([+-])(\d+))?$/);

  if (!match) {
    // Si no es una fórmula válida, intentamos retornar el número tal cual
    const num = parseInt(f);
    return isNaN(num) ? 0 : num;
  }

  const count = parseInt(match[1]);
  const faces = parseInt(match[2]);
  const operator = match[3] || '+';
  const modifier = match[4] ? parseInt(match[4]) : 0;

  let total = 0;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * faces) + 1;
  }

  if (operator === '+') {
    total += modifier;
  } else {
    total -= modifier;
  }

  return Math.max(1, total); // Mínimo 1 de vida
};

/**
 * Parsea una cadena tipo "Average (Formula)" y retorna la vida calculada.
 * Si no hay fórmula, retorna el promedio.
 * Ejemplo: "15 (3d8 + 3)" -> Retorna el resultado de tirar 3d8+3.
 * Ejemplo: "15" -> Retorna 15.
 */
export const parseAndRollHP = (hpInput: string | number): number => {
  const hpStr = String(hpInput).trim();
  
  // Buscar contenido entre paréntesis
  const match = hpStr.match(/\(([^)]+)\)/);
  
  if (match && match[1]) {
    const formula = match[1];
    return rollFormula(formula);
  }

  // Si no hay paréntesis, intentar sacar el primer número que aparezca (el promedio)
  const avgMatch = hpStr.match(/^(\d+)/);
  if (avgMatch) {
    return parseInt(avgMatch[1]);
  }

  return parseInt(hpStr) || 10;
};
