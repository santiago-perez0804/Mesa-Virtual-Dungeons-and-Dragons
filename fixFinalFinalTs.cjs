const fs = require('fs');

// 1. Fix DatabaseCreateForm.tsx
let dbCreate = fs.readFileSync('src/renderer/components/compendium/DatabaseCreateForm.tsx', 'utf8');

if (!dbCreate.includes('Camera, Search, RefreshCw')) {
  dbCreate = dbCreate.replace("import { Plus, Trash, Link", "import { Plus, Trash, Link, Camera, Search, RefreshCw");
}

dbCreate = dbCreate.replace(/map\(\(t\)/g, "map((t: any)");
dbCreate = dbCreate.replace(/map\(\(v\)/g, "map((v: any)");

fs.writeFileSync('src/renderer/components/compendium/DatabaseCreateForm.tsx', dbCreate);
console.log("Fixed DatabaseCreateForm.tsx remaining errors");

// 2. Fix ClassWizardModal.tsx
let classWizard = fs.readFileSync('src/renderer/components/compendium/ClassWizardModal.tsx', 'utf8');

classWizard = classWizard.replace(/map\(\(x\)/g, "map((x: any)");

fs.writeFileSync('src/renderer/components/compendium/ClassWizardModal.tsx', classWizard);
console.log("Fixed ClassWizardModal.tsx remaining errors");
