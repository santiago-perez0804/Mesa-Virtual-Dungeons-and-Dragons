# -*- coding: utf-8 -*-
import sqlite3
import json
import os
import urllib.request
import time

db_path = r"c:\Users\Sapo\Documents\DND\dnd-vtt\vtt_database.bd"
env_path = r"c:\Users\Sapo\Documents\DND\dnd-vtt\.env"

api_key = "AIzaSyA-nKRgmWgDr2XXzWPCUwUWaj6QHTf4uKo"
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith("GEMINI_API_KEY="):
                api_key = line.split("=")[1].strip()

MODEL = "gemini-2.0-flash"
BATCH_SIZE = 5
DELAY_SEC = 6.0

print("--- Iniciando Script de Insercion y Traduccion de Reglas D&D 5e ---")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("PRAGMA table_info(content_items)")
columns = [col[1] for col in cursor.fetchall()]
if 'translated' not in columns:
    cursor.execute("ALTER TABLE content_items ADD COLUMN translated INTEGER DEFAULT 0")
    conn.commit()
    print("Columna 'translated' agregada a content_items.")


# Insert data if not exist
rules_path = r"c:\Users\Sapo\Documents\DND\dnd-vtt\dist\assets\5e-SRD-Reglas.json"
sections_path = r"c:\Users\Sapo\Documents\DND\dnd-vtt\dist\assets\5e-SRD-Secciones-Reglas.json"

rules_data = json.load(open(rules_path, 'r', encoding='utf-8'))
sections_data = json.load(open(sections_path, 'r', encoding='utf-8'))

for r in rules_data:
    cursor.execute("SELECT id FROM content_items WHERE name = ? AND type = 'rule'", (r['name'],))
    if not cursor.fetchone():
        cursor.execute("INSERT INTO content_items (name, type, data, translated) VALUES (?, 'rule', ?, 0)", (r['name'], json.dumps(r, ensure_ascii=False)))

for s in sections_data:
    cursor.execute("SELECT id FROM content_items WHERE name = ? AND type = 'rule_section'", (s['name'],))
    if not cursor.fetchone():
        cursor.execute("INSERT INTO content_items (name, type, data, translated) VALUES (?, 'rule_section', ?, 0)", (s['name'], json.dumps(s, ensure_ascii=False)))

conn.commit()

def get_next_batch():
    cursor.execute("SELECT id, name, type, data FROM content_items WHERE type IN ('rule', 'rule_section') AND translated = 0 LIMIT ?", (BATCH_SIZE,))
    return cursor.fetchall()

def translate_batch(items, retry_count=0):
    MAX_RETRIES = 5
    prompt = (
        "Eres un experto traductor de contenido de Dungeons & Dragons 5e del ingles al espanol latinoamericano.\n"
        "Devuelve UNICAMENTE un JSON valido, sin markdown ni backticks, con este formato:\n"
        "[\n"
        "  { \"id\": <id>, \"name\": \"<nombre traducido>\", \"desc\": \"<descripcion o contenido traducido manteniendo el markdown (si habia)>\" }\n"
        "]\n\n"
        "Items a traducir:\n" +
        json.dumps([{"id": item["id"], "name": item["name"], "desc": item["data"].get("desc", "")} for item in items], indent=2) +
        "\n\nIMPORTANTE:\n"
        "- Para 'desc', traduce el texto pero manten el formato markdown (##, *, -, etc).\n"
        "- Responde SOLO con el JSON array."
    )

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={api_key}"
    req_body = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    
    headers = {"Content-Type": "application/json"}
    
    try:
        req = urllib.request.Request(url, data=json.dumps(req_body).encode('utf-8'), headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=60) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            
        candidates = res_data.get('candidates', [])
        if not candidates:
            return None
            
        text = candidates[0].get('content', {}).get('parts', [])[0].get('text', '').strip()
        cleaned = text.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)
    except Exception as e:
        print(f"Error en Gemini API: {e}")
        if retry_count < MAX_RETRIES:
            time.sleep(2 ** (retry_count + 1))
            return translate_batch(items, retry_count + 1)
        return None

processed = 0
while True:
    batch = get_next_batch()
    if not batch:
        break

    items_to_translate = []
    for row_id, name, item_type, data_str in batch:
        data = json.loads(data_str)
        items_to_translate.append({"id": row_id, "name": name, "type": item_type, "data": data})

    print(f"Traduciendo {len(batch)} reglas/secciones...")
    translations = translate_batch(items_to_translate)
    if not translations:
        print("Error al traducir, saliendo.")
        break

    for t in translations:
        t_id = t.get('id')
        t_name = t.get('name')
        t_desc = t.get('desc')
        
        orig = next((i for i in items_to_translate if i['id'] == t_id), None)
        if orig:
            new_data = orig['data'].copy()
            new_data['name'] = t_name
            new_data['desc'] = t_desc
            cursor.execute("UPDATE content_items SET name = ?, data = ?, translated = 1 WHERE id = ?", (t_name, json.dumps(new_data, ensure_ascii=False), t_id))
    
    conn.commit()
    processed += len(batch)
    time.sleep(DELAY_SEC)

print(f"Proceso completado. Traducidos en esta sesion: {processed}")
conn.close()
