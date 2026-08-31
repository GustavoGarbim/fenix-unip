<script setup>
import { reactive } from 'vue'
import { useDemoMode } from '../composables/useDemoMode'

const { triggerDemo } = useDemoMode()

const events = [
  { day: '02', month: 'SET', title: 'Treino de Futsal', type: 'Treino', time: '19h00', place: 'Ginásio UNIP' },
  { day: '05', month: 'SET', title: 'Vôlei vs. Atlética Titans', type: 'Jogo', time: '15h00', place: 'Arena Central' },
  { day: '09', month: 'SET', title: 'Treino de Handebol', type: 'Treino', time: '20h00', place: 'Ginásio UNIP' },
  { day: '13', month: 'SET', title: 'Basquete vs. Fúria FC', type: 'Jogo', time: '17h30', place: 'Ginásio Anexo' },
  { day: '18', month: 'SET', title: 'Treino Funcional', type: 'Treino', time: '18h30', place: 'Quadra 2' },
  { day: '21', month: 'SET', title: 'Final da Copa Interatléticas', type: 'Jogo', time: '14h00', place: 'Arena Central' },
]

const modalities = ['Futsal', 'Vôlei', 'Basquete', 'Handebol', 'Atletismo', 'Judô']

const form = reactive({
  name: '',
  ra: '',
  modality: '',
  experience: '',
})

function typeClasses(type) {
  return type === 'Jogo'
    ? 'bg-fenix-red text-white'
    : 'border-2 border-white/15 bg-white/5 text-white/70'
}

function submitTryout() {
  triggerDemo('Faça parte da Bateria')
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
    <span class="section-label">Seletivas</span>
    <h1 class="mt-5 font-display text-4xl tracking-wide sm:text-5xl">
      Treinos, jogos e <span class="text-fenix-orange">seletivas</span>
    </h1>
    <p class="mt-3 max-w-lg text-white/60">Acompanhe a agenda oficial da Fênix e faça parte da bateria disputando uma vaga no time.</p>

    <div class="mt-12 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <!-- Calendar / agenda -->
      <div class="animate-fade-up card p-6 sm:p-8">
        <div class="flex items-center justify-between">
          <p class="font-display text-lg tracking-wide">Próximos Compromissos</p>
          <span class="section-label">Setembro 2026</span>
        </div>

        <ul class="mt-6 space-y-3">
          <li
            v-for="e in events"
            :key="e.title + e.day"
            class="group flex items-center gap-4 border-2 border-white/10 bg-white/[0.02] p-4 transition-all duration-300 hover:border-fenix-orange/40 hover:bg-white/[0.05]"
          >
            <div class="flex h-14 w-14 shrink-0 flex-col items-center justify-center border-2 border-white/10 bg-black/40 text-center">
              <span class="font-display text-xl leading-none text-fenix-gold">{{ e.day }}</span>
              <span class="text-[10px] uppercase tracking-wider text-white/50">{{ e.month }}</span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate font-semibold text-white">{{ e.title }}</p>
              <p class="text-xs text-white/50">{{ e.time }} &middot; {{ e.place }}</p>
            </div>
            <span class="shrink-0 -skew-x-6 px-3 py-1 text-[11px] font-bold uppercase tracking-wide" :class="typeClasses(e.type)">
              <span class="btn-label">{{ e.type }}</span>
            </span>
          </li>
        </ul>
      </div>

      <!-- Tryout form -->
      <div class="animate-fade-up card p-6 sm:p-8" style="animation-delay: 0.1s">
        <p class="font-display text-lg tracking-wide">Faça Parte da Bateria</p>
        <p class="mt-1 text-sm text-white/50">Preencha seus dados e mostre sua garra na próxima seletiva da Fênix.</p>

        <form class="mt-6 space-y-4" @submit.prevent="submitTryout">
          <div>
            <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">Nome completo</label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Seu nome"
              class="w-full border-2 border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-fenix-orange/60 focus:bg-white/10"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">RA</label>
            <input
              v-model="form.ra"
              type="text"
              required
              placeholder="N123456-7"
              class="w-full border-2 border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-fenix-orange/60 focus:bg-white/10"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">Modalidade</label>
            <select
              v-model="form.modality"
              required
              class="w-full border-2 border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-fenix-orange/60 focus:bg-white/10"
            >
              <option value="" disabled class="bg-fenix-black">Selecione uma modalidade</option>
              <option v-for="m in modalities" :key="m" :value="m" class="bg-fenix-black">{{ m }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">Experiência (opcional)</label>
            <textarea
              v-model="form.experience"
              rows="3"
              placeholder="Conte um pouco sobre sua trajetória no esporte"
              class="w-full resize-none border-2 border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-fenix-orange/60 focus:bg-white/10"
            />
          </div>

          <button type="submit" class="btn-fire w-full !py-3.5 !text-base">
            <span class="btn-label">Faça Parte da Bateria</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
