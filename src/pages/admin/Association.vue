<template>
  <div class="page">
    <header class="header">
      <h1>Gestion des associations</h1>
      <p>Consulter, rechercher et modifier les informations des associations.</p>
    </header>

    <!-- ========== Barre de recherche et filtres ========== -->
    <section class="card">
      <div class="filters">
        <input class="input" v-model="q" placeholder="Rechercher (nom, email)..." />
        <select class="input" v-model="activity">
          <option value="">Toutes</option>
          <option value="active">Actives</option>
          <option value="inactive">Inactives</option>
        </select>
      </div>
    </section>

    <!-- ========== Indicateurs principaux ========== -->
    <section class="row stats">
      <div class="card kpi">
        <div class="kpi-top">
          <h3>Total</h3>
          <span class="kpi-val">{{ associations.length }}</span>
        </div>
        <p class="muted">Associations enregistrées</p>
      </div>
      <div class="card kpi">
        <div class="kpi-top">
          <h3>Actives</h3>
          <span class="kpi-val">{{ associations.filter(a=>a.status==='active').length }}</span>
        </div>
        <p class="muted">Au cours des 90 derniers jours</p>
      </div>
      <div class="card kpi">
        <div class="kpi-top">
          <h3>Adhérents moyens</h3>
          <span class="kpi-val">{{ avgMembers }}</span>
        </div>
        <p class="muted">Par association</p>
      </div>
      <div class="card kpi">
        <div class="kpi-top">
          <h3>Événements actifs</h3>
          <span class="kpi-val">{{ totalEvents }}</span>
        </div>
        <p class="muted">À venir</p>
      </div>
    </section>

    <!-- ========== Liste des associations ========== -->
    <section class="card">
      <div class="section-title">
        <h2>Liste des associations</h2>
        <button class="btn" @click="openEdit({})">+ Créer</button>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Code</th>
              <th>Membres</th>
              <th>Événements</th>
              <th>Statut</th>
              <th style="width:150px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in filtered" :key="a.id">
              <td>{{ a.name }}</td>
              <td>{{ a.email }}</td>
              <td><span class="code">{{ a.join_code }}</span></td>
              <td>{{ a.members_count }}</td>
              <td>{{ a.events_count }}</td>
              <td>
                <select class="cell-input" v-model="a.status" @change="saveStatus(a)">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </td>
              <td class="actions">
                <button class="btn tiny outline" @click="openEdit(a)">Modifier</button>
                <button class="btn tiny ghost" @click="remove(a)">Supprimer</button>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="7" class="empty">Aucune association trouvée.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ========== MODAL : création / édition ========== -->
    <div v-if="editOpen" class="modal">
      <div class="modal-card">
        <div class="modal-head">
          <h3>{{ edit.id ? 'Modifier l’association' : 'Créer une association' }}</h3>
          <button class="close" @click="editOpen=false">×</button>
        </div>
        <form class="form" @submit.prevent="saveAssociation">
          <label>
            <span>Nom</span>
            <input class="input" v-model="edit.name" required />
          </label>
          <label>
            <span>Email</span>
            <input class="input" type="email" v-model="edit.email" required />
          </label>
          <label>
            <span>Description</span>
            <textarea class="input" v-model="edit.description" rows="3" />
          </label>
          <label>
            <span>Code d’invitation</span>
            <input class="input" v-model="edit.join_code" placeholder="Auto si vide" />
          </label>

          <div class="modal-actions">
            <button type="button" class="btn ghost" @click="editOpen=false">Annuler</button>
            <button type="submit" class="btn">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabase'

