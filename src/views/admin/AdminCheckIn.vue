<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import QrScanner from 'qr-scanner'
import { useEventos } from '../../composables/useEventos'
import { useCheckInsAdmin } from '../../composables/useCheckInsAdmin'

const { eventos } = useEventos()
const { validarToken, fetchCheckIns } = useCheckInsAdmin()

const eventoId = ref('')
const videoRef = ref(null)
let scanner = null

const cameraDisponivel = ref(true)
const cameraErro = ref('')
const scanning = ref(false)

const manualToken = ref('')
const validando = ref(false)

const resultado = ref(null)

const checkIns = ref([])
const loadingCheckIns = ref(false)

async function carregarCheckIns() {
  loadingCheckIns.value = true
  try {
    checkIns.value = await fetchCheckIns(eventoId.value ? { eventoId: eventoId.value } : {})
  } catch {
    // mantém lista atual em caso de falha
  } finally {
    loadingCheckIns.value = false
  }
}

watch(eventoId, carregarCheckIns)

async function processarToken(token) {
  if (!token || validando.value) return
  validando.value = true
  try {
    const r = await validarToken(token)
    resultado.value = r
    if (r.sucesso) {
      await carregarCheckIns()
    }
  } catch (err) {
    resultado.value = { sucesso: false, mensagem: err.message || 'Não foi possível validar o QR code.' }
  } finally {
    validando.value = false
    setTimeout(() => {
      resultado.value = null
    }, 5000)
  }
}

async function onScanResult(result) {
  if (!scanner || validando.value) return
  scanner.pause()
  await processarToken(result.data)
  setTimeout(() => {
    scanner?.start().catch(() => {})
  }, 1500)
}

async function submitManual() {
  const token = manualToken.value.trim()
  if (!token) return
  await processarToken(token)
  manualToken.value = ''
}

onMounted(async () => {
  await carregarCheckIns()
  await nextTick()
  if (!videoRef.value) return
  try {
    const hasCamera = await QrScanner.hasCamera()
    if (!hasCamera) {
      cameraDisponivel.value = false
      cameraErro.value = 'Nenhuma câmera disponível neste dispositivo.'
      return
    }
    scanner = new QrScanner(videoRef.value, onScanResult, { returnDetailedScanResult: true })
    await scanner.start()
    scanning.value = true
  } catch (err) {
    cameraDisponivel.value = false
    cameraErro.value = err?.message || 'Não foi possível acessar a câmera. Verifique as permissões do navegador.'
  }
})

onUnmounted(() => {
  scanner?.stop()
  scanner?.destroy()
  scanner = null
})

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const bannerClasses = computed(() => {
  if (!resultado.value) return ''
  return resultado.value.sucesso
    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
    : 'border-red-500/40 bg-red-500/10 text-red-300'
})
</script>

<template>
  <div>
    <span class="section-label">Selos</span>
    <h2 class="mt-3 font-display text-2xl tracking-wide sm:text-3xl">
      Check-in por <span class="text-fenix-orange">QR Code</span>
    </h2>

    <div class="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div class="card animate-fade-up p-6 sm:p-8">
        <div>
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">Evento (filtro da lista abaixo)</label>
          <select
            v-model="eventoId"
            class="w-full border-2 border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-fenix-orange/60 focus:bg-white/10"
          >
            <option value="" class="bg-fenix-black">Todos os eventos</option>
            <option v-for="e in eventos" :key="e.id" :value="e.id" class="bg-fenix-black">{{ e.titulo }}</option>
          </select>
        </div>

        <p v-if="resultado" class="mt-5 border-2 p-4 text-sm font-medium" :class="bannerClasses">
          <span v-if="resultado.sucesso">
            {{ resultado.mensagem }} — {{ resultado.usuarioNome }} agora tem {{ resultado.totalSelos }} selo(s).
          </span>
          <span v-else>{{ resultado.mensagem }}</span>
        </p>

        <div class="mt-5">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-white/50">Câmera</p>
          <div class="relative aspect-square w-full overflow-hidden border-2 border-white/15 bg-black">
            <video ref="videoRef" class="h-full w-full object-cover" muted playsinline></video>
            <div v-if="!cameraDisponivel" class="absolute inset-0 flex items-center justify-center bg-black/80 p-4 text-center text-sm text-white/60">
              {{ cameraErro || 'Câmera indisponível.' }}
            </div>
          </div>
        </div>

        <div class="mt-5">
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">Validar token manualmente</label>
          <div class="flex gap-3">
            <input
              v-model="manualToken"
              type="text"
              placeholder="Cole o token do QR code"
              class="w-full border-2 border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-fenix-orange/60 focus:bg-white/10"
              @keyup.enter="submitManual"
            />
            <button type="button" class="btn-fire shrink-0 !px-6 !py-3 !text-sm" :disabled="validando" @click="submitManual">
              <span class="btn-label">{{ validando ? 'Validando...' : 'Validar' }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="animate-fade-up" style="animation-delay: 0.1s">
        <p class="font-display text-lg tracking-wide">Check-ins Recentes</p>
        <div class="mt-5 space-y-3">
          <div v-for="c in checkIns" :key="c.id" class="card flex items-center justify-between gap-4 p-4 sm:p-5">
            <div class="min-w-0 flex-1">
              <p class="truncate font-semibold text-white">{{ c.usuarioNome }}</p>
              <p class="text-xs text-white/50">
                {{ c.eventoTitulo }} &middot; {{ formatDate(c.dataHoraCheckIn) }}
              </p>
            </div>
          </div>

          <div v-if="!loadingCheckIns && checkIns.length === 0" class="card p-8 text-center text-sm text-white/50">
            Nenhum check-in registrado ainda.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
