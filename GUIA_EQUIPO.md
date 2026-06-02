# Guía de desarrollo — Taller Alfaro DSI

## Requisitos previos

Antes de arrancar asegurate de tener instalado:
- Java 17
- IntelliJ IDEA
- Node.js v20.19+
- PostgreSQL
- pgAdmin
- Git
- Insomnia o Postman

---

## Clonar el proyecto

```bash
git clone https://github.com/tu-usuario/taller-alfaro-backend.git
cd taller-alfaro-backend
```

### Crear tu application.properties

El archivo `application.properties` no está en el repositorio por seguridad.
Creás el archivo en `src/main/resources/application.properties` con esto:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/taller_db
spring.datasource.username=postgres
spring.datasource.password=TU_CONTRASEÑA
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

server.port=8080

jwt.secret=tallerAlfaroSecretKey2026DSIProyecto
jwt.expiration=86400000
```

### Crear la base de datos en pgAdmin

```sql
CREATE DATABASE taller_db;
```

### Arrancar el proyecto

Click en el botón **Run** en IntelliJ o `Shift + F10`.

Al arrancar por primera vez se crea automáticamente el usuario administrador:
- **username:** admin
- **password:** admin123

---

## Estructura del proyecto

```
com.taller
├── auth          → login y JWT
├── cobros        → módulo de cobros (HU-17, HU-19, HU-22)
├── cierres       → módulo de cierres (HU-20, HU-21)
├── reportes      → módulo de reportes (HU-23, HU-24, HU-25, HU-26)
├── ordenes       → gestión de órdenes
├── model         → entidades JPA (tablas de la BD)
├── dto           → objetos de transferencia de datos
├── config        → configuración de seguridad
└── exception     → manejo de errores
```

---

## Cómo desarrollar tu módulo

Seguís este orden para cada funcionalidad. No te saltés pasos.

### Paso 1 — Entender la HU que te tocó

Leé los criterios de aceptación de tu Historia de Usuario antes de escribir
cualquier código. Cada criterio es una validación que tu código debe cumplir.

Ejemplo HU-17:
- Solo cobrar ordenes en estado FINALIZADO → validación en el Service
- Calcular cambio automáticamente → lógica en el Service
- No aceptar monto menor al total → validación en el Service
- Cambiar estado a ENTREGADO al confirmar → lógica en el Service

### Paso 2 — Crear el Repository (si no existe)

El Repository es la interfaz que se comunica con la base de datos.
Va dentro del paquete de tu módulo.

```java
@Repository
public interface MiRepository extends JpaRepository<MiEntidad, Long> {
    // Métodos de consulta según necesites
    List<MiEntidad> findByFecha(LocalDate fecha);
}
```

### Paso 3 — Crear el Service

El Service contiene toda la lógica de negocio. Las validaciones van aquí,
nunca en el Controller.

```java
@Service
@RequiredArgsConstructor
public class MiService {

    private final MiRepository miRepository;

    public MiEntidad miMetodo(parametros) {
        // 1. Validaciones
        // 2. Lógica de negocio
        // 3. Guardar y retornar
    }
}
```

Reglas del Service:
- Todas las validaciones de las HU van aquí
- Lanzás excepciones del paquete `com.taller.exception` cuando algo falla
- Nunca retornás entidades JPA directamente, convertís a DTO antes

### Paso 4 — Crear el DTO

El DTO es el objeto que enviás al frontend. Solo incluye los campos
que el frontend necesita, nunca expongas contraseñas ni datos sensibles.

```java
@Data
public class MiDTO {
    private Long id;
    private String campo1;
    private String campo2;
}
```

### Paso 5 — Crear el Controller

El Controller expone los endpoints REST. Solo recibe la petición,
llama al Service y devuelve la respuesta. Sin lógica de negocio aquí.

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

### Paso 6 — Probar en Insomnia

Antes de tocar el frontend probás todos tus endpoints en Insomnia.

**Obtener el token:**
```
POST http://localhost:8080/api/auth/login
Body JSON:
{
  "username": "admin",
  "password": "admin123"
}
```

**Usar el token en tus requests:**
En Insomnia → pestaña Auth → Bearer Token → pegás el token.

Probás cada caso de éxito y cada caso de error de tus HU antes de continuar.

### Paso 7 — Crear las páginas en React

Solo arrancás el frontend cuando los endpoints ya funcionan correctamente.

```bash
cd taller-frontend
npm run dev
```

El frontend corre en `http://localhost:5173`.

**Orden de creación en React:**

1. Creás el servicio en `src/services/miModuloService.js`

```javascript
import axiosInstance from '../api/axiosInstance';

export const getMisDatos = () => axiosInstance.get('/mi-modulo');
export const crearDato = (data) => axiosInstance.post('/mi-modulo', data);
```

