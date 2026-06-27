import sqlite3
import json

db_path = 'vtt_database.bd'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

markdown_desc = """Este documento describe en detalle cada una de las acciones principales que cualquier personaje o criatura puede realizar durante su turno en el combate.

---

## 1. Atacar (Attack)
Es la acción más común en batalla. Permite realizar un ataque físico orientado a dañar a un objetivo.
*   **Ataque Cuerpo a Cuerpo:** Se realiza contra un objetivo dentro de tu alcance (normalmente 5 pies). Lanzas /1d20/ + Modificador de Fuerza + Bono de Competencia (si eres competente con el arma).
*   **Ataque a Distancia:** Se realiza contra un objetivo lejano usando armas de proyectiles o arrojadizas. Lanzas /1d20/ + Modificador de Destreza + Bono de Competencia.
    *   *Desventaja por Proximidad:* Si intentas un ataque a distancia mientras tienes a un enemigo consciente a 5 pies de ti, la tirada de ataque tiene **desventaja**.
*   **Ataque Extra:** Los rasgos de clase que otorgan ataques adicionales (como el del Guerrero o Bárbaro) se activan **únicamente** cuando eliges esta acción específica en tu turno.

---

## 2. Correr (Dash)
Utilizas tu acción para concentrarte pura y exclusivamente en moverte más rápido.
*   **Efecto:** Ganas movimiento adicional para el turno actual. La distancia extra que obtienes es **exactamente igual a tu Velocidad actual** después de aplicar cualquier modificador (como terreno difícil o penalizaciones).
*   *Ejemplo:* Si tu velocidad es de 30 pies, al usar Correr puedes moverte un total de 60 pies en ese turno.

---

## 3. Destrabar / Retirarse (Disengage)
Te enfocas en defenderte y vigilar las armas de tus enemigos mientras te reubicas en el campo de batalla.
*   **Efecto:** Al elegir esta acción, **tu movimiento no provoca ataques de oportunidad** por parte de ninguna criatura durante el resto de tu turno actual. Es la acción ideal para escapar de una situación peligrosa sin recibir daño gratis.

---

## 4. Esquivar (Dodge)
Te centras por completo en evitar los ataques del enemigo mediante fintas, bloqueos y reflejos.
*   **Efecto:** Hasta el **inicio de tu próximo turno**, se aplican los siguientes beneficios defensivos:
    *   Cualquier tirada de ataque realizada contra ti tiene **desventaja** (este efecto se pierde si no puedes ver al atacante, por ejemplo, si estás cegado).
    *   Obtienes **ventaja** en todas tus Tiradas de Salvación de **Destreza**.
*   *Inhabilitación:* No recibes los beneficios de Esquivar si quedas bajo el estado de *Incapacitado* o si tu velocidad se reduce a 0.

---

## 5. Esconderse (Hide)
Intentas desaparecer de la vista de tus enemigos aprovechando la cobertura o la oscuridad del entorno.
*   **Requisito:** No puedes esconderte de una criatura que te puede ver claramente. Necesitas tener Cobertura Total, estar en Oscuridad Total, o tener un rasgo que te permita ocultarte en Luz Tenue.
*   **Mecánica:** Realizas una prueba de **Destreza (Sigilo)**. El resultado total de tu tirada se convierte en la CD (Dificultad) que los enemigos deben superar con su Percepción (Pasiva o Activa) para descubrir dónde estás.
*   **Efecto:** Si tienes éxito, se te considera "Oculto". Obtienes ventaja en tu próximo ataque y los enemigos no saben tu posición exacta. El estado se pierde en el momento en que haces ruido, atacas o te expones a la vista del enemigo.

---

## 6. Preparar una Acción (Ready)
Decides esperar el momento idóneo para actuar, planificando una respuesta que se ejecutará fuera de tu turno.
*   **Paso 1 (El Disparador):** Debes declarar un evento externo perceptible que activará tu reacción. (Ej: *"Si el mago enemigo empieza a gesticular"*, *"Si el orco pasa por este pasillo"*).
*   **Paso 2 (La Acción):** Eliges qué acción física vas a realizar o qué movimiento harás (máximo igual a tu velocidad).
*   **Resolución:** Cuando el disparador ocurre, puedes usar tu **Reacción** justo después de que termine el evento disparador para ejecutar tu acción guardada. 
*   **Regla para Conjuros Preparados:** Si preparas un hechizo, debes lanzarlo en tu turno (gastando el espacio de conjuro normalmente) y **mantener la concentración** en él hasta que ocurra el disparador. Si sufres daño antes de que ocurra el disparador, puedes perder el hechizo.

---

## 7. Ayudar (Help)
Prestas tu apoyo a un compañero para asegurar el éxito de su próxima tarea. Puedes usarlo de dos maneras:
*   **Ayuda en Habilidad:** Describes cómo asistes a un aliado a realizar una tarea (ej: forzar una puerta). Tu aliado obtiene **ventaja** en la próxima prueba de característica que haga antes del inicio de tu próximo turno.
*   **Ayuda en Combate:** Distraes a un enemigo que se encuentre **a 5 pies o menos de ti**. El próximo aliado que ataque a ese enemigo específico antes de tu siguiente turno obtendrá **ventaja** en su primera tirada de ataque.

---

## 8. Usar un Objeto (Use an Object)
Normalmente, interactuar con un objeto (como abrir una puerta normal o desenvainar tu espada) es gratis si lo haces junto con tu movimiento. Esta acción se usa en dos casos:
*   Cuando quieres interactuar con un **segundo objeto** en el mismo turno.
*   Cuando el objeto en cuestión es complejo y sus reglas especifican que requiere una acción completa para ser utilizado (ej: activar una trampa, encender una linterna de aceite, buscar algo dentro de una mochila en mitad del combate).
"""

data_obj = {
    "name": "Módulo: Acciones Estándar en Combate",
    "desc": markdown_desc,
    "category": "1. El Turno de Combate (Acciones y Estructura)"
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

print("Módulo 'Acciones Estándar en Combate' insertado correctamente.")
