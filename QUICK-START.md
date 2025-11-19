# Inicio Rápido - Travel Planner API

## Pasos para ejecutar

### 1. Configurar PostgreSQL
```sql
-- Crear la base de datos
CREATE DATABASE travel_planner;
```

### 2. Configurar variables de entorno
Edita el archivo `.env` con tus credenciales:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña_aqui
DB_NAME=travel_planner
```

### 3. Instalar dependencias (si no lo has hecho)
```bash
npm install
```

### 4. Ejecutar la aplicación
```bash
npm run start:dev
```

La API estará en: **http://localhost:3000**

## Verificación rápida

Prueba estos endpoints en tu navegador o Postman:

1. **Listar países**: http://localhost:3000/countries
2. **Buscar Colombia**: http://localhost:3000/countries/COL
3. **Listar planes**: http://localhost:3000/travel-plans

## Crear un plan de viaje

```bash
POST http://localhost:3000/travel-plans
Content-Type: application/json

{
  "countryCode": "COL",
  "title": "Vacaciones en Colombia",
  "startDate": "2026-01-15",
  "endDate": "2026-01-30",
  "notes": "Cartagena y Bogotá"
}
```

## Endpoints principales

- `GET /countries` - Lista países en caché
- `GET /countries/:code` - Busca país (caché o API)
- `POST /travel-plans` - Crea plan de viaje
- `GET /travel-plans` - Lista todos los planes
- `GET /travel-plans/:id` - Obtiene un plan específico

## Más información

Ver `README.md` para documentación completa.
Ver `API-TESTS.md` para colección de pruebas.
