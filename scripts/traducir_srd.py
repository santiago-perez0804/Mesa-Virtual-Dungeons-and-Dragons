# -*- coding: utf-8 -*-
import sqlite3
import json
import os
import urllib.request
import urllib.error
import time

db_path = r"c:\Users\Sapo\Documents\DND\dnd-vtt\vtt_database.db"
env_path = r"c:\Users\Sapo\Documents\DND\dnd-vtt\.env"

# Load API key
api_key = "AIzaSyA-nKRgmWgDr2XXzWPCUwUWaj6QHTf4uKo"
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith("GEMINI_API_KEY="):
                api_key = line.split("=")[1].strip()

MODEL = "gemini-2.0-flash"
BATCH_SIZE = 5
DELAY_SEC = 6.0

print("--- Iniciando Script de Traduccion D&D 5e (Python + Gemini) ---")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Ensure 'translated' column exists
cursor.execute("PRAGMA table_info(content_items)")
columns = [col[1] for col in cursor.fetchall()]
if 'translated' not in columns:
    cursor.execute("ALTER TABLE content_items ADD COLUMN translated INTEGER DEFAULT 0")
    conn.commit()
    print("Columna 'translated' agregada a content_items.")

def get_progress():
    cursor.execute("SELECT COUNT(*) FROM content_items WHERE type IN ('monster', 'spell', 'item')")
    total = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM content_items WHERE type IN ('monster', 'spell', 'item') AND translated = 1")
    done = cursor.fetchone()[0]
    return total, done

def get_next_batch():
    cursor.execute(
        "SELECT id, name, type, data FROM content_items WHERE type IN ('monster', 'spell', 'item') AND translated = 0 LIMIT ?",
        (BATCH_SIZE,)
    )
    return cursor.fetchall()

def update_record(record_id, name, data_str):
    cursor.execute(
        "UPDATE content_items SET name = ?, data = ?, translated = 1 WHERE id = ?",
        (name, data_str, record_id)
    )

def mark_translated(record_id):
    cursor.execute("UPDATE content_items SET translated = 1 WHERE id = ?", (record_id,))

def extract_texts_to_translate(item_type, name, data):
    texts = {"name": name}
    if item_type == 'monster':
        if 'description' in data: texts['description'] = data['description']
        if 'size' in data: texts['size'] = data['size']
        if 'type' in data: texts['creature_type'] = data['type']
        if 'actions' in data and isinstance(data['actions'], list):
            texts['actions'] = [{"name": a.get('name', ''), "desc": a.get('desc') or a.get('description', '')} for a in data['actions']]
        if 'traits' in data and isinstance(data['traits'], list):
            texts['traits'] = [{"name": t.get('name', ''), "desc": t.get('desc') or t.get('description', '')} for t in data['traits']]
        if 'vulnerabilities' in data: texts['vulnerabilities'] = data['vulnerabilities']
        if 'resistances' in data: texts['resistances'] = data['resistances']
        if 'immunities' in data: texts['immunities'] = data['immunities']
        if 'legendary_actions' in data and isinstance(data['legendary_actions'], list):
            texts['legendary_actions'] = [{"name": a.get('name', ''), "desc": a.get('desc') or a.get('description', '')} for a in data['legendary_actions']]
        if 'special_abilities' in data and isinstance(data['special_abilities'], list):
            texts['special_abilities'] = [{"name": a.get('name', ''), "desc": a.get('desc') or a.get('description', '')} for a in data['special_abilities']]
        if 'reactions' in data and isinstance(data['reactions'], list):
            texts['reactions'] = [{"name": a.get('name', ''), "desc": a.get('desc') or a.get('description', '')} for a in data['reactions']]
    elif item_type == 'spell':
        if 'desc' in data:
            texts['desc'] = "\n".join(data['desc']) if isinstance(data['desc'], list) else data['desc']
        if 'higher_level' in data:
            texts['higher_level'] = "\n".join(data['higher_level']) if isinstance(data['higher_level'], list) else data['higher_level']
        if 'components' in data: texts['components'] = data['components']
        if 'material' in data: texts['material'] = data['material']
        if 'duration' in data: texts['duration'] = data['duration']
        if 'casting_time' in data: texts['casting_time'] = data['casting_time']
        if 'school' in data:
            texts['school'] = data['school'].get('name') if isinstance(data['school'], dict) else data['school']
        if 'range' in data: texts['range'] = data['range']
    elif item_type == 'item':
        if 'desc' in data:
            texts['desc'] = "\n".join(data['desc']) if isinstance(data['desc'], list) else data['desc']
        if 'description' in data: texts['description'] = data['description']
        if 'equipment_category' in data:
            texts['equipment_category'] = data['equipment_category'].get('name') if isinstance(data['equipment_category'], dict) else data['equipment_category']
        if 'weapon_category' in data: texts['weapon_category'] = data['weapon_category']
        if 'weapon_range' in data: texts['weapon_range'] = data['weapon_range']
        if 'armor_category' in data: texts['armor_category'] = data['armor_category']
        if 'rarity' in data:
            texts['rarity'] = data['rarity'].get('name') if isinstance(data['rarity'], dict) else data['rarity']
        if 'tool_category' in data: texts['tool_category'] = data['tool_category']
    return texts

