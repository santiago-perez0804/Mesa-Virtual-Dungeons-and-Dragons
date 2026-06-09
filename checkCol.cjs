const fs = require('fs');
const lines = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8').split('\n');
const line = lines[1121]; // 0-indexed
console.log(line);
console.log(" ".repeat(69) + "^");
