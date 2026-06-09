export const formatDescription = (text: string): string => {
  if (!text) return '';
  
  // 1. Escapar caracteres HTML básicos para prevenir XSS
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  // 2. Procesar asteriscos dobles ** ** -> Cursiva
  html = html.replace(/\*\*([^*]+)\*\*/g, '<em style="font-style: italic; color: inherit;">$1</em>');
  
  // 3. Procesar asteriscos simples * * -> Negrita Dorada
  html = html.replace(/\*([^*]+)\*/g, '<strong style="font-weight: bold; color: var(--accent-gold);">$1</strong>');
  
  // 4. Procesar barras inclinadas / / -> Un poco más grande
  html = html.replace(/\/([^/]+)\/ /g, '<span style="font-size: 1.15em; line-height: 1.4; color: var(--text-parchment);">$1</span> ');
  html = html.replace(/\/([^/]+)\//g, '<span style="font-size: 1.15em; line-height: 1.4; color: var(--text-parchment);">$1</span>');
  
  // 5. Convertir saltos de línea en etiquetas <br />
  html = html.replace(/\n/g, '<br />');
  
  return html;
};
