const fs = require('fs');
let content = fs.readFileSync('src/renderer/components/character/CharacterStatsPanel.tsx', 'utf8');
content = content.replace('};            </div>', '};\n');
fs.writeFileSync('src/renderer/components/character/CharacterStatsPanel.tsx', content);
console.log("Fixed trailing div");
