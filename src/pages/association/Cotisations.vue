<template>
  <div class="container">
    <h1>Gestion des cotisations</h1>

    <table class="styled-table">
      <thead>
        <tr>
          <th>Adhérent</th>
          <th>Email</th>
          <th>Montant</th>
          <th>Date limite</th>
          <th>Statut</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in cotisations" :key="c.id">
          <td>{{ c.nom }}</td>
          <td>{{ c.email }}</td>
          <td>{{ c.montant }} €</td>
          <td>{{ c.dateLimite }}</td>
          <td>
            <span :class="['status', c.statut.toLowerCase()]">
              {{ c.statut }}
            </span>
          </td>
          <td>
            <button @click="marquerPaye(c.id)" v-if="c.statut === 'En attente'">
              Marquer payé
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Ajouter une nouvelle cotisation -->
    <div class="new-cotisation">
      <h2>Nouvelle cotisation</h2>
      <input v-model="newCotisation.nom" placeholder="Nom adhérent" />
      <input v-model="newCotisation.email" placeholder="Email" />
      <input v-model="newCotisation.montant" type="number" placeholder="Montant (€)" />
      <input v-model="newCotisation.dateLimite" type="date" />
      <button @click="ajouter">Ajouter</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "CotisationsAsso",
  data() {
    return {
      cotisations: [
        { id: 1, nom: "Alice Dupont", email: "alice@mail.com", montant: 50, dateLimite: "2025-10-15", statut: "Payée" },
        { id: 2, nom: "Bob Martin", email: "bob@mail.com", montant: 50, dateLimite: "2025-10-30", statut: "En attente" }
      ],
      newCotisation: { nom: "", email: "", montant: "", dateLimite: "" }
    }
  },
  methods: {
    marquerPaye(id) {
      const cotisation = this.cotisations.find(c => c.id === id)
      if (cotisation) cotisation.statut = "Payée"
    },
    ajouter() {
      if (!this.newCotisation.nom || !this.newCotisation.email || !this.newCotisation.montant || !this.newCotisation.dateLimite) return

      this.cotisations.push({
        id: Date.now(),
        ...this.newCotisation,
        statut: "En attente"
      })
      this.newCotisation = { nom: "", email: "", montant: "", dateLimite: "" }
    }
  }
}
</script>

<style>
.container {
  padding: 2rem;
}
.styled-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
.styled-table th, .styled-table td {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}
.styled-table th {
  background: #f3f4f6;
}
.status {
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
}
.status.payée {
  background: #d1fae5;
  color: #065f46;
}
.new-cotisation {
  margin-top: 2rem;
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}
.new-cotisation input {
  display: block;
  width: 100%;
  margin-bottom: 0.8rem;
  padding: 0.6rem;
  border-radius: 6px;
  border: 1px solid #d1d5db;
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
</style>
