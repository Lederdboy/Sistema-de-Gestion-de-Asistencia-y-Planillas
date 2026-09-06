-- ==============================================================================
-- SISTEMA DE GESTIÓN DE ASISTENCIA Y PLANILLAS (ENTERPRISE SAAS)
-- Script DDL de Creación de Tablas - Compatibilidad SQL Server 2008 / 2008 R2
-- ==============================================================================

-- 1. TABLA EMPRESAS
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[empresas]') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.empresas (
        id BIGINT IDENTITY(1,1) NOT NULL,
        ruc VARCHAR(11) NOT NULL,
        razon_social VARCHAR(150) NOT NULL,
        nombre_comercial VARCHAR(150) NULL,
        direccion VARCHAR(255) NULL,
        activo BIT NOT NULL DEFAULT 1,
        fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_empresas PRIMARY KEY CLUSTERED (id ASC),
        CONSTRAINT UQ_empresas_ruc UNIQUE (ruc)
    );
END
GO

-- 2. TABLA SEDES (Clientes Operativos / Unidades)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sedes]') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.sedes (
        id BIGINT IDENTITY(1,1) NOT NULL,
        empresa_id BIGINT NOT NULL,
        codigo VARCHAR(20) NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        direccion VARCHAR(255) NULL,
        departamento VARCHAR(50) NULL,
        provincia VARCHAR(50) NULL,
        distrito VARCHAR(50) NULL,
        activo BIT NOT NULL DEFAULT 1,
        fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_sedes PRIMARY KEY CLUSTERED (id ASC),
        CONSTRAINT FK_sedes_empresas FOREIGN KEY (empresa_id) REFERENCES dbo.empresas(id)
    );
END
GO

-- 3. TABLA TRABAJADORES (Personal)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[trabajadores]') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.trabajadores (
        id BIGINT IDENTITY(1,1) NOT NULL,
        empresa_id BIGINT NOT NULL,
        sede_id BIGINT NOT NULL,
        tipo_documento VARCHAR(10) NOT NULL DEFAULT 'DNI',
        numero_documento VARCHAR(15) NOT NULL,
        nombres VARCHAR(80) NOT NULL,
        apellido_paterno VARCHAR(80) NOT NULL,
        apellido_materno VARCHAR(80) NOT NULL,
        cargo VARCHAR(100) NOT NULL,
        fecha_ingreso DATE NOT NULL,
        sueldo_basico DECIMAL(12,2) NOT NULL,
        sueldo_diario DECIMAL(12,2) NOT NULL,
        activo BIT NOT NULL DEFAULT 1,
        fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_trabajadores PRIMARY KEY CLUSTERED (id ASC),
        CONSTRAINT UQ_trabajadores_doc UNIQUE (empresa_id, numero_documento),
        CONSTRAINT FK_trabajadores_empresas FOREIGN KEY (empresa_id) REFERENCES dbo.empresas(id),
        CONSTRAINT FK_trabajadores_sedes FOREIGN KEY (sede_id) REFERENCES dbo.sedes(id)
    );
END
GO

-- 4. TABLA CATALOGO DE TURNOS / ESTADOS DE ASISTENCIA
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[tipos_asistencia]') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.tipos_asistencia (
        codigo VARCHAR(10) NOT NULL, -- D, N, F, DL, V
        descripcion VARCHAR(50) NOT NULL,
        es_laborable BIT NOT NULL DEFAULT 1,
        es_justificado BIT NOT NULL DEFAULT 1,
        color_badge VARCHAR(50) NULL,
        CONSTRAINT PK_tipos_asistencia PRIMARY KEY CLUSTERED (codigo ASC)
    );
END
GO

