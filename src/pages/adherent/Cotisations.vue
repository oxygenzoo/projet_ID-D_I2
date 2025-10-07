<template>
  <div class="page">
    <!-- HEADER -->
    <header class="header">
      <h1>Mes cotisations</h1>
      <p>Consultez et suivez vos paiements d’adhésion aux associations.</p>
    </header>

    <!-- ==================== FILTRES ==================== -->
    <div class="filters card">
      <div class="filter-group">
        <label>Statut :</label>
        <select v-model="selectedStatus">
          <option value="all">Toutes</option>
          <option value="paid">Payées</option>
          <option value="pending">En attente</option>
        </select>
      </div>

      <div class="filter-group">
        <label>Année :</label>
        <select v-model="selectedYear">
          <option value="all">Toutes</option>
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>
    </div>

    <!-- ==================== LISTE DES COTISATIONS ==================== -->
    <section class="card section">
      <div class="section-title">
        <h2>Historique des cotisations</h2>
      </div>

      <div v-if="loading" class="loading">Chargement des cotisations...</div>

      <ul v-else class="coti-list">
        <li v-for="c in filteredCotisations" :key="c.id" class="coti-item">
          <div class="coti-head">
            <div>
              <h3>{{ c.association }}</h3>
              <p class="muted">Année {{ c.year }}</p>
            </div>
            <div class="status-group">
              <span class="amount">{{ c.amount }} €</span>
              <span :class="['badge', c.paid ? 'ok' : 'pending']">
                {{ c.paid ? 'Payée' : 'En attente' }}
              </span>
            </div>
          </div>

          <!-- Barre de progression -->
          <div class="progress">
            <div
              class="bar"
              :class="c.paid ? 'ok' : 'pending'"
              :style="{ width: c.paid ? '100%' : c.progress + '%' }"
            ></div>
          </div>

          <div class="coti-footer">
            <small class="muted">Mise à jour : {{ formatDate(c.updated_at) }}</small>
            <button
              v-if="!c.paid"
              class="btn tiny outline"
              @click="payerCotisation(c)"
            >
              Régler
            </button>
          </div>
        </li>
      </ul>

      <p v-if="!filteredCotisations.length && !loading" class="muted center">
        Aucune cotisation trouvée pour ce filtre.
      </p>
    </section>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabase'

export default {
  name: 'CotisationsAdherent',
  data() {
    return {
      loading: true,
      cotisations: [],
      userId: null,
      selectedStatus: 'all',
      selectedYear: 'all'
    }
  },
  computed: {
    // Filtres actifs sur la liste
    filteredCotisations() {
      return this.cotisations.filter((c) => {
        const matchStatus =
          this.selectedStatus === 'all' ||
          (this.selectedStatus === 'paid' && c.paid) ||
          (this.selectedStatus === 'pending' && !c.paid)
        const matchYear =
          this.selectedYear === 'all' || c.year === Number(this.selectedYear)
        return matchStatus && matchYear
      })
    },
    // Liste des années disponibles
    availableYears() {
      const years = [...new Set(this.cotisations.map((c) => c.year))].sort((a, b) => b - a)
      return years.length ? years : [new Date().getFullYear()]
    }
  },
  async created() {
    await this.loadCotisations()
  },
  methods: {
    // ============================================================
    // =============== CHARGEMENT DES COTISATIONS =================
    // ============================================================
    async loadCotisations() {
      this.loading = true
      try {
        // 1️⃣ Identification de l'utilisateur connecté
        const { data: uData, error: uErr } = await supabase.auth.getUser()
        if (uErr) throw uErr
        const user = uData?.user
        this.userId = user?.id
        if (!this.userId) throw new Error('Utilisateur non connecté')

        // 2️⃣ Lecture des cotisations liées à cet utilisateur
        const { data, error } = await supabase
          .from('cotisations')
          .select('id, associations(name), amount, year, status, progress, updated_at')
          .eq('adherent_id', this.userId)
          .order('year', { ascending: false })

        if (error) throw error

        // 3️⃣ Mise en forme des données
        this.cotisations = (data || []).map((c) => ({
          id: c.id,
          association: c.associations?.name || '—',
          year: c.year || new Date().getFullYear(),
          amount: c.amount || 0,
          paid: c.status === 'paid',
          progress: c.progress ?? (c.status === 'paid' ? 100 : 40),
          updated_at: c.updated_at
        }))
      } catch (err) {
        console.error('❌ Erreur chargement cotisations :', err)
      } finally {
        this.loading = false
      }
    },

    // ============================================================
    // =============== PAIEMENT D’UNE COTISATION ==================
    // ============================================================
    async payerCotisation(coti) {
      try {
        // Simulation d’un paiement
        alert(`Paiement simulé pour ${coti.association} (${coti.amount} €)`)

        // 1️⃣ Mise à jour en base
        await supabase
          .from('cotisations')
          .update({
            status: 'paid',
            progress: 100,
            updated_at: new Date().toISOString()
          })
          .eq('id', coti.id)

        // 2️⃣ Mise à jour locale instantanée
        coti.paid = true
        coti.progress = 100
      } catch (err) {
        console.error('Erreur paiement cotisation :', err)
      }
    },

    // ============================================================
    // =============== FORMATAGE DE DATE ==========================
    // ============================================================
    formatDate(date) {
      return new Date(date).toLocaleDateString('fr-FR', {
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

/* ---------- Carte ---------- */
.card {
  background: #fff;
  border-radius: 12px;
  padding: 1.1rem;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06);
}

/* ---------- Filtres ---------- */
.filters {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.filter-group label {
  color: #333;
  font-weight: 600;
  font-size: 0.9rem;
}
.filter-group select {
  height: 36px;
  border-radius: 8px;
  border: 1px solid #d7dbe3;
  padding: 0 0.6rem;
  background: #fff;
  color: #111;
  cursor: pointer;
  transition: all 0.15s ease;
}
.filter-group select:hover {
  border-color: #2563eb;
}

/* ---------- Cotisations ---------- */
.coti-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.coti-item {
  background: #f9fafb;
  border-radius: 10px;
  padding: 1rem 1.25rem;
}
.coti-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.coti-head h3 {
  margin: 0;
  font-size: 1rem;
  color: #111;
}
.status-group {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.amount {
  font-weight: 700;
  color: #111;
}
.badge {
  border-radius: 999px;
  padding: 0.25rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge.ok {
  background: #dcfce7;
  color: #166534;
}
.badge.pending {
  background: #fef3c7;
  color: #92400e;
}
.progress {
  background: #e5e7eb;
  height: 6px;
  border-radius: 4px;
  overflow: hidden;
  margin: 0.6rem 0;
}
.bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}
.bar.ok {
  background: #22c55e;
}
.bar.pending {
  background: #facc15;
}
.coti-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .coti-item {
    padding: 0.9rem 1rem;
  }
}
</style>
