import { calcMod } from '../../../utils/dnd-calculos';
import {
  getModStr,
  safeParseStats
} from './personaje.utilidades';
import { parseCharacterClasses } from './personaje.listado';

type LevelUpCharacterOptions = {
  selectedCharacter: any;
  levelUpClass: string;
  getHitDieForClass: (className: string) => number;
  socket: any;
  triggerDiceRoll?: (formula: any, roll: number, onComplete: () => void) => void;
  setSelectedCharacter: (character: any) => void;
  setLevelUpClass: (className: string) => void;
};

export const levelUpCharacter = ({
  selectedCharacter,
  levelUpClass,
  getHitDieForClass,
  socket,
  triggerDiceRoll,
  setSelectedCharacter,
  setLevelUpClass
}: LevelUpCharacterOptions) => {
  if (!levelUpClass) return alert('Elige una clase para tomar tu nuevo nivel.');

  const hitDie = getHitDieForClass(levelUpClass);
  const roll = Math.floor(Math.random() * hitDie) + 1;
  const charStats = safeParseStats(selectedCharacter.stats);
  const conMod = calcMod(charStats.con);
  const hpGain = Math.max(1, roll + conMod);
  const newLevel = (selectedCharacter.level || 1) + 1;

  const parsedClasses = parseCharacterClasses(selectedCharacter.class);
  parsedClasses[levelUpClass] = (parsedClasses[levelUpClass] || 0) + 1;

  const applyUpdate = () => {
    const newMaxHp = (selectedCharacter.max_hp || 10) + hpGain;
    const newCurrentHp = (selectedCharacter.current_hp || 10) + hpGain;

    const updated = {
      ...selectedCharacter,
      class: JSON.stringify(parsedClasses),
      level: newLevel,
      max_hp: newMaxHp,
      current_hp: newCurrentHp
    };

    socket.emit('character:update', updated);
    setSelectedCharacter(updated);
    setLevelUpClass('');

    const chatMsg = {
      id: Date.now() + Math.random(),
      sender: 'Sistema',
      to: 'all',
      text: `🎲 **${selectedCharacter.name}** subió a nivel **${newLevel}** (${levelUpClass}) y tiró **d${hitDie}** para su vida sacando **${roll}** (Mod CON: ${getModStr(charStats.con)}). ¡Su vida máxima aumentó en **+${hpGain}**!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    };
    socket.emit('chat:send', chatMsg);
  };

  if (triggerDiceRoll) {
    triggerDiceRoll(`d${hitDie}` as any, roll, applyUpdate);
  } else {
    alert(`🗡️ Tomaste un nivel en ${levelUpClass}.
Tiraste un d${hitDie} y sacaste ${roll}.
Modificador de CON: ${getModStr(charStats.con)}.
¡Tu Vida Máxima aumenta en ${hpGain} puntos!`);
    applyUpdate();
  }
};
