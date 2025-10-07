<template>
  <div class="page">
    <!-- HEADER -->
    <header class="header">
      <h1>Mes événements</h1>
      <p>Consultez, inscrivez-vous et suivez vos événements associatifs.</p>
    </header>

    <!-- ================== FILTRES ================== -->
    <div class="filters card">
      <!-- Filtres par statut -->
      <div class="filter-buttons">
        <button
          v-for="s in statuses"
          :key="s.value"
          :class="['filter-btn', { active: selectedStatus === s.value }]"
          @click="selectedStatus = s.value"
        >
          {{ s.label }}
        </button>
      </div>

      <!-- Filtres par association -->
      <div class="filter-assos">
        <span>Association :</span>
        <div class="asso-buttons">
          <button
            v-for="a in availableAssociations"
            :key="a"
            :class="['asso-btn', { active: selectedAssociation === a }]"
            @click="selectedAssociation = a"
          >
            {{ a }}
          </button>
          <button
            :class="['asso-btn', { active: selectedAssociation === 'all' }]"
            @click="selectedAssociation = 'all'"
          >
            Toutes
          </button>
        </div>
      </div>
    </div>

    <!-- ================== LISTE DES ÉVÉNEMENTS ================== -->
    <section class="card section">
      <div class="section-title">
        <h2>Événements à venir</h2>
      </div>

      <!-- État de chargement -->
      <div v-if="loading" class="loading">Chargement des événements...</div>

      <!-- Liste -->
      <ul v-else class="event-list">
        <li v-for="e in filteredEvents" :key="e.id" class="event-item">
          <div class="event-info">
            <h3>{{ e.name }}</h3>
            <div class="event-meta">
              <span class="muted">{{ formatDate(e.date) }}</span>
              <span class="badge">{{ e.association }}</span>
            </div>
            <p class="muted">{{ e.description }}</p>
          </div>

          <div class="event-actions">
            <button
              class="btn tiny"
              :class="e.registered ? 'outline' : ''"
              @click="toggleRegistration(e)"
            >
              {{ e.registered ? 'Se désinscrire' : 'S’inscrire' }}
            </button>
          </div>
        </li>
      </ul>

      <p v-if="!filteredEvents.length && !loading" class="muted center">
        Aucun événement trouvé pour ce filtre.
      </p>
    </section>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabase'

export default {
  name: 'EvenementsAdherent',
  data() {
    return {
      loading: true,
      userId: null,
      events: [],

      // Filtres
      selectedStatus: 'all',
      selectedAssociation: 'all',
      statuses: [
        { label: 'Tous', value: 'all' },
        { label: 'Inscrit', value: 'registered' },
        { label: 'Non inscrit', value: 'not_registered' }
      ]
    }
  },
  computed: {
    // Liste filtrée selon les filtres choisis
    filteredEvents() {
      return this.events.filter((e) => {
        const matchStatus =
          this.selectedStatus === 'all' ||
          (this.selectedStatus === 'registered' && e.registered) ||
          (this.selectedStatus === 'not_registered' && !e.registered)
        const matchAsso =
          this.selectedAssociation === 'all' || e.association === this.selectedAssociation
        return matchStatus && matchAsso
      })
    },
    availableAssociations() {
      const unique = [...new Set(this.events.map((e) => e.association))].filter(Boolean)
      return unique.length ? unique : ['Aucune association']
    }
  },
  async created() {
    await this.loadEvents()
  },
  methods: {
    // =============================================
    // ========= CHARGEMENT DES ÉVÉNEMENTS =========
    // =============================================
    async loadEvents() {
      this.loading = true
      try {
        // 1️⃣ Récupération de l'utilisateur connecté
        const { data: uData, error: uError } = await supabase.auth.getUser()
        if (uError) throw uError
        const user = uData?.user
        this.userId = user?.id
        if (!this.userId) throw new Error('Utilisateur non connecté')

        // 2️⃣ Récupération des événements à venir
        const now = new Date().toISOString()
        const { data: events, error } = await supabase
          .from('evenements')
          .select('id, name, description, date, associations(name)')
          .gte('date', now)
          .order('date', { ascending: true })

        if (error) throw error

        // 3️⃣ Récupération des inscriptions de l’utilisateur
        const { data: registrations, error: errReg } = await supabase
          .from('participants')
          .select('event_id')
          .eq('user_id', this.userId)
        if (errReg) throw errReg

        const registeredEventIds = registrations.map((r) => r.event_id)

        // 4️⃣ Formatage final pour affichage
        this.events = (events || []).map((e) => ({
          id: e.id,
          name: e.name,
          description: e.description || '',
          date: e.date,
          association: e.associations?.name || '—',
          registered: registeredEventIds.includes(e.id)
        }))
      } catch (err) {
        console.error('❌ Erreur chargement événements :', err)
      } finally {
        this.loading = false
      }
    },

    // =============================================
    // ========= GESTION DES INSCRIPTIONS ===========
    // =============================================
    async toggleRegistration(event) {
      try {
        // Si déjà inscrit → désinscription
        if (event.registered) {
          const { error } = await supabase
            .from('participants')
            .delete()
            .eq('event_id', event.id)
            .eq('user_id', this.userId)
          if (error) throw error
          event.registered = false
        } else {
          // Sinon → inscription
          const { error } = await supabase.from('participants').insert({
            event_id: event.id,
            user_id: this.userId,
            created_at: new Date().toISOString()
          })
          if (error) throw error
          event.registered = true
        }
      } catch (err) {
        console.error('Erreur gestion inscription :', err)
      }
    },

    // =============================================
    // ========= UTILITAIRE AFFICHAGE DATE ==========
    // =============================================
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }
  }
}
</script>