export default {
  name: 'AdminAssociations',
  data() {
    return {
      // Auth (nécessaire pour owner_id & politiques)
      userId: null,

      // Filtres
      q: '',
      activity: '',

      // Modal
      editOpen: false,
      edit: {},

      // Données
      associations: []
    }
  },
  computed: {
    filtered() {
      const q = this.q.toLowerCase()
      return this.associations.filter(a => {
        const okQ = !q || a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q)
        const okA = !this.activity || a.status === this.activity
        return okQ && okA
      })
    },
    avgMembers() {
      if (!this.associations.length) return 0
      const sum = this.associations.reduce((acc, a) => acc + (a.members_count || 0), 0)
      return Math.round(sum / this.associations.length)
    },
    totalEvents() {
      return this.associations.reduce((acc, a) => acc + (a.events_count || 0), 0)
    }
  },
  async created() {
    // 1) On récupère l’utilisateur courant (utilisé pour owner_id & RLS)
    const { data: u } = await supabase.auth.getUser()
    this.userId = u?.user?.id || null

    // 2) On charge la liste
    await this.fetchAssociations()
  },
  methods: {
    // ============== LECTURE ==============
    async fetchAssociations() {
      try {
        const { data, error } = await supabase
          .from('associations')
          .select('id, name, email, join_code, description, status')

        if (error) throw error

        // Compléter avec les compteurs (membres actifs + évènements à venir)
        const nowIso = new Date().toISOString()
        const withCounts = await Promise.all(
          (data || []).map(async (a) => {
            const { count: membersCount } = await supabase
              .from('adherents_associations')
              .select('*', { count: 'exact', head: true })
              .eq('association_id', a.id)
              .eq('status', 'active')

            const { count: eventsCount } = await supabase
              .from('evenements')
              .select('*', { count: 'exact', head: true })
              .eq('association_id', a.id)
              .gte('date', nowIso)

            return {
              ...a,
              members_count: membersCount || 0,
              events_count: eventsCount || 0
            }
          })
        )

        this.associations = withCounts
      } catch (err) {
        console.error('Erreur fetch associations :', err)
      }
    },

    // ============== STATUT ==============
    async saveStatus(a) {
      try {
        const { error } = await supabase
          .from('associations')
          .update({ status: a.status })
          .eq('id', a.id)
        if (error) throw error
      } catch (err) {
        console.error('Erreur update statut :', err)
      }
    },

    // ============== SUPPRESSION ==============
    async remove(a) {
      if (!confirm(`Supprimer ${a.name} ?`)) return
      try {
        const { error } = await supabase.from('associations').delete().eq('id', a.id)
        if (error) throw error
        this.associations = this.associations.filter(x => x.id !== a.id)
      } catch (err) {
        console.error('Erreur suppression :', err)
      }
    },

    // ============== CRÉER / ÉDITER ==============
    openEdit(a) {
      // a vide -> création ; sinon édition
      this.edit = { ...a }
      this.editOpen = true
    },

    async saveAssociation() {
      try {
        // ⚠️ Important : on met owner_id pour satisfaire les politiques RLS “owner”
        const payload = {
          name: this.edit.name?.trim(),
          email: this.edit.email?.trim(),
          description: this.edit.description?.trim() || '',
          join_code: (this.edit.join_code?.trim() || Math.random().toString(36).substring(2, 8).toUpperCase()),
          status: this.edit.status || 'active',
          owner_id: this.userId || null
        }

        if (!this.edit.id) {
          // Création
          const { error } = await supabase.from('associations').insert(payload)
          if (error) throw error

          // Après création, on refetch pour récupérer les compteurs + respecter RLS
          await this.fetchAssociations()
        } else {
          // Mise à jour
          const { error } = await supabase
            .from('associations')
            .update(payload)
            .eq('id', this.edit.id)
          if (error) throw error

          await this.fetchAssociations()
        }

        this.editOpen = false
      } catch (err) {
        console.error('Erreur enregistrement asso :', err)
      }
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

.card{ background:#fff; border-radius:12px; padding:1.1rem; box-shadow:0 8px 18px rgba(0,0,0,.06); margin-bottom:1.25rem; }
.section-title{ display:flex; align-items:center; justify-content:space-between; gap:.75rem; margin-bottom:.75rem; }
.section-title h2{ color:#111; font-size:1.2rem; margin:0; }

.filters{ display:flex; gap:.75rem; flex-wrap:wrap; }
.input{ height:38px; border:1px solid #d7dbe3; border-radius:8px; padding:0 .6rem; outline:none; min-width:220px; }
.input:focus{ border-color:#2563eb; box-shadow:0 0 0 2px rgba(37,99,235,.15); }

.table-wrap{ overflow:auto; }
.table{ width:100%; border-collapse:collapse; }
th, td{ padding:.75rem .6rem; border-bottom:1px solid #eef1f6; text-align:left; color:#1f2937; }
th{ font-weight:700; font-size:.92rem; color:#111; }
.cell-input{ height:32px; padding:0 .5rem; border:1px solid #d7dbe3; border-radius:8px; }
.actions{ display:flex; gap:.5rem; }
.code{ background:#eef2ff; color:#3745a3; border-radius:999px; padding:.1rem .5rem; font-size:.75rem; }

.btn{ background:#2563eb; color:#fff; border:0; border-radius:10px; height:36px; padding:0 14px; font-weight:700; cursor:pointer; transition:background .15s; }
.btn:hover{ background:#1e40af; }
.btn.tiny{ height:30px; padding:0 10px; font-size:.9rem; }
.btn.ghost{ background:transparent; color:#2563eb; }
.btn.outline{ background:#fff; color:#1f3c8f; border:1px solid #2563eb; }
.empty{ text-align:center; color:#6b7280; padding:1.5rem 0; }

.modal{ position:fixed; inset:0; background:rgba(0,0,0,.25); display:flex; align-items:center; justify-content:center; padding:1rem; }
.modal-card{ background:#fff; width:100%; max-width:560px; border-radius:12px; box-shadow:0 18px 40px rgba(0,0,0,.18); }
.modal-head{ display:flex; align-items:center; justify-content:space-between; padding:1rem 1.1rem; border-bottom:1px solid #eef1f6; }
.modal-head h3{ margin:0; color:#111; }
.close{ background:transparent; border:0; font-size:1.4rem; cursor:pointer; }
.form{ padding:1.1rem; display:grid; gap:.75rem; text-align:left; }
.form label{ display:flex; flex-direction:column; gap:.35rem; }
.modal-actions{ display:flex; justify-content:flex-end; gap:.5rem; margin-top:.5rem; }

@media (max-width:980px){ .stats .card{ grid-column: span 6; } }
@media (max-width:720px){ .page{ padding:1rem; } .stats .card{ grid-column: span 12; } }
</style>
