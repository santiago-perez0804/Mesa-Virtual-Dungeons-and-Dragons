const fs = require('fs');
let content = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8');
content += '\n};\n';
fs.writeFileSync('src/renderer/components/DatabaseView.tsx', content);
console.log("Appended closing brace");
