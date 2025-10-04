<template>
  <div class="container">
    <h1>Tous les événements</h1>

    <div class="events-grid">
      <div v-for="event in events" :key="event.id" class="event-card">
        <h2>{{ event.titre }}</h2>
        <p>{{ event.date }} - {{ event.lieu }}</p>
        <p>{{ event.association }}</p>
        <p>{{ event.description }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "EvenementsAdmin",
  data() {
    return {
      events: [
        { id: 1, titre: "Assemblée générale", date: "2025-10-12", lieu: "EFREI", association: "EFREI Sport", description: "Présentation des projets" },
        { id: 2, titre: "Concert étudiant", date: "2025-11-25", lieu: "Amphi A", association: "EFREI Musique", description: "Concert inter-asso" }
      ]
    }
  }
}
</script>

<style>
.container { padding: 2rem; }
.events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; margin-top: 1rem; }
.event-card { background: #fff; padding: 1.5rem; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.08); }
.event-card h2 { margin-bottom: 0.5rem; color: #1e3a8a; }
</style>
