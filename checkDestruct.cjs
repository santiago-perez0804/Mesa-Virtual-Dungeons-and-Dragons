const fs = require('fs');
const lines = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8').split('\n');
for(let i=130; i<155; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
