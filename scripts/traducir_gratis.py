import sqlite3
import json
import time
from deep_translator import GoogleTranslator

def translate_large_text(text, translator, chunk_size=4000):
    if not text:
        return text
    
    # Simple chunking by newline to avoid cutting in the middle of sentences
    chunks = []
    current_chunk = ""
    for line in text.split('\n'):
        if len(current_chunk) + len(line) + 1 > chunk_size:
            if current_chunk:
                chunks.append(current_chunk)
            current_chunk = line + "\n"
        else:
            current_chunk += line + "\n"
    if current_chunk:
        chunks.append(current_chunk)
        
    translated_text = ""
    for chunk in chunks:
        if chunk.strip():
            try:
                translated_text += translator.translate(chunk) + "\n"
                time.sleep(1) # simple rate limit avoidance
            except Exception as e:
                print(f"Error translating chunk: {e}")
                translated_text += chunk + "\n"
        else:
            translated_text += "\n"
            
    return translated_text

def translate_rules():
    db_path = "vtt_database.bd"
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    translator = GoogleTranslator(source='en', target='es')
    
    cur.execute("SELECT id, name, data FROM content_items WHERE type IN ('rule', 'rule_section') AND translated=0")
    rows = cur.fetchall()
    
    print(f"Encontrados {len(rows)} registros para traducir gratuitamente...")
    
    for row in rows:
        item_id, name, data_str = row
        print(f"Traduciendo: {name}")
        
        try:
            data = json.loads(data_str)
        except json.JSONDecodeError:
            print(f"Error decodificando JSON para {name}")
            continue
            
        # Translate name
        translated_name = translator.translate(name)
        
        # Translate description
        desc = data.get('desc', '')
        if isinstance(desc, list):
            translated_desc = []
            for d in desc:
                translated_desc.append(translate_large_text(d, translator))
            data['desc'] = translated_desc
        else:
            data['desc'] = translate_large_text(desc, translator)
            
        data['name'] = translated_name
        
        # Translate subsections if they exist
        if 'subsections' in data:
            for sub in data['subsections']:
                if 'name' in sub:
                    sub['name'] = translator.translate(sub['name'])
                if 'desc' in sub:
                    sub['desc'] = translate_large_text(sub['desc'], translator)
                    
        new_data_str = json.dumps(data, ensure_ascii=False)
        
        try:
            cur.execute("""
                UPDATE content_items 
                SET name = ?, data = ?, translated = 1 
                WHERE id = ?
            """, (translated_name, new_data_str, item_id))
            conn.commit()
            print(f"  -> Guardado: {translated_name}")
        except Exception as e:
            print(f"Error guardando {name}: {e}")
            conn.rollback()

    conn.close()
    print("Traduccion finalizada.")

if __name__ == "__main__":
    translate_rules()
