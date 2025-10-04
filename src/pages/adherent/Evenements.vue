<template>
  <div class="container">
    <h1>Événements</h1>

    <div class="events-grid">
      <div v-for="event in events" :key="event.id" class="event-card">
        <h2>{{ event.titre }}</h2>
        <p>{{ event.date }} - {{ event.lieu }}</p>
        <p>{{ event.description }}</p>
        <button @click="participer(event.id)">
          {{ event.participe ? "Déjà inscrit" : "S'inscrire" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "EvenementsAdherent",
  data() {
    return {
      events: [
        {
          id: 1,
          titre: "Assemblée générale",
          date: "12/10/2025",
          lieu: "Salle EFREI",
          description: "Présentation des activités de l'année",
          participe: false
        },
        {
          id: 2,
          titre: "Tournoi de foot",
          date: "25/11/2025",
          lieu: "Stade municipal",
          description: "Tournoi inter-étudiants",
          participe: true
        }
      ]
    }
  },
  methods: {
    participer(id) {
      const event = this.events.find(e => e.id === id)
      if (event && !event.participe) {
        event.participe = true
        alert(`Inscription réussie à "${event.titre}" !`)
      }
    }
  }
}
</script>

<style>
.container {
  padding: 2rem;
}
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}
.event-card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}
.event-card h2 {
  margin: 0 0 0.5rem 0;
  color: #1e3a8a;
}
button {
  margin-top: 1rem;
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
