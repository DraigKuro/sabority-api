# Sabority API

API REST que actúa como núcleo del sistema [Sabority](https://github.com/DraigKuro/sabority), una plataforma de gestión para restaurantes que permite a los clientes pedir desde la mesa sin intervención de un camarero.

Esta API centraliza la lógica de negocio y la persistencia de datos, sirviendo tanto al panel de administración ([`sabority-admin-web`](https://github.com/DraigKuro/sabority-admin-web)) como a la app de cliente ([`sabority-android`](https://github.com/DraigKuro/sabority-android)).

## Stack

- **TypeScript** + **Node.js** + **Express**
- **MongoDB** con **Mongoose**
- **Multer** para la subida de imágenes (platos, bebidas)

## Arquitectura

La API sigue una organización en capas clásica para mantener el código desacoplado y fácil de mantener:

```
src/
├── config/         # Configuración de conexión a MongoDB y Multer
├── models/         # Esquemas de Mongoose
├── services/       # Lógica de negocio (CRUD y reglas del dominio)
├── controllers/    # Manejo de petición/respuesta HTTP
├── routes/         # Definición de endpoints
├── utils/          # Helpers comunes (manejo de errores async, errores personalizados)
└── index.ts        # Punto de entrada del servidor
```

**Flujo de una petición:** `Ruta → Controlador → Servicio → Modelo (Mongoose) → MongoDB`

Para evitar repetir bloques `try/catch` en cada controlador, los controladores asíncronos se envuelven con un helper (`asyncHandlerError`) que delega cualquier error al middleware global de manejo de errores. Los errores de negocio (recurso no encontrado, datos inválidos, etc.) se lanzan mediante una clase `CustomError` con su propio código de estado HTTP.

## Recursos principales

| Recurso | Descripción |
|---|---|
| `Dish` | Platos del menú (nombre, categoría, precio, imagen, soft delete) |
| `Drink` | Bebidas, con esquema paralelo a `Dish` |
| `Menu` | Combinaciones predefinidas de platos y bebidas |
| `Promotion` | Ofertas y promociones temporales |
| `Restaurant` | Datos maestros del restaurante (horarios, redes sociales, contacto) |
| `Table` | Mesas físicas, con `uid` único y código QR asociado |
| `Order` | Pedidos: referencia a la mesa, los platos/bebidas solicitados y su estado |

La mayoría de colecciones implementan **soft delete** (campo `deletedAt` + `activo`) en lugar de borrado físico, para conservar el historial.

## Estado del proyecto

- ✅ CRUD completo de platos, bebidas, menús, promociones, restaurante, mesas y pedidos.
- ✅ Subida de imágenes mediante Multer.
- ✅ Manejo de errores centralizado.
- ⚠️ La autenticación (`AuthService`/`AuthController`) está diseñada pero **aún no implementada**: por ahora los endpoints no requieren login.
- ⚠️ Hay configuración de tests con Jest, pero todavía no hay cobertura real de pruebas.

## Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/sabority
STORAGE_TYPE=local
```

## Instalación

```bash
npm install
npm run dev
```

## Contexto del proyecto

Este repositorio forma parte de [Sabority](https://github.com/DraigKuro/sabority), proyecto de fin de curso (2º DAM) que evolucionó desde una primera versión basada en web ([`sabority-web-legacy`](https://github.com/DraigKuro/sabority-web-legacy)) hacia la arquitectura actual de tres componentes.
