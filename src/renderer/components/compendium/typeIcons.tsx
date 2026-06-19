import { AlertTriangle, BookOpen, Dna, Footprints, Ghost, Languages, Scroll, Shield, Sparkles, Swords, Zap } from 'lucide-react';

export const typeIcons: Record<string, React.ReactNode> = {
  all: <><BookOpen className="w-4 h-4 flex-shrink-0" /> Ver Todo</>,
  monster: <><Ghost className="w-4 h-4 flex-shrink-0" /> Monstruos</>,
  spell: <><Scroll className="w-4 h-4 flex-shrink-0" /> Hechizos</>,
  item: <><Swords className="w-4 h-4 flex-shrink-0" /> Objetos</>,
  class: <><Shield className="w-4 h-4 flex-shrink-0" /> Clases</>,
  subclass: <><Sparkles className="w-4 h-4 flex-shrink-0" /> Subclases</>,
  race: <><Footprints className="w-4 h-4 flex-shrink-0" /> Razas</>,
  subrace: <><Dna className="w-4 h-4 flex-shrink-0" /> Subrazas</>,
  condition: <><AlertTriangle className="w-4 h-4 flex-shrink-0" /> Estados</>,
  language: <><Languages className="w-4 h-4 flex-shrink-0" /> Idiomas</>,
  features: <><Zap className="w-4 h-4 flex-shrink-0" /> Rasgos</>
};
