# Notas de Compatibilidad SQL Server 2008 / 2008 R2

Este documento detalla las restricciones técnicas y soluciones implementadas en la capa de persistencia (Backend JPA / SQL) para garantizar total compatibilidad con **Microsoft SQL Server 2008 R2**.

---

## 1. Dialecto de Hibernate
En la configuración de Spring Boot (`application.yml`), se fuerza explícitamente el uso de:

```yaml
spring:
  jpa:
    database-platform: org.hibernate.dialect.SQLServer2008Dialect
    properties:
      hibernate:
        dialect: org.hibernate.dialect.SQLServer2008Dialect
```

Esto evita que Hibernate genere sentencias `OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY`, las cuales provocan sintaxis inválida en SQL Server 2008 (dicha cláusula fue introducida a partir de SQL Server 2012).

---

## 2. Paginación manual con `ROW_NUMBER() OVER (...)`
Para las consultas de repositorio personalizadas donde se requiera paginación sin utilizar el dialecto nativo de Spring Data, se debe aplicar la siguiente estructura SQL compatible:

```sql
WITH PagedTrabajadores AS (
    SELECT 
        id, empresa_id, sede_id, numero_documento, nombres, apellido_paterno, apellido_materno, cargo, sueldo_basico, activo,
        ROW_NUMBER() OVER (ORDER BY apellido_paterno ASC, nombres ASC) AS RowNum
    FROM dbo.trabajadores
    WHERE empresa_id = :empresaId AND (:sedeId IS NULL OR sede_id = :sedeId)
)
SELECT * 
FROM PagedTrabajadores
WHERE RowNum BETWEEN :startRow AND :endRow;
```

---

## 3. Tipos de Datos de Fecha y Hora
* Se evita `DATETIME2(7)` donde sea innecesario, empleando `DATETIME` estándar o `DATE` para fechas puras sin hora (disponible desde SQL Server 2008).
