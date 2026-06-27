const fs = require('fs');

let html = "## Iniciativa\r\n";
html = html.replace(/^##\s+(.*$)/gim, '<h2 style="color: gold;">$1</h2>');
html = html.replace(/\n/g, '<br />');
html = html.replace(/<\/h([1-6])><br \/>/g, '</h$1>>');

console.log(JSON.stringify(html));
