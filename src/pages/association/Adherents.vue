<template>
  <div class="container">
    <h1>Gestion des adhérents</h1>

    <table class="styled-table">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Email</th>
          <th>Date d'adhésion</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in adherents" :key="a.id">
          <td>{{ a.nom }}</td>
          <td>{{ a.email }}</td>
          <td>{{ a.date }}</td>
          <td>
            <span :class="['status', a.statut.toLowerCase()]">
              {{ a.statut }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "AdherentsAsso",
  data() {
    return {
      adherents: [
        { id: 1, nom: "Alice Dupont", email: "alice@mail.com", date: "01/01/2025", statut: "Actif" },
        { id: 2, nom: "Bob Martin", email: "bob@mail.com", date: "15/02/2025", statut: "Inactif" }
      ]
    }
  }
}
</script>

<style>
.container { padding: 2rem; }
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
.styled-table th { background: #f3f4f6; }
.status.actif {
  background: #d1fae5;
  color: #065f46;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
}
.status.inactif {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
}
</style>
