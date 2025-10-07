<template>
  <div class="page">
    <header class="header">
      <h1>Gestion des adhérents</h1>
      <p>Rechercher, filtrer, modifier les rôles et statuts des adhérents.</p>
    </header>

    <!-- ========== Filtres de recherche ========== -->
    <section class="card">
      <div class="filters">
        <input
          type="text"
          class="input"
          placeholder="Rechercher un adhérent (nom, email)…"
          v-model="q"
        />
        <select class="input" v-model="role">
          <option value="">Tous rôles</option>
          <option value="président">Président</option>
          <option value="trésorier">Trésorier</option>
          <option value="secrétaire">Secrétaire</option>
          <option value="coach">Coach</option>
          <option value="membre-actif">Membre actif</option>
          <option value="membre">Membre</option>
        </select>
        <select class="input" v-model="status">
          <option value="">Tous statuts</option>
          <option value="active">Actif</option>
          <option value="pending">En attente</option>
          <option value="suspended">Suspendu</option>
        </select>
      </div>
    </section>

    <!-- ========== Liste des adhérents ========== -->
    <section class="card">
      <div class="section-title">
        <h2>Liste des adhérents</h2>
        <button class="btn" @click="openCreate = true">+ Ajouter</button>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Association</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th style="width:140px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in filtered" :key="m.id">
              <td>{{ m.full_name }}</td>
              <td>{{ m.email }}</td>
              <td>{{ m.association }}</td>
              <td>
                <select class="cell-input" v-model="m.role" @change="saveRole(m)">
                  <option value="président">Président</option>
                  <option value="trésorier">Trésorier</option>
                  <option value="secrétaire">Secrétaire</option>
                  <option value="coach">Coach</option>
                  <option value="membre-actif">Membre actif</option>
                  <option value="membre">Membre</option>
                </select>
              </td>
              <td>
                <select class="cell-input" v-model="m.status" @change="saveStatus(m)">
                  <option value="active">Actif</option>
                  <option value="pending">En attente</option>
                  <option value="suspended">Suspendu</option>
                </select>
              </td>
              <td class="actions">
                <button class="btn tiny outline" @click="remind(m)">Relancer</button>
                <button class="btn tiny ghost" @click="remove(m)">Supprimer</button>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="6" class="empty">Aucun adhérent trouvé.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ========== Modal création adhérent ========== -->
    <div v-if="openCreate" class="modal">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Ajouter un adhérent</h3>
          <button class="close" @click="openCreate = false">×</button>
        </div>

        <form class="form" @submit.prevent="createMember">
          <label>
            <span>Nom complet</span>
            <input class="input" v-model="draft.full_name" required />
          </label>
          <label>
            <span>Email</span>
            <input class="input" type="email" v-model="draft.email" required />
          </label>
          <label>
            <span>Association</span>
            <select class="input" v-model="draft.association_id" required>
              <option disabled value="">Sélectionnez une association</option>
              <option v-for="a in associations" :key="a.id" :value="a.id">
                {{ a.name }}
              </option>
            </select>
          </label>
          <label>
            <span>Rôle</span>
            <select class="input" v-model="draft.role" required>
              <option value="membre">Membre</option>
              <option value="membre-actif">Membre actif</option>
              <option value="coach">Coach</option>
              <option value="secrétaire">Secrétaire</option>
              <option value="trésorier">Trésorier</option>
              <option value="président">Président</option>
            </select>
          </label>
          <label>
            <span>Statut</span>
            <select class="input" v-model="draft.status" required>
              <option value="active">Actif</option>
              <option value="pending">En attente</option>
              <option value="suspended">Suspendu</option>
            </select>
          </label>

          <div class="modal-actions">
            <button type="button" class="btn ghost" @click="openCreate = false">Annuler</button>
            <button type="submit" class="btn">Créer</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabase'

