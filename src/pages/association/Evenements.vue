<template>
  <div class="container">
    <h1>Gestion des événements</h1>

    <!-- Liste des événements -->
    <div class="events-grid">
      <div v-for="event in events" :key="event.id" class="event-card">
        <h2>{{ event.titre }}</h2>
        <p>{{ event.date }} - {{ event.lieu }}</p>
        <p>{{ event.description }}</p>
        <button @click="supprimer(event.id)">Supprimer</button>
      </div>
    </div>

    <!-- Créer un nouvel événement -->
    <div class="new-event">
      <h2>Créer un événement</h2>
      <input v-model="newEvent.titre" placeholder="Titre" />
      <input v-model="newEvent.date" type="date" />
      <input v-model="newEvent.lieu" placeholder="Lieu" />
      <textarea v-model="newEvent.description" placeholder="Description"></textarea>
      <button @click="ajouter">Ajouter</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "EvenementsAsso",
  data() {
    return {
      events: [
        { id: 1, titre: "Assemblée générale", date: "12/10/2025", lieu: "Salle EFREI", description: "Réunion annuelle" },
        { id: 2, titre: "Tournoi de foot", date: "25/11/2025", lieu: "Stade municipal", description: "Tournoi inter-étudiants" }
      ],
      newEvent: { titre: "", date: "", lieu: "", description: "" }
    }
  },
  methods: {
    ajouter() {
      if (!this.newEvent.titre || !this.newEvent.date) return
      this.events.push({
        id: Date.now(),
        ...this.newEvent
      })
      this.newEvent = { titre: "", date: "", lieu: "", description: "" }
    },
    supprimer(id) {
      this.events = this.events.filter(e => e.id !== id)
    }
  }
}
</script>

<style>
.container { padding: 2rem; }
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.event-card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}
.new-event {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}
.new-event input, .new-event textarea {
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
button:hover { background: #1d4ed8; }
</style>
