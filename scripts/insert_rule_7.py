import sqlite3
import json

db_path = 'vtt_database.bd'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

markdown_desc = """Este documento detalla los estados alterados que pueden sufrir los personajes y criaturas. Las condiciones alteran las capacidades de un objetivo de forma temporal y se acumulan si son de distinto tipo. Si una criatura sufre la misma condición por dos fuentes diferentes, los efectos no se duplican, sino que se aplica la duración más larga.

---

## 1. Glosario de Condiciones Estándar

### Cegado (Blinded)
*   Una criatura cegada no puede ver y falla automáticamente cualquier prueba de característica que requiera la vista.
*   Las tiradas de ataque contra la criatura tienen **ventaja**.
*   Las tiradas de ataque de la criatura tienen **desventaja**.

### Ensordecido (Deafened)
*   Una criatura ensordecida no puede oír y falla automáticamente cualquier prueba de característica que requiera el oído.

### Asustado (Frightened)
*   Una criatura asustada tiene **desventaja** en las pruebas de característica y tiradas de ataque mientras la fuente de su miedo esté dentro de su línea de visión.
*   La criatura no puede moverse voluntariamente hacia la fuente de su miedo.

### Envenenado (Poisoned)
*   Una criatura envenenada tiene **desventaja** en las tiradas de ataque y en las pruebas de característica.

### Derribado / Prone (Prone)
*   La única opción de movimiento de una criatura derribada es arrastrarse, a menos que se ponga de pie (lo que cuesta la mitad de su velocidad total).
*   La criatura tiene **desventaja** en sus tiradas de ataque.
*   Cualquier tirada de ataque contra la criatura tiene **ventaja** si el atacante está a **5 pies** o menos de ella. De lo contrario, la tirada de ataque tiene **desventaja**.

### Apresado / Agarrado (Grappled)
*   La velocidad de una criatura apresada pasa a ser **0** y no puede beneficiarse de ningún bonificador a su velocidad.
*   La condición termina si el apresador queda *Incapacitado* o si un efecto (como el conjuro *Onda de Choque*) empuja a la criatura apresada fuera del alcance del apresador.

### Apresado Firme / Restringido (Restrained)
*   La velocidad de una criatura restringida pasa a ser **0** y no puede beneficiarse de ningún bonificador a su velocidad.
*   Las tiradas de ataque contra la criatura tienen **ventaja**.
*   Las tiradas de ataque de la criatura tienen **desventaja**.
*   La criatura tiene **desventaja** en las tiradas de salvación de **Destreza**.

### Incapacitado (Incapacitated)
*   Una criatura incapacitada **no puede realizar acciones, acciones de bonus ni reacciones**.
*   *Nota:* Este estado suele ser la base de condiciones más severas (como *Aturdido* o *Inconsciente*). Sufrir este estado rompe la concentración de forma automática.

### Aturdido (Stunned)
*   Una criatura aturdida está **incapacitada**, no puede moverse y solo puede hablar de forma vacilante.
*   La criatura falla automáticamente las tiradas de salvación de **Fuerza** y **Destreza**.
*   Las tiradas de ataque contra la criatura tienen **ventaja**.

### Paralizado (Paralyzed)
*   Una criatura paralizada está **incapacitada** y no puede moverse ni hablar.
*   La criatura falla automáticamente las tiradas de salvación de **Fuerza** y **Destreza**.
*   Las tiradas de ataque contra la criatura tienen **ventaja**.
*   Cualquier ataque que golpee a la criatura es un **golpe crítico automático** si el atacante se encuentra a **5 pies** o menos de ella.

### Petrificado (Petrified)
*   Una criatura petrificada, junto con todo el equipo no mágico que vista o cargue, se transforma en una sustancia sólida e inerte (normalmente piedra). Su peso se multiplica por diez y deja de envejecer.
*   La criatura está **incapacitada**, no puede moverse ni hablar, y no es consciente de su entorno.
*   Las tiradas de ataque contra la criatura tienen **ventaja**.
*   La criatura falla automáticamente las tiradas de salvación de **Fuerza** y **Destreza**.
*   La criatura obtiene **resistencia** a todos los tipos de daño.
*   La criatura es inmune a los venenos y a la condición de *Envenenado* (los venenos que ya estuvieran en su sistema quedan suspendidos, no disueltos).

### Inconsciente (Unconscious)
*   Una criatura inconsciente está **incapacitada**, no puede moverse ni hablar, y no es consciente de su entorno.
*   La criatura cae al suelo inmediatamente (sufriendo también el estado *Derribado*).
*   La criatura falla automáticamente las tiradas de salvación de **Fuerza** y **Destreza**.
*   Las tiradas de ataque contra la criatura tienen **ventaja**.
*   Cualquier ataque que golpee a la criatura es un **golpe crítico automático** si el atacante se encuentra a **5 pies** o menos de ella.

---

## 2. Niveles de Agotamiento (Exhaustion)
Ciertos efectos mecánicos (como el hambre extrema, el frío polar, o habilidades de clase sobreexigidas) aplican niveles de agotamiento. Los efectos son **acumulativos**: sufrir un nivel superior activa todos los efectos de los niveles anteriores.

Nivel 1: Desventaja en todas las pruebas de característica (Skill Checks / Ability Checks).
Nivel 2: La velocidad del personaje se reduce a la mitad.
Nivel 3: Desventaja en todas las tiradas de ataque y tiradas de salvación.
Nivel 4: El máximo de puntos de golpe (Max HP) del personaje se reduce a la mitad.
Nivel 5: La velocidad del personaje se reduce a **0**.
Nivel 6: Muerte instantánea automática.

*   **Recuperación:** Terminar un **Descanso Largo** reduce el nivel de agotamiento de una criatura en **1**, siempre y cuando el personaje haya ingerido algo de comida y agua durante el descanso.
"""

data_obj = {
    "name": "Módulo: Condiciones de Estado (Conditions)",
    "desc": markdown_desc,
    "category": "3. Condiciones del Estado (Conditions)"
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

print("Módulo 'Condiciones de Estado' insertado correctamente en la fase 3.")
