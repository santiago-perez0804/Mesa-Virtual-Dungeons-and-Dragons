import sqlite3
import json

db_path = 'vtt_database.bd'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

markdown_desc = """Este documento detalla las reglas específicas que rigen el uso de los dos recursos más dinámicos de la economía de turnos en combate: la Acción de Bonus y la Reacción.

---

## 1. La Acción de Bonus (Bonus Action)
La acción de bonus representa una actividad complementaria, un reflejo entrenado o un efecto mágico instantáneo que se realiza en conjunto con la acción principal.

### Condiciones de Uso
*   **No es un derecho universal:** Un personaje no puede simplemente inventar o decidir usar una acción de bonus en su turno. Solo se dispone de este recurso si un rasgo de clase, una dote, un objeto mágico o un conjuro otorga explícitamente una opción etiquetada como tal.
*   **Límite Estricto:** Solo se permite **una sola acción de bonus por turno**. Si un personaje tiene múltiples habilidades que requieren una acción de bonus, debe elegir cuál usar; bajo ninguna circunstancia se pueden acumular.
*   **Momento de Activación:** El jugador puede decidir en qué momento exacto de su turno introduce su acción de bonus: puede ser antes de su movimiento, después de su acción principal, o incluso entre medio de sus ataques si posee el rasgo de ataque extra.
*   **Pérdida del Recurso:** Si un efecto o condición te impide realizar acciones en tu turno (como estar *Incapacitado* o *Aturdido*), automáticamente pierdes también la capacidad de realizar acciones de bonus.

---

## 2. La Reacción (Reaction)
La reacción es una respuesta instantánea a un suceso o estímulo del entorno. Es el único recurso que rompe el orden estricto de la iniciativa, permitiendo actuar en el turno de otra criatura.

### El Disparador (Trigger)
Una reacción no se puede usar libremente; requiere obligatoriamente un **disparador válido**. El disparador es la condición del entorno que activa la habilidad (Ej: *"Cuando una criatura sale de tu alcance"* para un ataque de oportunidad, o *"Cuando recibes daño"* para ciertos conjuros).

### Frecuencia y Recarga
*   Dispones de **una sola reacción por ronda**.
*   Una vez que utilizas tu reacción, el recurso queda completamente agotado.
*   **Regla de Recarga:** Recuperas el uso de tu reacción al **inicio de tu propio turno** en la siguiente ronda. 

### Interrupción del Flujo Temporal
Cuando se activa una reacción, esta interrumpe el turno de la criatura activa de forma inmediata. La reacción se resuelve **en el instante exacto del disparador**, antes de que la criatura que causó el estímulo continúe con el resto de sus acciones o movimiento. Una vez resuelta la reacción, el turno de la criatura activa se reanuda con normalidad.

---

## 3. Casos Comunes de Reacciones en la Mesa

### A. Ataques de Oportunidad (Opportunity Attacks)
Es la reacción más frecuente en combate. Se activa cuando una criatura hostil que puedes ver **se mueve para salir de tu alcance cuerpo a cuerpo** (habitualmente 5 pies) sin haber utilizado la acción de *Destrabar / Retirarse*.
*   **Resolución:** Realizas un único ataque cuerpo a cuerpo contra esa criatura. El ataque se resuelve justo antes de que la criatura abandone el espacio adyacente a ti.

### B. Acciones Preparadas (Ready Action)
Si utilizaste tu acción principal en tu turno para *Preparar* una acción, la ejecución de la misma fuera de tu turno consumirá obligatoriamente tu Reacción cuando ocurra el disparador que elegiste.
*   Si el disparador ocurre y decides no actuar, o si el disparador nunca llega a cumplirse antes de tu siguiente turno, tu acción preparada se pierde y tu reacción se mantiene intacta.
"""

data_obj = {
    "name": "Módulo: Acciones de Bonus y Reacciones",
    "desc": markdown_desc,
    "category": "1. El Turno de Combate (Acciones y Estructura)"
}

cur.execute("DELETE FROM content_items WHERE name = ?", (data_obj["name"],))

cur.execute('''
    INSERT INTO content_items (name, type, data, source, translated)
    VALUES (?, ?, ?, ?, ?)
''', (
    data_obj["name"],
    'rule',
    json.dumps(data_obj),
    'phb',
    1
))

conn.commit()
conn.close()

print("Módulo 'Acciones de Bonus y Reacciones' insertado correctamente.")
