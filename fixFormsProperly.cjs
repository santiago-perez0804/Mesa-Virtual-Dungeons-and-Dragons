const fs = require('fs');
let content = fs.readFileSync('src/renderer/modules/compendium/hooks/useDatabaseForms.ts', 'utf8');

if (content.charCodeAt(0) === 0xFEFF || content.includes('\0')) {
  // It's UTF-16
  content = fs.readFileSync('src/renderer/modules/compendium/hooks/useDatabaseForms.ts', 'utf-16le');
}

// Find resetForm and move it
const lines = content.split('\n');
const resetStart = lines.findIndex(l => l.includes('const resetForm = () => {'));
if (resetStart !== -1) {
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
  if (returnStart !== -1) {
    lines.splice(returnStart, 0, ...resetBlock);
  }
}

// Ensure there is a closing bracket at the end
let openBraces = 0;
let closeBraces = 0;
const text = lines.join('\n');
for(let i=0; i<text.length; i++) {
  if (text[i] === '{') openBraces++;
  if (text[i] === '}') closeBraces++;
}

let finalText = text;
if (openBraces > closeBraces) {
  finalText += '\n}\n';
}

fs.writeFileSync('src/renderer/modules/compendium/hooks/useDatabaseForms.ts', finalText, 'utf8');
console.log("Fixed useDatabaseForms.ts properly");
