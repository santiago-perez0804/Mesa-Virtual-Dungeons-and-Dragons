interface NotificacionSalvacionProps {
  saveNotification: any;
  currentUser: any;
  userRole: string;
  characters: any[];
  socket: any;
  onClose: () => void;
}

/** Banner modal que solicita una tirada de salvación pedida por el DM. */
export function NotificacionSalvacion({ saveNotification, currentUser, userRole, characters, socket, onClose }: NotificacionSalvacionProps) {
  if (!saveNotification) return null;

  return (
    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--bg-base)', border: '2px solid var(--combat-red)', padding: '40px', borderRadius: '4px', textAlign: 'center', zIndex: 10000, boxShadow: '0 0 50px rgba(0,0,0,0.8)' }}>
      <h2 className="font-cinzel" style={{ color: 'var(--combat-red)', fontSize: '2rem' }}>¡TIRADA DE SALVACIÓN!</h2>
      <p style={{ color: 'var(--text-parchment)' }}>El DM solicita una tirada de {saveNotification.stat.toUpperCase()}</p>
      {((currentUser && currentUser.name === saveNotification.targetName) || userRole === 'dm') && (
        <button
          onClick={() => {
            const myChar = characters.find((c: any) => c.name === saveNotification.targetName);
            if (!myChar) return;
            const stats = typeof myChar.stats === 'string' ? JSON.parse(myChar.stats) : myChar.stats;
            const mod = Math.floor(((stats[saveNotification.statKey] || 10) - 10) / 2);
            const roll = Math.floor(Math.random() * 20) + 1;
            const total = roll + mod;
            const pass = total >= saveNotification.dc;
            socket.emit('dice:roll', { die: 20 });
            socket.emit('chat:send', { user: currentUser?.name, text: `🎲 **${saveNotification.targetName}** lanzó **${saveNotification.stat}**: d20(${roll}) + ${mod} = **${total}**. ${pass ? '✅ **SUPERADO**' : '❌ **FALLADO**'}`, timestamp: Date.now() });
            onClose();
          }}
          className="font-cinzel"
          style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 20px', marginTop: '20px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          LANZAR DADO
        </button>
      )}
    </div>
  );
}
