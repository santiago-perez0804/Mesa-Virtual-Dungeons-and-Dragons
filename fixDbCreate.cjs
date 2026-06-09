const fs = require('fs');
let content = fs.readFileSync('src/renderer/components/compendium/DatabaseCreateForm.tsx', 'utf8');

// Add missing image state variables and createSize to destructuring
if (!content.includes('imageZoom, setImageZoom')) {
  content = content.replace(
    'itemCritDamage, setItemCritDamage',
    "itemCritDamage, setItemCritDamage,\n    imageZoom, setImageZoom, imagePosX, setImagePosX, imagePosY, setImagePosY,\n    isDragging, setIsDragging, dragStart, setDragStart,\n    createSize, setCreateSize"
  );
}

// Add Camera, Search, RefreshCw to lucide-react import
if (!content.includes('Camera, Search, RefreshCw')) {
  content = content.replace(
    "import { Plus, X, Upload } from 'lucide-react';",
    "import { Plus, X, Upload, Camera, Search, RefreshCw } from 'lucide-react';"
  );
}

fs.writeFileSync('src/renderer/components/compendium/DatabaseCreateForm.tsx', content);
console.log("Fixed DatabaseCreateForm.tsx");
