import sqlite3
import json

db_path = 'vtt_database.bd'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

markdown_desc = """Este documento describe de forma oficial y detallada cómo se determina el orden de actuación de los personajes y criaturas al comienzo de un enfrentamiento.

---

## 1. La Prueba de Iniciativa
Al inicio del combate, cada participante realiza una prueba de característica para medir sus reflejos y tiempo de reacción. Esta tirada establece el orden de los turnos, el cual se mantiene fijo durante todo el encuentro.

*   **La Tirada Base:** Cada jugador y criatura lanza un dado de 20 caras (/1d20/) y le suma su **Modificador de Destreza**.
*   **Modificadores Especiales:** Al total de la tirada se le deben sumar o aplicar los bonificadores de rasgos de clase o dotes si el personaje los posee:
    *   **Dote Alerta (Alert):** Otorga un bonificador fijo de **+5** a la tirada de iniciativa.
    *   **Rasgos de Subclase:** Algunas habilidades permiten sumar otros modificadores de característica (como el bonificador de Inteligencia o Sabiduría) a la tirada.
    *   **Ventaja / Desventaja:** Ciertos efectos mágicos o rasgos de clase (como el nivel 7 del Bárbaro) otorgan ventaja, permitiendo lanzar dos dados /1d20/ y elegir el resultado más alto.

---

## 2. Organización del Orden de Turnos
Una vez que todos los participantes han realizado su tirada, el Director de Juego (DM) organiza a los personajes y monstruos en una lista ordenada de mayor a menor según el resultado total obtenido. 

*   El combate se desarrolla en un ciclo continuo. Cuando la criatura con el resultado más bajo termina su turno, la ronda finaliza y el orden vuelve a empezar de forma idéntica desde la criatura con el resultado más alto.

---

## 3. Resolución de Empates
Si dos o más participantes obtienen exactamente el mismo valor total en su tirada de iniciativa, el conflicto se resuelve aplicando las siguientes prioridades oficiales del juego:

### Caso A: Empate entre Monstruos / Criaturas del DM
Si dos o más criaturas controladas por el Director de Juego empatan en iniciativa, el DM decide de forma arbitraria cuál de ellas actúa primero.

### Caso B: Empate entre Monstruos y Personajes Jugadores
Si un monstruo empata con un personaje jugador, el Director de Juego tiene la autoridad para decidir quién tiene la prioridad y actúa primero en la ronda.

### Caso C: Empate entre Personajes Jugadores
Si dos o más personajes de los jugadores obtienen el mismo resultado, **los jugadores implicados deben decidir entre ellos** quién actuará primero. El orden elegido se mantendrá así por el resto del combate.

> ℹ️ **Nota de Uso Frecuente:** Si los jugadores o el DM prefieren no decidir manualmente, una regla opcional muy utilizada en las mesas consiste en otorgar la prioridad a la criatura que posea la **puntuación de atributo de Destreza más alta** (el número neto, no el modificador). Si las puntuaciones de Destreza también son idénticas, se recurre a un lanzamiento de dado de desempate (/1d20/).

---

## 4. Incorporación Tardía al Combate
Si una criatura o personaje se une a un combate que ya ha comenzado (por ejemplo, al entrar a la habitación en la segunda ronda):

1.  Debe lanzar su tirada de iniciativa inmediatamente en el momento de su entrada.
2.  El DM la introduce en la lista existente en la posición que le corresponda según su resultado.
3.  La criatura esperará a que el orden de turnos llegue a su posición para poder actuar. Si su número de iniciativa ya pasó en la ronda actual, deberá esperar a que comience la siguiente ronda para tener su primer turno.
"""

data_obj = {
    "name": "Módulo: Lanzando la Iniciativa",
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

print("Módulo 'Lanzando la Iniciativa' insertado correctamente.")
