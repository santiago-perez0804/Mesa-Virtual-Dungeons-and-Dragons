import { useState, useEffect, useRef, useCallback } from 'react';

const GRID_SIZE = 20;
const BOARD_PX = 800;
const CELL_PX = BOARD_PX / GRID_SIZE; // 40px exactos por celda

interface Token {
  instanceId: string;
  name: string;
  type: 'character' | 'monster' | string;
  x: number;
  y: number;
}

interface DragState {
  tokenId: string;
  startMouseX: number;
  startMouseY: number;
  currentX: number; // posición visual del token mientras se arrastra (px)
  currentY: number;
  snapX: number;   // celda destino calculada
  snapY: number;
}

export const CombatGrid = ({ socket, userRole }: any) => {
  const [boardTokens, setBoardTokens] = useState<Token[]>([]);
  const [gridOpacity, setGridOpacity] = useState(0.2);
  const [bgImage, setBgImage] = useState('');
  const [drag, setDrag] = useState<DragState | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on('token:board-list', (list: Token[]) => setBoardTokens(list));
    socket.on('grid:bg-update', (url: string) => setBgImage(url));
    return () => {
      socket.off('token:board-list');
      socket.off('grid:bg-update');
    };
  }, [socket]);

  // Calcula la celda (0-19) a partir de coordenadas px relativas al board
  const pxToCell = (px: number): number =>
    Math.max(0, Math.min(GRID_SIZE - 1, Math.floor(px / CELL_PX)));

  // Convierte posición del mouse en celda destino, usando el rect del board
  const getSnapCell = useCallback(
    (mouseX: number, mouseY: number): { snapX: number; snapY: number } | null => {
      const board = boardRef.current;
      if (!board) return null;
      const rect = board.getBoundingClientRect();
      const relX = mouseX - rect.left;
      const relY = mouseY - rect.top;
      if (relX < 0 || relY < 0 || relX > BOARD_PX || relY > BOARD_PX) return null;
      return { snapX: pxToCell(relX), snapY: pxToCell(relY) };
    },
    []
  );

  const handleTokenMouseDown = useCallback(
    (e: React.MouseEvent, tokenId: string) => {
      e.preventDefault();
      const snap = getSnapCell(e.clientX, e.clientY);
      if (!snap) return;
      setDrag({
        tokenId,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        currentX: e.clientX,
        currentY: e.clientY,
        snapX: snap.snapX,
        snapY: snap.snapY,
      });
    },
    [getSnapCell]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!drag) return;
      const snap = getSnapCell(e.clientX, e.clientY);
      setDrag((prev) =>
        prev
          ? {
              ...prev,
              currentX: e.clientX,
              currentY: e.clientY,
              ...(snap ? { snapX: snap.snapX, snapY: snap.snapY } : {}),
            }
          : null
      );
    },
    [drag, getSnapCell]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!drag) return;
      const snap = getSnapCell(e.clientX, e.clientY);
      if (snap) {
        socket.emit('token:move', {
          tokenId: drag.tokenId,
          x: snap.snapX,
          y: snap.snapY,
        });
      }
      setDrag(null);
    },
    [drag, getSnapCell, socket]
  );

  useEffect(() => {
    if (drag) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [drag, handleMouseMove, handleMouseUp]);

  // Posición visual del token mientras se arrastra (sigue al cursor libremente)
  const getDragVisualStyle = (tokenId: string) => {
    if (!drag || drag.tokenId !== tokenId) return null;
    const board = boardRef.current;
    if (!board) return null;
    const rect = board.getBoundingClientRect();
    // Centramos el token en el cursor
    const left = drag.currentX - rect.left - CELL_PX * 0.5;
    const top = drag.currentY - rect.top - CELL_PX * 0.5;
    return { left, top, position: 'absolute' as const, zIndex: 100, opacity: 0.9 };
  };

  const isDragging = (tokenId: string) => drag?.tokenId === tokenId;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', userSelect: 'none' }}>

      {/* PANEL SUPERIOR */}
      <div style={{
        background: '#1a1a1a', padding: '15px', borderRadius: '12px', border: '1px solid #333',
        width: '100%', maxWidth: `${BOARD_PX}px`, display: 'flex', gap: '20px', alignItems: 'flex-end',
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
      }}>
        {userRole === 'dm' && (
          <div style={{ flex: 2 }}>
            <label style={{ fontSize: '0.7rem', color: '#a855f7', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              🗺️ URL DEL MAPA (DM)
            </label>
            <input
              style={{ background: '#0f172a', color: 'white', border: '1px solid #444', padding: '10px', width: '100%', borderRadius: '6px', boxSizing: 'border-box' }}
              placeholder="Pega el link de la imagen aquí..."
              onBlur={(e) => {
                setBgImage(e.target.value);
                socket.emit('grid:set-bg', e.target.value);
              }}
            />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.7rem', color: '#a855f7', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
            👁️ VISIBILIDAD GRILLA: {Math.round(gridOpacity * 100)}%
          </label>
          <input
            type="range" min="0" max="0.6" step="0.01"
            value={gridOpacity}
            onChange={(e) => setGridOpacity(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#a855f7', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* TABLERO */}
      <div
        ref={boardRef}
        style={{
          position: 'relative',
          width: `${BOARD_PX}px`,
          height: `${BOARD_PX}px`,
          backgroundImage: bgImage ? `url(${bgImage})` : 'none',
          backgroundColor: '#0f172a',
          backgroundSize: '100% 100%',
          border: '4px solid #333',
          boxShadow: '0 0 50px rgba(0,0,0,0.9)',
          overflow: 'hidden',
          // cursor durante drag
          cursor: drag ? 'grabbing' : 'default',
        }}
      >
        {/* GRILLA SVG (más precisa que divs) */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          viewBox={`0 0 ${BOARD_PX} ${BOARD_PX}`}
        >
          {Array.from({ length: GRID_SIZE + 1 }, (_, i) => (
            <g key={i}>
              <line
                x1={i * CELL_PX} y1={0} x2={i * CELL_PX} y2={BOARD_PX}
                stroke={`rgba(255,255,255,${gridOpacity})`} strokeWidth="1"
              />
              <line
                x1={0} y1={i * CELL_PX} x2={BOARD_PX} y2={i * CELL_PX}
                stroke={`rgba(255,255,255,${gridOpacity})`} strokeWidth="1"
              />
            </g>
          ))}
          {/* Celda de snap resaltada */}
          {drag && (
            <rect
              x={drag.snapX * CELL_PX + 1}
              y={drag.snapY * CELL_PX + 1}
              width={CELL_PX - 2}
              height={CELL_PX - 2}
              fill="rgba(168, 85, 247, 0.3)"
              rx="3"
            />
          )}
        </svg>

        {/* TOKENS */}
        {boardTokens.map((t) => {
          const visualStyle = getDragVisualStyle(t.instanceId);
          const dragging = isDragging(t.instanceId);
          const isChar = t.type === 'character';

          // Posición base en la grilla (cuando no se arrastra)
          const gridStyle: React.CSSProperties = dragging
            ? {
                // Mientras arrastramos: dejamos un "fantasma" en la casilla original
                position: 'absolute',
                left: t.x * CELL_PX + CELL_PX * 0.075,
                top: t.y * CELL_PX + CELL_PX * 0.075,
                width: CELL_PX * 0.85,
                height: CELL_PX * 0.85,
                opacity: 0.25,
              }
            : {
                position: 'absolute',
                left: t.x * CELL_PX + CELL_PX * 0.075,
                top: t.y * CELL_PX + CELL_PX * 0.075,
                width: CELL_PX * 0.85,
                height: CELL_PX * 0.85,
              };

          const sharedTokenStyle: React.CSSProperties = {
            borderRadius: isChar ? '50%' : '8px',
            background: isChar ? '#a855f7' : '#ef4444',
            border: '2px solid white',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: dragging ? 'grabbing' : 'grab',
            boxShadow: `0 0 15px ${isChar ? 'rgba(168,85,247,0.8)' : 'rgba(239,68,68,0.8)'}`,
            transition: dragging ? 'none' : 'left 0.15s ease, top 0.15s ease, box-shadow 0.2s ease',
          };

          return (
            <div key={t.instanceId}>
              {/* Fantasma / token en grid */}
              <div style={{ ...gridStyle, ...sharedTokenStyle }}>
                <span style={{ pointerEvents: 'none', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  {t.name.substring(0, 2).toUpperCase()}
                </span>
                {userRole === 'dm' && (
                  <div
                    onClick={() => socket.emit('token:remove', t.instanceId)}
                    style={{
                      position: 'absolute', top: -10, right: -10,
                      background: '#111', borderRadius: '50%',
                      width: '20px', height: '20px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid #ff4444', cursor: 'pointer',
                      fontSize: '12px', zIndex: 11, color: '#ff4444',
                    }}
                  >
                    ×
                  </div>
                )}
              </div>

              {/* Token que sigue al cursor (solo durante drag) */}
              {dragging && visualStyle && (
                <div
                  style={{
                    ...visualStyle,
                    width: CELL_PX * 0.85,
                    height: CELL_PX * 0.85,
                    ...sharedTokenStyle,
                    boxShadow: `0 0 25px ${isChar ? 'rgba(168,85,247,1)' : 'rgba(239,68,68,1)'}`,
                    pointerEvents: 'none',
                  }}
                >
                  <span style={{ pointerEvents: 'none', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {t.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Hitbox invisible encima del token (para capturar mousedown limpio) */}
              {!dragging && (
                <div
                  onMouseDown={(e) => handleTokenMouseDown(e, t.instanceId)}
                  style={{
                    position: 'absolute',
                    left: t.x * CELL_PX,
                    top: t.y * CELL_PX,
                    width: CELL_PX,
                    height: CELL_PX,
                    zIndex: 20,
                    cursor: 'grab',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};