import { HeroCard } from '../../../components/ui/CartaHeroe';

export const HeroGrid = (props: any) => {
  const { searchTerm, setSearchTerm, filteredCharacters, parseClasses, openCharacterSheet, resetForm, setIsCreating, styles } = props;
  return (
    <>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: 'var(--search-container-margin)', background: 'var(--bg-surface)', padding: 'var(--search-container-padding)', border: '1px solid var(--border-color)' }} className="clipped-frame">
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              className="mono"
              style={{ ...styles.input, paddingLeft: 'var(--search-input-padding-left)' }}
              placeholder="Buscar héroe en la reserva..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span style={{ position: 'absolute', left: 'var(--search-icon-left)', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(var(--char-grid-minmax), 1fr))', gap: 'var(--char-grid-gap)' }}>
          {/* Botón de Crear Nuevo Héroe (Dashed Card) */}
          <div
            onClick={() => { resetForm(); setIsCreating(true); }}
            style={{
              border: '2px dashed var(--accent-gold)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              minHeight: 'var(--hero-card-min-height)',
              transition: 'all 0.2s ease',
              background: 'rgba(200, 135, 42, 0.05)',
              color: 'var(--accent-gold)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(200, 135, 42, 0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(200, 135, 42, 0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ fontSize: 'var(--hero-card-plus-size)', marginBottom: '10px' }}>+</span>
            <span className="font-cinzel" style={{ fontSize: 'var(--hero-card-title-size)', fontWeight: 'bold', letterSpacing: '1px' }}>NUEVO HÉROE</span>
          </div>

          {filteredCharacters.map((c: any) => {
            const parsedCls = parseClasses(c.class);
            const className = Object.keys(parsedCls)[0] || 'Clase';
            return (
              <HeroCard
                key={c.id}
                character={{ ...c, class: className }}
                onClick={() => openCharacterSheet(c)}
              />
            );
          })}
          {filteredCharacters.length === 0 && <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>No se encontraron aventureros...</div>}
        </div>
    </>
  );
};
