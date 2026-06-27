import sqlite3
import json

db_path = 'vtt_database.bd'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

markdown_desc = """Este documento detalla las reglas y cálculos matemáticos que rigen las formas de desplazamiento no estándar de los personajes, incluyendo el nado, la escalada y las mecánicas físicas para realizar saltos verticales y horizontales.

---

## 1. Escalar y Nadar (Climbing and Swimming)
Desplazarse verticalmente por una superficie o avanzar a través de un medio líquido requiere un esfuerzo físico mayor que caminar, lo que ralentiza el avance de las criaturas de forma automática.

*   **La Regla del Costo Adicional:** Cada pie o metro avanzado mientras se escala o se nada cuesta **1 pie o metro adicional** de movimiento. 
*   **En la Rejilla del VTT (Casillas de 5 pies):** Avanzar una casilla escalando o nadando consume **10 pies** de tu velocidad total disponible (funciona exactamente igual que el Terreno Difícil).
*   **Velocidades Especiales:** Si una criatura posee una *Velocidad de Escalada* (Climb Speed) o una *Velocidad de Nado* (Swim Speed) específica anotada en su ficha de personaje, ignora este costo adicional. Utiliza esa velocidad especial uno a uno de forma normal mientras realice dicho desplazamiento.
*   **Pruebas de Característica:** El movimiento estándar de escalada o nado no requiere dados si la superficie tiene agarres y el agua está calma. Sin embargo, ante superficies resbaladizas, paredes completamente verticales o corrientes de agua violentas, el Director de Juego exigirá una prueba de **Fuerza (Atletismo)** para evitar caer o ser arrastrado.

---

## 2. Saltar en Largo (Long Jump)
El salto en largo calcula la distancia horizontal en pies que un personaje puede cruzar por el aire. La distancia máxima depende directamente de la puntuación bruta del atributo de **Fuerza** del personaje.

### A. Salto en Largo con Carrera (Running Long Jump)
Ocurre cuando el personaje se desplaza activamente antes de realizar el despegue.
*   **Requisito:** El personaje debe moverse **al menos 10 pies (2 casillas)** a pie inmediatamente antes de ejecutar el salto.
*   **Distancia del Salto:** El personaje salta una distancia horizontal máxima en pies **igual a su puntuación de Fuerza** (el atributo neto, no el modificador. Ej: Fuerza 14 = 14 pies de salto).

### B. Salto en Largo sin Carrera / Estático (Standing Long Jump)
Ocurre cuando el personaje salta desde una posición completamente estática.
*   **Distancia del Salto:** El personaje salta únicamente **la mitad de la distancia** de un salto con carrera (Ej: Fuerza 14 = 7 pies de salto).

> ⚠️ **Regla de Oro del Movimiento:** Cada pie cruzado durante un salto **consume velocidad de tu turno**. Si un personaje tiene Fuerza 16 pero solo le quedan 10 pies de movimiento disponibles en ese turno, el salto se interrumpe a los 10 pies. El personaje no puede saltar más allá de su velocidad máxima por turno a menos que use la acción de *Correr*.

---

## 3. Saltar en Alto (High Jump)
El salto en alto calcula la distancia vertical en pies que un personaje puede elevarse en el aire desde el suelo. Este cálculo se divide en la altura que alcanzan sus pies y la altura máxima a la que puede llegar extendiendo las manos.

### A. Altura del Salto (Elevación de los Pies)
*   **Salto con Carrera:** Si el personaje se mueve al menos 10 pies inmediatamente antes del salto, la altura en pies que se eleva desde el suelo es igual a:
    Altura del Salto = 3 + Modificador de Fuerza
    *(Si el modificador es negativo o cero, la altura base es simplemente 3 pies).*
*   **Salto sin Carrera:** Si salta de forma estática, se eleva únicamente **la mitad** de esa distancia.

### B. Alcance Vertical Máximo (Alcanzar una Cornisa)
Durante un salto en alto, un personaje puede extender sus brazos por encima de su cabeza para aferrarse a una repisa, rama o borde alto.
*   **El Cálculo del Alcance:** El juego determina que un personaje puede alcanzar una altura máxima equivalente a **su propia estatura más 1.5 veces la altura de su salto**.

Alcance Vertical = Estatura del Personaje + (1.5 x Altura del Salto)

*   *Ejemplo Práctico:* Un guerrero mide 6 pies de alto y tiene Fuerza 16 (Modificador +3).
    1. Su altura de salto con carrera es: 3 + 3 = 6 pies de elevación del suelo.
    2. Su alcance vertical para agarrarse a una cornisa es: 6 (estatura) + (1.5 x 6) = 6 + 9 = 15 pies de altura total.

---

## 4. Obstáculos y Pruebas durante los Saltos
*   **Superar Obstáculos Bajos:** En un salto en largo, si hay un obstáculo intermedio de una altura menor o igual a un cuarto de la distancia del salto (como un muro bajo o un arbusto), el personaje lo supera automáticamente de forma limpia. Si el obstáculo es más alto, el DM requerirá una prueba de **Fuerza (Atletismo)** de CD 10 para no chocar contra él.
*   **Aterrizaje en Terreno Difícil:** Si un personaje cae de su salto sobre una casilla que se considera Terreno Difícil, debe superar una prueba de **Destreza (Acrobacias)** de CD 10 de forma obligatoria. Si falla la tirada, el personaje sufre el estado **Derribado (Prone)** inmediatamente en esa casilla.
"""

data_obj = {
    "name": "Módulo: Movimiento Avanzado y Especial",
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

print("Módulo 'Movimiento Avanzado y Especial' insertado correctamente en la fase 6.")
