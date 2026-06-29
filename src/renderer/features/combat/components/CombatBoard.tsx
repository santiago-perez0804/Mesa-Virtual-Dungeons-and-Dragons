import React from 'react';
import { Ghost, HeartCrack, Flame, Snowflake, Moon, Shield, Zap, Biohazard, Activity, X, User, Backpack, Dices, StickyNote, Box, Lock, Coins, Swords, ArrowRight } from 'lucide-react';
import { NoteTokenIcon, ImageTokenIcon, ClosedChestIcon, OpenChestIcon, ItemDropIcon, CompassIcon, LineAoeIcon, ConeAoeIcon, CircleAoeIcon, SquareAoeIcon, getAoeIcon } from '../../../shared/components/iconos';
import { ChatPanel } from '../../../components/PanelChat';

export const CombatBoard = (props: any) => {
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
    CELL_PX, GRID_SIZE, BOARD_PX, renderConditionIcon,
    campaignImage
  } = props;

  const myTeam = currentUser ? (characters.find((c: any) => c.name === currentUser.name)?.teamColor || 'blue') : 'blue';

  const canSeeOnGrid = (t: any) => {
    if (userRole === 'dm' || userRole === 'admin') return true;
    if (t.isVisible === false && t.owner !== currentUser?.name) return false;
    return true;
  };

  return (
    <>
        <div ref={viewportRef} style={{ position: 'relative', flex: 1, overflow: 'hidden', background: '#000' }} onMouseDown={handleViewportMouseDown}>
          
          {campaignImage && (
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url("${campaignImage}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(30px)',
              transform: 'scale(1.1)',
              opacity: 0.35,
              zIndex: 0
            }} />
          )}

          {/* BOTONES FLOTANTES DE ACCIÓN (PH / TS) */}
          {(() => {
            if (!activeTokenId) return null;
            const t = boardTokens.find((t: any) => t.instanceId === activeTokenId);
            if (!t || t.type !== 'character') return null;
            const isOwner = userRole === 'dm' || userRole === 'admin' || t.owner === currentUser?.name;
            if (!isOwner) return null;

            const charSource = characters.find((c: any) => c.id === t.originalId);
            if (!charSource) return null;
            
            const stats = typeof charSource.stats === 'string' ? JSON.parse(charSource.stats) : (charSource.stats || {});
            const safeParse = (val: any) => {
              if (typeof val !== 'string') return val;
              try {
                const p = JSON.parse(val);
                if (typeof p === 'string') return safeParse(p);
                return p;
              } catch { return val; }
            };
            const parsedInv = safeParse(charSource.inventory) || {};
            const selectedSkills = parsedInv.habilidades || [];
            const selectedSavingThrows = parsedInv.salvaciones || [];
            const level = charSource.level || 1;
            
            const getProficiencyBonus = (lvl: number) => {
              if (lvl <= 4) return 2;
              if (lvl <= 8) return 3;
              if (lvl <= 12) return 4;
              if (lvl <= 16) return 5;
              return 6;
            };
            const pb = getProficiencyBonus(level);

            const getMod = (stat: string) => Math.floor(((stats[stat] || 10) - 10) / 2);

            const performRoll = (name: string, statKey: string, isSkill: boolean) => {
              const isSavingThrow = !isSkill;
              if (blockRolls && !isSavingThrow) {
                alert("No puedes tirar dados fuera de tu turno!");
                return;
              }
              let mod = getMod(statKey);
              if (isSkill && selectedSkills.includes(name)) {
                mod += pb;
              } else if (isSavingThrow && selectedSavingThrows.includes(statKey)) {
                mod += pb;
              }
              const roll = Math.floor(Math.random() * 20) + 1;
              const total = roll + mod;
              socket.emit('dice:roll', { die: 20 });
              socket.emit('chat:send', { 
                user: currentUser?.name, 
                text: `🎲 **${t.name}** lanzó **${name}**: d20(${roll}) ${mod >= 0 ? '+' : '-'} ${Math.abs(mod)} = **${total}**`, 
                timestamp: Date.now() 
              });
              setActiveActionMenu(null);
            };

            const tsList = [
              { label: 'FUE', key: 'fue' }, { label: 'DES', key: 'dex' }, { label: 'CON', key: 'con' },
              { label: 'INT', key: 'int' }, { label: 'SAB', key: 'sab' }, { label: 'CAR', key: 'car' }
            ];

            const phList = [
              { label: 'Atletismo', key: 'fue' },
              { label: 'Acrobacias', key: 'dex' }, { label: 'Juego de Manos', key: 'dex' }, { label: 'Sigilo', key: 'dex' },
              { label: 'Arcanos', key: 'int' }, { label: 'Historia', key: 'int' }, { label: 'Investigación', key: 'int' }, { label: 'Naturaleza', key: 'int' }, { label: 'Religión', key: 'int' },
              { label: 'Trato con Animales', key: 'sab' }, { label: 'Perspicacia', key: 'sab' }, { label: 'Medicina', key: 'sab' }, { label: 'Percepción', key: 'sab' }, { label: 'Supervivencia', key: 'sab' },
              { label: 'Engaño', key: 'car' }, { label: 'Intimidación', key: 'car' }, { label: 'Interpretación', key: 'car' }, { label: 'Persuasión', key: 'car' }
            ];

            return (
              <div 
                style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }} 
                onMouseDown={e => { e.stopPropagation(); e.preventDefault(); }} 
                onClick={e => { e.stopPropagation(); e.preventDefault(); }}
              >
                
                {activeActionMenu === 'TS' && (
                  <div className="clipped-frame" style={{ background: 'rgba(0,0,0,0.85)', padding: '12px', border: '2px solid var(--accent-gold)', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '320px', animation: 'healthModalIn 0.2s ease-out' }}>
                    <div className="font-cinzel" style={{ width: '100%', textAlign: 'center', color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '4px', letterSpacing: '1px' }}>TIRADAS DE SALVACIÓN</div>
                    {tsList.map(s => {
                      const isProficient = selectedSavingThrows.includes(s.key);
                      return (
                        <button 
                          key={s.label} 
                          onMouseDown={e => { e.stopPropagation(); e.preventDefault(); }}
                          onClick={(e) => { e.stopPropagation(); performRoll(`Salvación de ${s.label}`, s.key, false); }} 
                          className="font-cinzel" 
                          style={{ 
                            background: 'var(--bg-surface)', 
                            border: isProficient ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-color)', 
                            color: isProficient ? 'var(--accent-gold)' : 'white', 
                            padding: '6px 12px', 
                            borderRadius: '4px', 
                            cursor: 'pointer', 
                            fontSize: '0.8rem', 
                            transition: 'all 0.15s',
                            textShadow: isProficient ? '0 0 5px rgba(255, 215, 0, 0.5)' : 'none',
                            fontWeight: isProficient ? 'bold' : 'normal'
                          }} 
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; e.currentTarget.style.transform = 'scale(1.05)'; }} 
                          onMouseLeave={e => { e.currentTarget.style.borderColor = isProficient ? 'var(--accent-gold)' : 'var(--border-color)'; e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {activeActionMenu === 'PH' && (
                  <div className="clipped-frame" style={{ background: 'rgba(0,0,0,0.85)', padding: '14px', border: '2px solid var(--accent-gold)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', maxWidth: '480px', animation: 'healthModalIn 0.2s ease-out', maxHeight: '55vh', overflowY: 'auto' }}>
                    <div className="font-cinzel" style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '6px', letterSpacing: '1px' }}>PRUEBAS DE HABILIDAD</div>
                    {phList.map(s => {
                      const isProficient = selectedSkills.includes(s.label);
                      return (
                        <button 
                          key={s.label} 
                          onMouseDown={e => { e.stopPropagation(); e.preventDefault(); }}
                          onClick={(e) => { e.stopPropagation(); performRoll(s.label, s.key, true); }} 
                          className="font-cinzel" 
                          style={{ 
                            background: 'var(--bg-surface)', 
                            border: isProficient ? '1.5px solid var(--accent-gold)' : '1px solid var(--border-color)', 
                            color: isProficient ? 'var(--accent-gold)' : 'white', 
                            padding: '8px 6px', 
                            borderRadius: '4px', 
                            cursor: 'pointer', 
                            fontSize: '0.7rem', 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            transition: 'all 0.15s',
                            textShadow: isProficient ? '0 0 5px rgba(255, 215, 0, 0.5)' : 'none',
                            fontWeight: isProficient ? 'bold' : 'normal'
                          }} 
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; e.currentTarget.style.transform = 'scale(1.02)'; }} 
                          onMouseLeave={e => { e.currentTarget.style.borderColor = isProficient ? 'var(--accent-gold)' : 'var(--border-color)'; e.currentTarget.style.transform = 'scale(1)'; }} 
                          title={s.label}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '15px' }} onMouseDown={e => { e.stopPropagation(); e.preventDefault(); }} onClick={e => { e.stopPropagation(); e.preventDefault(); }}>

                  <button 
                    onMouseDown={e => { e.stopPropagation(); e.preventDefault(); }}
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); setActiveActionMenu(activeActionMenu === 'PH' ? null : 'PH'); }} 
                    className="font-cinzel torch-glow" 
                    style={{ background: activeActionMenu === 'PH' ? 'var(--accent-gold)' : 'var(--bg-surface)', color: activeActionMenu === 'PH' ? '#000' : 'white', border: '2px solid var(--accent-gold)', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem', boxShadow: '0 4px 15px rgba(0,0,0,0.6)', transition: 'all 0.2s' }}
                  >
                    PH
                  </button>
                  <button 
                    onMouseDown={e => { e.stopPropagation(); e.preventDefault(); }}
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); setActiveActionMenu(activeActionMenu === 'TS' ? null : 'TS'); }} 
                    className="font-cinzel torch-glow" 
                    style={{ background: activeActionMenu === 'TS' ? 'var(--accent-gold)' : 'var(--bg-surface)', color: activeActionMenu === 'TS' ? '#000' : 'white', border: '2px solid var(--accent-gold)', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem', boxShadow: '0 4px 15px rgba(0,0,0,0.6)', transition: 'all 0.2s' }}
                  >
                    TS
                  </button>
                </div>
              </div>
            );
          })()}
          
          {/* BOTONES FLOTANTES AoE (MENÚ RADIAL) */}
          <div 
            className="radial-container"
            style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 200 }} 
            onMouseDown={e => e.stopPropagation()} 
            onClick={e => e.stopPropagation()}
          >
            {/* Child 1: Línea */}
            <button 
              title="Línea" 
              onClick={() => { setAoeForm({...aoeForm, shape: 'line'}); setActiveAoeTool('line'); setIsCreatingAoe(true); setIsRadialOpen(false); }} 
              className={`radial-child torch-glow ${isRadialOpen ? 'open' : ''}`} 
              style={{ left: '-100px', top: '0px', transitionDelay: isRadialOpen ? '0ms' : '0ms', padding: 0 }}
            >
              <LineAoeIcon />
            </button>
            
            {/* Child 2: Cono */}
            <button 
              title="Cono" 
              onClick={() => { setAoeForm({...aoeForm, shape: 'cone'}); setActiveAoeTool('cone'); setIsCreatingAoe(true); setIsRadialOpen(false); }} 
              className={`radial-child torch-glow ${isRadialOpen ? 'open' : ''}`} 
              style={{ left: '-86.6px', top: '-50px', transitionDelay: isRadialOpen ? '70ms' : '0ms', padding: 0 }}
            >
              <ConeAoeIcon />
            </button>
            
            {/* Child 3: Círculo */}
            <button 
              title="Círculo" 
              onClick={() => { setAoeForm({...aoeForm, shape: 'circle'}); setActiveAoeTool('circle'); setIsCreatingAoe(true); setIsRadialOpen(false); }} 
              className={`radial-child torch-glow ${isRadialOpen ? 'open' : ''}`} 
              style={{ left: '-50px', top: '-86.6px', transitionDelay: isRadialOpen ? '140ms' : '0ms', padding: 0 }}
            >
              <CircleAoeIcon />
            </button>
            
            {/* Child 4: Cuadrado / Cubo */}
            <button 
              title="Cubo" 
              onClick={() => { setAoeForm({...aoeForm, shape: 'cube'}); setActiveAoeTool('cube'); setIsCreatingAoe(true); setIsRadialOpen(false); }} 
              className={`radial-child torch-glow ${isRadialOpen ? 'open' : ''}`} 
              style={{ left: '0px', top: '-100px', transitionDelay: isRadialOpen ? '210ms' : '0ms', padding: 0 }}
            >
              <SquareAoeIcon />
            </button>

            {/* Parent Button */}
            <button
              title="Herramientas de Medición AoE"
              onClick={() => setIsRadialOpen(!isRadialOpen)}
              className="torch-glow"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                background: 'var(--bg-surface)',
                border: '2px solid var(--accent-gold)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                zIndex: 201,
                padding: 0
              }}
            >
              {getAoeIcon(activeAoeTool)}
            </button>
          </div>

          <div
            ref={boardRef}
            onContextMenu={handleBoardContextMenu}
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
            
            <canvas 
              width={BOARD_PX} 
              height={BOARD_PX}
              style={{
                position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1,
                opacity: (userRole === 'dm' || userRole === 'admin') ? 0.35 : 1
              }}
            />
            
            {(userRole === 'dm' || userRole === 'admin') && Array.from(solidCells).map(cellKey => {
              const [cx, cy] = (cellKey as string).split(',').map(Number);
              return (
                <div key={`wall-${cellKey}`} style={{
                  position: 'absolute',
                  left: cx * CELL_PX,
                  top: cy * CELL_PX,
                  width: CELL_PX,
                  height: CELL_PX,
                  background: 'repeating-linear-gradient(45deg, #222 0px, #222 10px, #000 10px, #000 20px)',
                  border: '1px solid #444',
                  boxShadow: 'inset 0 0 15px black',
                  pointerEvents: 'none',
                  opacity: 0.8,
                  zIndex: 2
                }}>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, fontSize: '24px' }}>
                    ❌
                  </div>
                </div>
              );
            })}

            <div ref={snapRef} style={{ display: 'none', position: 'absolute', width: CELL_PX, height: CELL_PX, background: 'rgba(200, 135, 42, 0.1)', border: '2px dashed var(--accent-gold)', borderRadius: '50%', pointerEvents: 'none', zIndex: 99 }} />

            <div ref={ghostRef} style={{ display: 'none', position: 'absolute', width: CELL_PX, height: CELL_PX, borderRadius: '50%', background: 'var(--accent-gold)', border: '3px solid white', opacity: 0.85, zIndex: 100, pointerEvents: 'none', boxShadow: '0 8px 25px rgba(0,0,0,0.5)', transform: 'scale(1.1)', overflow: 'hidden' }} />

            {boardTokens.filter(canSeeOnGrid).map((t: any) => {
              const isDragging = drag === t.instanceId;
              const isMyTeam = (userRole === 'dm' || (t.teamColor && t.teamColor === myTeam) || (currentUser && t.owner === currentUser.name));
              const isAoe = t.type === 'aoe';
              const tokenOpacity = isDragging && !isAoe ? 0 : 1;

              if (isAoe) {
                const aoe = t.aoeData;
                const r = aoe?.rotation || 0;
                let svgContent = null;
                let w = CELL_PX;
                let h = CELL_PX;
                
                if (aoe?.shape === 'circle') {
                  const radPx = (aoe.size1 * CELL_PX);
                  w = radPx * 2;
                  h = radPx * 2;
                  svgContent = <circle cx={radPx} cy={radPx} r={radPx} fill={aoe.color} fillOpacity={0.4} stroke={aoe.color} strokeWidth={2} />;
                } else if (aoe?.shape === 'line') {
                  const lengthPx = aoe.size1 * CELL_PX;
                  const widthPx = aoe.size2 * CELL_PX;
                  w = lengthPx;
                  h = widthPx;
                  svgContent = <rect x={0} y={0} width={lengthPx} height={widthPx} fill={aoe.color} fillOpacity={0.4} stroke={aoe.color} strokeWidth={2} />;
                } else if (aoe?.shape === 'cone') {
                  const lengthPx = aoe.size1 * CELL_PX;
                  w = lengthPx;
                  h = lengthPx;
                  svgContent = <polygon points={`0,${lengthPx/2} ${lengthPx},0 ${lengthPx},${lengthPx}`} fill={aoe.color} fillOpacity={0.4} stroke={aoe.color} strokeWidth={2} strokeLinejoin="round" />;
                } else if (aoe?.shape === 'cube') {
                  const sizePx = aoe.size1 * CELL_PX;
                  w = sizePx;
                  h = sizePx;
                  svgContent = <rect x={0} y={0} width={sizePx} height={sizePx} fill={aoe.color} fillOpacity={0.4} stroke={aoe.color} strokeWidth={2} />;
                }
                
                let leftOffset = (t.x + 0.5) * CELL_PX - w / 2;
                let topOffset = (t.y + 0.5) * CELL_PX - h / 2;
                let transformOrigin = 'center';
                
                return (
                  <div
                    id={`token-${t.instanceId}`}
                    data-rotation={r}
                    key={t.instanceId}
                    onMouseDown={(e) => handleTokenMouseDown(e, t.instanceId)}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      if (wasDraggingRef.current) return;
                      setSelectedAoeToken(t); 
                      setActiveTokenId(t.instanceId); 
                    }}
                    style={{
                      position: 'absolute',
                      left: leftOffset,
                      top: topOffset,
                      width: w,
                      height: h,
                      cursor: isDragging ? 'grabbing' : 'pointer',
                      zIndex: isDragging ? 1 : 5,
                      opacity: tokenOpacity,
                      transform: `rotate(${r}deg) ${activeTokenId === t.instanceId ? 'scale(1.05)' : ''}`,
                      transformOrigin: transformOrigin,
                      transition: isDragging ? 'none' : 'left 0.15s ease, top 0.15s ease, transform 0.2s',
                      pointerEvents: 'none'
                    }}
                  >
                    <svg width="100%" height="100%" style={{ display: 'block', pointerEvents: 'visiblePainted' }}>
                      {svgContent}
                    </svg>
                  </div>
                );
              }

              // Check if token is inside any AoE
              let inAoeColor: string | null = null;
              if (t.type === 'character' || t.type === 'monster') {
                const tx = t.x + 0.5;
                const ty = t.y + 0.5;
                for (const a of boardTokens) {
                  if (a.type === 'aoe' && a.aoeData) {
                    const ax = a.x + 0.5;
                    const ay = a.y + 0.5;
                    const rRad = (a.aoeData.rotation || 0) * Math.PI / 180;
                    
                    const dx = tx - ax;
                    const dy = ty - ay;
                    const rdx = dx * Math.cos(-rRad) - dy * Math.sin(-rRad);
                    const rdy = dx * Math.sin(-rRad) + dy * Math.cos(-rRad);
                    
                    let inside = false;
                    if (a.aoeData.shape === 'circle') {
                      const dist = Math.sqrt(dx*dx + dy*dy);
                      if (dist <= a.aoeData.size1) inside = true;
                    } else if (a.aoeData.shape === 'line') {
                      const len = a.aoeData.size1;
                      const wid = a.aoeData.size2;
                      if (rdx >= 0 && rdx <= len && Math.abs(rdy) <= wid / 2) inside = true;
                    } else if (a.aoeData.shape === 'cone') {
                      const len = a.aoeData.size1;
                      if (rdx >= 0 && rdx <= len && Math.abs(rdy) <= rdx / 2) inside = true;
                    } else if (a.aoeData.shape === 'cube') {
                      const s = a.aoeData.size1;
                      const ctx = tx - a.x;
                      const cty = ty - a.y;
                      if (ctx >= 0 && ctx <= s && cty >= 0 && cty <= s) inside = true;
                    }
                    
                    if (inside) {
                      inAoeColor = a.aoeData.color;
                      break;
                    }
                  }
                }
              }

              const isChest = t.type === 'chest';
              const isItem = t.type === 'item';
              const isNote = t.type === 'note';
              const isImage = t.type === 'image';
              const showHpBar = isMyTeam && !isDragging && !isChest && !isItem && !isNote && !isImage;

              let innerDisplay = null;
              if (isChest) {
                innerDisplay = t.chestData?.isOpen ? <OpenChestIcon /> : <ClosedChestIcon />;
              } else if (isItem) {
                innerDisplay = <ItemDropIcon rarity={t.itemData?.rarity || 'Común'} />;
              } else if (isNote) {
                innerDisplay = <NoteTokenIcon />;
              } else if (isImage) {
                innerDisplay = t.imageData?.url ? <img src={t.imageData.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageTokenIcon />;
              } else {
                innerDisplay = t.image ? <img src={t.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontWeight: 'bold' }}>{t.name[0]}</span>;
              }

              return (
                <div
                  key={t.instanceId}
                  onMouseDown={(e) => handleTokenMouseDown(e, t.instanceId)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isChest) {
                      if (userRole === 'dm' || userRole === 'admin') {
                        setSelectedChestToken(t);
                      } else {
                        if (t.chestData?.isOpen) {
                          setSelectedChestToken(t);
                        } else {
                          setPasswordPromptChest(t);
                          setEnteredPassword('');
                          setPasswordError('');
                        }
                      }
                    } else if (isItem) {
                      setSelectedItemToken(t);
                    } else if (isNote) {
                      setSelectedNoteToken(t);
                    } else if (isImage) {
                      setSelectedImageToken(t);
                    } else {
                      setActiveTokenId(t.instanceId);
                    }
                  }}
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
                    width: '100%', height: '100%', borderRadius: isChest || isItem || isNote || isImage ? '8px' : '50%',
                    background: isChest || isItem || isNote || isImage ? 'transparent' : (t.type === 'character' ? 'var(--accent-gold)' : 'var(--combat-red)'),
                    border: activeTokenId === t.instanceId ? '4px solid white' : (isChest || isItem || isNote || isImage ? '1px dashed rgba(255,255,255,0.4)' : '2px solid rgba(255,255,255,0.3)'),
                    overflow: isChest || isItem || isNote || isImage ? 'visible' : 'hidden',
                    boxShadow: inAoeColor ? `0 0 20px 5px ${inAoeColor}, inset 0 0 10px ${inAoeColor}` : (isChest || isItem || isNote || isImage ? 'none' : (t.teamColor ? `0 0 15px ${t.teamColor}` : '0 4px 10px rgba(0,0,0,0.5)')),
                    transform: activeTokenId === t.instanceId ? 'scale(1.1)' : 'scale(0.9)',
                    transition: 'transform 0.1s, box-shadow 0.3s'
                  }}>
                    {innerDisplay}
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
        <div style={{
          width: isChatOpen ? '300px' : '0px',
          minWidth: isChatOpen ? '300px' : '0px',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          flexShrink: 0,
          display: 'flex',
          borderLeft: isChatOpen ? '1px solid var(--border-color)' : 'none',
          background: 'var(--bg-surface)',
          overflow: 'hidden'
        }}>
          <div style={{ width: '300px', height: '100%', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
            <ChatPanel socket={socket} currentUser={currentUser} characters={characters} messages={chatMessages} blockRolls={blockRolls} />
          </div>
        </div>

      {saveNotification && (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--bg-base)', border: '2px solid var(--combat-red)', padding: '40px', borderRadius: '4px', textAlign: 'center', zIndex: 10000, boxShadow: '0 0 50px rgba(0,0,0,0.8)' }}>
          <h2 className="font-cinzel" style={{ color: 'var(--combat-red)', fontSize: '2rem' }}>¡TIRADA DE SALVACIÓN!</h2>
          <p style={{ color: 'var(--text-parchment)' }}>El DM solicita una tirada de {saveNotification.stat.toUpperCase()}</p>
          {((currentUser && currentUser.name === saveNotification.targetName) || userRole === 'dm') && (
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
                socket.emit('chat:send', { user: currentUser?.name, text: `🎲 **${saveNotification.targetName}** lanzó **${saveNotification.stat}**: d20(${roll}) + ${mod} = **${total}**. ${pass ? '✅ **SUPERADO**' : '❌ **FALLADO**'}`, timestamp: Date.now() });
                setSaveNotification(null);
              }}
              className="font-cinzel"
              style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 20px', marginTop: '20px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              TIRAR SALVACIÓN
            </button>
          )}
        </div>
      )}
    </>
  );
};
