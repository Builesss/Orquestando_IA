---
name: api-security
description: Protege APIs y aplicaciones web mediante autenticación, autorización, validación de entradas, manejo seguro de errores, protección de secretos, rate limiting y prevención de vulnerabilidades comunes. Usar al crear, modificar o auditar endpoints.
---

# API Security

## Objetivo

Construir APIs seguras desde el diseño y reducir vulnerabilidades comunes.

La seguridad debe aplicarse desde el inicio y no únicamente al final del desarrollo.

## Principios

- Nunca confiar en datos enviados por el cliente.
- Validar todas las entradas.
- Aplicar autenticación cuando sea necesaria.
- Aplicar autorización por recurso.
- Nunca exponer secretos.
- No devolver información sensible.
- Utilizar HTTPS en producción.
- Aplicar límites de solicitudes cuando sea apropiado.
- Manejar errores sin revelar información interna.

## Autenticación

Si la aplicación requiere usuarios autenticados:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me