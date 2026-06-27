import React from 'react';
import { ACModifierModal } from '../../../../components/personaje/ACModifierModal';
import { InitiativeModifierModal } from '../../../../components/personaje/InitiativeModifierModal';
import { SpeedModifierModal } from '../../../../components/personaje/SpeedModifierModal';
import { ProficiencyModifierModal } from '../../../../components/personaje/ProficiencyModifierModal';
import { AttributeModifierModal } from '../../../../components/personaje/AttributeModifierModal';
import { SavingThrowModifierModal } from '../../../../components/personaje/SavingThrowModifierModal';
import { SkillModifierModal } from '../../../../components/personaje/SkillModifierModal';
import { HpModifierModal } from '../../../../components/personaje/HpModifierModal';

interface CharacterSheetModalsProps {
  selectedCharacter: any;
  socket: any;
  setSelectedCharacter: (c: any) => void;
  showACModal: boolean;
  setShowACModal: (val: boolean) => void;
  showHpModal: boolean;
  setShowHpModal: (val: boolean) => void;
  showInitiativeModal: boolean;
  setShowInitiativeModal: (val: boolean) => void;
  showSpeedModal: boolean;
  setShowSpeedModal: (val: boolean) => void;
  showProficiencyModal: boolean;
  setShowProficiencyModal: (val: boolean) => void;
  selectedAttributeForModal: string | null;
  setSelectedAttributeForModal: (val: string | null) => void;
  selectedSavingThrowForModal: string | null;
  setSelectedSavingThrowForModal: (val: string | null) => void;
  selectedSkillForModal: { label: string; key: string } | null;
  setSelectedSkillForModal: (val: { label: string; key: string } | null) => void;
}

export const CharacterSheetModals: React.FC<CharacterSheetModalsProps> = ({
  selectedCharacter,
  socket,
  setSelectedCharacter,
  showACModal,
  setShowACModal,
  showHpModal,
  setShowHpModal,
  showInitiativeModal,
  setShowInitiativeModal,
  showSpeedModal,
  setShowSpeedModal,
  showProficiencyModal,
  setShowProficiencyModal,
  selectedAttributeForModal,
  setSelectedAttributeForModal,
  selectedSavingThrowForModal,
  setSelectedSavingThrowForModal,
  selectedSkillForModal,
  setSelectedSkillForModal
}) => {
  return (
    <>
      {showACModal && (
        <ACModifierModal 
          character={selectedCharacter} 
          socket={socket} 
          onClose={() => setShowACModal(false)} 
          onUpdate={setSelectedCharacter}
        />
      )}

      {showHpModal && (
        <HpModifierModal 
          character={selectedCharacter} 
          socket={socket} 
          onClose={() => setShowHpModal(false)} 
          onUpdate={setSelectedCharacter}
        />
      )}

      {showInitiativeModal && (
        <InitiativeModifierModal 
          character={selectedCharacter} 
          socket={socket} 
          onClose={() => setShowInitiativeModal(false)} 
          onUpdate={setSelectedCharacter}
        />
      )}

      {showSpeedModal && (
        <SpeedModifierModal 
          character={selectedCharacter} 
          socket={socket} 
          onClose={() => setShowSpeedModal(false)} 
          onUpdate={setSelectedCharacter}
        />
      )}

      {selectedAttributeForModal && (
        <AttributeModifierModal 
          character={selectedCharacter} 
          socket={socket} 
          attributeKey={selectedAttributeForModal as any}
          onClose={() => setSelectedAttributeForModal(null)} 
          onUpdate={setSelectedCharacter}
        />
      )}

      {selectedSavingThrowForModal && (
        <SavingThrowModifierModal 
          character={selectedCharacter} 
          socket={socket} 
          attributeKey={selectedSavingThrowForModal as any}
          onClose={() => setSelectedSavingThrowForModal(null)} 
          onUpdate={setSelectedCharacter}
        />
      )}

      {selectedSkillForModal && (
        <SkillModifierModal 
          character={selectedCharacter} 
          socket={socket} 
          skillLabel={selectedSkillForModal.label}
          attributeKey={selectedSkillForModal.key as any}
          onClose={() => setSelectedSkillForModal(null)} 
          onUpdate={setSelectedCharacter}
        />
      )}

      {showProficiencyModal && (
        <ProficiencyModifierModal 
          character={selectedCharacter} 
          socket={socket} 
          onClose={() => setShowProficiencyModal(false)} 
          onUpdate={setSelectedCharacter}
        />
      )}
    </>
  );
};
