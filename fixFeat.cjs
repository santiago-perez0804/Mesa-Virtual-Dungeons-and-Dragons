const fs = require('fs');
let content = fs.readFileSync('src/renderer/components/compendium/FeatureDetail.tsx', 'utf8');

// Replace "{selectedFeature && (" with "<>"
content = content.replace('{selectedFeature && (', '<>');

// Find the last ")}" before "  );\n};" and replace it with "</>"
const lastParenIndex = content.lastIndexOf(')}');
if (lastParenIndex !== -1) {
  content = content.substring(0, lastParenIndex) + '</>' + content.substring(lastParenIndex + 2);
}

fs.writeFileSync('src/renderer/components/compendium/FeatureDetail.tsx', content);
console.log("Fixed FeatureDetail.tsx");
