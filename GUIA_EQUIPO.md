# Guía de desarrollo — Taller Alfaro DSI

## Requisitos previos

Instalá estas herramientas antes de arrancar:

| Herramienta | Versión |
|-------------|---------|
| Java | 17 |
| IntelliJ IDEA | Cualquier versión reciente |
| Node.js | v20.19 o superior |
| PostgreSQL | Cualquier versión reciente |
| pgAdmin | Cualquier versión reciente |
| Git | Cualquier versión reciente |
| Insomnia | Cualquier versión reciente |

---

## Paso 1 — Clonar el proyecto

```bash
git clone https://github.com/gabymcanales/Taller-Alfaro-DSI
cd Taller-Alfaro-DSI
git checkout develop
```

---

## Paso 2 — Configurar la base de datos

Abrís pgAdmin y ejecutás:

```sql
CREATE DATABASE taller_db;
```

---

## Paso 3 — Crear application.properties

Este archivo NO está en el repositorio por seguridad. Cada integrante crea el suyo.

Creás el archivo en `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/taller_alfaro
spring.datasource.username=postgres
spring.datasource.password=TU_CONTRASEÑA_POSTGRES
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

server.port=8080

jwt.secret=tallerAlfaroSecretKey2026DSIProyecto
jwt.expiration=86400000
```

---

## Paso 4 — Arrancar el proyecto

Click en **Run** en IntelliJ o presionás `Shift + F10`.

Al arrancar por primera vez se crea automáticamente el administrador:
- **username:** admin
- **password:** admin123

---

## Paso 5 — Crear tu rama de trabajo

Las ramas se nombran con tu **carnet de estudiante**.

```bash
git checkout develop
git pull origin develop
git checkout -b tuCarnet
git push -u origin tuCarnet
```

Ejemplo: si tu carnet es `MC221045` tu rama se llama `MC221045`.

---

## Estructura de ramas

```
main        ← NO tocar, solo al finalizar el sistema
└── develop ← base de desarrollo, de aquí parten todas las ramas
    ├── MC221045   ← rama integrante 1
    ├── MC221046   ← rama integrante 2
    └── MC221047   ← rama integrante 3
```

---

## Cómo desarrollar tu módulo

Seguí este orden. No te saltés pasos.

### 1 — Leé tu HU antes de escribir código

Cada criterio de aceptación es una validación que tu código debe cumplir.

Ejemplo HU-17 — Registro de pago en efectivo:
- Solo cobrar órdenes en estado `FINALIZADO` → validación en el Service
- Calcular cambio automáticamente → lógica en el Service
- No aceptar monto menor al total → validación en el Service
- Cambiar estado a `ENTREGADO` al confirmar → lógica en el Service

### 2 — Crea el Repository

Va dentro del paquete de tu módulo. Es la interfaz que consulta la base de datos.

```java
@Repository
public interface MiRepository extends JpaRepository<MiEntidad, Long> {
    List<MiEntidad> findByFecha(LocalDate fecha);
}
```

### 3 — Crea el Service

Toda la lógica de negocio y validaciones van aquí. Nunca en el Controller.

```java
@Service
@RequiredArgsConstructor
public class MiService {

    private final MiRepository miRepository;

    public MiDTO miMetodo(parametros) {
        // 1. Validar
        // 2. Lógica de negocio
        // 3. Guardar y retornar DTO
    }
}
```

> Usá siempre las excepciones de `com.taller.exception` cuando algo falla.
> Nunca retornés la entidad JPA directamente, convertila a DTO primero.

### 4 — Crea el DTO

Solo incluí los campos que el frontend necesita. Nunca expongas contraseñas.

```java
@Data
public class MiDTO {
    private Long id;
    private String campo1;
    private String campo2;
}
```

### 5 — Crea el Controller

Solo recibe la petición, llama al Service y devuelve la respuesta. Sin lógica aquí.

```java
@RestController
@RequestMapping("/api/mi-modulo")
@RequiredArgsConstructor
public class MiController {

    private final MiService miService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(miService.getAll());
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody MiDTO dto) {
        return ResponseEntity.ok(miService.crear(dto));
    }
}
```

### 6 — Probá en Insomnia

Probá todos tus endpoints antes de tocar el frontend.

**Obtener el token:**
```
POST http://localhost:8080/api/auth/login
Body JSON:
{
  "username": "admin",
  "password": "admin123"
}
```

**Usar el token:**
Insomnia → pestaña **Auth** → **Bearer Token** → pegás el token.

Probá cada caso de éxito y cada caso de error de tus HU.

