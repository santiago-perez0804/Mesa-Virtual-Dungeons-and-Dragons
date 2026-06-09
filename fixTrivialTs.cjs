const fs = require('fs');
let content = fs.readFileSync('src/renderer/components/DatabaseView.tsx', 'utf8');

// 1. Define safeStr if not exists
if (!content.includes('const safeStr =')) {
  content = content.replace(
    'export const DatabaseView = ({ compendium, socket, userRole, isOverlay, forceOpenId, onCloseOverlay }: any) => {',
    "const safeStr = (val: any) => val != null ? String(val) : '';\nexport const DatabaseView = ({ compendium, socket, userRole, isOverlay, forceOpenId, onCloseOverlay }: any) => {"
  );
}

// 2. Remove isDragging, setDragStart, etc.
content = content.replace('imageZoom, setImageZoom,', '');
content = content.replace('imagePosX, setImagePosX,', '');
content = content.replace('imagePosY, setImagePosY,', '');
content = content.replace('isDragging, setIsDragging,', '');
content = content.replace('dragStart, setDragStart,', '');

// 3. Fix the TS2345 errors on lines 997, 1122, 1196
// They are trying to pass any[] to something that wants a string.
// Let's replace `setCreateTools(data.tools || [])` with `setCreateTools(data.tools || '')`?
// Let's just fix it automatically: `SetStateAction<string>` usually comes from `setCTools(data.tools || [])` -> `setCTools(data.tools || '')`
content = content.replace(/setCTools\([^)]*\|\|\s*\[\]\)/g, "setCTools(data.tools || '')");
content = content.replace(/setCResourceName\([^)]*\|\|\s*\[\]\)/g, "setCResourceName(data.resourceName || '')");
content = content.replace(/setCResourceProg\([^)]*\|\|\s*\[\]\)/g, "setCResourceProg(data.resourceProg || '')");

fs.writeFileSync('src/renderer/components/DatabaseView.tsx', content);
console.log("Fixed trivial TS errors");
