const fs = require('fs');
const content = fs.readFileSync('src/renderer/components/compendium/DatabaseDetail.tsx', 'utf8');

const itemBlocks = content.split("selectedItem.type === 'item'");
console.log(`item blocks count: ${itemBlocks.length - 1}`);

const spellBlocks = content.split("selectedItem.type === 'spell'");
console.log(`spell blocks count: ${spellBlocks.length - 1}`);
