# Contribuir

1. Crea una rama desde `main` con un nombre descriptivo.
2. Mantén las reglas de dependencia descritas en `docs/ARCHITECTURE.md`.
3. No introduzcas lógica de negocio en componentes React ni acceso directo a infraestructura desde Domain.
4. Ejecuta las compilaciones del backend y frontend antes de abrir un pull request.
5. Documenta migraciones, nuevos endpoints y decisiones relevantes.

## Convenciones

- C#: tipos y miembros públicos en PascalCase; variables locales en camelCase.
- React: componentes en PascalCase y hooks con prefijo `use`.
- Commits: mensajes imperativos y enfocados, por ejemplo `feat: add claim verification workflow`.
- Ningún secreto, archivo `.env`, base de datos o fotografía subida debe incluirse en Git.
