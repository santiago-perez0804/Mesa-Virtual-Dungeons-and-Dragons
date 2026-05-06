import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';

interface RollResult {
  user: string;
  die: string;
  value: number;
  timestamp: number;
}

export const DiceRoller = ({ socket }: { socket: Socket }) => {
  const [logs, setLogs] = useState<RollResult[]>([]); // Se usa en setLogs y en el .map()
  const [isWaiting, setIsWaiting] = useState(false);
  const dice = [4, 6, 8, 10, 12, 20];

  // SOLUCIÓN AL ERROR DE useEffect y setLogs:
  // Escuchamos al servidor para recibir los resultados de los dados
  useEffect(() => {
    const handleDiceResult = (newRoll: RollResult) => {
      // Usamos setLogs para actualizar el estado
      setLogs((prev) => [newRoll, ...prev].slice(0, 10));
    };

    socket.on('dice:result', handleDiceResult);

    // Limpieza al desmontar el componente
    return () => {
      socket.off('dice:result', handleDiceResult);
    };
  }, [socket]); // Aquí se usa useEffect

  const rollDice = (d: number) => {
    if (isWaiting) return;

    setIsWaiting(true);
    socket.emit('dice:roll', { die: d });

    setTimeout(() => {
      setIsWaiting(false);
    }, 2000);
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

      {/* SOLUCIÓN AL ERROR DE logs: Renderizamos la lista */}
      <div className="dice-log" style={{ marginTop: '15px' }}>
        <h4>Historial</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {logs.map((log, i) => (
            <li key={i} style={{ fontSize: '14px', borderBottom: '1px solid #333' }}>
              <strong>{log.user}</strong> tiró un <strong>{log.die}</strong>:
              <span style={{ color: '#4caf50', fontWeight: 'bold' }}> {log.value} </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};