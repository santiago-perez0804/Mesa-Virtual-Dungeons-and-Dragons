import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Palette, AlertTriangle, LogOut, Search, DoorOpen } from 'lucide-react';
import LoginScreen from './components/PantallaLogin';
import DiceVisualizer from './components/VisualizadorDados';
import { CharacterManager } from './components/GestorPersonajes.tsx';
import { CombatGrid } from './components/GrillaCombate.tsx';
import { CompendiumView } from './features/compendium/components/CompendiumView';
import { AdminPanel } from './features/admin/components/AdminPanel';
// import { ChatPanel } from './components/PanelChat.tsx';
import { CampaignsView } from './features/campaigns/components/CampaignsView';
import { parseAndRollHP } from './utils/utilidadesDados';

type DiceType = 'd3' | 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

const socket = io(
  window.location.port === '5173'
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : window.location.origin
);

function App() {
  const [user, setUser] = useState<{ name: string; role: 'dm' | 'player' | 'admin'; profile_image?: string } | null>(null);
  const [globalAlert, setGlobalAlert] = useState<{ message: string; isFadingOut: boolean } | null>(null);
  const alertTimeoutRef = useRef<any>(null);

  // Sobrescribir window.alert globalmente para evitar bugs de foco de Electron
  useEffect(() => {
    window.alert = (msg: any) => {
      setGlobalAlert({ message: String(msg), isFadingOut: false });
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
      alertTimeoutRef.current = setTimeout(() => {
        setGlobalAlert(prev => prev ? { ...prev, isFadingOut: true } : null);
        alertTimeoutRef.current = setTimeout(() => {
          setGlobalAlert(null);
        }, 500);
      }, 3500);
    };
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []);
  const [isCheckingToken, setIsCheckingToken] = useState(!!localStorage.getItem('dnd_vtt_token'));
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);
  const [currentRoll, setCurrentRoll] = useState<{ value: number; die: DiceType } | null>(null);
  const [characters, setCharacters] = useState<any[]>([]);
  const [monsters, setMonsters] = useState<any[]>([]);
  const [compendium, setCompendium] = useState<any[]>([]);
  const [boardTokens, setBoardTokens] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'combat' | 'database' | 'admin' | 'characters' | 'campaigns'>('campaigns');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isCampaignsLoaded, setIsCampaignsLoaded] = useState(false);
  const [isCharactersLoaded, setIsCharactersLoaded] = useState(false);

  const [currentRoomCampaignId, setCurrentRoomCampaignId] = useState<number | null>(() => {
    const saved = localStorage.getItem('dnd_vtt_campaign_room');
    return saved ? Number(saved) : null;
  });

  const [showHeroSelectorForCampaignId, setShowHeroSelectorForCampaignId] = useState<number | null>(null);
  const [pendingRoomJoin, setPendingRoomJoin] = useState<number | null>(null);

  const joinedCampaign = campaigns.find(c => c.id === currentRoomCampaignId);
  const currentRole = user
    ? (user.role === 'admin' ? 'admin' : (joinedCampaign && joinedCampaign.owner === user.name ? 'dm' : 'player'))
    : 'player';

  const currentRoleRef = useRef(currentRole);
  useEffect(() => {
    currentRoleRef.current = currentRole;
  }, [currentRole]);

  const handleJoinCampaignRoom = (campaign: any) => {
    const campaignId = campaign.id;
    alert("Iniciando ingreso a campaña ID: " + campaignId);
    if (!campaign) {
      alert("No se encontró la campaña: " + campaignId + " | total campañas: " + campaigns.length);
      return;
    }

    const savedHeroId = localStorage.getItem(`dnd_vtt_campaign_${campaignId}_hero`);
    const isPlayer = user && user.role !== 'admin' && campaign.owner !== user.name;

    alert(`Debug: isPlayer=${isPlayer}, savedHeroId=${savedHeroId}, owner=${campaign.owner}, currentUser=${user?.name}`);

    if (isPlayer && !savedHeroId) {
      // Primera vez que se une: validar héroes del jugador
      const playerCharacters = characters.filter(c => c.owner === user?.name);
      if (playerCharacters.length === 0) {
        alert("⚔️ ¡No tienes ningún héroe creado! Te redirigiremos a la pestaña de HÉROES para que crees tu personaje antes de entrar a la aventura.");
        setActiveTab('characters');
        return;
      }
      // Mostrar selector de héroes
      alert("Mostrando selector de héroes para campaña: " + campaignId);
      setShowHeroSelectorForCampaignId(campaignId);
      return;
    }

    alert("Entrando directo a la sala. Seteando variables de estado y tab a combat.");
    // Entrar directo (DM, admin, o jugador que ya eligió héroe)
    setCurrentRoomCampaignId(campaignId);
    localStorage.setItem('dnd_vtt_campaign_room', String(campaignId));
    socket.emit('room:join', { campaignId, characterId: savedHeroId ? Number(savedHeroId) : undefined });
    setActiveTab('combat');
    alert("Tab de combate activada.");
  };

  const handleLeaveRoom = () => {
    socket.emit('room:leave');
    setCurrentRoomCampaignId(null);
    localStorage.removeItem('dnd_vtt_campaign_room');
    
    // Limpiar parámetro 'room' de la URL sin recargar la página
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    window.history.replaceState({}, document.title, url.pathname + url.search);

    setActiveTab('campaigns');
  };

  // Efecto para procesar ingresos pendientes (link o recargas)
  useEffect(() => {
    if (pendingRoomJoin !== null && isCampaignsLoaded && isCharactersLoaded && user) {
      const roomId = pendingRoomJoin;
      setPendingRoomJoin(null); // Limpiar para evitar bucles
      
      const campaign = campaigns.find(c => c.id === roomId);
      if (campaign) {
        const isPlayer = user.role !== 'admin' && campaign.owner !== user.name;
        if (isPlayer) {
          const savedHeroId = localStorage.getItem(`dnd_vtt_campaign_${roomId}_hero`);
          if (!savedHeroId) {
            const playerCharacters = characters.filter(c => c.owner === user.name);
            if (playerCharacters.length === 0) {
              alert("⚔️ ¡No tienes ningún héroe creado! Te redirigiremos a la pestaña de HÉROES para que crees tu personaje antes de entrar a la aventura.");
              setActiveTab('characters');
              return;
            }
            setShowHeroSelectorForCampaignId(roomId);
            return;
          }
        }
        
        // Si ya tiene personaje o es DM/admin, entra directo
        const savedHeroId2 = localStorage.getItem(`dnd_vtt_campaign_${roomId}_hero`);
        setCurrentRoomCampaignId(roomId);
        localStorage.setItem('dnd_vtt_campaign_room', String(roomId));
        socket.emit('room:join', { campaignId: roomId, characterId: savedHeroId2 ? Number(savedHeroId2) : undefined });
        setActiveTab('combat');
      }
    }
  }, [pendingRoomJoin, isCampaignsLoaded, isCharactersLoaded, user, campaigns, characters]);

  useEffect(() => {
    if (isCampaignsLoaded && currentRoomCampaignId === null && activeTab === 'combat') {
      setActiveTab('campaigns');
    }
  }, [currentRoomCampaignId, activeTab, isCampaignsLoaded]);
  const [imageToast, setImageToast] = useState<{ id: number; name: string; status: 'generating' | 'ready' | 'failed' } | null>(null);

  const [overlayCharacterId, setOverlayCharacterId] = useState<number | null>(null);
  const [overlayMonsterId, setOverlayMonsterId] = useState<string | null>(null);

  const onRollCompleteRef = useRef<(() => void) | null>(null);

  const triggerDiceRoll = (die: DiceType, value: number, onComplete?: () => void) => {
    onRollCompleteRef.current = onComplete || null;
    setCurrentRoll({ die, value });
  };

  // Eliminar el useEffect que forzaba al admin a ir al panel de admin para que pueda ver la grilla

  // Estado para el Bestiario inline
  const [monsterSearch, setMonsterSearch] = useState('');

  useEffect(() => {
    socket.on('auth:token_invalid', () => {
      localStorage.removeItem('dnd_vtt_token');
      setUser(null);
      setIsCheckingToken(false);
    });

    socket.on('auth:success', ({ user, token }: { user: any; token?: string }) => {
      setUser({ name: user.username, role: user.role, profile_image: user.profile_image });
      if (token) {
        localStorage.setItem('dnd_vtt_token', token);
      }
      if (user.role === 'admin') {
        setActiveTab('database');
      }
      socket.emit('content:request');
      socket.emit('campaign:request');
      setIsCheckingToken(false);

      // Programar la unión de sala tras cargar campañas
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) {
        const roomId = Number(roomParam);
        if (!isNaN(roomId)) {
          setPendingRoomJoin(roomId);
          return;
        }
      }

      const savedRoom = localStorage.getItem('dnd_vtt_campaign_room');
      if (savedRoom) {
        const roomId = Number(savedRoom);
        if (!isNaN(roomId)) {
          setPendingRoomJoin(roomId);
        }
      }
    });

    socket.on('character:list', (list) => {
      setCharacters(list);
      setIsCharactersLoaded(true);
    });

    socket.on('monsters:list', (data: any[]) => {
      setMonsters(data);
    });

    socket.on('content:list', (data: any[]) => {
      setCompendium(data);
    });

    socket.on('campaign:list', (list: any[]) => {
      setIsCampaignsLoaded(true);
      setCampaigns(list);
    });

    socket.on('chat:message', (msg: any) => {
      setChatMessages(prev => [...prev, msg]);
    });

    socket.on('dice:result', (data: any) => {
      const currentUser = userRef.current;
      const rollTo = data.to || 'all';
      const isSender = data.user === currentUser?.name;
      const isRecipient = rollTo === currentUser?.name || (rollTo === 'Dungeon Master' && currentRoleRef.current === 'dm');
      const isPublic = rollTo === 'all';

      if (isPublic || isSender || isRecipient) {
        setCurrentRoll({ value: data.value, die: data.die as DiceType });
        setChatMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          sender: 'Sistema',
          to: rollTo,
          text: `🎲 ${data.user} tiró un ${data.die}: ${data.value}`,
          timestamp: new Date(data.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystem: true
        }]);
      }
    });

    socket.on('token:board-list', (tokens: any[]) => {
      setBoardTokens(tokens);
    });

    socket.on('content:generating_image', ({ id, name }: { id: number; name: string }) => {
      setImageToast({ id, name, status: 'generating' });
    });

    socket.on('content:image_ready', ({ id, name }: { id: number; name: string }) => {
      setImageToast({ id, name, status: 'ready' });
      setTimeout(() => setImageToast(null), 4000);
    });

    socket.on('content:image_failed', ({ id, name }: { id: number; name: string }) => {
      setImageToast({ id, name, status: 'failed' });
      setTimeout(() => setImageToast(null), 4000);
    });

    const savedToken = localStorage.getItem('dnd_vtt_token');
    if (savedToken) {
      socket.emit('auth:token_login', { token: savedToken });
    }

    return () => {
      socket.off('auth:token_invalid');
      socket.off('auth:success');
      socket.off('character:list');
      socket.off('monsters:list');
      socket.off('content:list');
      socket.off('campaign:list');
      socket.off('chat:message');
      socket.off('dice:result');
      socket.off('token:board-list');
      socket.off('content:generating_image');
      socket.off('content:image_ready');
      socket.off('content:image_failed');
    };
  }, []);

  const handleLogin = (loggedUser: { name: string; role: 'dm' | 'player' | 'admin'; profile_image?: string; token?: string }) => {
    setUser(loggedUser);
    if (loggedUser.token) {
      localStorage.setItem('dnd_vtt_token', loggedUser.token);
    }
    if (loggedUser.role === 'admin') {
      setActiveTab('database');
    }
    socket.emit('content:request'); // Ahora TODOS pueden ver el compendio
    socket.emit('campaign:request');
  };

  const handleProfileImageChange = async (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      const backendUrl = `${window.location.protocol}//${window.location.hostname}:3000`;
      const uploadUrl = `${backendUrl}/api/upload?folder=users`;
      
      try {
        const res = await fetch(uploadUrl, { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          socket.emit('auth:update_profile', { profile_image: data.url });
        } else {
          alert('Error al actualizar foto de perfil: ' + data.error);
        }
      } catch (err) {
        console.error(err);
        alert('Error de conexión al subir la imagen de perfil');
      }
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

  if (isCheckingToken) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'radial-gradient(circle, #1e1b15 0%, #0d0c09 100%)',
        color: 'var(--accent-gold)'
      }}>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.03); }
          }
        `}</style>
        <div className="font-cinzel" style={{ fontSize: '2.5rem', marginBottom: '20px', textShadow: '0 0 20px rgba(200,135,42,0.4)', animation: 'pulse 1.8s ease-in-out infinite', fontWeight: 'bold' }}>
          D&D PP
        </div>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          border: '3px solid rgba(200,135,42,0.15)',
          borderTopColor: 'var(--accent-gold)',
          animation: 'spin 0.8s linear infinite',
          boxShadow: '0 0 10px rgba(200, 135, 42, 0.2)'
        }} />
        <span className="font-cinzel" style={{ fontSize: '0.8rem', marginTop: '15px', color: 'var(--text-secondary)', letterSpacing: '3px', opacity: 0.7 }}>
          INICIANDO MESA...
        </span>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen socket={socket} onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="vtt-main" style={{ position: 'relative', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-base)', color: 'var(--text-parchment)', fontFamily: 'var(--font-body)' }}>

      {/* CAPA DEL LANZADOR DE DADOS 3D (Overlay Interactivo Bloqueante) */}
      {currentRoll && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'all', backgroundColor: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(3px)'
        }}>
          <DiceVisualizer
            resultado={currentRoll.value}
            tipoDeDado={currentRoll.die}
            width={window.innerWidth}
            height={window.innerHeight}
            onAnimationComplete={() => {
              setCurrentRoll(null);
              if (onRollCompleteRef.current) {
                onRollCompleteRef.current();
                onRollCompleteRef.current = null;
              }
            }}
          />
        </div>
      )}

      {/* TOAST: GENERACIÓN DE IMAGEN IA */}
      {imageToast && (
        <div style={{
          position: 'fixed', bottom: '30px', right: '30px', zIndex: 9998,
          background: imageToast.status === 'ready'
            ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.1))'
            : imageToast.status === 'failed'
            ? 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(185,28,28,0.1))'
            : 'linear-gradient(135deg, rgba(200,135,42,0.15), rgba(161,107,31,0.1))',
          border: `1px solid ${imageToast.status === 'ready' ? '#10b981' : imageToast.status === 'failed' ? '#ef4444' : 'var(--accent-gold)'}`,
          borderRadius: '8px', padding: '16px 22px', display: 'flex', alignItems: 'center', gap: '14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
          animation: 'fadeInUp 0.3s ease',
          maxWidth: '320px'
        }}>
          {imageToast.status === 'generating' ? (
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              border: '3px solid rgba(200,135,42,0.3)',
              borderTopColor: 'var(--accent-gold)',
              animation: 'spin 0.8s linear infinite', flexShrink: 0
            }} />
          ) : imageToast.status === 'ready' ? (
            <Palette size={24} style={{ flexShrink: 0 }} />
          ) : (
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
          )}
          <div>
            <div className="font-cinzel" style={{
              color: imageToast.status === 'ready' ? '#10b981' : imageToast.status === 'failed' ? '#ef4444' : 'var(--accent-gold)',
              fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '3px'
            }}>
              {imageToast.status === 'generating' ? 'Generando imagen IA...' : imageToast.status === 'ready' ? '¡Imagen lista!' : 'Sin imagen (plan gratuito)'}
            </div>
            <div style={{ color: 'var(--text-parchment)', fontSize: '0.85rem', fontWeight: 'bold' }}>
              {imageToast.name}
            </div>
            {imageToast.status === 'generating' && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginTop: '2px' }}>
                La imagen se agregará automáticamente al guardarse
              </div>
            )}
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background: 'var(--bg-surface)', padding: 'var(--header-padding)', borderBottom: '2px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="font-cinzel" style={{ fontSize: 'var(--header-title-size)', fontWeight: '900', color: 'var(--accent-gold)', textShadow: '0 0 15px rgba(200, 135, 42, 0.4)', lineHeight: '1' }}>
            {(() => {
              const joinedCampaign = campaigns.find(c => c.id === currentRoomCampaignId);
              if (joinedCampaign) {
                return joinedCampaign.name.length > 30 ? joinedCampaign.name.substring(0, 30) + '...' : joinedCampaign.name;
              }
              return 'D&D PP';
            })()}
          </span>
          <span className="font-cinzel" style={{ fontSize: 'var(--header-subtitle-size)', color: 'var(--text-parchment)', letterSpacing: '4px', opacity: 0.7 }}>
            {campaigns.find(c => c.id === currentRoomCampaignId) ? 'SALA ACTIVA' : 'PARA POBRES'}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 'var(--header-gap)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--header-user-gap)', background: 'rgba(0,0,0,0.3)', padding: 'var(--header-user-padding)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            <div style={{ position: 'relative', width: 'var(--header-avatar-size)', height: 'var(--header-avatar-size)', overflow: 'hidden', background: 'var(--bg-base)', border: '1px solid var(--accent-gold)', cursor: 'pointer' }} title="Cambiar foto de perfil">
              {user.profile_image ? (
                <img src={user.profile_image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div className="font-cinzel" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--header-avatar-font-size)', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: 'var(--header-role-size)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {currentRole === 'dm' ? 'DM' : (currentRole === 'admin' ? 'Administrador' : 'Aventurero')}
              </span>
              <span className="font-cinzel" style={{ fontSize: 'var(--header-name-size)', color: 'var(--text-parchment)', fontWeight: 'bold' }}>{user.name}</span>
            </div>
          </div>
          <button 
            onClick={() => {
              if (currentRoomCampaignId !== null) {
                handleLeaveRoom();
              } else {
                localStorage.removeItem('dnd_vtt_token');
                setUser(null);
              }
            }}
            className="torch-glow"
            style={{ background: 'transparent', border: '1px solid var(--combat-red)', color: 'var(--combat-red)', padding: '0 20px', borderRadius: '4px', cursor: 'pointer', fontSize: 'var(--header-button-font-size)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--header-button-gap)' }}
          >
            {currentRoomCampaignId !== null ? (
              <><DoorOpen style={{ width: 'var(--header-logout-icon-size)', height: 'var(--header-logout-icon-size)' }} /> SALIR</>
            ) : (
              <><LogOut style={{ width: 'var(--header-logout-icon-size)', height: 'var(--header-logout-icon-size)' }} /> SALIR</>
            )}
          </button>
        </div>
      </header>

      {/* TABS NAVEGACIÓN */}
      {currentRoomCampaignId === null && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-base)', padding: 'var(--tabs-padding)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', gap: '2px' }}>
          {[
            { id: 'combat', label: 'COMBATE', color: 'var(--combat-red)', visible: currentRoomCampaignId !== null },
            { id: 'characters', label: 'HÉROES', color: 'var(--natural-green)', visible: currentRole !== 'admin' && currentRoomCampaignId === null },
            { id: 'campaigns', label: 'CAMPAÑAS', color: 'var(--accent-gold)', visible: currentRoomCampaignId === null },
            { id: 'database', label: 'COMPENDIO', color: 'var(--accent-gold)', visible: currentRoomCampaignId === null },
            { id: 'admin', label: 'ADMIN', color: '#f59e0b', visible: currentRole === 'admin' && currentRoomCampaignId === null }
          ].filter(t => t.visible !== false).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="font-cinzel"
              style={{ 
                padding: 'var(--tab-padding)', 
                border: '1px solid var(--border-color)',
                borderBottom: 'none',
                background: activeTab === tab.id ? 'var(--bg-surface)' : 'transparent', 
                color: activeTab === tab.id ? tab.color : 'var(--text-secondary)', 
                fontWeight: 'bold', 
                cursor: 'pointer', 
                fontSize: 'var(--tab-font-size)',
                transition: 'all 0.2s',
                borderTop: activeTab === tab.id ? `3px solid ${tab.color}` : '1px solid var(--border-color)',
                marginTop: activeTab === tab.id ? '0' : 'var(--tab-margin-top-inactive)'
              }}
            >
              {tab.label}
            </button>
          ))}
          </div>
        </div>
      )}

      <main className={`vtt-main-container ${activeTab === 'database' ? 'database-view-active' : ''}`} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', width: '100%', boxSizing: 'border-box', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'combat' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', minWidth: 0, flex: 1 }}>
              <section style={{ borderRadius: '12px', background: '#0f172a', border: '1px solid #334155', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', height: '75vh' }}>
                <CombatGrid
                  socket={socket}
                  characters={characters}
                  monsters={monsters}
                  compendium={compendium}
                  userRole={currentRole}
                  currentUser={user}
                  activeTab={activeTab}
                  onOpenCharacterSheet={setOverlayCharacterId}
                  onOpenMonsterSheet={setOverlayMonsterId}
                  boardTokens={boardTokens}
                  chatMessages={chatMessages}
                />
              </section>

              {(currentRole === 'dm' || currentRole === 'admin') && (
                <div className="dm-quick-sections" style={{
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr', 
                  gap: '0', 
                  background: 'var(--bg-primary, #111)',
                  borderTop: '1px solid rgba(201,168,76,0.12)'
                }}>
                  <style>{`
                    .monster-row { transition: background 0.15s ease; }
                    .monster-row:hover { background: rgba(201,168,76,0.07); }
                    .monster-row .add-btn { opacity: 0.35; transition: all 0.2s ease; }
                    .monster-row:hover .add-btn { opacity: 1; }
                    .monster-row .add-btn:hover { background: rgba(201,168,76,0.15) !important; border-color: rgba(201,168,76,0.9) !important; }
                    
                    .hero-row { transition: background 0.15s ease; }
                    .hero-row:hover { background: rgba(201,168,76,0.06); }
                    .hero-row .invoke-btn { transition: all 0.15s ease; }
                    .hero-row:hover .invoke-btn, .hero-row .invoke-btn:hover { background: rgba(201,168,76,0.1) !important; border-color: rgba(201,168,76,0.7) !important; color: rgba(201,168,76,1) !important; }

                    .custom-scrollbar::-webkit-scrollbar { width: 3px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.25); border-radius: 3px; }
                  `}</style>
                  
                  {/* BESTIARIO */}
                  <section style={{ 
                    padding: '14px 16px', 
                    borderRight: '1px solid rgba(201,168,76,0.12)',
                    display: 'flex', 
                    flexDirection: 'column' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 className="font-cinzel" style={{ 
                        margin: 0, 
                        fontSize: '10px', 
                        letterSpacing: '0.18em', 
                        textTransform: 'uppercase', 
                        color: 'rgba(201,168,76,0.55)', 
                        fontWeight: 500 
                      }}>
                        Bestiario Rápido
                      </h3>
                      <span style={{
                        background: 'rgba(201,168,76,0.08)',
                        border: '1px solid rgba(201,168,76,0.18)',
                        borderRadius: '10px',
                        padding: '1px 7px',
                        fontSize: '10px',
                        color: 'rgba(201,168,76,0.5)'
                      }}>
                        {monsters.length}
                      </span>
                    </div>

                    <div style={{ position: 'relative', marginBottom: '10px' }}>
                      <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(201,168,76,0.4)' }} />
                      <input
                        style={{ 
                          width: '100%', 
                          background: 'rgba(255,255,255,0.04)', 
                          border: '1px solid rgba(201,168,76,0.18)', 
                          borderRadius: '4px', 
                          padding: '6px 10px 6px 30px', 
                          color: '#ccc', 
                          boxSizing: 'border-box',
                          outline: 'none',
                          fontSize: '12px',
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.45)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(201,168,76,0.18)'}
                        placeholder="Buscar monstruo..."
                        value={monsterSearch}
                        onChange={(e) => setMonsterSearch(e.target.value)}
                      />
                    </div>

                    <div className="custom-scrollbar" style={{ flex: 1, maxHeight: '148px', overflowY: 'auto', display: 'flex', flexDirection: 'column', paddingRight: '4px' }}>
                      {monsters.filter((m: any) => m.name.toLowerCase().includes(monsterSearch.toLowerCase())).slice(0, 20).map((m: any) => {
                        let mData: any = {};
                        try { mData = JSON.parse(m.data); } catch (e) {}
                        const subtitle = [mData.type, mData.challenge_rating ? `CR ${mData.challenge_rating}` : null].filter(Boolean).join(' • ');

                        return (
                          <div key={m.id} className="monster-row" style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '7px 6px', 
                            borderBottom: '1px solid rgba(201,168,76,0.07)', 
                            borderRadius: '3px', 
                            cursor: 'pointer' 
                          }}>
                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, paddingRight: '8px' }}>
                              <span style={{ fontSize: '12.5px', color: '#ddd', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</span>
                              {subtitle && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</span>}
                            </div>
                            <button
                              className="add-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                spawnMonster(m);
                              }}
                              style={{ 
                                width: '22px', 
                                height: '22px', 
                                borderRadius: '50%', 
                                border: '1px solid rgba(201,168,76,0.5)', 
                                background: 'transparent', 
                                color: 'rgba(201,168,76,0.8)', 
                                cursor: 'pointer', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                padding: 0,
                                flexShrink: 0
                              }}
                            >
                              <span style={{ marginTop: '-1px', fontSize: '16px', lineHeight: 1 }}>+</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* HEROES DE RESERVA */}
                  <section style={{ 
                    padding: '14px 16px', 
                    display: 'flex', 
                    flexDirection: 'column' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 className="font-cinzel" style={{ 
                        margin: 0, 
                        fontSize: '10px', 
                        letterSpacing: '0.18em', 
                        textTransform: 'uppercase', 
                        color: 'rgba(201,168,76,0.55)', 
                        fontWeight: 500 
                      }}>
                        Héroes de Reserva
                      </h3>
                      <span style={{
                        background: 'rgba(201,168,76,0.08)',
                        border: '1px solid rgba(201,168,76,0.18)',
                        borderRadius: '10px',
                        padding: '1px 7px',
                        fontSize: '10px',
                        color: 'rgba(201,168,76,0.5)'
                      }}>
                        {characters.length}
                      </span>
                    </div>

                    <div className="custom-scrollbar" style={{ flex: 1, maxHeight: '148px', overflowY: 'auto', display: 'flex', flexDirection: 'column', paddingRight: '4px' }}>
                      {characters.map((c: any) => (
                        <div key={c.id} className="hero-row" style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0', 
                          padding: '8px 6px', 
                          borderBottom: '1px solid rgba(201,168,76,0.07)', 
                          borderRadius: '3px', 
                          cursor: 'pointer' 
                        }}>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            background: 'rgba(201,168,76,0.12)',
                            border: '1px solid rgba(201,168,76,0.3)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '10px',
                            flexShrink: 0
                          }}>
                            <span className="font-cinzel" style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(201,168,76,0.8)' }}>
                              {c.name ? c.name.charAt(0).toUpperCase() : '?'}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, paddingRight: '8px' }}>
                            <span style={{ fontSize: '12.5px', color: '#ddd', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)' }}>{c.owner}</span>
                          </div>

                          <button
                            className="invoke-btn"
                            onClick={(e) => {
                              e.stopPropagation();
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
                            style={{ 
                              background: 'transparent', 
                              border: '1px solid rgba(201,168,76,0.3)', 
                              color: 'rgba(201,168,76,0.6)', 
                              padding: '3px 8px', 
                              borderRadius: '3px', 
                              cursor: 'pointer',
                              fontFamily: 'var(--font-title, Cinzel, serif)',
                              fontSize: '10px',
                              letterSpacing: '0.12em',
                              textTransform: 'uppercase',
                              flexShrink: 0
                            }}
                          >
                            Invocar
                          </button>
                        </div>
                      ))}
                      {characters.length === 0 && <div style={{ color: 'rgba(201,168,76,0.4)', fontSize: '11px', textAlign: 'center', marginTop: '20px', fontStyle: 'italic' }}>No hay héroes creados</div>}
                    </div>
                  </section>
                </div>
              )}
            </div>

            {overlayCharacterId && (
              <CharacterManager 
                socket={socket} 
                characters={characters} 
                compendium={compendium} 
                userRole={currentRole} 
                triggerDiceRoll={triggerDiceRoll} 
                isOverlay={true}
                forceOpenId={overlayCharacterId}
                onCloseOverlay={() => setOverlayCharacterId(null)}
              />
            )}

            {overlayMonsterId && (
              <CompendiumView 
                compendium={compendium}
                socket={socket}
                userRole={currentRole} 
                isOverlay={true}
                forceOpenId={overlayMonsterId}
                onCloseOverlay={() => setOverlayMonsterId(null)}
              />
            )}
          </div>
        )}
        {activeTab === 'database' && (
          <CompendiumView compendium={compendium} socket={socket} userRole={currentRole} />
        )}
        {activeTab === 'admin' && currentRole === 'admin' && (
          <AdminPanel socket={socket} />
        )}
        {activeTab === 'characters' && (currentRole === 'player' || currentRole === 'dm' || currentRole === 'admin') && (
          <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <CharacterManager
              socket={socket}
              characters={characters}
              monsters={monsters}
              compendium={compendium}
              userRole={currentRole}
              triggerDiceRoll={triggerDiceRoll}
            />
          </div>
        )}
        {activeTab === 'campaigns' && (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
             <CampaignsView 
               socket={socket}
               userRole={currentRole}
               characters={characters}
               currentUser={user}
               onEnterCampaign={handleJoinCampaignRoom}
             />
          </div>
        )}
      </main>

      {/* MODAL: SELECCIONAR HÉROE AL ENTRAR POR PRIMERA VEZ */}
      {showHeroSelectorForCampaignId !== null && (() => {
        const campaign = campaigns.find(c => c.id === showHeroSelectorForCampaignId);
        const playerCharacters = characters.filter(c => c.owner === user?.name);
        
        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)',
            padding: '20px'
          }}>
            <div style={{
              background: 'var(--bg-surface)',
              border: '2px solid var(--accent-gold)',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '600px',
              width: '100%',
              boxShadow: '0 10px 40px rgba(0,0,0,0.9)',
              color: 'var(--text-parchment)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <span className="font-cinzel" style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', letterSpacing: '2px' }}>
                  {campaign?.name.toUpperCase()}
                </span>
                <h2 className="font-cinzel" style={{ margin: '5px 0 10px 0', fontSize: '1.8rem', color: 'var(--text-parchment)' }}>
                  ELIGE TU HÉROE
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                  Selecciona el personaje con el que participarás en esta campaña. Esta elección se recordará para futuras sesiones.
                </p>
              </div>

              <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '12px',
                paddingRight: '6px'
              }} className="custom-scrollbar">
                {playerCharacters.map(char => (
                  <div
                    key={char.id}
                    onClick={() => {
                      localStorage.setItem(`dnd_vtt_campaign_${showHeroSelectorForCampaignId}_hero`, String(char.id));
                      
                      setCurrentRoomCampaignId(showHeroSelectorForCampaignId);
                      localStorage.setItem('dnd_vtt_campaign_room', String(showHeroSelectorForCampaignId));
                      socket.emit('room:join', { campaignId: showHeroSelectorForCampaignId, characterId: char.id });
                      setActiveTab('combat');
                      
                      setShowHeroSelectorForCampaignId(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(201,168,76,0.2)',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(201,168,76,0.06)';
                      e.currentTarget.style.borderColor = 'var(--accent-gold)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)';
                    }}
                  >
                    <div style={{
                      width: '45px', height: '45px', borderRadius: '50%',
                      background: 'rgba(201,168,76,0.1)', border: '1px solid var(--accent-gold)',
                      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {char.image ? (
                        <img src={char.image} alt={char.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span className="font-cinzel" style={{ fontSize: '1.2rem', color: 'var(--accent-gold)' }}>
                          {char.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1.05rem', color: 'var(--text-parchment)' }}>
                        {char.name}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Nivel {char.level || 1} • {char.race || 'Humano'} • {char.class || char.charClass || 'Guerrero'}
                      </span>
                    </div>
                    <div className="font-cinzel" style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>
                      SELECCIONAR →
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowHeroSelectorForCampaignId(null)}
                style={{
                  background: 'transparent',
                  border: '1px solid #444',
                  color: 'var(--text-secondary)',
                  padding: '10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  marginTop: '10px'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes fadeOutScale {
          from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          to { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
        }
      `}</style>

      {/* GLOBAL TOAST ALERT */}
      {globalAlert && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 99999,
          background: 'linear-gradient(135deg, rgba(26,26,31,0.98), rgba(17,17,20,0.98))',
          border: '1px solid var(--accent-gold)',
          borderRadius: '8px',
          padding: '20px 30px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 10px 45px rgba(200, 135, 42, 0.35)',
          backdropFilter: 'blur(10px)',
          animation: globalAlert.isFadingOut 
            ? 'fadeOutScale 0.5s ease-in forwards' 
            : 'fadeInScale 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          maxWidth: '450px',
          width: '90%'
        }} className="clipped-frame">
          <AlertTriangle size={26} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="font-cinzel" style={{
              color: 'var(--accent-gold)',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '4px'
            }}>
              Advertencia
            </div>
            <div style={{ color: 'var(--text-parchment)', fontSize: '0.95rem', fontWeight: '500', lineHeight: '1.4' }}>
              {globalAlert.message}
            </div>
          </div>
          <button
            onClick={() => setGlobalAlert(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: '0 5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-gold)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default App;