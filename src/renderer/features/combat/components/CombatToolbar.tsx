import React from 'react';
import { Ghost, HeartCrack, Flame, Snowflake, Moon, Shield, Zap, Biohazard, Activity, X, User, Backpack, Dices, StickyNote, Box, Lock, Coins, Swords, ArrowRight } from 'lucide-react';
import { NoteTokenIcon, ImageTokenIcon, ClosedChestIcon, OpenChestIcon, ItemDropIcon, CompassIcon, LineAoeIcon, ConeAoeIcon, CircleAoeIcon, SquareAoeIcon, getAoeIcon } from '../../../shared/components/iconos';

export const CombatToolbar = (props: any) => {
  const {
    socket, userRole, currentUser, boardTokens, characters, monsters, chatMessages, compendium,
    onOpenCharacterSheet, onOpenMonsterSheet,
    bgImage, setBgImage, bgInputUrl, setBgInputUrl, showGridLines, setShowGridLines, gridOpacity,
    saveNotification, setSaveNotification, isSidebarOpen, setIsSidebarOpen, isChatOpen, setIsChatOpen,
    viewingToken, setViewingToken, sidebarTab, prevSidebarTab, isTabTransitioning, switchTab,
    healthModalToken, setHealthModalToken, healthInput, setHealthInput, conditionInput, setConditionInput,
    activeActionMenu, setActiveActionMenu, isRadialOpen, setIsRadialOpen,
    combatState, setCombatState, activeTokenId, setActiveTokenId, currentTurnTokenId, currentToken,
    isMyTurn, blockRolls, allCombatantsRolled,
    isEditingSurface, setIsEditingSurface, solidCells, setSolidCells, isNightMode, setIsNightMode,
    isEditingSurfaceRef, solidCellsRef, isCellVisible, getLineCells,
    zoom, setZoom, pan, setPan, viewportRef, boardRef, ghostRef, snapRef, drag, wasDraggingRef,
    handleViewportMouseDown, handleTokenMouseDown,
    contextMenu, setContextMenu, isCreatingChest, setIsCreatingChest, chestPassword, setChestPassword,
    isSelectingCompendiumItem, setIsSelectingCompendiumItem, itemSearchQuery, setItemSearchQuery,
    selectedChestToken, setSelectedChestToken, passwordPromptChest, setPasswordPromptChest,
    enteredPassword, setEnteredPassword, passwordError, setPasswordError, selectedItemToken, setSelectedItemToken,
    compendiumSlotIndex, setCompendiumSlotIndex, isCreatingNote, setIsCreatingNote, noteText, setNoteText,
    selectedNoteToken, setSelectedNoteToken, isCreatingImage, setIsCreatingImage, imageUrlInput, setImageUrlInput,
    selectedImageToken, setSelectedImageToken, isCreatingAoe, setIsCreatingAoe, aoeForm, setAoeForm,
    selectedAoeToken, setSelectedAoeToken, activeAoeTool, setActiveAoeTool,
    handleBoardContextMenu, handleCreateChestSubmit, handleSpawnItem, handleVerifyPasswordSubmit,
    handleChestSlotClick, handleSelectItemForSlot, handleLootItemClick, handleLootAllCoins, handlePickupFloorItem,
    handleCreateNoteSubmit, handleCreateImageSubmit, handleImageFileChange, handleSpawnAoe,
    CELL_PX, GRID_SIZE, BOARD_PX, renderConditionIcon
  } = props;

  return (
    <>
      {/* TOOLBAR SUPERIOR */}
      <div style={{ padding: '8px 0px', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '15px', alignItems: 'center', zIndex: 100 }}>
        
        {/* COLUMNA 1 — Panel de personajes (izquierda fija, alineada con panel lateral) */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          alignItems: 'center', 
          flexShrink: 0,
          width: isSidebarOpen ? '320px' : '190px',
          paddingLeft: '20px',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxSizing: 'border-box',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}>
          <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.2rem', letterSpacing: '1px' }}>COMBATE</h2>
          
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="torch-glow"
            style={{
              position: 'relative',
              background: isSidebarOpen ? 'rgba(200,135,42,0.15)' : 'rgba(0,0,0,0.5)',
              border: `1.5px solid ${isSidebarOpen ? 'var(--accent-gold)' : 'var(--border-color)'}`,
              color: isSidebarOpen ? 'var(--accent-gold)' : 'var(--text-secondary)',
              width: '40px',
              height: '32px',
              padding: 0,
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: isSidebarOpen ? '0 0 8px rgba(201,168,76,0.4)' : 'none',
              flexShrink: 0
            }}
            title={isSidebarOpen ? "Ocultar panel de combatientes" : "Mostrar panel de combatientes"}
          >
            {isSidebarOpen ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'block' }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
            )}
          </button>
        </div>

        {/* Separador 1 */}
        <div className="divider" style={{ width: '1px', height: '24px', background: 'rgba(201,168,76,0.3)', alignSelf: 'center', flexShrink: 0 }} />

        {/* COLUMNA 2 — Controles principales (centro, flex-grow: 1) */}
        <div style={{ display: 'flex', flexGrow: 1, justifyContent: 'space-between', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingRight: '10px' }}>
          {/* Lado izquierdo de Columna 2 */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {(userRole === 'dm' || userRole === 'admin') && (
              <>
                <input
                  className="mono"
                  style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '6px 10px', fontSize: '0.75rem', width: 'clamp(90px, 12vw, 180px)' }}
                  placeholder="URL del Mapa..."
                  value={bgInputUrl}
                  onChange={(e) => setBgInputUrl(e.target.value)}
                />
                
                {/* APLICAR (Checkmark icon) */}
                <button
                  onClick={() => { if (bgInputUrl) socket.emit('grid:set-bg', bgInputUrl); }}
                  className="torch-glow"
                  style={{ 
                    background: 'var(--accent-gold)', 
                    color: 'white', 
                    border: 'none', 
                    width: '32px', 
                    height: '30px', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: 0 
                  }}
                  title="APLICAR"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>

                {/* LIMPIAR MAPA (Trash icon, neutral color) */}
                <button 
                  onClick={() => { if (confirm("¿Limpiar todo el mapa?")) socket.emit('board:clear'); }} 
                  className="torch-glow" 
                  style={{ 
                    background: 'rgba(255,255,255,0.05)', 
                    color: 'var(--text-secondary)', 
                    border: '1px solid var(--border-color)', 
                    width: '32px', 
                    height: '30px', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: 0 
                  }}
                  title="LIMPIAR MAPA"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>

                {/* EDITAR SUPERFICIE (Pencil icon) */}
                <button 
                  onClick={() => setIsEditingSurface(!isEditingSurface)} 
                  className="torch-glow" 
                  style={{ 
                    background: isEditingSurface ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)', 
                    color: isEditingSurface ? 'var(--bg-base)' : 'var(--text-secondary)', 
                    border: '1px solid var(--border-color)', 
                    width: '32px', 
                    height: '30px', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    padding: 0 
                  }}
                  title={isEditingSurface ? 'Terminar Edición de Superficie' : 'Editar Superficie del Mapa'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Lado derecho de Columna 2 */}
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {/* TURNOS */}
            {(userRole === 'dm' || userRole === 'admin') && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {!combatState.turnModeActive ? (
                  <button
                    onClick={() => {
                      if (allCombatantsRolled) {
                        socket.emit('combat:toggle-turn-mode', true);
                      }
                    }}
                    disabled={!allCombatantsRolled}
                    className="torch-glow"
                    style={{
                      background: 'var(--accent-gold)',
                      color: 'var(--bg-base)',
                      border: 'none',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      cursor: !allCombatantsRolled ? 'not-allowed' : 'pointer',
                      opacity: !allCombatantsRolled ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Modo Turnos"
                  >
                    <Swords className="w-5 h-5" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => socket.emit('combat:toggle-turn-mode', false)}
                      className="font-cinzel torch-glow"
                      style={{
                        background: 'transparent',
                        color: 'var(--accent-gold)',
                        border: '1px solid var(--accent-gold)',
                        padding: '6px 14px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        letterSpacing: '1px'
                      }}
                    >
                      FINALIZAR
                    </button>
                    <button
                      onClick={() => socket.emit('combat:next-turn')}
                      className="torch-glow"
                      style={{ 
                        background: 'transparent', 
                        color: 'var(--natural-green)', 
                        border: '1px solid var(--natural-green)', 
                        padding: '6px 10px', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Siguiente Turno"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Pasar Turno para Jugadores */}
            {(userRole !== 'dm' && userRole !== 'admin') && combatState.turnModeActive && (() => {
              const currentTurnTokenId = combatState.initiativeOrder[combatState.currentTurnIndex]?.tokenId;
              const currentToken = boardTokens.find((t: any) => t.instanceId === currentTurnTokenId);
              const isMyTurn = currentToken && currentToken.owner === currentUser?.name;
              
              return (
                <button
                  onClick={() => {
                    if (isMyTurn) socket.emit('combat:next-turn');
                  }}
                  disabled={!isMyTurn}
                  className="font-cinzel torch-glow"
                  style={{ 
                    background: isMyTurn ? 'var(--natural-green)' : 'rgba(255,255,255,0.1)', 
                    color: isMyTurn ? 'white' : 'var(--text-secondary)', 
                    border: '1px solid ' + (isMyTurn ? 'var(--natural-green)' : 'var(--border-color)'), 
                    padding: '6px 14px', 
                    borderRadius: '4px', 
                    cursor: isMyTurn ? 'pointer' : 'default', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold', 
                    animation: isMyTurn ? 'pulse 2s infinite' : 'none' 
                  }}
                >
                  {isMyTurn ? 'Terminar mi Turno ➡️' : 'Turno de otro ➡️'}
                </button>
              );
            })()}

            {/* DIA / NOCHE */}
            {(userRole === 'dm' || userRole === 'admin') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: isNightMode ? 0.4 : 1, transition: 'opacity 0.3s ease', display: 'block' }}>
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>

                <button
                  onClick={() => socket.emit('grid:set-night', !isNightMode)}
                  style={{
                    position: 'relative', width: '46px', height: '24px', borderRadius: '12px',
                    background: isNightMode ? '#1e293b' : '#f59e0b',
                    border: '1px solid ' + (isNightMode ? '#334155' : '#fbbf24'),
                    cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isNightMode ? 'inset 0 2px 4px rgba(0,0,0,0.6)' : 'inset 0 2px 4px rgba(255,255,255,0.3)',
                    overflow: 'hidden'
                  }}
                  title={isNightMode ? 'Modo Noche activo' : 'Modo Día activo'}
                >
                  <div style={{
                    position: 'absolute', left: isNightMode ? '24px' : '2px', width: '18px', height: '18px',
                    borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    {isNightMode ? '🌙' : '☀️'}
                  </div>
                </button>

                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: isNightMode ? 1 : 0.4, transition: 'opacity 0.3s ease', display: 'block' }}>
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Separador 2 */}
        <div className="divider" style={{ width: '1px', height: '24px', background: 'rgba(201,168,76,0.3)', alignSelf: 'center', flexShrink: 0 }} />

        {/* COLUMNA 3 — Panel de mesa/chat (derecha fija, alineada con panel de chat) */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          alignItems: 'center', 
          justifyContent: 'flex-end',
          flexShrink: 0,
          width: isChatOpen ? '300px' : '130px',
          paddingRight: '20px',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxSizing: 'border-box',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}>
          {/* GRILLA (Grid icon, no text) */}
          <button
            onClick={() => setShowGridLines(!showGridLines)}
            className="torch-glow"
            style={{
              position: 'relative',
              background: 'rgba(0,0,0,0.5)',
              border: `1.5px solid ${showGridLines ? 'var(--accent-gold)' : 'var(--border-color)'}`,
              color: showGridLines ? 'var(--accent-gold)' : 'var(--text-secondary)',
              width: '40px',
              height: '32px',
              padding: 0,
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: showGridLines ? '0 0 8px rgba(201,168,76,0.4)' : 'none',
              flexShrink: 0
            }}
            title={showGridLines ? "Ocultar grilla" : "Mostrar grilla"}
          >
            {showGridLines ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <line x1="15" y1="3" x2="15" y2="21" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="3" y1="15" x2="21" y2="15" />
                </svg>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'block' }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <line x1="15" y1="3" x2="15" y2="21" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="3" y1="15" x2="21" y2="15" />
                  <line x1="3" y1="3" x2="21" y2="21" stroke="var(--text-secondary)" strokeWidth="2" />
                </svg>
              </div>
            )}
          </button>
          
          {/* CHAT TOGGLE */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="torch-glow"
            style={{
              position: 'relative',
              background: 'rgba(0,0,0,0.5)',
              border: `1.5px solid ${isChatOpen ? 'var(--accent-gold)' : 'var(--border-color)'}`,
              color: isChatOpen ? 'var(--accent-gold)' : 'var(--text-secondary)',
              width: '40px',
              height: '32px',
              padding: 0,
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: isChatOpen ? '0 0 8px rgba(201,168,76,0.4)' : 'none',
              flexShrink: 0
            }}
            title={isChatOpen ? "Ocultar chat" : "Mostrar chat"}
          >
            {isChatOpen ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'block' }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <line x1="3" y1="3" x2="21" y2="21" stroke="var(--text-secondary)" strokeWidth="2" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>

    </>
  );
};
