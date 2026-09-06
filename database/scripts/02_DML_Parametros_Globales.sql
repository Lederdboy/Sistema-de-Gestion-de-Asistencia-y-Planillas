-- ==============================================================================
-- SISTEMA DE GESTIÓN DE ASISTENCIA Y PLANILLAS (ENTERPRISE SAAS)
-- Script DML - Poblado Inicial / Semilla de Datos y Parámetros Globales
-- ==============================================================================

-- 1. TIPOS DE ASISTENCIA (Codificación de Badges para Frontend)
IF NOT EXISTS (SELECT 1 FROM dbo.tipos_asistencia WHERE codigo = 'D')
    INSERT INTO dbo.tipos_asistencia (codigo, descripcion, es_laborable, es_justificado, color_badge) 
    VALUES ('D', 'Día Trabajado (Turno Día)', 1, 1, 'bg-emerald-100 text-emerald-700');

IF NOT EXISTS (SELECT 1 FROM dbo.tipos_asistencia WHERE codigo = 'N')
    INSERT INTO dbo.tipos_asistencia (codigo, descripcion, es_laborable, es_justificado, color_badge) 
    VALUES ('N', 'Día Trabajado (Turno Noche)', 1, 1, 'bg-indigo-100 text-indigo-700');

IF NOT EXISTS (SELECT 1 FROM dbo.tipos_asistencia WHERE codigo = 'F')
    INSERT INTO dbo.tipos_asistencia (codigo, descripcion, es_laborable, es_justificado, color_badge) 
    VALUES ('F', 'Falta Injustificada', 0, 0, 'bg-rose-100 text-rose-700');

IF NOT EXISTS (SELECT 1 FROM dbo.tipos_asistencia WHERE codigo = 'DL')
    INSERT INTO dbo.tipos_asistencia (codigo, descripcion, es_laborable, es_justificado, color_badge) 
    VALUES ('DL', 'Descanso Ley / Semanal', 0, 1, 'bg-sky-100 text-sky-700');

IF NOT EXISTS (SELECT 1 FROM dbo.tipos_asistencia WHERE codigo = 'V')
    INSERT INTO dbo.tipos_asistencia (codigo, descripcion, es_laborable, es_justificado, color_badge) 
    VALUES ('V', 'Vacaciones Programadas', 0, 1, 'bg-amber-100 text-amber-700');
GO

-- 2. EMPRESA SEMILLA
IF NOT EXISTS (SELECT 1 FROM dbo.empresas WHERE ruc = '20100088899')
BEGIN
    INSERT INTO dbo.empresas (ruc, razon_social, nombre_comercial, direccion)
    VALUES ('20100088899', 'SERVICIOS CORPORATIVOS DE ASISTENCIA S.A.C.', 'CORP ASISTENCIA', 'Av. Javier Prado Este 456, San Isidro, Lima');
END
GO

-- 3. SEDES SEMILLA (Clientes Operativos)
DECLARE @EmpresaId BIGINT;
SELECT TOP 1 @EmpresaId = id FROM dbo.empresas WHERE ruc = '20100088899';

IF @EmpresaId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.sedes WHERE codigo = 'SED-001')
        INSERT INTO dbo.sedes (empresa_id, codigo, nombre, direccion, departamento, provincia, distrito)
        VALUES (@EmpresaId, 'SED-001', 'Sede Central - San Isidro', 'Av. Javier Prado 456', 'Lima', 'Lima', 'San Isidro');

    IF NOT EXISTS (SELECT 1 FROM dbo.sedes WHERE codigo = 'SED-002')
        INSERT INTO dbo.sedes (empresa_id, codigo, nombre, direccion, departamento, provincia, distrito)
        VALUES (@EmpresaId, 'SED-002', 'Planta Operativa - Lurín', 'Km 29.5 Panamericana Sur', 'Lima', 'Lima', 'Lurín');

    IF NOT EXISTS (SELECT 1 FROM dbo.sedes WHERE codigo = 'SED-003')
        INSERT INTO dbo.sedes (empresa_id, codigo, nombre, direccion, departamento, provincia, distrito)
        VALUES (@EmpresaId, 'SED-003', 'Almacén Principal - Callao', 'Av. Néstor Gambetta 1200', 'Callao', 'Callao', 'Callao');
END
GO

-- 4. TRABAJADORES DEMO
DECLARE @EmpresaId2 BIGINT;
DECLARE @SedeId1 BIGINT, @SedeId2 BIGINT;

SELECT TOP 1 @EmpresaId2 = id FROM dbo.empresas WHERE ruc = '20100088899';
SELECT TOP 1 @SedeId1 = id FROM dbo.sedes WHERE codigo = 'SED-001';
SELECT TOP 1 @SedeId2 = id FROM dbo.sedes WHERE codigo = 'SED-002';

IF @EmpresaId2 IS NOT NULL AND @SedeId1 IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.trabajadores WHERE numero_documento = '45891234')
        INSERT INTO dbo.trabajadores (empresa_id, sede_id, numero_documento, nombres, apellido_paterno, apellido_materno, cargo, fecha_ingreso, sueldo_basico, sueldo_diario)
        VALUES (@EmpresaId2, @SedeId1, '45891234', 'Juan Carlos', 'Pérez', 'Gómez', 'Analista de Planillas', '2022-03-15', 3500.00, 116.67);

    IF NOT EXISTS (SELECT 1 FROM dbo.trabajadores WHERE numero_documento = '71234567')
        INSERT INTO dbo.trabajadores (empresa_id, sede_id, numero_documento, nombres, apellido_paterno, apellido_materno, cargo, fecha_ingreso, sueldo_basico, sueldo_diario)
        VALUES (@EmpresaId2, @SedeId1, '71234567', 'Maria Elena', 'Torres', 'Rojas', 'Supervisora de Operaciones', '2021-06-01', 4200.00, 140.00);

    IF NOT EXISTS (SELECT 1 FROM dbo.trabajadores WHERE numero_documento = '40987654')
        INSERT INTO dbo.trabajadores (empresa_id, sede_id, numero_documento, nombres, apellido_paterno, apellido_materno, cargo, fecha_ingreso, sueldo_basico, sueldo_diario)
        VALUES (@EmpresaId2, @SedeId2, '40987654', 'Carlos Alberto', 'Mendoza', 'Vargas', 'Operario de Almacén', '2023-01-10', 1800.00, 60.00);
END
GO
