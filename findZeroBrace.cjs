const fs = require('fs');
const lines = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8').split('\n');

let balance = 0;
for(let i=0; i<lines.length; i++) {
  const line = lines[i];
  for(let j=0; j<line.length; j++) {
    if (line[j] === '{') balance++;
    if (line[j] === '}') balance--;
  }
  if (balance === 0 && i > 10) { // i > 10 to skip initial imports
    console.log(`Balance hit 0 at line ${i+1}: ${line}`);
    break;
  }
}
