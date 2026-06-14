import json
import sqlite3
import urllib.request
import urllib.parse

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
        print(f"\n[Warning] Error translating: {e}")
        return text

GLOSSARY_LANGUAGES = {
    "common": "Común",
    "dwarvish": "Enano",
    "elvish": "Élfico",
    "giant": "Gigante",
    "gnomish": "Gnomo",
    "goblin": "Goblin",
    "halfling": "Mediano",
    "orc": "Orco",
    "abyssal": "Abisal",
    "celestial": "Celestial",
    "draconic": "Dracónico",
    "deep speech": "Jerga de las Profundidades",
    "deep-speech": "Jerga de las Profundidades",
    "infernal": "Infernal",
    "primordial": "Primordial",
    "sylvan": "Silvano",
    "undercommon": "Infracomún"
}

GLOSSARY_SPEAKERS = {
    "humans": "Humanos",
    "dwarves": "Enanos",
    "elves": "Elfos",
    "ogres": "Ogros",
    "giants": "Gigantes",
    "gnomes": "Gnomos",
    "goblinoids": "Goblinoides",
    "halflings": "Medianos",
    "orcs": "Orcos",
    "demons": "Demonios",
    "celestials": "Celestiales",
    "dragons": "Dragones",
    "dragonborn": "Dracónidos",
    "aboleths": "Aboleths",
    "cloakers": "Mantos",
    "devils": "Diablos",
    "elementals": "Elementales",
    "fey creatures": "Criaturas feéricas",
    "underdark traders": "Comerciantes de la Infraoscuridad"
}

GLOSSARY_TYPES = {
    "standard": "Estándar",
    "exotic": "Exótico"
}

def translate_item(item):
    # Translate Name
    name = item.get("name", "")
    translated_name = GLOSSARY_LANGUAGES.get(name.lower(), GLOSSARY_LANGUAGES.get(item.get("index", "").lower(), name))
    
    # Translate Type
    itype = item.get("type", "")
    translated_type = GLOSSARY_TYPES.get(itype.lower(), itype)
    
    # Translate Script
    script = item.get("script", "")
    translated_script = GLOSSARY_LANGUAGES.get(script.lower(), script) if script else None
    
    # Translate typical speakers
    speakers = item.get("typical_speakers", [])
    translated_speakers = [GLOSSARY_SPEAKERS.get(s.lower(), s) for s in speakers]
    
    # Translate Description/Desc
    desc = item.get("desc", "")
    translated_desc = translate_text(desc) if desc else ""
    
    translated_item = {
        "index": item.get("index"),
        "name": translated_name,
        "type": translated_type,
        "typical_speakers": translated_speakers,
        "desc": translated_desc,
        "description": translated_desc
    }
    if translated_script:
        translated_item["script"] = translated_script
        
    return translated_name, translated_item

def main():
    json_path = r"c:\Users\Sapo\Documents\DND\dnd-vtt\dist\assets\5e-SRD-Idiomas.json"
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print(f"Loaded {len(data)} languages from JSON.")
    
    conn = sqlite3.connect('vtt_database.bd')
    c = conn.cursor()
    
    # Delete existing languages from DB to avoid duplicates
    c.execute("DELETE FROM content_items WHERE type = 'language'")
    
    count = 0
    for item in data:
        name_es, data_es = translate_item(item)
        print(f"Translating: {item['name']} -> {name_es}")
        
        c.execute(
            "INSERT INTO content_items (name, type, data, source) VALUES (?, ?, ?, ?)",
            (name_es, 'language', json.dumps(data_es, ensure_ascii=False), 'srd')
        )
        count += 1
        
    conn.commit()
    conn.close()
    
    print(f"Successfully translated and inserted {count} languages into the database.")

if __name__ == "__main__":
    main()
