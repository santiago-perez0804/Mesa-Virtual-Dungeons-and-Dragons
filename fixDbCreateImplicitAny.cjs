const fs = require('fs');
let content = fs.readFileSync('src/renderer/components/compendium/DatabaseCreateForm.tsx', 'utf8');

// Replace map functions with explicitly typed parameters
content = content.replace(/map\(\(t, idx\)/g, "map((t: any, idx: number)");
content = content.replace(/map\(\(v, idx\)/g, "map((v: any, idx: number)");
content = content.replace(/map\(\(v\)/g, "map((v: any)");
content = content.replace(/map\(\(_, i\)/g, "map((_: any, i: number)");
content = content.replace(/map\(\(a, idx\)/g, "map((a: any, idx: number)");

// Filter functions
content = content.replace(/filter\(\(v\)/g, "filter((v: any)");
content = content.replace(/filter\(\(t, i\)/g, "filter((t: any, i: number)");
content = content.replace(/filter\(\(_, i\)/g, "filter((_: any, i: number)");
content = content.replace(/filter\(\(a, i\)/g, "filter((a: any, i: number)");

fs.writeFileSync('src/renderer/components/compendium/DatabaseCreateForm.tsx', content);
console.log("Fixed implicit any in DatabaseCreateForm");
