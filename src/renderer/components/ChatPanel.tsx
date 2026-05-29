import { useState, useEffect, useRef } from 'react';
import { DiceRoller } from './DiceRoller';

export const ChatPanel = ({ socket, currentUser, characters, messages }: any) => {
  const [inputValue, setInputValue] = useState('');
  const [sendTo, setSendTo] = useState('all');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const msg = {
      id: Date.now() + Math.random(),
      sender: currentUser.name,
      to: sendTo,
      text: inputValue.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    socket.emit('chat:send', msg);
    setInputValue('');
  };

  // Construir lista de usuarios (Dueños de personajes y el DM)
  const users = Array.from(new Set(characters.map((c: any) => c.owner)));
  if (!users.includes('Dungeon Master')) users.push('Dungeon Master');

  return (
    <div style={{ background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', flex: 1, boxShadow: 'none', overflow: 'hidden', borderLeft: '1px solid var(--border-color)' }}>
      <div className="font-cinzel" style={{ background: 'rgba(0,0,0,0.3)', padding: '15px 20px', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', letterSpacing: '1px' }}>
        📜 <span style={{ marginTop: '2px' }}>MESA DE TABERNA</span>
      </div>

      <div style={{ padding: '10px', background: '#111', borderBottom: '1px solid #333' }}>
        <DiceRoller socket={socket} user={currentUser} />
      </div>

      <div ref={chatContainerRef} style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map((m: any) => {
          if (m.isSystem) {
            return (
              <div key={m.id} style={{ alignSelf: 'center', margin: '5px 0', background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', padding: '6px 12px', borderRadius: '12px', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ opacity: 0.5 }}>{m.timestamp}</span>
                <span>{m.text}</span>
              </div>
            );
          }

          // const isMine = m.sender === currentUser.name;
          // const isPrivate = m.to !== 'all';

          // Filtro para mensajes privados (solo sender y recipient los ven)
          return (
            <div key={m.id} style={{ marginBottom: '12px', background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderLeft: `3px solid ${(m.sender || m.user) === currentUser.name ? 'var(--accent-gold)' : 'var(--text-secondary)'}`, fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="font-cinzel" style={{ fontWeight: 'bold', color: (m.sender || m.user) === currentUser.name ? 'var(--accent-gold)' : 'var(--text-parchment)', fontSize: '0.75rem' }}>{(m.sender || m.user || 'Desconocido').toUpperCase()}</span>
                <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{m.timestamp}</span>
              </div>
              <div style={{ color: 'var(--text-parchment)', lineHeight: '1.4' }}>{m.text}</div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '15px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <select value={sendTo} onChange={(e) => setSendTo(e.target.value)} style={{ padding: '5px', fontSize: '0.7rem', background: 'var(--bg-base)', color: 'var(--text-parchment)', border: '1px solid var(--border-color)' }}>
            <option value="all">Todos</option>
            {users.filter(u => u !== currentUser.name).map((u: any) => (
              <option key={u} value={u}>{u === 'Dungeon Master' ? 'DM' : u}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            className="mono"
            style={{ flex: 1, padding: '10px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none', fontSize: '0.85rem' }}
            placeholder="Enviar mensaje..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} className="torch-glow" style={{ background: 'var(--accent-gold)', color: 'white', border: 'none', padding: '0 15px', cursor: 'pointer', fontWeight: 'bold' }}>➤</button>
        </div>
      </div>
    </div>
  );
};
