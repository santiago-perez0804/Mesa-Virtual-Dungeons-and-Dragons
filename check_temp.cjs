const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(process.cwd(), 'vtt_database.bd');
const fs = require('fs');
console.log('DB Path:', dbPath);
console.log('Exists:', fs.existsSync(dbPath));
try {
  const db = new Database(dbPath);
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();
  console.log('Tablas:', tables.map(t => t.name));
  const count = db.prepare('SELECT COUNT(*) as cnt FROM content_items').get();
  console.log('content_items count:', count.cnt);
  const byBook = db.prepare('SELECT book_id, COUNT(*) as cnt FROM content_items GROUP BY book_id').all();
  console.log('Por book_id:', JSON.stringify(byBook));
  const sample = db.prepare('SELECT id, name, type, book_id FROM content_items LIMIT 5').all();
  console.log('Muestra:', JSON.stringify(sample, null, 2));
  try {
    const bcount = db.prepare('SELECT COUNT(*) as cnt FROM books').get();
    console.log('books:', bcount);
    const books = db.prepare('SELECT * FROM books').all();
    console.log('Libros:', JSON.stringify(books));
  } catch(e) { console.log('Books error:', e.message); }
  db.close();
} catch(e) { console.log('Error:', e.message); }
