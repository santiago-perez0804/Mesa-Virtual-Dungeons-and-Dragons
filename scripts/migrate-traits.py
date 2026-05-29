# -*- coding: utf-8 -*-
import sqlite3
import json
import os

db_path = r"c:\Users\Sapo\Documents\DND\dnd-vtt\vtt_database.db"

print("--- Iniciando Migracion y Unificacion de Rasgos (Python) ---")

if not os.path.exists(db_path):
    print(f"Error: No se encontro la base de datos en {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # 1. Eliminar rasgos viejos en ingles
    cursor.execute("DELETE FROM class_features WHERE class_name IN ('barbarian', 'fighter', 'rogue')")
    print(f"Eliminados {cursor.rowcount} rasgos antiguos en ingles de class_features.")

    # 2. Renombrar 'Rabia' a 'Furia' en la clase Barbaro en content_items
    cursor.execute("SELECT id, name, data FROM content_items WHERE type = 'class' AND (name = 'Bárbaro' OR name = 'Barbaro')")
    barbaro_row = cursor.fetchone()

    if barbaro_row:
        barbaro_id, barbaro_name, barbaro_data_str = barbaro_row
        try:
            data = json.loads(barbaro_data_str)
        except Exception:
            data = {}

        modified = False

        # Renombrar en traits array
        if 'traits' in data and isinstance(data['traits'], list):
            for t in data['traits']:
                if t.get('name') == 'Rabia':
                    print("Renombrando trait 'Rabia' a 'Furia' en el array de rasgos del Barbaro.")
                    t['name'] = 'Furia'
                    modified = True

        # Renombrar en tabla markdown
        if 'table' in data and isinstance(data['table'], str) and 'Rabia' in data['table']:
            print("Renombrando 'Rabia' a 'Furia' en la tabla de progresion del Barbaro.")
            data['table'] = data['table'].replace('Rabia', 'Furia')
            modified = True

        if modified:
            cursor.execute("UPDATE content_items SET data = ? WHERE id = ?", (json.dumps(data, ensure_ascii=False), barbaro_id))
            print("Clase Barbaro actualizada en content_items con 'Furia'.")
    else:
        print("No se encontro la clase Barbaro en content_items para renombrar 'Rabia'.")

    # 3. Extraer rasgos de las clases y sembrar en class_features
    cursor.execute("SELECT id, name, data FROM content_items WHERE type = 'class'")
    classes = cursor.fetchall()
    print(f"Leyendo {len(classes)} clases de content_items...")

    features_inserted = 0
    features_updated = 0

    for cls_id, cls_name, cls_data_str in classes:
        try:
            c_data = json.loads(cls_data_str)
        except Exception:
            c_data = {}

        traits = c_data.get('traits', [])
        if not traits:
            continue

        print(f"   Procesando {len(traits)} rasgos para la clase '{cls_name}'...")

        for t in traits:
            trait_name = t.get('name')
            desc = t.get('desc') or t.get('description') or ''
            short_desc = t.get('short_description') or ''
            level = int(t.get('level', 1))

            # Buscar si ya existe por nombre y clase
            cursor.execute(
                "SELECT id FROM class_features WHERE LOWER(class_name) = LOWER(?) AND LOWER(feature_name) = LOWER(?)",
                (cls_name, trait_name)
            )
            existing = cursor.fetchone()

            if existing:
                cursor.execute(
                    "UPDATE class_features SET class_name = ?, feature_name = ?, level_acquired = ?, description = ?, short_description = ? WHERE id = ?",
                    (cls_name, trait_name, level, desc, short_desc, existing[0])
                )
                features_updated += 1
            else:
                cursor.execute(
                    "INSERT INTO class_features (class_name, feature_name, level_acquired, description, short_description) VALUES (?, ?, ?, ?, ?)",
                    (cls_name, trait_name, level, desc, short_desc)
                )
                features_inserted += 1

    conn.commit()
    print(f"\nMIGRACION TERMINADA EXITOSAMENTE:")
    print(f"   Rasgos Insertados: {features_inserted}")
    print(f"   Rasgos Actualizados: {features_updated}")

except Exception as e:
    conn.rollback()
    print(f"Error en la migracion: {e}")
    exit(1)
finally:
    conn.close()
