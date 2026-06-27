import { useState, useMemo } from 'react';
import { X, Search, Book } from 'lucide-react';
import { typeIcons } from './CompendiumUtils';
import { DatabaseDetail } from '../../../components/compendium/DetalleBaseDatos';

const CATEGORIES = ['all', 'monster', 'spell', 'item', 'class', 'subclass', 'race', 'subrace', 'condition', 'language', 'features', 'rule'] as const;
const PAGE_SIZE = 32;

type Category = typeof CATEGORIES[number];

const categoryLabel: Record<string, string> = {
  all: 'Todos', monster: 'Monstruos', spell: 'Hechizos', item: 'Objetos',
  class: 'Clases', subclass: 'Subclases', race: 'Razas', subrace: 'Subrazas',
  condition: 'Estados', language: 'Idiomas', features: 'Rasgos', rule: 'Reglas'
};

export const MiniCompendium = ({ compendium, onClose }: any) => {
  const [category, setCategory] = useState<Category>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const matchesCategory = (item: any) =>
    category === 'all' || item.type === category || (category === 'rule' && item.type === 'rule_section');

  const filtered = useMemo(() => {
    return compendium
      .filter((item: any) => matchesCategory(item))
      .filter((item: any) => item.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [compendium, category, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleCategory = (cat: Category) => {
    setCategory(cat);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleSelectItem = (item: any) => {
    setSelectedItem(item);
  };

  const getSubtitle = (item: any, data: any) => {
    if (item.type === 'monster') {
      const cr = data.cr ?? data.challenge_rating ?? '?';
      return `CR ${cr}`;
    }
    if (item.type === 'spell') {
      const level = data.level !== undefined ? (data.level === 0 ? 'Truco' : `Nivel ${data.level}`) : '';
      const school = typeof data.school === 'object' ? data.school?.name : data.school;
      return [level, school].filter(Boolean).join(' · ');
    }
    if (item.type === 'item') {
      return data.rarity || '';
    }
    const desc = data.description || data.desc || '';
    const descStr = Array.isArray(desc) ? desc.join(' ') : String(desc);
    return descStr.slice(0, 80) + (descStr.length > 80 ? '...' : '');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
        <h2 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '1.4rem', letterSpacing: '2px' }}>Compendio</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
            <input
              className="mono clipped-frame"
              style={{ width: '260px', padding: '8px 12px 8px 34px', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-parchment)', outline: 'none', fontSize: '0.85rem' }}
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* SIDEBAR */}
        <div style={{ width: '180px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', padding: '12px 0', overflowY: 'auto', flexShrink: 0 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              className="font-cinzel"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 16px',
                background: category === cat ? 'rgba(200,135,42,0.1)' : 'transparent',
                color: category === cat ? 'var(--accent-gold)' : 'var(--text-secondary)',
                border: 'none',
                borderLeft: category === cat ? '3px solid var(--accent-gold)' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '0.8rem',
                textAlign: 'left',
                transition: 'all 0.15s',
                width: '100%'
              }}
            >
              <span style={{ flexShrink: 0, display: 'flex' }}>{typeIcons[cat]}</span>
              <span>{categoryLabel[cat]}</span>
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '20px 24px', minWidth: 0 }}>
          {pagedItems.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '60px 20px', fontSize: '0.9rem' }}>
              No hay resultados en esta categoría.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {pagedItems.map((item: any) => {
                let data: any = {};
                try { data = item.data ? (typeof item.data === 'string' ? JSON.parse(item.data) : item.data) : {}; } catch { data = {}; }
                return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectItem(item)}
                      className="clipped-frame torch-glow"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 16px',
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-normal)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        minWidth: 0
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-raised)'; e.currentTarget.style.borderColor = 'var(--gold-primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-normal)'; }}
                    >
                      <div style={{ width: '44px', height: '44px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden', background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-subtle)' }}>
                        {data.image ? (
                          <img src={data.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Book color="var(--gold-muted)" size={22} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        <div className="font-cinzel" style={{ fontSize: '1rem', color: 'var(--gold-primary)', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        {getSubtitle(item, data) && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {getSubtitle(item, data)}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', border: '1px solid var(--border-gold-subtle)', padding: '3px 7px', borderRadius: '3px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {item.type}
                      </span>
                    </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '24px' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="font-cinzel"
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: safePage === 1 ? 'var(--text-secondary)' : 'var(--text-parchment)', padding: '6px 16px', cursor: safePage === 1 ? 'default' : 'pointer', fontSize: '0.75rem' }}
              >ANTERIOR</button>
              <span className="mono" style={{ color: 'var(--accent-gold)', fontWeight: 'bold', fontSize: '0.85rem' }}>PÁGINA {safePage} DE {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="font-cinzel"
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: safePage === totalPages ? 'var(--text-secondary)' : 'var(--text-parchment)', padding: '6px 16px', cursor: safePage === totalPages ? 'default' : 'pointer', fontSize: '0.75rem' }}
              >SIGUIENTE</button>
            </div>
          )}
        </div>
      </div>

      {selectedItem && (
        <DatabaseDetail selectedItem={selectedItem} setSelectedItem={setSelectedItem} isOverlay={true} onCloseOverlay={() => setSelectedItem(null)} />
      )}
    </div>
  );
};
