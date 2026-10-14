# Sistema de Tickets de Soporte

**Autor:** Gervin Uriel Sucunú Xuyá  
**Carnet:** 2290-24-23575  
**Curso:** Sistemas Operativos I  
**Proyecto:** Tres Contenedores Interconectados  

## Descripción

Este proyecto consiste en un sistema web de tickets de soporte técnico construido con una arquitectura de tres capas y desplegado mediante Docker Compose.

La idea principal es sencilla: un usuario registra un problema, el área de soporte lo recibe y puede darle seguimiento hasta resolverlo. Todo el flujo funciona mediante tres contenedores separados: uno para la interfaz web, otro para la API y otro para PostgreSQL.

El proyecto permite demostrar de forma práctica el uso de contenedores, redes bridge, comunicación por nombre de servicio, persistencia con volúmenes, healthchecks y administración mediante Docker Compose.

---

## Funciones principales

### Vista de Usuario

La vista de usuario permite:

- Registrar un ticket.
- Indicar nombre, título y descripción del problema.
- Asignar una prioridad.
- Consultar los tickets registrados.
- Filtrar tickets por nombre.
- Consultar el estado actual de cada solicitud.

Las prioridades disponibles son:

```text
BAJA
MEDIA
ALTA
```

### Vista de Soporte

La vista de soporte permite:

- Consultar todos los tickets.
- Filtrar por estado y prioridad.
- Abrir el detalle de una solicitud.
- Cambiar el estado del ticket.
- Eliminar tickets.
- Consultar métricas generales.

Los estados utilizados son:

```text
PENDIENTE
EN_REVISION
EN_PROCESO
RESUELTO
```

La prioridad es elegida por el usuario al momento de crear el ticket. El área de soporte únicamente la consulta y administra el estado de la solicitud.

---

## Arquitectura general

El sistema utiliza tres contenedores conectados mediante Docker Compose.

```text
┌───────────────────────────────────────────────────────────────┐
│                       NAVEGADOR                               │
│                                                               │
│                 http://localhost:8080                         │
└──────────────────────────────┬────────────────────────────────┘
                               │
                               │ HTTP
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                    CONTENEDOR WEB                             │
│                                                               │
│  Contenedor: tickets_web                                      │
│  Servicio:   web                                              │
│  Tecnología: Nginx Alpine                                     │
│  Puerto:     8080 -> 80                                       │
│                                                               │
│  Sirve la interfaz HTML, CSS y JavaScript                     │
│  y redirige las peticiones /api hacia api:3000.               │
└──────────────────────────────┬────────────────────────────────┘
                               │
                               │ Nombre de servicio: api
                               │ Puerto interno: 3000
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                    CONTENEDOR API                             │
│                                                               │
│  Contenedor: tickets_api                                      │
│  Servicio:   api                                              │
│  Tecnología: Node.js + Express                                │
│  Puerto:     3000 interno                                     │
│                                                               │
│  Procesa las solicitudes del sistema y ejecuta                │
│  las operaciones sobre los tickets.                           │
└──────────────────────────────┬────────────────────────────────┘
                               │
                               │ DB_HOST=db
                               │ Puerto interno: 5432
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                 CONTENEDOR POSTGRESQL                         │
│                                                               │
│  Contenedor: tickets_db                                       │
│  Servicio:   db                                               │
│  Tecnología: PostgreSQL 15 Alpine                             │
│  Puerto:     5432 interno                                     │
│                                                               │
│  Guarda los tickets y mantiene la información                 │
│  utilizada por la aplicación.                                 │
└──────────────────────────────┬────────────────────────────────┘
                               │
                               │ Persistencia
                               ▼
                    ┌─────────────────────────┐
                    │      VOLUMEN DOCKER     │
                    │                         │
                    │        pgdata           │
                    │                         │
                    │ /var/lib/postgresql/    │
                    │        data             │
                    └─────────────────────────┘
```

En resumen, el recorrido normal de una solicitud es:

```text
┌────────────┐      ┌────────────┐      ┌────────────┐      ┌──────────────┐
│ Navegador  │ ───► │ Nginx/Web  │ ───► │ API Node   │ ───► │ PostgreSQL   │
└────────────┘      └────────────┘      └────────────┘      └──────┬───────┘
                                                                  │
                                                                  ▼
                                                          ┌──────────────┐
                                                          │   pgdata     │
                                                          └──────────────┘
```

