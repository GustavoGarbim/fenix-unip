import { get } from '../services/api'

function mapQrCode(d) {
  return {
    token: d.token ?? d.Token ?? '',
    expiraEm: d.expiraEm ?? d.ExpiraEm ?? null,
    eventoId: d.eventoId ?? d.EventoId ?? null,
    eventoTitulo: d.eventoTitulo ?? d.EventoTitulo ?? '',
    eventoData: d.eventoData ?? d.EventoData ?? null,
  }
}

function mapSelo(s) {
  return {
    id: s.id ?? s.Id,
    usuarioId: s.usuarioId ?? s.UsuarioId ?? null,
    usuarioNome: s.usuarioNome ?? s.UsuarioNome ?? '',
    eventoId: s.eventoId ?? s.EventoId ?? null,
    eventoTitulo: s.eventoTitulo ?? s.EventoTitulo ?? '',
    eventoData: s.eventoData ?? s.EventoData ?? null,
    dataHoraCheckIn: s.dataHoraCheckIn ?? s.DataHoraCheckIn ?? null,
    administradorNome: s.administradorNome ?? s.AdministradorNome ?? '',
  }
}

function mapMeusSelos(d) {
  return {
    totalSelos: d.totalSelos ?? d.TotalSelos ?? 0,
    historico: (d.historico ?? d.Historico ?? []).map(mapSelo),
  }
}

export function useCheckIns() {
  async function gerarQrCode(eventoId) {
    const data = await get(`/checkins/meu-qrcode/${eventoId}`)
    return mapQrCode(data)
  }

  async function fetchMeusSelos() {
    const data = await get('/checkins/meus-selos')
    return mapMeusSelos(data)
  }

  return { gerarQrCode, fetchMeusSelos }
}
