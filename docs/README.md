# Documentacion

## Descripcion
Aplicacion web de administracion de usuarios en Node.js con almacenamiento en memoria.

## Estructura
- `/src`: codigo de la aplicacion.
- `/src/web`: interfaz web (HTML, CSS y JavaScript del cliente).
- `/test`: pruebas unitarias.
- `/docs`: documentacion.
- `/package`: paquete para calcular la antiguedad como cliente.

## Interfaz web
- URL principal: `/`
- Recursos estaticos: `/web/*`

Desde la interfaz web puedes:
- Registrar usuarios.
- Visualizar usuarios con su antiguedad.
- Eliminar usuarios.

## API HTTP
### `GET /health`
Valida que el servicio este disponible.

### `GET /users`
Lista usuarios.

Query params opcionales:
- `includeTenure=true`: incluye calculo de antiguedad.

### `POST /users`
Crea un usuario.

Body JSON:
```json
{
  "name": "Ana",
  "email": "ana@example.com",
  "clientSince": "2024-01-01"
}
```

### `GET /users/:id`
Obtiene un usuario por su id.

### `PUT /users/:id`
Actualiza un usuario.

### `DELETE /users/:id`
Elimina un usuario.

### `GET /users/:id/tenure`
Obtiene usuario con antiguedad calculada.

## Ejecucion
1. Instalar dependencias (no requiere librerias externas).
2. Ejecutar servidor:
   - `npm start`
3. Abrir en navegador:
   - `http://localhost:3000`
4. Ejecutar pruebas:
   - `npm test`
