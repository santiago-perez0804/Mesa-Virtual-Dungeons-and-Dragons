const fs = require('fs');
const ts = require('typescript');
const sf = ts.createSourceFile('test.ts', fs.readFileSync('src/renderer/modules/compendium/hooks/useDatabaseForms.ts', 'utf8'), ts.ScriptTarget.Latest, true);
let numProps = 0;
function visit(node) {
  if (ts.isReturnStatement(node) && node.expression && ts.isObjectLiteralExpression(node.expression)) {
    numProps = node.expression.properties.length;
    console.log("Return object has properties:", numProps);
  }
  ts.forEachChild(node, visit);
}
visit(sf);
