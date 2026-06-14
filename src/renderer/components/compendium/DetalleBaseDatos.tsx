
import { formatDescription } from '../../utils/formateador';
import { Ghost, Scroll, Swords, Link, AlertTriangle, Dna, Languages } from 'lucide-react';
import { typeIcons } from '../VistaCompendio';
export const DatabaseDetail = ({ selectedItem, setSelectedItem, isOverlay, onCloseOverlay, userRole }: any) => {
  const d = selectedItem.data ? (typeof selectedItem.data === 'string' ? JSON.parse(selectedItem.data) : selectedItem.data) : {};
  const isMonster = selectedItem.type === 'monster';
  const cr = d.cr || d.challenge_rating || '�';
  
                return (
                  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '40px' }} onClick={() => { setSelectedItem(null); if (isOverlay && onCloseOverlay) onCloseOverlay(); }}>
                    <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', padding: '40px', boxShadow: '0 0 100px rgba(0,0,0,1)' }} onClick={e => e.stopPropagation()}>
                      {isMonster ? (() => {
                        const hpText = String(d.hit_points || d.hp || '—');
                        const hpMatch = hpText.match(/^(\d+)\s*(\(.*?\))?/);
                        const hpValue = hpMatch ? hpMatch[1] : hpText;
                        const hpDice = hpMatch && hpMatch[2] ? hpMatch[2] : '';

                        const xpByCr: Record<string, string> = {
                          "0": "0", "1/8": "25", "1/4": "50", "1/2": "100",
                          "1": "200", "2": "450", "3": "700", "4": "1,100", "5": "1,800",
                          "6": "2,300", "7": "2,900", "8": "3,900", "9": "5,000", "10": "5,900",
                          "11": "7,200", "12": "8,400", "13": "10,000", "14": "11,500", "15": "13,000",
                          "16": "15,000", "17": "18,000", "18": "20,000", "19": "22,000", "20": "25,000",
                          "21": "33,000", "22": "41,000", "23": "50,000", "24": "62,000", "25": "75,000",
                          "26": "90,000", "27": "105,000", "28": "120,000", "29": "135,000", "30": "155,000"
                        };
                        const xpValue = xpByCr[String(cr)] || '';

                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            {/* [A] CABECERA - full width */}
                            <div style={{ width: '100%' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                <div>
                                  <h1 className="font-cinzel" style={{ margin: 0, color: 'var(--gold-primary)', fontSize: '2.8rem', textShadow: '0 0 20px rgba(201, 162, 39, 0.2)', lineHeight: 1.1 }}>{selectedItem.name}</h1>
                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '10px' }}>
                                    <span className="font-cinzel" style={{ background: 'rgba(192, 57, 43, 0.15)', color: '#e74c3c', padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                      {d.type || 'Monstruo'}
                                    </span>
                                    <span className="font-cinzel" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-parchment)', padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                                      {d.size || 'Tamaño Desconocido'}
                                    </span>
                                    <span className="font-cinzel" style={{ background: 'rgba(201, 162, 39, 0.15)', color: 'var(--gold-primary)', padding: '4px 10px', borderRadius: '4px', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                      CR {cr}
                                    </span>
                                  </div>
                                </div>
                                <button onClick={() => setSelectedItem(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '2.5rem', cursor: 'pointer', transition: 'color 0.2s', padding: 0, lineHeight: 1 }} onMouseEnter={e => e.currentTarget.style.color = 'var(--combat-red)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>✕</button>
                              </div>

                              {/* Franja de estadísticas vitales */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: 'var(--bg-raised)', border: '1px solid var(--border-gold-subtle)', borderRadius: '4px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
                                <div style={{ padding: '12px', borderRight: '1px solid var(--border-gold-subtle)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                  <div className="font-cinzel" style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Puntos de Golpe</div>
                                  <div className="mono font-cinzel" style={{ fontSize: '1.8rem', color: '#27ae60', fontWeight: 'bold', lineHeight: 1 }}>{hpValue}</div>
                                  {hpDice && <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{hpDice}</div>}
                                </div>
                                <div style={{ padding: '12px', borderRight: '1px solid var(--border-gold-subtle)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                  <div className="font-cinzel" style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Clase Armadura</div>
                                   <div className="mono font-cinzel" style={{ fontSize: '1.8rem', color: 'var(--text-parchment)', fontWeight: 'bold', lineHeight: 1 }}>{(() => { const ac = d.ac ?? (Array.isArray(d.armor_class) ? d.armor_class[0]?.value : d.armor_class); return ac ?? '—'; })()}</div>
                                </div>
                                <div style={{ padding: '12px', borderRight: '1px solid var(--border-gold-subtle)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                  <div className="font-cinzel" style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Desafío (CR)</div>
                                  <div className="mono font-cinzel" style={{ fontSize: '1.5rem', color: 'var(--gold-primary)', fontWeight: 'bold', lineHeight: 1 }}>{cr}</div>
                                  {xpValue && <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{xpValue} XP</div>}
                                </div>
                                <div style={{ padding: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                  <div className="font-cinzel" style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Velocidad</div>
                                   <div className="mono font-cinzel" style={{ fontSize: '0.85rem', color: 'var(--text-parchment)', lineHeight: 1.4 }}>{(() => {
                                    const spd = d.speed;
                                    if (!spd) return '—';
                                    if (typeof spd === 'string') return spd;
                                    if (typeof spd === 'object') {
                                      const SPEED_LABELS: Record<string, string> = { walk: 'Caminando', swim: 'Nadando', fly: 'Volando', climb: 'Escalando', burrow: 'Excavando' };
                                      return Object.entries(spd).map(([k, v]) => `${SPEED_LABELS[k] || k}: ${v}`).join(', ');
                                    }
                                    return String(spd);
                                   })()}</div>
                                </div>
                              </div>
                            </div>

                            {/* [B] CUERPO - Grid de 2 columnas */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '30px' }}>
                              {/* Columna Izquierda (240px fija simulada con grid) */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '240px', maxWidth: '280px' }}>
                                {d.image && (
                                  <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-gold-subtle)', background: 'var(--bg-base)', position: 'relative' }}>
                                    <img 
                                      src={d.image} 
                                      alt="" 
                                      style={{ 
                                        width: '100%', height: '100%', objectFit: 'cover',
                                        transform: `translate(${d.imagePosX ?? 0}px, ${d.imagePosY ?? 0}px) scale(${d.imageZoom ?? 1})`,
                                        transformOrigin: 'center'
                                      }} 
                                    />
                                  </div>
                                )}

                                <div>
                                  <div className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', marginBottom: '12px' }}>Atributos</div>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                    {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(attr => {
                                      const val = d[attr] || d[attr.substring(0,3)] || 10;
                                      const mod = Math.floor((val - 10) / 2);
                                      const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
                                      return (
                                        <div key={attr} style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', padding: '8px 4px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                          <div style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{attr.substring(0, 3)}</div>
                                          <div className="mono" style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>{modStr}</div>
                                          <div className="mono" style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>{val}</div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div>
                                  <div className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', marginBottom: '12px' }}>Defensas</div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '0.8rem' }}>
                                      <span style={{ color: 'var(--text-secondary)' }}>Vulnerable a</span>
                                      <span style={{ color: (d.vulnerabilities || d.damage_vulnerabilities)?.length ? '#e74c3c' : 'var(--text-secondary)', textAlign: 'right', fontStyle: (d.vulnerabilities || d.damage_vulnerabilities)?.length ? 'normal' : 'italic' }}>
                                        {(() => {
                                          const val = d.vulnerabilities || d.damage_vulnerabilities;
                                          if (!val || val.length === 0) return '—';
                                          return Array.isArray(val) ? val.join(', ') : val;
                                        })()}
                                      </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '0.8rem' }}>
                                      <span style={{ color: 'var(--text-secondary)' }}>Resistente a</span>
                                      <span style={{ color: (d.resistances || d.damage_resistances)?.length ? 'var(--text-parchment)' : 'var(--text-secondary)', textAlign: 'right', fontStyle: (d.resistances || d.damage_resistances)?.length ? 'normal' : 'italic' }}>
                                        {(() => {
                                          const val = d.resistances || d.damage_resistances;
                                          if (!val || val.length === 0) return '—';
                                          return Array.isArray(val) ? val.join(', ') : val;
                                        })()}
                                      </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '0.8rem' }}>
                                      <span style={{ color: 'var(--text-secondary)' }}>Inmune a</span>
                                      <span style={{ color: (d.immunities || d.damage_immunities)?.length ? 'var(--gold-primary)' : 'var(--text-secondary)', textAlign: 'right', fontStyle: (d.immunities || d.damage_immunities)?.length ? 'normal' : 'italic' }}>
                                        {(() => {
                                          const val = d.immunities || d.damage_immunities;
                                          if (!val || val.length === 0) return '—';
                                          return Array.isArray(val) ? val.join(', ') : val;
                                        })()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Columna Derecha (1fr, scrollable) */}
                              <div style={{ flex: 1, maxHeight: '380px', overflowY: 'auto', paddingRight: '10px', display: 'flex', flexDirection: 'column', gap: '20px' }} className="custom-scroll">
                                <div>
                                  <div className="font-cinzel" style={{ fontSize: '0.9rem', color: 'var(--gold-primary)', marginBottom: '8px' }}>Descripción</div>
                                  <p style={{ fontSize: '12px', lineHeight: 1.6, margin: 0, color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: formatDescription(d.description || d.desc || 'Sin descripción.') }} />
                                </div>

                                {((Array.isArray(d.traits) && d.traits.length > 0) || (Array.isArray(d.special_abilities) && d.special_abilities.length > 0)) && (
                                  <div>
                                    <div className="font-cinzel" style={{ fontSize: '0.9rem', color: 'var(--gold-primary)', marginBottom: '8px' }}>Rasgos Especiales</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                      {(d.traits || d.special_abilities).map((t: any, idx: number) => (
                                        <div key={idx} style={{ fontSize: '12px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                                          <b style={{ color: 'var(--text-parchment)' }}>{t.name}.</b> {t.desc || t.description}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* [C] ACCIONES - full width debajo del cuerpo */}
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                              
                              {/* Sección Acciones */}
                              {Array.isArray(d.actions) && d.actions.length > 0 && (
                                <div>
                                  <div style={{ display: 'inline-block', background: 'rgba(93, 173, 226, 0.15)', color: '#5dade2', padding: '4px 12px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px', border: '1px solid rgba(93, 173, 226, 0.3)' }}>Acciones</div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {d.actions.map((act: any, idx: number) => (
                                      <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '15px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '15px', alignItems: 'start' }}>
                                        <div>
                                          <div className="font-cinzel" style={{ color: 'var(--gold-primary)', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>{act.name}</div>
                                          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.5 }}>{act.desc || act.description}</div>
                                        </div>
                                        {act.isAttack && (
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                                            {act.attackBonus && <div className="mono" style={{ fontSize: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-parchment)' }}>ATK {act.attackBonus}</div>}
                                            {act.damageFormula && <div className="mono" style={{ fontSize: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', color: 'var(--combat-red)' }}>DMG {act.damageFormula}</div>}
                                            {act.range && <div className="mono" style={{ fontSize: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-secondary)' }}>RNG {act.range}</div>}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Sección Acciones Legendarias */}
                              {Array.isArray(d.legendary_actions) && d.legendary_actions.length > 0 && (
                                <div>
                                  <div style={{ display: 'inline-block', background: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa', padding: '4px 12px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px', border: '1px solid rgba(167, 139, 250, 0.3)' }}>Acciones Legendarias</div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {d.legendary_actions.map((act: any, idx: number) => (
                                      <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '6px', padding: '15px' }}>
                                        <div className="font-cinzel" style={{ color: 'var(--gold-primary)', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>{act.name}</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.5 }}>{act.desc || act.description}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                            </div>
                          </div>
                        );
                      })() : (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', borderBottom: '2px solid var(--border-color)', paddingBottom: '20px' }}>
                            <div>
                              <h1 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '2.8rem', textShadow: '0 0 20px rgba(200, 135, 42, 0.2)' }}>{selectedItem.name}</h1>
                              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '5px' }}>
                                <span className="font-cinzel" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem' }}>{selectedItem.type === 'monster' ? <><Ghost className="w-4 h-4 inline-block mr-1" /> MONSTRUO</> : selectedItem.type === 'spell' ? <><Scroll className="w-4 h-4 inline-block mr-1" /> HECHIZO</> : selectedItem.type === 'condition' ? <><AlertTriangle className="w-4 h-4 inline-block mr-1" /> ESTADO</> : selectedItem.type === 'subrace' ? <><Dna className="w-4 h-4 inline-block mr-1" /> SUBRAZA</> : selectedItem.type === 'language' ? <><Languages className="w-4 h-4 inline-block mr-1" /> IDIOMA</> : <><Swords className="w-4 h-4 inline-block mr-1" /> OBJETO</>}</span>
                                {isMonster && d.size && <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>• {d.size}</span>}
                                {isMonster && cr !== '—' && <span style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', fontWeight: 'bold' }}>• CR {cr}</span>}
                              </div>
                            </div>
                            <button onClick={() => setSelectedItem(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '2.5rem', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--combat-red)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>✕</button>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '50px' }}>
                            <div>
                              <div style={{ position: 'relative', marginBottom: '30px' }}>
                                <div style={{ width: '100%', aspectRatio: '1/1', background: 'var(--bg-base)', border: '1px solid var(--border-color)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                  {d.image ? (
                                    <img 
                                      src={d.image} 
                                      alt="" 
                                      style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover',
                                        transform: `translate(${d.imagePosX ?? 0}px, ${d.imagePosY ?? 0}px) scale(${d.imageZoom ?? 1})`,
                                        transformOrigin: 'center'
                                      }} 
                                    />
                                  ) : (
                                    <div style={{ fontSize: '5rem', opacity: 0.2 }}>
                                      {selectedItem.type === 'monster' ? <Ghost size={80} /> : 
                                       selectedItem.type === 'spell' ? <Scroll size={80} /> : 
                                       selectedItem.type === 'condition' ? <AlertTriangle size={80} /> :
                                       selectedItem.type === 'subrace' ? <Dna size={80} /> :
                                       selectedItem.type === 'language' ? <Languages size={80} /> :
                                       <Swords size={80} />}
                                    </div>
                                  )}
                                </div>
                                <div style={{ position: 'absolute', bottom: '-10px', left: '10px', right: '10px', height: '4px', background: 'var(--accent-gold)', boxShadow: '0 0 15px var(--accent-gold)' }} />
                              </div>
                            </div>

                            {/* Detalles en Columna Derecha (2fr) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', color: 'var(--text-parchment)' }}>

                          {selectedItem.type === 'item' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                              {/* Rarity & Tags Header */}
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: `repeat(${2 + (d.armorType ? 1 : 0) + (d.weight !== undefined && d.weight !== '' ? 1 : 0)}, 1fr)`,
                                gap: '15px',
                                background: 'rgba(0,0,0,0.3)',
                                padding: '15px',
                                border: '1px solid var(--border-color)',
                                boxShadow: 'inset 0 0 15px rgba(200, 135, 42, 0.05)'
                              }}>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Rareza</div>
                                  <div className="mono font-cinzel" style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', fontWeight: 'bold', textShadow: '0 0 10px rgba(200, 135, 42, 0.2)' }}>{d.rarity || 'Común'}</div>
                                </div>
                                {d.armorType && (
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tipo</div>
                                    <div className="mono font-cinzel" style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', fontWeight: 'bold', textShadow: '0 0 10px rgba(200, 135, 42, 0.2)' }}>{`ARMADURA ${d.armorType.toUpperCase()}`}</div>
                                  </div>
                                )}
                                {d.weight !== undefined && d.weight !== '' && (
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Peso</div>
                                    <div className="mono font-cinzel" style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', fontWeight: 'bold', textShadow: '0 0 10px rgba(200, 135, 42, 0.2)' }}>{`${d.weight} kg`}</div>
                                  </div>
                                )}
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tags</div>
                                  <div className="mono font-cinzel" style={{ fontSize: '1.0rem', color: 'var(--text-parchment)', letterSpacing: '0.5px' }}>{Array.isArray(d.tags) && d.tags.length > 0 ? d.tags.join(', ').toUpperCase() : 'ÍTEM'}</div>
                                </div>
                              </div>

                              {/* Protection Block */}
                              {d.isProtect && (
                                <div style={{ background: 'rgba(0, 50, 20, 0.15)', border: '1px solid rgba(46, 117, 89, 0.3)', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', borderRadius: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                  <div style={{ fontSize: '2rem', color: '#4ade80', filter: 'drop-shadow(0 0 8px rgba(74, 222, 128, 0.3))' }}>🛡️</div>
                                  <div style={{ flex: 1 }}>
                                    <div className="font-cinzel" style={{ fontSize: '0.9rem', color: 'var(--text-parchment)', fontWeight: 'bold', letterSpacing: '1px' }}>PROPIEDAD: PROTECTOR</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Este objeto otorga protección adicional al portador.</div>
                                  </div>
                                  <div style={{ textAlign: 'right', padding: '0 10px' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Bono CA</div>
                                    <div className="mono font-cinzel" style={{ fontSize: '1.6rem', color: '#4ade80', fontWeight: 'bold' }}>
                                      {d.defenseBonus ? (d.defenseBonus.startsWith('+') || d.defenseBonus.startsWith('-') ? d.defenseBonus : `+${d.defenseBonus}`) : '+0'}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Attunement Block */}
                              {d.requiresAttunement && (
                                <div style={{ background: 'rgba(200, 135, 42, 0.08)', border: '1px solid rgba(200, 135, 42, 0.25)', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', borderRadius: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                  <div style={{ fontSize: '1.8rem', color: 'var(--accent-gold)', filter: 'drop-shadow(0 0 8px rgba(200, 135, 42, 0.3))' }}><Link className="w-6 h-6 inline-block" /></div>
                                  <div style={{ flex: 1 }}>
                                    <div className="font-cinzel" style={{ fontSize: '0.9rem', color: 'var(--text-parchment)', fontWeight: 'bold', letterSpacing: '1px' }}>SINTONIZACIÓN REQUERIDA</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Este objeto debe ser sintonizado con el personaje para activar sus propiedades.</div>
                                  </div>
                                </div>
                              )}

                              {/* Combat / Attack Block */}
                              {d.isDamage && (
                                <div style={{ background: 'rgba(50, 0, 0, 0.15)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '18px', display: 'flex', flexDirection: 'column', gap: '15px', borderRadius: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(239, 68, 68, 0.2)', paddingBottom: '10px' }}>
                                    <span style={{ fontSize: '1.3rem' }}>⚔️</span>
                                    <h4 className="font-cinzel" style={{ margin: 0, color: 'var(--combat-red)', fontSize: '1.05rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                                      {d.attackName || 'Ataque de Combate'}
                                    </h4>
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                    {/* Attack Roll Column */}
                                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', border: '1px solid var(--border-color)' }}>
                                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Tirada de Ataque</div>
                                      <div className="mono" style={{ fontSize: '1.25rem', color: 'var(--text-parchment)', fontWeight: 'bold' }}>
                                        {d.attackBonus ? (d.attackBonus.startsWith('+') || d.attackBonus.startsWith('-') ? d.attackBonus : `+${d.attackBonus}`) : '+0'}
                                      </div>
                                      {d.statSelection && (
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                          Base: <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>{d.statSelection}</span> {d.statMod ? `(${d.statMod})` : ''}
                                        </div>
                                      )}
                                    </div>

                                    {/* Damage Formula Column */}
                                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '12px', border: '1px solid var(--border-color)' }}>
                                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>Daño Estándar</div>
                                      <div className="mono" style={{ fontSize: '1.25rem', color: 'var(--combat-red)', fontWeight: 'bold' }}>
                                        {d.damage || '—'}
                                      </div>
                                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', textTransform: 'uppercase' }}>
                                        Tipo: <span style={{ color: 'var(--text-parchment)' }}>{d.damageType || 'físico'}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    {/* Critical Damage */}
                                    <div style={{ background: 'rgba(0,0,0,0.15)', padding: '8px 12px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>
                                      <span style={{ color: 'var(--text-secondary)' }}>Daño Crítico: </span>
                                      <span className="mono" style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>{d.critDamage || 'Doble de dados'}</span>
                                    </div>
                                    {/* Targets Count */}
                                    <div style={{ background: 'rgba(0,0,0,0.15)', padding: '8px 12px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem' }}>
                                      <span style={{ color: 'var(--text-secondary)' }}>Objetivos: </span>
                                      <span className="mono" style={{ color: 'var(--text-parchment)', fontWeight: 'bold' }}>{d.targetsCount || '1'} {parseInt(d.targetsCount) === 1 ? 'unidad' : 'unidades'}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Description Section */}
                              <div>
                                <h3 className="font-cinzel" style={{ fontSize: '1rem', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', margin: '0 0 10px 0' }}>Descripción</h3>
                                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', margin: 0, color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: formatDescription(d.description || d.desc || 'Sin descripción.') }}>

                                </p>
                              </div>
                            </div>
                          ) }

                          {selectedItem.type === 'spell' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', background: 'rgba(0,0,0,0.2)', padding: '15px', border: '1px solid var(--border-color)' }}>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Nivel</div>
                                  <div className="mono font-cinzel" style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{String(d.level) === '0' || d.level === 'cantrip' || d.level === 'Cantrip' ? 'TRUCO' : `NIVEL ${d.level}`}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Alcance</div>
                                  <div className="mono font-cinzel" style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{d.range ? `${d.range} ${typeof d.range === 'number' || !isNaN(Number(d.range)) ? 'casillas' : ''}` : '—'}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Duración</div>
                                  <div className="mono font-cinzel" style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{d.duration || '—'}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Concentración</div>
                                  <div className="mono font-cinzel" style={{ fontSize: '1.1rem', color: d.concentration ? 'var(--accent-gold)' : 'var(--text-secondary)', fontWeight: 'bold' }}>{d.concentration && (d.concentration === 'yes' || d.concentration === true) ? 'SÍ' : 'NO'}</div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Componentes:</span>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                  {['V', 'S', 'M'].map(c => {
                                    const has = d.components && (typeof d.components === 'object' ? d.components[c] : d.components.toUpperCase().includes(c));
                                    return (
                                      <span key={c} style={{ 
                                        padding: '4px 10px', 
                                        background: has ? 'rgba(200,135,42,0.15)' : 'rgba(255,255,255,0.02)', 
                                        border: `1px solid ${has ? 'var(--accent-gold)' : 'var(--border-color)'}`,
                                        color: has ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold'
                                      }}>
                                        {c}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>

                              {d.short_description && (
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '5px' }}>Descripción Corta</div>
                                  <p style={{ fontSize: '0.95rem', margin: 0, fontStyle: 'italic', color: 'var(--text-parchment)' }}>
                                    "{d.short_description}"
                                  </p>
                                </div>
                              )}

                              <div>
                                <h3 className="font-cinzel" style={{ fontSize: '1rem', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', margin: '0 0 10px 0' }}>Descripción Completa</h3>
                                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', margin: 0, color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: formatDescription(d.description || d.desc || 'Sin descripción.') }}>

                                </p>
                              </div>
                            </div>
                          )}

                          {selectedItem.type === 'condition' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                              <div>
                                <h3 className="font-cinzel" style={{ fontSize: '1rem', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', margin: '0 0 15px 0' }}>Efectos y Reglas</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                  {Array.isArray(d.desc) ? (
                                    d.desc.map((paragraph: string, pIdx: number) => (
                                      <p key={pIdx} style={{ fontSize: '0.95rem', lineHeight: '1.6', margin: 0, color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: formatDescription(paragraph) }} />
                                    ))
                                  ) : (
                                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', margin: 0, color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: formatDescription(d.description || d.desc || 'Sin descripción.') }} />
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedItem.type === 'subrace' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                              <div>
                                <h3 className="font-cinzel" style={{ fontSize: '1.05rem', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', margin: '0 0 10px 0' }}>Raza Padre</h3>
                                <p style={{ fontSize: '0.95rem', margin: 0, color: 'var(--text-parchment)' }}>
                                  {d.race?.name || 'Desconocida'}
                                </p>
                              </div>
                              {d.ability_bonuses && d.ability_bonuses.length > 0 && (
                                <div>
                                  <h3 className="font-cinzel" style={{ fontSize: '1.05rem', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', margin: '0 0 10px 0' }}>Bonificadores de Atributos</h3>
                                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                    {d.ability_bonuses.map((b: any, bIdx: number) => (
                                      <li key={bIdx}>
                                        <b>{b.ability_score?.name?.toUpperCase()}:</b> +{b.bonus}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {d.racial_traits && d.racial_traits.length > 0 && (
                                <div>
                                  <h3 className="font-cinzel" style={{ fontSize: '1.05rem', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', margin: '0 0 10px 0' }}>Rasgos Raciales Especiales</h3>
                                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                    {d.racial_traits.map((t: any, tIdx: number) => (
                                      <li key={tIdx}>
                                        <b>{t.name}</b>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <div>
                                <h3 className="font-cinzel" style={{ fontSize: '1.05rem', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', margin: '0 0 10px 0' }}>Descripción</h3>
                                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', margin: 0, color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: formatDescription(d.description || d.desc || 'Sin descripción.') }} />
                              </div>
                            </div>
                          )}

                          {selectedItem.type === 'language' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${1 + (d.script ? 1 : 0) + (d.typical_speakers && d.typical_speakers.length > 0 ? 1 : 0)}, 1fr)`, gap: '15px', background: 'rgba(0,0,0,0.2)', padding: '15px', border: '1px solid var(--border-color)' }}>
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tipo</div>
                                  <div className="mono font-cinzel" style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{d.type || '—'}</div>
                                </div>
                                {d.script && (
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Escritura</div>
                                    <div className="mono font-cinzel" style={{ fontSize: '1.1rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>{d.script}</div>
                                  </div>
                                )}
                                {d.typical_speakers && d.typical_speakers.length > 0 && (
                                  <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Hablantes Típicos</div>
                                    <div className="mono font-cinzel" style={{ fontSize: '1.0rem', color: 'var(--text-parchment)', fontWeight: 'bold' }}>{d.typical_speakers.join(', ')}</div>
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-cinzel" style={{ fontSize: '1.05rem', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', margin: '0 0 10px 0' }}>Descripción</h3>
                                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', margin: 0, color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: formatDescription(d.description || d.desc || 'Sin descripción.') }} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      </>
                      )}
                    </div>
                  </div>
                );
};
