const fs = require('fs');
const lines = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8').split('\n');
console.log("1134:", lines[1133].trim());
console.log("1208:", lines[1207].trim());
