import React, { useEffect, useState, useRef } from 'react';
import { ChatPanel } from './ChatPanel';

const CELL_PX = 50;
const GRID_SIZE = 30;
const BOARD_PX = GRID_SIZE * CELL_PX;

export const CombatGrid = ({ socket, userRole, currentUser, boardTokens, characters, monsters }: any) => {
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgInputUrl, setBgInputUrl] = useState('');
  const [zoom, setZoom] = useState(1);
  const [showGridLines, setShowGridLines] = useState(true);
  const [gridOpacity, setGridOpacity] = useState(0.2);
  const [openMenu, setOpenMenu] = useState<'TS' | 'PH' | null>(null);
  const [saveNotification, setSaveNotification] = useState<any>(null);
  const [activeTokenId, setActiveTokenId] = useState<string | null>(null);
  const [openTeamPicker, setOpenTeamPicker] = useState<string | null>(null);

  const TEAM_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#f97316', '#a855f7', '#ec4899', '#06b6d4', '#84cc16', '#78350f', '#64748b', '#ffffff'];

  const [pan, setPan] = useState({ x: 0, y: 0 });

  const viewportRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  // Drag con refs para evitar re-renders en cada mousemove
  const dragRef = useRef<any>(null);          // datos del drag activo
  const ghostRef = useRef<HTMLDivElement>(null); // elemento visual flotante
  const snapRef = useRef<HTMLDivElement>(null);  // indicador de casilla destino
  const panRef = useRef({ x: 0, y: 0 });        // pan sin re-render
  const isPanningRef = useRef(false);
  const startPanPosRef = useRef({ x: 0, y: 0 });
  const [drag, setDrag] = useState<any>(null); // solo para forzar re-render al soltar

  useEffect(() => {
    socket.on('grid:bg-update', (img: string) => setBgImage(img));
    socket.on('combat:save-notification', (data: any) => setSaveNotification(data));
    return () => {
      socket.off('grid:bg-update');
      socket.off('combat:save-notification');
    };
  }, [socket]);

  useEffect(() => {
    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomSpeed = 0.1;
      setZoom(prev => {
        const newZoom = e.deltaY < 0 ? prev + zoomSpeed : prev - zoomSpeed;
        return Math.max(0.3, Math.min(newZoom, 4));
      });
    };
    const viewport = viewportRef.current;
    if (viewport) viewport.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => { if (viewport) viewport.removeEventListener('wheel', handleNativeWheel); };
  }, []);

  const handleViewportMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && !dragRef.current)) {
      isPanningRef.current = true;
      startPanPosRef.current = { x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y };
    }
  };

  // Registrar listeners UNA vez; todo usa refs para no re-registrar
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // PAN
      if (isPanningRef.current && boardRef.current) {
        const nx = e.clientX - startPanPosRef.current.x;
        const ny = e.clientY - startPanPosRef.current.y;
        panRef.current = { x: nx, y: ny };
        if (boardRef.current) {
          boardRef.current.style.left = nx + 'px';
          boardRef.current.style.top = ny + 'px';
        }
      }
      // DRAG de token
      if (dragRef.current && boardRef.current) {
        const d = dragRef.current;
        const bRect = boardRef.current.getBoundingClientRect();
        const zoomNow = d.zoom;
        const localX = (e.clientX - bRect.left) / zoomNow;
        const localY = (e.clientY - bRect.top) / zoomNow;
        // Mover ghost flotante con el cursor (libre, sin snap)
        const freeX = d.tokenStartX + (e.clientX - d.startX) / zoomNow;
        const freeY = d.tokenStartY + (e.clientY - d.startY) / zoomNow;
        if (ghostRef.current) {
          ghostRef.current.style.left = freeX + 'px';
          ghostRef.current.style.top = freeY + 'px';
        }
        // Snap indicator
        let cellX = Math.max(0, Math.min(Math.floor(localX / CELL_PX), GRID_SIZE - 1));
        let cellY = Math.max(0, Math.min(Math.floor(localY / CELL_PX), GRID_SIZE - 1));
        if (snapRef.current) {
          snapRef.current.style.left = (cellX * CELL_PX) + 'px';
          snapRef.current.style.top = (cellY * CELL_PX) + 'px';
          snapRef.current.style.display = 'block';
        }
        dragRef.current.snapX = cellX;
        dragRef.current.snapY = cellY;
      }
    };

    const handleMouseUp = () => {
      isPanningRef.current = false;
      if (dragRef.current) {
        const { tokenId, snapX, snapY } = dragRef.current;
        socket.emit('token:move', { tokenId, x: snapX, y: snapY });
        dragRef.current = null;
        if (ghostRef.current) ghostRef.current.style.display = 'none';
        if (snapRef.current) snapRef.current.style.display = 'none';
        setDrag(null); // fuerza re-render para actualizar posición final
      }
      // Sync pan al state para que React sepa dónde está el board
      setPan({ ...panRef.current });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [socket]); // solo se registra UNA vez

  const handleTokenMouseDown = (e: React.MouseEvent, tokenId: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const token = boardTokens.find((t: any) => t.instanceId === tokenId);
    if (!token) return;
    setActiveTokenId(tokenId);
    if (userRole !== 'dm' && token.type !== 'character') return;
    dragRef.current = {
      tokenId,
      startX: e.clientX,
      startY: e.clientY,
      tokenStartX: token.x * CELL_PX,
      tokenStartY: token.y * CELL_PX,
      snapX: token.x,
      snapY: token.y,
      zoom,
      image: token.image,
      name: token.name,
      type: token.type,
    };
    if (ghostRef.current) {
      ghostRef.current.style.left = (token.x * CELL_PX) + 'px';
      ghostRef.current.style.top = (token.y * CELL_PX) + 'px';
      ghostRef.current.style.display = 'block';
    }
    setDrag(tokenId); // solo para re-render que oculte token original
  };

  const myCharToken = boardTokens.find((t: any) => t.type === 'character' && t.owner === currentUser.name);
  const myTeam = myCharToken?.teamColor || null;

  // Visibilidad en la Grilla (Mapa)
  const canSeeOnGrid = (t: any) => {
    if (userRole === 'dm') return true;
    if (t.owner === currentUser.name) return true;
    if (t.teamColor) return true; // Con color es público en mapa
    return false;
  };

  // Visibilidad en el Panel de Combatientes (Sidebar)
  const canSeeInSidebar = (t: any) => {
    if (userRole === 'dm') return true;
    if (t.owner === currentUser.name) return true;
    return false; // Privado en sidebar
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }} onClick={() => setActiveTokenId(null)}>
      
      {/* HEADER */}
      <div style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderBottom: '1px solid rgba(168,85,247,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, boxShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <h2 style={{ margin: 0, background: 'linear-gradient(135deg, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>⚔️ Grilla de Combate</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#94a3b8', fontSize: '0.8rem' }}>
            <span style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', padding: '3px 10px', borderRadius: '20px', color: '#c4b5fd', fontWeight: '700', fontSize: '0.75rem' }}>{Math.round(zoom * 100)}%</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#64748b' }}>Grilla</span>
              <input type="range" min="0" max="1" step="0.05" value={gridOpacity} onChange={(e) => setGridOpacity(parseFloat(e.target.value))} style={{ width: '70px', accentColor: '#a855f7' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {userRole === 'dm' && (
            <div style={{ display: 'flex', gap: '6px' }}>
              <input placeholder="🗺️ URL del mapa..." value={bgInputUrl} onChange={e => setBgInputUrl(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid rgba(168,85,247,0.3)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.8rem', width: '190px', outline: 'none' }} />
              <button onClick={() => { if (bgInputUrl) { socket.emit('grid:set-bg', bgInputUrl); setBgInputUrl(''); } }}
                style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem', boxShadow: '0 2px 8px rgba(59,130,246,0.4)' }}>Cargar</button>
            </div>
          )}
          <button onClick={() => setShowGridLines(!showGridLines)}
            style={{ background: showGridLines ? 'linear-gradient(135deg,#7c3aed,#6d28d9)' : 'rgba(255,255,255,0.06)', color: 'white', border: '1px solid rgba(168,85,247,0.2)', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
            {showGridLines ? '👁️ Grilla' : '🙈 Grilla'}
          </button>
          <button onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }}
            style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>🎯 Reset</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* PANEL LATERAL */}
        <div style={{ width: '280px', background: 'linear-gradient(180deg, #0d1424 0%, #0f172a 100%)', borderRight: '1px solid rgba(168,85,247,0.15)', overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ textAlign: 'center', marginBottom: '8px', paddingBottom: '12px', borderBottom: '1px solid rgba(168,85,247,0.2)' }}>
            <h4 style={{ margin: 0, color: '#c4b5fd', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>⚔️ Combatientes</h4>
          </div>
          {boardTokens.filter(canSeeInSidebar).map((t: any) => (
            <div key={t.instanceId}
              style={{ background: activeTokenId === t.instanceId ? 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(109,40,217,0.15))' : 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '10px 12px', border: activeTokenId === t.instanceId ? '1px solid rgba(168,85,247,0.5)' : '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', boxShadow: activeTokenId === t.instanceId ? '0 0 15px rgba(168,85,247,0.2)' : 'none' }}
              onClick={(e) => { e.stopPropagation(); setActiveTokenId(t.instanceId); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  onClick={(e) => { if (userRole === 'dm') { e.stopPropagation(); setOpenTeamPicker(openTeamPicker === t.instanceId ? null : t.instanceId); } }}
                  title={userRole === 'dm' ? 'Cambiar equipo' : ''}
                  style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.teamColor || 'transparent', border: t.teamColor ? `2px solid ${t.teamColor}` : '1px dashed #475569', cursor: userRole === 'dm' ? 'pointer' : 'default', boxShadow: t.teamColor ? `0 0 8px ${t.teamColor}88` : 'none', flexShrink: 0 }}
                />
                {openTeamPicker === t.instanceId && (
                  <div style={{ position: 'absolute', top: '40px', left: '10px', background: '#0d1424', border: '1px solid rgba(168,85,247,0.3)', padding: '12px', borderRadius: '12px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', zIndex: 1000, boxShadow: '0 8px 30px rgba(0,0,0,0.7), 0 0 20px rgba(168,85,247,0.15)' }}>
                    {TEAM_COLORS.map(c => <div key={c} onClick={(e) => { e.stopPropagation(); socket.emit('token:update-team', { tokenId: t.instanceId, color: c }); setOpenTeamPicker(null); }} style={{ width: '22px', height: '22px', borderRadius: '50%', background: c, cursor: 'pointer', border: '2px solid rgba(255,255,255,0.1)', transition: 'transform 0.1s', boxShadow: `0 0 6px ${c}88` }} />)}
                    <div onClick={(e) => { e.stopPropagation(); socket.emit('token:update-team', { tokenId: t.instanceId, color: null }); setOpenTeamPicker(null); }} style={{ gridColumn: 'span 4', fontSize: '0.7rem', color: '#64748b', textAlign: 'center', marginTop: '4px', cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '6px' }}>✕ Sin equipo</div>
                  </div>
                )}
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', border: `2px solid ${t.teamColor || 'rgba(255,255,255,0.1)'}`, flexShrink: 0, boxShadow: t.teamColor ? `0 0 10px ${t.teamColor}55` : 'none' }}>
                  {t.image ? <img src={t.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.1rem' }}>{t.type === 'character' ? '👤' : '👾'}</span>}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ color: 'white', fontSize: '0.88rem', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                  <div style={{ fontSize: '0.68rem', color: t.type === 'character' ? '#60a5fa' : '#f87171', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.type === 'character' ? 'Héroe' : 'Criatura'}</div>
                </div>

                {/* Vida: DM ve todo, Jugador solo la suya */}
                {(userRole === 'dm' || t.owner === currentUser.name) && (
                  <div style={{ marginRight: '10px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                    <div style={{ color: '#4ade80', fontSize: '0.85rem', fontWeight: '800' }}>
                      {t.hp} <span style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: '400' }}>/ {t.max_hp}</span>
                    </div>
                    <div style={{ width: '45px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '2px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.3)' }}>
                      <div style={{ 
                        width: `${Math.max(0, Math.min(100, (t.hp / t.max_hp) * 100))}%`, 
                        height: '100%', 
                        background: t.hp / t.max_hp > 0.5 ? '#22c55e' : (t.hp / t.max_hp > 0.2 ? '#eab308' : '#ef4444'),
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                )}

                {userRole === 'dm' && <button onClick={(e) => { e.stopPropagation(); socket.emit('token:remove', t.instanceId); }} style={{ background: 'transparent', border: 'none', color: '#ef444480', cursor: 'pointer', fontSize: '1rem', padding: '2px 4px', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')} onMouseLeave={e => (e.currentTarget.style.color = '#ef444480')}>✕</button>}
              </div>
            </div>
          ))}
          {boardTokens.filter(canSeeInSidebar).length === 0 && <div style={{ textAlign: 'center', color: '#334155', fontSize: '0.8rem', paddingTop: '20px', fontStyle: 'italic' }}>Sin combatientes</div>}
        </div>

        {/* VIEWPORT */}
        <div ref={viewportRef} style={{ position: 'relative', flex: 1, overflow: 'hidden', background: '#080c14' }} onMouseDown={handleViewportMouseDown}>
          <div 
            ref={boardRef} 
            style={{ 
              position: 'absolute', 
              top: pan.y, left: pan.x, 
              width: BOARD_PX, height: BOARD_PX, 
              transform: `scale(${zoom})`, 
              transformOrigin: 'top left', 
              backgroundImage: bgImage ? `url("${bgImage}")` : 'none', 
              backgroundSize: 'cover', 
              backgroundPosition: 'center' 
            }}
          >
            {showGridLines && (
              <div style={{ 
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                backgroundImage: `linear-gradient(rgba(168, 85, 247, ${gridOpacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, ${gridOpacity}) 1px, transparent 1px)`, 
                backgroundSize: `${CELL_PX}px ${CELL_PX}px`,
                pointerEvents: 'none'
              }} />
            )}
            
            {/* SNAP INDICATOR - controlado por ref, sin re-render */}
            <div 
              ref={snapRef}
              style={{
                display: 'none',
                position: 'absolute',
                width: CELL_PX, height: CELL_PX,
                background: 'rgba(124, 58, 237, 0.2)',
                border: '2px dashed #7c3aed',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 99
              }}
            />

            {/* GHOST TOKEN - controlado por ref, sin re-render */}
            <div
              ref={ghostRef}
              style={{
                display: 'none',
                position: 'absolute',
                width: CELL_PX, height: CELL_PX,
                borderRadius: '50%',
                background: '#a855f7',
                border: '3px solid #d946ef',
                opacity: 0.85,
                zIndex: 100,
                pointerEvents: 'none',
                boxShadow: '0 8px 25px rgba(168,85,247,0.5)',
                transform: 'scale(1.1)',
                overflow: 'hidden'
              }}
            />

            {boardTokens.filter(canSeeOnGrid).map((t: any) => {
              const isDragging = drag === t.instanceId;
              const isMyTeam = (userRole === 'dm' || (t.teamColor && t.teamColor === myTeam) || t.owner === currentUser.name);
              // Tokens de otro equipo: visibles pero atenuados, sin HP
              const tokenOpacity = isDragging ? 0 : (isMyTeam ? 1 : 0.45);
              const showHpBar = isMyTeam && !isDragging;

              return (
                <div 
                  key={t.instanceId} 
                  onMouseDown={(e) => handleTokenMouseDown(e, t.instanceId)} 
                  style={{ 
                    position: 'absolute', 
                    left: t.x * CELL_PX, 
                    top: t.y * CELL_PX,
                    width: CELL_PX, height: CELL_PX, 
                    cursor: isDragging ? 'grabbing' : 'grab', 
                    zIndex: isDragging ? 1 : 10,
                    opacity: tokenOpacity,
                    transition: isDragging ? 'none' : 'left 0.15s ease, top 0.15s ease',
                    filter: isMyTeam ? 'none' : 'grayscale(60%)'
                  }}
                >
                  <div style={{ 
                    width: '100%', height: '100%', borderRadius: '50%', 
                    background: t.type === 'character' ? '#3b82f6' : '#ef4444', 
                    border: activeTokenId === t.instanceId ? '4px solid #fbbf24' : '2px solid white', 
                    overflow: 'hidden', 
                    boxShadow: t.teamColor ? `0 0 15px ${t.teamColor}` : '0 4px 10px rgba(0,0,0,0.5)', 
                    transform: activeTokenId === t.instanceId ? 'scale(1.05)' : 'scale(0.9)', 
                    transition: 'transform 0.1s' 
                  }}>
                    {t.image ? <img src={t.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontWeight: 'bold' }}>{t.name[0]}</span>}
                  </div>
                  {showHpBar && (
                    <div style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', width: '85%', height: '5px', background: '#000', borderRadius: '3px', border: '1px solid #333', overflow: 'hidden' }}>
                      <div style={{ width: `${(t.hp / t.max_hp) * 100}%`, height: '100%', background: t.hp > 0 ? (t.hp / t.max_hp > 0.5 ? '#22c55e' : '#eab308') : '#6b7280', transition: 'width 0.3s' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <ChatPanel socket={socket} currentUser={currentUser} characters={characters} />
      </div>

      {/* NOTIFICACIÓN DE TS */}
      {saveNotification && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'linear-gradient(135deg, rgba(69,10,10,0.97), rgba(120,10,10,0.95))', backdropFilter: 'blur(20px)', border: '1px solid rgba(239,68,68,0.5)', borderRadius: '24px', padding: '48px', textAlign: 'center', zIndex: 10000, boxShadow: '0 0 80px rgba(239, 68, 68, 0.4), inset 0 0 60px rgba(239,68,68,0.05)', animation: 'tsEntry 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>⚠️</div>
          <h2 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '8px', fontWeight: '900', letterSpacing: '-1px' }}>¡TIRADA DE SALVACIÓN!</h2>
          <p style={{ color: '#fca5a5', fontSize: '1.1rem', marginBottom: '4px' }}>El DM ha solicitado:</p>
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '12px 32px', marginBottom: '28px', display: 'inline-block' }}>
            <span style={{ color: '#fbbf24', fontSize: '1.8rem', fontWeight: '900', letterSpacing: '2px' }}>{saveNotification.stat.toUpperCase()}</span>
          </div>
          {(currentUser.name === saveNotification.targetName || userRole === 'dm') && (
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
                socket.emit('chat:send', { user: currentUser.name, text: `🎲 **${saveNotification.targetName}** lanzó **${saveNotification.stat}**: d20(${roll}) + ${mod} = **${total}**. ${pass ? '✅ **SUPERADO**' : '❌ **FALLADO**'} (CD Secreta)`, timestamp: Date.now() });
                setSaveNotification(null);
              }}
              style={{ display: 'block', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', border: 'none', padding: '16px 48px', borderRadius: '14px', fontSize: '1.2rem', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 20px rgba(34,197,94,0.4)', letterSpacing: '0.5px', margin: '0 auto' }}
            >
              🎲 LANZAR DADO
            </button>
          )}
        </div>
      )}

      {/* BOTONES DE ACCIÓN */}
      {(() => {
        const selectedToken = boardTokens.find((t: any) => t.instanceId === activeTokenId);
        const myToken = boardTokens.find((t: any) => t.type === 'character' && t.owner === currentUser.name);
        const activeToken = (userRole === 'dm' && selectedToken) ? selectedToken : myToken;
        if (!activeToken) return null;

        const isChar = activeToken.type === 'character';
        const source = isChar ? characters : monsters;
        let item = source.find((i: any) => i.id === activeToken.originalId || i.name === activeToken.name) || (isChar ? monsters : characters).find((i: any) => i.id === activeToken.originalId || i.name === activeToken.name);
        if (!item) return null;

        let charStats: any = {};
        if (isChar) charStats = typeof item.stats === 'string' ? JSON.parse(item.stats) : item.stats;
        else {
          const mData = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
          charStats = { fue: mData.strength || 10, dex: mData.dexterity || 10, con: mData.constitution || 10, int: mData.intelligence || 10, sab: mData.wisdom || 10, car: mData.charisma || 10 };
        }

        const handleRoll = (statKey: string, label: string) => {
          const isPlayer = activeToken.type === 'character' || activeToken.owner;
          if (userRole === 'dm' && isPlayer) {
            const dcStr = prompt(`CD para la Tirada de Salvación de ${activeToken.name}:`, "10");
            if (dcStr) socket.emit('combat:request-save', { targetName: activeToken.name, stat: label, statKey, dc: parseInt(dcStr) || 10 });
          } else {
            const mod = Math.floor(((charStats[statKey] || 10) - 10) / 2);
            const roll = Math.floor(Math.random() * 20) + 1;
            socket.emit('dice:roll', { die: 20 });
            socket.emit('chat:send', { user: currentUser.name, text: `🎲 **${activeToken.name}** tiró **${label}**: d20(${roll}) + ${mod} = **${roll + mod}**`, timestamp: Date.now() });
          }
          setOpenMenu(null);
        };

        const SAVES = [{ n: 'FUE', k: 'fue' }, { n: 'DES', k: 'dex' }, { n: 'CON', k: 'con' }, { n: 'INT', k: 'int' }, { n: 'SAB', k: 'sab' }, { n: 'CAR', k: 'car' }];
        const isDMRequest = userRole === 'dm' && (activeToken.type === 'character' || activeToken.owner);
        const calcMod = (key: string) => Math.floor(((charStats[key] || 10) - 10) / 2);

        return (
          <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '10px', zIndex: 100, alignItems: 'flex-end' }}>
            {openMenu === 'TS' && (
              <div style={{ position: 'absolute', bottom: '64px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(13,20,36,0.97)', backdropFilter: 'blur(20px)', padding: '14px', borderRadius: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '280px', boxShadow: '0 -8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.15)' }}>
                <div style={{ gridColumn: 'span 3', textAlign: 'center', color: '#94a3b8', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>{isDMRequest ? 'SOLICITAR SALVACIÓN' : 'TIRADA DE SALVACIÓN'}</div>
                {SAVES.map(s => {
                  const mod = calcMod(s.k);
                  return (
                    <button key={s.k} onClick={() => handleRoll(s.k, s.n)}
                      style={{ background: 'rgba(168,85,247,0.1)', color: 'white', border: '1px solid rgba(168,85,247,0.2)', padding: '10px 6px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '700', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.3)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.6)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(168,85,247,0.1)'; e.currentTarget.style.borderColor = 'rgba(168,85,247,0.2)'; }}
                    >
                      <span style={{ color: '#c4b5fd' }}>{s.n}</span>
                      <span style={{ color: mod >= 0 ? '#4ade80' : '#f87171', fontSize: '0.9rem' }}>{mod >= 0 ? `+${mod}` : mod}</span>
                    </button>
                  );
                })}
              </div>
            )}
            <button
              onClick={() => setOpenMenu(openMenu === 'TS' ? null : 'TS')}
              style={{ padding: '12px 22px', background: openMenu === 'TS' ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'linear-gradient(135deg, #f59e0b, #d97706)', color: openMenu === 'TS' ? '#1c1917' : 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245,158,11,0.35)', fontSize: '0.9rem', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}
            >
              🎲 {isDMRequest ? 'Solicitar TS' : 'Salvación'}
            </button>
          </div>
        );
      })()}

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 30px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes tsEntry {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
};