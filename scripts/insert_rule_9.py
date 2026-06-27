import sqlite3
import json

db_path = 'vtt_database.bd'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

markdown_desc = """Este documento detalla cómo los niveles de iluminación ambiental y las condiciones del entorno alteran la capacidad visual de las criaturas, afectando directamente la percepción y la precisión de los ataques en combate.

---

## 1. Categorías de Iluminación Ambiental

El entorno de juego se divide en tres niveles de luz bien definidos. Cada uno interactúa de forma distinta con los sentidos de los personajes:

### A. Luz Brillante (Bright Light)
*   **Condición:** Entornos expuestos a la luz del sol, el radio interno de antorchas encendidas, linternas, o conjuros de iluminación potentes.
*   **Efecto Mecánico:** Visibilidad normal. No se aplican penalizaciones ni bonificadores a las pruebas de característica ni a los ataques.

### B. Luz Tenue / Penumbra (Dim Light)
*   **Condición:** El límite exterior entre la luz y la oscuridad, los momentos del crepúsculo (amanecer/atardecer), una noche con luna llena clara, o el radio secundario de una antorcha.
*   **Efecto Mecánico:** Un área de luz tenue se considera un entorno **Ligeramente Oculto (Lightly Obscured)**. Cualquier criatura que intente buscar o percibir algo dentro de esta zona tiene **Desventaja en todas las pruebas de Sabiduría (Percepción)** que dependan estrictamente de la vista.

### C. Oscuridad Total (Darkness)
*   **Condición:** El interior de mazmorras subterráneas sin iluminar, cuevas profundas, pasadizos sellados, o una noche cerrada sin luna.
*   **Efecto Mecánico:** Un área de oscuridad total se considera un entorno **Totalmente Oculto (Heavily Obscured)**. 
    *   Cualquier criatura que intente mirar dentro de esta zona sufre de forma efectiva los efectos de la condición **Cegado** al interactuar con elementos o criaturas ubicadas en la oscuridad.

---

## 2. Rasgos Especiales de Visión

Algunas criaturas poseen sentidos modificados biológica o mágicamente que alteran las reglas estándar de iluminación:

### Visión en la Oscuridad (Darkvision)
Es el rasgo más común en razas subterráneas o nocturnas (como Elfos, Enanos o Monstruos).
*   **En Luz Tenue:** La criatura percibe el entorno como si hubiera **Luz Brillante** (visión normal, elimina la desventaja en Percepción).
*   **En Oscuridad Total:** La criatura percibe el entorno como si hubiera **Luz Tenue** (mantiene la desventaja en pruebas de Percepción visual).
*   *Restricción Absoluta:* La visión en la oscuridad no permite distinguir colores en la oscuridad total; la criatura solo ve el mundo en una escala de tonos de gris. Su alcance está estrictamente limitado a los pies/metros indicados en la ficha del personaje (habitualmente 60 pies).

---

## 3. Impacto de la Ocultación en el Combate

Cuando una criatura ataca a un objetivo que no puede ver, o cuando intenta defenderse de un enemigo invisible, se aplican las siguientes reglas estrictas de combate a ciegas:

*   **Atacar a un Objetivo Inseparable/Oculto:** Si intentas golpear a una criatura que se encuentra en un área Totalmente Oculta (o bajo el estado *Invisible*), tu tirada de ataque tiene automáticamente **Desventaja**. (Primero debes adivinar o saber en qué casilla está el token).
*   **Atacante Oculto:** Si una criatura realiza un ataque desde una zona Totalmente Oculta (o siendo invisible) hacia un objetivo que no puede verla, la tirada de ataque del atacante obtiene automáticamente **Ventaja**. En el momento en que se resuelve el ataque, la posición del atacante se revela.
"""

data_obj = {
    "name": "Módulo: Luz, Visión y Ocultación",
    "desc": markdown_desc,
    "category": "4. Mecánicas del Entorno y Supervivencia"
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

print("Módulo 'Luz, Visión y Ocultación' insertado correctamente en la fase 4.")
