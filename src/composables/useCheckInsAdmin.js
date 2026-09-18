import { get, post } from '../services/api'

function mapResultado(d) {
  return {
    sucesso: d.sucesso ?? d.Sucesso ?? false,
    mensagem: d.mensagem ?? d.Mensagem ?? '',
    usuarioId: d.usuarioId ?? d.UsuarioId ?? null,
    usuarioNome: d.usuarioNome ?? d.UsuarioNome ?? '',
    eventoId: d.eventoId ?? d.EventoId ?? null,
    eventoTitulo: d.eventoTitulo ?? d.EventoTitulo ?? '',
    dataHoraCheckIn: d.dataHoraCheckIn ?? d.DataHoraCheckIn ?? null,
    totalSelos: d.totalSelos ?? d.TotalSelos ?? 0,
  }
}

function mapCheckIn(c) {
  return {
    id: c.id ?? c.Id,
    usuarioId: c.usuarioId ?? c.UsuarioId ?? null,
    usuarioNome: c.usuarioNome ?? c.UsuarioNome ?? '',
    eventoId: c.eventoId ?? c.EventoId ?? null,
    eventoTitulo: c.eventoTitulo ?? c.EventoTitulo ?? '',
    eventoData: c.eventoData ?? c.EventoData ?? null,
    dataHoraCheckIn: c.dataHoraCheckIn ?? c.DataHoraCheckIn ?? null,
    administradorNome: c.administradorNome ?? c.AdministradorNome ?? '',
  }
}

function mapRankingItem(r) {
  return {
    usuarioId: r.usuarioId ?? r.UsuarioId ?? null,
    usuarioNome: r.usuarioNome ?? r.UsuarioNome ?? '',
    ra: r.ra ?? r.Ra ?? r.RA ?? '',
    totalSelos: r.totalSelos ?? r.TotalSelos ?? 0,
  }
}

export function useCheckInsAdmin() {
  async function validarToken(token) {
    const data = await post('/checkins/validar', { token })
    return mapResultado(data)
  }

  async function fetchCheckIns({ eventoId, usuarioId } = {}) {
    const params = new URLSearchParams()
    if (eventoId !== undefined && eventoId !== null && eventoId !== '') params.set('eventoId', eventoId)
    if (usuarioId !== undefined && usuarioId !== null && usuarioId !== '') params.set('usuarioId', usuarioId)
    const query = params.toString()
    const data = await get(`/checkins${query ? `?${query}` : ''}`)
    return Array.isArray(data) ? data.map(mapCheckIn) : []
  }

  async function fetchRanking(minimo) {
    const query = minimo !== undefined && minimo !== null && minimo !== '' ? `?minimo=${minimo}` : ''
    const data = await get(`/checkins/ranking${query}`)
    return Array.isArray(data) ? data.map(mapRankingItem) : []
  }

  return { validarToken, fetchCheckIns, fetchRanking }
}
