import sqlite3
import json

conn = sqlite3.connect('vtt_database.bd')
cur = conn.cursor()
cur.execute("SELECT data FROM content_items WHERE name = 'Módulo: Inicio del Encuentro y Sorpresa';")
res = cur.fetchone()
print(res[0])
conn.close()
