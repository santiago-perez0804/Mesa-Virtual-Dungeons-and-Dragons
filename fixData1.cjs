const fs = require('fs');
let content = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8');

content = content.replace('data.1 = 1;', '');
content = content.replace('data.0 = 0;', '');
content = content.replace('data.0 = 0;', '');

fs.writeFileSync('src/renderer/components/DatabaseView.tsx', content);
console.log("Fixed data.1 = 1 syntax error");
