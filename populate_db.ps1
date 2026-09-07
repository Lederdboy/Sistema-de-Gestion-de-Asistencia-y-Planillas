param(
    [string]$Server = ($env:DB_SERVER ? $env:DB_SERVER : "localhost"),
    [string]$Database = ($env:DB_NAME ? $env:DB_NAME : "SistemaPlanillasDB"),
    [string]$User = ($env:DB_USER ? $env:DB_USER : "sa"),
    [string]$Password = ($env:DB_PASSWORD ? $env:DB_PASSWORD : "")
)

$connStr = "Server=$Server;Database=$Database;User Id=$User;Password=$Password;Encrypt=False;TrustServerCertificate=True"
$conn = New-Object System.Data.SqlClient.SqlConnection($connStr)


try {
    $conn.Open()
    Write-Output "Conectado a SistemaPlanillasDB. Iniciando poblado..."

    $empresaId = 1

    # 1. Asegurar Tipos de Asistencia
    $tiposSql = @"
IF NOT EXISTS (SELECT 1 FROM tipos_asistencia WHERE codigo = 'D')
    INSERT INTO tipos_asistencia (codigo, descripcion, es_laborable, es_justificado, color_badge) VALUES ('D', 'Día', 1, 1, 'bg-emerald-100 text-emerald-700');
IF NOT EXISTS (SELECT 1 FROM tipos_asistencia WHERE codigo = 'N')
    INSERT INTO tipos_asistencia (codigo, descripcion, es_laborable, es_justificado, color_badge) VALUES ('N', 'Noche', 1, 1, 'bg-indigo-100 text-indigo-700');
IF NOT EXISTS (SELECT 1 FROM tipos_asistencia WHERE codigo = 'F')
    INSERT INTO tipos_asistencia (codigo, descripcion, es_laborable, es_justificado, color_badge) VALUES ('F', 'Falta', 0, 0, 'bg-rose-100 text-rose-700');
IF NOT EXISTS (SELECT 1 FROM tipos_asistencia WHERE codigo = 'DL')
    INSERT INTO tipos_asistencia (codigo, descripcion, es_laborable, es_justificado, color_badge) VALUES ('DL', 'Desc. Ley', 0, 1, 'bg-sky-100 text-sky-700');
IF NOT EXISTS (SELECT 1 FROM tipos_asistencia WHERE codigo = 'V')
    INSERT INTO tipos_asistencia (codigo, descripcion, es_laborable, es_justificado, color_badge) VALUES ('V', 'Vacaciones', 0, 1, 'bg-amber-100 text-amber-700');
"@
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = $tiposSql
    $cmd.ExecuteNonQuery() | Out-Null
    Write-Output "[OK] Tipos de asistencia verificados."

    # 2. Insertar Sedes adicionales
    $sedesSql = @"
IF NOT EXISTS (SELECT 1 FROM sedes WHERE codigo = 'SED-004')
    INSERT INTO sedes (empresa_id, codigo, nombre, direccion, departamento, provincia, distrito, activo)
    VALUES ($empresaId, 'SED-004', 'Sede Arequipa - Parque Industrial', 'Av. Variante de Uchumayo Km 3.5', 'Arequipa', 'Arequipa', 'Cerro Colorado', 1);

IF NOT EXISTS (SELECT 1 FROM sedes WHERE codigo = 'SED-005')
    INSERT INTO sedes (empresa_id, codigo, nombre, direccion, departamento, provincia, distrito, activo)
    VALUES ($empresaId, 'SED-005', 'Sede Cusco - Mina Antapaccay', 'Campamento Minero Yauri Km 12', 'Cusco', 'Espinar', 'Yauri', 1);

IF NOT EXISTS (SELECT 1 FROM sedes WHERE codigo = 'SED-006')
    INSERT INTO sedes (empresa_id, codigo, nombre, direccion, departamento, provincia, distrito, activo)
    VALUES ($empresaId, 'SED-006', 'Sede Trujillo - Zona Franca', 'Parque Industrial Mz. C Lote 4', 'La Libertad', 'Trujillo', 'La Esperanza', 1);
"@
    $cmd.CommandText = $sedesSql
    $cmd.ExecuteNonQuery() | Out-Null
    Write-Output "[OK] Sedes operativas verificadas e insertadas."

    # Obtener IDs de sedes
    $cmd.CommandText = "SELECT codigo, id FROM sedes"
    $r = $cmd.ExecuteReader()
    $sedeMap = @{}
    while ($r.Read()) {
        $sedeMap[$r["codigo"]] = $r["id"]
    }
    $r.Close()

    # 3. Lista de Trabajadores a Insertar
    $trabajadores = @(
        @{ dni="45123890"; nom="Carlos A."; apPat="García"; apMat="Ríos"; cargo="Operario de Planta"; sueldo=1450.00; sede="SED-001"; fecha="2022-03-15" },
        @{ dni="72345612"; nom="Rosa L."; apPat="Mamani"; apMat="Quispe"; cargo="Supervisora de Calidad"; sueldo=2800.00; sede="SED-001"; fecha="2021-06-01" },
        @{ dni="61987234"; nom="Luis M."; apPat="Torres"; apMat="Vega"; cargo="Técnico Electromecánico"; sueldo=2100.00; sede="SED-004"; fecha="2023-01-10" },
        @{ dni="48765432"; nom="Ana P."; apPat="Flores"; apMat="Huanca"; cargo="Operaria de Ensamblaje"; sueldo=1350.00; sede="SED-004"; fecha="2023-08-20" },
        @{ dni="55432198"; nom="Juan C."; apPat="Condori"; apMat="Puma"; cargo="Almacenero Principal"; sueldo=1600.00; sede="SED-005"; fecha="2022-11-05" },
        @{ dni="43998811"; nom="Patricia E."; apPat="Mendoza"; apMat="Vargas"; cargo="Analista de RRHH"; sueldo=3200.00; sede="SED-001"; fecha="2020-04-15" },
        @{ dni="70889922"; nom="Raúl J."; apPat="Paredes"; apMat="Castro"; cargo="Jefe de Operaciones"; sueldo=4500.00; sede="SED-006"; fecha="2019-09-01" },
        @{ dni="46112233"; nom="Miguel Ángel"; apPat="Quispe"; apMat="Huamán"; cargo="Operario de Soldadura"; sueldo=1950.00; sede="SED-002"; fecha="2023-02-14" },
        @{ dni="73221144"; nom="Carmen Rosa"; apPat="Salazar"; apMat="Peña"; cargo="Asistente de Logística"; sueldo=1700.00; sede="SED-003"; fecha="2022-07-01" },
        @{ dni="41556677"; nom="Jorge Luis"; apPat="Chávez"; apMat="Benites"; cargo="Mecánico de Mantenimiento"; sueldo=2300.00; sede="SED-002"; fecha="2021-10-20" },
        @{ dni="75889900"; nom="Diana Beatriz"; apPat="Ramos"; apMat="Alarcón"; cargo="Inspectora de Seguridad"; sueldo=2600.00; sede="SED-005"; fecha="2023-05-11" },
        @{ dni="44332211"; nom="Fernando José"; apPat="Castillo"; apMat="Silva"; cargo="Conductor de Carga Pesada"; sueldo=2400.00; sede="SED-003"; fecha="2020-12-03" },
        @{ dni="72114455"; nom="Lucía Fernanda"; apPat="Morales"; apMat="Rivas"; cargo="Coordinadora de Almacén"; sueldo=3100.00; sede="SED-006"; fecha="2022-01-18" }
    )

    foreach ($t in $trabajadores) {
        $sedeId = $sedeMap[$t.sede]
        if (-not $sedeId) { $sedeId = 1 }
        $sueldoDiario = [Math]::Round($t.sueldo / 30, 2)
        $insTrab = @"
IF NOT EXISTS (SELECT 1 FROM trabajadores WHERE numero_documento = '$($t.dni)')
BEGIN
    INSERT INTO trabajadores (empresa_id, sede_id, tipo_documento, numero_documento, nombres, apellido_paterno, apellido_materno, cargo, fecha_ingreso, sueldo_basico, sueldo_diario, activo)
    VALUES ($empresaId, $sedeId, 'DNI', '$($t.dni)', '$($t.nom)', '$($t.apPat)', '$($t.apMat)', '$($t.cargo)', '$($t.fecha)', $($t.sueldo), $sueldoDiario, 1);
END
"@
        $cmd.CommandText = $insTrab
        $cmd.ExecuteNonQuery() | Out-Null
    }
    Write-Output "[OK] Trabajadores registrados y vinculados a sus sedes."

    # 4. Insertar Tareo Diario hasta el día de hoy (1 al 7 de septiembre de 2026)
    $cmd.CommandText = "SELECT id, sede_id, numero_documento FROM trabajadores WHERE activo = 1"
    $r = $cmd.ExecuteReader()
    $trabList = @()
    while ($r.Read()) {
        $trabList += @{ id = $r["id"]; sedeId = $r["sede_id"]; dni = $r["numero_documento"] }
    }
    $r.Close()

    Write-Output "Registrando tareo hasta el día de hoy para $($trabList.Count) trabajadores..."

    # Días 1 al 7 de septiembre de 2026
    # 2026-09-01 (Mar): D
    # 2026-09-02 (Mie): D (o F)
    # 2026-09-03 (Jue): D
    # 2026-09-04 (Vie): D
    # 2026-09-05 (Sab): DL
    # 2026-09-06 (Dom): DL
    # 2026-09-07 (Lun - Hoy): D

    foreach ($tr in $trabList) {
        $tId = $tr.id
        $sId = $tr.sedeId
        $dni = $tr.dni

        # Patrón según colaborador
        $patron = @('D','D','D','D','DL','DL','D')
        if ($dni -eq '48765432') { $patron = @('D','F','D','D','DL','DL','F') } # Ana Flores con faltas
        if ($dni -eq '72345612') { $patron = @('V','V','V','V','DL','DL','V') } # Rosa Mamani de vacaciones
        if ($dni -eq '61987234') { $patron = @('N','N','D','D','DL','DL','N') } # Luis Torres turno noche

        for ($day = 1; $day -le 7; $day++) {
            $dayStr = "{0:D2}" -f $day
            $fecha = "2026-09-$dayStr"
            $code = $patron[$day - 1]

            $insTareo = @"
IF NOT EXISTS (SELECT 1 FROM asistencias_matriz WHERE trabajador_id = $tId AND fecha = '$fecha')
BEGIN
    INSERT INTO asistencias_matriz (trabajador_id, sede_id, fecha, codigo_asistencia, observacion, usuario_modificacion)
    VALUES ($tId, $sId, '$fecha', '$code', 'Tareo diario validado', 'sistema');
END
ELSE
BEGIN
    UPDATE asistencias_matriz SET codigo_asistencia = '$code' WHERE trabajador_id = $tId AND fecha = '$fecha';
END
"@
            $cmd.CommandText = $insTareo
            $cmd.ExecuteNonQuery() | Out-Null
        }
    }

    Write-Output "[OK] Tareo registrado exitosamente hasta el día de hoy (07 set. 2026) para todos los trabajadores."

    # 5. Conteo final para validación
    $cmd.CommandText = "SELECT COUNT(*) FROM sedes WHERE activo = 1"
    $countSedes = $cmd.ExecuteScalar()
    $cmd.CommandText = "SELECT COUNT(*) FROM trabajadores WHERE activo = 1"
    $countTrab = $cmd.ExecuteScalar()
    $cmd.CommandText = "SELECT COUNT(*) FROM asistencias_matriz"
    $countTareo = $cmd.ExecuteScalar()

    Write-Output "`n=== RESUMEN EN SISTEMAPLANILLASDB ==="
    Write-Output "Total Sedes activas: $countSedes"
    Write-Output "Total Trabajadores activos: $countTrab"
    Write-Output "Total Registros Tareo hasta hoy: $countTareo"

} catch {
    Write-Error $_.Exception.Message
} finally {
    $conn.Close()
}
