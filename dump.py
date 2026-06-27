import sqlite3
import json

conn = sqlite3.connect('vtt_database.bd')
cur = conn.cursor()
cur.execute("SELECT data FROM content_items WHERE type = 'rule_section'")
rows = cur.fetchall()
with open('all_rules.txt', 'w', encoding='utf-8') as f:
    for row in rows:
        data = json.loads(row[0])
        f.write(data.get('desc', '') + '\n\n')
