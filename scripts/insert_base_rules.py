import sqlite3
import json
import uuid

conn = sqlite3.connect('vtt_database.bd')
cur = conn.cursor()

rules = [
    {
        "name": "1. El Turno de Combate (Acciones y Estructura)",
        "desc": "## Iniciativa, Sorpresa y Orden de Turno\n\n\n## Movimiento en combate\n\n\n## Acciones en un turno\n\n\n## Reacciones y Acciones de Bonus\n\n"
    },
    {
        "name": "2. Reglas de Lanzamiento de Conjuros (Spellcasting)",
        "desc": "## Componentes (V, S, M)\n\n\n## Tiempos de lanzamiento y Duración\n\n\n## Concentración\n\n\n## Áreas de efecto\n\n"
    },
    {
        "name": "3. Condiciones del Estado (Conditions)",
        "desc": "## Cegado, Envenenado, Derribado, Agarrado, Incapacitado\n\n\n## Niveles de Agotamiento (Exhaustion)\n\n"
    },
    {
        "name": "4. Mecánicas del Entorno y Supervivencia",
        "desc": "## Cobertura (Media, Tres Cuartos, Total)\n\n\n## Luz y Visión (Visión en la oscuridad, Penumbra, Oscuridad total)\n\n\n## Caídas, Asfixia, Descansos (Corto y Largo)\n\n"
    },
    {
        "name": "5. Pruebas de Característica y Combate Avanzado",
        "desc": "## Ventaja y Desventaja\n\n\n## Tiradas de Salvación contra la Muerte (Death Saving Throws)\n\n\n## Golpes Críticos y Daño no letal\n\n"
    }
]

for rule in rules:
    data_json = json.dumps({"name": rule["name"], "desc": rule["desc"]}, ensure_ascii=False)
    cur.execute(
        "INSERT INTO content_items (type, name, data, source) VALUES (?, ?, ?, ?)",
        ('rule', rule["name"], data_json, 'custom')
    )

conn.commit()
print("Rules inserted successfully.")
conn.close()
