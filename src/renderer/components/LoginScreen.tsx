import React, { useState, useEffect } from 'react';

interface LoginProps {
  socket: any;
  onLoginSuccess: (user: { name: string; role: 'dm' | 'player' | 'admin'; profile_image?: string }) => void;
}

const LoginScreen: React.FC<LoginProps> = ({ socket, onLoginSuccess }) => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [password, setPassword] = useState('');

  const [isRegistering, setIsRegistering] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newProfileImage, setNewProfileImage] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    socket.emit('auth:get_profiles');

    socket.on('auth:profiles_list', (data: any[]) => {
      setProfiles(data);
    });

    socket.on('auth:success', (user: any) => {
      onLoginSuccess({ name: user.username, role: user.role, profile_image: user.profile_image });
    });

    socket.on('auth:error', (msg: string) => {
      setErrorMsg(msg);
      setSuccessMsg('');
    });

    socket.on('auth:register_success', (msg: string) => {
      setSuccessMsg(msg);
      setErrorMsg('');
      setIsRegistering(false);
      setNewPassword('');
      setNewUsername('');
      setNewProfileImage('');
      socket.emit('auth:get_profiles'); // Refresh profiles
    });

    return () => {
      socket.off('auth:profiles_list');
      socket.off('auth:success');
      socket.off('auth:error');
      socket.off('auth:register_success');
    };
  }, [socket, onLoginSuccess]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Ingresa la contraseña.');
      return;
    }
    socket.emit('auth:login', { username: selectedProfile.username, password });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      setErrorMsg('Usuario y contraseña son requeridos.');
      return;
    }
    // Como solo puede haber 1 Admin y 1 DM, forzamos que todos los registros nuevos sean players
    socket.emit('auth:register', { username: newUsername.trim(), password: newPassword, role: 'player', profile_image: newProfileImage });
  };

  const handleRegisterImage = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setNewProfileImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getProfileIcon = (profile: any) => {
    if (profile.profile_image) return <img src={profile.profile_image} alt="User" style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }} />;
    if (profile.role === 'admin') return <span>👑</span>;
    if (profile.role === 'dm') return <img src="/img/dm_profile.png" alt="DM" style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }} />;
    return <span>🛡️</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', backgroundColor: '#121212', color: 'white', fontFamily: 'sans-serif', padding: '40px' }}>

      <h1 style={{ color: '#a855f7', marginBottom: '10px', fontSize: '3rem' }}>Decide and Die</h1>
      <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '40px' }}>¿Quién está jugando?</p>

      {errorMsg && <div style={{ background: '#ef4444', color: 'white', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center', maxWidth: '400px', width: '100%' }}>{errorMsg}</div>}
      {successMsg && <div style={{ background: '#22c55e', color: 'white', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center', maxWidth: '400px', width: '100%' }}>{successMsg}</div>}

      {!selectedProfile && !isRegistering && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', maxWidth: '800px' }}>
          {profiles.map(p => (
            <div
              key={p.id}
              onClick={() => { setSelectedProfile(p); setErrorMsg(''); setSuccessMsg(''); setPassword(''); }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s', width: '120px' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ width: '100px', height: '100px', borderRadius: '12px', background: p.role === 'admin' ? '#fbbf24' : p.role === 'dm' ? '#a855f7' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', marginBottom: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                {getProfileIcon(p)}
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#cbd5e1', textAlign: 'center' }}>{p.username}</span>
            </div>
          ))}

          <div
            onClick={() => { setIsRegistering(true); setErrorMsg(''); setSuccessMsg(''); }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s', width: '120px' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ width: '100px', height: '100px', borderRadius: '12px', border: '2px dashed #475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#475569', marginBottom: '10px' }}>
              +
            </div>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#94a3b8', textAlign: 'center' }}>Crear Perfil</span>
          </div>
        </div>
      )}

      {selectedProfile && (
        <div style={{ background: '#1e293b', padding: '40px', borderRadius: '12px', width: '350px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', border: '1px solid #334155', animation: 'fadeIn 0.3s ease-in-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: selectedProfile.role === 'admin' ? '#fbbf24' : selectedProfile.role === 'dm' ? '#a855f7' : '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', overflow: 'hidden' }}>
              {getProfileIcon(selectedProfile)}
            </div>
            <div>
              <h3 style={{ margin: 0, color: 'white' }}>{selectedProfile.username}</h3>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{selectedProfile.role.toUpperCase()}</span>
            </div>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: 'white', boxSizing: 'border-box', fontSize: '1rem' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{ flex: 1, padding: '12px', background: '#a855f7', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                style={{ padding: '12px', background: '#475569', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Volver
              </button>
            </div>
          </form>
        </div>
      )}

      {isRegistering && (
        <div style={{ background: '#1e293b', padding: '40px', borderRadius: '12px', width: '350px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', border: '1px solid #334155', animation: 'fadeIn 0.3s ease-in-out' }}>
          <h2 style={{ textAlign: 'center', color: '#3b82f6', marginBottom: '20px', marginTop: 0 }}>Nuevo Jugador</h2>
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input
              type="text"
              placeholder="Nombre de Usuario"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              autoFocus
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: 'white', boxSizing: 'border-box', fontSize: '1rem' }}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: 'white', boxSizing: 'border-box', fontSize: '1rem' }}
            />
            <div style={{ border: '2px dashed #475569', borderRadius: '8px', padding: '10px', textAlign: 'center', position: 'relative', overflow: 'hidden', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {newProfileImage ? (
                <img src={newProfileImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }} />
              ) : (
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Subir Foto de Perfil</span>
              )}
              <input type="file" accept="image/*" onChange={handleRegisterImage} style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="submit"
                style={{ flex: 1, padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Crear Perfil
              </button>
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                style={{ padding: '12px', background: '#475569', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default LoginScreen;