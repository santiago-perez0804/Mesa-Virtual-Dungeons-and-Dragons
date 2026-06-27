export const formatDescription = (text: any): string => {
  if (!text) return '';
  if (Array.isArray(text)) text = text.join('\n');
  if (typeof text !== 'string') text = String(text);

  let html = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  html = html.replace(/^####\s+(.*?)$/gim, '<h4 style="color: var(--gold-primary); font-family: var(--font-cinzel); font-size: 1.05rem; margin-top: 12px; margin-bottom: 4px;">$1</h4>');
  html = html.replace(/^###\s+(.*?)$/gim, '<h3 style="color: var(--gold-primary); font-family: var(--font-cinzel); font-size: 1.15rem; margin-top: 16px; margin-bottom: 6px;">$1</h3>');
  html = html.replace(/^##\s+(.*?)$/gim, '<h2 style="color: var(--accent-gold); font-family: var(--font-cinzel); font-size: 1.3rem; margin-top: 20px; margin-bottom: 8px;">$1</h2>');
  html = html.replace(/^#\s+(.*?)$/gim, '<h1 style="color: var(--accent-gold); font-family: var(--font-cinzel); font-size: 1.5rem; margin-top: 25px; margin-bottom: 10px;">$1</h1>');

  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight: bold; color: var(--accent-gold);">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em style="font-style: italic; color: inherit;">$1</em>');
  html = html.replace(new RegExp('\\/([^\\/]+)\\/ ', 'g'), '<span style="font-size: 1.15em; line-height: 1.4; color: var(--text-parchment);">$1</span> ');
  html = html.replace(new RegExp('\\/([^\\/]+)\\/', 'g'), '<span style="font-size: 1.15em; line-height: 1.4; color: var(--text-parchment);">$1</span>');

  html = html.replace(/(<\/[hH][1-6]>)\s*\n+/g, '$1\n');
  html = html.replace(/\n/g, '<br />');
  html = html.replace(/(<\/[hH][1-6]>)<br \/>/g, '$1');

  // Strip all possible literal tags in case they were injected somehow
  html = html.replace(/<h[1-6]\/>/g, '');
  html = html.replace(/<h2>/g, '');
  html = html.replace(/<strong>/g, '');
  html = html.replace(/&lt;h2&gt;/gi, '');
  html = html.replace(/&lt;\/h2&gt;/gi, '');
  html = html.replace(/&lt;strong&gt;/gi, '');
  html = html.replace(/&lt;\/strong&gt;/gi, '');

  html += '<br /><br /><span style="background: red; color: white; padding: 5px; font-weight: bold;">FORMATTER ACTIVE V3</span>';

  return html;
};
