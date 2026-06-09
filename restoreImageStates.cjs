const fs = require('fs');
let content = fs.readFileSync('src/renderer/modules/compendium/hooks/useDatabaseForms.ts', 'utf8');

if (!content.includes('const [imageZoom')) {
  const insertIndex = content.indexOf('const [isCreatingClass');
  const insertContent = `
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosX, setImagePosX] = useState(0);
  const [imagePosY, setImagePosY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  `;
  content = content.slice(0, insertIndex) + insertContent + content.slice(insertIndex);
  
  const returnIndex = content.indexOf('isCreatingClass, setIsCreatingClass');
  const returnContent = `
    imageZoom, setImageZoom,
    imagePosX, setImagePosX,
    imagePosY, setImagePosY,
    isDragging, setIsDragging,
    dragStart, setDragStart,
  `;
  content = content.slice(0, returnIndex) + returnContent + content.slice(returnIndex);
  
  fs.writeFileSync('src/renderer/modules/compendium/hooks/useDatabaseForms.ts', content);
  console.log("Restored image states");
}
