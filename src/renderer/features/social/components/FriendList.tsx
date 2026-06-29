import { useState, useEffect } from 'react';
import { X, User, UserPlus, UserCheck, UserX, MessageCircle, Loader, Search } from 'lucide-react';

interface FriendListProps {
  socket: any;
  currentUserId: number;
  onClose: () => void;
  onSelectUser: (userId: number) => void;
  onStartDM: (userId: number) => void;
}

export function FriendList({ socket, currentUserId, onClose, onSelectUser, onStartDM }: FriendListProps) {
  const [tab, setTab] = useState<'friends' | 'pending' | 'search'>('friends');
  const [friends, setFriends] = useState<any[]>([]);
  const [pending, setPending] = useState<{ received: any[]; sent: any[] }>({ received: [], sent: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const loadData = () => {
    setLoading(true);
    socket.emit('friends:list');
    socket.emit('friends:pending');
  };

  useEffect(() => {
    loadData();
    const friendsHandler = (data: any[]) => { setFriends(data); setLoading(false); };
    const pendingHandler = (data: any) => { setPending(data); };
    const acceptedHandler = () => { loadData(); };
    const removedHandler = () => { loadData(); };
    socket.on('friends:list', friendsHandler);
    socket.on('friends:pending', pendingHandler);
    socket.on('friends:accepted', acceptedHandler);
    socket.on('friends:removed', removedHandler);
    socket.on('friends:request_accepted', acceptedHandler);
    return () => {
      socket.off('friends:list', friendsHandler);
      socket.off('friends:pending', pendingHandler);
      socket.off('friends:accepted', acceptedHandler);
      socket.off('friends:removed', removedHandler);
      socket.off('friends:request_accepted', acceptedHandler);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(() => {
      socket.emit('users:search', { query: searchQuery.trim() });
    }, 300);
    const handler = (data: any[]) => setSearchResults(data.filter(u => u.id !== currentUserId));
    socket.on('users:search_results', handler);
    return () => { clearTimeout(timer); socket.off('users:search_results', handler); };
  }, [searchQuery]);

  const handleAccept = (userId: number) => {
    socket.emit('friends:accept', { userId });
    socket.once('friends:accepted', () => loadData());
  };

  const handleRemove = (userId: number) => {
    socket.emit('friends:remove', { userId });
    socket.once('friends:removed', () => loadData());
  };

  const handleRequest = (userId: number) => {
    socket.emit('friends:request', { userId });
    socket.once('friends:request_sent', () => loadData());
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '60px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-gold-subtle)', borderRadius: 'var(--radius-lg)', width: '420px', maxWidth: '90vw', maxHeight: '70vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-modal)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '0.9rem', letterSpacing: '1px' }}>AMIGOS</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
          {['friends', 'pending', 'search'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              style={{ flex: 1, padding: '10px', background: tab === t ? 'var(--bg-raised)' : 'transparent', border: 'none', color: tab === t ? 'var(--accent-gold)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px', borderBottom: tab === t ? '2px solid var(--accent-gold)' : '2px solid transparent' }}
            >
              {t === 'friends' ? `AMIGOS (${friends.length})` : t === 'pending' ? `SOLICITUDES (${pending.received.length})` : 'BUSCAR'}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {tab === 'friends' && (
            loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Loader size={20} style={{ color: 'var(--accent-gold)', animation: 'spin 0.8s linear infinite' }} /></div>
            ) : friends.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <UserPlus size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                No tienes amigos aún. Busca jugadores en la pestaña "BUSCAR".
              </div>
            ) : (
              friends.map(f => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-base)', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }} onClick={() => onSelectUser(f.id)}>
                    {f.profile_image ? <img src={f.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={16} style={{ color: 'var(--text-secondary)' }} />}
                  </div>
                  <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onSelectUser(f.id)}>
                    <div className="font-cinzel" style={{ fontSize: '0.85rem', color: 'var(--text-parchment)', fontWeight: 600 }}>{f.display_name || f.username}</div>
                  </div>
                  <button onClick={() => onStartDM(f.id)} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '6px', color: 'var(--accent-gold)', cursor: 'pointer', display: 'flex' }} title="Mensaje directo"><MessageCircle size={14} /></button>
                  <button onClick={() => handleRemove(f.id)} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '6px', color: 'var(--combat-red)', cursor: 'pointer', display: 'flex' }} title="Eliminar amigo"><UserX size={14} /></button>
                </div>
              ))
            )
          )}

          {tab === 'pending' && (
            <div style={{ padding: '12px 0' }}>
              {pending.received.length > 0 && (
                <>
                  <div style={{ padding: '4px 20px 8px', fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Recibidas</div>
                  {pending.received.map(r => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-base)', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }} onClick={() => onSelectUser(r.id)}>
                        {r.profile_image ? <img src={r.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={16} style={{ color: 'var(--text-secondary)' }} />}
                      </div>
                      <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onSelectUser(r.id)}>
                        <div className="font-cinzel" style={{ fontSize: '0.85rem', color: 'var(--text-parchment)', fontWeight: 600 }}>{r.display_name || r.username}</div>
                      </div>
                      <button onClick={() => handleAccept(r.id)} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', borderRadius: '4px', padding: '6px 12px', color: '#10b981', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Aceptar</button>
                      <button onClick={() => handleRemove(r.id)} style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '6px', color: 'var(--combat-red)', cursor: 'pointer', display: 'flex' }}><UserX size={14} /></button>
                    </div>
                  ))}
                </>
              )}
              {pending.sent.length > 0 && (
                <>
                  <div style={{ padding: '12px 20px 8px', fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Enviadas</div>
                  {pending.sent.map(s => (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', opacity: 0.6 }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-base)', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {s.profile_image ? <img src={s.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={16} style={{ color: 'var(--text-secondary)' }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="font-cinzel" style={{ fontSize: '0.85rem', color: 'var(--text-parchment)', fontWeight: 600 }}>{s.display_name || s.username}</div>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>Pendiente...</span>
                    </div>
                  ))}
                </>
              )}
              {pending.received.length === 0 && pending.sent.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No hay solicitudes pendientes.</div>
              )}
            </div>
          )}

          {tab === 'search' && (
            <div style={{ padding: '12px 20px' }}>
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre..."
                  style={{ width: '100%', padding: '8px 10px 8px 32px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-parchment)', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              {searchResults.map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-base)', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }} onClick={() => onSelectUser(u.id)}>
                    {u.profile_image ? <img src={u.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={16} style={{ color: 'var(--text-secondary)' }} />}
                  </div>
                  <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onSelectUser(u.id)}>
                    <div className="font-cinzel" style={{ fontSize: '0.85rem', color: 'var(--text-parchment)', fontWeight: 600 }}>{u.display_name || u.username}</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: u.role === 'admin' ? 'rgba(245,158,11,0.15)' : u.role === 'dm' ? 'rgba(200,135,42,0.15)' : 'rgba(100,200,100,0.15)', color: u.role === 'admin' ? '#f59e0b' : u.role === 'dm' ? 'var(--accent-gold)' : 'var(--natural-green)' }}>
                    {u.role === 'admin' ? 'Admin' : u.role === 'dm' ? 'DM' : 'Jugador'}
                  </span>
                  <button onClick={() => handleRequest(u.id)} style={{ background: 'none', border: '1px solid var(--accent-gold)', borderRadius: '4px', padding: '6px 10px', color: 'var(--accent-gold)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Agregar</button>
                </div>
              ))}
              {searchQuery.trim().length < 2 && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '20px' }}>Escribe al menos 2 caracteres para buscar.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
