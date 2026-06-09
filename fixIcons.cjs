const fs = require('fs');
let content = fs.readFileSync('src/renderer/shared/components/icons.tsx', 'utf8');
content = content.replace("import React from 'react';", "");
fs.writeFileSync('src/renderer/shared/components/icons.tsx', content);
console.log("Fixed icons.tsx");
