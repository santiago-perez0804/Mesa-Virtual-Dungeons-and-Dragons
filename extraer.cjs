const fs = require('fs');
const path = require('path');

const file = path.join('src', 'renderer', 'components', 'VistaCompendio.tsx');
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const detailBlock = lines.slice(2870, 3306).join('\n');
const featureBlock = lines.slice(3308, 3407).join('\n'); // 3309 to 3407 is the block

const detailCode = `import React from 'react';
import { formatDescription } from '../../utils/formateador';

export const DatabaseDetail = ({ selectedItem, setSelectedItem, isOverlay, onCloseOverlay, userRole }: any) => {
  const d = selectedItem.data ? (typeof selectedItem.data === 'string' ? JSON.parse(selectedItem.data) : selectedItem.data) : {};
  const isMonster = selectedItem.type === 'monster';
  const cr = d.cr || d.challenge_rating || '�';
  
` + detailBlock + `
};
`;

const featureCode = `import React from 'react';
import { formatDescription } from '../../utils/formateador';

export const FeatureDetail = ({ selectedFeature, setSelectedFeature, openEditFeatureForm, handleDeleteFeature, userRole }: any) => {
  if (!selectedFeature) return null;
  return (
` + featureBlock + `
  );
};
`;

fs.writeFileSync(path.join('src', 'renderer', 'components', 'compendium', 'DetalleBaseDatos.tsx'), detailCode);
fs.writeFileSync(path.join('src', 'renderer', 'components', 'compendium', 'DetalleRasgo.tsx'), featureCode);

lines.splice(3308, 3407 - 3308 + 1, '              <FeatureDetail selectedFeature={selectedFeature} setSelectedFeature={setSelectedFeature} openEditFeatureForm={openEditFeatureForm} handleDeleteFeature={handleDeleteFeature} userRole={userRole} />');
lines.splice(2870, 3306 - 2870 + 1, '                <DatabaseDetail selectedItem={selectedItem} setSelectedItem={setSelectedItem} isOverlay={isOverlay} onCloseOverlay={onCloseOverlay} userRole={userRole} />');

// also need to import them at the top
lines.splice(4, 0, "import { DatabaseDetail } from './compendium/DatabaseDetail';\nimport { FeatureDetail } from './compendium/FeatureDetail';");

fs.writeFileSync(file, lines.join('\n'));
