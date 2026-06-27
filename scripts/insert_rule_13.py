import sqlite3
import json

db_path = 'vtt_database.bd'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

markdown_desc = """Este documento detalla las reglas que rigen los resultados extraordinarios en las tiradas de ataque y el procedimiento oficial para incapacitar a un enemigo sin acabar con su vida.

---

## 1. Golpes Críticos (Critical Hits)
Cuando un personaje o criatura realiza una tirada de ataque y el dado de 20 caras muestra un **20 Natural** (el número 20 impreso directamente en el dado), el ataque impacta de forma automática sin importar la Clase de Armadura (CA) del objetivo, y se convierte en un Golpe Crítico.

### Mecánica de Cálculo de Daño Crítico
Un golpe crítico representa un impacto en una zona vital que duplica la fuerza del ataque. El daño se calcula siguiendo este procedimiento estricto:

*   **Duplicar los Dados de Daño:** Lanzas **el doble de dados** de los que otorgaría el ataque de forma normal. Esto incluye el daño base del arma (ej: un mandoble pasa de /2d6/ a /4d6/) y cualquier dado adicional otorgado por conjuros, dotes o rasgos de clase aplicados al ataque (ej: el *Ataque Furtivo* del Pícaro o el *Castigo Divino* del Paladín).
*   **Modificadores Fijos:** Sumas tus modificadores fijos (modificador de característica, dotes o bonos mágicos +1/+2/+3) **una sola vez** al final de la tirada. Los modificadores estáticos nunca se duplican.

> ℹ️ **Fórmula Visual:**
> Daño Total = (Dados Normales x 2) + Modificadores Fijos

*   *Ejemplo:* Un Guerrero con Fuerza 16 (+3) ataca con una espada larga (/1d8/) y asesta un crítico. El jugador lanza /2d8/ y al resultado total le suma únicamente **+3**.

---

## 2. Declaración de Daño No Letal (Knocking a Creature Out)
En muchas ocasiones, los personajes jugadores necesitan interrogar, capturar o perdonar la vida a un oponente en lugar de asesinarlo en combate. El sistema permite declarar ataques para dejar inconsciente a un objetivo bajo condiciones muy específicas:

### Requisitos Obligatorios
Para que un enemigo quede inconsciente en lugar de morir al reducirse a 0 puntos de golpe, el ataque debe cumplir tres condiciones:

1.  **Tipo de Ataque:** Debe ser estrictamente un **Ataque Cuerpo a Cuerpo** (Melee Attack). Esto engloba armas cuerpo a cuerpo, golpes desarmados o ataques de conjuro cuerpo a cuerpo (como *Toque Estremecedor*).
2.  **Prohibición a Distancia:** Los ataques a distancia (arcos, ballestas, conjuros como *Proyectil Mágico* o *Descarga Sobrenatural*) **no pueden ser no letales**. La distancia impide medir la fuerza del impacto con la precisión necesaria.
3.  **Momento de la Declaración:** El atacante debe tomar la decisión en el **instante exacto en que inflige el daño** que reduce a la criatura a 0 puntos de golpe. No es necesario declararlo antes de lanzar el dado de ataque.

### Efecto Mecánico en el Objetivo
Cuando un impacto no letal reduce los puntos de golpe de una criatura a 0:

*   La criatura cae al suelo bajo la condición de **Inconsciente**.
*   La criatura se considera **Estabilizada** de forma automática e inmediata.
*   El objetivo no realiza tiradas de salvación contra la muerte ni corre el riesgo de desangrarse. Despertará de forma natural con **1 punto de golpe** tras transcurrir **/1d4/ horas**, a menos que reciba curación mágica o primeros auxilios antes.
"""

data_obj = {
    "name": "Módulo: Golpes Críticos y Daño No Letal",
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

print("Módulo 'Golpes Críticos y Daño No Letal' insertado correctamente en la fase 5.")