### 7 — Crea las páginas en React

Solo arrancás el frontend cuando los endpoints funcionan correctamente.

```bash
cd taller-frontend
npm install
npm run dev
```

El frontend corre en `http://localhost:5173`.

**Orden en React:**

**1. Servicio** en `src/services/miModuloService.js`
```javascript
import axiosInstance from '../api/axiosInstance';

export const getMisDatos = () => axiosInstance.get('/mi-modulo');
export const crearDato = (data) => axiosInstance.post('/mi-modulo', data);
```

**2. Página** en `src/pages/mi-modulo/MiPagina.jsx`
```jsx
import { useState, useEffect } from 'react';
import { getMisDatos } from '../../services/miModuloService';

const MiPagina = () => {
  const [datos, setDatos] = useState([]);

  useEffect(() => {
    getMisDatos().then(res => setDatos(res.data));
  }, []);

  return (
    <div>
      {/* Tu UI aquí */}
    </div>
  );
};

export default MiPagina;
```

**3. Ruta** en `src/router/AppRouter.jsx`

---

## Flujo diario con Git

### Guardar y subir tus cambios

Hacé esto cada vez que terminás algo que funciona:

```bash
git add .
git commit -m "descripción de lo que hiciste"
git push origin tuCarnet
```

Ejemplos de mensajes de commit:
- `agrego endpoint registrar cobro`
- `implemento validacion orden FINALIZADO`
- `agrego pagina arqueo de caja`

---

### Bajar cambios de develop a tu rama

Hacé esto mínimo una vez al día para no quedarte desactualizado:

```bash
git checkout develop
git pull origin develop
git checkout tuCarnet
git merge develop
```

Si hay conflictos, IntelliJ los muestra visualmente. Resolvelos y luego:

```bash
git add .
git commit -m "merge con develop"
```

---

### Cuando terminás tu módulo — Pull Request

```bash
git add .
git commit -m "modulo X completo"
git push origin tuCarnet
```

Luego en GitHub:
1. Click en **Compare & pull request**
2. Base: `develop` ← Compare: `tuCarnet`
3. Describís lo que implementaste
4. Click en **Create pull request**
5. Avisás al equipo para que aprueben el merge

---

### Comandos útiles

```bash
git branch              # ver en qué rama estás
git status              # ver archivos modificados
git log --oneline       # ver historial de commits
git diff                # ver cambios antes de hacer commit
```

---

## Endpoints disponibles en la base

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | /api/auth/login | Login, devuelve JWT |
| POST | /api/cobros/registrar/{idOrden} | Registrar cobro |
| GET | /api/cobros/arqueo | Arqueo del día |
| GET | /api/reportes/diario?fecha= | Reporte diario |
| GET | /api/reportes/mensual?mes=&anio= | Reporte mensual |

---

## Módulos por implementar

| Módulo | HUs | Endpoints a crear |
|--------|-----|-------------------|
| Cobros | HU-17, HU-19, HU-22 | POST /cobros/registrar, GET /cobros/arqueo, GET /cobros/historial |
| Cierres | HU-20, HU-21 | POST /cierres/diario, POST /cierres/mensual |
| Reportes | HU-23, HU-24, HU-25, HU-26 | GET /reportes/diario, GET /reportes/mensual, GET /reportes/ranking, GET /reportes/pdf |

---

## Estructura del proyecto

```
com.taller
├── auth          → login y JWT
├── cobros        → HU-17, HU-19, HU-22
├── cierres       → HU-20, HU-21
├── reportes      → HU-23, HU-24, HU-25, HU-26
├── ordenes       → gestión de órdenes
├── model         → entidades JPA (tablas de la BD)
├── dto           → objetos de transferencia de datos
├── config        → configuración de seguridad
└── exception     → manejo de errores
```

---

## Manejo de errores

Cuando algo falla el sistema devuelve siempre:

```json
{
  "status": 400,
  "mensaje": "Descripción del error",
  "timestamp": "2026-06-02T..."
}
```

En React manejás los errores así:

```javascript
try {
  const res = await registrarCobro(idOrden, monto);
} catch (error) {
  const mensaje = error.response?.data?.mensaje || 'Error inesperado';
  // mostrás el mensaje al usuario
}
```

---

## Archivos que NO debés modificar sin avisar al equipo

- `SecurityConfig.java`
- `GlobalExceptionHandler.java`
- Cualquier entidad en `model/`
- `TallerAlfaroApplication.java`

Cualquier duda consultá con el integrante que configuró la base del proyecto.