export default {
  name: 'AdminAdherents',
  data() {
    return {
      // ========== Filtres ==========
      q: '',
      role: '',
      status: '',

      // ========== Modal ==========
      openCreate: false,
      draft: { full_name: '', email: '', association_id: '', role: 'membre', status: 'active' },

      // ========== Données ==========
      members: [],
      associations: []
    }
  },
  computed: {
    // Liste filtrée selon texte, rôle et statut
    filtered() {
      return this.members.filter((m) => {
        const q = this.q.toLowerCase()
        const okQ =
          !q ||
          m.full_name?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q) ||
          m.association?.toLowerCase().includes(q)
        const okR = !this.role || m.role === this.role
        const okS = !this.status || m.status === this.status
        return okQ && okR && okS
      })
    }
  },
  async created() {
    await this.fetchAssociations()
    await this.fetchMembers()
  },
  methods: {
    // =======================================================
    // ============= FETCH LISTE DES ASSOCIATIONS ============
    // =======================================================
    async fetchAssociations() {
      const { data, error } = await supabase.from('associations').select('id, name')
      if (error) console.error('Erreur associations:', error)
      else this.associations = data || []
    },

    // =======================================================
    // ============= FETCH LISTE DES ADHERENTS ===============
    // =======================================================
    async fetchMembers() {
      try {
        const { data, error } = await supabase
          .from('adherents_associations')
          .select('adherent_id, role, status, associations(name), profiles(full_name, email)')
        if (error) throw error

        // On reformate les données pour la table
        this.members = (data || []).map((m) => ({
          id: m.adherent_id,
          full_name: m.profiles?.full_name || '—',
          email: m.profiles?.email || '—',
          association: m.associations?.name || '—',
          role: m.role || 'membre',
          status: m.status || 'active'
        }))
      } catch (err) {
        console.error('Erreur fetch membres :', err)
      }
    },

    // =======================================================
    // ============= SAUVEGARDE RÔLE ET STATUT ===============
    // =======================================================
    async saveRole(m) {
      try {
        await supabase
          .from('adherents_associations')
          .update({ role: m.role })
          .eq('adherent_id', m.id)
      } catch (err) {
        console.error('Erreur update rôle:', err)
      }
    },
    async saveStatus(m) {
      try {
        await supabase
          .from('adherents_associations')
          .update({ status: m.status })
          .eq('adherent_id', m.id)
      } catch (err) {
        console.error('Erreur update statut:', err)
      }
    },

    // =======================================================
    // ============= RELANCE (NOTIFICATION) ==================
    // =======================================================
    async remind(m) {
      try {
        await supabase.from('notifications').insert({
          user_id: m.id,
          title: 'Rappel de participation',
          message: `Bonjour ${m.full_name}, votre statut est actuellement "${m.status}". Merci de vérifier vos cotisations.`,
          created_at: new Date()
        })
        alert(`Notification envoyée à ${m.full_name}`)
      } catch (err) {
        console.error('Erreur envoi notif:', err)
      }
    },

    // =======================================================
    // ============= SUPPRESSION D’UN ADHÉRENT ===============
    // =======================================================
    async remove(m) {
      if (!confirm(`Supprimer ${m.full_name} ?`)) return
      try {
        // On supprime le lien adherent <-> association
        await supabase.from('adherents_associations').delete().eq('adherent_id', m.id)
        this.members = this.members.filter((x) => x.id !== m.id)
      } catch (err) {
        console.error('Erreur suppression:', err)
      }
    },

    // =======================================================
    // ============= CREATION D’UN ADHERENT ==================
    // =======================================================
    async createMember() {
      try {
        // 1️ Création dans la table "profiles"
        const { data: profile, error: errP } = await supabase
          .from('profiles')
          .insert({
            full_name: this.draft.full_name.trim(),
            email: this.draft.email.trim(),
            role: 'adherent'
          })
          .select()
          .single()
        if (errP) throw errP

        // 2️ Lien vers son association
        const { error: errA } = await supabase.from('adherents_associations').insert({
          adherent_id: profile.id,
          association_id: this.draft.association_id,
          role: this.draft.role,
          status: this.draft.status
        })
        if (errA) throw errA

        // 3️ Refresh des données
        await this.fetchMembers()
        this.openCreate = false
        this.draft = { full_name: '', email: '', association_id: '', role: 'membre', status: 'active' }
      } catch (err) {
        console.error('Erreur création adhérent:', err)
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

.card{ background:#fff; border-radius:12px; padding:1.1rem; box-shadow:0 8px 18px rgba(0,0,0,.06); margin-bottom:1.25rem; }
.section-title{ display:flex; align-items:center; justify-content:space-between; gap:.75rem; margin-bottom:.75rem; }
.section-title h2{ color:#111; font-size:1.2rem; margin:0; }

.filters{ display:flex; gap:.75rem; flex-wrap:wrap; }
.input{ height:38px; border:1px solid #d7dbe3; border-radius:8px; padding:0 .6rem; outline:none; flex:1; min-width:220px; }
.input:focus{ border-color:#2563eb; box-shadow:0 0 0 2px rgba(37,99,235,.15); }

.table-wrap{ overflow:auto; }
.table{ width:100%; border-collapse:collapse; }
th, td{ padding:.75rem .6rem; border-bottom:1px solid #eef1f6; text-align:left; color:#1f2937; }
th{ font-weight:700; font-size:.92rem; color:#111; }
.cell-input{ height:32px; padding:0 .5rem; border:1px solid #d7dbe3; border-radius:8px; }
.actions{ display:flex; gap:.5rem; }

.btn{ background:#2563eb; color:#fff; border:0; border-radius:10px; height:36px; padding:0 14px; font-weight:700; cursor:pointer; transition:background .15s; }
.btn:hover{ background:#1e40af; }
.btn.tiny{ height:30px; padding:0 10px; font-size:.9rem; }
.btn.ghost{ background:transparent; color:#2563eb; }
.btn.outline{ background:#fff; color:#1f3c8f; border:1px solid #2563eb; }
.empty{ text-align:center; color:#6b7280; padding:1.5rem 0; }

.modal{ position:fixed; inset:0; background:rgba(0,0,0,.25); display:flex; align-items:center; justify-content:center; padding:1rem; }
.modal-card{ background:#fff; width:100%; max-width:520px; border-radius:12px; box-shadow:0 18px 40px rgba(0,0,0,.18); }
.modal-head{ display:flex; align-items:center; justify-content:space-between; padding:1rem 1.1rem; border-bottom:1px solid #eef1f6; }
.modal-head h3{ margin:0; color:#111; }
.close{ background:transparent; border:0; font-size:1.4rem; cursor:pointer; }
.form{ padding:1.1rem; display:grid; gap:.75rem; }
.form label{ display:flex; flex-direction:column; gap:.35rem; text-align:left; }
.modal-actions{ display:flex; justify-content:flex-end; gap:.5rem; margin-top:.5rem; }

@media (max-width:720px){ .page{ padding:1rem; } }
</style>
