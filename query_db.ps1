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
