import React, { useState, useEffect } from 'react';
import { ProfileCard } from './ui/ProfileCard';
import { Eye, EyeOff, Shield, UserRound, Swords } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);

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
    if (profile.role === 'admin') return <Shield size={48} color="var(--accent-gold)" />; // Escudo
    if (profile.role === 'dm') return <UserRound size={48} color="var(--accent-gold)" />; // Capucha (Mago)
    return <Swords size={48} color="var(--text-secondary)" />; // Espada
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
            <ProfileCard
              key={p.id}
              profile={p}
              getProfileIcon={getProfileIcon}
              onClick={() => { setSelectedProfile(p); setErrorMsg(''); setSuccessMsg(''); setPassword(''); }}
            />
          ))}

          <ProfileCard
            isNew
            onClick={() => { setIsRegistering(true); setErrorMsg(''); setSuccessMsg(''); }}
          />
        </div>
      )}

      {(selectedProfile || isRegistering) && (
        <div style={{ padding: '40px', width: '380px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-modal)' }}>
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
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="CONTRASEÑA"
                    className="mono"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ width: '100%', padding: '12px', paddingRight: '40px', background: 'var(--bg-base)', border: `1px solid ${errorMsg ? 'var(--combat-red)' : 'var(--border-color)'}`, color: 'var(--text-parchment)', outline: 'none' }}
                  />
                  <div style={{ position: 'absolute', right: '12px', top: '12px', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </div>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px', padding: '10px', background: 'var(--bg-raised)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid var(--gold-primary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
                    {getProfileIcon(selectedProfile)}
                  </div>
                  <div>
                    <div className="font-cinzel" style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 'bold' }}>{selectedProfile.username}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>{selectedProfile.role}</div>
                  </div>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="CONTRASEÑA"
                    className="mono"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    style={{ width: '100%', padding: '12px', paddingRight: '40px', background: 'var(--bg-base)', border: `1px solid ${errorMsg ? 'var(--combat-red)' : 'var(--border-normal)'}`, borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                  <div style={{ position: 'absolute', right: '12px', top: '12px', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                  {errorMsg && (
                    <div style={{ color: 'var(--combat-red)', fontSize: '0.8rem', marginTop: '6px' }}>
                      {errorMsg}
                    </div>
                  )}
                </div>
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