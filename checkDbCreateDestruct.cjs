const fs = require('fs');
const lines = fs.readFileSync('src/renderer/components/compendium/DatabaseCreateForm.tsx', 'utf8').split('\n');
for(let i=35; i<=65; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
