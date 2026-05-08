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
  const [viewingToken, setViewingToken] = useState<any>(null);

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-base)', position: 'relative' }} onClick={() => setActiveTokenId(null)}>

      {/* TOOLBAR SUPERIOR */}
      <div style={{ padding: '12px 20px', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.2rem', letterSpacing: '1px' }}>⚔️ COMBATE</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Zoom:</span>
            <input type="range" min="0.2" max="2" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} style={{ width: '80px', accentColor: 'var(--accent-gold)' }} />
          </div>
          {(userRole === 'dm' || userRole === 'admin') && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="mono"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '6px 12px', fontSize: '0.75rem', width: '200px' }}
                placeholder="URL del Mapa..."
                value={bgInputUrl}
                onChange={(e) => setBgInputUrl(e.target.value)}
              />
              <button
                onClick={() => { if (bgInputUrl) socket.emit('grid:set-bg', bgInputUrl); }}
                className="torch-glow"
                style={{ background: 'var(--accent-gold)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}
              >
                APLICAR
              </button>
              <button onClick={() => socket.emit('board:clear')} className="torch-glow" style={{ background: 'var(--combat-red)', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>Limpiar Mapa</button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowGridLines(!showGridLines)} className="font-cinzel"
            style={{ background: showGridLines ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
            {showGridLines ? '👁️ Grilla' : '🙈 Grilla'}
          </button>
          <button onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }} className="font-cinzel"
            style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>🎯 Reset</button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* COLUMNA IZQ: COMBATIENTES */}
        <div style={{ width: '320px', background: 'rgba(0,0,0,0.2)', borderRight: '1px solid var(--border-color)', overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ textAlign: 'center', marginBottom: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <h4 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1rem', letterSpacing: '2px' }}>⚔️ COMBATIENTES</h4>
          </div>
          {boardTokens.filter(canSeeInSidebar).map((t: any) => (
            <div key={t.instanceId}
              className={`clipped-frame torch-glow ${activeTokenId === t.instanceId ? 'active' : ''}`}
              style={{ padding: '12px', border: activeTokenId === t.instanceId ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.2s', background: activeTokenId === t.instanceId ? 'rgba(200, 135, 42, 0.1)' : 'var(--bg-surface)' }}
              onClick={(e) => { e.stopPropagation(); setActiveTokenId(t.instanceId); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative', width: '42px', height: '42px', border: `2px solid ${t.teamColor || 'var(--border-color)'}`, overflow: 'hidden', flexShrink: 0 }}>
                  {t.image ? <img src={t.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.2rem' }}>{t.type === 'character' ? '👤' : '👾'}</span>}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div className="font-cinzel" style={{ color: 'white', fontSize: '0.95rem', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onClick={(e) => { e.stopPropagation(); setViewingToken(t); }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: t.type === 'character' ? 'var(--accent-gold)' : 'var(--combat-red)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{t.type === 'character' ? 'Héroe' : 'Criatura'}</div>
                </div>

                {(userRole === 'dm' || t.owner === currentUser.name) && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div className="mono" style={{ color: 'var(--natural-green)', fontSize: '0.9rem', fontWeight: 'bold' }}>{t.hp} <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>/ {t.max_hp}</span></div>
                    <div style={{ width: '40px', height: '3px', background: 'rgba(0,0,0,0.4)', marginTop: '4px' }}>
                      <div style={{ width: `${Math.min(100, (t.hp / t.max_hp) * 100)}%`, height: '100%', background: t.hp / t.max_hp > 0.5 ? 'var(--natural-green)' : 'var(--combat-red)' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {boardTokens.filter(canSeeInSidebar).length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '20px' }}>Sin combatientes</div>}
        </div>

        {/* COLUMNA CENTRAL: MAPA */}
        <div ref={viewportRef} style={{ position: 'relative', flex: 1, overflow: 'hidden', background: '#000' }} onMouseDown={handleViewportMouseDown}>
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
                backgroundImage: `linear-gradient(rgba(200, 135, 42, ${gridOpacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(200, 135, 42, ${gridOpacity}) 1px, transparent 1px)`,
                backgroundSize: `${CELL_PX}px ${CELL_PX}px`,
                pointerEvents: 'none'
              }} />
            )}

            <div ref={snapRef} style={{ display: 'none', position: 'absolute', width: CELL_PX, height: CELL_PX, background: 'rgba(200, 135, 42, 0.1)', border: '2px dashed var(--accent-gold)', borderRadius: '50%', pointerEvents: 'none', zIndex: 99 }} />

            <div ref={ghostRef} style={{ display: 'none', position: 'absolute', width: CELL_PX, height: CELL_PX, borderRadius: '50%', background: 'var(--accent-gold)', border: '3px solid white', opacity: 0.85, zIndex: 100, pointerEvents: 'none', boxShadow: '0 8px 25px rgba(0,0,0,0.5)', transform: 'scale(1.1)', overflow: 'hidden' }} />

            {boardTokens.filter(canSeeOnGrid).map((t: any) => {
              const isDragging = drag === t.instanceId;
              const isMyTeam = (userRole === 'dm' || (t.teamColor && t.teamColor === myTeam) || t.owner === currentUser.name);
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
                  }}
                >
                  <div style={{
                    width: '100%', height: '100%', borderRadius: '50%',
                    background: t.type === 'character' ? 'var(--accent-gold)' : 'var(--combat-red)',
                    border: activeTokenId === t.instanceId ? '4px solid white' : '2px solid rgba(255,255,255,0.3)',
                    overflow: 'hidden',
                    boxShadow: t.teamColor ? `0 0 15px ${t.teamColor}` : '0 4px 10px rgba(0,0,0,0.5)',
                    transform: activeTokenId === t.instanceId ? 'scale(1.1)' : 'scale(0.9)',
                    transition: 'transform 0.1s'
                  }}>
                    {t.image ? <img src={t.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontWeight: 'bold' }}>{t.name[0]}</span>}
                  </div>
                  {showHpBar && (
                    <div style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', width: '85%', height: '5px', background: '#000', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                      <div style={{ width: `${(t.hp / t.max_hp) * 100}%`, height: '100%', background: t.hp > 0 ? (t.hp / t.max_hp > 0.5 ? 'var(--natural-green)' : 'var(--combat-red)') : '#6b7280', transition: 'width 0.3s' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMNA DER: CHAT Y DADOS */}
        <div style={{ width: '300px', display: 'flex', borderLeft: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
          <ChatPanel socket={socket} currentUser={currentUser} characters={characters} />
        </div>
      </div>

      {saveNotification && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--bg-base)', border: '2px solid var(--combat-red)', padding: '40px', borderRadius: '4px', textAlign: 'center', zIndex: 10000, boxShadow: '0 0 50px rgba(0,0,0,0.8)' }}>
          <h2 className="font-cinzel" style={{ color: 'var(--combat-red)', fontSize: '2rem' }}>¡TIRADA DE SALVACIÓN!</h2>
          <p style={{ color: 'var(--text-parchment)' }}>El DM solicita una tirada de {saveNotification.stat.toUpperCase()}</p>
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
                socket.emit('chat:send', { user: currentUser.name, text: `🎲 **${saveNotification.targetName}** lanzó **${saveNotification.stat}**: d20(${roll}) + ${mod} = **${total}**. ${pass ? '✅ **SUPERADO**' : '❌ **FALLADO**'}`, timestamp: Date.now() });
                setSaveNotification(null);
              }}
              className="font-cinzel"
              style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 20px', marginTop: '20px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              LANZAR DADO
            </button>
          )}
        </div>
      )}

      {/* MODAL DETALLE DE COMBATIENTE */}
      {viewingToken && (() => {
        const item = boardTokens.find(t => t.instanceId === viewingToken.instanceId) || viewingToken;
        const isChar = item.type === 'character';
        let inventory: any = null;
        let stats: any = {};
        let description: any = "";
        let classes = "";
        let race = "";
        let type = "";

        const safeParse = (val: any) => {
          if (typeof val !== 'string') return val;
          try {
            const p = JSON.parse(val);
            if (typeof p === 'string') return safeParse(p);
            return p;
          } catch { return val; }
        };

        if (isChar) {
          const charSource = characters.find((c: any) => c.id === item.originalId);
          stats = safeParse(charSource?.stats || {});
          description = charSource?.description || "Sin descripción.";
          race = charSource?.race || "Humano";
          inventory = safeParse(charSource?.inventory) || null;
          try {
            const parsedCls = safeParse(charSource?.class);
            classes = Object.entries(parsedCls).map(([c, l]) => `${c} ${l}`).join(' / ');
          } catch {
            classes = charSource?.class || "Guerrero";
          }
        } else {
          const mSource = monsters.find((m: any) => m.id === item.originalId);
          const mData = safeParse(mSource?.data || {});
          stats = { fue: mData.strength || 10, dex: mData.dexterity || 10, con: mData.constitution || 10, int: mData.intelligence || 10, sab: mData.wisdom || 10, car: mData.charisma || 10 };
          description = mData.description || mData.desc || "Sin descripción.";
          type = mData.type || "Monstruo";
        }

        const statMod = (v: number) => {
          const mod = Math.floor((v - 10) / 2);
          return (mod >= 0 ? '+' : '') + mod;
        };

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }} onClick={() => setViewingToken(null)}>
            <div className="clipped-frame" style={{ width: '100%', maxWidth: '900px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
              {/* MODAL HEADER */}
              <div style={{ padding: '25px 30px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '20px', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ width: '80px', height: '80px', border: '2px solid var(--accent-gold)', overflow: 'hidden', flexShrink: 0 }}>
                  {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '2.5rem' }}>{isChar ? '👤' : '👾'}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 className="font-cinzel" style={{ margin: 0, fontSize: '2rem', color: 'var(--accent-gold)' }}>{item.name}</h2>
                  <p className="font-cinzel" style={{ margin: '4px 0 0 0', color: 'var(--text-parchment)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {isChar ? `${race} • ${classes}` : type}
                  </p>
                </div>
              </div>

              {/* MODAL BODY */}
              <div style={{ padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>

                {/* Atributos */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '15px' }}>
                  {Object.entries(stats).map(([key, val]: [string, any]) => (
                    <div key={key} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', padding: '12px', textAlign: 'center' }}>
                      <div className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 'bold', textTransform: 'uppercase' }}>{key}</div>
                      <div className="mono" style={{ fontSize: '1.4rem', color: 'white', fontWeight: 'bold' }}>{val}</div>
                      <div className="mono" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{statMod(val)}</div>
                    </div>
                  ))}
                </div>

                {/* Descripción */}
                <div>
                  <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>📜 DESCRIPCIÓN</h4>
                  <div style={{ color: 'var(--text-parchment)', lineHeight: '1.6', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
                    {Array.isArray(description) ? description.join('\n') : description}
                  </div>
                </div>

                {/* Inventario (solo héroes) */}
                {isChar && inventory && (
                  <div>
                    <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>⚔️ INVENTARIO</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      {Object.entries(inventory).map(([cat, items]: [string, any]) => (
                        items && items.length > 0 && (
                          <div key={cat} style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', border: '1px solid var(--border-color)' }}>
                            <h5 className="font-cinzel" style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{cat}</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {items.map((it: any, idx: number) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                                  <span style={{ fontSize: '0.9rem', color: 'white' }}>{it.name}</span>
                                  {it.damage && <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--combat-red)' }}>{it.damage}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
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