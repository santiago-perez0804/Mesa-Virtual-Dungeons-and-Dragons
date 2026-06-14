import json
import sqlite3
import urllib.request
import urllib.parse
import time

DB_PATH = r"c:\Users\Sapo\Documents\DND\dnd-vtt\vtt_database.bd"
JSON_PATH = r"c:\Users\Sapo\Documents\DND\dnd-vtt\dist\assets\5e-SRD-Hechizos.json"

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
        return text

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
    "special": "especial",
    "verbal": "verbal",
    "somatic": "somático",
    "material": "material",
    "until dispelled": "hasta que se disipen",
    "1 action": "1 acción",
    "1 bonus action": "1 acción adicional",
    "1 reaction": "1 reacción",
    "1 minute": "1 minuto",
    "8 hours": "8 horas",
    "24 hours": "24 horas"
}

def clean_term(text):
    low = text.lower().strip()
    if low in DND_SPELL_GLOSSARY:
        return DND_SPELL_GLOSSARY[low]
    return text

def translate_spell(item):
    data_es = item.copy()
    
    # Name
    data_es["name"] = translate_text(item.get("name", ""))
    
    # Description
    desc = item.get("desc", [])
    if isinstance(desc, list):
        data_es["desc"] = [translate_text(d) for d in desc]
    elif isinstance(desc, str):
        data_es["desc"] = translate_text(desc)
    
    # higher_level
    hl = item.get("higher_level", [])
    if isinstance(hl, list):
        data_es["higher_level"] = [translate_text(h) for h in hl]
    
    # range
    if "range" in item:
        data_es["range"] = clean_term(item["range"]) or translate_text(item["range"])
    
    # duration
    if "duration" in item:
        raw = item["duration"]
        data_es["duration"] = clean_term(raw) if raw.lower() in DND_SPELL_GLOSSARY else translate_text(raw)
    
    # casting_time
    if "casting_time" in item:
        raw = item["casting_time"]
        data_es["casting_time"] = clean_term(raw) if raw.lower() in DND_SPELL_GLOSSARY else translate_text(raw)
    
    # school
    if "school" in item:
        school = item["school"]
        if isinstance(school, dict):
            raw_name = school.get("name", "")
            data_es["school"] = dict(school)
            data_es["school"]["name"] = DND_SPELL_GLOSSARY.get(raw_name.lower(), translate_text(raw_name))
        elif isinstance(school, str):
            data_es["school"] = DND_SPELL_GLOSSARY.get(school.lower(), translate_text(school))
    
    # material
    if "material" in item:
        data_es["material"] = translate_text(item["material"])
    
    return data_es

def main():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    print(f"Loaded {len(data)} spells from JSON.")
    
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Clear existing spells and reload fresh from JSON (to get complete translated versions)
    c.execute("DELETE FROM content_items WHERE type = 'spell'")
    conn.commit()
    print("Cleared existing spells. Starting fresh translation...")
    
    count = 0
    start_time = time.time()
    
    for idx, item in enumerate(data):
        name_en = item.get("name", "")
        
        translated = translate_spell(item)
        name_es = translated["name"]
        
        print(f"[{idx+1}/{len(data)}] {name_en} -> {name_es}")
        
        c.execute(
            "INSERT INTO content_items (name, type, data, source) VALUES (?, ?, ?, ?)",
            (name_es, 'spell', json.dumps(translated, ensure_ascii=False), 'srd')
        )
        count += 1
        
        if idx % 10 == 0:
            conn.commit()
            time.sleep(0.4)
    
    conn.commit()
    conn.close()
    
    end_time = time.time()
    print(f"\nSuccessfully translated and inserted {count} spells in {(end_time - start_time)/60:.1f} minutes.")

if __name__ == "__main__":
    main()
