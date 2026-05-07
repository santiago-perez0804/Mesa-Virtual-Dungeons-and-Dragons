import { useState } from 'react';
import { Socket } from 'socket.io-client';

export const DiceRoller = ({ socket, user }: { socket: Socket, user: any }) => {
  const [isWaiting, setIsWaiting] = useState(false);
  const [customFormula, setCustomFormula] = useState('');
  const dice = [4, 6, 8, 10, 12, 20];

  const rollDice = (d: number) => {
    if (isWaiting) return;

    setIsWaiting(true);
    socket.emit('dice:roll', { die: d });

    setTimeout(() => {
      setIsWaiting(false);
    }, 2000);
  };

  const handleCustomRoll = () => {
    if (!customFormula.trim()) return;
    
    // Normalize string (remove spaces, lowercase)
    const formula = customFormula.replace(/\s+/g, '').toLowerCase();
    
    // Regex for XdY or XdY+Z
    const match = formula.match(/^(\d+)d(\d+)(?:\+(\d+))?$/);
    
    if (!match) {
      alert('Formato inválido. Usá algo como 2d6 o 1d20+5');
      return;
    }

    const count = parseInt(match[1]);
    const faces = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;
    
    if (count > 50 || faces > 100) {
       alert('Calma con los dados, aventurero.');
       return;
    }

    let total = 0;
    const rolls = [];
    for (let i = 0; i < count; i++) {
       const roll = Math.floor(Math.random() * faces) + 1;
       rolls.push(roll);
       total += roll;
    }
    total += modifier;

    const modText = modifier > 0 ? ` + ${modifier}` : '';
    const details = count > 1 ? ` [${rolls.join(', ')}${modText}]` : (modifier > 0 ? ` [${rolls[0]}${modText}]` : '');

    const sysMsg = {
      id: Date.now() + Math.random(),
      sender: 'Sistema',
      to: 'all',
      text: `🎲 ${user?.name || 'Alguien'} tiró ${customFormula}: ${total} ${details}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    };
    
    socket.emit('chat:send', sysMsg);
    setCustomFormula('');
  };

  return (
    <div className="dice-roller">
      <div className="dice-buttons">
        {dice.map((d) => (
          <button
            key={d}
            onClick={() => rollDice(d)}
            disabled={isWaiting}
            style={{
              opacity: isWaiting ? 0.5 : 1,
              cursor: isWaiting ? 'not-allowed' : 'pointer',
              margin: '2px',
              padding: '8px'
            }}
          >
            d{d}
          </button>
        ))}
      </div>

      {isWaiting && (
        <p style={{ fontSize: '12px', color: 'gray' }}>
          Esperando a que dejen de girar...
        </p>
      )}

      {/* LANZADOR PERSONALIZADO */}
      <div style={{ marginTop: '15px', padding: '10px', background: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
        <h5 style={{ margin: '0 0 10px 0', color: '#94a3b8' }}>Tirada Manual</h5>
        <div style={{ display: 'flex', gap: '5px' }}>
          <input 
            type="text" 
            placeholder="Ej: 2d6 + 5" 
            value={customFormula}
            onChange={(e) => setCustomFormula(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomRoll()}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #475569', background: '#1e293b', color: 'white' }}
          />
          <button 
            onClick={handleCustomRoll}
            style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '0 15px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Tirar
          </button>
        </div>
      </div>
    </div>
  );
};