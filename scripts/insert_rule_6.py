import sqlite3
import json

db_path = 'vtt_database.bd'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

markdown_desc = """Este documento detalla las reglas fundamentales para gestionar la duración de los hechizos sostenidos en el tiempo y las matemáticas espaciales de las formas geométricas mágicas.

---

## 1. La Regla de Concentración (Concentration)
Ciertos conjuros requieren que el lanzador mantenga un esfuerzo mental constante para sostener la estructura de la magia activa. Si la concentración se interrumpe, el conjuro finaliza de inmediato de forma abrupta.

### Acciones y Estados que Rompen la Concentración
La concentración se pierde de forma automática, sin derecho a tirada, ante cualquiera de las siguientes situaciones:

1.  **Lanzar otro conjuro que requiera concentración:** Un personaje **solo puede concentrarse en un único hechizo a la vez**. En el instante exacto en que comienzas a lanzar un nuevo conjuro que requiera concentración, el anterior expira inmediatamente.
2.  **Sufrir el estado Incapacitado o Morir:** Si el personaje cae inconsciente, muere, o sufre un efecto que le otorgue la condición de *Incapacitado*, *Aturdido* o *Petrificado*, su concentración se destruye al acto.
3.  **Factores ambientales extremos:** Fenómenos naturales violentos (como el oleaje de una tormenta o una lluvia de granizo masiva) pueden obligar al jugador a realizar una tirada de concentración con una CD fija de 10 a discreción del Director de Juego.

### Sufrir Daño durante la Concentración
Cada vez que un personaje concentrado recibe daño de cualquier origen (un ataque físico, un conjuro enemigo, una trampa o una caída), debe realizar inmediatamente una **Tirada de Salvación de Constitución**.

*   **Fórmula de la Dificultad (CD):** La CD para mantener la concentración es dinámica y se calcula según el impacto recibido:
    CD de la Salvación = el número mayor entre 10 ó la mitad del daño recibido (Daño / 2)

*   *Ejemplo de Daño Bajo:* Si sufres **14 puntos de daño**, la mitad es 7. Como 10 es el valor mínimo estándar, la CD de tu salvación es **10**.
*   *Ejemplo de Daño Alto:* Si sufres **36 puntos de daño**, la mitad es 18. Como 18 supera a 10, la CD de tu salvación pasa a ser **18**.

> ⚠️ **Regla de Impactos Múltiples:** Si un personaje recibe daño de múltiples fuentes o ataques separados en una misma ronda (por ejemplo, dos flechas de un enemigo con ataque múltiple), debe realizar **una tirada de salvación independiente por cada impacto de daño individual**. Fallar una sola de las tiradas extingue el hechizo.

---

## 2. Geometría de las Áreas de Efecto
Los conjuros que afectan a un espacio del mapa se expanden siguiendo formas geométricas precisas. El origen de cada área siempre es un **Punto de Origen**, el cual suele ser una intersección de las líneas de la cuadrícula o una coordenada exacta en el mapa.

### A. Cono (Cone)
*   **Estructura:** Se extiende en una dirección elegida por el lanzador desde el punto de origen.
*   **Mecánica:** La longitud del cono define su alcance máximo. El ancho de la base del cono en su extremo final es exactamente **igual a su longitud**. 

### B. Cubo (Cube)
*   **Estructura:** El lanzador selecciona el punto de origen en cualquier lugar de una de las caras del cubo.
*   **Mecánica:** El tamaño del cubo describe la longitud de cada una de sus aristas. El área se proyecta desde el punto de origen extendiéndose en la dirección elegida.

### C. Cilindro (Cylinder)
*   **Estructura:** Se compone de una base circular horizontal y una altura vertical.
*   **Mecánica:** El punto de origen es el centro del círculo (ya sea en la base del suelo o en el techo). El conjuro especifica el **Radio** del círculo y la **Altura** del cilindro.

### D. Esfera (Sphere)
*   **Estructura:** Una bola tridimensional que se expande simétricamente en todas las direcciones.
*   **Mecánica:** El punto de origen es el centro exacto de la esfera. El área se mide puramente por su **Radio**. Cualquier criatura o coordenada que entre en la distancia del radio se ve afectada.

### E. Línea (Line)
*   **Estructura:** Un haz recto que avanza desde su punto de origen.
*   **Mecánica:** El conjuro define su **Longitud** y su **Ancho** (el cual suele ser habitualmente de 5 pies / 1 casilla para abarcar una hilera exacta en la rejilla).
"""

data_obj = {
    "name": "Módulo: Concentración y Áreas de Efecto",
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

print("Módulo 'Concentración y Áreas de Efecto' insertado correctamente.")
