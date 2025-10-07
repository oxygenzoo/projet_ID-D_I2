// src/store/useGlobal.js
import { reactive, computed } from 'vue'

export const globalState = reactive({
  user: null,                // Objet utilisateur
  loading: false,            // Chargement global
  notifications: [],         // Notifications système
  theme: 'light',            // Exemple de paramètre global
  error: null,               // Dernière erreur
})

// ---- Actions (facultatif mais propre) ----
export const globalActions = {
  setUser(u) {
    globalState.user = u
  },
  setLoading(v) {
    globalState.loading = v
  },
  addNotification(msg, type = 'info') {
    globalState.notifications.push({ msg, type, id: Date.now() })
  },
  clearError() {
    globalState.error = null
  },
  toggleTheme() {
    globalState.theme = globalState.theme === 'light' ? 'dark' : 'light'
  }
}

// ---- Getters réactifs ----
export const isLoggedIn = computed(() => !!globalState.user)
