const fs = require('fs');
let content = fs.readFileSync('src/renderer/modules/compendium/hooks/useDatabaseForms.ts', 'utf8');

const lines = content.split('\n');
const resetStart = lines.findIndex(l => l.includes('const resetForm = () => {'));
let resetEnd = resetStart;
let braceCount = 0;
for(let i=resetStart; i<lines.length; i++) {
  if (lines[i].includes('{')) braceCount++;
  if (lines[i].includes('}')) braceCount--;
  if (braceCount === 0 && i > resetStart) {
    resetEnd = i;
    break;
  }
}

const resetBlock = lines.splice(resetStart, resetEnd - resetStart + 1);

const returnStart = lines.findIndex(l => l.includes('return {'));
lines.splice(returnStart, 0, ...resetBlock);

fs.writeFileSync('src/renderer/modules/compendium/hooks/useDatabaseForms.ts', lines.join('\n'));
console.log("Moved resetForm");
