# Seguridad

No publiques vulnerabilidades en issues públicos. Repórtalas de forma privada al responsable del repositorio con pasos de reproducción, impacto y versión afectada.

Antes de producción:

- Sustituye la clave JWT de desarrollo mediante variables de entorno.
- Usa credenciales de PostgreSQL administradas y TLS.
- Elimina o desactiva las cuentas y datos de demostración.
- Migra las imágenes a almacenamiento externo con controles de acceso.
- Restringe CORS al dominio definitivo.
- Añade rate limiting, observabilidad y rotación de secretos.
