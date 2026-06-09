const fs = require('fs');
let content = fs.readFileSync('src/renderer/modules/compendium/hooks/useDatabaseForms.ts', 'utf8');

const insertContent = `
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosX, setImagePosX] = useState(0);
  const [imagePosY, setImagePosY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
`;

const returnContent = `
    imageZoom, setImageZoom,
    imagePosX, setImagePosX,
    imagePosY, setImagePosY,
    isDragging, setIsDragging,
    dragStart, setDragStart,
`;

if (!content.includes('const [imageZoom')) {
  // Insert states just before the return statement
  const insertTarget = 'return {';
  content = content.replace(insertTarget, insertContent + '\n  ' + insertTarget);
  
  // Insert return variables inside the return object
  const returnTarget = '    isCreating, setIsCreating,';
  content = content.replace(returnTarget, returnContent + '\n' + returnTarget);
  
  fs.writeFileSync('src/renderer/modules/compendium/hooks/useDatabaseForms.ts', content);
  console.log("Restored image variables to useDatabaseForms.ts properly!");
}
