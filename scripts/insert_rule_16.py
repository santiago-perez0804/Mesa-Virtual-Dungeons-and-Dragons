import sqlite3
import json

db_path = 'vtt_database.bd'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

markdown_desc = """Este documento detalla las reglas de posicionamiento y ocupación espacial de los tokens en el mapa de combate, regulando cómo las criaturas interactúan físicamente según sus dimensiones y cuándo está permitido atravesar el espacio de otros participantes.

---

## 1. Moverse Entre Criaturas
La casilla que ocupa una criatura en la rejilla de combate no representa un espacio impenetrable, sino el área que controla activamente en batalla. Por lo tanto, es posible atravesar el espacio de otra criatura bajo condiciones muy específicas:

### A. Atraversar el Espacio de un Aliado
*   **Regla:** Puedes moverte a través del espacio ocupado por una criatura voluntaria o aliada sin importar su tamaño.
*   **Costo de Movimiento:** El espacio de cualquier otra criatura se considera **Terreno Difícil** de forma automática. Atravesar la casilla de un aliado cuesta el doble de movimiento (10 pies por casilla en lugar de 5).

### B. Atravesar el Espacio de un Enemigo
Por norma general, no puedes cruzar voluntariamente la casilla de una criatura hostil. La única excepción se basa en una disparidad drástica de contextura física:
*   **La Regla de los Dos Tamaños:** Puedes moverte a través del espacio de un enemigo únicamente si este es **al menos dos categorías de tamaño más grande o más pequeño** que tu personaje (Ej: un personaje Mediano puede cruzar la casilla de un monstruo Enorme, o de una criatura Menuda).
*   **Costo de Movimiento:** Al igual que con los aliados, el espacio del enemigo se considera **Terreno Difícil** (costo doble de movimiento).
*   **Provocación de Ataques:** Moverse a través del alcance de un enemigo para cruzar su casilla sigue provocando *Ataques de Oportunidad* de forma normal si sales de su rango de amenaza.

### C. Prohibición de Finalización de Turno
*   **Regla Absoluta:** Un personaje o criatura **nunca puede finalizar su movimiento dentro de la casilla de otra criatura**, independientemente de si es aliada, enemiga, o de si la diferencia de tamaño es abismal. Si te quedas sin movimiento mientras estás cruzando el espacio de otra criatura, el sistema debe forzar tu posición hacia la última casilla vacía válida por la que pasaste.

---

## 2. Categorías de Tamaño y Espacio (Grid Matrix)
Cada criatura pertenece a una categoría de tamaño oficial. En la rejilla de combate del VTT (donde cada casilla cuadrada estándar representa un espacio de 5 por 5 pies), el tamaño determina el área de control del token en el mapa y su radio de interacción en combate.

### Dimensiones y Ocupación
Menudo (Tiny): 2.5 x 2.5 pies | 1/4 de casilla (4 por casilla) | Duendecillos, Gatos, Ratas, Diablillos.
Pequeño (Small): 5 x 5 pies | 1 x 1 casilla | Medianos (Halflings), Gnomos, Goblins.
Mediano (Medium): 5 x 5 pies | 1 x 1 casilla | Humanos, Elfos, Enanos, Orcos, Esqueletos.
Grande (Large): 10 x 10 pies | 2 x 2 casillas | Ogros, Centauros, Caballos, Osos Lechuza.
Enorme (Huge): 15 x 15 pies | 3 x 3 casillas | Gigantes, Dragones Adultos, Treants.
Colosal (Gargantuan): 20 x 20 pies o más | 4 x 4 casillas o más | Dragones Ancianos, El Kraken, Tarrasque.

---

## 3. Reglas Especiales de Ocupación para Criaturas Menudas (Tiny)
Las criaturas de tamaño Menudo operan bajo una lógica física distinta debido a sus dimensiones reducidas:
*   **Ocupación Múltiple:** Hasta cuatro criaturas Menudas pueden finalizar su turno y coexistir de forma simultánea dentro de una misma casilla estándar de 5 x 5 pies.
*   **Rango de Ataque Cuerpo a Cuerpo:** A diferencia de las criaturas Pequeñas o Medianas (que tienen un alcance base de 5 pies y pueden atacar a objetivos en casillas adyacentes), las criaturas Menudas tienen un alcance de **0 pies**. Esto significa que para realizar un ataque cuerpo a cuerpo, una criatura Menuda **debe entrar obligatoriamente a la casilla de su objetivo** para atacarlo desde adentro de su propio espacio.
"""

data_obj = {
    "name": "Módulo: Interacción Espacial en la Rejilla",
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

print("Módulo 'Interacción Espacial en la Rejilla' insertado correctamente en la fase 6.")
