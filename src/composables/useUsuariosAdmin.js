import { ref } from 'vue'
import { get, put, del, ADMIN_TOKEN_KEY, USER_TOKEN_KEY } from '../services/api'

// api.js não expõe um verbo PATCH; replica localmente a mesma lógica de
// autenticação/erro do wrapper para não precisar alterar services/api.js.
const BASE_URL = import.meta.env.VITE_API_URL || 'https://fenix-unip-back.onrender.com/api'

async function patch(path, body) {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(USER_TOKEN_KEY) || null
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, { method: 'PATCH', headers, body: JSON.stringify(body) })
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Tente novamente mais tarde.')
  }

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await response.json().catch(() => null) : await response.text().catch(() => null)

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && (data.message || data.title || data.error)) ||
      (typeof data === 'string' && data) ||
      `Erro na requisição (${response.status})`
    const error = new Error(message)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

function mapUsuario(u) {
  return {
    id: u.id ?? u.Id,
    nome: u.nome ?? u.Nome ?? '',
    email: u.email ?? u.Email ?? '',
    ra: u.ra ?? u.Ra ?? u.RA ?? '',
    curso: u.curso ?? u.Curso ?? '',
    telefone: u.telefone ?? u.Telefone ?? '',
    dataNascimento: u.dataNascimento ?? u.DataNascimento ?? null,
    dataCadastro: u.dataCadastro ?? u.DataCadastro ?? null,
    ativo: u.ativo ?? u.Ativo ?? false,
  }
}

const usuarios = ref([])

export function useUsuariosAdmin() {
  async function fetchUsuarios() {
    const data = await get('/usuarios')
    if (Array.isArray(data)) {
      usuarios.value = data.map(mapUsuario)
    }
  }

  async function updateUsuario(id, form) {
    const payload = {
      nome: form.nome,
      ra: form.ra || null,
      curso: form.curso || null,
      telefone: form.telefone || null,
      dataNascimento: form.dataNascimento || null,
      ativo: form.ativo,
    }
    await put(`/usuarios/${id}`, payload)
    const idx = usuarios.value.findIndex((u) => u.id === id)
    if (idx !== -1) {
      usuarios.value[idx] = { ...usuarios.value[idx], ...payload }
    }
  }

  async function toggleStatus(id, ativo) {
    await patch(`/usuarios/${id}/status`, { ativo })
    const idx = usuarios.value.findIndex((u) => u.id === id)
    if (idx !== -1) {
      usuarios.value[idx] = { ...usuarios.value[idx], ativo }
    }
  }

  async function deleteUsuario(id) {
    const previous = usuarios.value
    usuarios.value = usuarios.value.filter((u) => u.id !== id)
    try {
      await del(`/usuarios/${id}`)
    } catch (err) {
      usuarios.value = previous
      throw err
    }
  }

  return { usuarios, fetchUsuarios, updateUsuario, toggleStatus, deleteUsuario }
}
