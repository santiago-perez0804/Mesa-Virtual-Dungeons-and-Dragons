# Guía de Administración: Configuración de AWS S3 para Desarrolladores

Esta guía es exclusiva para el administrador del proyecto (tú) para recordar cómo configurar y dar acceso limitado a nuevos desarrolladores para que puedan usar el bucket de S3 sin comprometer la seguridad de tu cuenta de AWS.

---

## 1. ¿Qué datos debes entregarle al desarrollador?
Para que su entorno local `.env` funcione, necesita que le proveas la siguiente plantilla con valores reales:

```env
# AWS S3 Config (Entregado por el Admin)
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_REGION=us-east-1
S3_BUCKET_NAME=nombre-de-tu-bucket-real
```

---

## 2. Paso a Paso: Cómo crear un usuario con acceso limitado a S3 en AWS

Nunca des tus credenciales maestras (Root Account). Sigue estos pasos para crear credenciales dedicadas para cada desarrollador:

### Paso A: Crear un usuario en IAM
1. Entra a la consola de AWS.
2. En la barra de búsqueda superior, escribe **IAM** y entra al servicio.
3. En el menú izquierdo, haz clic en **Users** (Usuarios) y luego a la derecha en el botón naranja **Create user** (Crear usuario).
4. Asigna un nombre descriptivo al usuario, por ejemplo: `desarrollador-dnd-vtt-sapo`.
5. **IMPORTANTE**: Deja **desmarcada** la casilla *"Provide user access to the AWS Management Console"*. (No necesitan iniciar sesión en la página web, solo necesitan acceso programático a través del código).
6. Haz clic en **Next**.

### Paso B: Asignar permisos mínimos (Políticas de S3)
1. En las opciones de permisos, selecciona la tercera opción: **Attach policies directly** (Asociar políticas directamente).
2. En la barra de búsqueda de políticas, escribe `AmazonS3FullAccess`.
3. Selecciona la casilla junto a **AmazonS3FullAccess** (esto les permitirá subir, listar y borrar assets en S3).
4. Haz clic en **Next** y luego en **Create user**.

### Paso C: Generar las claves de acceso (Access Keys)
1. En la lista de usuarios de IAM, haz clic sobre el usuario que acabas de crear (`desarrollador-dnd-vtt-sapo`).
2. Ve a la pestaña llamada **Security credentials** (Credenciales de seguridad).
3. Baja hasta la sección **Access keys** (Claves de acceso) y haz clic en **Create access key** (Crear clave de acceso).
4. Te preguntará para qué las quieres usar. Selecciona **Application running outside AWS** o **Local code**.
5. Haz clic en **Next** y luego en **Create access key**.

### Paso D: Guardar y Enviar
1. En la pantalla final se revelarán las credenciales:
   - **Access key ID** (Visible siempre).
   - **Secret access key** (Solo se muestra esta vez).
2. Haz clic en **Download .csv file** para guardar una copia de respaldo o cópialas directamente.
3. Envíaselas al desarrollador de manera segura y recuérdale que no debe subirlas a ningún repositorio público de Git.
