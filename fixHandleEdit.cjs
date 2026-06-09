const fs = require('fs');
const lines = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8').split('\n');

// Find the first handleEditClick (line 165)
const firstIndex = lines.findIndex(l => l.includes('const handleEditClick = (item: any) => {'));
if (firstIndex !== -1) {
  let firstEnd = firstIndex;
  let balance = 0;
  for(let i=firstIndex; i<lines.length; i++) {
    const line = lines[i];
    for(let j=0; j<line.length; j++) {
      if (line[j] === '{') balance++;
      if (line[j] === '}') balance--;
    }
    if (balance === 0) {
      firstEnd = i;
      break;
    }
  }
  console.log(`Removing old handleEditClick: ${firstIndex+1} to ${firstEnd+1}`);
  lines.splice(firstIndex, firstEnd - firstIndex + 1);
}

// Find the orphaned block starting with setSelectedItem(null);
const orphanIndex = lines.findIndex(l => l.includes('setSelectedItem(null);') && lines[l-1] && lines[l-1].includes('// Reset'));
// Wait, the // Reset is from handleSave!
// So orphanIndex is just the first 'setSelectedItem(null);'
let actualOrphanIndex = -1;
for(let i=0; i<lines.length; i++) {
  if (lines[i].includes('setSelectedItem(null);') && lines[i].includes('setIsCreating(true);') === false) {
    if (lines[i+1] && lines[i+1].includes('setIsCreating(true);')) {
      actualOrphanIndex = i;
      break;
    }
  }
}

if (actualOrphanIndex !== -1) {
  lines.splice(actualOrphanIndex, 0, '  const handleEditClick = (item: any) => {', '    resetForm();');
  console.log(`Wrapped new handleEditClick at line ${actualOrphanIndex+1}`);
} else {
  console.log("Could not find orphaned block");
}

fs.writeFileSync('src/renderer/components/DatabaseView.tsx', lines.join('\n'));
