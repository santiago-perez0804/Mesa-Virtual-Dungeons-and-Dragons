import sqlite3
import json

db_path = 'vtt_database.bd'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

markdown_desc = """Este documento describe las mecánicas oficiales que permiten a los personajes pausar sus actividades para sanar heridas, mitigar el agotamiento físico y restablecer sus recursos de clase y espacios de conjuro.

---

## 1. El Descanso Corto (Short Rest)
Un descanso corto representa un periodo de tiempo de inactividad de **al menos 1 hora**, durante el cual los personajes no realizan actividades más exigentes que comer, beber, leer, charlar ligeramente o vendar sus heridas.

### Mecánica de Sanación: Uso de Dados de Golpe
Durante un descanso corto, un personaje puede decidir curar sus heridas utilizando su reserva acumulada de **Dados de Golpe (Hit Dice)**:

*   **El Lanzamiento:** El jugador elige cuántos Dados de Golpe de su reserva disponible desea gastar. Por cada dado gastado, lanza el dado correspondiente a su clase (ej: /1d6/ para un Mago, /1d10/ para un Paladín) y le suma su **Modificador de Constitución**.
*   **Recuperación:** El personaje recupera un total de puntos de golpe equivalente a la suma de los dados más el modificador.
*   **Uso Gradual:** Los dados se pueden lanzar de uno en uno. El jugador puede lanzar un dado, ver el resultado, y decidir en ese instante si gasta otro dado adicional o si se detiene ahí.
*   **Recuperación de Habilidades:** Al finalizar el descanso corto, ciertas clases recuperan automáticamente habilidades específicas anotadas en su ficha (ej: la *Recuperación Arcana* del Mago o el *Canalizar Divinidad* del Clérigo).

---

## 2. El Descanso Largo (Long Rest)
Un descanso largo es una pausa prolongada de **al menos 8 horas**. Para que el descanso sea válido y otorgue sus beneficios, debe cumplir estrictamente con las siguientes pautas de actividad:

*   **Estructura del Tiempo:** El personaje debe pasar un mínimo de **6 horas durmiendo o descansando en su jergón**. Las 2 horas restantes pueden emplearse en actividades ligeras que no requieran esfuerzo físico (como hacer guardia, conversar, leer o lanzar trucos simples).
*   **Regla de Interrupción:** Si el descanso se ve interrumpido por un periodo de actividad extenuante que dure **más de 1 hora en total** (como entablar un combate, caminar largas distancias, realizar persecuciones o lanzar conjuros de nivel 1 o superior), el descanso largo se rompe por completo. Los personajes no obtienen ningún beneficio y deben iniciar las 8 horas de descanso desde cero.
*   **Frecuencia Máxima:** Una criatura no puede beneficiarse de más de un descanso largo dentro de un mismo periodo de 24 horas en el mundo del juego.

---

## 3. Beneficios Automáticos al Finalizar un Descanso Largo

Si el personaje logra completar las 8 horas de descanso de forma exitosa, el sistema restablece sus estadísticas aplicando los siguientes cambios de forma inmediata:

1.  **Restablecimiento de Vida:** El personaje recupera **todos sus Puntos de Golpe (HP)** actuales hasta alcanzar su máximo total de forma automática.
2.  **Restablecimiento de Magia:** Se recuperan **todos los Espacios de Conjuro (Spell Slots)** gastados y se reinician las habilidades de clase que requieran este tipo de descanso.
3.  **Recuperación Parcial de Dados de Golpe:** El personaje recupera una cantidad de Dados de Golpe equivalente a la **mitad de su nivel total de personaje** (mínimo de 1 dado). 
    *   *Ejemplo:* Un personaje de nivel 5 que usó todos sus dados recupera 2 dados de golpe al despertar. Un personaje de nivel 6 recupera 3 dados de golpe.
4.  **Mitigación de Agotamiento:** Si el personaje sufría de niveles de *Agotamiento*, el descanso largo **reduce el agotamiento en 1 nivel**, siempre y cuando el personaje haya tenido acceso a una ración normal de comida y agua durante el descanso.
"""

data_obj = {
    "name": "Módulo: Descansos y Recuperación (Resting)",
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

print("Módulo 'Descansos y Recuperación (Resting)' insertado correctamente en la fase 4.")
