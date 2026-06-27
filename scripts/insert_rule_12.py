import sqlite3
import json

db_path = 'vtt_database.bd'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

markdown_desc = """Este documento detalla el procedimiento que rige el destino de un personaje cuando sus puntos de golpe se reducen a cero, estableciendo la delgada línea entre la inconsciencia, la estabilidad y la muerte definitiva.

---

## 1. La Caída a 0 Puntos de Golpe
Cuando el daño reduce los puntos de golpe de un personaje a exactamente 0, este cae inconsciente de forma inmediata, a menos que sufra una muerte instantánea por daño masivo.

### Regla de Muerte Instantánea por Daño Masivo
Si el daño sobrante de un impacto iguala o supera el **máximo total de puntos de golpe** del personaje, este muere en el acto sin derecho a realizar tiradas de salvación.
*   *Ejemplo:* Un mago tiene un máximo de 12 puntos de golpe. Actualmente le quedan 2 puntos de golpe debido a heridas previas. Si recibe un golpe que le inflige 15 puntos de daño, se reduce a 0 HP y le sobran 13 puntos de daño. Como 13 es mayor que su máximo de 12, el mago muere instantáneamente.

---

## 2. Mecánica de las Tiradas de Salvación contra la Muerte
Si el personaje sobrevive al impacto inicial pero permanece a 0 puntos de golpe, entra en un estado agónico. Al inicio de **cada uno de sus turnos** de combate, debe realizar una Tirada de Salvación contra la Muerte (/1d20/) pura para determinar si su condición mejora o empeora.

*   **Sin Modificadores:** Esta tirada no es una prueba de característica ni una salvación vinculada a un atributo físico. Es un lanzamiento de dado puro (/1d20/) donde **no se aplica ningún modificador de habilidad** (salvo rasgos de clase excepcionales, como el *Aura de Protección* del Paladín).
*   **El Marcador:** En la hoja de personaje se deben registrar tres éxitos o tres fallos. Estos marcadores se acumulan a lo largo de los turnos hasta que se cumpla una de las condiciones de resolución. Los marcadores se reinician por completo a cero únicamente cuando el personaje recupera al menos 1 punto de golpe o se estabiliza.

### Tabla de Resultados de la Tirada

Resultado Natural 20: El personaje recupera la conciencia de forma milagrosa y obtiene **1 punto de golpe** de inmediato. Puede actuar en ese mismo turno.
Resultado 10 a 19: **Éxito.** Se añade un marcador de éxito al registro del personaje.
Resultado 2 a 9: **Fallo.** Se añade un marcador de fallo al registro del personaje.
Resultado Natural 1: **Fallo Crítico.** Se añaden **dos marcadores de fallo** de forma simultánea al registro del personaje.

---

## 3. Condiciones de Resolución Absoluta

El destino del personaje se resuelve de forma definitiva en el instante exacto en que sus marcadores alcancen una de estas dos metas:

*   **Tres Éxitos Acumulados:** El personaje se **Estabiliza**. Deja de realizar tiradas de salvación contra la muerte al inicio de sus turnos, pero permanece inconsciente a 0 puntos de golpe. Si no recibe curación mágica o primeros auxilios antes, recuperará de forma natural 1 punto de golpe tras pasar **/1d4/ horas** descansando.
*   **Tres Fallos Acumulados:** El personaje **Muere** de forma definitiva en el acto. Su token debe marcarse como un cadáver en el entorno de juego.

---

## 4. Recibir Daño a 0 Puntos de Golpe
Si un personaje inconsciente a 0 puntos de golpe recibe cualquier tipo de daño antes de estabilizarse o curarse, el impacto acelera su camino hacia la muerte:

*   **Daño de un Ataque Normal:** Si una fuente externa le inflige daño, el personaje añade automáticamente **un marcador de fallo** a su registro.
*   **Daño de un Golpe Crítico:** Si el impacto se considera un golpe crítico, el personaje añade automáticamente **dos marcadores de fallo** a su registro.
*   ⚠️ **Ataques en Proximidad:** Cualquier ataque directo con arma realizado por un enemigo situado a **5 pies** o menos del personaje inconsciente se considera un **golpe crítico automático** si logra impactar, infligiendo por lo tanto dos fallos directos a la víctima.
*   **Daño Masivo estando a 0 HP:** Si el daño de un solo impacto iguala o supera el máximo total de puntos de golpe del personaje mientras este ya se encontraba a 0 HP, el personaje muere instantáneamente de todos modos.
"""

data_obj = {
    "name": "Módulo: Tiradas de Salvación contra la Muerte",
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

print("Módulo 'Tiradas de Salvación contra la Muerte' insertado correctamente en la fase 5.")
