# API REST

Base local: `http://localhost:5080/api`

Los endpoints protegidos requieren `Authorization: Bearer <token>`.

| Área | Método y ruta | Descripción |
|---|---|---|
| Autenticación | `POST /auth/register` | Crear una cuenta |
| Autenticación | `POST /auth/login` | Obtener JWT y perfil |
| Publicaciones | `GET /items` | Buscar y filtrar publicaciones |
| Publicaciones | `GET /items/{id}` | Obtener un reporte |
| Publicaciones | `POST /items` | Crear un reporte |
| Publicaciones | `POST /items/{id}/image` | Adjuntar fotografía |
| Publicaciones | `PATCH /items/{id}/resolve` | Marcar como recuperado |
| Reclamaciones | `GET /claims` | Historial enviado y recibido |
| Reclamaciones | `POST /claims` | Reclamar un objeto encontrado |
| Reclamaciones | `PATCH /claims/{id}/approve` | Aprobar reclamación |
| Reclamaciones | `PATCH /claims/{id}/reject` | Rechazar reclamación |
| Coincidencias | `GET /matches/mine` | Coincidencias del usuario |
| Notificaciones | `GET /notifications` | Actividad persistente |
| Conversaciones | `GET /conversations` | Listar conversaciones |
| Conversaciones | `GET /conversations/{id}` | Leer historial |
| Conversaciones | `POST /conversations/{id}/messages` | Enviar mensaje |
| Perfil | `GET /users/me` | Perfil autenticado |
| Administración | `GET /admin/dashboard` | Métricas del sistema |

La documentación interactiva completa está disponible mediante Swagger en `/swagger`.
