param(
    [string]$Server = $(if ($env:DB_SERVER) { $env:DB_SERVER } else { "localhost" }),
    [string]$Database = $(if ($env:DB_NAME) { $env:DB_NAME } else { "SistemaPlanillasDB" }),
    [string]$User = $(if ($env:DB_USER) { $env:DB_USER } else { "sa" }),
    [string]$Password = $(if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "" })
)

$connStr = "Server=$Server;Database=$Database;User Id=$User;Password=$Password;Encrypt=False;TrustServerCertificate=True"
$conn = New-Object System.Data.SqlClient.SqlConnection($connStr)

try {
    $conn.Open()
    
    Write-Output "=== EMPRESAS ==="
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = "SELECT id, ruc, razon_social FROM empresas"
    $r = $cmd.ExecuteReader()
    while($r.Read()) { Write-Output "$($r['id']) | $($r['ruc']) | $($r['razon_social'])" }
    $r.Close()

    Write-Output "`n=== SEDES ==="
    $cmd.CommandText = "SELECT id, empresa_id, codigo, nombre, departamento, provincia, distrito FROM sedes"
    $r = $cmd.ExecuteReader()
    while($r.Read()) { Write-Output "$($r['id']) | $($r['codigo']) | $($r['nombre']) | $($r['distrito'])" }
    $r.Close()

    Write-Output "`n=== TRABAJADORES ==="
    $cmd.CommandText = "SELECT id, sede_id, numero_documento, nombres, apellido_paterno, apellido_materno, cargo, sueldo_basico FROM trabajadores"
    $r = $cmd.ExecuteReader()
    while($r.Read()) { Write-Output "$($r['id']) | sede:$($r['sede_id']) | $($r['numero_documento']) | $($r['nombres']) $($r['apellido_paterno']) | $($r['cargo']) | S/ $($r['sueldo_basico'])" }
    $r.Close()

    Write-Output "`n=== ASISTENCIAS MATRIZ (conteo) ==="
    $cmd.CommandText = "SELECT COUNT(*) FROM asistencias_matriz"
    $count = $cmd.ExecuteScalar()
    Write-Output "Total registros asistencias: $count"

} catch {
    Write-Error $_.Exception.Message
} finally {
    $conn.Close()
}
