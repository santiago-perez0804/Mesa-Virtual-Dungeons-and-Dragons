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
    socket.emit('auth:register', { username: newUsername.trim(), password: newPassword, role: 'player', profile_image: newProfileImage });
  };

  const handleRegisterImage = async (e: any) => {
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
          setNewProfileImage(data.url);
        } else {
          alert('Error al subir imagen: ' + data.error);
        }
      } catch (err) {
        console.error(err);
        alert('Error de conexión al subir la imagen');
      }
    }
  };

  const getProfileIcon = (profile: any) => {
    if (profile.profile_image) return <img src={profile.profile_image} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
    if (profile.role === 'admin') return <span style={{ fontSize: '3rem' }}>🛡️</span>; // Escudo
    if (profile.role === 'dm') return <span style={{ fontSize: '3rem' }}>🧙‍♂️</span>; // Capucha (Mago)
    return <span style={{ fontSize: '3rem' }}>⚔️</span>; // Espada
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-base)', padding: '40px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '4rem', margin: 0, textShadow: '0 0 20px rgba(200, 135, 42, 0.4)' }}>D&D PP</h1>
        <p className="font-cinzel" style={{ color: 'var(--text-parchment)', fontSize: '1.2rem', letterSpacing: '3px', opacity: 0.8 }}>PARA POBRES</p>
      </div>

      {errorMsg && <div className="clipped-frame" style={{ background: 'var(--combat-red)', color: 'white', padding: '15px 30px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', maxWidth: '400px' }}>{errorMsg}</div>}
      {successMsg && <div className="clipped-frame" style={{ background: 'var(--natural-green)', color: 'white', padding: '15px 30px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', maxWidth: '400px' }}>{successMsg}</div>}

      {!selectedProfile && !isRegistering && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', maxWidth: '1000px' }}>
          {profiles.map(p => (
            <div
              key={p.id}
              onClick={() => { setSelectedProfile(p); setErrorMsg(''); setSuccessMsg(''); setPassword(''); }}
              className="clipped-frame torch-glow"
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', width: '160px', padding: '20px', transition: 'all 0.3s' }}
            >
              <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', overflow: 'hidden' }}>
                {getProfileIcon(p)}
              </div>
              <span className="font-cinzel" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-parchment)' }}>{p.username}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '5px' }}>{p.role}</span>
            </div>
          ))}

          <div
            onClick={() => { setIsRegistering(true); setErrorMsg(''); setSuccessMsg(''); }}
            className="clipped-frame torch-glow"
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', width: '160px', padding: '20px', transition: 'all 0.3s', borderStyle: 'dashed' }}
          >
            <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'var(--border-color)', marginBottom: '15px' }}>
              +
            </div>
            <span className="font-cinzel" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>NUEVO HÉROE</span>
          </div>
        </div>
      )}

      {(selectedProfile || isRegistering) && (
        <div className="clipped-frame" style={{ padding: '40px', width: '380px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
          <h2 className="font-cinzel" style={{ textAlign: 'center', color: 'var(--accent-gold)', marginBottom: '30px', marginTop: 0 }}>
            {isRegistering ? 'NUEVO AVENTURERO' : 'IDENTIFÍCATE'}
          </h2>
          
          <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {isRegistering ? (
              <>
                <input
                  type="text"
                  placeholder="NOMBRE DE USUARIO"
                  className="mono"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }}
                />
                <input
                  type="password"
                  placeholder="CONTRASEÑA"
                  className="mono"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }}
                />
                <div style={{ border: '1px dashed var(--border-color)', padding: '10px', textAlign: 'center', position: 'relative', overflow: 'hidden', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {newProfileImage ? (
                    <img src={newProfileImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute' }} />
                  ) : (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>SUBIR FOTO DE PERFIL</span>
                  )}
                  <input type="file" accept="image/*" onChange={handleRegisterImage} style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                  <div style={{ width: '50px', height: '50px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getProfileIcon(selectedProfile)}
                  </div>
                  <div>
                    <div className="font-cinzel" style={{ color: 'white', fontSize: '1.2rem' }}>{selectedProfile.username}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase' }}>{selectedProfile.role}</div>
                  </div>
                </div>
                <input
                  type="password"
                  placeholder="CONTRASEÑA"
                  className="mono"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  style={{ width: '100%', padding: '12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none' }}
                />
              </>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="submit"
                className="torch-glow"
                style={{ flex: 1, padding: '14px', background: 'var(--accent-gold)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {isRegistering ? 'CREAR' : 'ENTRAR'}
              </button>
              <button
                type="button"
                onClick={() => { setSelectedProfile(null); setIsRegistering(false); }}
                style={{ padding: '14px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', fontWeight: 'bold', cursor: 'pointer' }}
              >
                VOLVER
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;