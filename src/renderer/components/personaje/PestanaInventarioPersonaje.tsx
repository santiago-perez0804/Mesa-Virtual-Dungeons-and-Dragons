
import React from 'react';
import { safeParseStats, safeParseInventory } from '../../utils/personaje';

export const CharacterInventoryTab = ({ character, setActiveSlotIndex }: any) => {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <section>
        <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between' }}>
          SINTONIZACI�N M�GICA
          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{attunedItems} / 3</span>
        </h4>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '10px' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: '30px', height: '30px', borderRadius: '50%', border: `2px solid ${i < attunedItems ? 'var(--gold-primary)' : 'var(--border-color)'}`, background: i < attunedItems ? 'rgba(200,135,42,0.2)' : 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: i < attunedItems ? '0 0 10px rgba(200,135,42,0.5)' : 'none' }}>
              {i < attunedItems && <span style={{ color: 'var(--gold-primary)', fontSize: '14px' }}>?</span>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>INVENTARIO ({currentWeight.toFixed(1)} / {maxWeight.toFixed(1)} kg)</span>
          {overEncumbered && (
            <span style={{ color: 'white', background: 'var(--combat-red)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
              ?? DESVENTAJA
            </span>
          )}
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', maxWidth: '380px' }}>
          {Array.from({ length: 25 }).map((_, i) => {
            if (i >= 20) {
              const coinKeys = ['pc', 'pl', 'el', 'po', 'pt'];
              const coinImages = [
                'https://dndpp-bucket-2026-949753869312-us-east-1-an.s3.us-east-1.amazonaws.com/public/assets/pc_coin_icon.png',
                'https://dndpp-bucket-2026-949753869312-us-east-1-an.s3.us-east-1.amazonaws.com/public/assets/pl_coin_icon.png',
                'https://dndpp-bucket-2026-949753869312-us-east-1-an.s3.us-east-1.amazonaws.com/public/assets/el_coin_icon.png',
                'https://dndpp-bucket-2026-949753869312-us-east-1-an.s3.us-east-1.amazonaws.com/public/assets/po_coin_icon.png',
                'https://dndpp-bucket-2026-949753869312-us-east-1-an.s3.us-east-1.amazonaws.com/public/assets/pt_coin_icon.png'
              ];
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
                      background: 'var(--bg-raised)', 
                      border: '1px solid var(--accent-gold)', 
                      borderRadius: '4px', 
                      position: 'relative', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer', 
                      overflow: 'hidden', 
                      boxShadow: 'inset 0 0 10px rgba(200,135,42,0.1)' 
                    }} 
                    onClick={() => setActiveSlotIndex(i)}
                    title={`Editar monedas de ${coinKey.toUpperCase()}`}
                  >
                    <img src={coinImg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={coinKey} />
                    <div 
                      className="mono" 
                      style={{ 
                        position: 'absolute', 
                        bottom: '2px', 
                        right: '4px', 
                        fontSize: '9px', 
                        color: 'white', 
                        background: 'rgba(100, 70, 15, 0.9)', 
                        padding: '1px 4px',
                        borderRadius: '3px',
                        border: '1px solid var(--accent-gold)',
                        fontWeight: 'bold',
                        textShadow: '0 1px 2px black' 
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

            const item = slots[i];
            return (
              <div key={i} style={{ aspectRatio: '1/1', background: 'var(--bg-raised)', border: `1px solid ${item?.isAttuned ? 'var(--gold-primary)' : 'var(--border-color)'}`, borderRadius: '4px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', boxShadow: item?.isAttuned ? 'inset 0 0 10px rgba(200,135,42,0.3)' : 'none' }} onClick={() => setActiveSlotIndex(i)}>
                {item ? (
                  <>
                    {item.image ? (
                      <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    ) : (
                      <div style={{ fontSize: '1.5rem', opacity: 0.5 }}>{item.type === 'weapon' ? '⚔️' : (item.type === 'armor' ? '🛡️' : '📦')}</div>
                    )}
                    {item.quantity > 1 && (
                      <div className="mono" style={{ position: 'absolute', bottom: '2px', right: '4px', fontSize: '10px', color: 'white', textShadow: '0 0 2px black' }}>x{item.quantity}</div>
                    )}
                    {item.isAttuned && (
                      <div style={{ position: 'absolute', top: '2px', left: '2px', fontSize: '10px' }}>🔮</div>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: '1.5rem', opacity: 0.1 }}>+</div>
                )}
              </div>
            );
          })}
        </div>
      </section>
      
      <section>
        <h4 className="font-cinzel" style={{ color: 'var(--combat-red)', borderBottom: '1px solid rgba(231,76,60,0.3)', paddingBottom: '6px', marginBottom: '15px' }}>ACCIONES Y ATAQUES</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {Object.values(slots).filter((i: any) => i && i.isDamage).length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>No hay armas equipadas.</div>
          ) : (
            Object.values(slots).filter((i: any) => i && i.isDamage).map((weapon: any, idx: number) => {
              return (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(231,76,60,0.05)', border: '1px solid rgba(231,76,60,0.2)', padding: '10px', borderRadius: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '1.2rem' }}>??</div>
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
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
