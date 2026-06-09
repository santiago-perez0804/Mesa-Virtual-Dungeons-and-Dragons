const fs = require('fs');
let content = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8');

const lines = content.split('\n');
// Let's replace lines from 1795 (0-indexed 1794) to 1822 (0-indexed 1821)
// We just want to replace the whole block:
const targetStart = "{selectedItem && category !== 'class' && (() => {";

const startIndex = lines.findIndex(l => l.includes(targetStart));
if (startIndex !== -1) {
  let endIndex = startIndex;
  while(endIndex < lines.length && !lines[endIndex].includes("<DatabaseDetail")) {
    endIndex++;
  }
  
  if (endIndex < lines.length) {
    const newBlock = [
      "              {selectedItem && category !== 'class' && (",
      "                <DatabaseDetail selectedItem={selectedItem} setSelectedItem={setSelectedItem} isOverlay={isOverlay} onCloseOverlay={onCloseOverlay} userRole={userRole} />",
      "              )}"
    ];
    lines.splice(startIndex, endIndex - startIndex + 1, ...newBlock);
    fs.writeFileSync('src/renderer/components/DatabaseView.tsx', lines.join('\n'));
    console.log("Fixed DatabaseView.tsx");
  } else {
    console.log("Could not find DatabaseDetail");
  }
} else {
  console.log("Could not find targetStart");
}
