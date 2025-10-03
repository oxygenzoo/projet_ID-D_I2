<template>
  <div id="app">
    <!-- Navbar dynamique -->
    <Navbar :user="user" @toggle-auth="toggleAuth" />
    <router-view />
  </div>
</template>

<script>
import Navbar from './components/NavBar.vue'

export default {
  name: "App",
  components: { Navbar },
  data() {
    return {
      user: {
        isLoggedIn: false,
        role: "guest" // guest | admin | association | adherent
      }
    }
  },
  methods: {
    toggleAuth() {
      if (this.user.isLoggedIn) {
        this.user = { isLoggedIn: false, role: "guest" }
      } else {
        // Pour tester : connexion en admin par défaut
        this.user = { isLoggedIn: true, role: "admin" }
      }
    }
  }
}
</script>