---

## Redes Docker

El proyecto utiliza dos redes bridge creadas por Docker Compose.

### Red frontend

```text
┌────────────────────────────────────────────┐
│        sistema-tickets_frontend            │
│                                            │
│          ┌────────────────────┐            │
│          │    tickets_web     │            │
│          └────────────────────┘            │
└────────────────────────────────────────────┘
```

### Red backend

```text
┌────────────────────────────────────────────┐
│         sistema-tickets_backend            │
│                                            │
│  ┌──────────────┐  ┌──────────────┐        │
│  │ tickets_web  │  │ tickets_api  │        │
│  └──────┬───────┘  └──────┬───────┘        │
│         │                  │               │
│         └──────────┬───────┘               │
│                    │                       │
│                    ▼                       │
│             ┌──────────────┐               │
│             │  tickets_db  │               │
│             └──────────────┘               │
└────────────────────────────────────────────┘
```

La separación permite que la interfaz web sea el punto de entrada del sistema, mientras que la API y PostgreSQL permanecen dentro de la comunicación interna de Docker.

No se utilizan direcciones IP fijas. Los contenedores se localizan mediante nombres de servicio.

```text
web  ─────►  api:3000
api  ─────►  db:5432
```

---

## Tecnologías utilizadas

| Capa                  | Tecnología |
|---|---                |
| Frontend              | HTML5, CSS3 y JavaScript |
| Servidor web          | Nginx Alpine |
| Backend               | Node.js 20 Alpine |
| API                   | Express |
| Conexión a PostgreSQL | pg |
| Base de datos         | PostgreSQL 15 Alpine |
| Contenedores          | Docker |
| Orquestación          | Docker Compose |
| Redes                 | Bridge |
| Persistencia          | Docker Volume |

---

## Estructura del proyecto

```text
sistema-tickets/
│
├── api/
│   ├── src/
│   │   ├── routes/
│   │   │   └── tickets.js
│   │   ├── db.js
│   │   └── server.js
│   ├── Dockerfile
│   ├── package.json
│   └── .env
│
├── database/
│   └── init.sql
|   |__ Dockerfile
│
├── web/
│   ├── css/
│   │   ├── base.css
│   │   ├── index.css
│   │   ├── usuario.css
│   │   └── soporte.css
│   │
│   ├── js/
│   │   ├── usuario.js
│   │   └── soporte.js
│   │
│   ├── index.html
│   ├── usuario.html
│   ├── soporte.html
│   ├── nginx.conf
│   └── Dockerfile
│
├── docker-compose.yml
├── .env
└── README.md
```

---

## Servicios

### Web

El contenedor `tickets_web` utiliza Nginx Alpine.

Su función es servir la interfaz y actuar como proxy para la API.

```text
┌──────────────────────┐
│     tickets_web      │
│                      │
│    Nginx Alpine      │
│                      │
│  Host: 8080          │
│  Contenedor: 80      │
└──────────┬───────────┘
           │
           │ /api
           ▼
     api:3000
```

### API

El contenedor `tickets_api` ejecuta Node.js con Express.

```text
┌──────────────────────┐
│     tickets_api      │
│                      │
│   Node.js + Express  │
│                      │
│   Puerto: 3000       │
└──────────┬───────────┘
           │
           │ DB_HOST=db
           ▼
       db:5432
```

La API no se publica directamente hacia el equipo host. La comunicación normal pasa por Nginx.

### Base de datos

El contenedor `tickets_db` utiliza PostgreSQL 15 Alpine.

```text
┌──────────────────────┐
│      tickets_db      │
│                      │
│ PostgreSQL 15 Alpine │
│                      │
│   Puerto: 5432       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│       pgdata         │
│    Docker Volume     │
└──────────────────────┘
```

---

## Variables de entorno

La configuración principal se maneja mediante el archivo `.env`.

```env
POSTGRES_USER=tickets_app
POSTGRES_PASSWORD=cambiar_esta_clave
POSTGRES_DB=sistema_tickets

DB_PORT=5432
PORT=3000

FRONTEND_ORIGIN=http://localhost:8080
WEB_PORT=8080
```

Dentro de Docker, la API utiliza el servicio `db` como host de PostgreSQL.

