import { useState, useEffect } from 'react';
import { X, Book, Plus, BookOpen, Globe, Users, Loader, Trash2, Download, Eye, Library } from 'lucide-react';
import { BookDetail } from './BookDetail';
import { BookCreateModal } from './BookCreateModal';

interface BooksLibraryProps {
  socket: any;
  onClose: () => void;
}

export function BooksLibrary({ socket, onClose }: BooksLibraryProps) {
  const [tab, setTab] = useState<'library' | 'discover' | 'create'>('library');
  const [library, setLibrary] = useState<any[]>([]);
  const [discover, setDiscover] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchLibrary = () => {
    setLoading(true);
    socket.emit('books:my_library');
  };

  const fetchDiscover = () => {
    setLoading(true);
    socket.emit('books:discover');
  };

  useEffect(() => {
    fetchLibrary();

    const libraryHandler = (data: any[]) => { setLibrary(data); setLoading(false); };
    const discoverHandler = (data: any[]) => { setDiscover(data); setLoading(false); };
    const createdHandler = () => { fetchLibrary(); };
    const updatedHandler = () => { fetchLibrary(); };
    const deletedHandler = () => { fetchLibrary(); };
    const addedHandler = () => { fetchLibrary(); };
    const removedHandler = () => { fetchLibrary(); };

    socket.on('books:library', libraryHandler);
    socket.on('books:discover_results', discoverHandler);
    socket.on('books:created', createdHandler);
    socket.on('books:updated', updatedHandler);
    socket.on('books:deleted', deletedHandler);
    socket.on('books:added', addedHandler);
    socket.on('books:removed', removedHandler);

    return () => {
      socket.off('books:library', libraryHandler);
      socket.off('books:discover_results', discoverHandler);
      socket.off('books:created', createdHandler);
      socket.off('books:updated', updatedHandler);
      socket.off('books:deleted', deletedHandler);
      socket.off('books:added', addedHandler);
      socket.off('books:removed', removedHandler);
    };
  }, []);

  useEffect(() => {
    if (tab === 'discover') fetchDiscover();
  }, [tab]);

  const handleRemove = (bookId: number) => {
    if (bookId === 1) return;
    socket.emit('books:remove_from_library', { bookId });
  };

  const handleAdd = (bookId: number) => {
    socket.emit('books:add_to_library', { bookId });
    setTab('library');
  };

  if (selectedBook !== null) {
    return <BookDetail socket={socket} bookId={selectedBook} onClose={() => setSelectedBook(null)} />;
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '40px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-gold-subtle)', borderRadius: 'var(--radius-lg)', width: '600px', maxWidth: '90vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-modal)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Library size={18} style={{ color: 'var(--accent-gold)' }} />
            <h3 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '0.9rem', letterSpacing: '1px' }}>BIBLIOTECA</h3>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => { setShowCreate(true); }} style={{ background: 'none', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', borderRadius: '4px', padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
              <Plus size={14} /> Crear libro
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}><X size={18} /></button>
          </div>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
          {[
            { id: 'library', label: 'Mi biblioteca', icon: BookOpen },
            { id: 'discover', label: 'Descubrir', icon: Globe },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: tab === t.id ? 'var(--bg-raised)' : 'transparent', border: 'none', color: tab === t.id ? 'var(--accent-gold)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, borderBottom: tab === t.id ? '2px solid var(--accent-gold)' : '2px solid transparent', transition: 'all 0.15s' }}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader size={24} style={{ color: 'var(--accent-gold)', animation: 'spin 0.8s linear infinite' }} /></div>
          ) : tab === 'library' ? (
            library.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>Tu biblioteca está vacía</div>
                <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Descubre libros públicos o crea el tuyo propio.</div>
              </div>
            ) : (
              library.map(book => (
                <div
                  key={book.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onClick={() => setSelectedBook(book.id)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Book size={22} style={{ color: book.is_official ? 'var(--accent-gold)' : 'var(--text-secondary)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="font-cinzel" style={{ fontSize: '0.9rem', color: 'var(--text-parchment)', fontWeight: 600 }}>{book.name}</span>
                      {book.is_official && (
                        <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: '6px', background: 'rgba(200,135,42,0.15)', color: 'var(--accent-gold)', textTransform: 'uppercase', fontWeight: 600 }}>Oficial</span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', gap: '12px' }}>
                      <span>{book.item_count || 0} items</span>
                      {book.author_name && <span>por {book.author_name}</span>}
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleRemove(book.id); }}
                    disabled={book.id === 1}
                    style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '6px', color: book.id === 1 ? 'var(--border-subtle)' : 'var(--combat-red)', cursor: book.id === 1 ? 'not-allowed' : 'pointer', display: 'flex', opacity: book.id === 1 ? 0.3 : 1 }}
                    title={book.id === 1 ? 'No puedes quitar el libro oficial' : 'Quitar de mi biblioteca'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )
          ) : (
            discover.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Globe size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>No hay libros disponibles</div>
                <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Crea tu propio libro y publícalo para que otros lo descubran.</div>
              </div>
            ) : (
              discover.map(book => (
                <div
                  key={book.id}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onClick={() => setSelectedBook(book.id)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'var(--bg-base)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Book size={22} style={{ color: book.is_official ? 'var(--accent-gold)' : 'var(--text-secondary)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="font-cinzel" style={{ fontSize: '0.9rem', color: 'var(--text-parchment)', fontWeight: 600 }}>{book.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', display: 'flex', gap: '12px' }}>
                      <span>{book.item_count || 0} items</span>
                      <span>por {book.owner_name || 'Desconocido'}</span>
                    </div>
                    {book.description && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.description}</div>
                    )}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleAdd(book.id); }}
                    style={{ background: 'var(--accent-gold)', border: 'none', borderRadius: '4px', padding: '8px 14px', color: '#000', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Download size={14} /> Añadir
                  </button>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {showCreate && (
        <BookCreateModal
          socket={socket}
          onClose={() => setShowCreate(false)}
          onCreated={() => { fetchLibrary(); setTab('library'); }}
        />
      )}
    </div>
  );
}
