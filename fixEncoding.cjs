const fs = require('fs');
let content = fs.readFileSync('src/renderer/modules/compendium/hooks/useDatabaseForms.ts');
// Try to read it as utf-16le or utf8
let text = content.toString('utf-16le');
if (!text.includes('export const useDatabaseForms')) {
  text = content.toString('utf8');
}
fs.writeFileSync('src/renderer/modules/compendium/hooks/useDatabaseForms.ts', text, 'utf8');
console.log("Fixed encoding");
