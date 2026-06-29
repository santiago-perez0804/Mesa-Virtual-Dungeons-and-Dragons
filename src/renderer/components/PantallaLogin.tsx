import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield, User, Lock, Upload } from 'lucide-react';

interface LoginProps {
  socket: any;
  onLoginSuccess: (user: { id: number; name: string; role: 'dm' | 'player' | 'admin'; profile_image?: string; token?: string }) => void;
}

const LoginScreen: React.FC<LoginProps> = ({ socket, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [isRegistering, setIsRegistering] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newProfileImage, setNewProfileImage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    socket.on('auth:success', ({ user, token }: { user: any; token: string }) => {
      onLoginSuccess({ id: user.id, name: user.username, role: user.role, profile_image: user.profile_image, token });
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
    });

    return () => {
      socket.off('auth:success');
      socket.off('auth:error');
      socket.off('auth:register_success');
    };
  }, [socket, onLoginSuccess]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Por favor, ingresa tu usuario y contraseña.');
      return;
    }
    socket.emit('auth:login', { username: username.trim(), password });
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'radial-gradient(circle, #1e1b15 0%, #0d0c09 100%)', padding: '40px' }}>
      
      {/* Logotipo del VTT */}
      <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeInDown 0.8s ease' }}>
        <h1 className="font-cinzel" style={{ color: 'var(--accent-gold)', fontSize: '4.5rem', margin: 0, textShadow: '0 0 30px rgba(200, 135, 42, 0.45)', letterSpacing: '2px' }}>D&D PP</h1>
        <p className="font-cinzel" style={{ color: 'var(--text-parchment)', fontSize: '1.1rem', letterSpacing: '6px', opacity: 0.8, marginTop: '5px' }}>MESA VIRTUAL PARA POBRES</p>
      </div>

      {/* Caja del Formulario */}
      <div className="clipped-frame" style={{
        padding: '40px',
        width: '380px',
        background: 'var(--bg-surface)',
        border: '1px solid rgba(200, 135, 42, 0.25)',
        borderRadius: '8px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeInUp 0.6s ease'
      }}>
        <h2 className="font-cinzel" style={{ textAlign: 'center', color: 'var(--accent-gold)', marginBottom: '30px', marginTop: 0, letterSpacing: '1px', fontSize: '1.4rem' }}>
          {isRegistering ? 'NUEVO AVENTURERO' : 'IDENTIFÍCATE'}
        </h2>

        {/* Mensajes de Alerta */}
        {errorMsg && (
          <div className="clipped-frame" style={{ background: 'rgba(231, 76, 60, 0.15)', border: '1px solid var(--combat-red)', color: '#ff6b6b', padding: '10px 15px', marginBottom: '20px', fontSize: '0.85rem', borderRadius: '4px', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="clipped-frame" style={{ background: 'rgba(39, 174, 96, 0.15)', border: '1px solid var(--natural-green)', color: '#2ecc71', padding: '10px 15px', marginBottom: '20px', fontSize: '0.85rem', borderRadius: '4px', textAlign: 'center' }}>
            {successMsg}
          </div>
        )}
        
        <form onSubmit={isRegistering ? handleRegister : handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!isRegistering ? (
            // Formulario de Login
            <>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'rgba(200, 135, 42, 0.5)' }} />
                <input
                  type="text"
                  placeholder="NOMBRE DE USUARIO"
                  className="mono"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    color: 'var(--text-parchment)',
                    outline: 'none',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-gold)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'rgba(200, 135, 42, 0.5)' }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="CONTRASEÑA"
                  className="mono"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 40px',
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    color: 'var(--text-parchment)',
                    outline: 'none',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent-gold)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
                <div
                  style={{ position: 'absolute', right: '12px', top: '13px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
            </>
          ) : (
            // Formulario de Registro
            <>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'rgba(200, 135, 42, 0.5)' }} />
                <input
                  type="text"
                  placeholder="NUEVO USUARIO"
                  className="mono"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    color: 'var(--text-parchment)',
                    outline: 'none',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'rgba(200, 135, 42, 0.5)' }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="CONTRASEÑA"
                  className="mono"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 40px',
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    color: 'var(--text-parchment)',
                    outline: 'none',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box'
                  }}
                />
                <div
                  style={{ position: 'absolute', right: '12px', top: '13px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
              {/* Imagen del Perfil */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <span className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>IMAGEN DE PERFIL (OPCIONAL)</span>
                <div style={{
                  border: '1px dashed rgba(200,135,42,0.4)',
                  padding: '10px',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: 'var(--bg-base)',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(200,135,42,0.4)'}
                >
                  {newProfileImage ? (
                    <img src={newProfileImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Upload size={20} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleRegisterImage}
                    style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', top: 0, left: 0, zIndex: 10 }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Botones */}
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button
              type="submit"
              className="torch-glow font-cinzel"
              style={{
                flex: 2,
                padding: '14px',
                background: 'linear-gradient(135deg, var(--accent-gold), #b87c22)',
                color: 'var(--bg-base)',
                border: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                letterSpacing: '1.5px',
                fontSize: '0.85rem',
                borderRadius: '4px',
                boxShadow: '0 4px 15px rgba(200, 135, 42, 0.25)',
                transition: 'transform 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {isRegistering ? 'REGISTRAR' : 'ENTRAR'}
            </button>
            <button
              type="button"
              className="font-cinzel"
              onClick={() => {
                setErrorMsg('');
                setSuccessMsg('');
                if (isRegistering) {
                  setIsRegistering(false);
                } else {
                  setIsRegistering(true);
                }
              }}
              style={{
                flex: 1,
                padding: '14px',
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                fontWeight: 'bold',
                cursor: 'pointer',
                letterSpacing: '1px',
                fontSize: '0.75rem',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'var(--text-parchment)';
                e.currentTarget.style.borderColor = 'var(--text-secondary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              {isRegistering ? 'VOLVER' : 'CREAR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;