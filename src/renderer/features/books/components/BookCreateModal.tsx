import { useState } from 'react';
import { X, Book } from 'lucide-react';

interface BookCreateModalProps {
  socket: any;
  onClose: () => void;
  onCreated: () => void;
  initialData?: { name: string; description: string };
  bookId?: number | null;
}

export function BookCreateModal({ socket, onClose, onCreated, initialData, bookId }: BookCreateModalProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    setSaving(true);
    if (bookId) {
      socket.emit('books:update', { bookId, name: name.trim(), description: description.trim() || null });
      socket.once('books:updated', () => { setSaving(false); onCreated(); onClose(); });
    } else {
      socket.emit('books:create', { name: name.trim(), description: description.trim() || null });
      socket.once('books:created', () => { setSaving(false); onCreated(); onClose(); });
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-gold-subtle)', borderRadius: 'var(--radius-lg)', width: '420px', maxWidth: '90vw', boxShadow: 'var(--shadow-modal)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Book size={18} style={{ color: 'var(--accent-gold)' }} />
            <h3 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '0.9rem', letterSpacing: '1px' }}>
              {bookId ? 'EDITAR LIBRO' : 'NUEVO LIBRO'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
        </div>
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Nombre del libro</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Grimorio de la Costa Olvidada" style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-parchment)', boxSizing: 'border-box', fontSize: '0.9rem' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Descripción</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe de qué trata este compendio..." rows={4} style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-parchment)', resize: 'vertical', boxSizing: 'border-box', fontSize: '0.9rem' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
            <button onClick={onClose} style={{ padding: '10px 18px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Cancelar</button>
            <button onClick={handleSave} disabled={!name.trim() || saving} style={{ padding: '10px 18px', background: !name.trim() ? 'rgba(200,135,42,0.3)' : 'var(--accent-gold)', border: 'none', color: '#000', borderRadius: '4px', cursor: !name.trim() ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
              {saving ? 'Guardando...' : bookId ? 'Guardar cambios' : 'Crear libro'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
