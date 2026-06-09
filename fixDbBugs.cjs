const fs = require('fs');

// 1. Fix DatabaseCreateForm.tsx duplicate createSize
let dbCreate = fs.readFileSync('src/renderer/components/compendium/DatabaseCreateForm.tsx', 'utf8');
dbCreate = dbCreate.replace('dragStart, setDragStart,\n    createSize, setCreateSize', 'dragStart, setDragStart');
fs.writeFileSync('src/renderer/components/compendium/DatabaseCreateForm.tsx', dbCreate);
console.log("Fixed duplicate createSize in DatabaseCreateForm.tsx");

// 2. Restore variables in DatabaseView.tsx
let dbView = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8');

const missingVars = `
    imagePosX, setImagePosX,
    imagePosY, setImagePosY,
    isDragging, setIsDragging,
    dragStart, setDragStart,
    classWizardStep, setClassWizardStep,
    cName, setCName,
    cDesc, setCDesc,
    cHitDie, setCHitDie,
    cSubclassLvl, setCSubclassLvl,
    cSubclassTitle, setCSubclassTitle,
    cArmors, setCArmors,
    cWeapons, setCWeapons,
    cTools, setCTools,
    cSaves, setCSaves,
    cSkills, setCSkills,
    cSkillsLimit, setCSkillsLimit,
    cResourceName, setCResourceName,
    cResourceProg, setCResourceProg,
    subclassName, setSubclassName,
    subclassDesc, setSubclassDesc,
    subclassTraits, setSubclassTraits,
    subclassTraitName, setSubclassTraitName,
    subclassTraitLevel, setSubclassTraitLevel,
    subclassTraitDesc, setSubclassTraitDesc,
`;

if (!dbView.includes('imagePosX, setImagePosX,')) {
    dbView = dbView.replace('isCreatingClass, setIsCreatingClass,', 'isCreatingClass, setIsCreatingClass,\n' + missingVars);
}

fs.writeFileSync('src/renderer/components/DatabaseView.tsx', dbView);
console.log("Restored missing variables to DatabaseView.tsx");
