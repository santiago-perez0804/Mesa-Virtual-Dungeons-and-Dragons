const fs = require('fs');
let content = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8');

// The unused destructuring variables in DatabaseView:
const toRemove = [
  'imagePosX, setImagePosX,',
  'imagePosY, setImagePosY,',
  'isDragging, setIsDragging,',
  'dragStart, setDragStart,',
  'classWizardStep, setClassWizardStep,',
  'cName, setCName,',
  'cDesc, setCDesc,',
  'cHitDie, setCHitDie,',
  'cSubclassLvl, setCSubclassLvl,',
  'cSubclassTitle, setCSubclassTitle,',
  'cArmors, setCArmors,',
  'cWeapons, setCWeapons,',
  'cTools, setCTools,',
  'cSaves, setCSaves,',
  'cSkills, setCSkills,',
  'cSkillsLimit, setCSkillsLimit,',
  'cResourceName, setCResourceName,',
  'cResourceProg, setCResourceProg,',
  'subclassName, setSubclassName,',
  'subclassDesc, setSubclassDesc,',
  'subclassTraits, setSubclassTraits,',
  'subclassTraitName, setSubclassTraitName,',
  'subclassTraitLevel, setSubclassTraitLevel,',
  'subclassTraitDesc, setSubclassTraitDesc,'
];

toRemove.forEach(str => {
  content = content.replace(new RegExp(str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'g'), '');
});

// Remove unused functions
content = content.replace(/const generateTableMarkdown = [\s\S]*?;\n\n/g, '');
content = content.replace(/const getValidSubclassLevels = [\s\S]*?;\n\n/g, '');

fs.writeFileSync('src/renderer/components/DatabaseView.tsx', content);
console.log("Removed unused variables");
