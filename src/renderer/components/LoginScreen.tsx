import React from 'react';

interface LoginProps {
  onLogin: (name: string, role: 'dm' | 'player') => void;
}

const LoginScreen: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="login-container">
      <h2>Bienvenido a "Decide and Die"</h2>
      <p>Selecciona tu perfil para entrar a la sesión:</p>

      <div className="button-group">
        <button className="dm-btn" onClick={() => onLogin('Admin', 'dm')}>
          Soy el DM (Administrador)
        </button>

        <hr />

        <button onClick={() => onLogin('Kiara', 'player')}>Entrar como Kiara</button>
        <button onClick={() => onLogin('Pedro', 'player')}>Entrar como Pedro</button>
      </div>
    </div>
  );
};

export default LoginScreen;