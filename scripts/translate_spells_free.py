# -*- coding: utf-8 -*-
import sqlite3
import json
import urllib.request
import urllib.parse
import time
import sys

db_path = r"c:\Users\Sapo\Documents\DND\dnd-vtt\vtt_database.db"

def translate_text(text, source='en', target='es'):
    if not text or not isinstance(text, str):
        return text
    if text.strip().isdigit():
        return text
    try:
        url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + source + "&tl=" + target + "&dt=t&q=" + urllib.parse.quote(text)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as response:
            res = json.loads(response.read().decode('utf-8'))
            translated = "".join([part[0] for part in res[0] if part[0]])
            return translated
    except Exception as e:
        print(f"\n[Warning] Error translating '{text[:30]}...': {e}")
        return text

# D&D Spell components / terms glossary
DND_SPELL_GLOSSARY = {
    "abjuration": "abjuración",
    "conjuration": "conjuración",
    "divination": "divinación",
    "enchantment": "encantamiento",
    "evocation": "evocación",
    "illusion": "ilusión",
    "necromancy": "necromancia",
    "transmutation": "transmutación",
    "instantaneous": "instantáneo",
    "concentration": "concentración",
    "action": "acción",
    "bonus action": "acción adicional",
    "reaction": "reacción",
    "minute": "minuto",
    "minutes": "minutos",
    "hour": "hora",
    "hours": "horas",
    "day": "día",
    "days": "días",
    "self": "sí mismo",
    "touch": "toque",
    "sight": "vista",
    "unlimited": "ilimitado",
    "special": "especial"
}

def clean_dnd_spells(original_text, translated_text):
    text_lower = original_text.lower().strip()
    if text_lower in DND_SPELL_GLOSSARY:
        return DND_SPELL_GLOSSARY[text_lower].capitalize()
    return translated_text

print("--- Iniciando Traducción Rápida y Gratuita de Hechizos D&D (Keyless) ---")

conn = sqlite3.connect(db_path, timeout=30.0)
cursor = conn.cursor()

# Ensure 'translated' column exists
cursor.execute("PRAGMA table_info(content_items)")
columns = [col[1] for col in cursor.fetchall()]
if 'translated' not in columns:
    cursor.execute("ALTER TABLE content_items ADD COLUMN translated INTEGER DEFAULT 0")
    conn.commit()
    print("Columna 'translated' agregada a content_items.")

# Get counts
cursor.execute("SELECT COUNT(*) FROM content_items WHERE type = 'spell'")
total_spells = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(*) FROM content_items WHERE type = 'spell' AND translated = 1")
translated_spells = cursor.fetchone()[0]

pending_spells = total_spells - translated_spells
print(f"Hechizos Totales: {total_spells}")
print(f"Ya traducidos:    {translated_spells}")
print(f"Pendientes:       {pending_spells}")

if pending_spells <= 0:
    print("¡Todos los hechizos ya han sido traducidos!")
    conn.close()
    sys.exit(0)

# Fetch all pending spells
cursor.execute("SELECT id, name, data FROM content_items WHERE type = 'spell' AND translated = 0")
rows = cursor.fetchall()

processed_count = 0
start_time = time.time()

try:
    for row_id, name, data_str in rows:
        processed_count += 1
        pct = (processed_count / pending_spells) * 100
        
        # Load JSON data
        try:
            data = json.loads(data_str)
        except Exception:
            data = {}
            
        print(f"[{processed_count}/{pending_spells}] ({pct:.1f}%) Traduciendo Hechizo: '{name}'...", end="", flush=True)
        
        # 1. Translate name
        translated_name = translate_text(name)
        
        # 2. Translate desc (often a list of paragraphs)
        if 'desc' in data:
            if isinstance(data['desc'], list):
                translated_desc_list = []
                for paragraph in data['desc']:
                    translated_desc_list.append(translate_text(paragraph))
                data['desc'] = translated_desc_list
            else:
                data['desc'] = translate_text(data['desc'])
                
        if 'description' in data and isinstance(data['description'], str):
            data['description'] = translate_text(data['description'])
            
        # 3. Translate higher_level
        if 'higher_level' in data:
            if isinstance(data['higher_level'], list):
                translated_hl = []
                for hl in data['higher_level']:
                    translated_hl.append(translate_text(hl))
                data['higher_level'] = translated_hl
            else:
                data['higher_level'] = translate_text(data['higher_level'])
                
        # 4. Translate duration
        if 'duration' in data:
            data['duration'] = clean_dnd_spells(data['duration'], translate_text(data['duration']))
            
        # 5. Translate casting_time
        if 'casting_time' in data:
            data['casting_time'] = clean_dnd_spells(data['casting_time'], translate_text(data['casting_time']))
            
        # 6. Translate school
        if 'school' in data:
            if isinstance(data['school'], dict) and 'name' in data['school']:
                raw_school = data['school']['name']
                data['school']['name'] = clean_dnd_spells(raw_school, translate_text(raw_school))
            elif isinstance(data['school'], str):
                data['school'] = clean_dnd_spells(data['school'], translate_text(data['school']))
                
        # 7. Translate range
        if 'range' in data:
            data['range'] = clean_dnd_spells(data['range'], translate_text(data['range']))
            
        # 8. Translate material component
        if 'material' in data:
            data['material'] = translate_text(data['material'])
            
        # Update database
        cursor.execute(
            "UPDATE content_items SET name = ?, data = ?, translated = 1 WHERE id = ?",
            (translated_name, json.dumps(data, ensure_ascii=False), row_id)
        )
        conn.commit()
        
        print(f" -> '{translated_name}' [OK]")
        
        # Be gentle to Google's translation server with a short pause
        time.sleep(0.35)

    elapsed = time.time() - start_time
    print("\n--- TRADUCCIÓN DE HECHIZOS COMPLETADA CON ÉXITO ---")
    print(f"Hechizos traducidos: {processed_count}")
    print(f"Tiempo transcurrido: {elapsed/60:.1f} minutos")

except KeyboardInterrupt:
    print("\n[Interrumpido] Proceso detenido por el usuario de forma segura. Todos los cambios se han guardado.")
finally:
    conn.close()
