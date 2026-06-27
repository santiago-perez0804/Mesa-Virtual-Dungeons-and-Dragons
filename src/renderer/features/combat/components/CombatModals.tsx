import React from 'react';
import { Ghost, HeartCrack, Flame, Snowflake, Moon, Shield, Zap, Biohazard, Activity, X, User, Backpack, Dices, StickyNote, Box, Lock, Coins, Swords, ArrowRight } from 'lucide-react';
import { NoteTokenIcon, ImageTokenIcon, ClosedChestIcon, OpenChestIcon, ItemDropIcon, CompassIcon, LineAoeIcon, ConeAoeIcon, CircleAoeIcon, SquareAoeIcon, getAoeIcon } from '../../../shared/components/iconos';

export const CombatModals = (props: any) => {
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
      {/* MODAL DETALLE DE COMBATIENTE */}
      {viewingToken && (() => {
        const item = boardTokens.find((t: any) => t.instanceId === viewingToken.instanceId) || viewingToken;
        const isChar = item.type === 'character';
        let inventory: any = null;
        let stats: any = {};
        let description: any = "";
        let classes = "";
        let race = "";
        let type = "";

        const safeParse = (val: any) => {
          if (typeof val !== 'string') return val;
          try {
            const p = JSON.parse(val);
            if (typeof p === 'string') return safeParse(p);
            return p;
          } catch { return val; }
        };

        if (isChar) {
          const charSource = characters.find((c: any) => c.id === item.originalId);
          stats = safeParse(charSource?.stats || {});
          description = charSource?.description || "Sin descripción.";
          race = charSource?.race || "Humano";
          inventory = safeParse(charSource?.inventory) || null;
          try {
            const parsedCls = safeParse(charSource?.class);
            classes = Object.entries(parsedCls).map(([c, l]) => `${c} ${l}`).join(' / ');
          } catch {
            classes = charSource?.class || "Guerrero";
          }
        } else {
          const mSource = monsters.find((m: any) => m.id === item.originalId);
          const mData = safeParse(mSource?.data || {});
          stats = { fue: mData.strength || 10, dex: mData.dexterity || 10, con: mData.constitution || 10, int: mData.intelligence || 10, sab: mData.wisdom || 10, car: mData.charisma || 10 };
          description = mData.description || mData.desc || "Sin descripción.";
          type = mData.type || "Monstruo";
        }

        const statMod = (v: number) => {
          const mod = Math.floor((v - 10) / 2);
          return (mod >= 0 ? '+' : '') + mod;
        };

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }} onClick={() => setViewingToken(null)}>
            <div className="clipped-frame" style={{ width: '100%', maxWidth: '900px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
              {/* MODAL HEADER */}
              <div style={{ padding: '25px 30px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '20px', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ width: '80px', height: '80px', border: '2px solid var(--accent-gold)', overflow: 'hidden', flexShrink: 0 }}>
                  {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '2.5rem' }}>{isChar ? <User className="w-full h-full p-2" /> : <Ghost className="w-full h-full p-2" />}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 className="font-cinzel" style={{ margin: 0, fontSize: '2rem', color: 'var(--accent-gold)' }}>{item.name}</h2>
                  <p className="font-cinzel" style={{ margin: '4px 0 0 0', color: 'var(--text-parchment)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {isChar ? `${race} • ${classes}` : type}
                  </p>
                </div>
              </div>

              {/* MODAL BODY */}
              <div style={{ padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>

                {/* Atributos */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '15px' }}>
                  {Object.entries(stats).map(([key, val]: [string, any]) => {
                    const mod = statMod(val);
                    return (
                      <div key={key} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', padding: '12px', textAlign: 'center' }}>
                        <div className="font-cinzel" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 'bold', textTransform: 'uppercase' }}>{key}</div>
                        <div className="mono" style={{ fontSize: '1.4rem', color: 'white', fontWeight: 'bold' }}>{val}</div>
                        <div className="mono" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mod: {mod}</div>
                        {isChar && <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', marginTop: '4px', fontWeight: 'bold' }}>TS: {mod}</div>}
                      </div>
                    );
                  })}
                </div>

                {isChar && (() => {
                  const selectedSkills = inventory?.habilidades || [];
                  const level = characters.find((c: any) => c.id === item.originalId)?.level || 1;
                  const pb = 1 + Math.ceil(level / 4);
                  
                  const phList = [
                    { label: 'Atletismo', key: 'fue' },
                    { label: 'Acrobacias', key: 'dex' }, { label: 'Juego de Manos', key: 'dex' }, { label: 'Sigilo', key: 'dex' },
                    { label: 'Arcanos', key: 'int' }, { label: 'Historia', key: 'int' }, { label: 'Investigación', key: 'int' }, { label: 'Naturaleza', key: 'int' }, { label: 'Religión', key: 'int' },
                    { label: 'Trato con Animales', key: 'sab' }, { label: 'Perspicacia', key: 'sab' }, { label: 'Medicina', key: 'sab' }, { label: 'Percepción', key: 'sab' }, { label: 'Supervivencia', key: 'sab' },
                    { label: 'Engaño', key: 'car' }, { label: 'Intimidación', key: 'car' }, { label: 'Interpretación', key: 'car' }, { label: 'Persuasión', key: 'car' }
                  ];

                  return (
                    <div>
                      <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}><Dices className="w-5 h-5 inline-block mr-2" /> HABILIDADES</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {phList.map(s => {
                          const baseMod = Math.floor(((stats[s.key] || 10) - 10) / 2);
                          const isProficient = selectedSkills.includes(s.label);
                          const totalMod = baseMod + (isProficient ? pb : 0);
                          const modStr = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;
                          return (
                            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                              <span className="font-cinzel" style={{ fontSize: '0.75rem', color: isProficient ? 'var(--accent-gold)' : 'white' }}>{s.label} ({s.key.toUpperCase()})</span>
                              <span className="mono" style={{ fontSize: '1rem', fontWeight: 'bold', color: isProficient ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>{modStr}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Descripción */}
                <div>
                  <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}><StickyNote className="w-4 h-4 inline-block mr-2" /> DESCRIPCIÓN</h4>
                  <div style={{ color: 'var(--text-parchment)', lineHeight: '1.6', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
                    {Array.isArray(description) ? description.join('\n') : description}
                  </div>
                </div>

                {/* Inventario (solo héroes) */}
                {isChar && inventory && (
                  <div>
                    <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>⚔️ INVENTARIO</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      {Object.entries(inventory).map(([cat, items]: [string, any]) => (
                        items && items.length > 0 && (
                          <div key={cat} style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', border: '1px solid var(--border-color)' }}>
                            <h5 className="font-cinzel" style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{cat}</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {items.map((it: any, idx: number) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                                  <span style={{ fontSize: '0.9rem', color: 'white' }}>{it.name}</span>
                                  {it.damage && <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--combat-red)' }}>{it.damage}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* COFRE Y OBJETOS INTERACTIVOS OVERLAYS */}
      {contextMenu && (
        <div
          className="clipped-frame torch-glow"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            background: 'var(--bg-surface)',
            border: '2px solid var(--accent-gold)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            padding: '4px',
            minWidth: '150px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setIsCreatingChest(true);
              setChestPassword('');
            }}
            className="font-cinzel"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-parchment)',
              padding: '10px 14px',
              textAlign: 'left',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,135,42,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            📦 Agregar Cofre
          </button>
          <button
            onClick={() => {
              setIsSelectingCompendiumItem(true);
              setItemSearchQuery('');
            }}
            className="font-cinzel"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-parchment)',
              padding: '10px 14px',
              textAlign: 'left',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'background 0.2s',
              borderTop: '1px solid var(--border-color)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,135,42,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            ⚔️ Agregar Objeto
          </button>
          <button
            onClick={() => {
              setIsCreatingNote(true);
              setNoteText('');
            }}
            className="font-cinzel"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-parchment)',
              padding: '10px 14px',
              textAlign: 'left',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'background 0.2s',
              borderTop: '1px solid var(--border-color)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,135,42,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            📝 Agregar Nota
          </button>
          <button
            onClick={() => {
              setIsCreatingImage(true);
              setImageUrlInput('');
            }}
            className="font-cinzel"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-parchment)',
              padding: '10px 14px',
              textAlign: 'left',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'background 0.2s',
              borderTop: '1px solid var(--border-color)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,135,42,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            🖼️ Agregar Imagen
          </button>
        </div>
      )}

      {isCreatingAoe && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={() => setIsCreatingAoe(false)}>
          <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '400px', padding: '30px', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
            <h3 className="font-cinzel" style={{ margin: '0 0 20px 0', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', textTransform: 'uppercase' }}>CREAR ÁREA DE EFECTO ({aoeForm.shape})</h3>
            <form onSubmit={handleSpawnAoe}>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>{aoeForm.shape === 'line' ? 'LARGO (Casillas)' : (aoeForm.shape === 'circle' ? 'RADIO (Casillas)' : 'TAMAÑO (Casillas)')}</label>
                  <input
                    type="number"
                    min="1"
                    value={aoeForm.size1}
                    onChange={e => setAoeForm({...aoeForm, size1: parseInt(e.target.value) || 1})}
                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '12px', width: '100%', borderRadius: '4px', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
                {aoeForm.shape === 'line' && (
                  <div style={{ flex: 1 }}>
                    <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>ANCHO (Casillas)</label>
                    <input
                      type="number"
                      min="1"
                      value={aoeForm.size2}
                      onChange={e => setAoeForm({...aoeForm, size2: parseInt(e.target.value) || 1})}
                      style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '12px', width: '100%', borderRadius: '4px', boxSizing: 'border-box', outline: 'none' }}
                    />
                  </div>
                )}
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>COLOR DEL ÁREA</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['#ef4444', '#3b82f6', '#10b981', '#ecc94b', '#a855f7', '#ec4899', '#f97316', '#64748b'].map(color => (
                    <div
                      key={color}
                      onClick={() => setAoeForm({...aoeForm, color})}
                      style={{ width: '30px', height: '30px', borderRadius: '50%', background: color, cursor: 'pointer', border: aoeForm.color === color ? '3px solid white' : '1px solid rgba(255,255,255,0.3)', transform: aoeForm.color === color ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.1s' }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsCreatingAoe(false)} className="font-cinzel" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Cancelar</button>
                <button type="submit" className="font-cinzel torch-glow" style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>INVOCAR</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedAoeToken && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={() => setSelectedAoeToken(null)}>
          <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '450px', padding: '30px', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
            <h3 className="font-cinzel" style={{ margin: '0 0 20px 0', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>EDITAR ÁREA DE EFECTO</h3>
            
            <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>ROTACIÓN (Grados)</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={selectedAoeToken.aoeData?.rotation || 0}
                    onChange={e => {
                      const newRot = parseInt(e.target.value) || 0;
                      setSelectedAoeToken({...selectedAoeToken, aoeData: {...selectedAoeToken.aoeData, rotation: newRot}});
                      socket.emit('token:update-aoe', { tokenId: selectedAoeToken.instanceId, aoeData: {...selectedAoeToken.aoeData, rotation: newRot} });
                    }}
                    style={{ flex: 1, accentColor: 'var(--accent-gold)' }}
                  />
                  <span className="mono" style={{ color: 'white', width: '40px', textAlign: 'right' }}>{selectedAoeToken.aoeData?.rotation || 0}°</span>
                </div>
              </div>
              
              <div style={{ width: '60px', height: '60px', border: '1px solid var(--border-color)', background: '#0a0a0a', position: 'relative', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
                {(() => {
                  const aoe = selectedAoeToken.aoeData;
                  if (!aoe) return null;
                  
                  // Calculate dynamic cell size to fit shape inside 50px bounding box
                  let shapeW = aoe.size1 || 1;
                  let shapeH = aoe.size1 || 1;
                  if (aoe.shape === 'circle') {
                    shapeW = (aoe.size1 || 1) * 2;
                    shapeH = (aoe.size1 || 1) * 2;
                  } else if (aoe.shape === 'line') {
                    shapeW = aoe.size1 || 1;
                    shapeH = aoe.size2 || 1;
                  }
                  const maxDim = Math.max(shapeW, shapeH);
                  const miniCell = maxDim > 0 ? (50 / maxDim) : 10;
                  
                  const r = aoe.rotation || 0;
                  let svgContent = null;
                  let w = miniCell, h = miniCell;
                  let transformOrigin = 'center';
                  
                  if (aoe.shape === 'circle') {
                    const radPx = aoe.size1 * miniCell;
                    w = radPx * 2; h = radPx * 2;
                    svgContent = <circle cx={radPx} cy={radPx} r={radPx} fill={aoe.color} fillOpacity={0.6} stroke={aoe.color} strokeWidth={1} />;
                  } else if (aoe.shape === 'line') {
                    w = aoe.size1 * miniCell; h = aoe.size2 * miniCell;
                    svgContent = <rect x={0} y={0} width={w} height={h} fill={aoe.color} fillOpacity={0.6} stroke={aoe.color} strokeWidth={1} />;
                  } else if (aoe.shape === 'cone') {
                    w = aoe.size1 * miniCell; h = w;
                    svgContent = <polygon points={`0,${h/2} ${w},0 ${w},${h}`} fill={aoe.color} fillOpacity={0.6} stroke={aoe.color} strokeWidth={1} strokeLinejoin="round" />;
                  } else if (aoe.shape === 'cube') {
                    w = aoe.size1 * miniCell; h = w;
                    svgContent = <rect x={0} y={0} width={w} height={h} fill={aoe.color} fillOpacity={0.6} stroke={aoe.color} strokeWidth={1} />;
                  }
                  
                  return (
                    <div style={{ position: 'relative', width: w, height: h, transform: `rotate(${r}deg)`, transformOrigin }}>
                      <svg width={w} height={h} style={{ overflow: 'visible' }}>
                        {svgContent}
                      </svg>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>COLOR DEL ÁREA</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['#ef4444', '#3b82f6', '#10b981', '#ecc94b', '#a855f7', '#ec4899', '#f97316', '#64748b'].map(color => (
                  <div
                    key={color}
                    onClick={() => {
                      setSelectedAoeToken({...selectedAoeToken, aoeData: {...selectedAoeToken.aoeData, color}});
                      socket.emit('token:update-aoe', { tokenId: selectedAoeToken.instanceId, aoeData: {...selectedAoeToken.aoeData, color} });
                    }}
                    style={{ width: '30px', height: '30px', borderRadius: '50%', background: color, cursor: 'pointer', border: selectedAoeToken.aoeData?.color === color ? '3px solid white' : '1px solid rgba(255,255,255,0.3)', transform: selectedAoeToken.aoeData?.color === color ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.1s' }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <button
                onClick={() => {
                  socket.emit('token:remove', selectedAoeToken.instanceId);
                  setSelectedAoeToken(null);
                }}
                className="font-cinzel"
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--combat-red)', border: '1px solid var(--combat-red)', padding: '10px 15px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}
              >
                ELIMINAR ÁREA
              </button>
              <button onClick={() => setSelectedAoeToken(null)} className="font-cinzel" style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>LISTO</button>
            </div>
          </div>
        </div>
      )}

      {isCreatingChest && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={() => setIsCreatingChest(false)}>
          <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '400px', padding: '30px', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
            <h3 className="font-cinzel" style={{ margin: '0 0 20px 0', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}><Box className="w-5 h-5 inline-block mr-2" /> CREAR COFRE</h3>
            <form onSubmit={handleCreateChestSubmit}>
              <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>CONTRASEÑA DEL COFRE</label>
              <input
                type="text"
                value={chestPassword}
                onChange={e => setChestPassword(e.target.value)}
                placeholder="Ingresa una contraseña..."
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  color: 'white',
                  padding: '12px',
                  width: '100%',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  fontSize: '1rem',
                  outline: 'none',
                  marginBottom: '20px'
                }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsCreatingChest(false)} className="font-cinzel" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Cancelar</button>
                <button type="submit" className="font-cinzel torch-glow" style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>COLOCAR</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSelectingCompendiumItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={() => setIsSelectingCompendiumItem(false)}>
          <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '500px', height: '600px', display: 'flex', flexDirection: 'column', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '25px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 className="font-cinzel" style={{ margin: '0 0 15px 0', color: 'var(--accent-gold)' }}>⚔️ SELECCIONAR OBJETO</h3>
              <input
                type="text"
                value={itemSearchQuery}
                onChange={e => setItemSearchQuery(e.target.value)}
                placeholder="🔍 Buscar objeto en el compendio..."
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  color: 'white',
                  padding: '12px',
                  width: '100%',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(compendium || [])
                .filter((item: any) => item.type === 'item' && item.name?.toLowerCase().includes(itemSearchQuery.toLowerCase()))
                .slice(0, 50)
                .map((item: any) => {
                  let itemData: any = {};
                  try {
                    itemData = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
                  } catch { itemData = item.data || {}; }
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSpawnItem(item)}
                      style={{
                        padding: '12px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'border-color 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 'bold', color: 'white' }}>{item.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{itemData.rarity || 'Común'}</span>
                      </div>
                      <span style={{ fontSize: '1.2rem' }}>+</span>
                    </div>
                  );
                })}
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsSelectingCompendiumItem(false)} className="font-cinzel" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {passwordPromptChest && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={() => setPasswordPromptChest(null)}>
          <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '400px', padding: '30px', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
            <h3 className="font-cinzel" style={{ margin: '0 0 20px 0', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}><Lock className="w-5 h-5 inline-block mr-2" /> COFRE CERRADO</h3>
            <form onSubmit={handleVerifyPasswordSubmit}>
              <p style={{ color: 'var(--text-parchment)', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 20px 0' }}>Este cofre está cerrado bajo contraseña. Para abrirlo y tomar su botín debes ingresar la contraseña establecida por el DM.</p>
              <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>CONTRASEÑA</label>
              <input
                type="text"
                value={enteredPassword}
                onChange={e => setEnteredPassword(e.target.value)}
                placeholder="Ingresa la contraseña del cofre..."
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  color: 'white',
                  padding: '12px',
                  width: '100%',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  fontSize: '1rem',
                  outline: 'none',
                  marginBottom: '10px'
                }}
              />
              {passwordError && <p style={{ color: 'var(--combat-red)', fontSize: '0.8rem', margin: '0 0 20px 0', fontWeight: 'bold' }}>⚠️ {passwordError}</p>}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: passwordError ? '0' : '20px' }}>
                <button type="button" onClick={() => setPasswordPromptChest(null)} className="font-cinzel" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Cancelar</button>
                <button type="submit" className="font-cinzel torch-glow" style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>ABRIR</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedChestToken && (() => {
        const activeChest = boardTokens.find((t: any) => t.instanceId === selectedChestToken.instanceId);
        if (!activeChest) return null;
        
        const isDM = userRole === 'dm' || userRole === 'admin';
        const coins = activeChest.chestData?.coins || { pc: 0, pl: 0, el: 0, po: 0, pt: 0 };
        const slots = activeChest.chestData?.slots || Array(9).fill(null);

        const handleUpdateCoins = (key: string, value: number) => {
          const newCoins = { ...coins, [key]: Math.max(0, value) };
          socket.emit('token:update-chest', {
            tokenId: activeChest.instanceId,
            chestData: { coins: newCoins }
          });
        };

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }} onClick={() => setSelectedChestToken(null)}>
            <div className="clipped-frame" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 0 50px rgba(0,0,0,0.9)', border: '2px solid var(--accent-gold)' }} onClick={e => e.stopPropagation()}>
              
              {/* HEADER */}
              <div style={{ padding: '25px 30px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '20px', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ width: '60px', height: '60px', border: '2px solid var(--accent-gold)', overflow: 'hidden', flexShrink: 0, background: 'rgba(0,0,0,0.4)', padding: '5px' }}>
                  <OpenChestIcon />
                </div>
                <div style={{ flex: 1 }}>
                  <h2 className="font-cinzel" style={{ margin: 0, fontSize: '1.8rem', color: 'var(--accent-gold)' }}>INVENTARIO DEL COFRE</h2>
                  <p className="font-cinzel" style={{ margin: '4px 0 0 0', color: 'var(--text-parchment)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {isDM ? 'Panel del DM • Sin Contraseña' : 'Abierto • Contraseña Correcta'}
                  </p>
                </div>
                {isDM && (
                  <button
                    onClick={() => {
                      if (confirm("¿Estás seguro de que deseas eliminar este cofre y todo su contenido de forma permanente?")) {
                        socket.emit('token:remove', activeChest.instanceId);
                        setSelectedChestToken(null);
                      }
                    }}
                    className="font-cinzel"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--combat-red)', border: '1px solid var(--combat-red)', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                  >
                    🗑️ ELIMINAR COFRE
                  </button>
                )}
              </div>

              {/* BODY */}
              <div style={{ padding: '30px', overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', background: 'var(--bg-surface)' }}>
                
                {/* Lado Izquierdo: Slots 3x3 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 15px 0', fontSize: '1rem', letterSpacing: '1.5px', textTransform: 'uppercase', alignSelf: 'flex-start' }}><Box className="w-4 h-4 inline-block mr-2" /> Compartimentos (3x3)</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', width: 'fit-content' }}>
                    {slots.map((slot: any, idx: number) => {
                      let tagColor = 'var(--text-secondary)';
                      if (slot) {
                        const rarity = String(slot.rarity || 'Común');
                        const r = rarity.toLowerCase();
                        if (r.includes('raro') || r.includes('rare')) {
                          tagColor = r.includes('muy') ? '#a855f7' : '#3b82f6';
                        } else if (r.includes('legend')) {
                          tagColor = '#f59e0b';
                        } else if (r.includes('poco')) {
                          tagColor = '#10b981';
                        }
                      }

                      return (
                        <div
                          key={idx}
                          onClick={() => handleChestSlotClick(idx)}
                          style={{
                            width: '85px',
                            height: '85px',
                            background: slot ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.4)',
                            border: slot ? `1.5px solid ${tagColor}` : '1.5px dashed var(--border-color)',
                            borderRadius: '6px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            cursor: isDM ? 'pointer' : 'default',
                            overflow: 'hidden',
                            padding: '6px',
                            boxSizing: 'border-box',
                            textAlign: 'center',
                            transition: 'all 0.2s'
                          }}
                          className={isDM && !slot ? 'torch-glow' : ''}
                          onMouseEnter={e => {
                            if (isDM) {
                              e.currentTarget.style.borderColor = 'var(--accent-gold)';
                              e.currentTarget.style.background = 'rgba(200, 135, 42, 0.05)';
                            }
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = slot ? tagColor : '1.5px dashed var(--border-color)';
                            e.currentTarget.style.background = slot ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.4)';
                          }}
                        >
                          {slot ? (
                            <>
                              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'white', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word', lineHeight: '1.2' }}>{slot.name}</span>
                              <span style={{ fontSize: '0.6rem', color: tagColor, textTransform: 'uppercase', marginTop: '4px', fontWeight: 'bold', letterSpacing: '0.5px' }}>{slot.rarity}</span>
                              {!isDM && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLootItemClick(idx);
                                  }}
                                  className="font-cinzel"
                                  style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    width: '100%',
                                    background: 'var(--accent-gold)',
                                    color: '#000',
                                    border: 'none',
                                    padding: '2px 0',
                                    fontSize: '0.65rem',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    opacity: 0.9
                                  }}
                                >
                                  TOMAR
                                </button>
                              )}
                            </>
                          ) : (
                            <span style={{ fontSize: '1.5rem', color: 'var(--text-secondary)', opacity: 0.4 }}>{isDM ? '+' : ''}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lado Derecho: Monedas */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 15px 0', fontSize: '1rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}><Coins className="w-4 h-4 inline-block mr-2" /> Monedas en el cofre</h4>
                  
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px', flex: 1, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { key: 'po', label: 'Oro (po)', color: '#ecc94b' },
                        { key: 'pt', label: 'Platino (pt)', color: '#a0aec0' },
                        { key: 'pl', label: 'Plata (pl)', color: '#cbd5e0' },
                        { key: 'pc', label: 'Cobre (pc)', color: '#b7791f' },
                        { key: 'el', label: 'Electrum (el)', color: '#319795' }
                      ].map(coin => (
                        <div key={coin.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.9rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: coin.color, display: 'inline-block' }} />
                            {coin.label}
                          </span>
                          
                          {isDM ? (
                            <input
                              type="number"
                              min="0"
                              value={coins[coin.key] || 0}
                              onChange={e => handleUpdateCoins(coin.key, parseInt(e.target.value) || 0)}
                              style={{
                                background: 'var(--bg-base)',
                                border: '1px solid var(--border-color)',
                                color: 'white',
                                padding: '6px 10px',
                                width: '80px',
                                borderRadius: '4px',
                                outline: 'none',
                                textAlign: 'right',
                                boxSizing: 'border-box'
                              }}
                            />
                          ) : (
                            <span className="mono" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: coin.color }}>{coins[coin.key] || 0}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {!isDM && (
                      <button
                        onClick={handleLootAllCoins}
                        className="font-cinzel torch-glow"
                        style={{
                          background: 'var(--accent-gold)',
                          color: '#000',
                          border: 'none',
                          padding: '12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '0.85rem',
                          marginTop: '20px',
                          width: '100%'
                        }}
                      >
                        <Coins className="w-4 h-4 inline-block mr-1" /> TOMAR TODAS LAS MONEDAS
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* FOOTER */}
              <div style={{ padding: '20px 30px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.2)' }}>
                <button onClick={() => setSelectedChestToken(null)} className="font-cinzel" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 25px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>CERRAR COFRE</button>
              </div>

            </div>
          </div>
        );
      })()}

      {compendiumSlotIndex !== null && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10002 }} onClick={() => setCompendiumSlotIndex(null)}>
          <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '500px', height: '550px', display: 'flex', flexDirection: 'column', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '25px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 className="font-cinzel" style={{ margin: '0 0 15px 0', color: 'var(--accent-gold)' }}><Box className="w-5 h-5 inline-block mr-2" /> CARGAR OBJETO A COFRE</h3>
              <input
                type="text"
                value={itemSearchQuery}
                onChange={e => setItemSearchQuery(e.target.value)}
                placeholder="🔍 Buscar objeto en el compendio..."
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  color: 'white',
                  padding: '12px',
                  width: '100%',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(compendium || [])
                .filter((item: any) => item.type === 'item' && item.name?.toLowerCase().includes(itemSearchQuery.toLowerCase()))
                .slice(0, 50)
                .map((item: any) => {
                  let itemData: any = {};
                  try {
                    itemData = typeof item.data === 'string' ? JSON.parse(item.data) : item.data;
                  } catch { itemData = item.data || {}; }
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItemForSlot(item)}
                      style={{
                        padding: '12px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'border-color 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 'bold', color: 'white' }}>{item.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{itemData.rarity || 'Común'}</span>
                      </div>
                      <span style={{ fontSize: '1.2rem' }}>+</span>
                    </div>
                  );
                })}
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setCompendiumSlotIndex(null)} className="font-cinzel" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {isCreatingNote && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={() => setIsCreatingNote(false)}>
          <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '450px', padding: '30px', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
            <h3 className="font-cinzel" style={{ margin: '0 0 20px 0', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}><StickyNote className="w-5 h-5 inline-block mr-2" /> CREAR NOTA EN MAPA</h3>
            <form onSubmit={handleCreateNoteSubmit}>
              <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>CONTENIDO DE LA NOTA</label>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Escribe el texto de la nota aquí..."
                rows={5}
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-color)',
                  color: 'white',
                  padding: '12px',
                  width: '100%',
                  borderRadius: '4px',
                  boxSizing: 'border-box',
                  fontSize: '0.95rem',
                  outline: 'none',
                  marginBottom: '20px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsCreatingNote(false)} className="font-cinzel" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Cancelar</button>
                <button type="submit" className="font-cinzel torch-glow" style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>COLOCAR</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCreatingImage && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={() => setIsCreatingImage(false)}>
          <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '450px', padding: '30px', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
            <h3 className="font-cinzel" style={{ margin: '0 0 20px 0', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>🖼️ COLOCAR IMAGEN</h3>
            <form onSubmit={handleCreateImageSubmit}>
              <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>CARGAR ARCHIVO DE IMAGEN</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                style={{
                  color: 'white',
                  marginBottom: '20px',
                  fontSize: '0.9rem'
                }}
              />
              {imageUrlInput && (
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>VISTA PREVIA</span>
                  <img src={imageUrlInput} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsCreatingImage(false)} className="font-cinzel" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Cancelar</button>
                <button type="submit" className="font-cinzel torch-glow" style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px', opacity: imageUrlInput ? 1 : 0.5 }} disabled={!imageUrlInput}>COLOCAR</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedNoteToken && (() => {
        const activeNote = boardTokens.find((t: any) => t.instanceId === selectedNoteToken.instanceId);
        if (!activeNote) return null;
        const isDM = userRole === 'dm' || userRole === 'admin';
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }} onClick={() => setSelectedNoteToken(null)}>
            <div className="clipped-frame" style={{ width: '100%', maxWidth: '500px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 0 50px rgba(0,0,0,0.9)', border: '2px solid var(--accent-gold)' }} onClick={e => e.stopPropagation()}>
              {/* HEADER */}
              <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ width: '40px', height: '40px', border: '1.5px solid var(--accent-gold)', flexShrink: 0, padding: '3px', background: 'rgba(0,0,0,0.3)' }}>
                  <NoteTokenIcon />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 className="font-cinzel" style={{ margin: 0, fontSize: '1.4rem', color: 'var(--accent-gold)' }}>NOTA DEL MAPA</h3>
                </div>
                {isDM && (
                  <button
                    onClick={() => {
                      if (confirm("¿Eliminar esta nota permanentemente?")) {
                        socket.emit('token:remove', activeNote.instanceId);
                        setSelectedNoteToken(null);
                      }
                    }}
                    className="font-cinzel"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--combat-red)', border: '1px solid var(--combat-red)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}
                  >
                    🗑️ ELIMINAR
                  </button>
                )}
              </div>

              {/* BODY */}
              <div style={{ padding: '30px', overflowY: 'auto', background: 'var(--bg-surface)' }}>
                <div style={{ color: 'var(--text-parchment)', fontSize: '1.05rem', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontFamily: 'serif', padding: '15px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                  {activeNote.noteData?.text || 'Esta nota está vacía.'}
                </div>
              </div>

              {/* FOOTER */}
              <div style={{ padding: '15px 25px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.2)' }}>
                <button onClick={() => setSelectedNoteToken(null)} className="font-cinzel" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '8px 20px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>CERRAR</button>
              </div>
            </div>
          </div>
        );
      })()}

      {selectedImageToken && (() => {
        const activeImage = boardTokens.find((t: any) => t.instanceId === selectedImageToken.instanceId);
        if (!activeImage) return null;
        const isDM = userRole === 'dm' || userRole === 'admin';
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }} onClick={() => setSelectedImageToken(null)}>
            <div className="clipped-frame" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 0 50px rgba(0,0,0,0.9)', border: '2px solid var(--accent-gold)' }} onClick={e => e.stopPropagation()}>
              {/* HEADER */}
              <div style={{ padding: '20px 25px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '15px', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ width: '40px', height: '40px', border: '1.5px solid var(--accent-gold)', flexShrink: 0, padding: '3px', background: 'rgba(0,0,0,0.3)' }}>
                  <ImageTokenIcon />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 className="font-cinzel" style={{ margin: 0, fontSize: '1.4rem', color: 'var(--accent-gold)' }}>IMAGEN EN MAPA</h3>
                </div>
                {isDM && (
                  <button
                    onClick={() => {
                      if (confirm("¿Eliminar esta imagen del mapa?")) {
                        socket.emit('token:remove', activeImage.instanceId);
                        setSelectedImageToken(null);
                      }
                    }}
                    className="font-cinzel"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--combat-red)', border: '1px solid var(--combat-red)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}
                  >
                    🗑️ ELIMINAR
                  </button>
                )}
              </div>

              {/* BODY */}
              <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-surface)' }}>
                {activeImage.imageData?.url ? (
                  <img src={activeImage.imageData.url} alt="Image map content" style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} />
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>No hay ninguna imagen cargada.</p>
                )}
              </div>

              {/* FOOTER */}
              <div style={{ padding: '15px 25px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.2)' }}>
                <button onClick={() => setSelectedImageToken(null)} className="font-cinzel" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '8px 20px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>CERRAR</button>
              </div>
            </div>
          </div>
        );
      })()}

      {selectedItemToken && (() => {
        const item = selectedItemToken.itemData;
        if (!item) return null;
        
        const isDM = userRole === 'dm' || userRole === 'admin';
        const myChars = characters.filter((c: any) => userRole === 'dm' || c.owner === currentUser.name);

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }} onClick={() => setSelectedItemToken(null)}>
            <div className="clipped-frame" style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 0 50px rgba(0,0,0,0.9)', border: '2px solid var(--accent-gold)' }} onClick={e => e.stopPropagation()}>
              
              {/* HEADER */}
              <div style={{ padding: '25px 30px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '20px', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ width: '50px', height: '50px', border: '2px solid var(--accent-gold)', overflow: 'hidden', flexShrink: 0, background: 'rgba(0,0,0,0.4)', padding: '5px' }}>
                  {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ItemDropIcon rarity={item.rarity || 'Común'} />}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 className="font-cinzel" style={{ margin: 0, fontSize: '1.6rem', color: 'var(--accent-gold)' }}>{item.name}</h2>
                  <p className="font-cinzel" style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Objeto en el suelo • {item.rarity}
                  </p>
                </div>
                {isDM && (
                  <button
                    onClick={() => {
                      socket.emit('token:remove', selectedItemToken.instanceId);
                      setSelectedItemToken(null);
                    }}
                    className="font-cinzel"
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--combat-red)', border: '1px solid var(--combat-red)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}
                  >
                    🗑️ ELIMINAR
                  </button>
                )}
              </div>

              {/* BODY */}
              <div style={{ padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--bg-surface)' }}>
                <div>
                  <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '10px', fontSize: '0.9rem' }}><StickyNote className="w-4 h-4 inline-block mr-2" /> DESCRIPCIÓN</h4>
                  <p style={{ color: 'var(--text-parchment)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {item.description || 'Sin descripción disponible.'}
                  </p>
                </div>
                
                {myChars.length > 0 && (
                  <div style={{ marginTop: '10px', background: 'rgba(0,0,0,0.2)', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: '0 0 4px 0', fontSize: '0.9rem' }}><Backpack className="w-4 h-4 inline-block mr-2" /> RECOGER OBJETO</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>Se agregará directamente a tu inventario y desaparecerá del mapa.</p>
                    </div>
                    
                    <button
                      onClick={handlePickupFloorItem}
                      className="font-cinzel torch-glow"
                      style={{
                        background: 'var(--accent-gold)',
                        color: '#000',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.85rem'
                      }}
                    >
                      RECOGER
                    </button>
                  </div>
                )}
              </div>

              {/* FOOTER */}
              <div style={{ padding: '20px 30px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.2)' }}>
                <button onClick={() => setSelectedItemToken(null)} className="font-cinzel" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>CERRAR</button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* MODAL DE VIDA Y CONDICION */}
      {healthModalToken && (() => {
        const SPELLCASTING_CLASSES = ['Brujo', 'Bardo', 'Paladín', 'Mago', 'Hechicero', 'Druida', 'Clérigo'];
        const SPELL_SLOTS_TABLE: Record<number, number[]> = {
          1:[2,0,0,0,0,0,0,0,0], 2:[3,0,0,0,0,0,0,0,0], 3:[4,2,0,0,0,0,0,0,0], 4:[4,3,0,0,0,0,0,0,0],
          5:[4,3,2,0,0,0,0,0,0], 6:[4,3,3,0,0,0,0,0,0], 7:[4,3,3,1,0,0,0,0,0], 8:[4,3,3,2,0,0,0,0,0],
          9:[4,3,3,3,1,0,0,0,0], 10:[4,3,3,3,2,0,0,0,0], 11:[4,3,3,3,2,1,0,0,0], 12:[4,3,3,3,2,1,0,0,0],
          13:[4,3,3,3,2,1,1,0,0], 14:[4,3,3,3,2,1,1,0,0], 15:[4,3,3,3,2,1,1,1,0], 16:[4,3,3,3,2,1,1,1,0],
          17:[4,3,3,3,2,1,1,1,1], 18:[4,3,3,3,3,1,1,1,1], 19:[4,3,3,3,3,2,1,1,1], 20:[4,3,3,3,3,2,2,1,1],
        };
        const charSource = healthModalToken.type === 'character'
          ? characters.find((c: any) => c.id === healthModalToken.originalId)
          : null;
        let parsedInv: any = {};
        if (charSource?.inventory) {
          try {
            let tmp = charSource.inventory;
            if (typeof tmp === 'string') tmp = JSON.parse(tmp);
            if (typeof tmp === 'string') tmp = JSON.parse(tmp);
            parsedInv = tmp || {};
          } catch {}
        }
        let isSpellcaster = false;
        let charLevel = 1;
        if (charSource) {
          charLevel = charSource.level || 1;
          try {
            const cls = typeof charSource.class === 'string' ? JSON.parse(charSource.class) : charSource.class;
            isSpellcaster = Object.keys(cls || {}).some((c: string) => SPELLCASTING_CLASSES.includes(c));
          } catch { isSpellcaster = SPELLCASTING_CLASSES.includes(charSource.class || ''); }
          // Also treat as spellcaster if they have stored spell slots
          if (!isSpellcaster && parsedInv?.slots && Object.keys(parsedInv.slots).length > 0) isSpellcaster = true;
        }
        const rawSpellSlots = parsedInv?.slots || {};
        const spellSlotsUsed: Record<number, number> = {};
        Object.entries(rawSpellSlots).forEach(([lvl, data]: [string, any]) => {
          spellSlotsUsed[parseInt(lvl)] = parseInt(data?.used) || 0;
        });
        const effectiveUsed: Record<number, number> = { ...spellSlotsUsed, ...(healthModalToken._spellSlotsUsed || {}) };
        const slotTable = SPELL_SLOTS_TABLE[Math.min(charLevel, 20)] || SPELL_SLOTS_TABLE[1];
        const handleSpellSlotToggle = (level: number, slotIndex: number) => {
          if (!charSource) return;
          const maxForLevel = slotTable[level - 1];
          const currentUsed = effectiveUsed[level] || 0;
          const newUsed = Math.min(slotIndex < currentUsed ? slotIndex : slotIndex + 1, maxForLevel);
          const newRawSlots = { ...rawSpellSlots, [level]: { max: maxForLevel, used: newUsed } };
          const newInv = { ...parsedInv, slots: newRawSlots };
          socket.emit('character:update', { ...charSource, inventory: JSON.stringify(newInv) });
          setHealthModalToken({ ...healthModalToken, _spellSlotsUsed: { ...(healthModalToken._spellSlotsUsed || {}), [level]: newUsed } });
        };
        const hpPct = Math.min(100, (healthModalToken.hp / Math.max(1, healthModalToken.max_hp)) * 100);
        const tmpPct = Math.min(100, ((healthModalToken.tempHp || 0) / Math.max(1, healthModalToken.max_hp)) * 100);
        const hpColor = hpPct > 60 ? '#22c55e' : hpPct > 30 ? '#f59e0b' : '#ef4444';
        return (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001, backdropFilter: 'blur(4px)' }} onClick={() => setHealthModalToken(null)}>
            <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '560px', padding: '28px 32px', boxShadow: '0 0 80px rgba(0,0,0,0.95), 0 0 40px rgba(200,135,42,0.15)', animation: 'healthModalIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both' }} onClick={e => e.stopPropagation()}>

              {/* HEADER */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', border: '2px solid var(--accent-gold)', flexShrink: 0, background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {healthModalToken.image ? <img src={healthModalToken.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '1.4rem' }}>{healthModalToken.type === 'character' ? <User className="w-6 h-6 m-auto" /> : <Ghost className="w-6 h-6 m-auto" />}</span>}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="font-cinzel" style={{ color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '1rem' }}>{healthModalToken.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {healthModalToken.type === 'character' ? 'Héroe' : 'Criatura'} · {(healthModalToken.tempHp || 0) > 0 ? `${healthModalToken.tempHp} temp. HP` : 'Sin temp HP'}
                  </div>
                </div>
                <button onClick={() => setHealthModalToken(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.6rem', cursor: 'pointer', lineHeight: 1, padding: '4px' }}>✕</button>
              </div>

              {/* HEALTH BAR */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span className="font-cinzel" style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', letterSpacing: '1.5px' }}>PUNTOS DE GOLPE</span>
                  <span className="mono" style={{ color: 'white', fontWeight: 'bold' }}>
                    {healthModalToken.hp} <span style={{ color: 'var(--text-secondary)' }}>/ {healthModalToken.max_hp}</span>
                    {(healthModalToken.tempHp || 0) > 0 && <span style={{ color: '#60a5fa', marginLeft: '6px' }}>+{healthModalToken.tempHp}</span>}
                  </span>
                </div>
                <div style={{ width: '100%', height: '16px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', position: 'relative' }}>
                  <div style={{ height: '100%', width: `${hpPct}%`, background: `linear-gradient(90deg, ${hpColor}cc, ${hpColor})`, borderRadius: '8px', transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1), background 0.4s ease', boxShadow: `0 0 10px ${hpColor}80` }} />
                  {(healthModalToken.tempHp || 0) > 0 && (
                    <div style={{ position: 'absolute', top: 0, right: 0, height: '100%', width: `${tmpPct}%`, background: 'linear-gradient(90deg, rgba(96,165,250,0.4), rgba(96,165,250,0.8))', borderRadius: '0 8px 8px 0', transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)' }} />
                  )}
                </div>
              </div>

              {/* INPUT + 3 BUTTONS ROW */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
                <input
                  type="number"
                  min="0"
                  value={healthInput}
                  onChange={e => setHealthInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const amt = parseInt(healthInput) || 0;
                      if (amt > 0) {
                        const newHp = Math.min(healthModalToken.max_hp, healthModalToken.hp + amt);
                        socket.emit('token:update-combat-state', { tokenId: healthModalToken.instanceId, hp: newHp });
                        setHealthModalToken({ ...healthModalToken, hp: newHp });
                        setHealthInput('');
                      }
                    }
                  }}
                  placeholder="Cantidad..."
                  style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '9px 14px', borderRadius: '6px', outline: 'none', fontSize: '1rem', fontFamily: 'monospace', fontWeight: 'bold', textAlign: 'center', boxSizing: 'border-box' }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      const amt = parseInt(healthInput) || 0;
                      if (amt > 0) {
                        const newHp = Math.min(healthModalToken.max_hp, healthModalToken.hp + amt);
                        socket.emit('token:update-combat-state', { tokenId: healthModalToken.instanceId, hp: newHp });
                        setHealthModalToken({ ...healthModalToken, hp: newHp });
                        setHealthInput('');
                      }
                    }}
                    className="font-cinzel"
                    style={{ flex: 1, background: '#16a34a', color: 'white', border: 'none', padding: '9px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.72rem', letterSpacing: '0.5px', transition: 'filter 0.15s, transform 0.1s', boxShadow: '0 2px 8px rgba(22,163,74,0.35)' }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  >+ CURAR</button>
                  <button
                    onClick={() => {
                      let amt = parseInt(healthInput) || 0;
                      if (amt > 0) {
                        let tempLeft = healthModalToken.tempHp || 0;
                        let realHp = healthModalToken.hp;
                        if (tempLeft >= amt) { tempLeft -= amt; }
                        else { amt -= tempLeft; tempLeft = 0; realHp = Math.max(0, realHp - amt); }
                        socket.emit('token:update-combat-state', { tokenId: healthModalToken.instanceId, hp: realHp, tempHp: tempLeft });
                        setHealthModalToken({ ...healthModalToken, hp: realHp, tempHp: tempLeft });
                        setHealthInput('');
                      }
                    }}
                    className="font-cinzel"
                    style={{ flex: 1, background: '#dc2626', color: 'white', border: 'none', padding: '9px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.72rem', letterSpacing: '0.5px', transition: 'filter 0.15s, transform 0.1s', boxShadow: '0 2px 8px rgba(220,38,38,0.35)' }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  >− DAÑO</button>
                  <button
                    onClick={() => {
                      const amt = parseInt(healthInput) || 0;
                      const newTemp = Math.max(0, (healthModalToken.tempHp || 0) + amt);
                      socket.emit('token:update-combat-state', { tokenId: healthModalToken.instanceId, tempHp: newTemp });
                      setHealthModalToken({ ...healthModalToken, tempHp: newTemp });
                      setHealthInput('');
                    }}
                    className="font-cinzel"
                    style={{ flex: 1, background: '#475569', color: 'white', border: 'none', padding: '9px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.72rem', letterSpacing: '0.5px', transition: 'filter 0.15s, transform 0.1s', boxShadow: '0 2px 8px rgba(71,85,105,0.35)' }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.2)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  >TEMP</button>
                </div>
              </div>

              {/* ESTADO / CONDICION */}
              <div style={{ marginBottom: isSpellcaster ? '18px' : '0' }}>
                <div className="font-cinzel" style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', letterSpacing: '1.5px', marginBottom: '8px' }}>ESTADO</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {['', '😵', '😨', '🔥', '❄️', '💤', '🛡️', '⚡', '🤢', '😡', '🤸'].map(emo => (
                    <button
                      key={emo || 'none'}
                      onClick={() => setConditionInput(emo)}
                      title={emo || 'Sin estado'}
                      style={{ width: '34px', height: '34px', borderRadius: '6px', background: conditionInput === emo ? 'rgba(200,135,42,0.25)' : 'var(--bg-base)', border: conditionInput === emo ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)', cursor: 'pointer', fontSize: '1.2rem', padding: 0, transition: 'all 0.15s', boxShadow: conditionInput === emo ? '0 0 8px rgba(200,135,42,0.4)' : 'none' }}
                    >{renderConditionIcon(emo)}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={conditionInput}
                    onChange={e => setConditionInput(e.target.value)}
                    placeholder="Emoji o texto corto..."
                    maxLength={5}
                    style={{ flex: 1, background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '8px 12px', borderRadius: '6px', outline: 'none' }}
                  />
                  <button
                    onClick={() => {
                      socket.emit('token:update-combat-state', { tokenId: healthModalToken.instanceId, condition: conditionInput || null });
                      setHealthModalToken({ ...healthModalToken, condition: conditionInput || null });
                    }}
                    className="font-cinzel"
                    style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                  >APLICAR</button>
                </div>
              </div>

              {/* SPELL SLOTS */}
              {isSpellcaster && (
                <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                  <div className="font-cinzel" style={{ fontSize: '0.68rem', color: '#a78bfa', letterSpacing: '1.5px', marginBottom: '10px' }}>ESPACIOS DE CONJUROS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {slotTable.map((maxSlots, i) => {
                      const level = i + 1;
                      if (maxSlots === 0) return null;
                      const used = effectiveUsed[level] || 0;
                      return (
                        <div key={level} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="mono" style={{ fontSize: '0.65rem', color: '#a78bfa', width: '24px', flexShrink: 0, textAlign: 'center', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '4px', padding: '2px 0' }}>N{level}</span>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {Array.from({ length: maxSlots }).map((_, si) => {
                              const isSpent = si < used;
                              return (
                                <div
                                  key={si}
                                  onClick={() => handleSpellSlotToggle(level, si)}
                                  title={isSpent ? `Espacio ${si+1} gastado — clic para recuperar` : `Gastar espacio ${si+1}`}
                                  style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${isSpent ? 'rgba(167,139,250,0.25)' : '#a78bfa'}`, background: isSpent ? 'transparent' : 'rgba(167,139,250,0.85)', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: isSpent ? 'none' : '0 0 10px rgba(167,139,250,0.55)', transform: isSpent ? 'scale(0.8)' : 'scale(1)' }}
                                />
                              );
                            })}
                          </div>
                          <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', marginLeft: 'auto', flexShrink: 0 }}>{maxSlots - used}/{maxSlots}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 30px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes healthModalIn {
          from { opacity: 0; transform: scale(0.88) translateY(24px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes tsEntry {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutToRight {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(32px); }
        }
        @keyframes slideInFromLeft {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutToLeft {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-32px); }
        }
      `}</style>
    </>
  );
};
