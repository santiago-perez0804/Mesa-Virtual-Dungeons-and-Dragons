import React, { useState, useEffect } from 'react';
import { X, Shield, Plus, Trash2 } from 'lucide-react';
import { safeParseStats, safeParseInventory, calcMod } from '../../utils/personaje';

export const ACModifierModal = ({ character, socket, onClose }: any) => {
  const charStats = safeParseStats(character.stats);
  const charInv = safeParseInventory(character.inventory);
  
  // Custom modifiers from DB
  const [customMods, setCustomMods] = useState<Array<{id: string, name: string, value: number}>>(charStats.customACModifiers || []);
  
  // Form state
  const [newModName, setNewModName] = useState('');
  const [newModValue, setNewModValue] = useState(1);

  // Parse equipped armor and shields
  const slots = charInv.slots || {};
  let equippedArmor: any = null;
  let equippedShield: any = null;
  
  Object.values(slots).forEach((item: any) => {
    if (!item) return;
    const isArmor = item.type === 'armor' || item.isProtect;
    if (isArmor) {
      const type = item.armorType || item.data?.armorType || 'light';
      if (type === 'shield') {
        equippedShield = item;
      } else {
        equippedArmor = item;
      }
    }
  });

  // Calculate Base and Dex Mod
  let baseAC = 10;
  let dexMod = calcMod(charStats.dex || 10);
  let maxDexMod = 99; // no limit

  if (equippedArmor) {
    baseAC = parseInt(equippedArmor.ac || equippedArmor.data?.ac || 10);
    const type = (equippedArmor.armorType || equippedArmor.data?.armorType || 'light').toLowerCase();
    if (type === 'heavy' || type === 'pesada') {
      dexMod = 0;
      maxDexMod = 0;
    } else if (type === 'medium' || type === 'media') {
      maxDexMod = 2;
    }
  }

  // Cap the dex mod if it's positive (negative dex mod always applies even in medium/heavy armor? By rules, heavy ignores negative Dex, medium takes negative Dex.)
  let appliedDexMod = dexMod;
  if (dexMod > maxDexMod) appliedDexMod = maxDexMod;
  if (maxDexMod === 0 && dexMod < 0) appliedDexMod = 0; // Heavy ignores Dex entirely

  // Shield AC
  let shieldAC = 0;
  if (equippedShield) {
    shieldAC = parseInt(equippedShield.ac || equippedShield.data?.ac || 2);
  }

  // Total AC
  const customTotal = customMods.reduce((acc, mod) => acc + mod.value, 0);
  const totalAC = baseAC + appliedDexMod + shieldAC + customTotal;

  const handleAddMod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModName.trim() || isNaN(newModValue)) return;
    
    const newMod = {
      id: Date.now().toString(),
      name: newModName.trim(),
      value: Number(newModValue)
    };
    
    const updatedMods = [...customMods, newMod];
    setCustomMods(updatedMods);
    setNewModName('');
    setNewModValue(1);
    
    saveToDB(updatedMods);
  };

  const handleRemoveMod = (id: string) => {
    const updatedMods = customMods.filter(m => m.id !== id);
    setCustomMods(updatedMods);
    saveToDB(updatedMods);
  };

  const saveToDB = (mods: any[]) => {
    const updatedStats = { ...charStats, customACModifiers: mods };
    // Assuming the DB accepts total AC as well, we calculate it here
    const finalTotal = baseAC + appliedDexMod + shieldAC + mods.reduce((acc, m) => acc + m.value, 0);
    
    socket.emit('character:update', {
      ...character,
      ac: finalTotal,
      stats: JSON.stringify(updatedStats)
    });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={onClose}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '30px', width: '400px', maxWidth: '90vw', position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }} onClick={e => e.stopPropagation()}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <Shield size={40} style={{ margin: '0 auto', color: 'var(--accent-gold)' }} />
          <h2 className="font-cinzel" style={{ margin: '10px 0 5px 0', color: 'var(--gold-primary)' }}>Clase de Armadura</h2>
          <div className="mono" style={{ fontSize: '3rem', color: 'white', fontWeight: 'bold' }}>{totalAC}</div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <span>Base {equippedArmor ? `(${equippedArmor.name})` : '(Sin armadura)'}</span>
            <span className="mono" style={{ color: 'var(--text-parchment)' }}>{baseAC}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <span>Mod. Destreza {maxDexMod === 2 ? '(Max +2)' : maxDexMod === 0 ? '(Ignorado)' : ''}</span>
            <span className="mono" style={{ color: appliedDexMod >= 0 ? '#27ae60' : '#e74c3c' }}>{appliedDexMod >= 0 ? `+${appliedDexMod}` : appliedDexMod}</span>
          </div>

          {equippedShield && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <span>Escudo ({equippedShield.name})</span>
              <span className="mono" style={{ color: '#27ae60' }}>+{shieldAC}</span>
            </div>
          )}

          {customMods.length > 0 && <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '5px 0' }} />}

          {customMods.map((mod) => (
            <div key={mod.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '4px' }}>
              <span style={{ color: 'var(--text-parchment)', fontSize: '0.9rem' }}>{mod.name}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span className="mono" style={{ color: mod.value >= 0 ? '#27ae60' : '#e74c3c' }}>{mod.value >= 0 ? `+${mod.value}` : mod.value}</span>
                <button onClick={() => handleRemoveMod(mod.id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: 0, opacity: 0.7 }} title="Eliminar modificador">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddMod} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="number" 
            value={newModValue} 
            onChange={(e) => setNewModValue(Number(e.target.value))}
            style={{ width: '60px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '8px', borderRadius: '4px', textAlign: 'center' }}
            required
          />
          <input 
            type="text" 
            value={newModName} 
            onChange={(e) => setNewModName(e.target.value)}
            placeholder="Ej: Esquiva, Bendición..."
            style={{ flex: 1, background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '8px', borderRadius: '4px' }}
            required
          />
          <button type="submit" className="torch-glow" style={{ background: 'var(--accent-gold)', border: 'none', color: 'var(--bg-base)', width: '40px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};
