const fs = require('fs');
let content = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8');

content = content.replace(/setCTools\(\[\]\)/g, "setCTools('')");

fs.writeFileSync('src/renderer/components/DatabaseView.tsx', content);
console.log("Fixed setCTools([])");
