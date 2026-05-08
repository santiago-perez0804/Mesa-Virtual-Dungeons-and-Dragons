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
    if (loggedUser.role === 'admin') {
      setActiveTab('database');
    }
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
    <div className="vtt-main" style={{ position: 'relative', minHeight: '100vh', backgroundColor: 'var(--bg-base)', color: 'var(--text-parchment)', fontFamily: 'var(--font-body)' }}>

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
      <header style={{ background: 'var(--bg-surface)', padding: '15px 30px', borderBottom: '2px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="font-cinzel" style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--accent-gold)', textShadow: '0 0 15px rgba(200, 135, 42, 0.4)', lineHeight: '1' }}>D&D PP</span>
          <span className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--text-parchment)', letterSpacing: '4px', opacity: 0.7 }}>PARA POBRES</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '6px 16px 6px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            <div style={{ position: 'relative', width: '36px', height: '36px', overflow: 'hidden', background: 'var(--bg-base)', border: '1px solid var(--accent-gold)', cursor: 'pointer' }} title="Cambiar foto de perfil">
              {user.profile_image ? (
                <img src={user.profile_image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div className="font-cinzel" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {user.role === 'dm' ? 'Dungeon Master' : (user.role === 'admin' ? 'Administrador' : 'Aventurero')}
              </span>
              <span className="font-cinzel" style={{ fontSize: '0.95rem', color: 'var(--text-parchment)', fontWeight: 'bold' }}>{user.name}</span>
            </div>
          </div>
          <button 
            onClick={() => setUser(null)}
            className="torch-glow"
            style={{ background: 'transparent', border: '1px solid var(--combat-red)', color: 'var(--combat-red)', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
          >
            🚪 SALIR
          </button>
        </div>
      </header>

      {/* TABS NAVEGACIÓN */}
      <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-base)', padding: '0 30px' }}>
        {[
          { id: 'combat', label: '⚔️ COMBATE', color: 'var(--combat-red)', visible: user.role !== 'admin' },
          { id: 'characters', label: '👤 HÉROES', color: 'var(--natural-green)', visible: user.role !== 'admin' },
          { id: 'database', label: '📚 COMPENDIO', color: 'var(--accent-gold)', visible: true },
          { id: 'admin', label: '👑 ADMIN', color: '#f59e0b', visible: user.role === 'admin' }
        ].filter(t => t.visible !== false).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="font-cinzel"
            style={{ 
              padding: '12px 25px', 
              border: '1px solid var(--border-color)',
              borderBottom: 'none',
              background: activeTab === tab.id ? 'var(--bg-surface)' : 'transparent', 
              color: activeTab === tab.id ? tab.color : 'var(--text-secondary)', 
              fontWeight: 'bold', 
              cursor: 'pointer', 
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              borderTop: activeTab === tab.id ? `3px solid ${tab.color}` : '1px solid var(--border-color)',
              marginTop: activeTab === tab.id ? '0' : '5px'
            }}
          >
            {tab.label}
          </button>
        ))}
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
                                hp: c.max_hp || 10,
                                max_hp: c.max_hp || 10,
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
        {activeTab === 'characters' && (user.role === 'player' || user.role === 'dm' || user.role === 'admin') && (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <CharacterManager
              socket={socket}
              characters={characters}
              monsters={monsters}
              compendium={compendium}
              userRole={user.role}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;