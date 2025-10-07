<template>
  <div class="page">
    <!-- En-tête -->
    <header class="header">
      <h1>Tableau de bord association</h1>
      <p>Gérez votre association : membres, cotisations, événements et communication.</p>
    </header>

    <!-- LIGNE 1 : Profil (gauche) + Adhérents (droite) -->
    <div class="row row-2">
      <!-- PROFIL ASSOCIATION -->
      <section class="card" :class="{ loading: loading.profile }">
        <div class="section-title">
          <h2>Profil de l’association</h2>
          <button class="btn outline tiny" @click="editProfile = !editProfile">
            {{ editProfile ? 'Fermer' : 'Modifier le profil' }}
          </button>
        </div>

        <div class="profile">
          <div class="avatar-big" aria-hidden="true">
            <span v-if="assoInitials">{{ assoInitials }}</span>
            <span v-else>?</span>
          </div>

          <div class="invite">
            <div class="invite-label">Code d’invitation</div>
            <div class="invite-code">{{ association.join_code || '—' }}</div>
            <small class="muted">Partagez ce code pour que des adhérents rejoignent votre association.</small>
          </div>
        </div>

        <div v-if="!editProfile" class="kv">
          <div class="kv-row"><span>Nom</span><strong>{{ association.name || '—' }}</strong></div>
          <div class="kv-row"><span>Email</span><strong>{{ association.email || '—' }}</strong></div>
          <div class="kv-row"><span>Description</span><strong>{{ association.description || '—' }}</strong></div>
        </div>

        <form v-else class="form" @submit.prevent="saveProfile">
          <label>
            <span>Nom</span>
            <input v-model="profileDraft.name" type="text" placeholder="Nom de l’association" />
          </label>
          <label>
            <span>Email</span>
            <input v-model="profileDraft.email" type="email" placeholder="contact@asso.fr" />
          </label>
          <label>
            <span>Description</span>
            <textarea v-model="profileDraft.description" rows="3" placeholder="Décrivez votre association"></textarea>
          </label>
          <div class="form-actions">
            <button type="button" class="btn ghost" @click="editProfile=false">Annuler</button>
            <button type="submit" class="btn">Enregistrer</button>
          </div>
        </form>
      </section>

      <!-- ADHÉRENTS -->
      <section class="card fill" :class="{ loading: loading.members }">
        <div class="section-title">
          <h2>Adhérents</h2>
          <div class="line-actions">
            <input
              class="input"
              v-model="memberSearch"
              type="text"
              placeholder="Rechercher un adhérent"
            />
            <select class="select" v-model="memberFilter">
              <option value="all">Tous</option>
              <option value="active">Actifs</option>
              <option value="pending">En attente</option>
            </select>
          </div>
        </div>

        <div v-if="filteredMembers.length" class="member-list">
          <div v-for="m in filteredMembers" :key="m.id" class="member-item">
            <div class="avatar"><span>{{ getInitials(m.full_name) }}</span></div>
            <div class="m-body">
              <div class="m-top">
                <strong class="m-name">{{ m.full_name }}</strong>
                <span :class="['pill', m.status==='active'?'ok':'warn']">
                  {{ m.status === 'active' ? 'Actif' : 'En attente' }}
                </span>
              </div>
              <div class="m-sub">{{ m.email }}</div>

              <div class="m-controls">
                <label class="role">
                  <span>Rôle</span>
                  <select v-model="m.role" @change="updateMemberRole(m)">
                    <option value="president">Président</option>
                    <option value="tresorier">Trésorier</option>
                    <option value="secretaire">Secrétaire</option>
                    <option value="coach">Coach</option>
                    <option value="membre-actif">Membre actif</option>
                    <option value="membre">Membre</option>
                  </select>
                </label>

                <button
                  class="btn tiny outline"
                  :disabled="sendingReminderId===m.id"
                  @click="remindMember(m)"
                >
                  {{ sendingReminderId===m.id ? 'Envoi...' : 'Relancer' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="muted">Aucun adhérent trouvé.</p>
      </section>
    </div>

    <!-- LIGNE 2 : Cotisations (gauche) + Événements (droite) -->
    <div class="row row-2">
      <!-- COTISATIONS -->
      <section class="card" :class="{ loading: loading.dues }">
        <div class="section-title">
          <h2>Mes cotisations</h2>
          <button class="btn outline tiny" @click="showCreateDue = !showCreateDue">
            {{ showCreateDue ? 'Fermer' : '+ Créer' }}
          </button>
        </div>

        <!-- Formulaire "dans" la section -->
        <form v-if="showCreateDue" class="form inline" @submit.prevent="createDue">
          <label>
            <span>Intitulé</span>
            <input v-model="dueDraft.title" type="text" placeholder="Cotisation 2025" required />
          </label>

          <label class="w-150">
            <span>Montant (€)</span>
            <input v-model.number="dueDraft.amount" type="number" min="0" step="1" required />
          </label>

          <label class="w-180">
            <span>Échéance</span>
            <input v-model="dueDraft.deadline" type="date" required />
          </label>

          <div class="form-actions">
            <button type="button" class="btn ghost" @click="resetDue">Annuler</button>
            <button type="submit" class="btn">Enregistrer</button>
          </div>
        </form>

        <!-- Tableau des cotisations -->
        <div v-if="dues.length" class="table">
          <div class="t-head">
            <div>Intitulé</div>
            <div class="right">Montant</div>
            <div class="right w-180">Échéance</div>
            <div class="right w-140">Statut</div>
            <div class="right w-160">Taux paiement</div>
          </div>
          <div v-for="d in dues" :key="d.id" class="t-row">
            <div class="t-title">{{ d.title }}</div>
            <div class="right">{{ d.amount.toFixed(0) }} €</div>
            <div class="right w-180">{{ formatDate(d.deadline) }}</div>
            <div class="right w-140">
              <span :class="['pill', d.status==='paid' ? 'ok' : 'warn']">
                {{ d.status === 'paid' ? 'Payée' : 'Ouverte' }}
              </span>
            </div>
            <div class="right w-160">
              <div class="progress"><div class="bar" :style="{width: d.rate+'%'}"></div></div>
            </div>
          </div>
        </div>
        <p v-else class="muted">Aucune cotisation créée.</p>
      </section>

      <!-- ÉVÉNEMENTS -->
      <section class="card" :class="{ loading: loading.events }">
        <div class="section-title">
          <h2>Événements</h2>
          <button class="btn outline tiny" @click="showCreateEvent = !showCreateEvent">
            {{ showCreateEvent ? 'Fermer' : '+ Créer' }}
          </button>
        </div>

        <!-- Formulaire inline -->
        <form v-if="showCreateEvent" class="form inline" @submit.prevent="createEvent">
          <label class="grow">
            <span>Nom</span>
            <input v-model="eventDraft.name" type="text" placeholder="Stage Bachata" required />
          </label>

          <label class="w-180">
            <span>Date</span>
            <input v-model="eventDraft.date" type="date" required />
          </label>

          <label class="w-180">
            <span>Type</span>
            <select v-model="eventDraft.type">
              <option value="free">Gratuit</option>
              <option value="paid">Payant</option>
            </select>
          </label>

          <label v-if="eventDraft.type==='paid'" class="w-150">
            <span>Montant (€)</span>
            <input v-model.number="eventDraft.amount" type="number" min="0" step="1" required />
          </label>

          <label v-if="eventDraft.type==='paid'" class="w-180">
            <span>Échéance</span>
            <input v-model="eventDraft.due_date" type="date" required />
          </label>

          <label class="grow block">
            <span>Description</span>
            <textarea v-model="eventDraft.description" rows="2" placeholder="Quelques mots..." />
          </label>

          <div class="form-actions">
            <button type="button" class="btn ghost" @click="resetEvent">Annuler</button>
            <button type="submit" class="btn">Enregistrer</button>
          </div>
        </form>

        <!-- Liste lisible -->
        <div v-if="events.length" class="event-list">
          <div v-for="e in events" :key="e.id" class="event-item">
            <div class="event-body">
              <div class="event-title">
                <strong>{{ e.name }}</strong>
                <span class="muted"> — {{ e.date_fmt }}</span>
              </div>
              <div class="event-desc" v-if="e.description">{{ e.description }}</div>
              <div class="event-meta">
                <span :class="['pill', e.type==='free' ? 'ok' : 'warn']">
                  {{ e.type==='free' ? 'Gratuit' : ('Payant · ' + e.amount + ' €') }}
                </span>
              </div>
            </div>
            <div class="event-actions">
              <button class="btn tiny outline" @click="notifyEvent(e)">Notifier les membres</button>
            </div>
          </div>
        </div>
        <p v-else class="muted">Aucun événement pour le moment.</p>
      </section>
    </div>

    <!-- LIGNE 3 : Stats & Notifications -->
    <div class="row row-2">
      <!-- STATS / GRAPHIQUES (SVG maison, aucune lib) -->
      <section class="card">
        <div class="section-title">
          <h2>Statistiques</h2>
            <StatCard
              title="Adhérents actifs"
              :value="stats.membersCount"
              description="Membres actuellement inscrits"
              :loading="loading.members"
              :error="error.members"
            />
            <StatCard
              title="Événements à venir"
              :value="stats.eventsCount"
              description="Prévu ce mois-ci"
              :loading="loading.events"
              :error="error.events"
            />
            <StatCard
              title="Taux de paiement"
              :value="stats.paymentRate"
              description="Cotisations réglées"
              format="percent"
              :loading="loading.dues"
              :error="error.dues"
            />
        </div>
      </section>

      <!-- NOTIFICATIONS -->
      <section class="card" :class="{ loading: loading.notifications }">
        <div class="section-title">
          <h2>Notifications envoyées</h2>
          <button class="btn outline tiny" @click="showSendNotif = !showSendNotif">
            {{ showSendNotif ? 'Fermer' : '+ Envoyer' }}
          </button>
        </div>

        <form v-if="showSendNotif" class="form inline" @submit.prevent="sendNotification">
          <label class="grow">
            <span>Titre</span>
            <input v-model="notifDraft.title" type="text" placeholder="Rappel cotisation" required />
          </label>
          <label class="grow block">
            <span>Message</span>
            <textarea v-model="notifDraft.message" rows="2" placeholder="Votre message" required />
          </label>
          <div class="form-actions">
            <button type="button" class="btn ghost" @click="resetNotif">Annuler</button>
            <button type="submit" class="btn">Envoyer</button>
          </div>
        </form>

        <div v-if="notifications.length" class="notif-list">
          <div v-for="n in notifications" :key="n.id" class="notif-item">
            <div class="notif-head">
              <strong>{{ n.title }}</strong>
              <span class="muted">{{ n.date_fmt }}</span>
            </div>
            <div class="notif-body">{{ n.message }}</div>
          </div>
        </div>
        <p v-else class="muted">Aucune notification récente.</p>
      </section>

      <section class="row stats">
        
      </section>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabase'
import StatCard from '@/components/StatCard.vue'

export default {
  name: 'AssociationDashboard',
  components: { StatCard },
  data() {
    return {
      // ======== Données principales ========
      // Stats générales (affichées dans les cartes)
      stats: {
        membersCount: 0,
        eventsCount: 0,
        paymentRate: 0
      },

      // États de chargement et d'erreur pour chaque module
      loading: {
        profile: false,
        members: false,
        dues: false,
        events: false,
        notifications: false
      },
      error: {
        members: '',
        events: '',
        dues: ''
      },

      // Informations de l’utilisateur connecté (récup depuis Supabase)
      user: { id: '', email: '' },

      // ======== PROFIL ASSOCIATION ========
      // Données du profil de l’association actuelle
      association: { id: null, name: '', email: '', description: '', join_code: '' },
      editProfile: false, // pour basculer entre vue et édition
      profileDraft: { name: '', email: '', description: '' }, // copie modifiable du profil

      // ======== ADHÉRENTS ========
      members: [], // liste complète des adhérents reliés à cette asso
      memberSearch: '', // champ de recherche
      memberFilter: 'all', // filtre "Tous / Actifs / En attente"
      sendingReminderId: null, // pour savoir à qui on envoie une notif

      // ======== COTISATIONS ========
      dues: [], // liste des cotisations
      showCreateDue: false, // toggle du formulaire de création
      dueDraft: { title: '', amount: 0, deadline: '' }, // brouillon de cotisation

      // ======== ÉVÉNEMENTS ========
      events: [], // liste des événements
      showCreateEvent: false, // toggle du formulaire
      eventDraft: { name: '', date: '', type: 'free', amount: 0, due_date: '', description: '' },

      // ======== NOTIFICATIONS ========
      notifications: [],
      showSendNotif: false,
      notifDraft: { title: '', message: '' },

      // ======== Stats simplifiées ========
      stats: {
        membersPerMonth: [3, 4, 5, 4, 6, 7, 8, 9, 10, 12, 12, 13],
        paidCount: 0,
        totalDues: 0
      }
    }
  },
  computed: {
    // Initiales à partir du nom de l’association
    assoInitials() {
      return this.getInitials(this.association.name)
    },

    // Liste filtrée selon la recherche ou le statut
    filteredMembers() {
      let list = [...this.members]
      if (this.memberSearch) {
        const q = this.memberSearch.toLowerCase()
        list = list.filter(m => (m.full_name || '').toLowerCase().includes(q))
      }
      if (this.memberFilter !== 'all') {
        list = list.filter(m => m.status === (this.memberFilter === 'active' ? 'active' : 'pending'))
      }
      return list
    },

    // Calculs annexes pour graphiques/statistiques
    maxMembers() {
      return Math.max(1, ...this.stats.membersPerMonth)
    },
    donutPaid() {
      const { paidCount, totalDues } = this.stats
      const ratio = totalDues ? (paidCount / totalDues) : 0
      // périmètre du cercle (2πr) ~ 289 → pour SVG animé
      return (289 * ratio).toFixed(1)
    }
  },
  async created() {
    // Au montage du composant, on récupère d’abord la session utilisateur,
    // puis toutes les données liées à son asso.
    await this.init()
    await this.fetchStats()
  },
  methods: {
    // ===================== CHARGEMENT INITIAL =====================
    async init() {
      // On récupère la session Supabase (pour connaître l’utilisateur connecté)
      const { data: uData } = await supabase.auth.getUser()
      if (uData?.user) {
        this.user.id = uData.user.id
        this.user.email = uData.user.email
      }

      // Ensuite, on charge tout en parallèle (gain de perfs)
      await Promise.all([
        this.fetchAssociation(),
        this.fetchMembers(),
        this.fetchDues(),
        this.fetchEvents(),
        this.fetchNotifications()
      ])

      this.computeStats()
    },

    // ===================== FETCH : ASSOCIATION =====================
    async fetchAssociation() {
      try {
        this.loading.profile = true
        const { data, error } = await supabase
          .from('associations')
          .select('id, name, email, description, join_code')
          .eq('owner_id', this.user.id)
          .single()
        if (error) throw error
        this.association = data || {}

        // Remplir le formulaire de brouillon (pour édition)
        this.profileDraft = {
          name: this.association.name || '',
          email: this.association.email || '',
          description: this.association.description || ''
        }
      } finally {
        this.loading.profile = false
      }
    },

    // ===================== FETCH : ADHÉRENTS =====================
    async fetchMembers() {
      try {
        this.loading.members = true
        // On joint adherents_associations + profiles (grâce à foreign key)
        const { data, error } = await supabase
          .from('adherents_associations')
          .select('role, status, profiles:adherent_id(id, full_name, email)')
          .eq('association_id', this.association.id)

        if (error) throw error

        // Mise en forme pour la vue
        this.members = (data || []).map(row => ({
          id: row.profiles?.id,
          full_name: row.profiles?.full_name,
          email: row.profiles?.email,
          role: row.role || 'membre',
          status: row.status || 'active'
        }))
      } finally {
        this.loading.members = false
      }
    },

    // ===================== FETCH : COTISATIONS =====================
    async fetchDues() {
      try {
        this.loading.dues = true
        const { data, error } = await supabase
          .from('cotisations')
          .select('id, title, amount, deadline, status, paid_count, total_count')
          .eq('association_id', this.association.id)
          .order('created_at', { ascending: false })
        if (error) throw error

        // Calcul du taux de paiement pour chaque cotisation
        this.dues = (data || []).map(d => ({
          ...d,
          rate: d.total_count ? Math.round((d.paid_count / d.total_count) * 100) : 0
        }))
      } finally {
        this.loading.dues = false
      }
    },

    // ===================== FETCH : ÉVÉNEMENTS =====================
    async fetchEvents() {
      try {
        this.loading.events = true
        const { data, error } = await supabase
          .from('evenements')
          .select('id, name, date, type, amount, due_date, description')
          .eq('association_id', this.association.id)
          .order('date', { ascending: true })
        if (error) throw error

        // On formate les dates pour l’affichage (JJ/MM/AAAA)
        this.events = (data || []).map(e => ({
          ...e,
          date_fmt: new Date(e.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
        }))
      } finally {
        this.loading.events = false
      }
    },

    // ===================== FETCH : NOTIFICATIONS =====================
    async fetchNotifications() {
      try {
        this.loading.notifications = true
        const { data, error } = await supabase
          .from('notifications')
          .select('id, title, message, created_at')
          .eq('association_id', this.association.id)
          .order('created_at', { ascending: false })
          .limit(10)
        if (error) throw error

        this.notifications = (data || []).map(n => ({
          ...n,
          date_fmt: new Date(n.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })
        }))
      } finally {
        this.loading.notifications = false
      }
    },

    // ===================== PROFIL =====================
    async saveProfile() {
      // Sauvegarde des modifications du profil (update SQL)
      const payload = {
        name: this.profileDraft.name.trim(),
        email: this.profileDraft.email.trim(),
        description: this.profileDraft.description.trim()
      }
      await supabase.from('associations').update(payload).eq('id', this.association.id)
      this.association = { ...this.association, ...payload }
      this.editProfile = false
    },

    // ===================== ADHÉRENTS : Rôle + Rappel =====================
    async updateMemberRole(m) {
      // Met à jour le rôle de l’adhérent dans la table pivot
      await supabase
        .from('adherents_associations')
        .update({ role: m.role })
        .eq('association_id', this.association.id)
        .eq('adherent_id', m.id)
    },

    async remindMember(m) {
      // Envoie une notification "Rappel cotisation" à un adhérent
      this.sendingReminderId = m.id
      try {
        await supabase.from('notifications').insert({
          association_id: this.association.id,
          user_id: m.id,
          title: 'Rappel cotisation',
          message: `Bonjour ${m.full_name.split(' ')[0]}, pensez à régler votre cotisation.`,
        })
        await this.fetchNotifications()
      } finally {
        this.sendingReminderId = null
      }
    },

    // ===================== COTISATIONS : CRUD =====================
    resetDue() {
      this.dueDraft = { title: '', amount: 0, deadline: '' }
      this.showCreateDue = false
    },
    async createDue() {
      const payload = {
        association_id: this.association.id,
        title: this.dueDraft.title.trim(),
        amount: this.dueDraft.amount || 0,
        deadline: this.dueDraft.deadline,
        status: 'open',
        paid_count: 0,
        total_count: this.members.length
      }
      await supabase.from('cotisations').insert(payload)
      this.resetDue()
      await this.fetchDues()
      this.computeStats()
    },

    // ===================== ÉVÉNEMENTS : CRUD =====================
    resetEvent() {
      this.eventDraft = { name: '', date: '', type: 'free', amount: 0, due_date: '', description: '' }
      this.showCreateEvent = false
    },
    async createEvent() {
      const payload = {
        association_id: this.association.id,
        name: this.eventDraft.name.trim(),
        date: this.eventDraft.date,
        type: this.eventDraft.type,
        amount: this.eventDraft.type === 'paid' ? (this.eventDraft.amount || 0) : 0,
        due_date: this.eventDraft.type === 'paid' ? this.eventDraft.due_date : null,
        description: this.eventDraft.description?.trim() || null
      }
      await supabase.from('evenements').insert(payload)
      this.resetEvent()
      await this.fetchEvents()
    },
    async notifyEvent(e) {
      // Envoi d’une notif générale à tous les adhérents
      await supabase.from('notifications').insert({
        association_id: this.association.id,
        title: `Nouvel évènement : ${e.name}`,
        message: e.type === 'free'
          ? `Rendez-vous le ${e.date_fmt}.`
          : `Évènement payant (${e.amount} €). Échéance ${e.due_date ? new Date(e.due_date).toLocaleDateString('fr-FR') : ''}.`
      })
      await this.fetchNotifications()
    },

    // ===================== NOTIFICATIONS =====================
    resetNotif() {
      this.notifDraft = { title: '', message: '' }
      this.showSendNotif = false
    },
    async sendNotification() {
      await supabase.from('notifications').insert({
        association_id: this.association.id,
        title: this.notifDraft.title.trim(),
        message: this.notifDraft.message.trim()
      })
      this.resetNotif()
      await this.fetchNotifications()
    },

    // ===================== STATS + UTILITAIRES =====================
    computeStats() {
      // Comptage simple pour les cartes de stats
      this.stats.totalDues = this.dues.length
      this.stats.paidCount = this.dues.filter(d => d.status === 'paid').length
    },
    getInitials(s) {
      if (!s) return ''
      const parts = s.trim().split(/\s+/)
      const first = parts[0]?.[0] || ''
      const last = parts[1]?.[0] || ''
      return (first + last).toUpperCase()
    },
    formatDate(d) {
      if (!d) return '—'
      return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }
  }
}
</script>


<style scoped>
/* ---------- Layout global ---------- */
.page { max-width: 1200px; margin: 0 auto; padding: 2rem; }
.header { margin-bottom: 1.25rem; }
.header h1 { color:#111; font-size:1.8rem; margin:0 0 .35rem; }
.header p { color:#555; margin:0; }

.row {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}
.row-2 > .card { grid-column: span 6; }
.card.fill { min-height: 360px; }

/* ---------- Cartes ---------- */
.card{
  background:#fff;
  border-radius: 12px;
  padding: 1.1rem;
  box-shadow: 0 8px 18px rgba(0,0,0,.06);
}
.card.loading { opacity:.75; }

.section-title{
  display:flex; align-items:center; justify-content:space-between; gap:.75rem;
  margin-bottom: .8rem;
}
.section-title h2{ color:#111; font-size:1.2rem; margin:0; }

/* ---------- Profil ---------- */
.profile{
  display:flex; align-items:center; gap:1rem; margin-bottom: .8rem;
}
.avatar-big{
  width:120px; height:120px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  background:#2442a6; color:#fff; font-weight:800; font-size:2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,.08);
}
.invite { display:flex; flex-direction:column; gap:.25rem; }
.invite-label{ color:#6b7280; font-size:.9rem; }
.invite-code{
  display:inline-block; padding:.35rem .6rem; border:1px dashed #3b82f6; border-radius:10px;
  font-weight:800; letter-spacing:.06em; color:#111; background:#f7fbff;
}

.kv{ border-top:1px solid #f1f3f7; padding-top:.6rem; }
.kv-row{ display:flex; align-items:center; justify-content:space-between; padding:.45rem 0; }
.kv-row span{ color:#6b7280; }

/* ---------- Champs & boutons ---------- */
.form{ display:grid; grid-template-columns: 1fr; gap:.7rem; }
.form.inline{ grid-template-columns: 1.2fr .6fr .7fr .6fr .8fr; align-items:end; }
.form.inline .block{ grid-column: 1 / -1; }
.form.inline .grow{ grid-column: auto / span 2; }
.form .w-150{ width:150px; }
.form .w-160{ width:160px; }
.form .w-180{ width:180px; }

label{ display:flex; flex-direction:column; gap:.25rem; }
label span{ color:#6b7280; font-size:.9rem; }
input, textarea, select{
  height:38px; padding:0 .6rem; border:1px solid #d7dbe3; border-radius:8px; outline:none;
}
textarea{ height:auto; padding:.6rem; }
input:focus, textarea:focus, select:focus{ border-color:#2563eb; box-shadow: 0 0 0 2px rgba(37,99,235,.15); }

.form-actions{ display:flex; gap:.5rem; justify-content:flex-end; }

.btn{
  background:#2563eb; color:#fff; border:0; border-radius:10px; height:34px; padding:0 14px;
  font-weight:700; cursor:pointer; transition:background .15s ease;
}
.btn:hover{ background:#1e40af; }
.btn.tiny{ height:30px; padding:0 12px; font-size:.9rem; }
.btn.ghost{ background:transparent; color:#2563eb; }
.btn.outline{ background:#fff; color:#1f3c8f; border:1px solid #2563eb; }
.btn.outline:hover{ background:#f7f8fb; }

.input{ height:34px; border:1px solid #d7dbe3; border-radius:10px; padding:0 .6rem; }
.select{ height:34px; border:1px solid #d7dbe3; border-radius:10px; padding:0 .4rem; }

/* ---------- Members ---------- */
.member-list{ display:flex; flex-direction:column; gap:.7rem; }
.member-item{
  display:flex; gap:.75rem; align-items:flex-start; background:#f9fafb; border-radius:12px; padding:.8rem 1rem;
}
.avatar{ width:36px; height:36px; border-radius:50%; background:#EEF2FF; color:#2442a6; font-weight:800; display:flex; align-items:center; justify-content:center; }
.m-body{ flex:1; }
.m-top{ display:flex; align-items:center; gap:.5rem; margin-bottom:.15rem; }
.m-name{ color:#111; }
.m-sub{ color:#6b7280; font-size:.95rem; }
.m-controls{ display:flex; align-items:center; gap:.5rem; margin-top:.5rem; flex-wrap:wrap; }
.role{ display:flex; align-items:center; gap:.5rem; }
.role > span{ color:#6b7280; font-size:.9rem; }
.role select{ height:32px; padding:0 .5rem; border:1px solid #d7dbe3; border-radius:8px; }

/* ---------- Pills ---------- */
.pill{ display:inline-block; padding:.18rem .5rem; border-radius:999px; font-size:.8rem; font-weight:700; }
.pill.ok{ background:#E8F8ED; color:#16a34a; }
.pill.warn{ background:#FFF5E6; color:#d97706; }

/* ---------- Table (dues) ---------- */
.table{ border:1px solid #eef0f6; border-radius:12px; overflow:hidden; }
.t-head, .t-row{ display:grid; grid-template-columns: 1fr .4fr .6fr .5fr .7fr; gap:.75rem; align-items:center; }
.t-head{ background:#fbfbfd; color:#6b7280; font-weight:700; padding:.6rem .8rem; }
.t-row{ padding:.7rem .8rem; border-top:1px solid #f1f3f7; }
.t-title{ color:#111; }
.right{ text-align:right; }
.progress{ background:#e5e7eb; height:8px; border-radius:4px; overflow:hidden; }
.progress .bar{ height:100%; background:#2563eb; }

/* ---------- Events ---------- */
.event-list{ display:flex; flex-direction:column; gap:.75rem; }
.event-item{
  display:flex; align-items:center; justify-content:space-between; gap:1rem;
  background:#f9fafb; border-radius:12px; padding:.85rem 1rem;
}
.event-title{ font-size:1rem; color:#111; margin-bottom:.15rem; }
.event-desc{ color:#374151; margin-bottom:.25rem; }

/* ---------- Stats ---------- */
.stats{ display:grid; grid-template-columns: 1fr 1fr; gap:1rem; }
.stat-item h3{ margin:.2rem 0 .6rem; color:#111; }
.chart{ width:100%; height:auto; }
.bar-blue{ fill:#2563eb; opacity:.85; }
.donut{ position:relative; width:160px; height:160px; }
.donut svg{ width:160px; height:160px; }
.donut-ok{ stroke:#22c55e; }
.donut-center{
  position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;
}
.donut-val{ font-size:1.25rem; font-weight:800; color:#111; }
.donut-sub{ color:#6b7280; }

/* ---------- Notifications ---------- */
.notif-list{ display:flex; flex-direction:column; gap:.7rem; }
.notif-item{ background:#f9fafb; padding:.8rem 1rem; border-radius:12px; }
.notif-head{ display:flex; align-items:center; justify-content:space-between; }
.notif-body{ color:#1f2937; margin-top:.15rem; }
.muted{ color:#6b7280; }



/* ---------- Responsive ---------- */
@media (max-width: 980px){
  .row-2 > .card{ grid-column: span 12; }
  .form.inline{ grid-template-columns: 1fr 1fr; }
  .form.inline .grow{ grid-column: 1 / -1; }
  .form.inline .block{ grid-column: 1 / -1; }
  .stats{ grid-template-columns: 1fr; }
}
@media (max-width: 720px){
  .page{ padding: 1rem; }
  .invite-code{ font-size:1rem; }
}
</style>
