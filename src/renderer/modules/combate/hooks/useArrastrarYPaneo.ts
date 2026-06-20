import React, { useEffect, useRef } from 'react';
import { CELL_PX, GRID_SIZE } from '../grilla.constantes';

interface ParamsArrastre {
  socket: any;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  isEditingSurface: boolean;
  solidCells: Set<string>;
  setSolidCells: React.Dispatch<React.SetStateAction<Set<string>>>;
  userRole: string;
  currentUser: any;
  boardTokens: any[];
  setActiveTokenId: (id: string | null) => void;
  setDrag: (value: any) => void;
  setPan: (value: { x: number; y: number }) => void;
}

/**
 * Interacción del tablero con el ratón: arrastre de tokens (ghost + snap vía refs/DOM),
 * paneo, pintado/borrado de muros y zoom con la rueda. Toda la lógica de alta frecuencia
 * usa refs para no re-renderizar. Devuelve las refs que usa el JSX y los handlers de mousedown.
 */
export function useArrastrarYPaneo({
  socket, zoom, setZoom, isEditingSurface, solidCells, setSolidCells,
  userRole, currentUser, boardTokens, setActiveTokenId, setDrag, setPan,
}: ParamsArrastre) {
  const isEditingSurfaceRef = useRef(isEditingSurface);
  const solidCellsRef = useRef(solidCells);
  const isPaintingWallRef = useRef(false);
  const paintModeRef = useRef<'add' | 'remove'>('add');
  const zoomRef = useRef(zoom);

  useEffect(() => { isEditingSurfaceRef.current = isEditingSurface; }, [isEditingSurface]);
  useEffect(() => { solidCellsRef.current = solidCells; }, [solidCells]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const dragRef = useRef<any>(null);
  const wasDraggingRef = useRef(false);
  const ghostRef = useRef<HTMLDivElement>(null);
  const snapRef = useRef<HTMLDivElement>(null);
  const panRef = useRef({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const startPanPosRef = useRef({ x: 0, y: 0 });

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
  }, [setZoom]);

  const handleViewportMouseDown = (e: React.MouseEvent) => {
    if (isEditingSurfaceRef.current && e.button === 0) {
      const bRect = boardRef.current?.getBoundingClientRect();
      if (!bRect) return;
      const localX = (e.clientX - bRect.left) / zoom;
      const localY = (e.clientY - bRect.top) / zoom;
      const cellX = Math.floor(localX / CELL_PX);
      const cellY = Math.floor(localY / CELL_PX);
      if (cellX >= 0 && cellX < GRID_SIZE && cellY >= 0 && cellY < GRID_SIZE) {
        const cellKey = `${cellX},${cellY}`;
        const newSet = new Set(solidCellsRef.current);
        if (newSet.has(cellKey)) {
          paintModeRef.current = 'remove';
          newSet.delete(cellKey);
        } else {
          paintModeRef.current = 'add';
          newSet.add(cellKey);
        }
        isPaintingWallRef.current = true;
        setSolidCells(newSet);
        socket.emit('grid:update-solid', Array.from(newSet));
      }
      return;
    }

    if (e.button === 1 || (e.button === 0 && !dragRef.current)) {
      isPanningRef.current = true;
      startPanPosRef.current = { x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y };
    }
  };

  // Listeners globales registrados UNA vez; todo usa refs para no re-registrar.
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isPaintingWallRef.current && isEditingSurfaceRef.current && boardRef.current) {
        const bRect = boardRef.current.getBoundingClientRect();
        const localX = (e.clientX - bRect.left) / zoomRef.current;
        const localY = (e.clientY - bRect.top) / zoomRef.current;
        const cellX = Math.floor(localX / CELL_PX);
        const cellY = Math.floor(localY / CELL_PX);
        if (cellX >= 0 && cellX < GRID_SIZE && cellY >= 0 && cellY < GRID_SIZE) {
          const cellKey = `${cellX},${cellY}`;
          const currentSet = solidCellsRef.current;

          if (paintModeRef.current === 'add' && !currentSet.has(cellKey)) {
            const newSet = new Set(currentSet);
            newSet.add(cellKey);
            socket.emit('grid:update-solid', Array.from(newSet));
          } else if (paintModeRef.current === 'remove' && currentSet.has(cellKey)) {
            const newSet = new Set(currentSet);
            newSet.delete(cellKey);
            socket.emit('grid:update-solid', Array.from(newSet));
          }
        }
        return;
      }
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
        const freeX = d.tokenStartX + (e.clientX - d.startX) / zoomNow;
        const freeY = d.tokenStartY + (e.clientY - d.startY) / zoomNow;

        d.hasMoved = true;

        if (ghostRef.current) {
          ghostRef.current.style.left = freeX + 'px';
          ghostRef.current.style.top = freeY + 'px';
        }
        let cellX = Math.max(0, Math.min(Math.floor(localX / CELL_PX), GRID_SIZE - 1));
        let cellY = Math.max(0, Math.min(Math.floor(localY / CELL_PX), GRID_SIZE - 1));

        if (d.type === 'aoe') {
          cellX = freeX / CELL_PX;
          cellY = freeY / CELL_PX;

          if (ghostRef.current) ghostRef.current.style.display = 'none';

          const el = document.getElementById(`token-${d.tokenId}`);
          if (el) {
            const dx = (e.clientX - d.startX) / zoomNow;
            const dy = (e.clientY - d.startY) / zoomNow;
            el.style.left = (d.initialLeft + dx) + 'px';
            el.style.top = (d.initialTop + dy) + 'px';
          }
        }

        if (snapRef.current) {
          snapRef.current.style.left = (cellX * CELL_PX) + 'px';
          snapRef.current.style.top = (cellY * CELL_PX) + 'px';
          if (d.type === 'aoe') {
            snapRef.current.style.display = 'none';
          } else {
            snapRef.current.style.display = 'block';
          }
        }
        dragRef.current.snapX = cellX;
        dragRef.current.snapY = cellY;
      }
    };

    const handleMouseUp = () => {
      if (isPaintingWallRef.current) {
        isPaintingWallRef.current = false;
      }
      isPanningRef.current = false;
      if (dragRef.current) {
        if (dragRef.current.hasMoved) {
          wasDraggingRef.current = true;
          setTimeout(() => { wasDraggingRef.current = false; }, 50);
        }
        const { tokenId, snapX, snapY } = dragRef.current;
        socket.emit('token:move', { tokenId, x: snapX, y: snapY });
        dragRef.current = null;
        if (ghostRef.current) ghostRef.current.style.display = 'none';
        if (snapRef.current) snapRef.current.style.display = 'none';
        setDrag(null);
      }
      setPan({ ...panRef.current });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [socket, setDrag, setPan]);

  const handleTokenMouseDown = (e: React.MouseEvent, tokenId: string) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const token = boardTokens.find((t: any) => t.instanceId === tokenId);
    if (!token) return;
    setActiveTokenId(tokenId);
    if (userRole !== 'dm' && (token.type !== 'character' || token.owner !== currentUser?.name)) return;

    const el = document.getElementById(`token-${tokenId}`);
    const initialLeft = el ? parseFloat(el.style.left || '0') : token.x * CELL_PX;
    const initialTop = el ? parseFloat(el.style.top || '0') : token.y * CELL_PX;

    dragRef.current = {
      tokenId,
      startX: e.clientX,
      startY: e.clientY,
      tokenStartX: token.x * CELL_PX,
      tokenStartY: token.y * CELL_PX,
      initialLeft,
      initialTop,
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
    setDrag(tokenId);
  };

  return {
    viewportRef, boardRef, ghostRef, snapRef, wasDraggingRef, panRef,
    handleViewportMouseDown, handleTokenMouseDown,
  };
}
