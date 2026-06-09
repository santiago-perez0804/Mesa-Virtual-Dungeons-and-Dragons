const fs = require('fs');
let content = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8');

let openBraces = 0;
let closeBraces = 0;
for(let i=0; i<content.length; i++) {
  if (content[i] === '{') openBraces++;
  if (content[i] === '}') closeBraces++;
}
console.log(`Open: ${openBraces}, Close: ${closeBraces}`);
if (closeBraces > openBraces) {
  console.log("Removing last closing brace");
  const lastIndex = content.lastIndexOf('}');
  content = content.substring(0, lastIndex) + content.substring(lastIndex + 1);
  fs.writeFileSync('src/renderer/components/DatabaseView.tsx', content);
}
