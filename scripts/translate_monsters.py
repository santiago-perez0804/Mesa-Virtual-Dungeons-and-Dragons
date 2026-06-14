import json
import sqlite3
import urllib.request
import urllib.parse
import time

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
        # print(f"\n[Warning] Error translating: {e}")
        return text

GLOSSARY_SIZE = {
    "tiny": "Diminuto",
    "small": "Pequeño",
    "medium": "Mediano",
    "large": "Grande",
    "huge": "Enorme",
    "gargantuan": "Gargantuesco"
}

GLOSSARY_TYPE = {
    "aberration": "aberración",
    "beast": "bestia",
    "celestial": "celestial",
    "construct": "constructo",
    "dragon": "dragón",
    "elemental": "elemental",
    "fey": "feérico",
    "fiend": "infernal",
    "giant": "gigante",
    "humanoid": "humanoide",
    "monstrosity": "monstruosidad",
    "ooze": "cieno",
    "plant": "planta",
    "undead": "muerto viviente"
}

GLOSSARY_ALIGNMENT = {
    "lawful good": "legal bueno",
    "neutral good": "neutral bueno",
    "chaotic good": "caótico bueno",
    "lawful neutral": "legal neutral",
    "neutral": "neutral",
    "chaotic neutral": "caótico neutral",
    "lawful evil": "legal maligno",
    "neutral evil": "neutral maligno",
    "chaotic evil": "caótico maligno",
    "unaligned": "sin alineamiento",
    "any alignment": "cualquier alineamiento"
}

GLOSSARY_COMMON = {
    "multiattack": "Multiataque",
    "bite": "Mordisco",
    "claw": "Garra",
    "tail": "Cola",
    "frightful presence": "Presencia pavorosa",
    "spellcasting": "Lanzamiento de conjuros",
    "club": "Garrote",
    "dagger": "Daga",
    "greatsword": "Espadón",
    "shortbow": "Arco corto",
    "longbow": "Arco largo",
    "spear": "Lanza",
    "mace": "Maza"
}

def translate_ability_or_action(item):
    if not item:
        return item
    name_en = item.get("name", "")
    name_es = GLOSSARY_COMMON.get(name_en.lower(), translate_text(name_en))
    
    desc_en = item.get("desc", "")
    desc_es = translate_text(desc_en)
    
    translated = item.copy()
    translated["name"] = name_es
    translated["desc"] = desc_es
    return translated

def translate_monster(m):
    # Translate Name
    name_en = m.get("name", "")
    name_es = translate_text(name_en)
    
    # Translate Size
    size_en = m.get("size", "")
    size_es = GLOSSARY_SIZE.get(size_en.lower(), size_en)
    
    # Translate Type
    type_en = m.get("type", "")
    type_es = GLOSSARY_TYPE.get(type_en.lower(), type_en)
    
    # Translate Alignment
    alignment_en = m.get("alignment", "")
    alignment_es = GLOSSARY_ALIGNMENT.get(alignment_en.lower(), alignment_en)
    
    # Translate Languages
    languages_en = m.get("languages", "")
    languages_es = translate_text(languages_en)
    
    # Translate Special Abilities
    special_abilities = m.get("special_abilities", [])
    special_abilities_es = [translate_ability_or_action(sa) for sa in special_abilities]
    
    # Translate Actions
    actions = m.get("actions", [])
    actions_es = [translate_ability_or_action(a) for a in actions]
    
    # Translate Legendary Actions
    legendary_actions = m.get("legendary_actions", [])
    legendary_actions_es = [translate_ability_or_action(la) for la in legendary_actions]
    
    data_es = m.copy()
    data_es["name"] = name_es
    data_es["size"] = size_es
    data_es["type"] = type_es
    data_es["alignment"] = alignment_es
    data_es["languages"] = languages_es
    data_es["special_abilities"] = special_abilities_es
    data_es["actions"] = actions_es
    data_es["legendary_actions"] = legendary_actions_es
    
    # Extract hit points and armor class to top level for compatibility
    if "armor_class" in m:
        ac_val = m["armor_class"]
        if isinstance(ac_val, list) and len(ac_val) > 0:
            data_es["ac"] = ac_val[0].get("value", 10)
        elif isinstance(ac_val, dict):
            data_es["ac"] = ac_val.get("value", 10)
        else:
            data_es["ac"] = ac_val
            
    if "hit_points" in m:
        data_es["hp"] = m["hit_points"]
        
    if "challenge_rating" in m:
        data_es["cr"] = m["challenge_rating"]
        
    return name_es, data_es

def main():
    json_path = r"c:\Users\Sapo\Documents\DND\dnd-vtt\dist\assets\5e-SRD-Monstruos.json"
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print(f"Loaded {len(data)} monsters from JSON.")
    
    conn = sqlite3.connect('vtt_database.bd')
    c = conn.cursor()
    
    # Clear current monsters (which are in English)
    c.execute("DELETE FROM content_items WHERE type = 'monster'")
    
    count = 0
    start_time = time.time()
    
    for idx, item in enumerate(data):
        name_en = item.get("name")
        name_es, data_es = translate_monster(item)
        print(f"[{idx+1}/{len(data)}] Translated: {name_en} -> {name_es}")
        
        c.execute(
            "INSERT INTO content_items (name, type, data, source) VALUES (?, ?, ?, ?)",
            (name_es, 'monster', json.dumps(data_es, ensure_ascii=False), 'srd')
        )
        count += 1
        
        # Avoid hammering too fast
        if idx % 10 == 0:
            time.sleep(0.4)
            
    conn.commit()
    conn.close()
    
    end_time = time.time()
    print(f"Successfully translated and inserted {count} monsters in {end_time - start_time:.2f} seconds.")

if __name__ == "__main__":
    main()
