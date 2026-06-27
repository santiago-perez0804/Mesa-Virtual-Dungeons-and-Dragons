import sqlite3
import json

db_path = 'vtt_database.bd'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

markdown_desc = """Este documento detalla los requisitos físicos, verbales y temporales obligatorios que todo lanzador de conjuros debe cumplir para manifestar magia en el juego.

---

## 1. Los Componentes de un Conjuro
Los componentes son las condiciones físicas que el personaje debe ejecutar en el mundo real para canalizar la energía mágica. Si una condición del entorno o un estado te impide cumplir con alguno de los componentes anotados en el hechizo, **el conjuro no puede ser lanzado**.

### A. Verbales (V)
Consiste en la pronunciación de palabras místicas, cánticos o entonaciones específicas de poder.
*   **Requisito:** El personaje debe ser capaz de hablar con voz clara y audible.
*   **Impedimentos:** Un personaje bajo el estado de *Silenciado*, que tenga una mordaza, o que se encuentre dentro del área del conjuro *Silencio* tiene **prohibido** lanzar cualquier hechizo que requiera componentes verbales.

### B. Somáticos (S)
Representa los gestos manuales precisos, movimientos de dedos o ademanes mágicos necesarios para moldear el hechizo.
*   **Requisito:** El lanzador debe tener **al menos una mano completamente libre** para realizar estos movimientos.
*   **Impedimentos:** Si el personaje tiene ambas manos ocupadas (por ejemplo, empuñando un arma y un escudo, o cargando un objeto pesado) o si se encuentra con las manos atadas bajo el estado de *Afectado por Ataduras*, no puede lanzar hechizos somáticos.

### C. Materiales (M)
Son los objetos, esencias o sustancias físicas particulares que el hechizo necesita para manifestarse (ej: una pizca de pólvora, un trozo de piel de foca).

*   **El Canalizador Mágico / Bolsa de Componentes:** Un personaje puede ignorar los materiales específicos del texto y usar en su lugar un *Canalizador* (como un bastón sintonizado, una varita, un símbolo sagrado) o una *Bolsa de Componentes*, **siempre y cuando el material original no tenga un coste en oro anotado**.
*   **Materiales con Coste:** Si el texto del conjuro especifica un valor en Monedas de Oro (po/gp) para el componente (Ej: *Un diamante que valga al menos 50 po*), el personaje **debe poseer ese objeto exacto en su inventario**. El canalizador mágico no puede suplantar componentes con valor monetario.
*   **Consumo de Materiales:** Por norma general, los materiales con coste no se gastan y se pueden reutilizar infinitamente. El componente **solo se consume si el texto lo dice explícitamente** (Ej: *El cual es consumido por el conjuro*). Si se consume, el objeto se borra del inventario tras el lanzamiento.

> ℹ️ **Regla de la Mano Libre (Somático + Material):** Si un conjuro requiere componentes **Somáticos y Materiales a la vez**, la misma mano que el personaje usa para sostener los materiales (o el canalizador mágico) puede ser utilizada para realizar los gestos somáticos.

---

## 2. La Economía de Hechizos en un Turno
Existe una confusión muy común cuando un jugador intenta exprimir sus recursos lanzando múltiples hechizos en sus 6 segundos de turno. El sistema aplica una restricción absoluta basada en los tiempos de lanzamiento:

### Hechizos con Tiempo de "1 Acción de Bonus"
Si decides lanzar cualquier conjuro utilizando tu **Acción de Bonus** (ya sea un hechizo de nivel alto como *Paso Brumoso* o un truco como *Porrazo*), la regla estricta de combinación mágica se activa inmediatamente:

*   **La Restricción:** No puedes usar tu *Acción Principal* del mismo turno para lanzar otro conjuro de nivel 1 o superior.
*   **La Única Excepción:** La única forma de lanzar magia con tu Acción Principal en ese mismo turno es que el hechizo elegido sea un **Truco (Cantrip)** con un tiempo de lanzamiento de 1 acción (Ej: *Descarga Sobrenatural* o *Salpicadura de Ácido*).

> ❌ **Ejemplo Prohibido:** Lanzar *Palabra de Sanación* (Hechizo de Nivel 1 como Acción de Bonus) y luego lanzar *Cura Heridas* (Hechizo de Nivel 1 como Acción Principal). **Esto es ilegal por reglas.**
>
> ️✔️ **Ejemplo Permitido:** Lanzar *Palabra de Sanación* (Hechizo de Nivel 1 como Acción de Bonus) y luego lanzar *Prueba de Fuego* (Truco de nivel 0 como Acción Principal). **Esto es completamente legal.**

---

## 3. Hechizos como Reacción
Los hechizos que tienen un tiempo de lanzamiento de **1 Reacción** se ejecutan instantáneamente en respuesta a un evento disparador externo.
*   Se pueden lanzar tanto en tu propio turno como en el turno de cualquier otra criatura.
*   **Independencia:** Lanzar un hechizo como reacción fuera de tu turno (como usar *Escudo* o *Contrahechizo*) **no se ve afectado** por la restricción de acciones de bonus mencionada en el punto anterior. Solo consume tu espacio de conjuro y tu única reacción de la ronda.
"""

data_obj = {
    "name": "Módulo: Reglas de Lanzamiento de Conjuros (Spellcasting)",
    "desc": markdown_desc,
    "category": "2. Reglas de Lanzamiento de Conjuros (Spellcasting)"
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

print("Módulo 'Reglas de Lanzamiento de Conjuros (Spellcasting)' insertado correctamente.")
