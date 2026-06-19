/** Estado volátil del tablero, por sala de campaña (en memoria). */
export interface RoomBoardState {
  boardTokens: any[];
  currentGridBg: string;
  solidCells: string[];
  isNightMode: boolean;
  combatState: {
    turnModeActive: boolean;
    initiativeOrder: { tokenId: string; value: number }[];
    currentTurnIndex: number;
  };
}

const roomBoards: Record<number, RoomBoardState> = {};

export function getRoomBoardState(campaignId: number): RoomBoardState {
  if (!roomBoards[campaignId]) {
    roomBoards[campaignId] = {
      boardTokens: [],
      currentGridBg: '',
      solidCells: [],
      isNightMode: false,
      combatState: {
        turnModeActive: false,
        initiativeOrder: [],
        currentTurnIndex: 0
      }
    };
  }
  return roomBoards[campaignId];
}
