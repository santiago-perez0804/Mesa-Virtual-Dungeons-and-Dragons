const fs = require('fs');
const indexPath = 'c:/Users/Sapo/Documents/DND/dnd-vtt/index.html';
let content = fs.readFileSync(indexPath, 'utf8');
const script = `<script>
window.onerror = function(msg, url, lineNo, columnNo, error) {
  document.body.innerHTML += "<div style='position:fixed;top:0;left:0;z-index:99999;background:red;color:white;padding:20px;width:100%;'><h1>ERROR:</h1><pre>" + msg + "\\n" + (error ? error.stack : "") + "</pre></div>";
  return false;
};
window.addEventListener("unhandledrejection", function(event) {
  document.body.innerHTML += "<div style='position:fixed;top:0;left:0;z-index:99999;background:red;color:white;padding:20px;width:100%;'><h1>UNHANDLED PROMISE:</h1><pre>" + event.reason + "</pre></div>";
});
</script>`;
if(!content.includes('window.onerror')) {
  content = content.replace('<head>', '<head>' + script);
  fs.writeFileSync(indexPath, content);
  console.log('Added error catcher to index.html');
}
