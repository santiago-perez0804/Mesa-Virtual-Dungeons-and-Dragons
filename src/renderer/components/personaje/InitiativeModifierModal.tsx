import React, { useState } from 'react';
import { X, Dices, Plus, Trash2 } from 'lucide-react';
import { safeParseStats, calcMod } from '../../utils/personaje';

export const InitiativeModifierModal = ({ character, socket, onClose, onUpdate }: any) => {
  const charStats = safeParseStats(character.stats);
  
  // Custom modifiers from DB
  const [customMods, setCustomMods] = useState<Array<{id: string, name: string, value: number}>>(charStats.customInitiativeModifiers || []);
  
  // Form state
  const [newModName, setNewModName] = useState('');
  const [newModValue, setNewModValue] = useState<string>('1');

  // Calculate Dex Mod
  const dexMod = calcMod(charStats.dex || 10);

  // Total Initiative
  const customTotal = customMods.reduce((acc, mod) => acc + mod.value, 0);
  const totalInitiative = dexMod + customTotal;

  const handleAddMod = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedVal = newModValue === '' || newModValue === '-' ? 0 : Number(newModValue);
    if (!newModName.trim() || isNaN(parsedVal)) return;
    
    const newMod = {
      id: Date.now().toString(),
      name: newModName.trim(),
      value: parsedVal
    };
    
    const updatedMods = [...customMods, newMod];
    setCustomMods(updatedMods);
    setNewModName('');
    setNewModValue('1');
    
    saveToDB(updatedMods);
  };

  const handleRemoveMod = (id: string) => {
    const updatedMods = customMods.filter(m => m.id !== id);
    setCustomMods(updatedMods);
    saveToDB(updatedMods);
  };

  const saveToDB = (mods: any[]) => {
    const updatedStats = { ...charStats, customInitiativeModifiers: mods };
    const updatedChar = {
      ...character,
      stats: JSON.stringify(updatedStats)
    };
    
    socket.emit('character:update', updatedChar);
    if (onUpdate) {
      onUpdate(updatedChar);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={onClose}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '30px', width: '400px', maxWidth: '90vw', position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }} onClick={e => e.stopPropagation()}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <Dices size={40} style={{ margin: '0 auto', color: 'var(--accent-gold)' }} />
          <h2 className="font-cinzel" style={{ margin: '10px 0 5px 0', color: 'var(--gold-primary)' }}>Iniciativa</h2>
          <div className="mono" style={{ fontSize: '3rem', color: totalInitiative >= 0 ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
            {totalInitiative >= 0 ? `+${totalInitiative}` : totalInitiative}
          </div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <span>Mod. Destreza base</span>
            <span className="mono" style={{ color: dexMod >= 0 ? '#27ae60' : '#e74c3c' }}>{dexMod >= 0 ? `+${dexMod}` : dexMod}</span>
          </div>

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
            type="text" 
            value={newModValue} 
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || val === '-' || !isNaN(Number(val))) {
                setNewModValue(val);
              }
            }}
            style={{ width: '60px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '8px', borderRadius: '4px', textAlign: 'center' }}
            required
          />
          <input 
            type="text" 
            value={newModName} 
            onChange={(e) => setNewModName(e.target.value)}
            placeholder="Ej: Alerta, Don de la alerta..."
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
