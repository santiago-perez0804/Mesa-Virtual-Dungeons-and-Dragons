import { useState, useRef, useEffect, useCallback } from 'react';

export const useFogOfWar = (socket: any, GRID_SIZE: number) => {
  const [isEditingSurface, setIsEditingSurface] = useState(false);
  const [solidCells, setSolidCells] = useState<Set<string>>(new Set());
  const [isNightMode, setIsNightMode] = useState(false);

  const isEditingSurfaceRef = useRef(isEditingSurface);
  const solidCellsRef = useRef(solidCells);

  useEffect(() => { isEditingSurfaceRef.current = isEditingSurface; }, [isEditingSurface]);
  useEffect(() => { solidCellsRef.current = solidCells; }, [solidCells]);

  useEffect(() => {
    socket.on('grid:solid-update', (cells: string[]) => setSolidCells(new Set(cells)));
    socket.on('grid:night-update', (isNight: boolean) => setIsNightMode(isNight));
    return () => {
      socket.off('grid:solid-update');
      socket.off('grid:night-update');
    };
  }, [socket]);

  // Bresenham's line algorithm for FOW raycasting
  const getLineCells = (x0: number, y0: number, x1: number, y1: number) => {
    const cells: [number, number][] = [];
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = (x0 < x1) ? 1 : -1;
    let sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
      cells.push([x0, y0]);
      if (x0 === x1 && y0 === y1) break;
      let e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
    return cells;
  };

  const isCellVisible = useCallback((tx: number, ty: number, myTokens: any[]) => {
    if (isEditingSurface) return true; // El DM ve todo en modo edición
    if (!isNightMode) return true; // De día se ve todo (o podemos dejar el cálculo si hay paredes siempre)
    if (solidCells.has(`${tx},${ty}`)) return true;

    for (const token of myTokens) {
      const cx = Math.floor(token.x);
      const cy = Math.floor(token.y);

      // Distancia máxima de visión 12 casillas (60 pies)
      const dist = Math.max(Math.abs(tx - cx), Math.abs(ty - cy));
      if (dist > 12) continue;

      const line = getLineCells(cx, cy, tx, ty);
      let blocked = false;
      for (let i = 0; i < line.length - 1; i++) { // -1 para permitir ver la pared misma
        const [lx, ly] = line[i];
        if (lx === cx && ly === cy) continue;
        if (solidCells.has(`${lx},${ly}`)) {
          blocked = true;
          break;
        }
      }
      if (!blocked) return true;
    }
    return false;
  }, [isEditingSurface, isNightMode, solidCells]);

  return {
    isEditingSurface,
    setIsEditingSurface,
    solidCells,
    setSolidCells,
    isNightMode,
    setIsNightMode,
    isEditingSurfaceRef,
    solidCellsRef,
    isCellVisible,
    getLineCells
  };
};
