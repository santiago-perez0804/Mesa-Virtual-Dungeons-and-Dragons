const fs = require('fs');
const lines = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8').split('\n');

let balance = 0;
let started = false;
for(let i=0; i<lines.length; i++) {
  const line = lines[i];
  if (line.includes('export const DatabaseView =')) started = true;
  
  if (started) {
    for(let j=0; j<line.length; j++) {
      if (line[j] === '{') balance++;
      if (line[j] === '}') balance--;
    }
    console.log(`Line ${i+1} [Bal: ${balance}]: ${line.trim()}`);
    if (balance === 0) break;
  }
}
