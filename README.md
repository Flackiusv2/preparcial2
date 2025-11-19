# Travel Planner API

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
