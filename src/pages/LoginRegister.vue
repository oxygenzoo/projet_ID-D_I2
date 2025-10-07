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
        <div v-if="!isLogin">
          <label for="name">Nom complet</label>
          <input type="text" id="name" v-model="form.name" required />
        </div>

        <label for="email">Email</label>
        <input type="email" id="email" v-model="form.email" required />

        <label for="password">Mot de passe</label>
        <input
          type="password"
          id="password"
          v-model="form.password"
          required
          minlength="6"
        />

        <div v-if="!isLogin">
          <label for="role">Rôle</label>
          <select id="role" v-model="form.role">
            <option value="adherent">Adhérent</option>
            <option value="association">Association</option>
          </select>
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? "Chargement..." : isLogin ? "Se connecter" : "S'inscrire" }}
        </button>
      </form>

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
import { supabase } from "../lib/supabase"

export default {
  name: "LoginRegister",
  data() {
    return {
      isLogin: true,
      loading: false,
      error: "",
      form: {
        name: "",
        email: "",
        password: "",
        role: "adherent",
      },
    }
  },
  methods: {
    async handleSubmit() {
      this.error = ""
      this.loading = true

      try {
        // Validation personnalisée de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.form.email)) {
          throw new Error("Adresse email invalide. Exemple : nom@votredomaine.xyz");
        }

        if (this.isLogin) {
          // --- Connexion ---
          const { data, error } = await supabase.auth.signInWithPassword({
            email: this.form.email,
            password: this.form.password,
          })
          if (error) throw error

          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, role, email")
            .eq("id", data.user.id)
            .single()

          if (profile) {
            localStorage.setItem(
              "user",
              JSON.stringify({
                id: data.user.id,
                email: profile.email,
                fullName: profile.full_name,
                role: profile.role,
                isLoggedIn: true,
              })
            )

            if (profile.role === "association") {
              this.$router.push("/association/dashboard")
            } else if (profile.role === "admin") {
              this.$router.push("/admin/dashboard")
            } else {
              this.$router.push("/adherent/dashboard")
            }
          }
        } else {
          // --- Inscription ---
          const { data, error } = await supabase.auth.signUp({
            email: this.form.email,
            password: this.form.password,
            options: {
              data: { full_name: this.form.name, role: this.form.role },
              emailRedirectTo: null,
            },
          })
          if (error) throw error

          const user = data.user
          if (user) {
            await supabase.from("profiles").insert({
              id: user.id,
              full_name: this.form.name,
              email: this.form.email,
              role: this.form.role,
            })

            if (this.form.role === "association") {
              const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase()
              await supabase.from("associations").insert({
                owner_id: user.id,
                name: this.form.name,
                join_code: joinCode,
              })
            }

            localStorage.setItem(
              "user",
              JSON.stringify({
                id: user.id,
                email: this.form.email,
                fullName: this.form.name,
                role: this.form.role,
                isLoggedIn: true,
              })
            )

            if (this.form.role === "association") {
              this.$router.push("/association/dashboard")
            } else {
              this.$router.push("/adherent/dashboard")
            }
          }
        }
      } catch (e) {
        console.error("❌ Erreur inscription / connexion :", e)
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
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
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;
}
.auth-card h1 {
  margin-bottom: 0.5rem;
  color: #1e3a8a;
}
.auth-card p {
  margin-bottom: 1.5rem;
  color: #4b5563;
}
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: left;
}
label {
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}
input,
select {
  padding: 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
}
input:focus,
select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
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
.btn-primary:hover {
  background: #1d4ed8;
}
.switch {
  margin-top: 1rem;
  font-size: 0.9rem;
}
.switch a {
  color: #2563eb;
  font-weight: bold;
  cursor: pointer;
}
.error {
  color: #dc2626;
  margin-bottom: 1rem;
}
</style>
