// ─── Servicio API para Sistema Planillas Enterprise ────────────────────────
const BASE_URL = '/api/v1'

export async function getSedes(empresaId) {
  try {
    const url = empresaId ? `${BASE_URL}/sedes?empresaId=${empresaId}` : `${BASE_URL}/sedes`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('Fallo al conectar con /api/v1/sedes, usando datos locales:', err)
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
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data = await res.json()
    return data.content || []
  } catch (err) {
    console.warn('Fallo al conectar con /api/v1/trabajadores:', err)
    return null
  }
}

export async function getMatrizAsistencia(mes = 9, anio = 2026, sedeId = 1) {
  try {
    const res = await fetch(`${BASE_URL}/asistencia/matriz?mes=${mes}&anio=${anio}&sedeId=${sedeId}`)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    return await res.json()
  } catch (err) {
    console.warn('Fallo al conectar con /api/v1/asistencia/matriz:', err)
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
        sedeId,
        fecha,
        codigoAsistencia,
        observacion: observacion || 'Actualizado desde frontend',
        usuarioModificacion: 'admin',
      }),
    })
    return res.ok
  } catch (err) {
    console.warn('Fallo al actualizar marcación en backend:', err)
    return false
  }
}
