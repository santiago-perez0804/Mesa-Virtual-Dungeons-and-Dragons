import { formatDescription } from '../../utils/formateador';

export const FeatureDetail = ({ selectedFeature, setSelectedFeature, openEditFeatureForm, handleDeleteFeature, userRole }: any) => {
  if (!selectedFeature) return null;
  return (
              <>
                <div 
                  style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    background: 'rgba(0,0,0,0.95)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    zIndex: 10000, 
                    padding: '40px' 
                  }} 
                  onClick={() => setSelectedFeature(null)}
                >
                  <div 
                    className="clipped-frame" 
                    style={{ 
                      background: 'var(--bg-surface)', 
                      border: '1px solid var(--border-color)', 
                      width: '100%', 
                      maxWidth: '650px', 
                      maxHeight: '85vh', 
                      overflowY: 'auto', 
                      padding: '40px', 
                      boxShadow: '0 0 100px rgba(0,0,0,1)',
                      position: 'relative'
                    }} 
                    onClick={e => e.stopPropagation()}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', borderBottom: '2px solid var(--border-color)', paddingBottom: '20px' }}>
                      <div>
                        <h1 className="font-cinzel" style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '2.4rem', textShadow: '0 0 20px rgba(200, 135, 42, 0.2)' }}>{selectedFeature.name}</h1>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '10px' }}>
                          <span className="font-cinzel" style={{ border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', fontSize: '0.75rem', padding: '4px 10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {selectedFeature.class}{selectedFeature.subclass ? `: ${selectedFeature.subclass}` : ''}
                          </span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>•</span>
                          <span className="mono" style={{ color: 'var(--text-parchment)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                            Nivel de obtención: {selectedFeature.level}º
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedFeature(null)} 
                        style={{ 
                          background: 'transparent', 
                          border: 'none', 
                          color: 'var(--text-secondary)', 
                          fontSize: '2rem', 
                          cursor: 'pointer', 
                          transition: 'color 0.2s' 
                        }} 
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--combat-red)'} 
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                      >
                        ✕
                      </button>
                    </div>

                    <div style={{ color: 'var(--text-parchment)', lineHeight: '1.8', fontSize: '1.05rem', fontFamily: 'var(--font-body)', marginBottom: '30px' }} dangerouslySetInnerHTML={{ __html: formatDescription(selectedFeature.description) }}>

                    </div>

                    {(userRole === 'admin' || userRole === 'dm') && selectedFeature.id && (
                      <div style={{ padding: '20px 0 0 0', borderTop: '2px solid var(--border-color)', display: 'flex', gap: '20px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => { openEditFeatureForm(selectedFeature); setSelectedFeature(null); }} 
                          className="font-cinzel" 
                          style={{ background: 'transparent', color: 'var(--text-parchment)', border: '1px solid var(--border-color)', padding: '10px 25px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          EDITAR RASGO
                        </button>
                        {selectedFeature.id && !isNaN(Number(selectedFeature.id)) ? (
                          <button 
                            onClick={() => handleDeleteFeature(selectedFeature.id)} 
                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--combat-red)', color: 'var(--combat-red)', padding: '10px 25px', cursor: 'pointer', fontSize: '0.85rem' }}
                            className="font-cinzel"
                          >
                            ELIMINAR RASGO
                          </button>
                        ) : (
                          <button 
                            onClick={() => alert("Los rasgos nativos o integrados del sistema no se pueden eliminar, pero puedes editarlos para modificarlos.")} 
                            style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', opacity: 0.5, padding: '10px 25px', cursor: 'pointer', fontSize: '0.85rem' }}
                            className="font-cinzel"
                            title="Los rasgos base del sistema no se pueden eliminar, solo editar."
                          >
                            ELIMINAR RASGO
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>

  );
};
