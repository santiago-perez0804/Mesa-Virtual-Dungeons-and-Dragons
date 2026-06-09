const fs = require('fs');
let content = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8');

content = content.replace(/setCResourceProg\(Array\(20\)\.fill\(''\)\)/g, "setCResourceProg('')");

fs.writeFileSync('src/renderer/components/DatabaseView.tsx', content);
console.log("Fixed setCResourceProg");
