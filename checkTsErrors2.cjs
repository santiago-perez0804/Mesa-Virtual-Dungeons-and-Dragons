const fs = require('fs');
const lines = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8').split('\n');
console.log("997:", lines[996].trim());
console.log("1122:", lines[1121].trim());
console.log("1196:", lines[1195].trim());
