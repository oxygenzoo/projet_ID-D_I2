<template>
  <div class="container">
    <h1>Dashboard Admin</h1>

    <div class="dashboard-grid">
      <div class="card">
        <h2>Associations</h2>
        <p>{{ stats.associations }}</p>
      </div>
      <div class="card">
        <h2>Adhérents</h2>
        <p>{{ stats.adherents }}</p>
      </div>
      <div class="card">
        <h2>Cotisations</h2>
        <p>{{ stats.cotisations }}</p>
      </div>
      <div class="card">
        <h2>Événements</h2>
        <p>{{ stats.evenements }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "DashboardAdmin",
  data() {
    return {
      stats: {
        associations: 5,
        adherents: 120,
        cotisations: "230 / 300 payées",
        evenements: 12
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
