const COLORES_AOE = ['#ef4444', '#3b82f6', '#10b981', '#ecc94b', '#a855f7', '#ec4899', '#f97316', '#64748b'];

interface CrearProps {
  aoeForm: { shape: string; size1: number; size2: number; color: string };
  setAoeForm: (v: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

/** Modal para crear un área de efecto (forma, tamaño y color). */
export function ModalCrearAoe({ aoeForm, setAoeForm, onSubmit, onClose }: CrearProps) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={onClose}>
      <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '400px', padding: '30px', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
        <h3 className="font-cinzel" style={{ margin: '0 0 20px 0', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', textTransform: 'uppercase' }}>CREAR ÁREA DE EFECTO ({aoeForm.shape})</h3>
        <form onSubmit={onSubmit}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>{aoeForm.shape === 'line' ? 'LARGO (Casillas)' : (aoeForm.shape === 'circle' ? 'RADIO (Casillas)' : 'TAMAÑO (Casillas)')}</label>
              <input type="number" min="1" value={aoeForm.size1} onChange={e => setAoeForm({ ...aoeForm, size1: parseInt(e.target.value) || 1 })} style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '12px', width: '100%', borderRadius: '4px', boxSizing: 'border-box', outline: 'none' }} />
            </div>
            {aoeForm.shape === 'line' && (
              <div style={{ flex: 1 }}>
                <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>ANCHO (Casillas)</label>
                <input type="number" min="1" value={aoeForm.size2} onChange={e => setAoeForm({ ...aoeForm, size2: parseInt(e.target.value) || 1 })} style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '12px', width: '100%', borderRadius: '4px', boxSizing: 'border-box', outline: 'none' }} />
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>COLOR DEL ÁREA</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {COLORES_AOE.map(color => (
                <div key={color} onClick={() => setAoeForm({ ...aoeForm, color })} style={{ width: '30px', height: '30px', borderRadius: '50%', background: color, cursor: 'pointer', border: aoeForm.color === color ? '3px solid white' : '1px solid rgba(255,255,255,0.3)', transform: aoeForm.color === color ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.1s' }} />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="font-cinzel" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Cancelar</button>
            <button type="submit" className="font-cinzel torch-glow" style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>INVOCAR</button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditarProps {
  selectedAoeToken: any;
  setSelectedAoeToken: (v: any) => void;
  socket: any;
  onClose: () => void;
}

/** Modal para editar un área de efecto existente (rotación, color, eliminar). */
export function ModalEditarAoe({ selectedAoeToken, setSelectedAoeToken, socket, onClose }: EditarProps) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={onClose}>
      <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '450px', padding: '30px', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
        <h3 className="font-cinzel" style={{ margin: '0 0 20px 0', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>EDITAR ÁREA DE EFECTO</h3>

        <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>ROTACIÓN (Grados)</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="range" min="0" max="360"
                value={selectedAoeToken.aoeData?.rotation || 0}
                onChange={e => {
                  const newRot = parseInt(e.target.value) || 0;
                  setSelectedAoeToken({ ...selectedAoeToken, aoeData: { ...selectedAoeToken.aoeData, rotation: newRot } });
                  socket.emit('token:update-aoe', { tokenId: selectedAoeToken.instanceId, aoeData: { ...selectedAoeToken.aoeData, rotation: newRot } });
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
              const transformOrigin = 'center';

              if (aoe.shape === 'circle') {
                const radPx = aoe.size1 * miniCell;
                w = radPx * 2; h = radPx * 2;
                svgContent = <circle cx={radPx} cy={radPx} r={radPx} fill={aoe.color} fillOpacity={0.6} stroke={aoe.color} strokeWidth={1} />;
              } else if (aoe.shape === 'line') {
                w = aoe.size1 * miniCell; h = aoe.size2 * miniCell;
                svgContent = <rect x={0} y={0} width={w} height={h} fill={aoe.color} fillOpacity={0.6} stroke={aoe.color} strokeWidth={1} />;
              } else if (aoe.shape === 'cone') {
                w = aoe.size1 * miniCell; h = w;
                svgContent = <polygon points={`0,${h / 2} ${w},0 ${w},${h}`} fill={aoe.color} fillOpacity={0.6} stroke={aoe.color} strokeWidth={1} strokeLinejoin="round" />;
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
            {COLORES_AOE.map(color => (
              <div
                key={color}
                onClick={() => {
                  setSelectedAoeToken({ ...selectedAoeToken, aoeData: { ...selectedAoeToken.aoeData, color } });
                  socket.emit('token:update-aoe', { tokenId: selectedAoeToken.instanceId, aoeData: { ...selectedAoeToken.aoeData, color } });
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
              onClose();
            }}
            className="font-cinzel"
            style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--combat-red)', border: '1px solid var(--combat-red)', padding: '10px 15px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}
          >
            ELIMINAR ÁREA
          </button>
          <button onClick={onClose} className="font-cinzel" style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>LISTO</button>
        </div>
      </div>
    </div>
  );
}
