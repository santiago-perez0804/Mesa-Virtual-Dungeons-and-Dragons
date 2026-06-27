import React from 'react';
import { Pencil, X, User, ChevronUp } from 'lucide-react';

interface CharacterSheetHeaderProps {
  selectedCharacter: any;
  setSelectedCharacter: (c: any) => void;
  startEdit: (c: any) => void;
  onCloseOverlay?: () => void;
  setIsLevelingUp: (val: boolean) => void;
  setLevelUpClass: (val: string) => void;
  parsedClasses: Record<string, number>;
  classesDisplay: string;
  userRole: string;
  handleDelete: (id: number) => void;
}

export const CharacterSheetHeader: React.FC<CharacterSheetHeaderProps> = ({
  selectedCharacter,
  setSelectedCharacter,
  startEdit,
  onCloseOverlay,
  setIsLevelingUp,
  setLevelUpClass,
  parsedClasses,
  classesDisplay,
  userRole,
  handleDelete
}) => {
  return (
    <>
      <div style={{ position: 'absolute', top: 'var(--char-sheet-header-btn-top)', right: 'var(--char-sheet-header-btn-right)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 }}>
        <button 
          onClick={() => startEdit(selectedCharacter)} 
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', transition: 'all 0.2s' }} 
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--gold-primary)'} 
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'} 
          title="Editar Personaje"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button 
          onClick={() => { setSelectedCharacter(null); if(onCloseOverlay) onCloseOverlay(); }} 
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px', transition: 'all 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.color = 'var(--combat-red)'}
          onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'var(--char-sheet-header-grid)', gap: 'var(--char-sheet-header-gap)', alignItems: 'center' }}>
        <div style={{ width: 'var(--char-sheet-header-avatar-size)', height: 'var(--char-sheet-header-avatar-size)', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--gold-primary)', boxShadow: '0 0 20px rgba(200,135,42,0.4)' }}>
          {selectedCharacter.image ? (
            <img src={selectedCharacter.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--char-sheet-header-avatar-font)' }}><User className="w-full h-full p-2" /></div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <h1 className="font-cinzel" style={{ margin: 0, color: 'var(--gold-primary)', fontSize: 'var(--char-sheet-header-name-size)', lineHeight: '1.1', textShadow: '0 0 10px rgba(200,135,42,0.2)' }}>{selectedCharacter.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>
                <span className="font-cinzel" style={{ fontSize: 'var(--char-sheet-header-level-size)', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Nivel {selectedCharacter.level || 1}</span>
              </div>
              <button 
                onClick={() => { setIsLevelingUp(true); setLevelUpClass(Object.keys(parsedClasses)[0] || 'Guerrero'); }} 
                style={{ background: 'none', border: 'none', color: '#27ae60', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.color = '#2ecc71'; e.currentTarget.style.transform = 'scale(1.2)'; }}
                onMouseOut={(e) => { e.currentTarget.style.color = '#27ae60'; e.currentTarget.style.transform = 'scale(1)'; }}
                title="Subir Nivel"
              >
                <ChevronUp className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="font-cinzel" style={{ fontSize: 'var(--char-sheet-header-race-size)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {selectedCharacter.race || 'Humano'} ✦ {classesDisplay}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {(userRole === 'dm' || userRole === 'admin') && <button onClick={() => { handleDelete(selectedCharacter.id); setSelectedCharacter(null); if(onCloseOverlay) onCloseOverlay(); }} style={{ background: 'rgba(192,57,43,0.2)', color: 'var(--combat-red)', border: '1px solid rgba(192,57,43,0.4)', padding: '8px 16px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>BORRAR</button>}
        </div>
      </div>
    </>
  );
};
