import sqlite3
import json

db_path = 'vtt_database.bd'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

markdown_desc = """Los obstáculos físicos del entorno (como paredes, árboles, rocas, o incluso otras criaturas) protegen a los objetivos contra ataques a distancia, ataques cuerpo a cuerpo y ciertos efectos mágicos de área. 

---

## 1. Reglas Generales de la Cobertura
Para que una criatura se beneficie de la cobertura, se deben cumplir las siguientes condiciones universales en la mesa:

*   **Línea de Visión:** El obstáculo debe interponerse directamente en la línea recta que une el origen del ataque (o el punto de origen de un conjuro) y el cuerpo del objetivo.
*   **Origen del Beneficio:** La cobertura la otorga el entorno. Si un personaje se encuentra completamente al descubierto en un pasillo plano, no tiene cobertura, independientemente de su postura.
*   **Acumulación:** Los beneficios de la cobertura no se suman entre sí. Si un objetivo tiene una obstrucción que le da Media Cobertura (+2) y otra detrás que le da Tres Cuartos (+5), **solo se aplica el beneficio de la cobertura más alta** (+5); no se suman para dar +7.

---

## 2. Tipos de Cobertura y sus Efectos Mecánicos

### A. Media Cobertura (Half Cover)
Una criatura tiene media cobertura cuando un obstáculo bloquea **al menos la mitad** de su cuerpo.

*   **Efecto Mecánico:** El objetivo obtiene un bonificador fijo de **+2** a su **Clase de Armadura (CA)** y un bonificador de **+2** a sus **Tiradas de Salvación de Destreza**.
*   **Elementos Comunes:** Un muro bajo de piedra, un mueble del mobiliario (como una mesa volteada), el tronco de un árbol delgado, una valla de madera, o **cualquier otra criatura** (ya sea un aliado o un enemigo) que esté interpuesta en la trayectoria del ataque.

### B. Cobertura de Tres Cuartos (Three-Quarters Cover)
Una criatura tiene cobertura de tres cuartos cuando un obstáculo bloquea **al menos tres cuartas partes (75%)** de su cuerpo.

*   **Efecto Mecánico:** El objetivo obtiene un bonificador fijo de **+5** a su **Clase de Armadura (CA)** y un bonificador de **+5** a sus **Tiradas de Salvación de Destreza**.
*   **Elementos Comunes:** Una saetera (rendija estrecha en un muro fortificado), un rastrillo de hierro entornado, un árbol muy grueso que oculta casi todo el perfil del personaje, o el brocal de un pozo profundo desde donde el personaje asoma solo la cabeza.

### C. Cobertura Total (Total Cover)
Una criatura tiene cobertura total cuando está **completamente oculta** por un obstáculo del entorno.

*   **Efecto Mecánico:** El objetivo **no puede ser el blanco directo** de ningún ataque físico ni de ningún conjuro que requiera seleccionar a una criatura como objetivo. Su Clase de Armadura se vuelve irrelevante para ataques directos porque el atacante simplemente no tiene línea de efecto hacia él.
*   **Interacción con Áreas de Efecto:** Si un conjuro que explota en área (como *Bola de Fuego*) alcanza la zona, una criatura bajo Cobertura Total no recibe daño **siempre y cuando el obstáculo bloquee por completo la propagación de la energía** desde el centro de la explosión hasta la posición del objetivo. Si el fuego puede "rodear" el obstáculo a través de un pasillo abierto, el objetivo sí recibe el daño (y no tiene el bono de salvación porque la cobertura total bloquea la línea recta, no la expansión ambiental).
"""

data_obj = {
    "name": "Módulo: Reglas de Cobertura (Cover)",
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

print("Módulo 'Reglas de Cobertura (Cover)' insertado correctamente en la fase 4.")
