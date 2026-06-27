const formatDescription = (text) => {
  let html = text;
  
  html = html.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  html = html.replace(/^####\s+(.*?)$/gim, '<h4 style="color: var(--gold-primary);">$1</h4>');
  html = html.replace(/^###\s+(.*?)$/gim, '<h3 style="color: var(--gold-primary);">$1</h3>');
  html = html.replace(/^##\s+(.*?)$/gim, '<h2 style="color: var(--accent-gold);">$1</h2>');
  html = html.replace(/^#\s+(.*?)$/gim, '<h1 style="color: var(--accent-gold);">$1</h1>');

  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight: bold;">$1</strong>');
  
  html = html.replace(/\*([^*]+)\*/g, '<em style="font-style: italic;">$1</em>');
  
  html = html.replace(/(<\/[hH][1-6]>)\s*\n+/g, '$1\n');
  html = html.replace(/\n/g, '<br />');
  html = html.replace(/(<\/[hH][1-6]>)<br \/>/g, '$1');
  
  return html;
};

console.log(formatDescription("## 1. Protocolo de Secuencia Inicial\nCuando se desencadena"));
console.log(formatDescription("1. **Determinar Sorpresa:** Evaluar qué criaturas"));
