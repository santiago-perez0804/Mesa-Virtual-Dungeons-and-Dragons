import json
import sqlite3

def main():
    json_path = r"c:\Users\Sapo\Documents\DND\dnd-vtt\dist\assets\5e-SRD-Hechizos.json"
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print(f"Loaded {len(data)} spells from JSON.")
    
    conn = sqlite3.connect('vtt_database.bd')
    c = conn.cursor()
    
    # Clean existing spells from DB
    c.execute("DELETE FROM content_items WHERE type = 'spell'")
    
    count = 0
    for item in data:
        name = item.get("name")
        c.execute(
            "INSERT INTO content_items (name, type, data, source) VALUES (?, ?, ?, ?)",
            (name, 'spell', json.dumps(item, ensure_ascii=False), 'srd')
        )
        count += 1
        
    conn.commit()
    conn.close()
    
    print(f"Successfully inserted {count} spells into the database.")

if __name__ == "__main__":
    main()
