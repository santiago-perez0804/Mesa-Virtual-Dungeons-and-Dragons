const fs = require('fs');
let content = fs.readFileSync('src/renderer/modules/compendium/hooks/useDatabaseForms.ts', 'utf8');

if (!content.includes('const [createSize, setCreateSize]')) {
  content = content.replace(
    'const [createImm, setCreateImm] = useState<string[]>([]);',
    "const [createImm, setCreateImm] = useState<string[]>([]);\n  const [createSize, setCreateSize] = useState('Mediano');"
  );
  content = content.replace(
    'createImm, setCreateImm,',
    "createImm, setCreateImm,\n    createSize, setCreateSize,"
  );
  fs.writeFileSync('src/renderer/modules/compendium/hooks/useDatabaseForms.ts', content);
  console.log("Added createSize");
}
