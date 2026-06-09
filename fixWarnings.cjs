const fs = require('fs');

// 1. DatabaseView.tsx
let dbView = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8');

// Imports
dbView = dbView.replace('ClipboardList, Book, Search', 'Book');
dbView = dbView.replace('ClipboardList, Camera, Search, RefreshCw, Link, ', '');
dbView = dbView.replace('ClipboardList, ', '');
dbView = dbView.replace(', Camera', '');
dbView = dbView.replace(', Search', '');
dbView = dbView.replace(', RefreshCw', '');
dbView = dbView.replace(', Link', '');

dbView = dbView.replace('const ACTION_TYPES =', '// const ACTION_TYPES =');
dbView = dbView.replace('const DAMAGE_TYPES =', '// const DAMAGE_TYPES =');

// Destructuring unused vars
const unusedVars = [
  'imageZoom,',
  'imagePosX,',
  'imagePosY,',
  'isDragging, setIsDragging,',
  'dragStart, setDragStart,',
  'classWizardStep,',
  'cName,',
  'cDesc,',
  'cHitDie,',
  'cSubclassLvl,',
  'cSubclassTitle,',
  'cArmors,',
  'cWeapons,',
  'cTools,',
  'cSaves,',
  'cSkills,',
  'cSkillsLimit,',
  'cResourceName,',
  'cResourceProg,',
  'subclassName,',
  'subclassDesc,',
  'subclassTraits,',
  'subclassTraitName, setSubclassTraitName,',
  'subclassTraitLevel, setSubclassTraitLevel,',
  'subclassTraitDesc, setSubclassTraitDesc,'
];

unusedVars.forEach(v => {
  dbView = dbView.replace(new RegExp(`\\b${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'g'), '');
});

// Functions
dbView = dbView.replace(/const generateTableMarkdown = [\s\S]*?;\n\n/g, '');
dbView = dbView.replace(/const getValidSubclassLevels = [\s\S]*?;\n\n/g, '');
dbView = dbView.replace(/const renderFeatureCrudModal = [\s\S]*?;\n\n/g, '');

fs.writeFileSync('src/renderer/components/DatabaseView.tsx', dbView);


// 2. CombatGrid.tsx
let combatGrid = fs.readFileSync('src/renderer/components/CombatGrid.tsx', 'utf8');
combatGrid = combatGrid.replace('Ruler, Triangle, Circle, Square, ', '');
combatGrid = combatGrid.replace('import { Compass as CompassIcon } from', '// import { Compass as CompassIcon } from');
fs.writeFileSync('src/renderer/components/CombatGrid.tsx', combatGrid);

// 3. ClassWizardModal.tsx
let classWizard = fs.readFileSync('src/renderer/components/compendium/ClassWizardModal.tsx', 'utf8');
classWizard = classWizard.replace("import React, { useState } from 'react';", "import { useState } from 'react';");
fs.writeFileSync('src/renderer/components/compendium/ClassWizardModal.tsx', classWizard);

// 4. DatabaseDetail.tsx
let dbDetail = fs.readFileSync('src/renderer/components/compendium/DatabaseDetail.tsx', 'utf8');
dbDetail = dbDetail.replace("import React from 'react';", "");
dbDetail = dbDetail.replace(/const typeIcons: any = \{[\s\S]*?\};\n/g, '');
dbDetail = dbDetail.replace(/const userRole = localStorage\.getItem\('userRole'\);\n/g, '');
fs.writeFileSync('src/renderer/components/compendium/DatabaseDetail.tsx', dbDetail);

// 5. DiceRoller.tsx
let diceRoller = fs.readFileSync('src/renderer/components/DiceRoller.tsx', 'utf8');
diceRoller = diceRoller.replace('user, ', '');
fs.writeFileSync('src/renderer/components/DiceRoller.tsx', diceRoller);

// 6. CombatantCard.tsx
let combatantCard = fs.readFileSync('src/renderer/components/ui/CombatantCard.tsx', 'utf8');
combatantCard = combatantCard.replace('Shield, ', '');
fs.writeFileSync('src/renderer/components/ui/CombatantCard.tsx', combatantCard);

// 7. useCharacterManager.ts
let charManager = fs.readFileSync('src/renderer/modules/character/hooks/useCharacterManager.ts', 'utf8');
charManager = charManager.replace(/const defaultInventory = \{[\s\S]*?\};\n/g, '');
fs.writeFileSync('src/renderer/modules/character/hooks/useCharacterManager.ts', charManager);

console.log("Cleaned up 49 warnings");
