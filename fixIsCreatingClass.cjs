const fs = require('fs');
let content = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8');

content = content.replace(/setIsCreatingClass\(true\);/g, "setIsCreatingClass!(true);");

fs.writeFileSync('src/renderer/components/DatabaseView.tsx', content);
console.log("Fixed setIsCreatingClass possibly undefined");
