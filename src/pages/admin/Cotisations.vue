<template>
  <div class="container">
    <h1>Toutes les cotisations</h1>

    <table class="styled-table">
      <thead>
        <tr>
          <th>Adhérent</th>
          <th>Association</th>
          <th>Montant</th>
          <th>Date limite</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in cotisations" :key="c.id">
          <td>{{ c.nom }}</td>
          <td>{{ c.association }}</td>
          <td>{{ c.montant }} €</td>
          <td>{{ c.dateLimite }}</td>
          <td>
            <span :class="['status', c.statut.toLowerCase()]">
              {{ c.statut }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "CotisationsAdmin",
  data() {
    return {
      cotisations: [
        { id: 1, nom: "Alice Dupont", association: "EFREI Sport", montant: 50, dateLimite: "2025-10-15", statut: "Payée" },
        { id: 2, nom: "Bob Martin", association: "EFREI Musique", montant: 50, dateLimite: "2025-10-30", statut: "En attente" }
      ]
    }
  }
}
</script>

<style>
.container { padding: 2rem; }
.styled-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
.styled-table th, .styled-table td { padding: 0.8rem 1rem; border-bottom: 1px solid #e5e7eb; }
.styled-table th { background: #f3f4f6; }
.status.payée { background: #d1fae5; color: #065f46; padding: 0.3rem 0.6rem; border-radius: 6px; }
</style>
