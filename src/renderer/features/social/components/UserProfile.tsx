import { useState, useEffect } from 'react';
import { X, User, Mail, Calendar, Clock, MessageCircle, UserPlus, UserCheck, UserMinus, Loader } from 'lucide-react';

interface UserProfileProps {
  socket: any;
  userId: number;
  currentUserId: number;
  onClose: () => void;
  onStartDM: (userId: number) => void;
}

export function UserProfile({ socket, userId, currentUserId, onClose, onStartDM }: UserProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(userId === currentUserId);
  const [editMode, setEditMode] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    socket.emit('users:get_profile', { userId });
    const handler = (data: any) => {
      if (data.id === userId) {
        setProfile(data);
        setDisplayName(data.display_name || '');
        setBio(data.bio || '');
        setEmail(data.email || '');
        setIsOwnProfile(data.id === currentUserId);
        setLoading(false);
      }
    };
    socket.on('users:profile', handler);
    return () => { socket.off('users:profile', handler); };
  }, [socket, userId, currentUserId]);

  const handleUpdate = () => {
    socket.emit('users:update_profile', { display_name: displayName, bio, email });
    socket.once('users:profile_updated', (data: any) => {
      setProfile(data);
      setEditMode(false);
    });
  };

  const handleFriendAction = () => {
    if (!profile) return;
    const fs = profile.friendship;
    if (fs === 'accepted') {
      socket.emit('friends:remove', { userId });
      socket.once('friends:removed', () => setProfile({ ...profile, friendship: null }));
    } else if (fs === 'pending') {
      // pending from us or them
    } else {
      socket.emit('friends:request', { userId });
      socket.once('friends:request_sent', () => setProfile({ ...profile, friendship: 'pending' }));
    }
  };

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
        <Loader size={32} style={{ color: 'var(--accent-gold)', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (!profile) return null;

  const fs = profile.friendship;
  const isOnline = profile.last_seen && (Date.now() - new Date(profile.last_seen).getTime() < 60000);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-gold-subtle)', borderRadius: 'var(--radius-lg)', width: '420px', maxWidth: '90vw', maxHeight: '80vh', overflow: 'auto', boxShadow: 'var(--shadow-modal)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1rem', letterSpacing: '1px' }}>PERFIL</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-raised)', border: '2px solid var(--accent-gold)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {profile.profile_image ? (
                <img src={profile.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={28} style={{ color: 'var(--accent-gold)' }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div className="font-cinzel" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-parchment)' }}>
                {profile.display_name || profile.username}
              </div>
              {profile.display_name && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>@{profile.username}</div>
              )}
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: profile.role === 'admin' ? 'rgba(245,158,11,0.15)' : profile.role === 'dm' ? 'rgba(200,135,42,0.15)' : 'rgba(100,200,100,0.15)', color: profile.role === 'admin' ? '#f59e0b' : profile.role === 'dm' ? 'var(--accent-gold)' : 'var(--natural-green)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                  {profile.role === 'admin' ? 'Admin' : profile.role === 'dm' ? 'DM' : 'Jugador'}
                </span>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: isOnline ? 'rgba(16,185,129,0.15)' : 'rgba(100,100,100,0.15)', color: isOnline ? '#10b981' : 'var(--text-secondary)' }}>
                  {isOnline ? 'En línea' : 'Desconectado'}
                </span>
              </div>
            </div>
          </div>

          {!isOwnProfile && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => onStartDM(userId)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--bg-raised)', color: 'var(--text-parchment)', cursor: 'pointer', fontSize: '0.8rem' }}>
                <MessageCircle size={14} /> Mensaje
              </button>
              <button onClick={handleFriendAction} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', border: `1px solid ${fs === 'accepted' ? 'var(--combat-red)' : fs === 'pending' ? 'var(--text-secondary)' : 'var(--accent-gold)'}`, borderRadius: '6px', background: 'var(--bg-raised)', color: fs === 'accepted' ? 'var(--combat-red)' : fs === 'pending' ? 'var(--text-secondary)' : 'var(--accent-gold)', cursor: 'pointer', fontSize: '0.8rem' }}>
                {fs === 'accepted' ? <><UserMinus size={14} /> Quitar amigo</> : fs === 'pending' ? <><UserCheck size={14} /> Pendiente</> : <><UserPlus size={14} /> Agregar amigo</>}
              </button>
            </div>
          )}

          {editMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Nombre para mostrar</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-parchment)', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-parchment)', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Biografía</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ width: '100%', padding: '8px 10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-parchment)', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button onClick={() => setEditMode(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '4px', cursor: 'pointer' }}>Cancelar</button>
                <button onClick={handleUpdate} style={{ padding: '8px 16px', background: 'var(--accent-gold)', border: 'none', color: '#000', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Guardar</button>
              </div>
            </div>
          ) : (
            <>
              {profile.bio && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} /> Bio</div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-parchment)', lineHeight: 1.5 }}>{profile.bio}</p>
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {profile.email && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {profile.email}</div>}
                {profile.last_seen && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> Última vez: {new Date(profile.last_seen).toLocaleString()}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} /> Miembro desde: ~
                </div>
              </div>
              {isOwnProfile && (
                <button onClick={() => setEditMode(true)} style={{ padding: '8px', background: 'var(--bg-raised)', border: '1px solid var(--border-color)', color: 'var(--accent-gold)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                  Editar perfil
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
