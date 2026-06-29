import { useState, useEffect } from 'react';
import { X, Book, Swords, Scroll, Shield, Sparkles, Users, Languages, Loader, ChevronLeft, AlertTriangle } from 'lucide-react';

interface BookDetailProps {
  socket: any;
  bookId: number;
  onClose: () => void;
}

const typeIcons: Record<string, any> = {
  monster: Swords, spell: Sparkles, item: Shield, class: Book,
  subclass: Book, race: Users, subrace: Users, condition: AlertTriangle,
  language: Languages, rule: Scroll, rule_section: Scroll
};

const typeLabels: Record<string, string> = {
  monster: 'Monstruos', spell: 'Conjuros', item: 'Objetos', class: 'Clases',
  subclass: 'Subclases', race: 'Razas', subrace: 'Subrazas',
  condition: 'Condiciones', language: 'Idiomas', rule: 'Reglas'
};

export function BookDetail({ socket, bookId, onClose }: BookDetailProps) {
  const [book, setBook] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [grouped, setGrouped] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [showAllItems, setShowAllItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    socket.emit('books:my_library');
    socket.emit('books:get_content', { bookId });

    const cleanup: (() => void)[] = [];

    const libraryHandler = (data: any[]) => {
      const found = data.find((b: any) => b.id === bookId);
      if (found) setBook(found);
    };
    socket.on('books:library', libraryHandler);
    cleanup.push(() => socket.off('books:library', libraryHandler));

    const contentHandler = (data: any) => {
      if (data.bookId === bookId) {
        setItems(data.items);
        const grouped: Record<string, any[]> = {};
        for (const item of data.items) {
          const type = item.type === 'rule_section' ? 'rule' : item.type;
          if (!grouped[type]) grouped[type] = [];
          grouped[type].push(item);
        }
        setGrouped(grouped);
        setLoading(false);
      }
    };
    socket.on('books:content', contentHandler);
    cleanup.push(() => socket.off('books:content', contentHandler));

    return () => cleanup.forEach(fn => fn());
  }, [bookId]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '40px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-gold-subtle)', borderRadius: 'var(--radius-lg)', width: '600px', maxWidth: '90vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-modal)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}><ChevronLeft size={18} /></button>
            <Book size={18} style={{ color: 'var(--accent-gold)' }} />
            <div>
              <h3 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '0.95rem', letterSpacing: '0.5px' }}>{book?.name || 'Cargando...'}</h3>
              {book?.author_name && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>por {book.author_name}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {book?.is_official && (
              <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '8px', background: 'rgba(200,135,42,0.15)', color: 'var(--accent-gold)', textTransform: 'uppercase', fontWeight: 600 }}>Oficial</span>
            )}
            {book?.is_public && !book?.is_official && (
              <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', color: '#10b981', textTransform: 'uppercase', fontWeight: 600 }}>Público</span>
            )}
          </div>
        </div>

        {book?.description && (
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
            {book.description}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader size={24} style={{ color: 'var(--accent-gold)', animation: 'spin 0.8s linear infinite' }} /></div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <Book size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <div>Este libro aún no tiene contenido.</div>
              <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Añade monstruos, conjuros, objetos y más desde el compendio.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(grouped).map(([type, typeItems]) => {
                const Icon = typeIcons[type] || Book;
                const label = typeLabels[type] || type;
                const isExpanded = showAllItems[type] || typeItems.length <= 10;
                const visible = isExpanded ? typeItems : typeItems.slice(0, 10);
                return (
                  <div key={type}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Icon size={16} style={{ color: 'var(--accent-gold)' }} />
                      <span className="font-cinzel" style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>{typeItems.length} items</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {visible.map((item: any) => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderBottom: '1px solid var(--border-subtle)', fontSize: '0.85rem', color: 'var(--text-parchment)' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {item.data?.image ? (
                              <img src={item.data.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                            ) : (
                              <Icon size={12} style={{ color: 'var(--text-secondary)' }} />
                            )}
                          </div>
                          <span style={{ flex: 1 }}>{item.name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{item.source === 'srd' ? 'SRD' : 'Homebrew'}</span>
                        </div>
                      ))}
                      {typeItems.length > 10 && !isExpanded && (
                        <button onClick={() => setShowAllItems(prev => ({ ...prev, [type]: true }))} style={{ padding: '6px 8px', background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', fontSize: '0.8rem', textAlign: 'left' }}>
                          + ver {typeItems.length - 10} más...
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