```text
DB_HOST=db
DB_PORT=5432
DB_USER=${POSTGRES_USER}
DB_PASSWORD=${POSTGRES_PASSWORD}
DB_NAME=${POSTGRES_DB}
```

Las credenciales reales no deben publicarse en un repositorio público.

---

## Base de datos

La estructura inicial se encuentra en:

```text
database/init.sql
```

La tabla principal es `tickets`.

| Campo                 | Descripción |
|---|---                |
| `id`                  | Identificador único |
| `nombre_usuario`      | Nombre de quien registra la solicitud |
| `titulo`              | Título del problema |
| `descripcion`         | Detalle del problema |
| `prioridad`           | BAJA, MEDIA o ALTA |
| `estado`              | Estado actual del ticket |
| `fecha_creacion`      | Fecha de registro |
| `fecha_actualizacion` | Última modificación |

También se utilizan restricciones `CHECK`, índices y un trigger que actualiza automáticamente `fecha_actualizacion`.

La inicialización funciona de esta forma:

```text
┌────────────────────┐
│ PostgreSQL inicia  │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ ¿pgdata está vacío?│
└──────┬───────┬─────┘
       │ Sí    │ No
       ▼       ▼
┌────────────┐ ┌────────────────────┐
│ init.sql   │ │ Usa datos          │
│ se ejecuta │ │ existentes         │
└─────┬──────┘ └─────────┬──────────┘
      │                  │
      └──────────┬───────┘
                 ▼
       ┌──────────────────┐
       │ Base disponible  │
       └──────────────────┘
```

---

## API REST

Ruta principal:

```text
/api/tickets
```

| Método  | Endpoint                      |            Función |
|---|---  |---                            |
| GET     | `/api/tickets`                | Obtener todos los tickets |
| GET     | `/api/tickets?usuario=nombre` | Filtrar por usuario |
| GET     | `/api/tickets/:id`            | Consultar un ticket |
| POST    | `/api/tickets`                | Crear un ticket |
| PUT     | `/api/tickets/:id`            | Cambiar el estado |
| DELETE  | `/api/tickets/:id`            | Eliminar un ticket |
| GET     | `/api/health`                 | Comprobar la API |

Respuesta del endpoint de salud:

```json
{
  "estado": "ok",
  "servicio": "sistema-tickets-api"
}
```

---

## Flujo de creación de un ticket

```text
┌─────────────────┐
│     Usuario     │
└────────┬────────┘
         │
         │ Completa formulario
         ▼
┌─────────────────┐
│    Frontend     │
│ HTML / JS       │
└────────┬────────┘
         │
         │ POST /api/tickets
         ▼
┌─────────────────┐
│      Nginx      │
└────────┬────────┘
         │
         │ api:3000
         ▼
┌─────────────────┐
│   API Express   │
└────────┬────────┘
         │
         │ INSERT
         ▼
┌─────────────────┐
│   PostgreSQL    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Ticket guardado │
└─────────────────┘
```

---

## Flujo de actualización desde Soporte

```text
┌──────────────────────┐
│   Panel de Soporte   │
└──────────┬───────────┘
           │
           │ Abre ticket
           ▼
┌──────────────────────┐
│ Selecciona un estado │
└──────────┬───────────┘
           │
           │ PUT /api/tickets/:id
           ▼
┌──────────────────────┐
│        Nginx         │
└──────────┬───────────┘
           │
           │ api:3000
           ▼
┌──────────────────────┐
│     API Express      │
└──────────┬───────────┘
           │
           │ UPDATE
           ▼
┌──────────────────────┐
│      PostgreSQL      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Estado actualizado  │
└──────────────────────┘
```

---

## Comandos utilizados

### Validación de Docker Compose

```bash
docker compose config
```

### Construcción y arranque

```bash
docker compose up --build
```

### Ejecución en segundo plano

```bash
docker compose up -d
```

### Estado de los servicios

```bash
docker compose ps
```

### Contenedores en ejecución

```bash
docker ps
```

### Detención de la composición

```bash
docker compose down
```

El volumen de PostgreSQL permanece disponible después de este comando.

La eliminación completa del volumen se realiza únicamente con:

```bash
docker compose down -v
```

---

## Acceso al sistema

Interfaz principal:

```text
http://localhost:8080
```

