Backend — Sistema de Gestión de Asistencia y Planillas

API REST construida en Spring Boot, consumida por la SPA en React y persistida en SQL Server 2008. Este módulo maneja la lógica de negocio de personal, asistencia (tareo diario) y cálculo de planillas.

Requisitos
Java 11+ (o la versión especificada en pom.xml)
Maven 3.6+
SQL Server 2008 (o superior, compatible con el dialecto configurado)
Variables de entorno / application.properties configuradas con la conexión a base de datos
Configuración inicial
Clona el repositorio y ubícate en la carpeta backend/.
Copia el archivo de configuración de ejemplo (si existe application.properties.example o .env.example) y complétalo con tus credenciales locales de base de datos.
Instala las dependencias:
bash
   mvn clean install
Levanta la aplicación:
bash
   mvn spring-boot:run

La API quedará disponible por defecto en http://localhost:8080.

Arquitectura y consideraciones técnicas
Base de datos (SQL Server 2008)
No usar paginación con OFFSET / FETCH NEXT (no soportada en esta versión de SQL Server). Los repositorios deben implementar paginación mediante ROW_NUMBER() OVER (...) o el dialecto formal SQLServer2008Dialect.
Toda transacción de cálculo masivo (por ejemplo, el motor de liquidación de planilla) debe estar protegida con:
java
  @Transactional(rollbackFor = Exception.class)
Endpoints principales
Módulo de Personal y Sedes
Método	Endpoint	Descripción
GET	/api/v1/trabajadores?empresaId=&sedeId=&search=	Lista paginada de colaboradores (DNI, nombres, cargo)
GET	/api/v1/sedes	Catálogo de sedes y clientes operativos
Módulo de Asistencia (Tareo Diario)
Método	Endpoint	Descripción
GET	/api/v1/asistencia/matriz?mes={MM}&anio={YYYY}&sedeId={ID}	Matriz completa de días del mes con el código de turno por colaborador
PUT	/api/v1/asistencia/marcacion	Actualiza o justifica el estado de asistencia de un colaborador en un día específico
Módulo de Planilla
Método	Endpoint	Descripción
GET	/api/v1/planilla/resumen?periodo={YYYYMM}	Métricas resumen: total trabajadores, calculados, pendientes, total neto
POST	/api/v1/planilla/calcular	Dispara el motor de liquidación sobre el tareo consolidado
POST	/api/v1/planilla/cerrar	Bloquea el periodo contra modificaciones operativas
Flujo de trabajo (Gitflow)

Rama base: develop. Toda rama nace y muere hacia develop.

Flujo para el desarrollador de Backend:

bash
git checkout develop
git pull origin develop
git checkout -b feature/api-<nombre-del-cambio>

# Trabaja dentro de /backend

git add .
git commit -m "Descripción breve del cambio"
git push -u origin feature/api-<nombre-del-cambio>
# Abrir Pull Request hacia develop
Estructura sugerida
backend/
├── src/
│   ├── main/
│   │   ├── java/...        # Código fuente (controllers, services, repositories)
│   │   └── resources/      # application.properties, migraciones, etc.
│   └── test/                # Pruebas unitarias e integración
├── target/                  # Generado por Maven (ignorado en Git)
└── pom.xml

Nota: las carpetas target/ y los archivos *.jar están excluidos del control de versiones (ver .gitignore en la raíz del proyecto). No editar contenido dentro de target/ manualmente.
