const fs = require('fs');
const path = 'src/renderer/components/GestorPersonajes.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add new imports right after the other features components imports
const importInsertionPoint = "import { useCharacterSync } from '../features/characters/hooks/useCharacterSync';";
const newImports = `import { parseClasses } from '../../utils/dnd-calculos'; // Wait, let's just use the utils/personaje one
import { parseClasses as parseClasses2 } from '../utils/personaje';
import { HeroGrid } from '../features/characters/components/HeroGrid';
import { ImageCropModal } from '../features/characters/components/ImageCropModal';
import { CharacterCreatorWizard } from '../features/characters/components/CharacterCreatorWizard';
import { CharacterSheetDetailed } from '../features/characters/components/CharacterSheetDetailed';
`;

content = content.replace(importInsertionPoint, importInsertionPoint + '\n' + newImports.replace("import { parseClasses } from '../../utils/dnd-calculos'; // Wait, let's just use the utils/personaje one\n", ""));

// 2. Replace the return statement
const returnStart = content.indexOf('return (\n    <div style={styles.container}>');
const endOfFile = content.length;

const newReturn = `return (
    <div style={styles.container}>
      <HeroGrid
        isOverlay={isOverlay}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredCharacters={filteredCharacters}
        resetForm={resetForm}
        setIsCreating={setIsCreating}
        openCharacterSheet={setSelectedCharacter}
        parseClasses={parseClasses2}
      />

      <CharacterCreatorWizard 
        formState={formState}
        dbClasses={dbClasses}
        dbRaces={dbRaces}
        dbAlignments={dbAlignments}
        getHitDieForClass={getHitDieForClass}
        compendium={compendium}
        handleImageUpload={handleImageUpload}
        setCropMode={setCropMode}
        portraitInputRef={portraitInputRef}
        fullBodyImage={fullBodyImage}
        handleSave={handleSave}
        styles={styles}
      />

      <ImageCropModal 
        showCropModal={showCropModal}
        cropImageSrc={cropImageSrc}
        cropMode={cropMode}
        cropScale={cropScale}
        setCropScale={setCropScale}
        cropOffsetX={cropOffsetX}
        cropOffsetY={cropOffsetY}
        setCropOffsetX={setCropOffsetX}
        setCropOffsetY={setCropOffsetY}
        isCropDragging={isCropDragging}
        setIsCropDragging={setIsCropDragging}
        cropDragStart={cropDragStart}
        setCropDragStart={setCropDragStart}
        cropImgDims={cropImgDims}
        setCropImgDims={setCropImgDims}
        cropImgRef={cropImgRef}
        setShowCropModal={setShowCropModal}
        setCropImageSrc={setCropImageSrc}
        handleCropSave={handleCropSave}
      />

      <CharacterSheetDetailed 
        formState={formState}
        parseClasses={parseClasses2}
        compendium={compendium}
        dbClasses={dbClasses}
        socket={socket}
        triggerDiceRoll={triggerDiceRoll}
        handleDelete={handleDelete}
        handleLevelUp={handleLevelUp}
        getHitDieForClass={getHitDieForClass}
        getCharacterBaseSpeed={getCharacterBaseSpeed}
        styles={styles}
      />
    </div>
  );
};
`;

content = content.substring(0, returnStart) + newReturn;

fs.writeFileSync(path, content);
console.log('Updated GestorPersonajes.tsx successfully');
