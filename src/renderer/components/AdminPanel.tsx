import React, { useState, useEffect } from 'react';

export const AdminPanel = ({ socket }: any) => {
  const [users, setUsers] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    socket.emit('admin:get_users');

    socket.on('admin:users_list', (data: any[]) => {
      setUsers(data);
    });

    socket.on('admin:error', (msg: string) => {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 3000);
    });

    return () => {
      socket.off('admin:users_list');
      socket.off('admin:error');
    };
  }, [socket]);

  const handleUpdate = (user: any, field: string, value: string) => {
    const updatedUser = { ...user, [field]: value };
    socket.emit('admin:update_user', updatedUser);
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este perfil?')) {
      socket.emit('admin:delete_user', id);
    }
  };

  return (
    <div style={{ padding: '25px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif', color: 'white' }}>
      <h2 style={{ color: '#a855f7', marginBottom: '20px' }}>👑 Panel de Administración de Perfiles</h2>
      
      {errorMsg && (
        <div style={{ background: '#ef4444', color: 'white', padding: '10px', borderRadius: '6px', marginBottom: '20px' }}>
          {errorMsg}
        </div>
      )}

      <div style={{ background: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#0f172a', borderBottom: '1px solid #334155' }}>
            <tr>
              <th style={{ padding: '15px' }}>ID</th>
              <th style={{ padding: '15px' }}>Usuario</th>
              <th style={{ padding: '15px' }}>Contraseña (Visible)</th>
              <th style={{ padding: '15px' }}>Rol</th>
              <th style={{ padding: '15px', textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '15px', color: '#94a3b8' }}>#{u.id}</td>
                <td style={{ padding: '15px' }}>
                  <input 
                    type="text" 
                    value={u.username} 
                    onChange={(e) => handleUpdate(u, 'username', e.target.value)}
                    style={{ background: '#0f172a', color: 'white', border: '1px solid #475569', padding: '8px', borderRadius: '4px', width: '100%' }}
                  />
                </td>
                <td style={{ padding: '15px' }}>
                  <input 
                    type="text" 
                    value={u.password} 
                    onChange={(e) => handleUpdate(u, 'password', e.target.value)}
                    style={{ background: '#0f172a', color: '#fbbf24', border: '1px solid #475569', padding: '8px', borderRadius: '4px', width: '100%' }}
                  />
                </td>
                <td style={{ padding: '15px' }}>
                  <select 
                    value={u.role} 
                    onChange={(e) => handleUpdate(u, 'role', e.target.value)}
                    disabled={u.username === 'admin'}
                    style={{ background: '#0f172a', color: 'white', border: '1px solid #475569', padding: '8px', borderRadius: '4px', width: '100%' }}
                  >
                    <option value="player">Jugador</option>
                    <option value="dm">Dungeon Master</option>
                    <option value="admin">Administrador</option>
                  </select>
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  <button 
                    onClick={() => handleDelete(u.id)}
                    disabled={u.username === 'admin'}
                    style={{ background: u.username === 'admin' ? '#475569' : '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: u.username === 'admin' ? 'not-allowed' : 'pointer' }}
                  >
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '20px' }}>
        * Los cambios en nombre de usuario, contraseña o rol se guardan automáticamente al escribirlos.
      </p>
    </div>
  );
};
