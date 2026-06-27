import React from 'react';

interface CharacterSheetInlineModalsProps {
  viewingItemDetail: any;
  setViewingItemDetail: (item: any) => void;
  unequippingSlotIndex: number | null;
  setUnequippingSlotIndex: (idx: number | null) => void;
  unequipQuantity: number;
  setUnequipQuantity: (qty: number) => void;
  isLevelingUp: boolean;
  setIsLevelingUp: (val: boolean) => void;
  levelUpClass: string;
  setLevelUpClass: (val: string) => void;
  handleLevelUp: () => void;
  dbClasses: any[];
  charInv: any;
  compendium: any[];
  socket: any;
  selectedCharacter: any;
  setSelectedCharacter: (c: any) => void;
}

export const CharacterSheetInlineModals: React.FC<CharacterSheetInlineModalsProps> = ({
  viewingItemDetail,
  setViewingItemDetail,
  unequippingSlotIndex,
  setUnequippingSlotIndex,
  unequipQuantity,
  setUnequipQuantity,
  isLevelingUp,
  setIsLevelingUp,
  levelUpClass,
  setLevelUpClass,
  handleLevelUp,
  dbClasses,
  charInv,
  compendium,
  socket,
  selectedCharacter,
  setSelectedCharacter
}) => {
  return (
    <>
      {/* MODAL DE DETALLES DE OBJETO */}
      {viewingItemDetail !== null && (() => {
        const slots = charInv.slots || {};
        const compItem = compendium.find((c: any) => c.id == viewingItemDetail.compId);
        const compData = compItem?.data ? (typeof compItem.data === 'string' ? JSON.parse(compItem.data) : compItem.data) : {};
        const itemDesc = compData?.description || compData?.desc || 'Sin descripción disponible en el compendio.';

        return (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100
          }} onClick={() => setViewingItemDetail(null)}>
            <div
              className="clipped-frame"
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--bg-surface)',
                border: '2px solid var(--accent-gold)',
                padding: '30px',
                width: '100%',
                maxWidth: '500px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                boxShadow: '0 10px 50px rgba(0,0,0,0.9)',
                color: 'var(--text-parchment)',
                position: 'relative'
              }}
            >
              {/* Botón cerrar */}
              <button
                onClick={() => setViewingItemDetail(null)}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '20px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '1.8rem',
                  cursor: 'pointer',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--combat-red)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                ×
              </button>

              <h3 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '1px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                DETALLES DEL OBJETO
              </h3>

              {/* Header con imagen y nombre */}
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div className="clipped-frame" style={{
                  width: '80px',
                  height: '80px',
                  border: '1.5px solid var(--accent-gold)',
                  background: 'rgba(200, 135, 42, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                  flexShrink: 0
                }}>
                  {viewingItemDetail.image ? (
                    <img
                      src={viewingItemDetail.image}
                      alt={viewingItemDetail.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{ color: 'var(--accent-gold)', opacity: 0.5, fontSize: '2rem' }}>?</div>
                  )}
                </div>
                <div>
                  <h4 className="font-cinzel" style={{ margin: '0 0 5px 0', color: 'white', fontSize: '1.2rem' }}>
                    {viewingItemDetail.name}
                  </h4>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Cantidad equipada: <strong style={{ color: 'var(--accent-gold)' }}>{viewingItemDetail.quantity}</strong>
                  </div>
                </div>
              </div>

              {/* Nota Personalizada */}
              {viewingItemDetail.customNote && (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '4px', borderLeft: '3px solid var(--accent-gold)', fontStyle: 'italic', fontSize: '0.9rem', color: '#ccc' }}>
                  "{viewingItemDetail.customNote}"
                </div>
              )}

              {/* Descripción del compendio */}
              <div>
                <h5 className="font-cinzel" style={{ margin: '0 0 8px 0', color: 'var(--accent-gold)', fontSize: '0.9rem' }}>Descripción Original</h5>
                <div style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '15px',
                  borderRadius: '4px',
                  border: '1px solid #333',
                  maxHeight: '150px',
                  overflowY: 'auto',
                  fontSize: '0.85rem',
                  color: '#bbb',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap'
                }}>
                  {itemDesc}
                </div>
              </div>

              {/* Botones */}
              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                <button
                  onClick={() => {
                    setUnequippingSlotIndex(viewingItemDetail.slotIndex);
                    setUnequipQuantity(1);
                    setViewingItemDetail(null);
                  }}
                  className="font-cinzel torch-glow"
                  style={{
                    flex: 1,
                    background: 'var(--accent-gold)',
                    color: 'black',
                    border: 'none',
                    padding: '10px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                  }}
                >
                  MODIFICAR
                </button>
                <button
                  onClick={() => setViewingItemDetail(null)}
                  className="font-cinzel"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    padding: '10px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  CERRAR
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL DE DESEQUIPAR CANTIDAD */}
      {unequippingSlotIndex !== null && (() => {
        const slots = charInv.slots || {};
        const unequippingItem = slots[unequippingSlotIndex];
        if (!unequippingItem) return null;

        return (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100
          }} onClick={() => setUnequippingSlotIndex(null)}>
            <div
              className="clipped-frame"
              onClick={e => e.stopPropagation()}
              style={{
                background: 'var(--bg-surface)',
                border: '2px solid var(--accent-gold)',
                padding: '30px',
                width: '100%',
                maxWidth: '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                boxShadow: '0 10px 50px rgba(0,0,0,0.9)',
                color: 'var(--text-parchment)',
                position: 'relative'
              }}
            >
              {/* Botón cerrar */}
              <button
                onClick={() => setUnequippingSlotIndex(null)}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '20px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '1.8rem',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>

              <h3 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '1px' }}>
                DESEQUIPAR OBJETO
              </h3>

              <div style={{ textAlign: 'center' }}>
                <h4 className="font-cinzel" style={{ margin: 0, color: 'white', fontSize: '1.15rem' }}>
                  {unequippingItem.name}
                </h4>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '5px', display: 'block' }}>
                  Equipados: <strong style={{ color: 'var(--accent-gold)' }}>{unequippingItem.quantity}</strong> unidades
                </span>
              </div>

              {/* Selector numérico */}
              <div>
                <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', display: 'block', marginBottom: '10px', textAlign: 'center', letterSpacing: '0.5px' }}>
                  CANTIDAD A DESEQUIPAR
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'center' }}>
                  <button
                    onClick={() => setUnequipQuantity(Math.max(1, unequipQuantity - 1))}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-color)',
                      color: 'var(--accent-gold)',
                      width: '36px',
                      height: '36px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '1.2rem'
                    }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={unequippingItem.quantity}
                    value={unequipQuantity}
                    onChange={e => {
                      const val = Math.max(1, Math.min(unequippingItem.quantity, parseInt(e.target.value) || 1));
                      setUnequipQuantity(val);
                    }}
                    style={{
                      width: '70px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      color: 'white',
                      textAlign: 'center',
                      fontSize: '1.3rem',
                      padding: '5px 0',
                      outline: 'none',
                      fontWeight: 'bold',
                      fontFamily: 'monospace'
                    }}
                  />
                  <button
                    onClick={() => setUnequipQuantity(Math.min(unequippingItem.quantity, unequipQuantity + 1))}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-color)',
                      color: 'var(--accent-gold)',
                      width: '36px',
                      height: '36px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '1.2rem'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Botones de acción */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => {
                    const newSlots = { ...slots };
                    if (unequipQuantity >= unequippingItem.quantity) {
                      delete newSlots[unequippingSlotIndex];
                    } else {
                      newSlots[unequippingSlotIndex] = {
                        ...unequippingItem,
                        quantity: unequippingItem.quantity - unequipQuantity
                      };
                    }
                    const newInv = {
                      ...charInv,
                      slots: newSlots
                    };
                    const updated = { ...selectedCharacter, inventory: JSON.stringify(newInv) };
                    socket.emit('character:update', updated);
                    setSelectedCharacter(updated);
                    setUnequippingSlotIndex(null);
                  }}
                  className="font-cinzel torch-glow"
                  style={{
                    background: 'var(--accent-gold)',
                    color: 'black',
                    border: 'none',
                    padding: '12px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }}
                >
                  DESEQUIPAR ({unequipQuantity})
                </button>

                <button
                  onClick={() => {
                    const newSlots = { ...slots };
                    delete newSlots[unequippingSlotIndex];
                    const newInv = {
                      ...charInv,
                      slots: newSlots
                    };
                    const updated = { ...selectedCharacter, inventory: JSON.stringify(newInv) };
                    socket.emit('character:update', updated);
                    setSelectedCharacter(updated);
                    setUnequippingSlotIndex(null);
                  }}
                  className="font-cinzel"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid var(--combat-red)',
                    color: 'var(--combat-red)',
                    padding: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }}
                >
                  DESEQUIPAR TODO
                </button>

                <button
                  onClick={() => setUnequippingSlotIndex(null)}
                  className="font-cinzel"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    padding: '10px',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  CANCELAR
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL DE SUBIDA DE NIVEL */}
      {isLevelingUp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100
        }} onClick={() => setIsLevelingUp(false)}>
          <div
            className="clipped-frame"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-surface)',
              border: '2px solid var(--accent-gold)',
              padding: '30px',
              width: '100%',
              maxWidth: '400px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: '0 10px 50px rgba(0,0,0,0.9)',
              color: 'var(--text-parchment)',
              position: 'relative'
            }}
          >
            {/* Botón cerrar */}
            <button
              onClick={() => setIsLevelingUp(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '1.8rem',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--combat-red)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              ×
            </button>

            <h3 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '1px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              ASCENSIÓN DE NIVEL
            </h3>

            <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              ¡Has adquirido suficiente experiencia! Selecciona la clase en la que deseas obtener tu nuevo nivel de poder.
            </div>

            <div>
              <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', display: 'block', marginBottom: '8px' }}>
                CLASE DE ASCENSIÓN
              </label>
              <select
                className="font-cinzel"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'var(--bg-base)',
                  color: 'white',
                  border: '1px solid var(--border-color)',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
                value={levelUpClass}
                onChange={(e) => setLevelUpClass(e.target.value)}
              >
                <option value="">-- ELIGE CLASE --</option>
                {(() => {
                  const classNamesList = dbClasses.map(c => c.name);
                  return classNamesList.map(c => <option key={c} value={c}>{c}</option>);
                })()}
              </select>
            </div>

            {/* Botones de acción */}
            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <button
                onClick={() => {
                  if (!levelUpClass) {
                    alert("Elige una clase para tomar tu nuevo nivel.");
                    return;
                  }
                  handleLevelUp();
                  setIsLevelingUp(false);
                }}
                className="font-cinzel torch-glow"
                style={{
                  flex: 1,
                  background: 'var(--accent-gold)',
                  color: 'black',
                  border: 'none',
                  padding: '12px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.85rem'
                }}
              >
                SUBIR NIVEL
              </button>
              <button
                onClick={() => setIsLevelingUp(false)}
                className="font-cinzel"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '12px',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
