const fs = require('fs');
const lines = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8').split('\n');
console.log("766:", lines[765].trim());
console.log("1010:", lines[1009].trim());
