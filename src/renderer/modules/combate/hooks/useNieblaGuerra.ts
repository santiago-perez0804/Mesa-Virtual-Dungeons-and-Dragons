import { useEffect, useMemo, useRef } from 'react';
import { CELL_PX, GRID_SIZE, BOARD_PX } from '../grilla.constantes';
import { getLineCells } from '../lineaVision';

interface ParamsNiebla {
  boardTokens: any[];
  solidCells: Set<string>;
  myTeam: string | null;
  currentUser: any;
  userRole: string;
  isNightMode: boolean;
}

/**
 * Niebla de guerra: calcula las celdas visibles (line-of-sight con bloqueo por paredes)
 * y dibuja la máscara sobre un canvas. Devuelve las celdas visibles y la ref del canvas.
 */
export function useNieblaGuerra({ boardTokens, solidCells, myTeam, currentUser, userRole, isNightMode }: ParamsNiebla) {
  const fowCanvasRef = useRef<HTMLCanvasElement>(null);

  const visibleCells = useMemo(() => {
    const vis = new Set<string>();
    const RADIUS = isNightMode ? 6 : 12; // 30ft de noche, 60ft de día

    const myTokens = boardTokens.filter((t: any) => t.type === 'character' && (t.teamColor === myTeam || t.owner === currentUser?.name));
    const sourceTokens = (userRole === 'dm' || userRole === 'admin')
      ? boardTokens.filter((t: any) => t.type === 'character' || t.type === 'monster')
      : myTokens;

    sourceTokens.forEach((t: any) => {
      const tx = Math.floor(t.x);
      const ty = Math.floor(t.y);
      vis.add(`${tx},${ty}`);

      for (let x = tx - RADIUS; x <= tx + RADIUS; x++) {
        for (let y = ty - RADIUS; y <= ty + RADIUS; y++) {
          if (x === tx - RADIUS || x === tx + RADIUS || y === ty - RADIUS || y === ty + RADIUS) {
            const line = getLineCells(tx, ty, x, y);
            for (const [cx, cy] of line) {
              if (Math.hypot(cx - tx, cy - ty) > RADIUS) break;
              vis.add(`${cx},${cy}`);
              if (solidCells.has(`${cx},${cy}`)) break; // bloqueado por pared
            }
          }
        }
      }
    });
    return vis;
  }, [boardTokens, solidCells, myTeam, currentUser, userRole, isNightMode]);

  useEffect(() => {
    const canvas = fowCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Clasificar celdas visibles: interiores (100%) y de borde (75%)
    const cellVisMap = new Map<string, number>();
    visibleCells.forEach(cellKey => {
      const [cx, cy] = cellKey.split(',').map(Number);
      let isBoundary = false;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx === 0 && dy === 0) continue;
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
            if (!visibleCells.has(`${nx},${ny}`)) {
              isBoundary = true;
              break;
            }
          }
        }
        if (isBoundary) break;
      }
      cellVisMap.set(cellKey, isBoundary ? 0.75 : 1.0);
    });

    // 2. Máscara fuera de pantalla
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = BOARD_PX;
    tempCanvas.height = BOARD_PX;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.fillStyle = '#000000';
      tempCtx.fillRect(0, 0, BOARD_PX, BOARD_PX);
      tempCtx.globalCompositeOperation = 'destination-out';

      tempCtx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      cellVisMap.forEach((vis, cellKey) => {
        if (vis === 0.75) {
          const [cx, cy] = cellKey.split(',').map(Number);
          tempCtx.fillRect(cx * CELL_PX, cy * CELL_PX, CELL_PX, CELL_PX);
        }
      });

      tempCtx.fillStyle = 'rgba(255, 255, 255, 1.0)';
      cellVisMap.forEach((vis, cellKey) => {
        if (vis === 1.0) {
          const [cx, cy] = cellKey.split(',').map(Number);
          tempCtx.fillRect(cx * CELL_PX, cy * CELL_PX, CELL_PX, CELL_PX);
        }
      });
    }

    // 3. Limpiar canvas principal y dibujar la máscara con desenfoque
    ctx.clearRect(0, 0, BOARD_PX, BOARD_PX);
    ctx.filter = 'blur(10px)';
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.filter = 'none';
  }, [visibleCells]);

  return { visibleCells, fowCanvasRef };
}
