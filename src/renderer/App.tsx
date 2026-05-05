import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import LoginScreen from './components/LoginScreen';
import { DiceRoller } from './components/DiceRoller';
import DiceVisualizer from './components/DiceVisualizer';
import { CharacterManager } from './components/CharacterManager.tsx';
import { CombatGrid } from './components/CombatGrid.tsx';

// Definimos los tipos de dados válidos
type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

const socket = io(window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin);

function App() {
  const [user, setUser] = useState<{ name: string; role: 'dm' | 'player' } | null>(null);
  const [currentRoll, setCurrentRoll] = useState<{ value: number; die: DiceType } | null>(null);
  const [characters, setCharacters] = useState([]);
  const [monsters, setMonsters] = useState<any[]>([]);

  useEffect(() => {
    // 1. Escuchar personajes (Jugadores y DM)
    socket.on('character:list', (list) => {
      setCharacters(list);
    });

    // --- ESCUCHADOR DE MONSTRUOS ---
    socket.on('monsters:list', (data: any[]) => {
      // El log que habías quitado:
      console.log(`👾 ¡Llegaron los monstruos! Total: ${data.length} cargados del SRD.`);

      // Guardamos la data en el estado para que viaje al Manager
      setMonsters(data);
    });

    // 3. Escuchar dados para activar el Visualizer 3D
    socket.on('dice:roll', (data: { value: number; die: DiceType }) => {
      setCurrentRoll(data);
    });

    return () => {
      socket.off('character:list');
      socket.off('monster:list');
      socket.off('dice:roll');
    };
  }, []);

  const handleLogin = (name: string, role: 'dm' | 'player') => {
    setUser({ name, role });
    socket.emit('player:join', { name, role });
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="vtt-main" style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#121212', color: 'white', fontFamily: 'sans-serif' }}>

      {/* CAPA DEL DADO 3D */}
      {currentRoll && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', backgroundColor: 'rgba(0,0,0,0.4)'
        }}>
          <DiceVisualizer
            resultado={currentRoll.value}
            tipoDeDado={currentRoll.die}
            width={500}
            height={500}
            onAnimationComplete={() => {
              setTimeout(() => setCurrentRoll(null), 2000);
            }}
          />
        </div>
      )}

      {/* HEADER */}
      <header style={{ background: '#1a1a1a', padding: '15px 25px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#a855f7' }}>DECIDE AND DIE</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
            {user.role === 'dm' ? '🧙‍♂️ Master:' : '🛡️ Aventurero:'} <strong>{user.name}</strong>
          </span>
        </div>
      </header>

      <main style={{ padding: '25px', maxWidth: '1400px', margin: '0 auto' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', marginBottom: '30px' }}>
          {/* MAPA (Placeholder para el grid) */}
          <section style={{ border: '1px solid #333', borderRadius: '12px', background: '#000', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#444', letterSpacing: '2px' }}>[ GRILLA DE COMBATE ]</span>
          </section>

          {/* DADOS */}
          <section style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
            <h4 style={{ marginTop: 0, color: '#a855f7' }}>Lanzador</h4>
            <DiceRoller socket={socket} />
          </section>
        </div>

        {/* GESTIÓN DE FICHAS Y BESTIARIO */}
        <section className="character-section">
          <CharacterManager
            socket={socket}
            characters={characters}
            monsters={monsters}
            userRole={user.role}
          />
        </section>

        <section className="map-area" style={{ marginBottom: '30px' }}>
          <CombatGrid
            socket={socket}
            characters={characters}
            monsters={monsters} // También podrías mapear los monstruos igual que los personajes
            userRole={user.role}
          />
        </section>

      </main>
    </div>
  );
}

export default App;