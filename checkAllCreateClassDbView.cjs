const fs = require('fs');
const lines = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('setIsCreatingClass')) console.log(`${i+1}: ${l.trim()}`);
});
