import { Ghost, User, Backpack, Swords } from 'lucide-react';
import { NoteTokenIcon, ImageTokenIcon, ClosedChestIcon, OpenChestIcon, ItemDropIcon, getAoeIcon } from '../../../shared/components/iconos';

export const CombatSidebar = (props: any) => {
  const {
    socket, userRole, currentUser, boardTokens, characters, monsters,
    onOpenCharacterSheet, onOpenMonsterSheet,
    sidebarTab, prevSidebarTab, isTabTransitioning, switchTab,
    activeTokenId, setActiveTokenId, combatState,
    setSelectedChestToken, setPasswordPromptChest,
    setEnteredPassword, setPasswordError, setSelectedItemToken,
    setSelectedNoteToken, setSelectedImageToken, setSelectedAoeToken,
    isSidebarOpen, setHealthModalToken, setHealthInput, setConditionInput
  } = props;

  const canSeeInSidebar = (t: any) => {
    if (userRole === 'dm') return true;
    if (t.owner === currentUser?.name) return true;
    return false;
  };

  return (
    <>
        {/* COLUMNA IZQ: COMBATIENTES u OBJETOS */}
        <div style={{
          width: isSidebarOpen ? '320px' : '0px',
          minWidth: isSidebarOpen ? '320px' : '0px',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          background: 'rgba(0,0,0,0.2)',
          borderRight: isSidebarOpen ? '1px solid var(--border-color)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          <div style={{ width: '320px', height: '100%', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          
          {/* ── HEADER DE PESTAÑAS PREMIUM ── */}
          <div style={{ padding: '14px 16px 0', background: 'rgba(0,0,0,0.25)', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '4px', position: 'relative' }}>
              {/* Pill deslizante */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: sidebarTab === 'combatants' ? '0%' : '50%',
                width: '50%',
                height: '2px',
                background: 'var(--accent-gold)',
                boxShadow: '0 0 8px rgba(200,135,42,0.8)',
                transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                borderRadius: '2px 2px 0 0'
              }} />

              <button
                onClick={() => switchTab('combatants')}
                className="font-cinzel"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: sidebarTab === 'combatants' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  padding: '10px 8px 14px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  letterSpacing: '1.2px',
                  fontWeight: 'bold',
                  transition: 'color 0.25s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  textTransform: 'uppercase'
                }}
              >
                Combatientes
              </button>

              <button
                onClick={() => switchTab('objects')}
                className="font-cinzel"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: sidebarTab === 'objects' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  padding: '10px 8px 14px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  letterSpacing: '1.2px',
                  fontWeight: 'bold',
                  transition: 'color 0.25s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  textTransform: 'uppercase'
                }}
              >
                Objetos
              </button>
            </div>
          </div>

          {/* ── CONTENIDO CON SLIDE + FADE ── */}
          <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
            {/* Panel Combatientes */}
            <div style={{
              position: 'absolute',
              inset: 0,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              overflowY: 'auto',
              animation: sidebarTab === 'combatants'
                ? (prevSidebarTab === 'objects' ? 'slideInFromLeft 0.28s cubic-bezier(0.4,0,0.2,1) forwards' : 'fadeInPanel 0.2s ease forwards')
                : (isTabTransitioning && prevSidebarTab === 'combatants' ? 'slideOutToLeft 0.22s cubic-bezier(0.4,0,0.2,1) forwards' : 'none'),
              pointerEvents: sidebarTab === 'combatants' ? 'auto' : 'none',
              visibility: sidebarTab === 'combatants' || (isTabTransitioning && prevSidebarTab === 'combatants') ? 'visible' : 'hidden'
            }}>
              {(() => {
                const sortedCombatants = [...boardTokens].filter((t: any) => t.type === 'character' || t.type === 'monster').filter(canSeeInSidebar).sort((a: any, b: any) => {
                  const aInit = combatState.initiativeOrder.findIndex(i => i.tokenId === a.instanceId);
                  const bInit = combatState.initiativeOrder.findIndex(i => i.tokenId === b.instanceId);
                  if (aInit !== -1 && bInit !== -1) return aInit - bInit;
                  if (aInit !== -1) return -1;
                  if (bInit !== -1) return 1;
                  return 0;
                });

                return sortedCombatants.map((t: any, idx: number) => {
                  const isChar = t.type === 'character';
                  const initIndex = combatState.initiativeOrder.findIndex(i => i.tokenId === t.instanceId);
                  const isTheirTurn = combatState.turnModeActive && initIndex !== -1 && combatState.currentTurnIndex === initIndex;

                  return (
                  <div key={t.instanceId}
                    className={`clipped-frame torch-glow ${activeTokenId === t.instanceId ? 'active' : ''}`}
                    draggable={userRole === 'dm' || userRole === 'admin'}
                    onDragStart={(e) => { e.dataTransfer.setData('text/plain', t.instanceId); }}
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const draggedId = e.dataTransfer.getData('text/plain');
                      if (draggedId !== t.instanceId && (userRole === 'dm' || userRole === 'admin')) {
                        const newOrder = [...combatState.initiativeOrder];
                        const draggedIndex = newOrder.findIndex(i => i.tokenId === draggedId);
                        const dropIndex = newOrder.findIndex(i => i.tokenId === t.instanceId);
                        if (draggedIndex !== -1 && dropIndex !== -1) {
                          const [draggedItem] = newOrder.splice(draggedIndex, 1);
                          newOrder.splice(dropIndex, 0, draggedItem);
                          socket.emit('combat:reorder-initiative', newOrder);
                        }
                      }
                    }}
                    style={{
                      padding: '12px',
                      border: isTheirTurn ? '1px solid var(--natural-green)' : (activeTokenId === t.instanceId ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)'),
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, background 0.2s',
                      background: isTheirTurn ? 'rgba(34, 197, 94, 0.15)' : (activeTokenId === t.instanceId ? 'rgba(200, 135, 42, 0.1)' : 'var(--bg-surface)'),
                      animation: `sidebarItemIn 0.3s ease both`,
                      animationDelay: `${idx * 40}ms`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      position: 'relative'
                    }}
                    onClick={(e) => { e.stopPropagation(); setActiveTokenId(t.instanceId); }}
                  >
                    {(() => {
                      if (initIndex !== -1) {
                        return (
                          <div style={{ position: 'absolute', top: '4px', right: '4px', width: '22px', height: '22px', background: isTheirTurn ? 'var(--natural-green)' : 'var(--accent-gold)', borderRadius: '50%', color: isTheirTurn ? 'white' : 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 5, boxShadow: '0 0 5px rgba(0,0,0,0.5)' }}>
                            {initIndex + 1}
                          </div>
                        );
                      } else {
                        let dexMod = 0;
                        if (t.type === 'character') {
                           const c = characters.find((ch: any) => ch.id === t.originalId);
                           if (c && c.stats && c.stats.DEX) dexMod = Math.floor((c.stats.DEX - 10) / 2);
                        } else {
                           const m = monsters.find((mo: any) => mo.name === t.name);
                           if (m && m.stats && m.stats.DEX) dexMod = Math.floor((m.stats.DEX - 10) / 2);
                        }
                        const modStr = dexMod >= 0 ? `+${dexMod}` : `${dexMod}`;
                        return (
                          <div 
                            title="Iniciativa"
                            onClick={(e) => {
                              e.stopPropagation(); e.preventDefault();
                              const roll = Math.floor(Math.random() * 20) + 1;
                              const total = roll + dexMod;
                              socket.emit('combat:roll-initiative', { tokenId: t.instanceId, value: total });
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                            style={{ position: 'absolute', top: '4px', right: '4px', width: '22px', height: '22px', background: 'var(--bg-surface)', border: '1px solid var(--accent-gold)', borderRadius: '50%', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', zIndex: 5, boxShadow: '0 0 5px rgba(0,0,0,0.5)', cursor: 'pointer', transition: 'transform 0.1s' }}
                          >
                            {modStr}
                          </div>
                        );
                      }
                    })()}
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ position: 'relative', width: '42px', height: '42px', border: `2px solid ${t.teamColor || 'var(--border-color)'}`, overflow: 'hidden', flexShrink: 0, borderRadius: '4px' }}>
                        {t.image ? <img src={t.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '1.2rem' }}>{isChar ? <User className="w-full h-full p-2" /> : <Ghost className="w-full h-full p-2" />}</span>}
                      {t.condition && (
                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: 'rgba(0,0,0,0.8)', borderRadius: '50%', fontSize: '0.8rem', padding: '2px', border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {t.condition}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div className="font-cinzel" style={{ color: 'white', fontSize: '0.95rem', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={(e) => { 
                        e.stopPropagation(); 
                        if (isChar) {
                          if (onOpenCharacterSheet) onOpenCharacterSheet(t.originalId || t.instanceId);
                        } else {
                          if (onOpenMonsterSheet) onOpenMonsterSheet(t.originalId || t.name);
                        }
                      }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: isChar ? 'var(--accent-gold)' : 'var(--combat-red)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{isChar ? 'Héroe' : 'Criatura'}</div>
                    </div>
                  </div>

                  {/* spell slots quick-view removed — visible only in health modal */}

                  {(userRole === 'dm' || t.owner === currentUser.name) && (
                    <div 
                       onClick={(e) => { 
                         e.stopPropagation();
                         if (userRole === 'dm') {
                           setHealthModalToken(t);
                           setHealthInput('');
                           setConditionInput(t.condition || '');
                         }
                       }}
                       style={{ 
                         width: '100%', 
                         height: '22px', 
                         background: 'rgba(0,0,0,0.5)', 
                         position: 'relative', 
                         borderRadius: '4px',
                         overflow: 'hidden',
                         border: '1px solid var(--border-color)',
                         cursor: userRole === 'dm' ? 'pointer' : 'default',
                         marginTop: '4px'
                       }}
                    >
                      <div style={{ 
                        width: `${Math.min(100, (t.hp / Math.max(1, t.max_hp)) * 100)}%`, 
                        height: '100%', 
                        background: t.hp / Math.max(1, t.max_hp) > 0.5 ? 'var(--natural-green)' : 'var(--combat-red)', 
                        transition: 'width 0.4s ease' 
                      }} />
                      {(t.tempHp || 0) > 0 && (
                        <div style={{
                          position: 'absolute', top: 0, right: 0, height: '100%',
                          background: 'rgba(59, 130, 246, 0.6)', 
                          width: `${Math.min(100, ((t.tempHp || 0) / Math.max(1, t.max_hp)) * 100)}%`,
                          transition: 'width 0.4s ease'
                        }} />
                      )}
                      <div className="mono" style={{ 
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.8rem', fontWeight: 'bold',
                        textShadow: '1px 1px 2px black'
                      }}>
                        {t.hp}{(t.tempHp || 0) > 0 ? ` (+${t.tempHp})` : ''} / {t.max_hp}
                      </div>
                    </div>
                  )}

                  {(userRole === 'dm' || userRole === 'admin') && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.05)' }} onClick={e => e.stopPropagation()}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginRight: '4px' }}>Equipo:</span>
                      {[
                        { name: 'Ninguno', color: null },
                        { name: 'Rojo', color: '#ef4444' },
                        { name: 'Azul', color: '#3b82f6' },
                        { name: 'Verde', color: '#10b981' },
                        { name: 'Dorado', color: '#ecc94b' }
                      ].map(team => (
                        <button
                          key={team.name}
                          title={team.name}
                          onClick={() => socket.emit('token:update-team', { tokenId: t.instanceId, color: team.color })}
                          style={{
                            width: '18px', height: '18px', borderRadius: '50%', border: t.teamColor === team.color ? '2px solid white' : '1px solid #555',
                            background: team.color || 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.65rem', padding: 0, outline: 'none', transition: 'transform 0.15s'
                          }}
                          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.85)'}
                          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          {!team.color && '×'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            });
          })()}
              {boardTokens.filter(canSeeInSidebar).length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '30px 20px', opacity: 0.6 }}>
                  <div style={{ marginBottom: '8px' }}><Swords size={32} style={{ margin: '0 auto', opacity: 0.5, color: 'var(--text-secondary)' }} /></div>
                  Sin combatientes en el mapa
                </div>
              )}
            </div>

            {/* Panel Objetos */}
            <div style={{
              position: 'absolute',
              inset: 0,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              overflowY: 'auto',
              animation: sidebarTab === 'objects'
                ? (prevSidebarTab === 'combatants' ? 'slideInFromRight 0.28s cubic-bezier(0.4,0,0.2,1) forwards' : 'fadeInPanel 0.2s ease forwards')
                : (isTabTransitioning && prevSidebarTab === 'objects' ? 'slideOutToRight 0.22s cubic-bezier(0.4,0,0.2,1) forwards' : 'none'),
              pointerEvents: sidebarTab === 'objects' ? 'auto' : 'none',
              visibility: sidebarTab === 'objects' || (isTabTransitioning && prevSidebarTab === 'objects') ? 'visible' : 'hidden'
            }}>
              {boardTokens.filter((t: any) => t.type === 'chest' || t.type === 'item' || t.type === 'note' || t.type === 'image' || t.type === 'aoe').map((t: any, idx: number) => {
                const isChest = t.type === 'chest';
                const isItem = t.type === 'item';
                const isNote = t.type === 'note';
                const isImage = t.type === 'image';
                const isAoe = t.type === 'aoe';

                let icon = null;
                let statusText = '';
                if (isChest) {
                  icon = t.chestData?.isOpen ? <OpenChestIcon /> : <ClosedChestIcon />;
                  statusText = t.chestData?.isOpen ? 'Abierto' : 'Cerrado';
                } else if (isItem) {
                  icon = <ItemDropIcon rarity={t.itemData?.rarity || 'Común'} />;
                  statusText = t.itemData?.rarity || 'Común';
                } else if (isNote) {
                  icon = <NoteTokenIcon />;
                  statusText = 'Nota';
                } else if (isImage) {
                  icon = t.imageData?.url ? <img src={t.imageData.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} /> : <ImageTokenIcon />;
                  statusText = 'Imagen';
                } else if (isAoe) {
                  icon = getAoeIcon(t.aoeData?.shape || null);
                  statusText = 'Área de Efecto';
                }

                return (
                  <div key={t.instanceId}
                    className={`clipped-frame torch-glow ${activeTokenId === t.instanceId ? 'active' : ''}`}
                    style={{
                      padding: '12px',
                      border: activeTokenId === t.instanceId ? '1px solid var(--accent-gold)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, background 0.2s',
                      background: activeTokenId === t.instanceId ? 'rgba(200, 135, 42, 0.1)' : 'var(--bg-surface)',
                      animation: `sidebarItemIn 0.3s ease both`,
                      animationDelay: `${idx * 40}ms`
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTokenId(t.instanceId);
                      if (isChest) {
                        if (userRole === 'dm' || userRole === 'admin' || t.chestData?.isOpen) {
                          setSelectedChestToken(t);
                        } else {
                          setPasswordPromptChest(t);
                          setEnteredPassword('');
                          setPasswordError('');
                        }
                      } else if (isItem) {
                        setSelectedItemToken(t);
                      } else if (isNote) {
                        setSelectedNoteToken(t);
                      } else if (isImage) {
                        setSelectedImageToken(t);
                      } else if (isAoe) {
                        setSelectedAoeToken(t);
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ position: 'relative', width: '42px', height: '42px', border: '1px solid var(--border-color)', overflow: 'hidden', flexShrink: 0, padding: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
                        {icon}
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div className="font-cinzel" style={{ color: 'white', fontSize: '0.95rem', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.name}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: isChest ? 'var(--accent-gold)' : 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {isChest ? `Cofre • ${statusText}` : (isItem ? `Objeto • ${statusText}` : (isNote ? 'Nota' : (isImage ? 'Imagen' : 'AoE')))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {boardTokens.filter((t: any) => t.type === 'chest' || t.type === 'item' || t.type === 'note' || t.type === 'image' || t.type === 'aoe').length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '30px 20px', opacity: 0.6 }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}><Backpack className="w-10 h-10 m-auto" /></div>
                  Sin objetos en el mapa
                </div>
              )}
            </div>
          </div>
          </div>
        </div>

        {/* COLUMNA CENTRAL: MAPA */}

    </>
  );
};
