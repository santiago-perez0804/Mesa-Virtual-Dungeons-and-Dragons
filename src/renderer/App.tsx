import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import LoginScreen from './components/LoginScreen';
import DiceVisualizer from './components/DiceVisualizer';
import { CharacterManager } from './components/CharacterManager.tsx';
import { CombatGrid } from './components/CombatGrid.tsx';
import { DatabaseView } from './components/DatabaseView.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { ChatPanel } from './components/ChatPanel.tsx';
import { parseAndRollHP } from './utils/diceUtils';

type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

const socket = io(window.location.hostname === 'localhost' ? 'http://localhost:3000' : window.location.origin);

function App() {
  const [user, setUser] = useState<{ name: string; role: 'dm' | 'player' | 'admin'; profile_image?: string } | null>(null);
  const [currentRoll, setCurrentRoll] = useState<{ value: number; die: DiceType } | null>(null);
  const [characters, setCharacters] = useState<any[]>([]);
  const [monsters, setMonsters] = useState<any[]>([]);
  const [compendium, setCompendium] = useState<any[]>([]);
  const [boardTokens, setBoardTokens] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'combat' | 'database' | 'admin' | 'characters'>('combat');

  // Eliminar el useEffect que forzaba al admin a ir al panel de admin para que pueda ver la grilla

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

    socket.on('token:board-list', (tokens: any[]) => {
      setBoardTokens(tokens);
    });

    return () => {
      socket.off('character:list');
      socket.off('monsters:list');
      socket.off('content:list');
      socket.off('dice:result');
      socket.off('token:board-list');
    };
  }, []);

  const handleLogin = (loggedUser: { name: string; role: 'dm' | 'player' | 'admin'; profile_image?: string }) => {
    setUser(loggedUser);
    socket.emit('content:request'); // Ahora TODOS pueden ver el compendio
  };

  const handleProfileImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        socket.emit('auth:update_profile', { profile_image: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const spawnMonster = (monster: any) => {
    const mData = JSON.parse(monster.data);
    const hpText = mData.hit_points || mData.hp || '10';
    const rolledHp = parseAndRollHP(hpText);

    socket.emit('token:spawn', {
      id: monster.id,
      name: monster.name,
      type: 'monster',
      hp: rolledHp,
      max_hp: rolledHp,
      ac: mData.armor_class || 10,
      image: mData.image || null
    });
  };

  if (!user) {
    return <LoginScreen socket={socket} onLoginSuccess={handleLogin} />;
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#334155', padding: '4px 12px 4px 4px', borderRadius: '25px' }}>
            <div style={{ position: 'relative', width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: '#1e293b', border: '1px solid #475569', cursor: 'pointer' }} title="Cambiar foto de perfil">
              {user.profile_image ? (
                <img src={user.profile_image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold', color: '#94a3b8' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleProfileImageChange} 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
              />
            </div>
            <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
              {user.role === 'dm' ? '🧙‍♂️ Master:' : '🛡️ Aventurero:'} <strong>{user.name}</strong>
            </span>
          </div>
          <button 
            onClick={() => setUser(null)}
            style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}
          >
            🚪 Salir
          </button>
        </div>
      </header>

      {/* TABS NAVEGACIÓN */}
      <div style={{ display: 'flex', gap: '15px', padding: '20px 25px', background: '#0f172a', borderBottom: '2px solid #1e293b' }}>
        <button
          onClick={() => setActiveTab('combat')}
          style={{ padding: '15px 25px', borderRadius: '12px', border: 'none', background: activeTab === 'combat' ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : '#334155', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', flex: 1, boxShadow: activeTab === 'combat' ? '0 0 15px rgba(168, 85, 247, 0.4)' : 'none', transition: 'all 0.2s' }}
        >
          ⚔️ Combate y Grilla
        </button>
        {(user.role === 'player' || user.role === 'dm') && (
          <button
            onClick={() => setActiveTab('characters')}
            style={{ padding: '15px 25px', borderRadius: '12px', border: 'none', background: activeTab === 'characters' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#334155', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', flex: 1, boxShadow: activeTab === 'characters' ? '0 0 15px rgba(34, 197, 94, 0.4)' : 'none', transition: 'all 0.2s' }}
          >
            👤 {user.role === 'dm' ? 'Gestión de Héroes' : 'Mis Personajes'}
          </button>
        )}
        <button
          onClick={() => setActiveTab('database')}
          style={{ padding: '15px 25px', borderRadius: '12px', border: 'none', background: activeTab === 'database' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#334155', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', flex: 1, boxShadow: activeTab === 'database' ? '0 0 15px rgba(59, 130, 246, 0.4)' : 'none', transition: 'all 0.2s' }}
        >
          📚 Base de Datos (Compendio)
        </button>
        {user.role === 'admin' && (
          <button
            onClick={() => setActiveTab('admin')}
            style={{ padding: '15px 25px', borderRadius: '12px', border: 'none', background: activeTab === 'admin' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#334155', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', flex: 1, boxShadow: activeTab === 'admin' ? '0 0 15px rgba(245, 158, 11, 0.4)' : 'none', transition: 'all 0.2s' }}
          >
            👑 Panel de Administración
          </button>
        )}
      </div>

      <main style={{ padding: '25px', width: '100%', boxSizing: 'border-box', margin: '0 auto' }}>
        {activeTab === 'combat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', minWidth: 0, flex: 1 }}>
              <section style={{ borderRadius: '12px', background: '#0f172a', border: '1px solid #334155', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', height: '75vh' }}>
                <CombatGrid
                  socket={socket}
                  characters={characters}
                  monsters={monsters}
                  userRole={user.role}
                  currentUser={user}
                  boardTokens={boardTokens}
                />
              </section>

              {(user.role === 'dm' || user.role === 'admin') && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                  {/* BESTIARIO */}
                  <section style={{ background: '#111', borderRadius: '12px', padding: '20px', border: '1px solid #444', height: '350px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
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

                  {/* HEROES DE RESERVA */}
                  <section style={{ background: '#111', borderRadius: '12px', padding: '20px', border: '1px solid #444', height: '350px', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
                    <h3 style={{ color: '#3b82f6', marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '10px' }}>🛡️ Héroes de Reserva</h3>
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '5px' }}>
                      {characters.map((c: any) => (
                        <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#1c1c1c', borderRadius: '8px', border: '1px solid #333' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#e2e8f0' }}>{c.name}</span>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.owner}</span>
                          </div>
                          <button
                            onClick={() => {
                              // Verificar si el jugador ya tiene un personaje en el tablero
                              const yaInvocado = boardTokens.some(t => t.type === 'character' && t.owner === c.owner);
                              if (yaInvocado) {
                                alert(`El jugador ${c.owner} ya tiene un personaje en la grilla.`);
                                return;
                              }

                              socket.emit('token:spawn', {
                                id: c.id,
                                name: c.name,
                                type: 'character',
                                hp: c.hp,
                                max_hp: c.max_hp,
                                ac: c.ac,
                                image: c.image || null,
                                owner: c.owner
                              });
                            }}
                            style={{ background: '#3b82f6', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'transform 0.1s' }}
                            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            Invocar
                          </button>
                        </div>
                      ))}
                      {characters.length === 0 && <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', marginTop: '20px' }}>No hay héroes creados</div>}
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'database' && (
          <DatabaseView compendium={compendium} socket={socket} userRole={user.role} />
        )}
        {activeTab === 'admin' && user.role === 'admin' && (
          <AdminPanel socket={socket} />
        )}
        {activeTab === 'characters' && (user.role === 'player' || user.role === 'dm') && (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <CharacterManager
              socket={socket}
              characters={characters}
              monsters={monsters}
              userRole={user.role}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;