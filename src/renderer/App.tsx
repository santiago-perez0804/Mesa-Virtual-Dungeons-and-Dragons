import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import LoginScreen from './components/LoginScreen';
import { DiceRoller } from './components/DiceRoller';
import DiceVisualizer from './components/DiceVisualizer';
import { CharacterManager } from './components/CharacterManager.tsx';
import { CombatGrid } from './components/CombatGrid.tsx';
import { DatabaseView } from './components/DatabaseView.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';

// Definimos los tipos de dados válidos
type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

const socket = io(window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin);

function App() {
  const [user, setUser] = useState<{ name: string; role: 'dm' | 'player' | 'admin' } | null>(null);
  const [currentRoll, setCurrentRoll] = useState<{ value: number; die: DiceType } | null>(null);
  const [characters, setCharacters] = useState<any[]>([]);
  const [monsters, setMonsters] = useState<any[]>([]);
  const [compendium, setCompendium] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'combat' | 'database'>('combat');

  useEffect(() => {
    // 1. Escuchar personajes (Jugadores y DM)
    socket.on('character:list', (list) => {
      setCharacters(list);
    });

    // --- ESCUCHADOR DE MONSTRUOS ---
    socket.on('monsters:list', (data: any[]) => {
      console.log(`👾 ¡Llegaron los monstruos! Total: ${data.length} cargados del SRD.`);
      setMonsters(data);
    });

    // --- ESCUCHADOR DEL COMPENDIO ---
    socket.on('content:list', (data: any[]) => {
      console.log(`📚 Compendio cargado con ${data.length} elementos.`);
      setCompendium(data);
    });

    // 3. Escuchar dados para activar el Visualizer 3D
    socket.on('dice:roll', (data: { value: number; die: DiceType }) => {
      setCurrentRoll(data);
    });

    return () => {
      socket.off('character:list');
      socket.off('monsters:list');
      socket.off('content:list');
      socket.off('dice:roll');
    };
  }, []);

  const handleLogin = (loggedUser: { name: string; role: 'dm' | 'player' | 'admin' }) => {
    setUser(loggedUser);
    if (loggedUser.role !== 'admin') {
      socket.emit('content:request'); // Pedimos el compendio al iniciar sesión si no es admin
    }
  };

  if (!user) {
    return <LoginScreen socket={socket} onLoginSuccess={handleLogin} />;
  }

  if (user.role === 'admin') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#121212' }}>
        <header style={{ background: '#1a1a1a', padding: '15px 25px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#a855f7' }}>D&D PP (DND PARA PROBES)</span>
          <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>👑 Administrador: <strong>{user.name}</strong></span>
        </header>
        <AdminPanel socket={socket} />
      </div>
    );
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
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#a855f7' }}>D&D PP (DND PARA PROBES)</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
            {user.role === 'dm' ? '🧙‍♂️ Master:' : '🛡️ Aventurero:'} <strong>{user.name}</strong>
          </span>
        </div>
      </header>

      {/* TABS NAVEGACIÓN */}
      <div style={{ display: 'flex', gap: '15px', padding: '20px 25px', background: '#0f172a', borderBottom: '2px solid #1e293b' }}>
        <button
          onClick={() => setActiveTab('combat')}
          style={{ padding: '15px 25px', borderRadius: '12px', border: 'none', background: activeTab === 'combat' ? '#a855f7' : '#334155', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', flex: 1, boxShadow: activeTab === 'combat' ? '0 0 15px rgba(168, 85, 247, 0.4)' : 'none', transition: 'all 0.2s' }}
        >
          ⚔️ Combate y Héroes
        </button>
        <button
          onClick={() => setActiveTab('database')}
          style={{ padding: '15px 25px', borderRadius: '12px', border: 'none', background: activeTab === 'database' ? '#3b82f6' : '#334155', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', flex: 1, boxShadow: activeTab === 'database' ? '0 0 15px rgba(59, 130, 246, 0.4)' : 'none', transition: 'all 0.2s' }}
        >
          📚 Base de Datos (Compendio)
        </button>
      </div>

      <main style={{ padding: '25px', maxWidth: '1400px', margin: '0 auto' }}>
        {activeTab === 'combat' ? (
          <>
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
                monsters={monsters}
                userRole={user.role}
              />
            </section>
          </>
        ) : (
          <DatabaseView compendium={compendium} socket={socket} userRole={user.role} />
        )}
      </main>
    </div>
  );
}

export default App;