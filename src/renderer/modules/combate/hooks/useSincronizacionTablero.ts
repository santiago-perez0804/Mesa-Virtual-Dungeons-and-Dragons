import { useEffect } from 'react';

interface ParamsSync {
  socket: any;
  setBgImage: (v: string) => void;
  setSaveNotification: (v: any) => void;
  setSolidCells: (v: Set<string>) => void;
  setIsNightMode: (v: boolean) => void;
  setCombatState: (v: any) => void;
}

/** Suscribe el tablero a las actualizaciones del servidor (fondo, niebla, noche, combate). */
export function useSincronizacionTablero({ socket, setBgImage, setSaveNotification, setSolidCells, setIsNightMode, setCombatState }: ParamsSync) {
  useEffect(() => {
    socket.on('grid:bg-update', (img: string) => setBgImage(img));
    socket.on('combat:save-notification', (data: any) => setSaveNotification(data));
    socket.on('grid:solid-update', (cells: string[]) => setSolidCells(new Set(cells)));
    socket.on('grid:night-update', (isNight: boolean) => setIsNightMode(isNight));
    socket.on('combat:state-update', (state: any) => setCombatState(state));
    return () => {
      socket.off('grid:bg-update');
      socket.off('combat:save-notification');
      socket.off('grid:solid-update');
      socket.off('grid:night-update');
      socket.off('combat:state-update');
    };
  }, [socket]);
}
