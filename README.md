# Prueba tecnica QR

Proyecto desarrollado con dos APIs REST y un frontend simple para probar el flujo completo.

## Estructura

- `go-api`: API en Go con Fiber. Recibe una matriz rectangular, calcula la factorizacion QR y solicita estadisticas a la API Node.js.
- `node-api`: API en Node.js con Express. Recibe las matrices Q y R, calcula estadisticas y valida si alguna matriz es diagonal.
- `frontend`: interfaz HTML/CSS para autenticacion, entrada de matriz y visualizacion de resultados.

## Flujo

1. El frontend solicita un token JWT a la API Go.
2. El frontend envia una matriz a la API Go.
3. La API Go valida la matriz y calcula Q y R.
4. La API Go envia Q y R a la API Node.js mediante HTTP.
5. La API Node.js calcula las estadisticas.
6. La API Go responde al frontend con la matriz original, Q, R y las estadisticas.

## Tecnologias

- Go
- Fiber
- Node.js
- Express.js
- Docker
- JWT
- HTML/CSS

## Ejecucion local

Desde la raiz del proyecto:

```bash
docker compose up --build
```

Servicios:

- Frontend: `http://localhost:8000`
- API Go: `http://localhost:8080`
- API Node.js: `http://localhost:4000`

## Despliegue en Render

- Frontend: `https://prueba-frontend-ai83.onrender.com`
- API Go: `https://prueba-go-api.onrender.com`
- API Node.js: `https://prueba-node-api.onrender.com`

Credenciales de prueba:

```json
{
  "usuario": "admin",
  "contrasena": "admin123"
}
```

## Endpoints

### Obtener token

```http
POST /api/auth/token
Content-Type: application/json
```

Body:

```json
{
  "usuario": "admin",
  "contrasena": "admin123"
}
```

### Factorizar matriz

```http
POST /api/factorizar
Authorization: Bearer <token>
Content-Type: application/json
```

Body:

```json
{
  "matriz": [
    [1, 2, 3],
    [4, 5, 6]
  ]
}
```

Respuesta:

```json
{
  "matriz_original": [[1, 2, 3], [4, 5, 6]],
  "Q": [],
  "R": [],
  "estadisticas": {
    "combinado": {
      "valor_maximo": 0,
      "valor_minimo": 0,
      "promedio": 0,
      "suma_total": 0,
      "cantidad": 0
    },
    "Q": {
      "es_diagonal": false,
      "dimensiones": { "filas": 0, "columnas": 0 }
    },
    "R": {
      "es_diagonal": false,
      "dimensiones": { "filas": 0, "columnas": 0 }
    }
  }
}
```

## Pruebas

API Go:

```bash
cd go-api
go test ./...
```

API Node.js:

```bash
cd node-api
npm install
npm test
```

## Variables de entorno

### API Go
Variable - Descripcion 
`PUERTO` - Puerto del servicio Go 
`URL_API_NODE` - URL de la API Node.js 
`SECRETO_JWT` - Secreto usado para firmar y validar JWT 

### API Node.js

Variable - Descripcion 
`PUERTO`- Puerto del servicio Node.js 
`SECRETO_JWT` - Secreto usado para validar JWT 

## Despliegue

Cada API puede desplegarse como servicio independiente usando su Dockerfile.

Orden sugerido:

1. Desplegar `node-api`.
2. Desplegar `go-api` configurando `URL_API_NODE` con la URL de `node-api`.
3. Desplegar `frontend` como sitio estatico.

En despliegue local con Docker Compose, `URL_API_NODE` usa el nombre interno del servicio:

```text
http://api-node:3000
```

En nube debe configurarse con la URL publica o privada del servicio Node.js.

El frontend usa esta constante:

```js
const API_GO = window.API_GO_URL || 'http://localhost:8080';
```

Para despliegue en nube, `window.API_GO_URL` debe apuntar a la URL publica de la API Go.

En este despliegue se configuro en `frontend/config.js`:

```js
window.API_GO_URL = 'https://prueba-go-api.onrender.com';
```
