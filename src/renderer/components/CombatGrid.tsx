import React, { useEffect, useState, useRef } from 'react';

// Constantes de la grilla
const CELL_PX = 50;
const GRID_SIZE = 30; // 30x30 = 1500px tablero
const BOARD_PX = GRID_SIZE * CELL_PX;

export const CombatGrid = ({ socket, userRole }: any) => {
  const [boardTokens, setBoardTokens] = useState<any[]>([]);
  const [bgImage, setBgImage] = useState<string | null>(null);

  // PAN (cámara)
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPos, setStartPanPos] = useState({ x: 0, y: 0 });

  // DRAG de tokens
  const [drag, setDrag] = useState<{
    tokenId: string;
    startX: number;
    startY: number;
    snapX: number;
    snapY: number;
  } | null>(null);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on('token:board-list', (tokens: any[]) => {
      setBoardTokens(tokens);
    });

    socket.on('grid:bg-update', (img: string) => {
      setBgImage(img);
    });

    return () => {
      socket.off('token:board-list');
      socket.off('grid:bg-update');
    };
  }, [socket]);

  // --- LÓGICA DE PANEO DE CÁMARA ---
  const handleViewportMouseDown = (e: React.MouseEvent) => {
    // Solo permitimos paneo si no estamos arrastrando un token
    if (drag) return;
    setIsPanning(true);
    setStartPanPos({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPanPos.x,
        y: e.clientY - startPanPos.y
      });
    }

    if (drag && boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;
      setMousePos({ x: e.clientX, y: e.clientY });

      // Calcular celda destino
      let cellX = Math.floor(localX / CELL_PX);
      let cellY = Math.floor(localY / CELL_PX);
      cellX = Math.max(0, Math.min(cellX, GRID_SIZE - 1));
      cellY = Math.max(0, Math.min(cellY, GRID_SIZE - 1));

      setDrag((prev) => prev ? { ...prev, snapX: cellX, snapY: cellY } : null);
    }
  };

  const handleGlobalMouseUp = () => {
    if (isPanning) setIsPanning(false);

    if (drag) {
      socket.emit('token:move', {
        tokenId: drag.tokenId,
        x: drag.snapX,
        y: drag.snapY
      });
      setDrag(null);
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isPanning, startPanPos, drag]);

  // --- LÓGICA DE ARRASTRE DE TOKENS ---
  const handleTokenMouseDown = (e: React.MouseEvent, tokenId: string) => {
    e.stopPropagation(); // Evita que el viewport empiece a panear
    const token = boardTokens.find(t => t.instanceId === tokenId);
    if (!token) return;

    // TODO: Comprobación de propiedad para jugadores (isOwner)
    if (userRole !== 'dm' && token.type !== 'character') return;

    setDrag({
      tokenId,
      startX: e.clientX,
      startY: e.clientY,
      snapX: token.x,
      snapY: token.y
    });
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const isDragging = (id: string) => drag?.tokenId === id;

  // Calculamos la posición visual fluida del token arrastrado (en coords absolutas de ventana)
  let visualStyle: React.CSSProperties | null = null;
  if (drag && boardRef.current) {
    const offsetX = mousePos.x - drag.startX;
    const offsetY = mousePos.y - drag.startY;
    const token = boardTokens.find(t => t.instanceId === drag.tokenId);
    if (token) {
      const startLeft = token.x * CELL_PX;
      const startTop = token.y * CELL_PX;
      // Posición relativa al tablero, más el paneo, más la pantalla
      const boardRect = boardRef.current.getBoundingClientRect();
      visualStyle = {
        position: 'fixed',
        left: boardRect.left + startLeft + offsetX,
        top: boardRect.top + startTop + offsetY,
        zIndex: 9999,
        pointerEvents: 'none'
      };
    }
  }

  const handleSetBg = () => {
    const url = prompt("URL de la imagen del mapa:");
    if (url) socket.emit('grid:set-bg', url);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '500px', display: 'flex', flexDirection: 'column' }}>

      {/* HEADER DE LA GRILLA */}
      <div style={{ padding: '10px 20px', background: '#0f172a', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <h3 style={{ margin: 0, color: '#a855f7' }}>🗺️ Grilla de Combate</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          {userRole === 'dm' && (
            <button onClick={handleSetBg} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              🖼️ Cambiar Mapa
            </button>
          )}
          <button onClick={() => setPan({ x: 0, y: 0 })} style={{ background: '#334155', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
            🎯 Centrar
          </button>
        </div>
      </div>

      {/* VIEWPORT (Ventana de la cámara) */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          overflow: 'hidden',
          background: '#0a0f1a', // Color súper oscuro exterior
          boxShadow: 'inset 0 0 20px rgba(0,0,0,1)'
        }}
        onMouseDown={handleViewportMouseDown}
      >
        {/* EL TABLERO (Se mueve según el paneo) */}
        <div
          ref={boardRef}
          style={{
            position: 'absolute',
            top: pan.y, left: pan.x,
            width: `${BOARD_PX}px`, height: `${BOARD_PX}px`,
            backgroundImage: bgImage ? `url(${bgImage})` : 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            cursor: isPanning ? 'grabbing' : 'grab',
            transition: 'background-image 0.5s ease',
            boxShadow: 'inset 0 0 150px rgba(0,0,0,0.9)'
          }}
        >
          {/* CUADRÍCULA DIBUJADA CON CSS */}
          <div
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              backgroundImage: `linear-gradient(rgba(168, 85, 247, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.15) 1px, transparent 1px)`,
              backgroundSize: `${CELL_PX}px ${CELL_PX}px`,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 0 1px rgba(168, 85, 247, 0.3))'
            }}
          />

          {/* Celda de Snap (Feedback visual) */}
          {drag && (
            <div style={{
              position: 'absolute', pointerEvents: 'none',
              left: drag.snapX * CELL_PX, top: drag.snapY * CELL_PX,
              width: CELL_PX, height: CELL_PX,
              backgroundColor: 'rgba(168, 85, 247, 0.3)',
              border: '2px dashed #a855f7',
              boxSizing: 'border-box',
              borderRadius: '4px'
            }} />
          )}

          {/* TOKENS */}
          {boardTokens.map((t) => {
            const dragging = isDragging(t.instanceId);
            const isDM = userRole === 'dm';

            // Renderizado del contenido del token (reutilizable)
            const tokenContent = (
              <div style={{
                width: `${CELL_PX}px`, height: `${CELL_PX}px`,
                backgroundColor: t.type === 'character' ? '#3b82f6' : '#ef4444',
                border: t.type === 'character' ? '2px solid #60a5fa' : '2px solid #f87171',
                borderRadius: '50%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontWeight: 'bold', fontSize: '12px',
                cursor: 'inherit',
                userSelect: 'none',
                boxShadow: dragging ? '0 10px 25px rgba(0,0,0,0.8)' : '0 4px 10px rgba(0,0,0,0.6)',
                transform: dragging ? 'scale(1)' : 'scale(0.85)',
                transition: 'transform 0.1s, box-shadow 0.1s'
              }}>
                <span>{t.name.substring(0, 2).toUpperCase()}</span>
                <div style={{ width: '80%', height: '4px', background: '#333', borderRadius: '2px', marginTop: '2px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: t.type === 'character' ? '#22c55e' : '#ef4444' }} />
                </div>
              </div>
            );

            return (
              <React.Fragment key={t.instanceId}>
                {/* Token en el tablero (se opaca si lo estamos moviendo) */}
                <div
                  style={{
                    position: 'absolute',
                    left: t.x * CELL_PX, top: t.y * CELL_PX,
                    width: CELL_PX, height: CELL_PX,
                    opacity: dragging ? 0.3 : 1,
                    cursor: isDM || t.type === 'character' ? 'grab' : 'default',
                    zIndex: dragging ? 1 : 10
                  }}
                  onMouseDown={(e) => handleTokenMouseDown(e, t.instanceId)}
                >
                  {tokenContent}

                  {/* Botón borrar (Solo DM y no mientras se arrastra) */}
                  {isDM && !dragging && (
                    <div
                      onMouseDown={(e) => { e.stopPropagation(); socket.emit('token:remove', t.instanceId); }}
                      style={{
                        position: 'absolute', top: -2, right: -2,
                        background: '#111', borderRadius: '50%',
                        width: '18px', height: '18px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1px solid #ff4444', cursor: 'pointer',
                        fontSize: '12px', color: '#ff4444', zIndex: 12
                      }}
                    >×</div>
                  )}
                </div>

                {/* Token flotante siguiendo al mouse (renderizado sobre toda la UI) */}
                {dragging && visualStyle && (
                  <div style={{ ...visualStyle, width: CELL_PX, height: CELL_PX }}>
                    {tokenContent}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

    </div>
  );
};