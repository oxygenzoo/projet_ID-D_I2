<template>
  <div class="container">
    <h1>Liste des adhérents (toutes associations)</h1>

    <table class="styled-table">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Email</th>
          <th>Association</th>
          <th>Date d’adhésion</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="a in adherents" :key="a.id">
          <td>{{ a.nom }}</td>
          <td>{{ a.email }}</td>
          <td>{{ a.association }}</td>
          <td>{{ a.date }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "AdherentsAdmin",
  data() {
    return {
      adherents: [
        { id: 1, nom: "Alice Dupont", email: "alice@mail.com", association: "EFREI Sport", date: "2025-01-01" },
        { id: 2, nom: "Bob Martin", email: "bob@mail.com", association: "EFREI Musique", date: "2025-02-15" }
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
}
.styled-table th {
  background: #f3f4f6;
}
</style>
