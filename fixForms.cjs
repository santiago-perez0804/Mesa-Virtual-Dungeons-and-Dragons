const fs = require('fs');
let content = fs.readFileSync('src/renderer/modules/compendium/hooks/useDatabaseForms.ts', 'utf8');

let openBraces = 0;
let closeBraces = 0;
for(let i=0; i<content.length; i++) {
  if (content[i] === '{') openBraces++;
  if (content[i] === '}') closeBraces++;
}
console.log(`Open: ${openBraces}, Close: ${closeBraces}`);
if (openBraces > closeBraces) {
  content += '\n}\n';
  fs.writeFileSync('src/renderer/modules/compendium/hooks/useDatabaseForms.ts', content);
  console.log("Added missing closing brace");
}
