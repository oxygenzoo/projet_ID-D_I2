<template>
  <header class="nav">
    <div class="nav-wrap">
      <!-- Logo -->
      <div class="brand" @click="goHome">
        <img src="../assets/logo/logo_complet.png" class="brand-logo" alt="Agora" />
      </div>

      <!-- Liens desktop -->
      <nav class="center desktop-only">
        <router-link class="nav-link" to="/">Accueil</router-link>
        <router-link class="nav-link" to="/propos">A propos</router-link>

        <router-link v-if="role==='admin'" class="nav-link" to="/admin/dashboard">Dashboard</router-link>
        <router-link v-if="role==='admin'" class="nav-link" to="/admin/adherents">Adhérents</router-link>
        <router-link v-if="role==='admin'" class="nav-link" to="/admin/association">Association</router-link>

        <router-link v-else-if="role==='association'" class="nav-link" to="/association/dashboard">Dashboard</router-link>

        <router-link v-else-if="role==='adherent'" class="nav-link" to="/adherent/dashboard">Dashboard</router-link>
        <router-link v-if="role==='adherent'" class="nav-link" to="/adherent/cotisations">Mes cotisations</router-link>
        <router-link v-if="role==='adherent'" class="nav-link" to="/adherent/evenements">Mes Evenements</router-link>
      </nav>

      <!-- Bouton connexion / déconnexion -->
      <div class="right desktop-only">
        <span v-if="isLoggedIn" class="hello">👋 {{ firstName }}</span>
        <button v-if="isLoggedIn" class="btn" @click="emitLogout">Déconnexion</button>
        <button v-else class="btn" @click="goLogin">Connexion</button>
      </div>

      <!-- Burger -->
      <button class="burger mobile-only" @click="toggleMenu">
        <span v-if="!isOpen">☰</span>
        <span v-else>✕</span>
      </button>
    </div>

    <!-- Menu mobile plein écran -->
    <transition name="fade">
      <div v-if="isOpen" class="mobile-menu">
        <div class="mobile-header">
          <img src="../assets/logo/logo_complet.png" class="brand-logo" alt="Agora" @click="goHome" />
          <button class="close" @click="closeMenu">✕</button>
        </div>

        <nav class="mobile-links">
          <router-link class="nav-link" to="/">Accueil</router-link>
          <router-link class="nav-link" to="/propos">A propos</router-link>

          <router-link v-if="role==='admin'" class="nav-link" to="/admin/dashboard">Dashboard</router-link>
          <router-link v-if="role==='admin'" class="nav-link" to="/admin/adherents">Adhérents</router-link>
          <router-link v-if="role==='admin'" class="nav-link" to="/admin/association">Association</router-link>

          <router-link v-else-if="role==='association'" class="nav-link" to="/association/dashboard">Dashboard</router-link>

          <router-link v-else-if="role==='adherent'" class="nav-link" to="/adherent/dashboard">Dashboard</router-link>
          <router-link v-if="role==='adherent'" class="nav-link" to="/adherent/cotisations">Mes cotisations</router-link>
          <router-link v-if="role==='adherent'" class="nav-link" to="/adherent/evenements">Mes Evenements</router-link>
        </nav>

        <div class="mobile-actions">
          <div v-if="isLoggedIn" class="hello big">👋 Bonjour {{ firstName }}</div>
          <button v-if="isLoggedIn" class="btn big" @click="emitLogout">Déconnexion</button>
          <button v-else class="btn big" @click="goLogin">Connexion</button>
        </div>
      </div>
    </transition>
  </header>
</template>

<script>
import { globalState } from '@/store/useGlobal.js'

export default {
  name: 'Navbar',
  props: { user: Object },
  data: () => ({ isOpen: false }),
  computed: {
    isLoggedIn() {
      return this.user?.isLoggedIn || globalState.user !== null
    },
    role() {
      return this.user?.role || globalState.user?.role || 'guest'
    },
    firstName() {
      const n = this.user?.fullName || globalState.user?.full_name || ''
      return n ? n.split(' ')[0] : ''
    }
  },
  watch: { $route() { this.closeMenu() } },
  methods: {
    toggleMenu() {
      this.isOpen = !this.isOpen
      document.body.style.overflow = this.isOpen ? 'hidden' : 'auto'
    },
    closeMenu() {
      this.isOpen = false
      document.body.style.overflow = 'auto'
    },
    goHome() { this.$router.push('/') },
    goLogin() { this.$router.push('/login') },
    emitLogout() {
      this.$emit('logout')
      this.closeMenu()
    }
  }
}
</script>

<style>
:root {
  --nav-bg: #1f3c8f;
  --nav-fg: #fff;
  --nav-fg-light: #dbeafe;
}

.nav {
  background: var(--nav-bg);
  color: var(--nav-fg);
  position: sticky;
  top: 0;
  z-index: 999;
}

.nav-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 70px;
  max-width: 1280px;
  margin: auto;
}

.brand { display: flex; align-items: center; cursor: pointer; }
.brand-logo { height: 34px; }

.center {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
}

.nav-link {
  color: var(--nav-fg);
  text-decoration: none;
  font-weight: 700;
}
.nav-link:hover { color: var(--nav-fg-light); }

.right {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn {
  background: white;
  color: var(--nav-bg);
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  line-height: 1;
}
.btn:hover { background: #f3f4f6; }

.hello { font-weight: 600; color: var(--nav-fg-light); }

.burger {
  background: none;
  border: none;
  font-size: 26px;
  color: white;
  cursor: pointer;
  width: 44px;
  height: 44px;
  display: none;
  align-items: center;
  justify-content: center;
}

/* ===== Menu mobile ===== */
.mobile-menu {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: var(--nav-bg);
  display: flex;
  flex-direction: column;
  z-index: 2000;
}

.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
  padding: 0 1.5rem;
}

.mobile-links {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.mobile-link {
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  text-decoration: none;
}

.mobile-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding-bottom: 2rem;
}
.big { font-size: 1.05rem; }

.close {
  background: none;
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
  width: 44px;
  height: 44px;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.desktop-only { display: flex; }
.mobile-only { display: none; }

@media (max-width: 900px) {
  .desktop-only { display: none; }
  .mobile-only { display: flex; }
  .nav-wrap { padding: 0 1.2rem; }
}
</style>
