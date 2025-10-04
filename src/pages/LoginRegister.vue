<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Titre -->
      <h1>{{ isLogin ? "Connexion" : "Inscription" }}</h1>
      <p>
        {{ isLogin 
          ? "Connectez-vous à votre compte Agora CRM" 
          : "Créez un compte pour rejoindre Agora CRM" }}
      </p>

      <!-- Message d'erreur -->
      <p v-if="error" class="error">{{ error }}</p>

      <!-- Formulaire -->
      <form @submit.prevent="handleSubmit">
        <!-- Inscription = pseudo + email + mdp -->
        <div v-if="!isLogin">
          <label for="name">Nom complet</label>
          <input type="text" id="name" v-model="form.name" required />
        </div>

        <label for="email">Email</label>
        <input type="email" id="email" v-model="form.email" required />

        <label for="password">Mot de passe</label>
        <input type="password" id="password" v-model="form.password" required minlength="6"/>

        <!-- Inscription = rôle -->
        <div v-if="!isLogin">
          <label for="role">Rôle</label>
          <select id="role" v-model="form.role">
            <option value="adherent">Adhérent</option>
            <option value="association">Association</option>
          </select>
        </div>

        <!-- Bouton -->
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire" }}
        </button>
      </form>

      <!-- Switch connexion / inscription -->
      <p class="switch">
        {{ isLogin ? "Pas encore de compte ?" : "Déjà un compte ?" }}
        <a href="#" @click.prevent="isLogin = !isLogin">
          {{ isLogin ? "Créer un compte" : "Se connecter" }}
        </a>
      </p>
    </div>
  </div>
</template>

<script>
import { supabase } from '../lib/supabase'

export default {
  name: 'LoginRegister',
  data() {
    return {
      isLogin: true,
      loading: false,
      error: '',
      form: {
        name: '',
        email: '',
        password: '',
        role: 'adherent'
      }
    }
  },
  methods: {
    async handleSubmit() {
      this.error = ''
      this.loading = true
      try {
        // Vérif basique côté client
        if (!this.form.email || !this.form.password) {
          throw new Error("Veuillez remplir tous les champs.")
        }
        if (!this.isLogin && this.form.password.length < 6) {
          throw new Error("Le mot de passe doit contenir au moins 6 caractères.")
        }

        if (this.isLogin) {
          // ✅ Connexion
          const { data, error } = await supabase.auth.signInWithPassword({
            email: this.form.email,
            password: this.form.password
          })
          if (error) throw error

          localStorage.setItem("user", JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            role: data.user.user_metadata?.role || "adherent"
          }))

          this.$router.push("/")
        } else {
          // ✅ Inscription
          const { data, error } = await supabase.auth.signUp({
            email: this.form.email,
            password: this.form.password,
            options: {
              data: { full_name: this.form.name, role: this.form.role }
            }
          })
          if (error) throw error

          // Stocker profil dans une table `profiles` (optionnel)
          if (data.user) {
            await supabase.from('profiles').insert({
              id: data.user.id,
              full_name: this.form.name,
              role: this.form.role
            })
          }

          localStorage.setItem("user", JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            role: this.form.role
          }))

          this.$router.push("/")
        }
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 70px);
  background: #f3f4f6;
}
.auth-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;
}
.auth-card h1 { margin-bottom: 0.5rem; color: #1e3a8a; }
.auth-card p { margin-bottom: 1.5rem; color: #4b5563; }
form { display: flex; flex-direction: column; gap: 1rem; text-align: left; }
label { font-weight: 500; color: #374151; font-size: 0.9rem; }
input, select {
  padding: 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
}
input:focus, select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37,99,235,0.2);
}
.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
.btn-primary:hover { background: #1d4ed8; }
.switch { margin-top: 1rem; font-size: 0.9rem; }
.switch a { color: #2563eb; font-weight: bold; cursor: pointer; }
.error { color: #dc2626; margin-bottom: 1rem; }
</style>
