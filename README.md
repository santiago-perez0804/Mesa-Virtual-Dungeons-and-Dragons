# Mesa Virtual de D&D

Una plataforma de mesa virtual (VTT) de alto rendimiento optimizada para jugar Dungeons & Dragons 5e de forma fluida y envolvente. Combina la fidelidad visual de un cliente de escritorio con la potencia de la automatización en tiempo real para gestionar combates, fichas de personajes y recursos. Ofrece herramientas inteligentes integradas y soporte multijugador interactivo para que los jugadores y el Dungeon Master se concentren únicamente en la narrativa.

## Características Principales

* **Tablero Interactivo**: Movimiento y posicionamiento de tokens en tiempo real con sistema de cuadrícula a escala y visualización táctica para combates dinámicos.
* **Iniciativa Automatizada**: Sistema de turnos integrado que rastrea el orden de combate, el turno activo de los jugadores y monstruos, y gestiona el flujo de la partida.
* **Gestión de Inventario y Carga**: Control avanzado del inventario de personajes, cálculo automático del peso de carga y gestión de la sintonización (*attunement*) de objetos mágicos.
* **Cálculo de Áreas de Efecto (AoE)**: Regla de marcado espacial que calcula de forma dinámica las plantillas de área (conos, esferas, líneas y cubos) directamente sobre la cuadrícula del mapa.
* **Chat y Lanzador de Dados**: Chat multijugador con motor de lanzamiento de dados físico en 3D que acepta fórmulas complejas y modificadores manuales (ej: `/roll 1d20+5`).
* **Asistente AI DM**: Integración con inteligencia artificial para la generación y asistencia al Dungeon Master en la toma de decisiones y ambientación en tiempo real.
* **Próximamente**: Sistema automatizado para el control de Concentración en hechizos y mecánicas de reducción de puntos de golpe máximos (HP Máximo).

## Tecnologías

El proyecto está construido bajo una arquitectura moderna de alto rendimiento que integra:

* **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) para interfaces reactivas y fuertemente tipadas.
* **Entorno de Escritorio**: [Electron 41](https://www.electronjs.org/) para distribución como aplicación nativa de escritorio.
* **Empaquetador y Build**: [Vite 8](https://vite.dev/) para HMR ultra rápido en desarrollo y empaquetado optimizado.
* **Base de Datos Local**: [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3) para persistencia local ultrarrápida del compendio, personajes y estados.
* **Comunicación en Tiempo Real**: [Socket.io](https://socket.io/) para la sincronización multiusuario inmediata de movimientos de tokens, iniciativas y chat.
* **Servidor**: [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/) para servir la API de backend, autenticación y gestión de archivos.
* **Gráficos y Físicas 3D**: [Three.js](https://threejs.org/) para la renderización y físicas tridimensionales de los dados interactivos.
* **Servicios de Almacenamiento**: AWS S3 SDK para carga y distribución eficiente de assets multimedia y mapas de campaña.
* **Servicios de Inteligencia Artificial**: SDK de Google GenAI para las funcionalidades avanzadas del DM asistente.

## Instalación y Configuración Local

Sigue estos pasos para clonar el repositorio, configurar el entorno y ejecutar la aplicación localmente:

### 1. Clonar el repositorio
```bash
git clone https://github.com/santiago-perez0804/DND-COSO.git
cd DND-COSO
```

### 2. Instalar dependencias
Instala los paquetes de Node.js necesarios para el frontend, el backend y el entorno de Electron:
```bash
npm install
```

### 3. Compilar bindings nativos de SQLite
Dado que la aplicación utiliza `better-sqlite3` para persistencia nativa, es necesario compilar los módulos binarios para que coincidan con la versión de Node de Electron:
```bash
npm run postinstall
```

### 4. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto para configurar las credenciales y configuraciones de servicios externos (como AWS S3 o claves de Google GenAI):
```env
PORT=5173
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=tu_bucket_s3
GEMINI_API_KEY=tu_gemini_api_key
```

### 5. Iniciar en modo desarrollo
Ejecuta el comando principal de desarrollo. Este comando levantará de forma concurrente el servidor local de Vite para el frontend y el cliente de escritorio en Electron:
```bash
npm run dev
```

## Flujo de Trabajo del Equipo

Para mantener la integridad del código y un historial de Git limpio y comprensible, seguimos las siguientes directrices:

* **Protección de la Rama Principal**: Queda estrictamente prohibido realizar commits o empujar cambios directamente a la rama `main` o `master`.
* **Uso de Ramas**: Todo cambio, nueva funcionalidad o corrección de error debe desarrollarse en su propia rama dedicada partiendo de `main` o de la rama de integración correspondiente:
  * Funcionalidades nuevas: `feature/nombre-de-la-mejora` o `feat/nombre-de-la-mejora`
  * Corrección de errores: `bugfix/nombre-del-error` o `fix/nombre-del-error`
  * Refactorizaciones: `refactor/nombre-de-la-mejora`
* **Mensajes de Commit Semánticos**: Los mensajes de commit deben describir claramente la intención del cambio y estructurarse utilizando prefijos estándar:
  * `feat:` para nuevas características (ej: `feat: agregar regla de medicion de AoE en el tablero`).
  * `fix:` para corrección de bugs (ej: `fix: resolver calculo incorrecto de carga en inventario`).
  * `refactor:` para cambios de código que no corrigen bugs ni agregan características (ej: `refactor: modularizar componentes del panel de admin`).
  * `docs:` para cambios exclusivos en la documentación (ej: `docs: estructurar README definitivo`).
