import { StickyNote } from 'lucide-react';

interface Props {
  noteText: string;
  setNoteText: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

/** Modal para crear una nota de texto en el mapa. */
export function ModalCrearNota({ noteText, setNoteText, onSubmit, onClose }: Props) {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10001 }} onClick={onClose}>
      <div className="clipped-frame" style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)', width: '100%', maxWidth: '450px', padding: '30px', boxShadow: '0 0 50px rgba(0,0,0,0.9)' }} onClick={e => e.stopPropagation()}>
        <h3 className="font-cinzel" style={{ margin: '0 0 20px 0', color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}><StickyNote className="w-5 h-5 inline-block mr-2" /> CREAR NOTA EN MAPA</h3>
        <form onSubmit={onSubmit}>
          <label className="font-cinzel" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>CONTENIDO DE LA NOTA</label>
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Escribe el texto de la nota aquí..."
            rows={5}
            style={{ background: 'var(--bg-base)', border: '1px solid var(--border-color)', color: 'white', padding: '12px', width: '100%', borderRadius: '4px', boxSizing: 'border-box', fontSize: '0.95rem', outline: 'none', marginBottom: '20px', resize: 'vertical', fontFamily: 'inherit' }}
          />
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="font-cinzel" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' }}>Cancelar</button>
            <button type="submit" className="font-cinzel torch-glow" style={{ background: 'var(--accent-gold)', color: '#000', border: 'none', padding: '10px 25px', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>COLOCAR</button>
          </div>
        </form>
      </div>
    </div>
  );
}
