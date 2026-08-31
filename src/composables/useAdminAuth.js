import { ref } from 'vue'

const STORAGE_KEY = 'fenix-admin-session'
export const DEMO_USER = 'admin'
export const DEMO_PASS = 'fenix2026'

const isAdmin = ref(localStorage.getItem(STORAGE_KEY) === 'true')

export function useAdminAuth() {
  function login(username, password) {
    const ok = username === DEMO_USER && password === DEMO_PASS
    if (ok) {
      isAdmin.value = true
      localStorage.setItem(STORAGE_KEY, 'true')
    }
    return ok
  }

  function logout() {
    isAdmin.value = false
    localStorage.removeItem(STORAGE_KEY)
  }

  return { isAdmin, login, logout }
}
