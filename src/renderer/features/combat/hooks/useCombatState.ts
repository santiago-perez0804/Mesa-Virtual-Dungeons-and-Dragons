import { useState, useMemo, useEffect } from 'react';

export const useCombatState = (socket: any, userRole: string, currentUser: any, boardTokens: any[]) => {
  const [combatState, setCombatState] = useState<{ turnModeActive: boolean, initiativeOrder: {tokenId: string, value: number}[], currentTurnIndex: number }>({
    turnModeActive: false,
    initiativeOrder: [],
    currentTurnIndex: 0
  });

  const [activeTokenId, setActiveTokenId] = useState<string | null>(null);

  const currentTurnTokenId = combatState.initiativeOrder[combatState.currentTurnIndex]?.tokenId;
  const currentToken = boardTokens.find((t: any) => t.instanceId === currentTurnTokenId);
  const isMyTurn = currentToken && currentToken.owner === currentUser?.name;
  const blockRolls = userRole !== 'dm' && userRole !== 'admin' && combatState.turnModeActive && !isMyTurn;

  const allCombatantsRolled = useMemo(() => {
    const combatTokens = boardTokens.filter((t: any) => t.type === 'character' || t.type === 'monster');
    if (combatTokens.length === 0) return false;
    return combatTokens.every((t: any) => combatState.initiativeOrder.some(i => i.tokenId === t.instanceId));
  }, [boardTokens, combatState.initiativeOrder]);

  useEffect(() => {
    socket.on('combat:state-update', (state: any) => setCombatState(state));
    return () => {
      socket.off('combat:state-update');
    };
  }, [socket]);

  return {
    combatState,
    setCombatState,
    activeTokenId,
    setActiveTokenId,
    currentTurnTokenId,
    currentToken,
    isMyTurn,
    blockRolls,
    allCombatantsRolled
  };
};