<style scoped>
/* ---------- Layout ---------- */
.page {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}
.header {
  margin-bottom: 1.75rem;
}
.header h1 {
  color: #111;
  font-size: 1.8rem;
  margin: 0 0 0.35rem;
}
.header p {
  color: #555;
  margin: 0;
}

/* ---------- Cartes ---------- */
.card {
  background: #fff;
  border-radius: 12px;
  padding: 1.1rem;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06);
}

/* ---------- Filtres ---------- */
.filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.filter-btn {
  border: 1px solid #d7dbe3;
  background: #fff;
  color: #333;
  border-radius: 8px;
  padding: 0.4rem 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.filter-btn:hover {
  background: #f3f6ff;
  border-color: #2563eb;
  color: #2563eb;
}
.filter-btn.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}
.filter-assos {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.filter-assos span {
  font-weight: 600;
  color: #333;
}
.asso-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.asso-btn {
  border: 1px solid #d7dbe3;
  background: #fff;
  color: #333;
  border-radius: 8px;
  padding: 0.3rem 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.asso-btn:hover {
  background: #f3f6ff;
  border-color: #2563eb;
  color: #2563eb;
}
.asso-btn.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

/* ---------- Liste ---------- */
.event-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.event-item {
  background: #f9fafb;
  border-radius: 10px;
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}
.event-info h3 {
  margin: 0;
  font-size: 1rem;
  color: #111;
}
.event-meta {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  margin-top: 0.25rem;
}
.badge {
  background: #eef2ff;
  color: #3745a3;
  border-radius: 999px;
  padding: 0.1rem 0.5rem;
  font-size: 0.75rem;
}
.muted {
  color: #6b7280;
}
.center {
  text-align: center;
  padding: 1rem 0;
}

/* ---------- Boutons ---------- */
.btn {
  background: #2563eb;
  color: #fff;
  border: 0;
  border-radius: 10px;
  height: 34px;
  padding: 0 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
}
.btn:hover {
  background: #1e40af;
}
.btn.tiny {
  height: 30px;
  padding: 0 12px;
  font-size: 0.9rem;
}
.btn.outline {
  background: #fff;
  color: #2563eb;
  border: 1px solid #2563eb;
}
.btn.outline:hover {
  background: #f0f4ff;
}

/* ---------- Responsive ---------- */
@media (max-width: 720px) {
  .page {
    padding: 1rem;
  }
  .filters {
    gap: 1rem;
  }
  .filter-buttons,
  .asso-buttons {
    flex-wrap: wrap;
  }
  .event-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
