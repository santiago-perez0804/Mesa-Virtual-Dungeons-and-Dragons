const fs = require('fs');
let content = fs.readFileSync('src/renderer/components/compendium/SubclassModal.tsx', 'utf8');

content = content.replace(/map\(\(_, i\)/g, "map((_: any, i: number)");
content = content.replace(/map\(\(t, idx\)/g, "map((t: any, idx: number)");

fs.writeFileSync('src/renderer/components/compendium/SubclassModal.tsx', content);
console.log("Fixed implicit any in SubclassModal");
