// ─── Servicio API para Sistema Planillas Enterprise ────────────────────────
const BASE_URL = '/api/v1'

// Sube imagen al BACKEND, que a su vez la sube a Cloudinary
// Las credenciales de Cloudinary nunca se exponen en el frontend
export async function uploadImageToBackend(file) {
  const formData = new FormData()
  formData.append('foto', file)
  // Usamos un endpoint dedicado para subir solo la foto del perfil admin
  const res = await fetch(`${BASE_URL}/trabajadores/upload-foto`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error('Error al subir imagen')
  const data = await res.json()
  return data.url
}

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

// Envía datos + foto como multipart/form-data al backend
export async function crearTrabajador(data, fotoFile = null) {
  const formData = new FormData()
  formData.append('datos', new Blob([JSON.stringify(data)], { type: 'application/json' }))
  if (fotoFile) formData.append('foto', fotoFile)

  const res = await fetch(`${BASE_URL}/trabajadores`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
  return await res.json()
}

export async function actualizarTrabajador(id, data, fotoFile = null) {
  const formData = new FormData()
  formData.append('datos', new Blob([JSON.stringify(data)], { type: 'application/json' }))
  if (fotoFile) formData.append('foto', fotoFile)

  const res = await fetch(`${BASE_URL}/trabajadores/${id}`, {
    method: 'PUT',
    body: formData,
  })
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
  return await res.json()
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
