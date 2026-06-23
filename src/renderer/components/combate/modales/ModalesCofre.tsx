import { Box, Lock } from 'lucide-react';

interface CrearProps {
  chestPassword: string;
  setChestPassword: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

/** Modal para crear un cofre con contraseña. */
export function ModalCrearCofre({ chestPassword, setChestPassword, onSubmit, onClose }: CrearProps) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={onClose}>
      <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '400px', padding: '30px', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
        <h3 className="font-cinzel" style={{ margin: '0 0 20px 0', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}><Box className="w-5 h-5 inline-block mr-2" /> CREAR COFRE</h3>
        <form onSubmit={onSubmit}>
          <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>CONTRASEÑA DEL COFRE</label>
          <input type="text" value={chestPassword} onChange={e => setChestPassword(e.target.value)} placeholder="Ingresa una contraseña..." style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '12px', width: '100%', borderRadius: '4px', boxSizing: 'border-box', fontSize: '1rem', outline: 'none', marginBottom: '20px' }} />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="font-cinzel" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Cancelar</button>
            <button type="submit" className="font-cinzel torch-glow" style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>COLOCAR</button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface SeleccionarProps {
  compendium: any[];
  itemSearchQuery: string;
  setItemSearchQuery: (v: string) => void;
  onSelect: (item: any) => void;
  onClose: () => void;
}

/** Modal para elegir un objeto del compendio (al colocar en el suelo o en un cofre). */
export function ModalSeleccionarObjeto({ compendium, itemSearchQuery, setItemSearchQuery, onSelect, onClose }: SeleccionarProps) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={onClose}>
      <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '500px', height: '600px', display: 'flex', flexDirection: 'column', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '25px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 className="font-cinzel" style={{ margin: '0 0 15px 0', color: 'var(--accent-gold)' }}>⚔️ SELECCIONAR OBJETO</h3>
          <input type="text" value={itemSearchQuery} onChange={e => setItemSearchQuery(e.target.value)} placeholder="🔍 Buscar objeto en el compendio..." style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '12px', width: '100%', borderRadius: '4px', boxSizing: 'border-box', outline: 'none' }} />
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
                  onClick={() => onSelect(item)}
                  style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', cursor: 'pointer', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.2s' }}
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
          <button onClick={onClose} className="font-cinzel" style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

interface ContrasenaProps {
  enteredPassword: string;
  setEnteredPassword: (v: string) => void;
  passwordError: string;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

/** Modal para ingresar la contraseña de un cofre cerrado. */
export function ModalContrasenaCofre({ enteredPassword, setEnteredPassword, passwordError, onSubmit, onClose }: ContrasenaProps) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={onClose}>
      <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '400px', padding: '30px', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
        <h3 className="font-cinzel" style={{ margin: '0 0 20px 0', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}><Lock className="w-5 h-5 inline-block mr-2" /> COFRE CERRADO</h3>
        <form onSubmit={onSubmit}>
          <p style={{ color: 'var(--text-parchment)', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 20px 0' }}>Este cofre está cerrado bajo contraseña. Para abrirlo y tomar su botín debes ingresar la contraseña establecida por el DM.</p>
          <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>CONTRASEÑA</label>
          <input type="text" value={enteredPassword} onChange={e => setEnteredPassword(e.target.value)} placeholder="Ingresa la contraseña del cofre..." style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '12px', width: '100%', borderRadius: '4px', boxSizing: 'border-box', fontSize: '1rem', outline: 'none', marginBottom: '10px' }} />
          {passwordError && <p style={{ color: 'var(--combat-red)', fontSize: '0.8rem', margin: '0 0 20px 0', fontWeight: 'bold' }}>⚠️ {passwordError}</p>}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: passwordError ? '0' : '20px' }}>
            <button type="button" onClick={onClose} className="font-cinzel" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Cancelar</button>
            <button type="submit" className="font-cinzel torch-glow" style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>ABRIR</button>
          </div>
        </form>
      </div>
    </div>
  );
}
