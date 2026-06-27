import sqlite3
import json

db_path = 'vtt_database.bd'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

markdown_desc = """Este documento detalla el funcionamiento de la mecánica central de resolución de D&D 5e, la cual modifica las probabilidades de éxito de cualquier lanzamiento de dados central del juego.

---

## 1. La Regla de Lanzamiento
La ventaja y la desventaja representan circunstancias especiales que hacen que una acción sea significativamente más fácil o más difícil de realizar de lo normal debido a factores del entorno, rasgos del personaje o estados mágicos.

Cuando el sistema o el Director de Juego determinen que una tirada se realiza con ventaja o desventaja, el procedimiento es el siguiente:

*   **Con Ventaja (Advantage):** Lanzas **dos dados de 20 caras (/2d20/)** para la misma prueba y utilizas únicamente el **resultado más alto** de los dos dados.
*   **Con Desventaja (Disadvantage):** Lanzas **dos dados de 20 caras (/2d20/)** para la misma prueba y utilizas únicamente el **resultado más bajo** de los dos dados.
*   **Aplicación de Modificadores:** Una vez seleccionado el dado correspondiente (el mayor para ventaja o el menor para desventaja), le sumas o restas los modificadores normales de tu hoja de personaje de forma habitual (modificador de característica, bono de competencia, dotes, etc.).

---

## 2. Tipos de Tiradas Afectadas
La ventaja y la desventaja se aplican individualmente y solo afectan a los tres tipos principales de lanzamientos con /1d20/ del juego. Nunca se aplican a las tiradas de daño o de porcentaje:

1.  **Pruebas de Característica (Ability Checks / Skill Checks):** Como intentar forzar una cerradura con Destreza (Herramientas de ladrón) o recordar un dato con Inteligencia (Historia).
2.  **Tiradas de Salvación (Saving Throws):** Como resistir un veneno con una salvación de Constitución o esquivar una trampa con una salvación de Destreza.
3.  **Tiradas de Ataque (Attack Rolls):** Cualquier intento de golpear a un enemigo con un arma cuerpo a cuerpo, a distancia o mediante un conjuro místico.

---

## 3. Regla de Cancelación Absoluta (Anulación)
A lo largo de un turno, es muy común que un personaje acumule múltiples razones para tener ventaja y, al mismo tiempo, múltiples razones para tener desventaja sobre la misma tirada. El juego resuelve estos conflictos mediante una regla de cancelación estricta:

*   **La Regla:** Si una tirada se ve afectada por **al menos una fuente** de ventaja y, al mismo tiempo, por **al menos una fuente** de desventaja, ambas se cancelan entre sí de forma absoluta.
*   **El Resultado:** La tirada se realiza lanzando **un único dado de 20 caras (/1d20/)** de forma normal.
*   **No Acumulación:** La cantidad de fuentes no importa. Si tienes **tres motivos diferentes** que te otorgan ventaja (ej: estás oculto, tu aliado te ayuda y el enemigo está derribado) pero tienes **un solo motivo** que te otorga desventaja (ej: estás sufriendo un veneno), el resultado sigue siendo una **cancelación total**. Lanzas solo un dado (/1d20/). La ventaja nunca se acumula para tirar 3 o más dados, ni la desventaja tampoco.

---

## 4. Interacción con Valores Pasivos
Cuando una criatura tiene ventaja o desventaja en una prueba de característica que se calcula de forma pasiva (como la Percepción Pasiva o la Investigación Pasiva), no se lanzan dados. En su lugar, el valor pasivo fijo se altera matemáticamente de la siguiente manera:

*   Si la criatura tiene **Ventaja** en esa prueba visual o auditiva: Se añade un bonificador neto de **+5** al valor pasivo.
*   Si la criatura tiene **Desventaja** en esa prueba visual o auditiva: Se resta un detractor neto de **-5** al valor pasivo.
"""

data_obj = {
    "name": "Módulo: Ventaja y Desventaja",
    "desc": markdown_desc,
    "category": "5. Pruebas de Característica y Combate Avanzado"
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

print("Módulo 'Ventaja y Desventaja' insertado correctamente en la fase 5.")
