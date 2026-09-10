---
name: backend-architecture
description: Diseña y estructura backends modernos para aplicaciones web, especialmente APIs REST con separación clara entre rutas, controladores, servicios, modelos, middleware y configuración. Usar al crear, reorganizar, extender o revisar la arquitectura del backend.
---

# Backend Architecture

## Objetivo

Diseñar backends mantenibles, escalables y fáciles de entender.

La arquitectura debe separar responsabilidades y evitar colocar toda la lógica dentro de las rutas o controladores.

## Principios

- Mantener separación entre rutas, controladores y lógica de negocio.
- Los controladores deben ser delgados.
- La lógica de negocio debe estar principalmente en servicios.
- El acceso a datos debe estar aislado.
- Centralizar configuración mediante variables de entorno.
- Evitar código duplicado.
- Utilizar nombres descriptivos.
- Mantener funciones pequeñas y enfocadas.
- Validar datos antes de ejecutar lógica de negocio.
- Manejar errores de forma consistente.

## Arquitectura recomendada

Para un backend Node.js utilizar preferiblemente:

```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   ├── app.js
│   └── server.js
├── .env
├── .env.example
├── package.json
└── README.md