Comprobación de la API a través de Nginx:

```text
http://localhost:8080/api/health
```

Flujo del acceso:

```text
┌───────────────────────────────┐
│ http://localhost:8080        │
└───────────────┬───────────────┘
                │
                ▼
       ┌─────────────────┐
       │   tickets_web   │
       │      Nginx      │
       └────────┬────────┘
                │
       /api     │
                ▼
       ┌─────────────────┐
       │   tickets_api   │
       │     Express     │
       └─────────────────┘
```

---

## Pruebas realizadas

### Estado de los contenedores

```bash
docker compose ps
```

La prueba confirmó la ejecución simultánea de:

```text
┌───────────────────────┐
│      tickets_web      │
├───────────────────────┤
│      tickets_api      │
├───────────────────────┤
│ tickets_db (healthy)  │
└───────────────────────┘
```

---

## Prueba de redes

Listado de redes:

```bash
docker network ls
```

Inspección completa:

```bash
docker network inspect sistema-tickets_frontend
```

```bash
docker network inspect sistema-tickets_backend
```

Consulta compacta de contenedores conectados:

```bash
docker network inspect sistema-tickets_frontend --format '{{json .Containers}}'
```

```bash
docker network inspect sistema-tickets_backend --format '{{json .Containers}}'
```

Resultado comprobado:

```text
┌───────────────────────────────┐
│ sistema-tickets_frontend      │
│                               │
│       ┌───────────────┐       │
│       │ tickets_web   │       │
│       └───────────────┘       │
└───────────────────────────────┘


┌───────────────────────────────┐
│ sistema-tickets_backend       │
│                               │
│ ┌───────────┐ ┌───────────┐   │
│ │tickets_web│ │tickets_api│   │
│ └─────┬─────┘ └─────┬─────┘   │
│       │             │         │
│       └──────┬──────┘         │
│              ▼                │
│       ┌─────────────┐         │
│       │ tickets_db  │         │
│       └─────────────┘         │
└───────────────────────────────┘
```

---

## Prueba de comunicación por nombre

Comunicación desde Web hacia API:

```bash
docker exec tickets_web ping -c 4 tickets_api
```

Comunicación desde API hacia PostgreSQL:

```bash
docker exec tickets_api ping -c 4 tickets_db
```

Resultado comprobado:

```text
┌──────────────┐      nombre       ┌──────────────┐
│ tickets_web  │ ────────────────► │ tickets_api  │
└──────────────┘                   └──────────────┘

┌──────────────┐      nombre       ┌──────────────┐
│ tickets_api  │ ────────────────► │  tickets_db  │
└──────────────┘                   └──────────────┘

                    0% packet loss
```

Esta prueba confirma que la comunicación entre contenedores funciona utilizando nombres y no direcciones IP fijas.

---

## Logs

Logs del servicio Web:

```bash
docker logs tickets_web
```

Logs de la API:

```bash
docker logs tickets_api
```

Logs de PostgreSQL:

```bash
docker logs tickets_db
```

Logs generales:

```bash
docker compose logs
```

Los registros permiten comprobar el arranque de los tres servicios y revisar las solicitudes recibidas por la aplicación.

---

## Healthcheck de PostgreSQL

PostgreSQL utiliza `pg_isready` para indicar cuándo la base de datos está disponible.

```text
┌────────────────────┐
│ PostgreSQL inicia  │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│    pg_isready      │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Estado: healthy    │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ API puede iniciar  │
└────────────────────┘
```

Esto evita que la API intente trabajar con PostgreSQL antes de que la base esté lista.

---

## Persistencia

PostgreSQL utiliza el volumen:

```text
pgdata
```

Ubicación dentro del contenedor:

```text
/var/lib/postgresql/data
```

La persistencia se comprobó mediante este ciclo:

```bash
docker compose down
docker compose up -d
docker compose ps
```

El comportamiento observado fue:

```text
┌──────────────────────┐
│ Tickets registrados │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ docker compose down  │
└──────────┬───────────┘
           │
           │ Los contenedores se eliminan
           │ pero pgdata permanece
           ▼
┌──────────────────────┐
│ docker compose up -d │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Contenedores nuevos  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Tickets siguen ahí   │
└──────────────────────┘
```

La prueba confirma que los datos no dependen de la vida del contenedor de PostgreSQL.

