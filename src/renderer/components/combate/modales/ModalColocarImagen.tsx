interface Props {
  imageUrlInput: string;
  onFileChange: (e: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

/** Modal para colocar una imagen en el mapa (con vista previa). */
export function ModalColocarImagen({ imageUrlInput, onFileChange, onSubmit, onClose }: Props) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={onClose}>
      <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '450px', padding: '30px', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
        <h3 className="font-cinzel" style={{ margin: '0 0 20px 0', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>🖼️ COLOCAR IMAGEN</h3>
        <form onSubmit={onSubmit}>
          <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>CARGAR ARCHIVO DE IMAGEN</label>
          <input type="file" accept="image/*" onChange={onFileChange} style={{ color: 'white', marginBottom: '20px', fontSize: '0.9rem' }} />
          {imageUrlInput && (
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '5px' }}>VISTA PREVIA</span>
              <img src={imageUrlInput} alt="Preview" style={{ maxWidth: '100%', maxHeight: '150px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="font-cinzel" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Cancelar</button>
            <button type="submit" className="font-cinzel torch-glow" style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px', opacity: imageUrlInput ? 1 : 0.5 }} disabled={!imageUrlInput}>COLOCAR</button>
          </div>
        </form>
      </div>
    </div>
  );
}
