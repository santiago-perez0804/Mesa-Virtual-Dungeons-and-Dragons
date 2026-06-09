import { useState } from 'react';
import { Socket } from 'socket.io-client';

export const DiceRoller = ({ socket, sendTo = 'all', blockRolls = false }: { socket: Socket, user: any, sendTo?: string, blockRolls?: boolean }) => {
  const [isWaiting, setIsWaiting] = useState(false);
  const dice = [4, 6, 8, 10, 12, 20];

  const rollDice = (d: number) => {
    if (isWaiting) return;
    if (blockRolls) {
      alert("No puedes tirar dados fuera de tu turno!");
      return;
    }

    setIsWaiting(true);
    socket.emit('dice:roll', { die: d, to: sendTo });

    setTimeout(() => {
      setIsWaiting(false);
    }, 5300);
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


    </div>
  );
};