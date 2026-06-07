const fs = require('fs');
const path = require('path');
function checkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory()) checkDir(fullPath);
    else if (fullPath.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const tags = [...content.matchAll(/<([A-Z][a-zA-Z0-9]*)/g)].map(m => m[1]);
      const uniqueTags = [...new Set(tags)];
      const missing = uniqueTags.filter(t => !content.includes(t + ' from') && !content.includes(t + '} from') && !content.includes(t + ',') && !content.includes('import ' + t) && !content.includes('const ' + t) && !content.includes('function ' + t) && !content.includes('class ' + t) && !content.includes('interface ' + t) && !content.includes(`type ${t}`) && t !== 'Fragment');
      if (missing.length > 0) {
        console.log(fullPath + ' might be missing: ' + missing.join(', '));
      }
    }
  }
}
checkDir('c:/Users/Sapo/Documents/DND/dnd-vtt/src/renderer');
