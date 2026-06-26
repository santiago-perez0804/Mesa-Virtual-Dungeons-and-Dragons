import { Filter, Search } from 'lucide-react';

import { HeroCard } from '../ui/CartaHeroe';
import { characterManagerStyles as styles } from '../../modules/personaje/personaje.styles';
import {
  parseCharacterClasses,
  type CharacterSortKey
} from '../../modules/personaje/personaje.listado';

const sortOptions: Array<{ key: CharacterSortKey; label: string }> = [
  { key: 'none', label: 'Sin ordenar' },
  { key: 'level-asc', label: 'Nivel (asc)' },
  { key: 'level-desc', label: 'Nivel (desc)' },
  { key: 'class', label: 'Por clase' },
  { key: 'hp', label: 'Por PG' }
];

const getSortLabel = (sortBy: CharacterSortKey) => {
  if (sortBy === 'none') return 'Filtrar';
  if (sortBy === 'level-asc') return 'Nivel (Asc)';
  if (sortBy === 'level-desc') return 'Nivel (Desc)';
  if (sortBy === 'class') return 'Clase';
  return 'PG';
};

type CharacterListPanelProps = {
  isOverlay: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sortBy: CharacterSortKey;
  setSortBy: (value: CharacterSortKey) => void;
  sortDropdownOpen: boolean;
  setSortDropdownOpen: (value: boolean) => void;
  sortedCharacters: any[];
  onCreateCharacter: () => void;
  onOpenCharacter: (character: any) => void;
};

export const CharacterListPanel = ({
  isOverlay,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortDropdownOpen,
  setSortDropdownOpen,
  sortedCharacters,
  onCreateCharacter,
  onOpenCharacter
}: CharacterListPanelProps) => {
  return (
    <section style={{ display: isOverlay ? 'none' : 'block' }}>
      <div style={{ position: 'relative', marginBottom: 'var(--search-container-margin)' }}>
        <div className="clipped-frame" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', zIndex: 0 }} />

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: 'var(--search-container-padding)', position: 'relative', zIndex: 1 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              className="mono"
              style={{ ...styles.input, paddingLeft: 'var(--search-input-padding-left)' }}
              placeholder="Buscar héroe en la reserva..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <Search size={18} style={{ position: 'absolute', left: 'var(--search-icon-left)', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={(event) => { event.stopPropagation(); setSortDropdownOpen(!sortDropdownOpen); }}
              className="font-cinzel torch-glow"
              style={{
                background: 'transparent',
                color: 'var(--accent-gold)',
                border: '1px solid var(--accent-gold)',
                padding: 'var(--search-input-padding)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={event => {
                event.currentTarget.style.background = 'rgba(200, 135, 42, 0.1)';
              }}
              onMouseLeave={event => {
                event.currentTarget.style.background = 'transparent';
              }}
            >
              <Filter size={16} />
              <span className="mono" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                {getSortLabel(sortBy)}
              </span>
            </button>

            {sortDropdownOpen && (
              <div
                className="clipped-frame"
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--accent-gold)',
                  borderRadius: '4px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.8)',
                  zIndex: 100,
                  minWidth: '160px',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '5px 0'
                }}
              >
                {sortOptions.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => {
                      setSortBy(option.key);
                      setSortDropdownOpen(false);
                    }}
                    style={{
                      background: sortBy === option.key ? 'rgba(200, 135, 42, 0.15)' : 'transparent',
                      border: 'none',
                      color: sortBy === option.key ? 'var(--accent-gold)' : 'var(--text-parchment)',
                      padding: '10px 15px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-body)',
                      width: '100%',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={event => {
                      event.currentTarget.style.background = 'rgba(200, 135, 42, 0.25)';
                    }}
                    onMouseLeave={event => {
                      event.currentTarget.style.background = sortBy === option.key ? 'rgba(200, 135, 42, 0.15)' : 'transparent';
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onCreateCharacter}
            className="font-cinzel torch-glow"
            style={{
              background: 'transparent',
              color: 'var(--accent-gold)',
              border: '1px solid var(--accent-gold)',
              padding: 'var(--search-input-padding)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              letterSpacing: '1px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={event => {
              event.currentTarget.style.background = 'var(--accent-gold)';
              event.currentTarget.style.color = '#111';
            }}
            onMouseLeave={event => {
              event.currentTarget.style.background = 'transparent';
              event.currentTarget.style.color = 'var(--accent-gold)';
            }}
          >
            <span style={{ fontSize: '1.1rem', lineHeight: '1' }}>+</span> Nuevo Héroe
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(var(--char-grid-minmax), 1fr))', gap: 'var(--char-grid-gap)' }}>
        {sortedCharacters.map((character: any) => {
          const parsedClass = parseCharacterClasses(character.class);
          const className = Object.keys(parsedClass)[0] || 'Clase';
          return (
            <HeroCard
              key={character.id}
              character={{ ...character, class: className }}
              onClick={() => onOpenCharacter(character)}
            />
          );
        })}
        {sortedCharacters.length === 0 && (
          <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
            No se encontraron aventureros...
          </div>
        )}
      </div>
    </section>
  );
};
