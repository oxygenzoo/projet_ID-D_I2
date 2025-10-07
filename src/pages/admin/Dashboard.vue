<template>
  <div class="page">
    <header class="header">
      <h1>Tableau de bord — Administrateur</h1>
      <p>Vue d’ensemble des associations, des adhérents, des cotisations et des événements.</p>
    </header>

    <!-- ========== Ligne 1 : Stats globales ========== -->
    <section class="row stats">
      <div class="card kpi">
        <div class="kpi-top">
          <h3>Associations</h3>
          <span class="kpi-val">{{ stats.associations }}</span>
        </div>
        <p class="muted">Total sur la plateforme</p>
      </div>
      <div class="card kpi">
        <div class="kpi-top">
          <h3>Adhérents</h3>
          <span class="kpi-val">{{ stats.members }}</span>
        </div>
        <p class="muted">Comptes actifs</p>
      </div>
      <div class="card kpi">
        <div class="kpi-top">
          <h3>Cotisations payées</h3>
          <span class="kpi-val">{{ stats.duesPaid }}%</span>
        </div>
        <p class="muted">Sur l’ensemble des associations</p>
      </div>
      <div class="card kpi">
        <div class="kpi-top">
          <h3>Événements à venir</h3>
          <span class="kpi-val">{{ stats.upcomingEvents }}</span>
        </div>
        <p class="muted">30 prochains jours</p>
      </div>
    </section>

    <!-- ========== Ligne 2 : Graphiques SVG ========== -->
    <section class="row graphs">
      <!-- Donut cotisations -->
      <div class="card">
        <div class="section-title">
          <h2>Répartition cotisations</h2>
        </div>
        <div class="donut-wrap">
          <svg viewBox="0 0 42 42" class="donut">
            <circle class="donut-ring" cx="21" cy="21" r="15.9155"></circle>
            <circle class="donut-segment paid"
                    cx="21" cy="21" r="15.9155"
                    :stroke-dasharray="paidArc + ' ' + (100 - paidArc)"
                    stroke-dashoffset="25"></circle>
          </svg>
          <div class="donut-center">
            <strong>{{ stats.duesPaid }}%</strong>
            <span class="muted">payées</span>
          </div>
        </div>
      </div>

      <!-- Histogramme des adhérents -->
      <div class="card">
        <div class="section-title">
          <h2>Évolution des adhérents</h2>
        </div>
        <div class="bars">
          <svg :viewBox="'0 0 ' + (months.length * 20) + ' 120'" class="bar-svg">
            <g v-for="(v, i) in stats.membersPerMonth" :key="i">
              <rect
                :x="i * 20 + 5"
                :y="120 - scale(v)"
                width="12"
                :height="scale(v)"
                rx="3" ry="3"
                class="bar-rect"
              />
              <text :x="i * 20 + 11" y="116" class="bar-label">{{ months[i] }}</text>
            </g>
          </svg>
        </div>
      </div>
    </section>

    <!-- ========== Ligne 3 : Activités récentes ========== -->
    <section class="card">
      <div class="section-title">
        <h2>Activités récentes</h2>
      </div>
      <ul class="activity">
        <li v-for="a in recent" :key="a.id">
          <div class="act-item">
            <div class="dot"></div>
            <div class="act-body">
              <p class="act-text">{{ a.text }}</p>
              <small class="muted">{{ a.when }}</small>
            </div>
          </div>
        </li>
      </ul>
      <p v-if="!recent.length" class="muted">Aucune activité récente.</p>
    </section>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabase'

