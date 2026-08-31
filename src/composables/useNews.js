import { ref, watch } from 'vue'
import postBeneficente from '../img/post-acao-beneficente.jpg'
import postMonster from '../img/post-monster-energy.jpg'

const STORAGE_KEY = 'fenix-news-posts'

function loadPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore malformed storage
  }
  return [
    {
      id: 2,
      title: null,
      summary:
        'Quem nasce no fogo, bebe Monster! Vem aí mais uma confraternização da Fênix com direito a energia de sobra. Anota na agenda e chama a galera. 🔥',
      author: 'Diretoria Fênix',
      date: '2026-08-24',
      image: postMonster,
      likes: 214,
    },
    {
      id: 1,
      title: null,
      summary:
        'Nossa atlética está apoiando a Ação Beneficente do CEU Pêra Marmelo! Entrada com 1kg de alimento não perecível. Vamos com tudo apoiar essa causa. 🧡',
      author: 'Diretoria Fênix',
      date: '2026-08-20',
      image: postBeneficente,
      likes: 158,
    },
  ]
}

const posts = ref(loadPosts())

watch(
  posts,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // storage quota exceeded (e.g. very large images) — post still lives in memory for this session
    }
  },
  { deep: true }
)

export function useNews() {
  function addPost({ summary, author, image }) {
    posts.value.unshift({
      id: Date.now(),
      title: null,
      summary,
      author: author?.trim() || 'Diretoria Fênix',
      date: new Date().toISOString().slice(0, 10),
      image: image || null,
      likes: 0,
    })
  }

  function deletePost(id) {
    posts.value = posts.value.filter((p) => p.id !== id)
  }

  return { posts, addPost, deletePost }
}
