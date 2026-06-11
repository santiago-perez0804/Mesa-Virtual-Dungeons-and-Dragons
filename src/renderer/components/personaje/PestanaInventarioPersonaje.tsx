
import React from 'react';
import { safeParseStats, safeParseInventory } from '../../utils/personaje';

export const CharacterInventoryTab = ({ character, setActiveSlotIndex }: any) => {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const charStats = safeParseStats(character.stats);
  const charInv = safeParseInventory(character.inventory);

  const fue = charStats.fue || 10;
  const maxWeight = fue * 6.8;
  const slots = charInv.slots || {};
  let currentWeight = 0;
  Object.values(slots).forEach((item: any) => {
    currentWeight += (item.weight || 0) * (item.quantity || 1);
  });
  const coins = charInv.coins || { pc: 0, pl: 0, el: 0, po: 0, pt: 0 };
  const totalCoins = coins.pc + coins.pl + coins.el + coins.po + coins.pt;
  currentWeight += (totalCoins / 100) * 0.9;
  const overEncumbered = currentWeight >= maxWeight * 0.9;

  const attunedItems = Object.values(slots).filter((item: any) => item.isAttuned).length;

  const coinKeys = ['pc', 'pl', 'el', 'po', 'pt'];
  const coinImages = [
    'https://dndpp-bucket-2026-949753869312-us-east-1-an.s3.us-east-1.amazonaws.com/public/assets/pc_coin_icon.png',
    'https://dndpp-bucket-2026-949753869312-us-east-1-an.s3.us-east-1.amazonaws.com/public/assets/pl_coin_icon.png',
    'https://dndpp-bucket-2026-949753869312-us-east-1-an.s3.us-east-1.amazonaws.com/public/assets/el_coin_icon.png',
    'https://dndpp-bucket-2026-949753869312-us-east-1-an.s3.us-east-1.amazonaws.com/public/assets/po_coin_icon.png',
    'https://dndpp-bucket-2026-949753869312-us-east-1-an.s3.us-east-1.amazonaws.com/public/assets/pt_coin_icon.png',
  ];

  return (
    <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', justifyContent: 'flex-start', width: '100%' }}>
      {/* Columna Izquierda: Inventario */}
      <section style={{ flex: '0 0 auto', width: '560px' }}>
        <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '27px', marginTop: 0 }}>
          <span>INVENTARIO ({currentWeight.toFixed(1)} / {maxWeight.toFixed(1)} kg)</span>
          {overEncumbered && (
            <span style={{ color: 'white', background: 'var(--combat-red)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
              ⚠️ DESVENTAJA
            </span>
          )}
        </h4>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', maxWidth: '500px', flex: 1 }}>
            {Array.from({ length: 25 }).map((_, i) => {
              const isHovered = hoveredIndex === i;

              // Coin slots (last 5)
              if (i >= 20) {
                const coinIdx = i - 20;
                const coinKey = coinKeys[coinIdx];
                const coinImg = coinImages[coinIdx];
                const coinQty = coins[coinKey] || 0;

                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div
                      style={{
                        aspectRatio: '1/1',
                        width: '100%',
                        background: 'rgba(20, 16, 12, 0.9)',
                        border: '1px solid var(--accent-gold)',
                        borderRadius: '4px',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        boxShadow: isHovered
                          ? '0 0 8px rgba(200, 135, 42, 0.6), inset 0 0 8px rgba(200, 135, 42, 0.3)'
                          : 'inset 0 0 10px rgba(200,135,42,0.1)',
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => setActiveSlotIndex(i)}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      title={`Editar monedas de ${coinKey.toUpperCase()}`}
                    >
                      <img src={coinImg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={coinKey} />
                      <div
                        className="mono"
                        style={{
                          position: 'absolute',
                          bottom: '3px',
                          right: '5px',
                          fontSize: '13px',
                          color: 'white',
                          background: 'rgba(100, 70, 15, 0.9)',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          border: '1px solid var(--accent-gold)',
                          fontWeight: 'bold',
                          textShadow: '0 1px 2px black',
                          lineHeight: 1.2,
                        }}
                      >
                        {coinQty}
                      </div>
                    </div>
                    <span style={{ fontSize: '9px', color: 'var(--accent-gold)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {coinKey}
                    </span>
                  </div>
                );
              }

              // Regular item slots
              const item = slots[i];

              return (
                <div
                  key={i}
                  style={{
                    aspectRatio: '1/1',
                    background: 'rgba(20, 16, 12, 0.9)',
                    border: isHovered
                      ? '1px solid var(--accent-gold)'
                      : `1px solid ${item?.isAttuned ? 'var(--gold-primary)' : 'var(--border-color)'}`,
                    borderRadius: '4px',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    boxShadow: isHovered
                      ? '0 0 8px rgba(200, 135, 42, 0.5), inset 0 0 8px rgba(200, 135, 42, 0.3)'
                      : item?.isAttuned
                      ? 'inset 0 0 10px rgba(200,135,42,0.3)'
                      : 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => setActiveSlotIndex(i)}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {item ? (
                    <>
                      {item.custom ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4px', gap: '2px' }}>
                          <div style={{ fontSize: '1.1rem' }}>🧪</div>
                          <div style={{ fontSize: '8px', color: 'var(--text-parchment)', textAlign: 'center', lineHeight: 1.2, wordBreak: 'break-word', maxWidth: '100%', padding: '0 2px' }}>
                            {item.name}
                          </div>
                        </div>
                      ) : item.image ? (
                        <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      ) : (
                        <div style={{ fontSize: '1.5rem', opacity: 0.5 }}>
                          {item.type === 'weapon' ? '⚔️' : item.type === 'armor' ? '🛡️' : '📦'}
                        </div>
                      )}
                      {item.quantity > 1 && (
                        <div className="mono" style={{ position: 'absolute', bottom: '2px', right: '4px', fontSize: '10px', color: 'white', textShadow: '0 0 2px black' }}>
                          x{item.quantity}
                        </div>
                      )}
                      {item.isAttuned && (
                        <div style={{ position: 'absolute', top: '2px', left: '2px', fontSize: '10px' }}>🔮</div>
                      )}
                    </>
                  ) : (
                    <div
                      style={{
                        fontSize: '1.5rem',
                        opacity: isHovered ? 0.9 : 0.1,
                        color: isHovered ? 'var(--accent-gold)' : 'inherit',
                        transition: 'all 0.2s ease',
                        textShadow: isHovered ? '0 0 6px var(--accent-gold)' : 'none',
                      }}
                    >
                      +
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Círculos de Sintonización Verticales */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', paddingTop: '5px' }} title={`Sintonización Mágica: ${attunedItems} / 3`}>
            <div style={{ fontSize: '8px', color: 'var(--accent-gold)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', writingMode: 'vertical-lr', marginBottom: '2px', opacity: 0.8 }}>SINT.</div>
            {[0, 1, 2].map(i => (
              <div
                key={i}
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  border: `2px solid ${i < attunedItems ? 'var(--gold-primary)' : 'var(--border-color)'}`,
                  background: i < attunedItems ? 'rgba(200, 135, 42, 0.25)' : 'var(--bg-raised)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: i < attunedItems ? '0 0 8px var(--gold-primary)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {i < attunedItems ? (
                  <span style={{ color: 'var(--gold-primary)', fontSize: '10px', fontWeight: 'bold' }}>🔮</span>
                ) : (
                  <span style={{ color: 'var(--text-secondary)', fontSize: '8px', opacity: 0.3 }}>✦</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Columna Derecha: Acciones y Ataques */}
      <section style={{ flex: '0 0 auto', width: '420px' }}>
        <h4 className="font-cinzel" style={{ color: 'var(--combat-red)', borderBottom: '1px solid rgba(231,76,60,0.3)', paddingBottom: '6px', marginBottom: '15px', height: '27px', marginTop: 0, display: 'flex', alignItems: 'center' }}>ACCIONES Y ATAQUES</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.values(slots).filter((i: any) => i && i.isDamage).length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>No hay armas equipadas.</div>
          ) : (
            Object.values(slots)
              .filter((i: any) => i && i.isDamage)
              .map((weapon: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(231,76,60,0.05)', border: '1px solid rgba(231,76,60,0.2)', padding: '10px', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '1.2rem' }}>⚔️</div>
                    <div>
                      <div className="font-cinzel" style={{ color: 'var(--text-parchment)', fontSize: '0.9rem', fontWeight: 'bold' }}>{weapon.attackName || weapon.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{weapon.range || 'Cuerpo a cuerpo'}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Atk</div>
                      <div className="mono" style={{ fontSize: '14px', color: 'var(--text-parchment)' }}>+{weapon.attackBonus || 0}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Dmg</div>
                      <div className="mono" style={{ fontSize: '14px', color: 'var(--combat-red)' }}>{weapon.damage}</div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </section>
    </div>
  );
};
