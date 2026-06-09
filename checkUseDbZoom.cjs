const fs = require('fs');
let content = fs.readFileSync('src/renderer/modules/compendium/hooks/useDatabaseForms.ts', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('imageZoom')) console.log(i+1, l);
});
