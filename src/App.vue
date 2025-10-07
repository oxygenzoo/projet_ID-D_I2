<template>
  <div id="app">
    <!-- Navbar dynamique -->
    <Navbar :user="user" @logout="logout" />

    <!-- Loader global réactif -->
    <GlobalLoader />

    <!-- Contenu principal -->
    <router-view />
    <Footer />
  </div>
</template>

<script>
import { supabase } from './lib/supabase'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import GlobalLoader from './components/GlobalLoader.vue'
import { globalState, globalActions } from './store/useGlobal.js'

export default {
  name: 'App',
  components: { Navbar, Footer, GlobalLoader },
  data() {
    return {
      user: {
        isLoggedIn: false,
        role: 'guest',
        email: null,
        fullName: null
      }
    }
  },
  created() {
    this.initAuth()
  },
  methods: {
    async initAuth() {
      globalActions.setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      this.applySession(session)
      supabase.auth.onAuthStateChange((_, session) => this.applySession(session))
      globalActions.setLoading(false)
    },
    async applySession(session) {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', session.user.id)
          .single()

        const userData = {
          isLoggedIn: true,
          role: profile?.role || 'adherent',
          email: session.user.email,
          fullName: profile?.full_name || ''
        }

        this.user = userData
        globalActions.setUser(userData)
      } else {
        const guest = { isLoggedIn: false, role: 'guest', email: null, fullName: null }
        this.user = guest
        globalActions.setUser(null)
      }
    },
    async logout() {
      globalActions.setLoading(true)
      await supabase.auth.signOut()
      globalActions.setUser(null)
      this.$router.push('/')
      globalActions.setLoading(false)
    }
  }
}
</script>

<style>
body {
  font-family: 'Inter', sans-serif;
  background: #f9fafb;
  margin: 0;
}
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
