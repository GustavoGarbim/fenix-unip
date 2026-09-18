<script setup>
import { onMounted, ref } from 'vue'
import { useCheckInsAdmin } from '../../composables/useCheckInsAdmin'

const { fetchRanking } = useCheckInsAdmin()

const minimo = ref(10)
const ranking = ref([])
const loading = ref(false)
const feedback = ref('')

const vencedor = ref(null)

async function buscar() {
  loading.value = true
  feedback.value = ''
  vencedor.value = null
  try {
    ranking.value = await fetchRanking(minimo.value)
  } catch (err) {
    feedback.value = err.message || 'Não foi possível carregar o ranking.'
  } finally {
    loading.value = false
  }
}

onMounted(buscar)

function elegivel(item) {
  return item.totalSelos >= Number(minimo.value || 0)
}

function sortear() {
  const elegiveis = ranking.value.filter(elegivel)
  if (elegiveis.length === 0) {
    vencedor.value = null
    feedback.value = 'Nenhum sócio elegível para o sorteio com o mínimo informado.'
    return
  }
  feedback.value = ''
  const indice = Math.floor(Math.random() * elegiveis.length)
  vencedor.value = elegiveis[indice]
}
</script>

<template>
  <div>
    <span class="section-label">Selos</span>
    <h2 class="mt-3 font-display text-2xl tracking-wide sm:text-3xl">
      Ranking de <span class="text-fenix-orange">Selos</span>
    </h2>
    <p class="mt-3 max-w-lg text-white/60">
      Confira os sócios com mais presenças e use o sorteio para escolher o ganhador do kit torcedor.
    </p>

    <div class="mt-8 card animate-fade-up p-6 sm:p-8">
      <div class="flex flex-wrap items-end gap-4">
        <div>
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">Mínimo de selos</label>
          <input
            v-model.number="minimo"
            type="number"
            min="0"
            class="w-32 border-2 border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-fenix-orange/60 focus:bg-white/10"
          />
        </div>
        <button type="button" class="btn-fire !px-6 !py-3 !text-sm" :disabled="loading" @click="buscar">
          <span class="btn-label">{{ loading ? 'Buscando...' : 'Buscar' }}</span>
        </button>
        <button type="button" class="btn-ghost !px-6 !py-3 !text-sm" @click="sortear">
          <span class="btn-label">Sortear um vencedor</span>
        </button>
      </div>

      <p v-if="feedback" class="mt-4 text-sm font-medium text-white/70">{{ feedback }}</p>

      <div v-if="vencedor" class="mt-6 card border-2 border-fenix-orange bg-fenix-orange/10 p-6 text-center">
        <span class="section-label">Sorteio</span>
        <p class="mt-2 font-display text-2xl tracking-wide text-fenix-orange">
          Vencedor sorteado: {{ vencedor.usuarioNome }}
        </p>
        <p class="mt-1 text-sm text-white/60">RA {{ vencedor.ra || '—' }} &middot; {{ vencedor.totalSelos }} selo(s)</p>
      </div>
    </div>

    <div class="mt-8 space-y-3">
      <div
        v-for="item in ranking"
        :key="item.usuarioId"
        class="card flex items-center justify-between gap-4 p-4 sm:p-5"
        :class="elegivel(item) ? 'border-fenix-orange/60' : ''"
      >
        <div class="min-w-0 flex-1">
          <p class="truncate font-semibold text-white">{{ item.usuarioNome }}</p>
          <p class="text-xs text-white/50">RA {{ item.ra || '—' }}</p>
        </div>
        <div class="flex shrink-0 items-center gap-3">
          <span class="font-display text-xl tracking-wide text-fenix-orange">{{ item.totalSelos }}</span>
          <span
            v-if="elegivel(item)"
            class="-skew-x-6 border-2 border-fenix-orange/40 bg-fenix-orange/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-fenix-orange"
          >
            Apto
          </span>
        </div>
      </div>

      <div v-if="!loading && ranking.length === 0" class="card p-8 text-center text-sm text-white/50">
        Nenhum sócio encontrado com o mínimo informado.
      </div>
    </div>
  </div>
</template>
