<template>
  <div class="container">
    <h1>Dashboard Association</h1>

    <div class="dashboard-grid">
      <div class="card">
        <h2>Nombre d'adhérents</h2>
        <p>{{ stats.adherents }}</p>
      </div>
      <div class="card">
        <h2>Cotisations actives</h2>
        <p>{{ stats.cotisations }}</p>
      </div>
      <div class="card">
        <h2>Prochain événement</h2>
        <p>{{ stats.nextEvent }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DashboardAsso",
  data() {
    return {
      stats: {
        adherents: 32,
        cotisations: "75%",
        nextEvent: "Tournoi sportif - 25/11"
      }
    }
  }
}
</script>

<style>
.container { padding: 2rem; }
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
}
.card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}
</style>
