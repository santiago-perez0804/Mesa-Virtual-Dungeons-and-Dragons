const fs = require('fs');
const lines = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8').split('\n');
console.log(lines[996].trim());
console.log(lines[1121].trim());
console.log(lines[1195].trim());