---

## Prueba funcional completa

El sistema fue comprobado desde el registro de una solicitud hasta su actualización en soporte.

```text
┌────────────────┐
│ Crear ticket   │
│ desde Usuario  │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ Nginx recibe   │
│ la solicitud   │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ API procesa    │
│ el ticket      │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ PostgreSQL lo  │
│ almacena       │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ Soporte lo     │
│ consulta       │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ Cambia estado  │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ API actualiza  │
│ PostgreSQL     │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ Usuario ve el  │
│ nuevo estado   │
└────────────────┘
```

Con esta prueba se comprobó el recorrido completo:

```text
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌────────────┐
│ Usuario  │ -> │   Web    │ -> │   API    │ -> │ PostgreSQL │
└──────────┘    └──────────┘    └──────────┘    └────────────┘

┌──────────┐    ┌──────────┐    ┌──────────┐    ┌────────────┐
│ Usuario  │ <- │   Web    │ <- │   API    │ <- │ PostgreSQL │
└──────────┘    └──────────┘    └──────────┘    └────────────┘
```

---

## Evidencias obtenidas

Durante las pruebas se comprobó:

- Los tres contenedores funcionando al mismo tiempo.
- PostgreSQL en estado `healthy`.
- El frontend accesible mediante el puerto `8080`.
- La respuesta correcta del endpoint `/api/health`.
- Creación de tickets desde la vista Usuario.
- Consulta de tickets desde Soporte.
- Cambio de estado de los tickets.
- Persistencia después de eliminar y volver a crear los contenedores.
- Existencia de las redes `frontend` y `backend`.
- Contenedores conectados a las redes correspondientes.
- Comunicación Web → API mediante nombre.
- Comunicación API → PostgreSQL mediante nombre.
- Logs correctos de Web, API y PostgreSQL.

---

## Despliegue en Ubuntu

La misma composición puede ejecutarse en Ubuntu sin modificar la arquitectura del sistema.

```text
┌─────────────────────────────┐
│ Proyecto sistema-tickets    │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│       Servidor Ubuntu       │
│                             │
│ Docker + Docker Compose     │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ docker compose up           │
│       --build -d            │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│ web + api + db              │
│ funcionando en Ubuntu       │
└─────────────────────────────┘
```

Comandos utilizados para validar el despliegue:

```bash
docker compose config
docker compose up --build -d
docker compose ps
```

Acceso desde otro equipo de la misma red:

```text
http://IP_DEL_SERVIDOR_UBUNTU:8080
```

El uso de Docker permite mantener la misma configuración en diferentes equipos sin tener que instalar manualmente Node.js, PostgreSQL o Nginx en el sistema operativo anfitrión.

---

## Consideraciones técnicas

- Se utiliza un servicio principal por contenedor.
- El navegador entra únicamente por Nginx.
- La API no publica el puerto `3000` directamente hacia el host.
- PostgreSQL no publica el puerto `5432` directamente hacia el host.
- La comunicación interna utiliza nombres de servicio.
- PostgreSQL utiliza un volumen persistente.
- La base de datos cuenta con healthcheck.
- La configuración utiliza variables de entorno.
- La arquitectura está separada en Web, API y Base de datos.
- El proyecto no utiliza autenticación porque no forma parte del alcance definido.
- La vista Usuario se enfoca en registrar y consultar tickets.
- La vista Soporte se enfoca en revisar y actualizar estados.

---

## Resultado final

El proyecto implementa un Sistema de Tickets de Soporte funcional mediante tres contenedores interconectados.

La arquitectura final queda resumida así:

```text
┌──────────────┐
│   USUARIO    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│     WEB      │
│    NGINX     │
│  Puerto 8080 │
└──────┬───────┘
       │
       │ api:3000
       ▼
┌──────────────┐
│     API      │
│ Node/Express │
│ Puerto 3000  │
└──────┬───────┘
       │
       │ db:5432
       ▼
┌──────────────┐
│  POSTGRESQL  │
│ Puerto 5432  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    pgdata    │
│   Volumen    │
└──────────────┘
```

Con esto se demuestra de forma práctica el uso de Docker Compose, contenedores, redes bridge, nombres de servicio, persistencia mediante volúmenes, healthchecks, logs y una arquitectura Web → API → Base de datos.
