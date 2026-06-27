import sqlite3
import json

db_path = 'vtt_database.bd'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

markdown_desc = """Este documento detalla las reglas fundamentales que rigen el desplazamiento de las criaturas en la rejilla de combate y los factores del terreno o posturas físicas que alteran su velocidad.

---

## 1. La Economía del Movimiento
El movimiento en D&D 5e no se considera una "Acción" independiente, sino un **recurso medible** del que dispone toda criatura durante su turno.

### Fragmentación del Movimiento
Un personaje puede dividir su movimiento libremente a lo largo de su turno, intercalando partes de su velocidad entre otras actividades:
*   **Regla de División:** Puedes moverte una parte de tu velocidad, realizar tu Acción Principal (como Atacar), continuar moviéndote, realizar una Acción de Bonus (si dispones de una), y gastar el resto de tu velocidad si aún te quedan pies o metros disponibles.
*   **Ataques Múltiples:** Si posees el rasgo de *Ataque Extra*, puedes incluso moverte entre cada uno de los ataques individuales que componen tu acción de Atacar.

---

## 2. Modificadores del Terreno: Terreno Difícil (Difficult Terrain)
El combate rara vez ocurre en superficies perfectamente lisas y despejadas. Los campos de batalla suelen presentar obstáculos menores como escombros, vegetación densa, agua profunda o hielo.

*   **La Regla del Costo Doble:** Moverse a través de terreno difícil cuesta el doble de lo normal. Por cada 1 pie o metro avanzado, el personaje debe gastar **2 pies o metros** de su velocidad total disponible.
*   **En la Rejilla del VTT (Casillas de 5 pies):** Moverse a una casilla normal cuesta 5 pies de movimiento. Moverse a una casilla que contenga Terreno Difícil cuesta **10 pies** de tu velocidad total.
*   **Efectos Acumulativos del Entorno:** Si un espacio presenta múltiples fuentes de terreno difícil (por ejemplo, una zona con maleza espesa que además está inundada), el costo **no se cuadruplica**. Sigue siendo terreno difícil y el costo se mantiene en el doble (2 x 1).

---

## 3. Modificadores de Postura: Cuerpo a Tierra (Prone)
La postura *Cuerpo a Tierra* representa a un personaje que se encuentra tumbado, arrojado en el suelo o agachado de forma extrema. Modifica el movimiento de las siguientes maneras:

### A. Caer Cuerpo a Tierra
*   Un personaje puede dejarse caer al suelo de forma voluntaria en su turno **completamente gratis**. No consume ninguna parte de su velocidad ni requiere una acción.
*   Si un efecto externo o un ataque derriba a un personaje (como la condición *Derribado*), este cae al suelo de forma inmediata fuera de su control.

### B. Desplazamiento en el Suelo (Arrastrarse)
Mientras un personaje se encuentra Cuerpo a Tierra, la única forma de movimiento terrestre que puede realizar es **arrastrarse**.
*   **Penalización:** Arrastrarse cuesta el doble de movimiento (1 pie avanzado = 2 pies de velocidad gastados).
*   **Combinación con Terreno Difícil:** Si un personaje Cuerpo a Tierra se arrastra a través de un espacio que *además* es Terreno Difícil, los costes se acumulan de forma multiplicativa. Arrastrarse por terreno difícil cuesta **el cuádruple de lo normal** (1 pie avanzado = 4 pies de velocidad gastados; es decir, **20 pies** de movimiento por cada casilla de la rejilla).

### C. Ponerse de Pie
Para abandonar la postura Cuerpo a Tierra y recuperar la posición erguida, el personaje debe realizar un esfuerzo físico que consume sus recursos de movimiento:
*   **El Costo Fijo:** Ponerse de pie requiere gastar exactamente **la mitad de tu velocidad total base** anotada en tu ficha de personaje, independientemente de cuánta velocidad te quede disponible en ese turno.
*   **Impedimento por Velocidad Cero:** Si la velocidad actual de un personaje se ha reducido a 0 debido a un estado alterado (como estar bajo los efectos de la condición *Apresado* o *Restringido*), el personaje **no puede ponerse de pie** bajo ninguna circunstancia hasta que recupere una velocidad mayor a cero.

> ℹ️ **Ejemplo de Turno:** Un personaje con velocidad base de 30 pies comienza su turno derribado en el suelo. 
> 1. Decide ponerse de pie: El sistema le resta automáticamente la mitad de su velocidad total (15 pies). Le quedan 15 pies libres.
> 2. Se mueve 1 casilla normal (gasta 5 pies, le quedan 10).
> 3. Entra en una casilla de Terreno Difícil (gasta 10 pies, le quedan 0). El turno de movimiento finaliza de forma exacta.
"""

data_obj = {
    "name": "Módulo: Movimiento Estándar y Modificadores",
    "desc": markdown_desc,
    "category": "6. Movimiento y Posicionamiento"
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

print("Módulo 'Movimiento Estándar y Modificadores' insertado correctamente en la fase 6.")
