import { useState } from 'react';
import { Socket } from 'socket.io-client';

export const DiceRoller = ({ socket, user, sendTo = 'all' }: { socket: Socket, user: any, sendTo?: string }) => {
  const [isWaiting, setIsWaiting] = useState(false);
  const [customFormula, setCustomFormula] = useState('');
  const dice = [4, 6, 8, 10, 12, 20];

  const rollDice = (d: number) => {
    if (isWaiting) return;

    setIsWaiting(true);
    socket.emit('dice:roll', { die: d, to: sendTo });

    setTimeout(() => {
      setIsWaiting(false);
    }, 5300);
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
      to: sendTo,
      text: `🎲 ${user?.name || 'Alguien'} tiró ${customFormula}: ${total} ${details}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystem: true
    };

    socket.emit('chat:send', sysMsg);
    setCustomFormula('');
  };

  return (
    <div className="dice-roller">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {dice.map((d) => (
          <button
            key={d}
            onClick={() => rollDice(d)}
            disabled={isWaiting}
            className="font-cinzel torch-glow"
            style={{
              opacity: isWaiting ? 0.5 : 1,
              cursor: isWaiting ? 'not-allowed' : 'pointer',
              background: 'rgba(200, 135, 42, 0.1)',
              color: 'var(--accent-gold)',
              border: '1px solid var(--border-color)',
              padding: '10px',
              borderRadius: '2px',
              fontSize: '0.9rem',
              fontWeight: '700',
              transition: 'all 0.2s'
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
      <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)' }}>
        <h5 className="font-cinzel" style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Tirada Manual</h5>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="2d6+5"
            className="mono"
            value={customFormula}
            onChange={(e) => setCustomFormula(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomRoll()}
            style={{ flex: 1, padding: '8px 12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', fontSize: '0.85rem', outline: 'none' }}
          />
          <button
            onClick={handleCustomRoll}
            className="torch-glow"
            style={{ background: 'var(--accent-gold)', color: 'white', border: 'none', padding: '0 12px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🎲
          </button>
        </div>
      </div>
    </div>
  );
};