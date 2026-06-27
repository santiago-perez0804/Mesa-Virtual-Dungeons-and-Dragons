import { CharacterTraitsTab } from '../../../components/personaje/PestanaRasgosPersonaje';
import { CharacterSpellsTab } from '../../../components/personaje/PestanaHechizosPersonaje';
import { CharacterStatsPanel } from '../../../components/personaje/PanelEstadisticasPersonaje';

import { safeParseInventory, safeParseStats } from '../../../modules/personaje/personaje.utilidades';

// Extracted Subcomponents
import { CharacterSheetHeader } from './sheet/CharacterSheetHeader';
import { CharacterSheetDashboard } from './sheet/CharacterSheetDashboard';
import { CharacterSheetRightColumn } from './sheet/CharacterSheetRightColumn';
import { CharacterSheetModals } from './sheet/CharacterSheetModals';
import { CharacterSheetInlineModals } from './sheet/CharacterSheetInlineModals';

export const CharacterSheetDetailed = (props: any) => {
  const { selectedCharacter, setSelectedCharacter, dbClasses, dbRaces, getCharacterBaseSpeed,
          handleDelete, handleLevelUp, isLevelingUp, setIsLevelingUp,
          levelUpClass, setLevelUpClass, charDetailTab, setCharDetailTab, showACModal, setShowACModal,
          showInitiativeModal, setShowInitiativeModal, showSpeedModal, setShowSpeedModal, showProficiencyModal, setShowProficiencyModal,
          socket, styles, parseClasses,
          startEdit, onCloseOverlay, userRole, selectedSavingThrows, selectedSkills,
          setSelectedSavingThrowForModal, setSelectedSkillForModal, setSelectedAttributeForModal,
          setActiveSlotIndex, classFeatures, activeFeaturesClass, featuresLoading, fetchClassFeatures,
          selectedAttributeForModal, selectedSavingThrowForModal, selectedSkillForModal,
          viewingItemDetail, setViewingItemDetail,
          unequippingSlotIndex, setUnequippingSlotIndex, unequipQuantity, setUnequipQuantity, compendium } = props;
  
  if (!selectedCharacter) return null;

  const charStats = safeParseStats(selectedCharacter.stats);
  const charInv = safeParseInventory(selectedCharacter.inventory);
  const parsedClasses = parseClasses(selectedCharacter.class);
  const classesDisplay = Object.entries(parsedClasses).map(([cls, lvl]) => `${cls} ${lvl}`).join(' / ');
  
  const isSpellcaster = Object.keys(parsedClasses).some(cls => {
    const clsLower = cls.toLowerCase().trim();
    const castList = [
      'brujo', 'warlock', 
      'bardo', 'bard', 
      'paladin', 'paladín', 
      'mago', 'wizard', 
      'hechicero', 'sorcerer', 
      'druida', 'druid', 
      'clerigo', 'clérigo', 'cleric', 
      'explorador', 'ranger', 
      'artifice', 'artífice', 'artificer'
    ];
    const clsClean = clsLower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const isBaseCaster = castList.some(c => {
      const cClean = c.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return clsClean === cClean;
    });
    if (isBaseCaster) return true;

    const hasThirdCasterKeyword = clsClean.includes('mistico') || 
                                 clsClean.includes('arcano') || 
                                 clsClean.includes('eldritch knight') || 
                                 clsClean.includes('arcane trickster');
    if (hasThirdCasterKeyword) return true;

    return false;
  });

  const getEffectiveStat = (statKey: string) => {
    const baseVal = charStats[statKey] || 10;
    const mods = charStats[`custom_${statKey}_modifiers`] || [];
    const customSum = mods.reduce((acc: number, m: any) => acc + m.value, 0);
    return baseVal + customSum;
  };

  const activeTab = charDetailTab === 'hoja' || charDetailTab === 'inventario' ? 'hoja' : (charDetailTab === 'rasgos' || charDetailTab === 'trasfondo' ? 'rasgos' : 'conjuros');
  const activeTabToRender = activeTab === 'conjuros' && !isSpellcaster ? 'hoja' : activeTab;

  return (
    <>
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div className="" style={{ ...styles.card, width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--char-sheet-card-gap)', border: 'none', borderRadius: 0, padding: '30px 40px', overflow: 'hidden', position: 'relative' }}>

          <CharacterSheetHeader 
            selectedCharacter={selectedCharacter}
            setSelectedCharacter={setSelectedCharacter}
            startEdit={startEdit}
            onCloseOverlay={onCloseOverlay}
            setIsLevelingUp={setIsLevelingUp}
            setLevelUpClass={setLevelUpClass}
            parsedClasses={parsedClasses}
            classesDisplay={classesDisplay}
            userRole={userRole}
            handleDelete={handleDelete}
          />

          {/* TABS */}
          <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', overflowX: 'auto', justifyContent: 'center', background: 'transparent', zIndex: 50, padding: '10px 0' }}>
            {(() => {
              const tabsList = [
                { id: 'hoja', label: 'HOJA' },
                { id: 'rasgos', label: 'RASGOS' }
              ];
              if (isSpellcaster) {
                tabsList.push({ id: 'conjuros', label: 'CONJUROS' });
              }
              return tabsList.map(tab => {
                const isActive = charDetailTab === tab.id || (charDetailTab === 'inventario' && tab.id === 'hoja') || (charDetailTab === 'trasfondo' && tab.id === 'rasgos');
                return (
                  <button
                    key={tab.id}
                    className="font-cinzel"
                    onClick={() => setCharDetailTab(tab.id as any)}
                    style={{
                      background: isActive ? 'var(--gold-primary)' : 'transparent',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--gold-primary)' : 'var(--border-color)',
                      borderRadius: '4px',
                      color: isActive ? 'black' : 'var(--text-secondary)',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      padding: '8px 24px',
                      cursor: 'pointer',
                      letterSpacing: '1px',
                      transition: 'all 0.2s',
                      boxShadow: isActive ? '0 0 10px rgba(200,135,42,0.3)' : 'none'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              });
            })()}
          </div>

          {/* CONTENIDO PRINCIPAL BASADO EN TAB */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingRight: '20px' }}>
            {activeTabToRender === 'hoja' && (
              <>
                <CharacterSheetDashboard 
                  selectedCharacter={selectedCharacter}
                  charStats={charStats}
                  getEffectiveStat={getEffectiveStat}
                  getCharacterBaseSpeed={getCharacterBaseSpeed}
                  setShowACModal={setShowACModal}
                  setShowInitiativeModal={setShowInitiativeModal}
                  setShowSpeedModal={setShowSpeedModal}
                  setShowProficiencyModal={setShowProficiencyModal}
                />
                
                <div style={{ display: 'grid', gridTemplateColumns: 'var(--char-sheet-body-columns)', gap: 'var(--char-sheet-body-gap)' }}>
                  <CharacterStatsPanel 
                    character={selectedCharacter} 
                    charStats={charStats} 
                    selectedSavingThrows={selectedSavingThrows} 
                    selectedSkills={selectedSkills}
                    onSelectSavingThrow={(key: string) => setSelectedSavingThrowForModal(key)}
                    onSelectSkill={(label: string, key: string) => setSelectedSkillForModal({ label, key })}
                    dbRaces={dbRaces}
                  />
                  
                  <CharacterSheetRightColumn 
                    selectedCharacter={selectedCharacter}
                    getEffectiveStat={getEffectiveStat}
                    setSelectedAttributeForModal={setSelectedAttributeForModal}
                    dbRaces={dbRaces}
                    setActiveSlotIndex={setActiveSlotIndex}
                  />
                </div>
              </>
            )}

            {activeTabToRender === 'rasgos' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
                <CharacterTraitsTab 
                  character={selectedCharacter} 
                  classFeatures={classFeatures} 
                  activeFeaturesClass={activeFeaturesClass} 
                  featuresLoading={featuresLoading} 
                  fetchClassFeatures={fetchClassFeatures} 
                  socket={socket}
                  onUpdate={setSelectedCharacter}
                  dbRaces={dbRaces}
                  dbClasses={dbClasses}
                />
              </div>
            )}

            {activeTabToRender === 'conjuros' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
                <CharacterSpellsTab character={selectedCharacter} socket={socket} />
              </div>
            )}
          </div>
        </div>

        <CharacterSheetModals 
          selectedCharacter={selectedCharacter}
          socket={socket}
          setSelectedCharacter={setSelectedCharacter}
          showACModal={showACModal}
          setShowACModal={setShowACModal}
          showInitiativeModal={showInitiativeModal}
          setShowInitiativeModal={setShowInitiativeModal}
          showSpeedModal={showSpeedModal}
          setShowSpeedModal={setShowSpeedModal}
          showProficiencyModal={showProficiencyModal}
          setShowProficiencyModal={setShowProficiencyModal}
          selectedAttributeForModal={selectedAttributeForModal}
          setSelectedAttributeForModal={setSelectedAttributeForModal}
          selectedSavingThrowForModal={selectedSavingThrowForModal}
          setSelectedSavingThrowForModal={setSelectedSavingThrowForModal}
          selectedSkillForModal={selectedSkillForModal}
          setSelectedSkillForModal={setSelectedSkillForModal}
        />

        <CharacterSheetInlineModals 
          viewingItemDetail={viewingItemDetail}
          setViewingItemDetail={setViewingItemDetail}
          unequippingSlotIndex={unequippingSlotIndex}
          setUnequippingSlotIndex={setUnequippingSlotIndex}
          unequipQuantity={unequipQuantity}
          setUnequipQuantity={setUnequipQuantity}
          isLevelingUp={isLevelingUp}
          setIsLevelingUp={setIsLevelingUp}
          levelUpClass={levelUpClass}
          setLevelUpClass={setLevelUpClass}
          handleLevelUp={handleLevelUp}
          dbClasses={dbClasses}
          charInv={charInv}
          compendium={compendium}
          socket={socket}
          selectedCharacter={selectedCharacter}
          setSelectedCharacter={setSelectedCharacter}
        />
      </div>
    </>
  );
};
