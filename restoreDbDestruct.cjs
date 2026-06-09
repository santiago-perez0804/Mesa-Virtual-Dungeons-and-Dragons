const fs = require('fs');
let content = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8');

// Add to destructuring
if (!content.includes('imageZoom, setImageZoom,')) {
  content = content.replace(
    'isCreatingClass, setIsCreatingClass,',
    "imageZoom, setImageZoom,\n    imagePosX, setImagePosX,\n    imagePosY, setImagePosY,\n    isDragging, setIsDragging,\n    dragStart, setDragStart,\n\n    isCreatingClass, setIsCreatingClass,"
  );
}

// Restore handleEditClick
content = content.replace(/setCreateImage\(safeStr\(data\.image \?\? ''\)\);/g, "setCreateImage(safeStr(data.image ?? ''));\n    setImageZoom(data.imageZoom ?? 1);\n    setImagePosX(data.imagePosX ?? 0);\n    setImagePosY(data.imagePosY ?? 0);");

fs.writeFileSync('src/renderer/components/DatabaseView.tsx', content);
console.log("Restored DatabaseView.tsx destructuring");
