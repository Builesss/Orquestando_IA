---
name: image-processing
description: Implementa procesamiento y optimización de imágenes para aplicaciones web, incluyendo validación, redimensionamiento, compresión, formatos, metadatos y almacenamiento. Usar cuando una aplicación permita subir, transformar o mostrar imágenes.
---

# Image Processing

## Objetivo

Procesar imágenes de forma segura y eficiente antes de almacenarlas o servirlas.

## Flujo recomendado

```text
Usuario selecciona imagen
        ↓
Backend recibe archivo
        ↓
Validación
        ↓
Procesamiento
        ↓
Optimización
        ↓
Almacenamiento
        ↓
Guardar referencia en DB
        ↓
URL para frontend