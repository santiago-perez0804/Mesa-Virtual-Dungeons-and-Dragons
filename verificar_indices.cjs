const fs = require('fs');
const content = fs.readFileSync('src/renderer/components/compendium/DetalleBaseDatos.tsx', 'utf8');
const lines = content.split('\n');

lines.forEach((l, i) => {
  if (l.includes("selectedItem.type === 'item'")) console.log(`item at ${i}`);
  if (l.includes("selectedItem.type === 'spell'")) console.log(`spell at ${i}`);
  if (l.includes("selectedItem.type === 'monster'")) console.log(`monster at ${i}`);
});
