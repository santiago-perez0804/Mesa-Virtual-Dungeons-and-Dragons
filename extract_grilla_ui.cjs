const fs = require('fs');
const path = 'src/renderer/components/GrillaCombate.tsx';
const lines = fs.readFileSync(path, 'utf8').split('\n');

const getChunk = (startMarker, endMarker) => {
    let startIdx = -1;
    let endIdx = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(startMarker)) startIdx = i;
        if (startIdx !== -1 && endMarker && lines[i].includes(endMarker)) {
            endIdx = i;
            break;
        }
    }
    if (endMarker && endIdx === -1) endIdx = lines.length;
    return lines.slice(startIdx, endIdx).join('\n');
};

const toolbarJSX = getChunk('{/* TOOLBAR SUPERIOR */}', '{/* CONTENEDOR PRINCIPAL */}');
const sidebarJSX = getChunk('{/* PANEL LATERAL (COMBATIENTES / OBJETOS) */}', '{/* ÁREA DE GRILLA (VIEWPORT) */}');
const boardJSX = getChunk('{/* ÁREA DE GRILLA (VIEWPORT) */}', '{/* MODAL DETALLE DE COMBATIENTE */}');
const modalsJSX = getChunk('{/* MODAL DETALLE DE COMBATIENTE */}', '</div>'); // Assuming </div> closes the main container

console.log("Toolbar length:", toolbarJSX.split('\\n').length);
console.log("Sidebar length:", sidebarJSX.split('\\n').length);
console.log("Board length:", boardJSX.split('\\n').length);
console.log("Modals length:", modalsJSX.split('\\n').length);

fs.writeFileSync('grilla_chunks.json', JSON.stringify({
  toolbar: toolbarJSX,
  sidebar: sidebarJSX,
  board: boardJSX,
  modals: modalsJSX
}, null, 2));
