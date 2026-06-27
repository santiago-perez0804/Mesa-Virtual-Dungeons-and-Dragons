import sqlite3
import json

db_path = 'vtt_database.bd'

conn = sqlite3.connect(db_path)
cur = conn.cursor()

# 1. Delete old empty base categories
print("Deleting old empty base rules...")
cur.execute("DELETE FROM content_items WHERE type = 'rule' AND name IN ('1. El Turno de Combate (Acciones y Estructura)', '2. Reglas de Lanzamiento de Conjuros (Spellcasting)', '3. Condiciones del Estado (Conditions)', '4. Mecánicas del Entorno y Supervivencia', '5. Pruebas de Característica y Combate Avanzado')")

# 2. Insert new rule with category in its data
print("Inserting new rule 'Módulo: Inicio del Encuentro y Sorpresa'...")

markdown_desc = """Este documento técnico describe el protocolo y las mecánicas que el sistema debe procesar al cambiar del Modo de Exploración al Modo de Combate. 

---

## 1. Protocolo de Secuencia Inicial
Cuando se desencadena un combate, el flujo del juego se detiene inmediatamente. El sistema debe ejecutar los siguientes pasos en estricto orden cronológico:

1. **Determinar Sorpresa:** Evaluar qué criaturas adquieren el estado temporal `Sorprendido`.
2. **Establecer Posiciones:** Registrar las coordenadas espaciales de los tokens en la rejilla de combate.
3. **Tirar Iniciativa:** Registrar las pruebas de iniciativa de todos los participantes para construir la lista de orden de turnos.
4. **Iniciar Ronda 1:** Activar el flujo de combate en orden descendente. Las criaturas bajo el estado `Sorprendido` aplican sus penalizaciones únicamente en esta ronda.

---

## 2. Mecánica de Determinación de Sorpresa
La sorpresa no constituye una fase temporal o una ronda exclusiva; es un **estado de penalización individual** que afecta la economía de acciones de criaturas específicas durante la Ronda 1.

### Evaluación de Alerta (Sigilo vs. Percepción Pasiva)
Si un bando intenta realizar una emboscada, el sistema calcula la sorpresa comparando la prueba de sigilo de los atacantes con los sentidos pasivos de los defensores:

* **Lanzamiento de Sigilo:** Las criaturas atacantes realizan una prueba de `Destreza (Sigilo)`.
* **Cálculo de Percepción Pasiva:** Las criaturas defensoras o desprevenidas utilizan su valor pasivo fijo, calculado mediante la siguiente fórmula:

/ Percepción Pasiva = 10 + Modificador de Sabiduría + Bonificador de Competencia (si aplica) /

### Modificadores de Entorno a la Percepción Pasiva
* **Ventaja en Percepción:** El sistema añade un modificador neto de **+5** al valor pasivo.
* **Desventaja en Percepción (Luz Tenue, Distracción):** El sistema resta un modificador neto de **-5** al valor pasivo.

### Criterio de Activación del Estado
> **Regla de Detección Absoluta:** Una criatura defensora se considera `Sorprendida` si, y solo si, su Percepción Pasiva es **menor** que el resultado de la prueba de Destreza (Sigilo) de **todas y cada una** de las criaturas enemigas atacantes. Si el defensor detecta al menos a un atacante, **no** sufre el estado de Sorprendido.

---

## 3. Restricciones del Estado "Sorprendido"
Las criaturas marcadas con el estado `Sorprendido` sufren las siguientes penalizaciones automáticas durante su primer turno de la Ronda 1:

* **Velocidad Cero:** Su velocidad efectiva es de **0** (pies/metros). No pueden gastar movimiento bajo ninguna circunstancia.
* **Bloqueo de Acciones:** No pueden ejecutar su **Acción Principal** (Action) ni su **Acción de Bonus** (Bonus Action). El turno se procesa de forma vacía.
* **Bloqueo de Reacciones:** La criatura **no puede usar Reacciones** (como ataques de oportunidad o conjuros de respuesta) desde el inicio del combate hasta el milisegundo exacto en que **su propio turno en el orden de iniciativa finalice**.

---

## 4. Línea de Tiempo de las Reacciones (Casos Críticos)
El estado `Sorprendido` expira de forma individual para cada criatura al término de su respectivo turno de iniciativa en la Ronda 1. Su resolución temporal en el backend debe seguir esta lógica:

* **Caso A (Atacante va antes):** Si un atacante tiene una iniciativa **mayor** que la criatura sorprendida, el objetivo **no puede** utilizar reacciones defensivas (ej: conjuro *Escudo* o la habilidad *Parada*) contra ese ataque.
* **Caso B (Atacante va después):** Si un atacante tiene una iniciativa **menor** que la criatura sorprendida, el objetivo **ya puede** utilizar sus reacciones de forma normal, puesto que su estado de sorpresa expiró formalmente al finalizar su propio turno vacío.
"""

# Convert formulas like $$ to text logic if needed, but I kept it readable and mapped the $$ to / / for large text in our markdown.

data_obj = {
    "name": "Módulo: Inicio del Encuentro y Sorpresa",
    "desc": markdown_desc,
    "category": "1. El Turno de Combate (Acciones y Estructura)"
}

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

print("Base rules cleaned and new module inserted!")