def apply_translations(item_type, original_data, translations):
    d = original_data.copy()
    if item_type == 'monster':
        if 'description' in translations: d['description'] = translations['description']
        if 'size' in translations: d['size'] = translations['size']
        if 'creature_type' in translations: d['type'] = translations['creature_type']
        if 'actions' in translations:
            d['actions'] = []
            orig_actions = original_data.get('actions') or []
            for i, a in enumerate(translations['actions']):
                orig = orig_actions[i] if i < len(orig_actions) else {}
                new_a = orig.copy()
                new_a['name'] = a.get('name') or orig.get('name', '')
                new_a['desc'] = a.get('desc') or orig.get('desc') or orig.get('description', '')
                new_a['description'] = new_a['desc']
                d['actions'].append(new_a)
        if 'traits' in translations:
            d['traits'] = []
            orig_traits = original_data.get('traits') or []
            for i, t in enumerate(translations['traits']):
                orig = orig_traits[i] if i < len(orig_traits) else {}
                new_t = orig.copy()
                new_t['name'] = t.get('name') or orig.get('name', '')
                new_t['desc'] = t.get('desc') or orig.get('desc') or orig.get('description', '')
                d['traits'].append(new_t)
        if 'vulnerabilities' in translations: d['vulnerabilities'] = translations['vulnerabilities']
        if 'resistances' in translations: d['resistances'] = translations['resistances']
        if 'immunities' in translations: d['immunities'] = translations['immunities']
        if 'legendary_actions' in translations:
            d['legendary_actions'] = []
            orig_legendary = original_data.get('legendary_actions') or []
            for i, a in enumerate(translations['legendary_actions']):
                orig = orig_legendary[i] if i < len(orig_legendary) else {}
                new_a = orig.copy()
                new_a['name'] = a.get('name') or orig.get('name', '')
                new_a['desc'] = a.get('desc') or orig.get('desc') or orig.get('description', '')
                d['legendary_actions'].append(new_a)
        if 'special_abilities' in translations:
            d['special_abilities'] = []
            orig_special = original_data.get('special_abilities') or []
            for i, a in enumerate(translations['special_abilities']):
                orig = orig_special[i] if i < len(orig_special) else {}
                new_a = orig.copy()
                new_a['name'] = a.get('name') or orig.get('name', '')
                new_a['desc'] = a.get('desc') or orig.get('desc') or orig.get('description', '')
                d['special_abilities'].append(new_a)
        if 'reactions' in translations:
            d['reactions'] = []
            orig_reactions = original_data.get('reactions') or []
            for i, a in enumerate(translations['reactions']):
                orig = orig_reactions[i] if i < len(orig_reactions) else {}
                new_a = orig.copy()
                new_a['name'] = a.get('name') or orig.get('name', '')
                new_a['desc'] = a.get('desc') or orig.get('desc') or orig.get('description', '')
                d['reactions'].append(new_a)
    elif item_type == 'spell':
        if 'desc' in translations: d['desc'] = [translations['desc']]
        if 'higher_level' in translations: d['higher_level'] = [translations['higher_level']]
        if 'duration' in translations: d['duration'] = translations['duration']
        if 'casting_time' in translations: d['casting_time'] = translations['casting_time']
        if 'school' in translations:
            if isinstance(original_data.get('school'), dict):
                d['school'] = original_data['school'].copy()
                d['school']['name'] = translations['school']
            else:
                d['school'] = translations['school']
        if 'range' in translations: d['range'] = translations['range']
        if 'material' in translations: d['material'] = translations['material']
        if 'components' in translations: d['components'] = translations['components']
    elif item_type == 'item':
        if 'desc' in translations: d['desc'] = [translations['desc']]
        if 'description' in translations: d['description'] = translations['description']
        if 'equipment_category' in translations:
            if isinstance(original_data.get('equipment_category'), dict):
                d['equipment_category'] = original_data['equipment_category'].copy()
                d['equipment_category']['name'] = translations['equipment_category']
            else:
                d['equipment_category'] = translations['equipment_category']
        if 'weapon_category' in translations: d['weapon_category'] = translations['weapon_category']
        if 'weapon_range' in translations: d['weapon_range'] = translations['weapon_range']
        if 'armor_category' in translations: d['armor_category'] = translations['armor_category']
        if 'rarity' in translations:
            if isinstance(original_data.get('rarity'), dict):
                d['rarity'] = original_data['rarity'].copy()
                d['rarity']['name'] = translations['rarity']
            else:
                d['rarity'] = translations['rarity']
        if 'tool_category' in translations: d['tool_category'] = translations['tool_category']
    return d

