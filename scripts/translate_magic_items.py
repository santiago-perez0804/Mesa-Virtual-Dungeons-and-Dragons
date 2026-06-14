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
        print(f"\n[Warning] Error translating: {e}")
        return text

GLOSSARY_RARITY = {
    "common": "Común",
    "uncommon": "Poco Común",
    "rare": "Raro",
    "very rare": "Muy Raro",
    "legendary": "Legendario",
    "artifact": "Artefacto",
    "varies": "Varía"
}

GLOSSARY_CATEGORY = {
    "armor": "Armadura",
    "ammunition": "Munición",
    "wondrous-items": "Objetos Maravillosos",
    "rings": "Anillos",
    "staffs": "Bastones",
    "rods": "Varas",
    "potions": "Pociones",
    "scrolls": "Pergaminos",
    "shields": "Escudos",
    "weapons": "Armas"
}

def main():
    json_path = r"c:\Users\Sapo\Documents\DND\dnd-vtt\dist\assets\5e-SRD-Objetos-Magicos.json"
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print(f"Loaded {len(data)} magic items from JSON.")
    
    conn = sqlite3.connect('vtt_database.bd')
    c = conn.cursor()
    
    # Delete magic items or existing homebrew items that might duplicate?
    # Note: We want to preserve custom user items (which don't have source 'srd' or category from SRD).
    # SRD items have source = 'srd' and type = 'item' and in their data they have isMagic = true or tags like 'objeto magico'.
    # Actually, to be safe, we can just delete from content_items where type = 'item' and source = 'srd' and data like '%"rarity"%' or data like '%"magic"%' or similar,
    # or delete all type = 'item' with source = 'srd' if we want to reload all equipment + magic items.
    # Wait, the user already loaded equipment. Did they want us to merge magic items? Yes: "añadelo a la base de datos y Biblioteca > Objetos".
    # Let's delete only magic items from DB. In our insertion, we will set source = 'srd_magic'.
    # That way we can easily delete them:
    c.execute("DELETE FROM content_items WHERE type = 'item' AND source = 'srd_magic'")
    
    count = 0
    start_time = time.time()
    
    for idx, item in enumerate(data):
        name_en = item.get("name")
        # Translate name
        name_es = translate_text(name_en)
        
        # Translate rarity
        rarity_en = item.get("rarity", {}).get("name", "Common")
        rarity_es = GLOSSARY_RARITY.get(rarity_en.lower(), translate_text(rarity_en))
        
        # Translate category
        cat_en = item.get("equipment_category", {}).get("name", "")
        cat_es = GLOSSARY_CATEGORY.get(cat_en.lower(), translate_text(cat_en))
        
        # Translate description list
        desc_list = item.get("desc", [])
        desc_es = [translate_text(line) for line in desc_list]
        
        # Construct translated data object
        # Needs to match what is parsed by DetalleBaseDatos:
        # data.rarity, data.description, data.tags, etc.
        tags = [cat_es.lower(), "objeto mágico"]
        requires_attunement = any("requires attunement" in line.lower() or "requiere sintonización" in line.lower() for line in desc_es + desc_list)
        
        data_es = {
            "index": item.get("index"),
            "name": name_es,
            "rarity": rarity_es,
            "description": "\n\n".join(desc_es),
            "desc": desc_es,
            "tags": tags,
            "requiresAttunement": requires_attunement,
            "equipment_category": {
                "index": item.get("equipment_category", {}).get("index"),
                "name": cat_es
            },
            "source": "srd_magic"
        }
        
        # Determine if it's armor or protect
        if cat_en.lower() == "armor" or cat_es.lower() == "armadura" or "armor" in name_en.lower():
            data_es["tags"].append("armadura")
            data_es["armorType"] = "media" # default fallback
            data_es["isProtect"] = True
            
        # Determine if it's a weapon or damage item
        if cat_en.lower() == "weapons" or cat_es.lower() == "armas" or "weapon" in name_en.lower() or "sword" in name_en.lower() or "staff" in name_en.lower():
            data_es["tags"].append("arma")
            
        print(f"[{idx+1}/{len(data)}] Translated: {name_en} -> {name_es} ({rarity_es})")
        
        c.execute(
            "INSERT INTO content_items (name, type, data, source) VALUES (?, ?, ?, ?)",
            (name_es, 'item', json.dumps(data_es, ensure_ascii=False), 'srd_magic')
        )
        count += 1
        
        # Avoid hammering the translate endpoint too fast
        if idx % 10 == 0:
            time.sleep(0.5)
            
    conn.commit()
    conn.close()
    
    end_time = time.time()
    print(f"Successfully translated and inserted {count} magic items in {end_time - start_time:.2f} seconds.")

if __name__ == "__main__":
    main()
