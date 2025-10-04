<template>
  <div id="app">
    <!-- Navbar dynamique -->
    <Navbar :user="user" @toggle-auth="toggleAuth" />
    <router-view />
  </div>
</template>

<script>
import { supabase } from './lib/supabase'
import Navbar from './components/Navbar.vue'

export default {
  name: 'App',
  components: { Navbar },
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
      const { data: { session } } = await supabase.auth.getSession()
      this.applySession(session)

      supabase.auth.onAuthStateChange((_, session) => {
        this.applySession(session)
      })
    },
    async applySession(session) {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', session.user.id)
          .single()

        this.user = {
          isLoggedIn: true,
          role: profile?.role || 'adherent',
          email: session.user.email,
          fullName: profile?.full_name || ''
        }
      } else {
        this.user = { isLoggedIn: false, role: 'guest', email: null, fullName: null }
      }
    },
    async logout() {
      await supabase.auth.signOut()
      this.$router.push('/')
    }
  }
}
</script>