def translate_batch(items, retry_count=0):
    MAX_RETRIES = 5
    prompt = (
        "Eres un experto traductor de contenido de Dungeons & Dragons 5e del ingles al espanol latinoamericano.\n"
        "Usa la terminologia oficial de D&D en espanol (ej: 'Sneak Attack' -> 'Ataque Furtivo', 'Saving Throw' -> 'Tirada de Salvacion', 'Hit Points' -> 'Puntos de Golpe', 'Armor Class' -> 'Clase de Armadura', etc.).\n"
        "Manten los nombres propios que no tienen traduccion estandar en ingles.\n"
        "Devuelve UNICAMENTE un JSON valido, sin explicaciones ni markdown, con este formato exacto:\n"
        "[\n"
        "  { \"id\": <id>, \"name\": \"<nombre traducido>\", \"translations\": { <campos traducidos> } },\n"
        "  ...\n"
        "]\n\n"
        "Items a traducir:\n" +
        json.dumps([{"id": item["id"], "type": item["type"], "texts": item["texts"]} for item in items], indent=2) +
        "\n\nIMPORTANTE:\n"
        "- Para campos que son arrays (como actions, traits), devuelve el array con los mismos indices.\n"
        "- Para vulnerabilities/resistances/immunities que son arrays de strings, devuelve arrays de strings traducidos.\n"
        "- No omitas ningun campo que se te dio para traducir.\n"
        "- Responde SOLO con el JSON array, sin texto adicional ni markdown."
    )

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={api_key}"
    req_body = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }
    
    headers = {"Content-Type": "application/json"}
    
    try:
        req = urllib.request.Request(url, data=json.dumps(req_body).encode('utf-8'), headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=45) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            
        candidates = res_data.get('candidates', [])
        if not candidates:
            return None
            
        text = candidates[0].get('content', {}).get('parts', [])[0].get('text', '').strip()
        cleaned = text.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned)
    except Exception as e:
        err_msg = str(e)
        is_429 = "429" in err_msg or "quota" in err_msg or "rate" in err_msg
        
        if is_429 and retry_count < MAX_RETRIES:
            wait_sec = 2 ** (retry_count + 2)
            print(f"\n   [Rate limit 429] Esperando {wait_sec}s antes de reintentar (intento {retry_count + 1}/{MAX_RETRIES})...")
            time.sleep(wait_sec)
            return translate_batch(items, retry_count + 1)
            
        print(f"\n   Error en Gemini API: {err_msg[:120]}")
        return None

total, done = get_progress()
print(f"Registros totales: {total}")
print(f"Ya traducidos:     {done}")
print(f"Pendientes:        {total - done}")

if total - done <= 0:
    print("Todo ya esta traducido. Finalizando.")
    conn.close()
    exit(0)

processed = 0
errors = 0
start_time = time.time()

try:
    while True:
        batch = get_next_batch()
        if not batch:
            break

        items_to_translate = []
        for row_id, name, item_type, data_str in batch:
            try:
                data = json.loads(data_str)
            except Exception:
                data = {}
            
            items_to_translate.append({
                "id": row_id,
                "type": item_type,
                "name": name,
                "data": data,
                "texts": extract_texts_to_translate(item_type, name, data)
            })

        print(f"  Traduciendo batch [{done + processed + 1}-{min(total, done + processed + len(batch))}/{total}]...", end="", flush=True)
        translations = translate_batch(items_to_translate)

        if not translations:
            print("\n\n[ERROR DE CUOTA / CONEXIÓN]")
            print("No se pudo obtener respuesta de la API de Gemini tras múltiples intentos de reintento.")
            print("Esto indica que has agotado la cuota de uso (por minuto o diaria) de tu clave API gratuita de Gemini,")
            print("o bien que hay un problema temporal de conexión con el servicio de Google.")
            print("El script se detendrá de forma segura AHORA SIN marcar estos registros como traducidos,")
            print("de modo que puedas continuar exactamente desde aquí más tarde al restablecerse tu cuota.")
            print("Intenta ejecutar de nuevo el script en unos minutos o en unas horas.")
            conn.close()
            exit(1)
        else:
            for t in translations:
                t_id = t.get('id')
                t_name = t.get('name')
                t_fields = t.get('translations') or {}
                
                original = next((i for i in items_to_translate if i["id"] == t_id), None)
                if not original:
                    continue
                
                translated_data = apply_translations(original["type"], original["data"], t_fields)
                update_record(t_id, t_name, json.dumps(translated_data, ensure_ascii=False))

            # Mark missing ones in translation
            for row_id, _, _, _ in batch:
                found = next((t for t in translations if t.get('id') == row_id), None)
                if not found:
                    mark_translated(row_id)

            processed += len(batch)
            elapsed = int(time.time() - start_time)
            rate = int(processed / elapsed * 60) if elapsed > 0 else 0
            print(f" [OK] ({rate} reg/min, {elapsed}s transcurridos)")
            conn.commit()

        time.sleep(DELAY_SEC)

    elapsed_min = round((time.time() - start_time) / 60, 1)
    print("\n--- TRADUCCION COMPLETADA ---")
    print(f"  Traducidos: {processed}")
    print(f"  Errores:    {errors}")
    print(f"  Tiempo:     {elapsed_min} minutos")

except KeyboardInterrupt:
    print("\nProceso interrumpido por el usuario.")
finally:
    conn.close()
