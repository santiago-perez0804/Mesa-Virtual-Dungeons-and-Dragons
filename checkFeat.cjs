const fs = require('fs');
const content = fs.readFileSync('src/renderer/components/compendium/FeatureDetail.tsx', 'utf8');

const lines = content.split('\n');
// We just remove line 7 and the matching closing parenthesis at the end
// Let's see the last 10 lines
console.log(lines.slice(-10).join('\n'));
