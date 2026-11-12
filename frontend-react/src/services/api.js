// ─── Servicio API para Sistema Planillas Enterprise ────────────────────────
const BASE_URL = '/api/v1'

export async function getSedes(empresaId) {
  try {
    const url = empresaId ? `${BASE_URL}/sedes?empresaId=${empresaId}` : `${BASE_URL}/sedes`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    if (data.offline) return null
    return data
  } catch {
    return null
  }
}

export async function getTrabajadores({ empresaId, sedeId, search, page = 0, size = 50 } = {}) {
  try {
    const params = new URLSearchParams()
    if (empresaId) params.append('empresaId', empresaId)
    if (sedeId) params.append('sedeId', sedeId)
    if (search) params.append('search', search)
    params.append('page', page)
    params.append('size', size)

    const res = await fetch(`${BASE_URL}/trabajadores?${params.toString()}`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.offline) return null
    return data.content || []
  } catch {
    return null
  }
}

export async function getMatrizAsistencia(mes = 9, anio = 2026, sedeId = 1) {
  try {
    const res = await fetch(`${BASE_URL}/asistencia/matriz?mes=${mes}&anio=${anio}&sedeId=${sedeId}`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.offline) return null
    return data
  } catch {
    return null
  }
}

export async function updateMarcacion({ trabajadorId, sedeId, fecha, codigoAsistencia, observacion }) {
  try {
    const res = await fetch(`${BASE_URL}/asistencia/marcacion`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trabajadorId,
        fecha,
        codigoAsistencia,
        observacion: observacion || 'Actualizado desde frontend',
        usuario: 'admin',
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function crearTrabajador(trabajadorData) {
  try {
    const res = await fetch(`${BASE_URL}/trabajadores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trabajadorData),
    })
    if (!res.ok) throw new Error('Error al registrar trabajador')
    return await res.json()
  } catch (err) {
    console.error(err)
    return null
  }
}

export async function calcularPlanilla(periodo = '202609', empresaId = 1) {
  try {
    // Normalizar periodo a formato YYYYMM (sin guion) para compatibilidad con BD
    const p = String(periodo).replace('-', '')
    const res = await fetch(`${BASE_URL}/planilla/calcular`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ periodo: p, empresaId }),
    })
    if (!res.ok) throw new Error('Error al calcular planilla en el servidor')
    return await res.json()
  } catch (err) {
    console.error(err)
    return null
  }
}

export async function cerrarPlanilla(periodo = '202609', empresaId = 1, usuarioCierre = 'Admin') {
  try {
    const p = String(periodo).replace('-', '')
    const res = await fetch(`${BASE_URL}/planilla/cerrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ periodo: p, empresaId, usuarioCierre }),
    })
    if (!res.ok) throw new Error('Error al cerrar planilla en el servidor')
    return await res.json()
  } catch (err) {
    console.error(err)
    return null
  }
}

export async function getResumenPlanilla(periodo = '202609') {
  try {
    const p = String(periodo).replace('-', '')
    const res = await fetch(`${BASE_URL}/planilla/resumen?periodo=${p}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function getBoletaTrabajador(trabajadorId, periodo = '202609') {
  try {
    const p = String(periodo).replace('-', '')
    const res = await fetch(`${BASE_URL}/planilla/boleta/${trabajadorId}?periodo=${p}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
