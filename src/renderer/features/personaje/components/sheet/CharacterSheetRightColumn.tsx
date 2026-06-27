import React from 'react';
import { calcMod } from '../../../../../utils/dnd-calculos';
import { formatDescription } from '../../../../utils/formateador';
import { CharacterInventoryTab } from '../../../../components/personaje/PestanaInventarioPersonaje';

interface CharacterSheetRightColumnProps {
  selectedCharacter: any;
  getEffectiveStat: (statKey: string) => number;
  setSelectedAttributeForModal: (key: string) => void;
  dbRaces: any[];
  setActiveSlotIndex: (index: number | null) => void;
}

export const CharacterSheetRightColumn: React.FC<CharacterSheetRightColumnProps> = ({
  selectedCharacter,
  getEffectiveStat,
  setSelectedAttributeForModal,
  dbRaces,
  setActiveSlotIndex
}) => {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--char-sheet-body-gap)' }}>
      {/* Atributos */}
      <div>
        <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '10px', fontSize: '0.8rem' }}>ATRIBUTOS</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(var(--char-sheet-attr-minmax), 1fr))', gap: 'var(--char-sheet-attr-gap)' }}>
          {['fue', 'dex', 'con', 'int', 'sab', 'car'].map((key) => {
            const effectiveValue = getEffectiveStat(key);
            const mod = calcMod(effectiveValue);
            const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
            const modColor = mod > 0 ? 'var(--gold-primary)' : (mod < 0 ? '#e74c3c' : 'white');
            return (
              <div 
                key={key} 
                className="attribute-card-hover" 
                onClick={() => setSelectedAttributeForModal(key)}
                style={{ 
                  background: 'var(--bg-base)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '6px', 
                  padding: 'var(--char-sheet-attr-padding)', 
                  textAlign: 'center', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                  cursor: 'pointer'
                }}
              >
                <div className="font-cinzel" style={{ fontSize: 'var(--char-sheet-attr-title-size)', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '0.5px' }}>{key.toUpperCase()}</div>
                <div className="mono" style={{ fontSize: 'var(--char-sheet-attr-val-size)', fontWeight: 'bold', color: modColor, margin: '6px 0', textShadow: '0 0 5px rgba(255,255,255,0.05)' }}>{modStr}</div>
                <div className="mono" style={{ fontSize: 'var(--char-sheet-attr-base-size)', background: 'rgba(255,255,255,0.05)', padding: '3px 12px', borderRadius: '4px', color: 'var(--text-secondary)' }}>{effectiveValue}</div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Imagen Fullbody y Descripción */}
      <div style={{ display: 'flex', gap: 'var(--char-sheet-portrait-gap)', alignItems: 'flex-start', marginTop: '10px', flexDirection: 'var(--char-sheet-portrait-direction)' as any }}>
        {/* Imagen 2:3 */}
         <div style={{ width: 'var(--char-sheet-portrait-w)', height: 'var(--char-sheet-portrait-h)', borderRadius: '4px', border: '1px solid var(--border-color)', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
           {(() => {
             const baseRace = (selectedCharacter.race || 'Humano').split(' ')[0].trim();
             const dbRaceMatch = dbRaces.find(r => r.name === baseRace || r.id === baseRace);
             const defaultPortrait = dbRaceMatch?.image || '';
             const displayImage = selectedCharacter.full_body_image || defaultPortrait;
             return (
               <img src={displayImage} alt="Cuerpo Entero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
             );
           })()}
         </div>
        {/* Descripción */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', height: 'var(--char-sheet-portrait-desc-h, var(--char-sheet-portrait-h))', width: '100%' }}>
          <h4 className="font-cinzel" style={{ color: 'var(--accent-gold)', margin: 0, fontSize: '0.8rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', letterSpacing: '1px' }}>TRASFONDO</h4>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
            <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: '1.5', fontSize: '0.85rem', fontStyle: selectedCharacter.description ? 'normal' : 'italic' }} dangerouslySetInnerHTML={{ __html: formatDescription(selectedCharacter.description || "Este aventurero aún no tiene una descripción escrita...") }} />
          </div>
        </div>
      </div>
      
      <CharacterInventoryTab character={selectedCharacter} setActiveSlotIndex={setActiveSlotIndex} />
    </div>
  );
};
