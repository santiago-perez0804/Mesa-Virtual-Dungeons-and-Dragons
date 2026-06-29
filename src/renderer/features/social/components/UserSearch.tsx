import { useState, useEffect, useRef } from 'react';
import { Search, X, User, Loader } from 'lucide-react';

interface UserSearchProps {
  socket: any;
  currentUserId: number;
  onSelectUser: (userId: number) => void;
  onClose: () => void;
}

export function UserSearch({ socket, currentUserId, onSelectUser, onClose }: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    const timer = setTimeout(() => {
      socket.emit('users:search', { query: query.trim() });
    }, 300);
    const handler = (data: any[]) => {
      setResults(data.filter(u => u.id !== currentUserId));
      setLoading(false);
    };
    socket.on('users:search_results', handler);
    return () => {
      clearTimeout(timer);
      socket.off('users:search_results', handler);
    };
  }, [query, socket, currentUserId]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '80px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-gold-subtle)', borderRadius: 'var(--radius-lg)', width: '400px', maxWidth: '90vw', maxHeight: '60vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-modal)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '0.9rem', letterSpacing: '1px' }}>BUSCAR JUGADORES</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
        </div>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por nombre de usuario..."
              style={{ width: '100%', padding: '8px 10px 8px 32px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-parchment)', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <Loader size={20} style={{ color: 'var(--accent-gold)', animation: 'spin 0.8s linear infinite' }} />
            </div>
          )}
          {!loading && results.length === 0 && query.trim().length >= 2 && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No se encontraron jugadores.</div>
          )}
          {results.map(u => (
            <div
              key={u.id}
              onClick={() => { onSelectUser(u.id); onClose(); }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-base)', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {u.profile_image ? (
                  <img src={u.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={16} style={{ color: 'var(--text-secondary)' }} />
                )}
              </div>
              <div>
                <div className="font-cinzel" style={{ fontSize: '0.9rem', color: 'var(--text-parchment)', fontWeight: 600 }}>{u.display_name || u.username}</div>
                {u.display_name && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>@{u.username}</div>}
              </div>
              <div style={{ marginLeft: 'auto', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: u.role === 'admin' ? 'rgba(245,158,11,0.15)' : u.role === 'dm' ? 'rgba(200,135,42,0.15)' : 'rgba(100,200,100,0.15)', color: u.role === 'admin' ? '#f59e0b' : u.role === 'dm' ? 'var(--accent-gold)' : 'var(--natural-green)' }}>
                {u.role === 'admin' ? 'Admin' : u.role === 'dm' ? 'DM' : 'Jugador'}
              </div>
            </div>
          ))}
          {query.trim().length < 2 && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Escribe al menos 2 caracteres para buscar.</div>
          )}
        </div>
      </div>
    </div>
  );
}