-- 5. TABLA MATRIZ DE ASISTENCIA (Tareo Diario)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[asistencias_matriz]') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.asistencias_matriz (
        id BIGINT IDENTITY(1,1) NOT NULL,
        trabajador_id BIGINT NOT NULL,
        sede_id BIGINT NOT NULL,
        fecha DATE NOT NULL,
        codigo_asistencia VARCHAR(10) NOT NULL, -- D, N, F, DL, V
        observacion VARCHAR(255) NULL,
        usuario_modificacion VARCHAR(50) NULL,
        fecha_modificacion DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_asistencias_matriz PRIMARY KEY CLUSTERED (id ASC),
        CONSTRAINT UQ_asistencias_trabajador_fecha UNIQUE (trabajador_id, fecha),
        CONSTRAINT FK_asistencia_trabajador FOREIGN KEY (trabajador_id) REFERENCES dbo.trabajadores(id),
        CONSTRAINT FK_asistencia_sede FOREIGN KEY (sede_id) REFERENCES dbo.sedes(id),
        CONSTRAINT FK_asistencia_tipo FOREIGN KEY (codigo_asistencia) REFERENCES dbo.tipos_asistencia(codigo)
    );
END
GO

-- 6. TABLA PLANILLAS RESUMEN (Cabecera de Cierre de Planilla Periodico YYYYMM)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[planillas_resumen]') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.planillas_resumen (
        id BIGINT IDENTITY(1,1) NOT NULL,
        empresa_id BIGINT NOT NULL,
        periodo VARCHAR(6) NOT NULL, -- YYYYMM (Ej: 202609)
        total_trabajadores INT NOT NULL DEFAULT 0,
        total_calculados INT NOT NULL DEFAULT 0,
        total_pendientes INT NOT NULL DEFAULT 0,
        monto_total_neto DECIMAL(14,2) NOT NULL DEFAULT 0.00,
        estado VARCHAR(20) NOT NULL DEFAULT 'EN_PROCESO', -- EN_PROCESO, CERRADO
        fecha_calculo DATETIME NULL,
        fecha_cierre DATETIME NULL,
        usuario_cierre VARCHAR(50) NULL,
        CONSTRAINT PK_planillas_resumen PRIMARY KEY CLUSTERED (id ASC),
        CONSTRAINT UQ_planillas_periodo UNIQUE (empresa_id, periodo),
        CONSTRAINT FK_planillas_empresa FOREIGN KEY (empresa_id) REFERENCES dbo.empresas(id)
    );
END
GO

-- 7. TABLA PLANILLAS DETALLE (Liquidación por Colaborador)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[planillas_detalle]') AND type in (N'U'))
BEGIN
    CREATE TABLE dbo.planillas_detalle (
        id BIGINT IDENTITY(1,1) NOT NULL,
        planilla_resumen_id BIGINT NOT NULL,
        trabajador_id BIGINT NOT NULL,
        dias_trabajados INT NOT NULL DEFAULT 0,
        dias_noches INT NOT NULL DEFAULT 0,
        dias_faltas INT NOT NULL DEFAULT 0,
        dias_descanso INT NOT NULL DEFAULT 0,
        dias_vacaciones INT NOT NULL DEFAULT 0,
        sueldo_basico DECIMAL(12,2) NOT NULL,
        total_ingresos DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        total_descuentos DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        neto_pagar DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        calculado BIT NOT NULL DEFAULT 0,
        CONSTRAINT PK_planillas_detalle PRIMARY KEY CLUSTERED (id ASC),
        CONSTRAINT UQ_planillas_detalle_trabajador UNIQUE (planilla_resumen_id, trabajador_id),
        CONSTRAINT FK_planilladet_resumen FOREIGN KEY (planilla_resumen_id) REFERENCES dbo.planillas_resumen(id),
        CONSTRAINT FK_planilladet_trabajador FOREIGN KEY (trabajador_id) REFERENCES dbo.trabajadores(id)
    );
END
GO

-- INDICES PARA OPTIMIZACION DE BUSQUEDAS Y ROW_NUMBER PAGING EN SQL SERVER 2008
CREATE NONCLUSTERED INDEX IX_trabajadores_busqueda ON dbo.trabajadores(empresa_id, sede_id, activo) INCLUDE (nombres, apellido_paterno, numero_documento);
CREATE NONCLUSTERED INDEX IX_asistencias_matriz_fecha ON dbo.asistencias_matriz(sede_id, fecha) INCLUDE (trabajador_id, codigo_asistencia);
GO
