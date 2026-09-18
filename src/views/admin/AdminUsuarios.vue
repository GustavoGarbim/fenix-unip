<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useUsuariosAdmin } from '../../composables/useUsuariosAdmin'

const { usuarios, fetchUsuarios, updateUsuario, toggleStatus, deleteUsuario } = useUsuariosAdmin()

onMounted(fetchUsuarios)

const busca = ref('')
const feedback = ref('')
const savingId = ref(null)

const emptyForm = { nome: '', ra: '', curso: '', telefone: '', dataNascimento: '', ativo: true }
const form = reactive({ ...emptyForm })
const editingId = ref(null)

const usuariosFiltrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  if (!termo) return usuarios.value
  return usuarios.value.filter((u) =>
    [u.nome, u.email, u.ra].some((campo) => (campo || '').toLowerCase().includes(termo))
  )
})

function toDateInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function startEdit(usuario) {
  editingId.value = usuario.id
  Object.assign(form, {
    nome: usuario.nome,
    ra: usuario.ra,
    curso: usuario.curso,
    telefone: usuario.telefone,
    dataNascimento: toDateInput(usuario.dataNascimento),
    ativo: usuario.ativo,
  })
  feedback.value = ''
}

function cancelEdit() {
  editingId.value = null
  Object.assign(form, emptyForm)
}

async function submit() {
  if (!editingId.value || !form.nome.trim()) return
  savingId.value = editingId.value
  feedback.value = ''
  try {
    await updateUsuario(editingId.value, form)
    feedback.value = 'Sócio atualizado com sucesso.'
    cancelEdit()
  } catch (err) {
    feedback.value = err.message || 'Não foi possível salvar as alterações.'
  } finally {
    savingId.value = null
  }
}

async function handleToggleStatus(usuario) {
  if (usuario.ativo && !window.confirm(`Desativar o sócio "${usuario.nome}"?`)) return
  feedback.value = ''
  try {
    await toggleStatus(usuario.id, !usuario.ativo)
  } catch (err) {
    feedback.value = err.message || 'Não foi possível alterar o status do sócio.'
  }
}

async function removeUsuario(usuario) {
  if (!window.confirm(`Excluir o sócio "${usuario.nome}"? Esta ação não pode ser desfeita.`)) return
  feedback.value = ''
  try {
    await deleteUsuario(usuario.id)
    if (editingId.value === usuario.id) cancelEdit()
  } catch (err) {
    feedback.value = err.message || 'Não foi possível excluir o sócio.'
  }
}
</script>

<template>
  <div>
    <span class="section-label">Sócios</span>
    <h2 class="mt-3 font-display text-2xl tracking-wide sm:text-3xl">
      Gerenciar <span class="text-fenix-orange">Usuários</span>
    </h2>

    <div class="mt-8 grid gap-6" :class="editingId ? 'lg:grid-cols-[0.9fr_1.1fr]' : ''">
      <div v-if="editingId" class="card animate-fade-up p-6 sm:p-8">
        <p class="font-display text-lg tracking-wide">Editando sócio #{{ editingId }}</p>
        <form class="mt-5 space-y-4" @submit.prevent="submit">
          <div>
            <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">Nome</label>
            <input
              v-model="form.nome"
              type="text"
              required
              class="w-full border-2 border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-fenix-orange/60 focus:bg-white/10"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">RA</label>
              <input
                v-model="form.ra"
                type="text"
                class="w-full border-2 border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-fenix-orange/60 focus:bg-white/10"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">Curso</label>
              <input
                v-model="form.curso"
                type="text"
                class="w-full border-2 border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-fenix-orange/60 focus:bg-white/10"
              />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">Telefone</label>
              <input
                v-model="form.telefone"
                type="text"
                class="w-full border-2 border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition focus:border-fenix-orange/60 focus:bg-white/10"
              />
            </div>
            <div>
              <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">Data de nascimento</label>
              <input
                v-model="form.dataNascimento"
                type="date"
                class="w-full border-2 border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-fenix-orange/60 focus:bg-white/10"
              />
            </div>
          </div>

          <p v-if="feedback" class="text-sm font-medium text-white/70">{{ feedback }}</p>

          <div class="flex gap-3">
            <button type="submit" class="btn-fire flex-1 !py-3 !text-base" :disabled="savingId === editingId">
              <span class="btn-label">{{ savingId === editingId ? 'Salvando...' : 'Salvar Alterações' }}</span>
            </button>
            <button type="button" class="btn-ghost !py-3 !text-base" @click="cancelEdit">
              <span class="btn-label">Cancelar</span>
            </button>
          </div>
        </form>
      </div>

      <div class="animate-fade-up" style="animation-delay: 0.1s">
        <div class="flex items-center justify-between gap-4">
          <p class="font-display text-lg tracking-wide">Sócios Cadastrados</p>
          <input
            v-model="busca"
            type="text"
            placeholder="Buscar por nome, e-mail ou RA"
            class="w-64 max-w-full border-2 border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition focus:border-fenix-orange/60 focus:bg-white/10"
          />
        </div>

        <p v-if="feedback && !editingId" class="mt-3 text-sm font-medium text-white/70">{{ feedback }}</p>

        <div class="mt-5 space-y-3">
          <div v-for="u in usuariosFiltrados" :key="u.id" class="card flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-3">
                <p class="truncate font-semibold text-white">{{ u.nome }}</p>
                <span
                  class="shrink-0 border-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                  :class="u.ativo ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-red-500/30 bg-red-500/10 text-red-400'"
                >
                  {{ u.ativo ? 'Ativo' : 'Inativo' }}
                </span>
              </div>
              <p class="truncate text-xs text-white/50">
                {{ u.email }} &middot; RA {{ u.ra || '—' }} &middot; {{ u.curso || 'Curso não informado' }}
              </p>
            </div>
            <div class="flex shrink-0 gap-2">
              <button type="button" class="btn-ghost !px-4 !py-2 !text-xs" @click="startEdit(u)">
                <span class="btn-label">Editar</span>
              </button>
              <button type="button" class="btn-ghost !px-4 !py-2 !text-xs" @click="handleToggleStatus(u)">
                <span class="btn-label">{{ u.ativo ? 'Desativar' : 'Ativar' }}</span>
              </button>
              <button
                type="button"
                class="flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white/70 transition hover:bg-red-500/20 hover:text-red-400"
                title="Excluir sócio"
                @click="removeUsuario(u)"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 0v12a1 1 0 001 1h6a1 1 0 001-1V7" />
                </svg>
              </button>
            </div>
          </div>

          <div v-if="usuariosFiltrados.length === 0" class="card p-8 text-center text-sm text-white/50">
            Nenhum sócio encontrado.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
