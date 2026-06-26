import { Activity, Biohazard, Flame, Ghost, HeartCrack, Moon, Shield, Snowflake, X, Zap } from 'lucide-react';

export function renderConditionIcon(emoji: string) {
  switch (emoji) {
    case '\u{1F635}': return <Ghost className="w-4 h-4 m-auto" />;
    case '\u{1F628}': return <HeartCrack className="w-4 h-4 m-auto" />;
    case '\u{1F525}': return <Flame className="w-4 h-4 m-auto" />;
    case '\u2744\uFE0F': return <Snowflake className="w-4 h-4 m-auto" />;
    case '\u{1F4A4}': return <Moon className="w-4 h-4 m-auto" />;
    case '\u{1F6E1}\uFE0F': return <Shield className="w-4 h-4 m-auto" />;
    case '\u26A1': return <Zap className="w-4 h-4 m-auto" />;
    case '\u{1F922}': return <Biohazard className="w-4 h-4 m-auto" />;
    case '\u{1F621}': return <Activity className="w-4 h-4 m-auto" />;
    case '\u{1F938}': return <Activity className="w-4 h-4 m-auto" />;
    case '\u274C': return <X className="w-3 h-3 m-auto" />;
    case '': return <X className="w-4 h-4 m-auto" />;
    default: return emoji;
  }
}
