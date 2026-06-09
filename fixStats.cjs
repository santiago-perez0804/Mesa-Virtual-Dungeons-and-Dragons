const fs = require('fs');
const content = fs.readFileSync('src/renderer/components/character/CharacterStatsPanel.tsx', 'utf8');

const lines = content.split('\n');
const endIndex = lines.findIndex(l => l.includes("export const CharacterStatsPanel")) + 1; // start finding from here
let lastBrace = -1;
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].includes("};")) {
    lastBrace = i;
  }
}

// We just want to slice to the first "};" after the return.
// Let's just find the first "};" after "return ("
let firstClosingBrace = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith("};")) {
    firstClosingBrace = i;
    break;
  }
}
if (firstClosingBrace !== -1) {
  const newContent = lines.slice(0, firstClosingBrace + 1).join('\n') + '\n';
  fs.writeFileSync('src/renderer/components/character/CharacterStatsPanel.tsx', newContent);
  console.log("Fixed CharacterStatsPanel.tsx");
}
