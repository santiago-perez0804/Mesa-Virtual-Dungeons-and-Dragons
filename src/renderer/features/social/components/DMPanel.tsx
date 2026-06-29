import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, User, ChevronLeft, Loader } from 'lucide-react';

interface DMPanelProps {
  socket: any;
  currentUserId: number;
  currentUserName: string;
  onClose: () => void;
  onSelectUser: (userId: number) => void;
  initialUserId?: number | null;
}

export function DMPanel({ socket, currentUserId, currentUserName, onClose, onSelectUser, initialUserId }: DMPanelProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<number | null>(initialUserId || null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setError(null);
    socket.emit('dm:conversations');
    const convHandler = (data: any[]) => { setConversations(data); setLoading(false); };
    const errorHandler = (msg: string) => { setError(msg); setLoading(false); };
    socket.on('dm:conversations', convHandler);
    socket.on('dm:error', errorHandler);
    return () => {
      socket.off('dm:conversations', convHandler);
      socket.off('dm:error', errorHandler);
    };
  }, []);

  useEffect(() => {
    if (activeConv !== null) {
      socket.emit('dm:conversation', { otherUserId: activeConv });
      socket.emit('dm:mark_read', { otherUserId: activeConv });
      const msgHandler = (data: any) => {
        if (data.otherUserId === activeConv) {
          setMessages(data.messages);
        }
      };
      socket.on('dm:conversation', msgHandler);
      socket.on('dm:sent', (msg: any) => {
        if ((msg.sender_id === currentUserId && msg.recipient_id === activeConv) || (msg.sender_id === activeConv && msg.recipient_id === currentUserId)) {
          setMessages(prev => [...prev, msg]);
        }
      });
      return () => {
        socket.off('dm:conversation', msgHandler);
        socket.off('dm:sent');
      };
    } else {
      socket.emit('dm:conversations');
    }
  }, [activeConv]);

  useEffect(() => {
    const newMsgHandler = (msg: any) => {
      if (activeConv === null || msg.sender_id !== activeConv) {
        socket.emit('dm:conversations');
      }
    };
    socket.on('dm:new_message', newMsgHandler);
    return () => { socket.off('dm:new_message', newMsgHandler); };
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeConv !== null) inputRef.current?.focus();
  }, [activeConv]);

  const handleSend = () => {
    if (!input.trim() || activeConv === null) return;
    socket.emit('dm:send', { recipientId: activeConv, content: input.trim() });
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const otherUser = activeConv !== null ? conversations.find(c => c.other_user_id === activeConv) : null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.5)' }}>
      <div style={{ width: '380px', maxWidth: '90vw', height: '100%', background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-gold-subtle)', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,0.6)', animation: 'slideInRight 0.2s ease-out' }}>
        <style>{`
          @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        `}</style>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          {activeConv !== null ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => setActiveConv(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}><ChevronLeft size={18} /></button>
              <div>
                <div className="font-cinzel" style={{ fontSize: '0.9rem', color: 'var(--text-parchment)', fontWeight: 600 }}>{otherUser?.display_name || otherUser?.username || 'Cargando...'}</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageCircle size={18} style={{ color: 'var(--accent-gold)' }} />
              <h3 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '0.9rem', letterSpacing: '1px' }}>MENSAJES</h3>
            </div>
          )}
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
        </div>

        {activeConv === null ? (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {error ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--combat-red)', fontSize: '0.85rem' }}>
                <X size={32} style={{ margin: '0 auto 12px', opacity: 0.6 }} />
                {error}
              </div>
            ) : loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}><Loader size={20} style={{ color: 'var(--accent-gold)', animation: 'spin 0.8s linear infinite' }} /></div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <MessageCircle size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                No tienes conversaciones. Busca jugadores para enviarles un mensaje.
              </div>
            ) : (
              conversations.map((conv: any) => (
                <div
                  key={conv.other_user_id}
                  onClick={() => setActiveConv(conv.other_user_id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', cursor: 'pointer', transition: 'background 0.15s', borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-base)', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {conv.profile_image ? <img src={conv.profile_image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={18} style={{ color: 'var(--text-secondary)' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="font-cinzel" style={{ fontSize: '0.85rem', color: 'var(--text-parchment)', fontWeight: 600 }}>{conv.display_name || conv.username}</span>
                      {conv.unread > 0 && (
                        <span style={{ background: 'var(--combat-red)', color: '#fff', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>{conv.unread}</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.last_message || 'Sin mensajes aún'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {messages.map((m: any) => (
                <div key={m.id} style={{ display: 'flex', justifyContent: m.sender_id === currentUserId ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%',
                    padding: '8px 14px',
                    borderRadius: m.sender_id === currentUserId ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: m.sender_id === currentUserId ? 'var(--accent-gold)' : 'var(--bg-raised)',
                    color: m.sender_id === currentUserId ? '#000' : 'var(--text-parchment)',
                    fontSize: '0.85rem',
                    wordBreak: 'break-word'
                  }}>
                    {m.content}
                    <div style={{ fontSize: '0.65rem', marginTop: '4px', opacity: 0.6, textAlign: 'right' }}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                style={{ flex: 1, padding: '10px 14px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: '20px', color: 'var(--text-parchment)', outline: 'none', fontSize: '0.85rem' }}
              />
              <button onClick={handleSend} disabled={!input.trim()} style={{ background: 'var(--accent-gold)', border: 'none', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'default', opacity: input.trim() ? 1 : 0.4 }}>
                <Send size={16} style={{ color: '#000' }} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
