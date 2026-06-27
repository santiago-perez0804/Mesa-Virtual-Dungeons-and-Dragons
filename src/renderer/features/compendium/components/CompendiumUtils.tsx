import React from 'react';
import { 
  Skull, BookOpen, Shield, ShieldHalf, 
  Dna, Sparkles, AlertCircle, ScrollText, HeartPulse, Search 
} from 'lucide-react';

export const typeIcons: Record<string, React.ReactNode> = {
  all: <Search className="w-4 h-4" />,
  monster: <Skull className="w-4 h-4" />,
  spell: <Sparkles className="w-4 h-4" />,
  item: <Shield className="w-4 h-4" />,
  class: <ShieldHalf className="w-4 h-4" />,
  subclass: <ShieldHalf className="w-4 h-4 opacity-70" />,
  race: <Dna className="w-4 h-4" />,
  subrace: <Dna className="w-4 h-4 opacity-70" />,
  condition: <HeartPulse className="w-4 h-4" />,
  language: <ScrollText className="w-4 h-4" />,
  features: <Sparkles className="w-4 h-4" />,
  rule: <BookOpen className="w-4 h-4" />
};

export const parseMarkdownTable = (tableStr: string) => {
  if (!tableStr) return { headers: [], rows: [] };
  const lines = tableStr.trim().split('\n');
  if (lines.length < 3) return { headers: [], rows: [] };
  const contentLines = lines.filter(l => !l.includes('---') && l.trim().startsWith('|'));
  if (contentLines.length < 1) return { headers: [], rows: [] };
  const headers = contentLines[0].split('|').slice(1, -1).map(h => h.trim());
  const rows = contentLines.slice(1).map(line => line.split('|').slice(1, -1).map(c => c.trim()));
  return { headers, rows };
};

export const cleanNameForMatching = (name: string): string => {
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

export const generateTableMarkdown = (resourceName: string, resourceProg: string[], traitsList: any[]) => {
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

export const getValidSubclassLevels = (clsName: string, activeData: any) => {
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