2. Creás la página en `src/pages/mi-modulo/MiPagina.jsx`

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

3. Registrás la ruta en `src/router/AppRouter.jsx`

---

## Endpoints disponibles en la base

Estos endpoints ya están implementados y podés usarlos:

| Método | URL | Descripción |
|--------|-----|-------------|
| POST | /api/auth/login | Login, devuelve JWT |
| POST | /api/cobros/registrar/{idOrden} | Registrar cobro |
| GET | /api/cobros/arqueo | Arqueo del día |
| GET | /api/reportes/diario?fecha= | Reporte diario |
| GET | /api/reportes/mensual?mes=&anio= | Reporte mensual |

---

## Manejo de errores

Cuando algo falla el sistema devuelve siempre este formato:

```json
{
  "status": 400,
  "mensaje": "Descripción del error",
  "timestamp": "2026-06-02T..."
}
```

En el frontend manejás los errores así:

```javascript
try {
  const res = await registrarCobro(idOrden, monto);
  // éxito
} catch (error) {
  const mensaje = error.response?.data?.mensaje || 'Error inesperado';
  // mostrar mensaje al usuario
}
```

---

## Flujo de trabajo con Git

### Estructura de ramas

```
main        ← solo cuando el sistema esté completamente terminado
└── develop ← rama principal de desarrollo, de aquí parten todas las ramas
    ├── feature/cobros
    ├── feature/cierres
    ├── feature/reportes
    └── feature/auth
```

Nunca trabajés directamente en `main` ni en `develop`.
Cada integrante trabaja en su propia rama `feature/`.

---

### Primera vez — clonar el proyecto

```bash
git clone https://github.com/tu-usuario/Taller-Alfaro-DSI.git
cd Taller-Alfaro-DSI
git checkout develop
```

---

### Crear tu rama de trabajo

Siempre creás tu rama partiendo desde `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/nombre-de-tu-modulo
```

Ejemplos de nombres de rama:
- `feature/cobros`
- `feature/cierres`
- `feature/reportes`
- `feature/historial`

---

### Guardar y subir tus cambios

Cada vez que terminás algo que funciona lo guardás y subís:

```bash
git add .
git commit -m "descripción clara de lo que hiciste"
git push origin feature/nombre-de-tu-modulo
```

Ejemplos de mensajes de commit:
- `agrego CobrosController con endpoint registrar cobro`
- `implemento validacion de orden en estado FINALIZADO`
- `agrego pagina de arqueo de caja en React`

---

### Bajar cambios de develop a tu rama

Cuando otro integrante termina su parte y lo mergea a `develop`,
vos necesitás traer esos cambios a tu rama para no quedarte desactualizado.
Hacés esto regularmente, mínimo una vez al día:

```bash
git checkout develop
git pull origin develop
git checkout feature/nombre-de-tu-modulo
git merge develop
```

Si hay conflictos IntelliJ te muestra un editor visual para resolverlos.
Resolvés los conflictos, guardás y hacés un commit:

```bash
git add .
git commit -m "merge con develop"
```

---

### Cuando terminás tu módulo — Pull Request

Cuando tu módulo está completo y probado en Insomnia:

1. Subís todos tus cambios:
```bash
git add .
git commit -m "modulo cobros completo"
git push origin feature/nombre-de-tu-modulo
```

2. Entrás a GitHub → tu repositorio
3. Click en **Compare & pull request**
4. Base: `develop` ← Compare: `feature/tu-rama`
5. Escribís una descripción de lo que implementaste
6. Click en **Create pull request**
7. Avisás al equipo para que revisen y aprueben el merge

---

### Comandos útiles del día a día

```bash
# Ver en qué rama estás
git branch

# Ver el estado de tus archivos
git status

# Ver el historial de commits
git log --oneline

# Descartar cambios en un archivo (cuidado, no se puede deshacer)
git checkout -- nombre-del-archivo

# Ver diferencias antes de hacer commit
git diff
```

---

## Módulos por implementar

| Módulo | HUs | Endpoints necesarios |
|--------|-----|----------------------|
| Cobros | HU-17, HU-19, HU-22 | POST /cobros/registrar, GET /cobros/arqueo, GET /cobros/historial |
| Cierres | HU-20, HU-21 | POST /cierres/diario, POST /cierres/mensual |
| Reportes | HU-23, HU-24, HU-25, HU-26 | GET /reportes/diario, GET /reportes/mensual, GET /reportes/ranking, GET /reportes/pdf |

---

## Contacto

Cualquier duda sobre la base del proyecto consultá con el integrante
que configuró el proyecto inicial antes de modificar archivos compartidos
como SecurityConfig, GlobalExceptionHandler o las entidades en model/.
