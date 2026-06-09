const fs = require('fs');
const lines = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8').split('\n');
for(let i=374; i<=380; i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
