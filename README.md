# Planificador de viaje API

API REST desarrollada con NestJS para la planificación de viajes, con gestión de países mediante caché y planes de viaje asociados.

## Descripción

Esta API implementa un sistema de gestión de viajes que:
- Consume información de países desde la API externa [RestCountries](https://restcountries.com/)
- Almacena países en una base de datos PostgreSQL como caché
- Permite crear y gestionar planes de viaje asociados a países específicos
- Implementa arquitectura modular con inyección de dependencias

## Características

- **Sistema de Caché**: Los países se buscan primero en la base de datos local y solo se consulta la API externa si no existen
- **Validación de Datos**: Uso de DTOs con validaciones automáticas
- **Arquitectura Modular**: Separación clara de responsabilidades entre módulos
- **Provider Pattern**: Abstracción del consumo de API externa para facilitar mantenimiento

## Módulos

### CountriesModule
Gestiona la información de países con sistema de caché.

**Entidad Country:**
- `code`: Código alpha-3 del país (PK)
- `name`: Nombre del país
- `region`: Región geográfica
- `subregion`: Subregión
- `capital`: Capital del país
- `population`: Población
- `flag`: URL de la bandera
- `createdAt`: Fecha de creación en BD
- `updatedAt`: Fecha de última actualización

**Endpoints:**
- `GET /countries` - Lista todos los países en caché
- `GET /countries/:code` - Obtiene un país por código alpha-3 (ej: COL, FRA, USA)

### TravelPlansModule
Gestiona planes de viaje asociados a países.

**Entidad TravelPlan:**
- `id`: UUID del plan
- `countryCode`: Código del país destino (FK)
- `title`: Título del viaje
- `startDate`: Fecha de inicio
- `endDate`: Fecha de fin
- `notes`: Notas adicionales (opcional)
- `createdAt`: Fecha de creación

**Endpoints:**
- `POST /travel-plans` - Crea un nuevo plan de viaje
- `GET /travel-plans` - Lista todos los planes
- `GET /travel-plans/:id` - Obtiene un plan específico por ID

## Tecnologías

- **NestJS**: Framework backend
- **TypeORM**: ORM para PostgreSQL
- **PostgreSQL**: Base de datos relacional
- **class-validator**: Validación de DTOs
- **Axios**: Cliente HTTP para consumir API externa

## Instalación

### Prerrequisitos

- Node.js (v18 o superior)
- PostgreSQL instalado y corriendo
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
cd travel-planner-api
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar base de datos**

Crear una base de datos en PostgreSQL:
```sql
CREATE DATABASE travel_planner;
```

4. **Configurar variables de entorno**

Editar el archivo `.env` con tus credenciales de PostgreSQL:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña
DB_NAME=travel_planner
```

5. **Ejecutar la aplicación**
```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

La API estará disponible en: `http://localhost:3000`

## Provider Externo - RestCountries

El sistema implementa un provider que encapsula el consumo de la API externa RestCountries:

**Interfaz:** `ICountryProvider`
- Define el contrato para obtener información de países

**Implementación:** `RestCountriesProvider`
- Consulta `https://restcountries.com/v3.1/alpha/:code`
- Limita los campos solicitados con el parámetro `fields`
- Maneja errores y devuelve `null` si el país no se encuentra
- Es inyectado en `CountriesService` mediante DI

**Ventajas:**
- Desacopla la lógica de dominio de la infraestructura
- Facilita pruebas unitarias (se puede mockear)
- Permite cambiar la fuente de datos sin modificar el servicio

## Ejemplos de Uso

### Consultar un país

```bash
GET http://localhost:3000/countries/COL
```

La primera vez retorna `source: "external"`, las siguientes `source: "cache"`.

### Crear un plan de viaje

```bash
POST http://localhost:3000/travel-plans
Content-Type: application/json

{
  "countryCode": "FRA",
  "title": "Vacaciones en París",
  "startDate": "2025-12-20",
  "endDate": "2025-12-28",
  "notes": "Visitar la Torre Eiffel"
}
```

Si el país no existe en la BD, se consulta automáticamente de la API externa antes de crear el plan.

## Validaciones

- countryCode: 3 caracteres exactos
- title: campo obligatorio
- startDate y endDate: formato ISO 8601
- startDate debe ser anterior a endDate
- El país debe existir antes de crear el plan

## Estructura del Proyecto

```
src/
├── app.module.ts
├── main.ts
├── countries/
│   ├── entities/country.entity.ts
│   ├── dto/country-response.dto.ts
│   ├── interfaces/country-provider.interface.ts
│   ├── providers/rest-countries.provider.ts
│   ├── countries.service.ts
│   ├── countries.controller.ts
│   └── countries.module.ts
└── travel-plans/
    ├── entities/travel-plan.entity.ts
    ├── dto/create-travel-plan.dto.ts
    ├── dto/travel-plan-response.dto.ts
    ├── travel-plans.service.ts
    ├── travel-plans.controller.ts
    └── travel-plans.module.ts
```

## Comandos

```bash
npm run start:dev    # Desarrollo
npm run build        # Compilar
npm run start:prod   # Producción
```

## Notas

- synchronize en TypeORM solo para desarrollo
- Códigos de país: formato alpha-3 (COL, FRA, USA)
- Fechas: formato ISO 8601 (YYYY-MM-DD)

---

# Parcial 2 - Funcionalidad Avanzada

## Descripción de la Ampliación

Para el parcial 2 se extiende la API del preparcial (CountriesModule + TravelPlansModule) con nuevas funcionalidades críticas para la gestión segura de países en caché. Se ha implementado un sistema de eliminación protegida de países mediante un guard de autorización que valida tokens en las cabeceras HTTP, asegurando que solo peticiones autorizadas puedan modificar la base de datos. Adicionalmente, se incorporó un middleware de logging que registra toda la actividad HTTP en las rutas principales, proporcionando trazabilidad completa de las operaciones realizadas en la API. La arquitectura modular del preparcial se mantiene intacta, respetando la separación de responsabilidades entre módulos.

## Nuevas Funcionalidades Implementadas

### 1. Endpoint de Borrado Protegido (Parte A)

#### Descripción
Se ha agregado el endpoint `DELETE /countries/:alpha3Code` que permite eliminar países de la caché de la base de datos. Este endpoint está protegido mediante un Guard de autorización que valida la presencia y el valor correcto del header `X-API-TOKEN`.

#### Características
- **Ruta**: `DELETE /countries/:alpha3Code`
- **Protección**: Guard de autorización (`AuthGuard`)
- **Token requerido**: `mi-token-secreto` en el header `X-API-TOKEN`
- **Validaciones**:
  - Verifica que el país exista en la caché
  - Impide el borrado si existen planes de viaje asociados
  - Retorna error 404 si el país no existe
  - Retorna error 400 si hay planes asociados
  - Retorna error 401 si el token es inválido o no está presente


### 2. Guard de Autorización

#### Descripción
El `AuthGuard` implementa la validación del token de autorización en el header `X-API-TOKEN`. Solo se aplica al endpoint de borrado de países.

#### Ubicación
`src/countries/guards/auth.guard.ts`

#### Funcionamiento
1. Intercepta la petición HTTP antes de llegar al controlador
2. Extrae el valor del header `X-API-TOKEN`
3. Compara con el token secreto: `mi-token-secreto`
4. Si coincide, permite el acceso
5. Si no coincide o no existe, lanza `UnauthorizedException` (401)

### 3. Middleware de Logging (Parte B)

#### Descripción
El `LoggingMiddleware` registra automáticamente toda la actividad HTTP en las rutas `/countries` y `/travel-plans`.

#### Ubicación
`src/common/middleware/logging.middleware.ts`

#### Información Registrada
Para cada petición, el middleware registra:
- **Método HTTP**: GET, POST, DELETE, etc.
- **Ruta solicitada**: URL completa
- **Código de estado**: 200, 201, 404, 401, etc.
- **Tiempo de procesamiento**: Duración total en milisegundos

#### Ejemplo de Log
```
[HTTP] GET /countries - Status: 200 - 45ms
[HTTP] POST /travel-plans - Status: 201 - 123ms
[HTTP] DELETE /countries/USA - Status: 401 - 12ms
[HTTP] DELETE /countries/USA - Status: 204 - 78ms
```

## Cómo Validar la Implementación

### Validar el Endpoint Protegido

#### 1. Probar sin token (debe fallar con 401)
```bash
curl -X DELETE http://localhost:3000/countries/USA
```
**Respuesta esperada**: `401 Unauthorized`
```json
{
  "statusCode": 401,
  "message": "Token de acceso inválido o no proporcionado"
}
```

#### 2. Probar con token incorrecto (debe fallar con 401)
```bash
curl -X DELETE http://localhost:3000/countries/USA -H "X-API-TOKEN: token-incorrecto"
```
**Respuesta esperada**: `401 Unauthorized`

#### 3. Probar con token correcto en país inexistente (debe fallar con 404)
```bash
curl -X DELETE http://localhost:3000/countries/XXX -H "X-API-TOKEN: mi-token-secreto"
```
**Respuesta esperada**: `404 Not Found`
```json
{
  "statusCode": 404,
  "message": "País con código XXX no encontrado en la caché"
}
```

#### 4. Probar eliminación exitosa
```bash
# Primero, obtener un país para agregarlo a la caché
curl http://localhost:3000/countries/USA

# Luego, eliminar el país (sin planes asociados)
curl -X DELETE http://localhost:3000/countries/USA -H "X-API-TOKEN: mi-token-secreto"
```
**Respuesta esperada**: `204 No Content` (sin cuerpo de respuesta)

#### 5. Probar eliminación con planes asociados (debe fallar con 400)
```bash
# Primero, crear un plan de viaje
curl -X POST http://localhost:3000/travel-plans \
  -H "Content-Type: application/json" \
  -d '{
    "countryCode": "USA",
    "title": "Viaje a Nueva York",
    "startDate": "2025-12-01",
    "endDate": "2025-12-10",
    "notes": "Visitar Manhattan"
  }'

# Intentar eliminar el país
curl -X DELETE http://localhost:3000/countries/USA -H "X-API-TOKEN: mi-token-secreto"
```
**Respuesta esperada**: `400 Bad Request`
```json
{
  "statusCode": 400,
  "message": "No se puede eliminar el país USA porque tiene planes de viaje asociados"
}
```

### Validar el Guard

El Guard se valida automáticamente al intentar usar el endpoint DELETE:

1. **Sin token**: Verifica que devuelve 401
2. **Token incorrecto**: Verifica que devuelve 401
3. **Token correcto**: Verifica que permite el acceso (puede devolver 204, 404, o 400 según el caso)

### Validar el Middleware de Logging

#### 1. Iniciar la aplicación
```bash
npm run start:dev
```

#### 2. Observar la consola mientras realizas peticiones
Ejecuta cualquier petición a las rutas protegidas:

```bash
# Obtener todos los países
curl http://localhost:3000/countries

# Obtener un país específico
curl http://localhost:3000/countries/USA

# Crear un plan de viaje
curl -X POST http://localhost:3000/travel-plans \
  -H "Content-Type: application/json" \
  -d '{
    "countryCode": "USA",
    "title": "Viaje de prueba",
    "startDate": "2025-12-01",
    "endDate": "2025-12-10"
  }'

# Intentar eliminar un país
curl -X DELETE http://localhost:3000/countries/USA -H "X-API-TOKEN: mi-token-secreto"
```

#### 3. Verificar los logs en la consola
```
[HTTP] GET /countries - Status: 200 - 45ms
[HTTP] GET /countries/USA - Status: 200 - 32ms
[HTTP] POST /travel-plans - Status: 201 - 156ms
[HTTP] DELETE /countries/USA - Status: 400 - 89ms
```

Cada log muestra:
- Método HTTP usado
- Ruta completa
- Código de estado de la respuesta
- Tiempo de procesamiento en milisegundos

### Modificaciones Realizadas
- **CountriesController**: Agregado endpoint DELETE con Guard
- **CountriesService**: Método `deleteCountry` con validaciones
- **TravelPlansService**: Método `hasPlansForCountry` para verificar asociaciones
- **CountriesModule**: Importación circular con TravelPlansModule usando `forwardRef`
- **TravelPlansModule**: Exportación de TravelPlansService
- **AppModule**: Configuración del middleware para rutas específicas

