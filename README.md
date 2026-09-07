#  Sistema de Gestión de Asistencia y Planillas (Enterprise SaaS)

Plataforma corporativa multiempresa para la administración centralizada de personal, control operativo de asistencia (tareo diario), programación de turnos y cálculo de pre-planilla mensual.

---

##  1. Lineamientos de Diseño e Identidad Visual (Para Dev 1 - UI/UX)

La interfaz debe replicar la experiencia de un **SaaS Enterprise B2B**: limpia, densa en datos, minimalista y sobre fondo blanco.

### 1.1. Paleta de Colores Corporativa
* **Fondo Principal (App Background):** `#FFFFFF` (Blanco puro) y `#F8FAFC` (Slate 50 para fondos secundarios y tarjetas).
* **Bordes y Divisores:** `#E2E8F0` / `#EDF2F7` (Bordes delgados de 1px, sutiles).
* **Tipografía Empresarial:** 
  * Fuente: Inter, Public Sans o Roboto (`font-sans`).
  * Títulos: `#0F172A` (Slate 900) con peso semi-bold (`font-semibold`).
  * Textos secundarios / Labels: `#64748B` (Slate 500) en tamaño `text-xs` o `text-sm`.
* **Colores de Acento y Acciones:**
  * **Primary (Acción principal):** Azul empresarial `#2563EB` (Botones "Calcular planilla", "Guardar").
  * **Success (Operativo / Completado):** Verde esmeralda `#16A34A` / `#22C55E` (Botones Excel, estado 100%).
  * **Warning (En proceso / Pendientes):** Ámbar `#D97706` / `#F59E0B`.
  * **Danger (Cierre / Crítico):** Rojo corporativo `#DC2626` / `#991B1B` (Botón "Cerrar planilla", estados críticos).

### 1.2. Estados de Carga: Animación Skeleton (Obligatorio)
* **Queda prohibido el uso de Spinners o Loaders circulares de pantalla completa.**
* Toda tabla, tarjeta de métrica (KPI Card) o formulario debe implementar **Skeleton Loaders** parpadeantes (`animate-pulse`) con fondo gris neutro (`bg-slate-200`) mientras se resuelven las llamadas a la API REST.

### 1.3. Componentes Clave de la Interfaz
1. **Sidebar Izquierdo Fijo:** Iconos de módulos en gris tenue (`#64748B`), estado activo en azul con contenedor redondeado (`bg-blue-50 text-blue-600`), y perfil de usuario con avatar en la parte inferior.
2. **Top Bar:** Breadcrumbs de navegación, selector de fecha actual, botón de refresco asíncrono y timestamp de última actualización.
3. **Barra de Métricas (KPI Cards):** Tarjetas blancas con borde tenue, icono circular temático a la izquierda, cifra principal en grande y etiqueta de estado descriptiva.
4. **Filtros Operativos:** Inputs y Selects compactos (`h-9` o `h-10`) alineados horizontalmente (Empresa, Sede, Periodo/Mes, Búsqueda predictiva por DNI o Nombre).
5. **Matriz de Tareo (Grilla de Asistencia):**
   * Tabla densa con scroll horizontal independiente.
   * Cabecera agrupada: Días del mes (marcando en rojo/naranja fines de semana) y columnas resumen a la derecha (D, N, M, T, F, DL, etc.).
   * Badges de asistencia tipo píldora (`rounded-md text-xs font-bold`) con códigos de color unificados:
     * `D` (Día trabajado): Verde claro (`bg-emerald-100 text-emerald-700`).
     * `N` (Noche): Azul/Índigo suave (`bg-indigo-100 text-indigo-700`).
     * `F` (Falta): Rojo claro (`bg-rose-100 text-rose-700`).
     * `DL` (Descanso Ley): Celeste (`bg-sky-100 text-sky-700`).
     * `V` (Vacaciones): Naranja suave (`bg-amber-100 text-amber-700`).

---

##  2. Arquitectura de Negocio y Backend (Para Dev 2 - API REST)

El backend expone endpoints REST construidos en **Spring Boot** consumidos por la SPA en React y persistidos en **SQL Server 2008**.

### 2.1. Endpoints Base Requeridos

#### A. Módulo de Personal y Sedes
* `GET /api/v1/trabajadores?empresaId=&sedeId=&search=` (Lista paginada de colaboradores con DNI, nombres y cargo).
* `GET /api/v1/sedes` (Catálogo de sedes y clientes operativos).

#### B. Módulo de Asistencia (Tareo Diario)
* `GET /api/v1/asistencia/matriz?mes={MM}&anio={YYYY}&sedeId={ID}` (Retorna la matriz completa de días del mes con el código de turno asignado por colaborador).
* `PUT /api/v1/asistencia/marcacion` (Actualiza o justifica el estado de asistencia de un colaborador en un día específico).

#### C. Módulo de Planilla
* `GET /api/v1/planilla/resumen?periodo={YYYYMM}` (Métricas de la barra superior: total trabajadores, calculados, pendientes, total neto).
* `POST /api/v1/planilla/calcular` (Dispara el motor de liquidación sobre el tareo consolidado).
* `POST /api/v1/planilla/cerrar` (Bloquea el periodo contra modificaciones operativas).

### 2.2. Consideraciones de Base de Datos (SQL Server 2008)
* No utilizar paginación con `OFFSET / FETCH NEXT`. El repositorio debe implementar consultas basadas en `ROW_NUMBER() OVER (...)` o el dialecto formal `SQLServer2008Dialect`.
* Todas las transacciones de cálculo masivo deben estar protegidas con `@Transactional(rollbackFor = Exception.class)`.

---

##  3. Flujo de Trabajo Gitflow (Reglas de Desarrollo)

Todos los desarrolladores deben respetar las ramas y la política de integración:

* **Rama base:** `develop` (Toda rama nace y muere hacia `develop`).
* **Dev 1 (Frontend):**
  ```bash
  git checkout develop
  git pull origin develop
  git checkout -b feature/ui
  # Trabaja en /frontend
  # Push a origin feature/ui y apertura de PR hacia develop
  ```

---

## 🔐 4. Configuración Segura de Base de Datos (Para Desarrolladores)

Por motivos de seguridad, las credenciales reales del servidor de base de datos **no están incluidas en el repositorio**.

Para conectar la aplicación con la base de datos SQL Server, sigue cualquiera de estas dos opciones:

### Opción A: Archivo `application-local.properties` (Recomendada)
1. Ve a la carpeta `backend/src/main/resources/`.
2. Crea un archivo llamado `application-local.properties` (este archivo está ignorado por Git y nunca se subirá).
3. Pega la configuración con las credenciales que te proporcionará el administrador:
   ```properties
   spring.datasource.url=jdbc:sqlserver://IP_DEL_SERVIDOR:1433;databaseName=SistemaPlanillasDB;encrypt=false;trustServerCertificate=true
   spring.datasource.username=TU_USUARIO
   spring.datasource.password=TU_PASSWORD
   ```

### Opción B: Variables de Entorno
Puedes exportar las siguientes variables en tu sistema o IDE:
* `SPRING_DATASOURCE_URL`
* `SPRING_DATASOURCE_USERNAME`
* `SPRING_DATASOURCE_PASSWORD`