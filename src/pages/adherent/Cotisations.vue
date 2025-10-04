<template>
  <div class="container">
    <h1>Mes cotisations</h1>

    <table class="styled-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Montant</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cotisation in cotisations" :key="cotisation.id">
          <td>{{ cotisation.date }}</td>
          <td>{{ cotisation.montant }} €</td>
          <td>
            <span :class="['status', cotisation.statut.toLowerCase()]">
              {{ cotisation.statut }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "CotisationsAdherent",
  data() {
    return {
      cotisations: [
        { id: 1, date: "01/01/2025", montant: 50, statut: "Payée" },
        { id: 2, date: "01/03/2025", montant: 50, statut: "En attente" }
      ]
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
</style>
