<template>
  <div class="container">
    <h1>Bienvenue, {{ user.fullName }}</h1>

    <!-- Rejoindre une association -->
    <div class="join-association">
      <h2>Rejoindre une association</h2>
      <input
        type="text"
        v-model="joinCode"
        placeholder="Entrer le code de l'association"
      />
      <button @click="joinAssociation">Rejoindre</button>
      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">{{ success }}</p>
    </div>

    <!-- Associations déjà rejointes -->
    <div class="my-associations">
      <h2>Mes associations</h2>
      <ul>
        <li v-for="asso in associations" :key="asso.id">
          {{ asso.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { supabase } from "../../lib/supabase"

export default {
  name: "DashboardAdherent",
  props: { user: Object },
  data() {
    return {
      joinCode: "",
      associations: [],
      error: "",
      success: ""
    }
  },
  async created() {
    await this.fetchAssociations()
  },
  methods: {
    async fetchAssociations() {
      const { data, error } = await supabase
        .from("memberships")
        .select("associations(id, name)")
        .eq("user_id", this.user.id)

      if (!error && data) {
        this.associations = data.map(m => m.associations)
      }
    },
    async joinAssociation() {
      this.error = ""
      this.success = ""

      // Vérifie si le code correspond à une asso
      const { data: asso, error: err1 } = await supabase
        .from("associations")
        .select("id, name")
        .eq("join_code", this.joinCode)
        .single()

      if (err1 || !asso) {
        this.error = "Code invalide."
        return
      }

      // Ajoute dans memberships
      const { error: err2 } = await supabase
        .from("memberships")
        .insert({ user_id: this.user.id, association_id: asso.id })

      if (err2) {
        this.error = "Tu es déjà membre de cette association."
      } else {
        this.success = `Tu as rejoint l'association "${asso.name}" !`
        this.associations.push(asso)
        this.joinCode = ""
      }
    }
  }
}
</script>

<style>
.join-association {
  margin: 2rem 0;
}
input {
  padding: 0.6rem;
  margin-right: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}
button {
  padding: 0.6rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
button:hover {
  background: #1d4ed8;
}
.error { color: #dc2626; }
.success { color: #16a34a; }
</style>