export default {
  name: 'AdminDashboard',
  data() {
    return {
      // =========================
      // Données globales admin
      // =========================
      stats: {
        associations: 0,      // total des assos dans la BDD
        members: 0,           // nombre d’adhérents (role = "adherent")
        duesPaid: 0,          // % moyen des cotisations payées
        upcomingEvents: 0,    // nombre d’événements à venir
        membersPerMonth: []   // évolution adhérents (fake stats ou à calculer + tard)
      },
      months: ['J','F','M','A','M','J','J','A','S','O','N','D'],
      recent: [] // activités récentes (créations, paiements, etc.)
    }
  },
  computed: {
    // arc du donut (exprimé en %)
    paidArc() {
      return this.stats.duesPaid
    }
  },
  async created() {
    // Lorsqu'on arrive sur la page admin :
    // on charge toutes les infos nécessaires depuis Supabase.
    await this.loadAllStats()
    await this.loadRecentActivity()
  },
  methods: {
    // =============== FETCH GLOBAL ===============
    async loadAllStats() {
      try {
        // --- 1️ Total associations ---
        const { count: countAssos } = await supabase
          .from('associations')
          .select('*', { count: 'exact', head: true })
        this.stats.associations = countAssos || 0

        // --- 2️ Total adhérents (profil.role = adherent) ---
        const { count: countMembers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'adherent')
        this.stats.members = countMembers || 0

        // --- 3️ Cotisations payées ---
        // On calcule la moyenne du taux payé pour toutes les cotisations
        const { data: dues } = await supabase
          .from('cotisations')
          .select('paid_count, total_count')
        if (dues && dues.length) {
          const totalPaid = dues.reduce((acc, d) => acc + (d.paid_count || 0), 0)
          const total = dues.reduce((acc, d) => acc + (d.total_count || 0), 0)
          this.stats.duesPaid = total ? Math.round((totalPaid / total) * 100) : 0
        }

        // --- 4️ Événements à venir (dans les 30 jours) ---
        const now = new Date()
        const nextMonth = new Date()
        nextMonth.setDate(now.getDate() + 30)

        const { count: upcoming } = await supabase
          .from('evenements')
          .select('*', { count: 'exact', head: true })
          .gte('date', now.toISOString())
          .lte('date', nextMonth.toISOString())

        this.stats.upcomingEvents = upcoming || 0

        // --- 5️ Stats adhérents par mois (temporaire) ---
        // Pour la démo on crée un tableau simulé basé sur le total d'adhérents
        // À terme, il faudra faire un GROUP BY par mois dans Supabase
        this.stats.membersPerMonth = Array.from({ length: 12 }, (_, i) =>
          Math.round((this.stats.members / 12) * (0.8 + Math.random() * 0.4))
        )
      } catch (err) {
        console.error('Erreur de chargement stats admin:', err)
      }
    },

    // =============== ACTIVITÉS RÉCENTES ===============
    async loadRecentActivity() {
      try {
        // On combine plusieurs tables pour créer un "fil d’actualité"
        const [assos, cotis, evts] = await Promise.all([
          supabase.from('associations').select('name, created_at').order('created_at', { ascending: false }).limit(3),
          supabase.from('cotisations').select('title, created_at').order('created_at', { ascending: false }).limit(3),
          supabase.from('evenements').select('name, created_at').order('created_at', { ascending: false }).limit(3)
        ])

        // On fusionne tout en un seul tableau "recent"
        const combined = []

        assos.data?.forEach(a =>
          combined.push({
            id: 'a' + a.name,
            text: `Nouvelle association inscrite : ${a.name}`,
            when: this.formatRelative(a.created_at)
          })
        )
        cotis.data?.forEach(c =>
          combined.push({
            id: 'c' + c.title,
            text: `Cotisation créée : ${c.title}`,
            when: this.formatRelative(c.created_at)
          })
        )
        evts.data?.forEach(e =>
          combined.push({
            id: 'e' + e.name,
            text: `Événement ajouté : ${e.name}`,
            when: this.formatRelative(e.created_at)
          })
        )

        // Tri global par date
        this.recent = combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      } catch (err) {
        console.error('Erreur chargement activités :', err)
      }
    },

    // =============== OUTILS D'AFFICHAGE ===============
    scale(v) {
      const max = Math.max(...this.stats.membersPerMonth, 1)
      return Math.max(4, Math.round((v / max) * 100))
    },

    // format "il y a X jours/heures"
    formatRelative(dateStr) {
      const d = new Date(dateStr)
      const diffH = Math.floor((Date.now() - d.getTime()) / 3600000)
      if (diffH < 1) return 'à l’instant'
      if (diffH < 24) return `il y a ${diffH} h`
      const days = Math.floor(diffH / 24)
      return `il y a ${days} jour${days > 1 ? 's' : ''}`
    }
  }
}
</script>


<style scoped>
.page{ padding:2rem; max-width:1200px; margin:0 auto; }
.header{ margin-bottom:1.75rem; }
.header h1{ color:#111; font-size:1.8rem; margin:0 0 .35rem; }
.header p{ color:#555; margin:0; }

.row{ display:grid; grid-template-columns:repeat(12,1fr); gap:1.25rem; margin-bottom:1.25rem; }
.stats .card{ grid-column: span 3; }
.graphs .card{ grid-column: span 6; }

.card{ background:#fff; border-radius:12px; padding:1.1rem; box-shadow:0 8px 18px rgba(0,0,0,.06); }
.section-title{ display:flex; align-items:center; justify-content:space-between; gap:.75rem; margin-bottom:.75rem; }
.section-title h2{ color:#111; font-size:1.2rem; margin:0; }

.kpi-top{ display:flex; align-items:baseline; justify-content:space-between; }
.kpi h3{ margin:0; color:#111; font-size:1rem; }
.kpi-val{ font-size:1.8rem; font-weight:800; color:#2563eb; }
.muted{ color:#6b7280; }

.donut-wrap{ position:relative; width:220px; height:160px; margin:0 auto; display:flex; align-items:center; justify-content:center; }
.donut{ width:160px; height:160px; transform:rotate(-90deg); }
.donut-ring{ fill:transparent; stroke:#e5e7eb; stroke-width:6; }
.donut-segment.paid{ fill:transparent; stroke:#2563eb; stroke-width:6; stroke-linecap:round; }
.donut-center{ position:absolute; text-align:center; }
.donut-center strong{ font-size:1.6rem; color:#111; display:block; }

.bars{ overflow-x:auto; }
.bar-svg{ width:100%; height:160px; }
.bar-rect{ fill:#2563eb; }
.bar-label{ font-size:.65rem; text-anchor:middle; fill:#6b7280; }

.activity{ list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:.7rem; }
.act-item{ display:flex; gap:.6rem; align-items:flex-start; background:#f9fafb; border-radius:10px; padding:.75rem .9rem; box-shadow:0 1px 3px rgba(0,0,0,.04); }
.dot{ width:8px; height:8px; border-radius:50%; background:#2563eb; margin-top:.35rem; }
.act-text{ margin:0 0 .15rem; color:#1f2937; }

@media (max-width:980px){
  .stats .card, .graphs .card{ grid-column: span 12; }
}
@media (max-width:720px){ .page{ padding:1rem; } }
</style>
