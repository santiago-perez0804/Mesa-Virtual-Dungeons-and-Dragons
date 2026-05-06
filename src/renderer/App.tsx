import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import LoginScreen from './components/LoginScreen';
import { DiceRoller } from './components/DiceRoller';
import DiceVisualizer from './components/DiceVisualizer';
import { CharacterManager } from './components/CharacterManager.tsx';
import { CombatGrid } from './components/CombatGrid.tsx';
import { DatabaseView } from './components/DatabaseView.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { ChatPanel } from './components/ChatPanel.tsx';

type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

const socket = io(window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin);

function App() {
  const [user, setUser] = useState<{ name: string; role: 'dm' | 'player' | 'admin' } | null>(null);
  const [currentRoll, setCurrentRoll] = useState<{ value: number; die: DiceType } | null>(null);
  const [characters, setCharacters] = useState<any[]>([]);
  const [monsters, setMonsters] = useState<any[]>([]);
  const [compendium, setCompendium] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'combat' | 'database'>('combat');

  // Estado para el Bestiario inline
  const [monsterSearch, setMonsterSearch] = useState('');

  useEffect(() => {
    socket.on('character:list', (list) => {
      setCharacters(list);
    });

    socket.on('monsters:list', (data: any[]) => {
      setMonsters(data);
    });

    socket.on('content:list', (data: any[]) => {
      setCompendium(data);
    });

    socket.on('dice:result', (data: { value: number; die: DiceType, user: string }) => {
      setCurrentRoll({ value: data.value, die: data.die });
    });

    return () => {
      socket.off('character:list');
      socket.off('monsters:list');
      socket.off('content:list');
      socket.off('dice:result');
    };
  }, []);

  const handleLogin = (loggedUser: { name: string; role: 'dm' | 'player' | 'admin' }) => {
    setUser(loggedUser);
    if (loggedUser.role !== 'admin') {
      socket.emit('content:request');
    }
  };

  const spawnMonster = (monster: any) => {
    const mData = JSON.parse(monster.data);
    socket.emit('token:spawn', {
      id: monster.id,
      name: monster.name,
      type: 'monster',
      hp: mData.hit_points || mData.hp || 10,
      ac: mData.armor_class || 10
    });
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

      {/* CAPA DEL DADO 2D (Imagen Animada) */}
      {currentRoll && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(2px)'
        }}>
          <DiceVisualizer
            resultado={currentRoll.value}
            tipoDeDado={currentRoll.die}
            width={400}
            height={400}
            onAnimationComplete={() => {
              setCurrentRoll(null);
            }}
          />
        </div>
      )}

      {/* HEADER */}
      <header style={{ background: '#1a1a1a', padding: '15px 25px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#a855f7', textShadow: '0 0 10px rgba(168, 85, 247, 0.5)' }}>D&D PP (DND PARA PROBES)</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '0.9rem', color: '#94a3b8', background: '#334155', padding: '6px 12px', borderRadius: '20px' }}>
            {user.role === 'dm' ? '🧙‍♂️ Master:' : '🛡️ Aventurero:'} <strong>{user.name}</strong>
          </span>
        </div>
      </header>

      {/* TABS NAVEGACIÓN */}
      <div style={{ display: 'flex', gap: '15px', padding: '20px 25px', background: '#0f172a', borderBottom: '2px solid #1e293b' }}>
        <button
          onClick={() => setActiveTab('combat')}
          style={{ padding: '15px 25px', borderRadius: '12px', border: 'none', background: activeTab === 'combat' ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : '#334155', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', flex: 1, boxShadow: activeTab === 'combat' ? '0 0 15px rgba(168, 85, 247, 0.4)' : 'none', transition: 'all 0.2s' }}
        >
          ⚔️ Combate y Héroes
        </button>
        <button
          onClick={() => setActiveTab('database')}
          style={{ padding: '15px 25px', borderRadius: '12px', border: 'none', background: activeTab === 'database' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#334155', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', flex: 1, boxShadow: activeTab === 'database' ? '0 0 15px rgba(59, 130, 246, 0.4)' : 'none', transition: 'all 0.2s' }}
        >
          📚 Base de Datos (Compendio)
        </button>
      </div>

      <main style={{ padding: '25px', maxWidth: '1600px', margin: '0 auto' }}>
        {activeTab === 'combat' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '25px', alignItems: 'start' }}>

            {/* COLUMNA IZQUIERDA (Grilla + Héroes) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', minWidth: 0 }}>
              <section style={{ borderRadius: '12px', background: '#0f172a', border: '1px solid #334155', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                <CombatGrid
                  socket={socket}
                  characters={characters}
                  monsters={monsters}
                  userRole={user.role}
                />
              </section>

              <section>
                <CharacterManager
                  socket={socket}
                  characters={characters}
                  monsters={monsters}
                  userRole={user.role}
                />
              </section>
            </div>

            {/* COLUMNA DERECHA (Herramientas, Chat, Bestiario) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', position: 'sticky', top: '25px' }}>

              <section style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', border: '1px solid #333', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                <h4 style={{ marginTop: 0, color: '#a855f7', borderBottom: '1px solid #333', paddingBottom: '10px' }}>🎲 Lanzador de Dados</h4>
                <DiceRoller socket={socket} />
              </section>

              <ChatPanel socket={socket} currentUser={user} characters={characters} />

              {/* BESTIARIO (Solo DM) */}
              {user.role === 'dm' && (
                <section style={{ background: '#111', borderRadius: '12px', padding: '20px', border: '1px solid #444', height: '400px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                  <h3 style={{ color: '#ef4444', marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '10px' }}>👾 Bestiario Rápido</h3>
                  <input
                    style={{ padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: 'white', width: '100%', marginBottom: '15px', boxSizing: 'border-box' }}
                    placeholder="🔍 Buscar monstruo..."
                    value={monsterSearch}
                    onChange={(e) => setMonsterSearch(e.target.value)}
                  />
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '5px' }}>
                    {monsters.filter((m: any) => m.name.toLowerCase().includes(monsterSearch.toLowerCase())).slice(0, 20).map((m: any) => (
                      <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#1c1c1c', borderRadius: '8px', border: '1px solid #333' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{m.name}</span>
                        <button
                          onClick={() => spawnMonster(m)}
                          style={{ background: '#ef4444', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'transform 0.1s' }}
                          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          +
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>
          </div>
        ) : (
          <DatabaseView compendium={compendium} socket={socket} userRole={user.role} />
        )}
      </main>
    </div>
  );
}

export default App;