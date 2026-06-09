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
    # Avoid translating numeric strings or empty strings
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

# Dictionary for common D&D translations to keep terminology extremely accurate and clean
DND_TERM_GLOSSARY = {
    "longsword": "espada larga",
    "shortsword": "espada corta",
    "greatsword": "espadón",
    "dagger": "daga",
    "shield": "escudo",
    "leather armor": "armadura de cuero",
    "leather": "cuero",
    "padded": "acolchada",
    "stud": "tachonado",
    "studded leather": "cuero tachonado",
    "hide": "piel",
    "scale mail": "cota de escamas",
    "ring mail": "cota de anillas",
    "chain mail": "cota de malla",
    "splint": "bandas",
    "plate": "placas",
    "breastplate": "coraza",
    "half plate": "media armadura",
    "halberd": "alabarda",
    "javelin": "jabalina",
    "mace": "maza",
    "spear": "lanza",
    "quarterstaff": "bastón",
    "hand crossbow": "ballesta de mano",
    "heavy crossbow": "ballesta pesada",
    "light crossbow": "ballesta ligera",
    "shortbow": "arco corto",
    "longbow": "arco largo",
    "dart": "dardo",
    "sling": "honda",
    "common": "común",
    "uncommon": "poco común",
    "rare": "raro",
    "very rare": "muy raro",
    "legendary": "legendario",
    "artifact": "artefacto",
    "potion of healing": "poción de curación"
}

def clean_dnd_translation(original_name, translated_name):
    # If the exact English term has a standard translation, override Google Translate's guess
    orig_lower = original_name.lower().strip()
    if orig_lower in DND_TERM_GLOSSARY:
        return DND_TERM_GLOSSARY[orig_lower].capitalize()
    
    # Check simple partial match overrides
    trans_lower = translated_name.lower()
    for eng, esp in DND_TERM_GLOSSARY.items():
        if eng in orig_lower and esp not in trans_lower:
            # Replaces terms like 'Potion of healing' or 'Leather armor +1' neatly
            translated_name = translated_name.replace(original_name, esp.capitalize())
    return translated_name

print("--- Iniciando Traducción Rápida y Gratuita de Objetos D&D (Keyless) ---")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Ensure 'translated' column exists
cursor.execute("PRAGMA table_info(content_items)")
columns = [col[1] for col in cursor.fetchall()]
if 'translated' not in columns:
    cursor.execute("ALTER TABLE content_items ADD COLUMN translated INTEGER DEFAULT 0")
    conn.commit()
    print("Columna 'translated' agregada a content_items.")

# Get counts
cursor.execute("SELECT COUNT(*) FROM content_items WHERE type = 'item'")
total_items = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(*) FROM content_items WHERE type = 'item' AND translated = 1")
translated_items = cursor.fetchone()[0]

pending_items = total_items - translated_items
print(f"Objetos Totales: {total_items}")
print(f"Ya traducidos:   {translated_items}")
print(f"Pendientes:      {pending_items}")

if pending_items <= 0:
    print("¡Todos los objetos ya han sido traducidos!")
    conn.close()
    sys.exit(0)

# Fetch all pending items
cursor.execute("SELECT id, name, data FROM content_items WHERE type = 'item' AND translated = 0")
rows = cursor.fetchall()

processed_count = 0
start_time = time.time()

try:
    for row_id, name, data_str in rows:
        processed_count += 1
        pct = (processed_count / pending_items) * 100
        
        # Load JSON data
        try:
            data = json.loads(data_str)
        except Exception:
            data = {}
            
        print(f"[{processed_count}/{pending_items}] ({pct:.1f}%) Traduciendo: '{name}'...", end="", flush=True)
        
        # 1. Translate name
        translated_name = translate_text(name)
        translated_name = clean_dnd_translation(name, translated_name)
        
        # 2. Translate desc/description
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
            
        # 3. Translate category and properties if they are dicts or strings
        if 'equipment_category' in data:
            if isinstance(data['equipment_category'], dict) and 'name' in data['equipment_category']:
                raw_cat = data['equipment_category']['name']
                data['equipment_category']['name'] = translate_text(raw_cat)
            elif isinstance(data['equipment_category'], str):
                data['equipment_category'] = translate_text(data['equipment_category'])
                
        if 'weapon_category' in data:
            data['weapon_category'] = translate_text(data['weapon_category'])
            
        if 'weapon_range' in data:
            data['weapon_range'] = translate_text(data['weapon_range'])
            
        if 'armor_category' in data:
            data['armor_category'] = translate_text(data['armor_category'])
            
        if 'rarity' in data:
            if isinstance(data['rarity'], dict) and 'name' in data['rarity']:
                raw_rarity = data['rarity']['name']
                data['rarity']['name'] = clean_dnd_translation(raw_rarity, translate_text(raw_rarity))
            elif isinstance(data['rarity'], str):
                data['rarity'] = clean_dnd_translation(data['rarity'], translate_text(data['rarity']))
                
        if 'tool_category' in data:
            data['tool_category'] = translate_text(data['tool_category'])
            
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
    print("\n--- TRADUCCIÓN COMPLETADA CON ÉXITO ---")
    print(f"Objetos traducidos: {processed_count}")
    print(f"Tiempo transcurrido: {elapsed/60:.1f} minutos")

except KeyboardInterrupt:
    print("\n[Interrumpido] Proceso detenido por el usuario de forma segura. Todos los cambios se han guardado.")
finally:
    conn.close()
