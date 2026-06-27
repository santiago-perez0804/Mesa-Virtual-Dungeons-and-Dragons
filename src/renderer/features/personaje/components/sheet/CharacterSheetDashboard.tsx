import React from 'react';
import { Heart, Shield, Zap, Footprints, Award } from 'lucide-react';
import { calcMod } from '../../../../../utils/dnd-calculos';
import { getProficiencyBonus } from '../../../../modules/personaje/personaje.utilidades';

interface CharacterSheetDashboardProps {
  selectedCharacter: any;
  charStats: any;
  getEffectiveStat: (statKey: string) => number;
  getCharacterBaseSpeed: (race: string) => number;
  setShowACModal: (val: boolean) => void;
  setShowInitiativeModal: (val: boolean) => void;
  setShowSpeedModal: (val: boolean) => void;
  setShowProficiencyModal: (val: boolean) => void;
}

export const CharacterSheetDashboard: React.FC<CharacterSheetDashboardProps> = ({
  selectedCharacter,
  charStats,
  getEffectiveStat,
  getCharacterBaseSpeed,
  setShowACModal,
  setShowInitiativeModal,
  setShowSpeedModal,
  setShowProficiencyModal
}) => {
  const customInitiative = (charStats.customInitiativeModifiers || []).reduce((acc: number, m: any) => acc + m.value, 0);
  const totalInitiativeVal = calcMod(getEffectiveStat('dex')) + customInitiative;
  const initStr = totalInitiativeVal >= 0 ? `+${totalInitiativeVal}` : `${totalInitiativeVal}`;

  const customSpeed = (charStats.customSpeedModifiers || []).reduce((acc: number, m: any) => acc + m.value, 0);
  const baseSpeedVal = getCharacterBaseSpeed(selectedCharacter.race);
  const totalSpeed = baseSpeedVal + customSpeed;

  const customProficiency = (charStats.customProficiencyModifiers || []).reduce((acc: number, m: any) => acc + m.value, 0);
  const totalProficiency = getProficiencyBonus(selectedCharacter.level || 1) + customProficiency;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'var(--char-sheet-dash-columns)', gap: 'var(--char-sheet-dash-gap)', justifyContent: 'center', marginBottom: '10px' }}>
      <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: 'var(--char-sheet-dash-padding)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 'var(--char-sheet-dash-min-height)' }}>
        <Heart size={20} style={{ color: 'var(--gold-primary)', alignSelf: 'center', marginBottom: '8px', width: 'var(--char-sheet-dash-icon-size)', height: 'var(--char-sheet-dash-icon-size)' }} />
        <div className="font-cinzel" style={{ fontSize: 'var(--char-sheet-dash-label-size)', color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Puntos de Golpe</div>
        <div className="mono" style={{ fontSize: 'var(--char-sheet-dash-hp-size)', color: 'var(--gold-primary)', fontWeight: 'bold' }}>
          {selectedCharacter.current_hp || selectedCharacter.max_hp || 10}<span style={{ color: 'rgba(200, 135, 42, 0.6)', fontSize: 'var(--char-sheet-dash-hp-slash-size)', fontWeight: 'normal' }}>/{selectedCharacter.max_hp || 10}</span>
        </div>
      </div>
      
      <div 
        onClick={() => setShowACModal(true)}
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: 'var(--char-sheet-dash-padding)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 'var(--char-sheet-dash-min-height)' }}
        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
        title="Editar Clase de Armadura"
      >
        <Shield size={20} style={{ color: 'var(--gold-primary)', alignSelf: 'center', marginBottom: '8px', width: 'var(--char-sheet-dash-icon-size)', height: 'var(--char-sheet-dash-icon-size)' }} />
        <div className="font-cinzel" style={{ fontSize: 'var(--char-sheet-dash-label-size)', color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Clase de Armadura</div>
        <div className="mono" style={{ fontSize: 'var(--char-sheet-dash-value-size)', color: 'var(--gold-primary)', fontWeight: 'bold' }}>{selectedCharacter.ac || (10 + calcMod(getEffectiveStat('dex')))}</div>
      </div>
      
      <div 
        onClick={() => setShowInitiativeModal(true)}
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: 'var(--char-sheet-dash-padding)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 'var(--char-sheet-dash-min-height)' }}
        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
        title="Editar Iniciativa"
      >
        <Zap size={20} style={{ color: 'var(--gold-primary)', alignSelf: 'center', marginBottom: '8px', width: 'var(--char-sheet-dash-icon-size)', height: 'var(--char-sheet-dash-icon-size)' }} />
        <div className="font-cinzel" style={{ fontSize: 'var(--char-sheet-dash-label-size)', color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Iniciativa</div>
        <div className="mono" style={{ fontSize: 'var(--char-sheet-dash-value-size)', color: 'var(--gold-primary)', fontWeight: 'bold' }}>{initStr}</div>
      </div>

      <div 
        onClick={() => setShowSpeedModal(true)}
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: 'var(--char-sheet-dash-padding)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 'var(--char-sheet-dash-min-height)' }}
        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
        title="Editar Velocidad"
      >
        <Footprints size={20} style={{ color: 'var(--gold-primary)', alignSelf: 'center', marginBottom: '8px', width: 'var(--char-sheet-dash-icon-size)', height: 'var(--char-sheet-dash-icon-size)' }} />
        <div className="font-cinzel" style={{ fontSize: 'var(--char-sheet-dash-label-size)', color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Velocidad</div>
        <div className="mono" style={{ fontSize: 'var(--char-sheet-dash-value-size)', color: 'var(--gold-primary)', fontWeight: 'bold' }}>{totalSpeed}</div>
      </div>

      <div 
        onClick={() => setShowProficiencyModal(true)}
        style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: 'var(--char-sheet-dash-padding)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 'var(--char-sheet-dash-min-height)' }}
        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
        title="Editar Competencia"
      >
        <Award size={20} style={{ color: 'var(--gold-primary)', alignSelf: 'center', marginBottom: '8px', width: 'var(--char-sheet-dash-icon-size)', height: 'var(--char-sheet-dash-icon-size)' }} />
        <div className="font-cinzel" style={{ fontSize: 'var(--char-sheet-dash-label-size)', color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Competencia</div>
        <div className="mono" style={{ fontSize: 'var(--char-sheet-dash-value-size)', color: 'var(--gold-primary)', fontWeight: 'bold' }}>+{totalProficiency}</div>
      </div>
    </div>
  );
};
