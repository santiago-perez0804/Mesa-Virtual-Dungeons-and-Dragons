import { useState, useEffect, useRef } from 'react';
import { Dices } from 'lucide-react';
import { DiceRoller } from './DiceRoller';

export const ChatPanel = ({ socket, currentUser, characters, messages, blockRolls = false }: any) => {
  const [inputValue, setInputValue] = useState('');
  const [sendTo, setSendTo] = useState('all');
  const [showDice, setShowDice] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const text = inputValue.trim();

    // Check for roll command
    const rollMatch = text.match(/^\/r\s+(.+)$/i);
    if (rollMatch) {
      if (blockRolls) {
        alert("No puedes tirar dados fuera de tu turno!");
        return;
      }

      const customFormula = rollMatch[1];
      const formula = customFormula.replace(/\s+/g, '').toLowerCase();
      // Regex for XdY, XdY+Z, XdY-Z
      const match = formula.match(/^(\d+)d(\d+)(?:\+(\d+))?(?:-(\d+))?$/);

      if (!match) {
        alert('Formato inválido. Usá algo como /r 2d6 o /r 1d20+5');
        return;
      }

      const count = parseInt(match[1]);
      const faces = parseInt(match[2]);
      const modifierPlus = match[3] ? parseInt(match[3]) : 0;
      const modifierMinus = match[4] ? parseInt(match[4]) : 0;
      const modifier = modifierPlus - modifierMinus;

      if (count > 50 || faces > 100) {
        alert('Calma con los dados, aventurero.');
        return;
      }

      let total = 0;
      const rolls = [];
      for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * faces) + 1;
        rolls.push(roll);
        total += roll;
      }
      total += modifier;

      const modText = modifier > 0 ? ` + ${modifier}` : (modifier < 0 ? ` - ${Math.abs(modifier)}` : '');
      const details = count > 1 ? ` [${rolls.join(', ')}${modText}]` : (modifier !== 0 ? ` [${rolls[0]}${modText}]` : '');

      const sysMsg = {
        id: Date.now() + Math.random(),
        sender: 'Sistema',
        to: sendTo,
        text: `🎲 ${currentUser?.name || 'Alguien'} tiró ${customFormula}: ${total} ${details}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true
      };

      socket.emit('chat:send', sysMsg);
      setInputValue('');
      return;
    }

    const msg = {
      id: Date.now() + Math.random(),
      sender: currentUser.name,
      to: sendTo,
      text: text,
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
      <div className="font-cinzel" style={{ background: 'rgba(0,0,0,0.3)', padding: '15px 20px', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem', letterSpacing: '1px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ marginTop: '2px' }}>MESA DE TABERNA</span>
        </div>
        <button
          onClick={() => setShowDice(!showDice)}
          style={{
            background: 'none',
            border: 'none',
            color: showDice ? 'var(--accent-gold)' : 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s, opacity 0.2s',
            opacity: showDice ? 1 : 0.6
          }}
          title="Mostrar/Ocultar Dados Rápidos"
        >
          <Dices size={16} />
        </button>
      </div>

      {showDice && (
        <div style={{ padding: '10px', background: '#111', borderBottom: '1px solid #333' }}>
          <DiceRoller socket={socket} user={currentUser} sendTo={sendTo} blockRolls={blockRolls} />
        </div>
      )}

      <div ref={chatContainerRef} style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {messages.map((m: any) => {
          const isSender = (m.sender || m.user) === currentUser.name;
          const isRecipient = m.to === currentUser.name || (m.to === 'Dungeon Master' && currentUser.role === 'dm');
          const isPublic = !m.to || m.to === 'all';

          if (!isPublic && !isSender && !isRecipient) {
            return null; // Ocultar mensaje privado
          }

          if (m.isSystem) {
            const isPrivate = !isPublic;
            return (
              <div key={m.id} style={{ alignSelf: 'center', margin: '5px 0', background: isPrivate ? 'rgba(168, 85, 247, 0.1)' : '#1e293b', border: `1px solid ${isPrivate ? '#a855f7' : '#334155'}`, color: isPrivate ? '#c084fc' : '#cbd5e1', padding: '6px 12px', borderRadius: '12px', fontSize: '0.85rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ opacity: 0.5 }}>{m.timestamp}</span>
                <span>{isPrivate && '🔒 '}{m.text}</span>
              </div>
            );
          }

          const isPrivate = !isPublic;
          let privateLabel = '';
          if (isPrivate) {
            if (m.to === 'Dungeon Master') {
              privateLabel = isSender ? '🔒 [Privado para DM]' : '🔒 [Privado para Ti (DM)]';
            } else {
              privateLabel = isSender ? `🔒 [Privado para ${m.to}]` : '🔒 [Privado para Ti]';
            }
          }

          return (
            <div key={m.id} style={{ marginBottom: '12px', background: isPrivate ? 'rgba(168, 85, 247, 0.1)' : 'rgba(0,0,0,0.2)', padding: '10px 14px', borderLeft: `3px solid ${isPrivate ? '#a855f7' : ((m.sender || m.user) === currentUser.name ? 'var(--accent-gold)' : 'var(--text-secondary)')}`, fontSize: '0.9rem', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span className="font-cinzel" style={{ fontStyle: 'italic', fontWeight: 'bold', color: isPrivate ? '#c084fc' : ((m.sender || m.user) === currentUser.name ? 'var(--accent-gold)' : 'var(--text-parchment)'), fontSize: '0.75rem' }}>
                  {(m.sender || m.user || 'Desconocido')} {privateLabel && <span style={{ fontSize: '0.65rem', marginLeft: '6px', color: '#c084fc', textTransform: 'none' }}>{privateLabel}</span>}
                </span>
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
            placeholder="/r 1d20"
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
