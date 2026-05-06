import { useState, useEffect, useRef } from 'react';

export const ChatPanel = ({ socket, currentUser, characters }: any) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sendTo, setSendTo] = useState('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on('chat:message', (msg: any) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => {
      socket.off('chat:message');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    <div style={{ background: '#1a1a1a', borderRadius: '12px', border: '1px solid #333', display: 'flex', flexDirection: 'column', height: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}>
      <div style={{ background: '#0f172a', padding: '10px 15px', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', borderBottom: '1px solid #333', fontWeight: 'bold', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '8px' }}>
        💬 <span style={{ marginTop: '2px' }}>Mesa de Taberna (Chat)</span>
      </div>

      <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map(m => {
          const isMine = m.sender === currentUser.name;
          const isPrivate = m.to !== 'all';

          // Filtro para mensajes privados (solo sender y recipient los ven)
          if (isPrivate && !isMine && m.to !== currentUser.name) return null;

          return (
            <div key={m.id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', textAlign: isMine ? 'right' : 'left' }}>
                {isMine ? 'Tú' : m.sender} {isPrivate && <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>(Privado a {m.to === 'Dungeon Master' ? 'DM' : m.to})</span>} <span style={{ opacity: 0.5 }}>{m.timestamp}</span>
              </div>
              <div style={{
                background: isPrivate ? '#4c1d95' : (isMine ? '#3b82f6' : '#334155'),
                padding: '10px 14px',
                borderRadius: '8px',
                color: 'white',
                borderBottomRightRadius: isMine ? '2px' : '8px',
                borderBottomLeftRadius: !isMine ? '2px' : '8px',
                fontSize: '0.95rem',
                lineHeight: '1.4',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}>
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '12px', background: '#0f172a', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', borderTop: '1px solid #333', display: 'flex', gap: '10px' }}>
        <select value={sendTo} onChange={(e) => setSendTo(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#1e293b', color: 'white', maxWidth: '110px', outline: 'none' }}>
          <option value="all">A todos</option>
          <optgroup label="Privado">
            {users.filter(u => u !== currentUser.name).map((u: any) => (
              <option key={u} value={u}>{u === 'Dungeon Master' ? 'DM' : u}</option>
            ))}
          </optgroup>
        </select>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Escribe un mensaje..."
          style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #444', background: '#1e293b', color: 'white', outline: 'none' }}
        />
        <button onClick={handleSend} style={{ background: '#a855f7', color: 'white', border: 'none', borderRadius: '6px', padding: '0 15px', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#9333ea'} onMouseLeave={(e) => e.currentTarget.style.background = '#a855f7'}>
          ➤
        </button>
      </div>
    </div>
  );
};
