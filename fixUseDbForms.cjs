const fs = require('fs');
let content = fs.readFileSync('src/renderer/modules/compendium/hooks/useDatabaseForms.ts', 'utf8');

// I inserted this block exactly:
const insertContent = `
  const [imageZoom, setImageZoom] = useState(1);
  const [imagePosX, setImagePosX] = useState(0);
  const [imagePosY, setImagePosY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  `;
content = content.replace(insertContent, '');

const returnContent = `
    imageZoom, setImageZoom,
    imagePosX, setImagePosX,
    imagePosY, setImagePosY,
    isDragging, setIsDragging,
    dragStart, setDragStart,
  `;
content = content.replace(returnContent, '');

fs.writeFileSync('src/renderer/modules/compendium/hooks/useDatabaseForms.ts', content);
console.log("Fixed useDatabaseForms duplicates");
