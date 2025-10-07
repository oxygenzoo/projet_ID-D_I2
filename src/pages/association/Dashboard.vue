<template>
  <div class="page">
    <!-- En-tête -->
    <header class="header">
      <h1>Tableau de bord association</h1>
      <p>Gérez votre association : membres, cotisations, événements et communication.</p>
    </header>

    <!-- Ligne 1 : Profil + Adhérents -->
    <div class="row row-2">
      <!-- PROFIL -->
      <section class="card" :class="{ loading: loading.profile }">
        <div class="section-title">
          <h2>Profil de l’association</h2>
          <button class="btn outline tiny" @click="editProfile = !editProfile">
            {{ editProfile ? 'Fermer' : 'Modifier le profil' }}
          </button>
        </div>

        <div class="profile">
          <div class="avatar-big">{{ assoInitials || '?' }}</div>

          <div class="invite">
            <div class="invite-label">Code d’invitation</div>
            <div class="invite-code">{{ association.join_code || '—' }}</div>
            <small class="muted">Partagez ce code pour que des adhérents rejoignent votre association.</small>
          </div>
        </div>

        <div v-if="!editProfile" class="kv">
          <div class="kv-row"><span>Nom</span><strong>{{ association.name }}</strong></div>
          <div class="kv-row"><span>Email</span><strong>{{ association.email }}</strong></div>
          <div class="kv-row"><span>Description</span><strong>{{ association.description }}</strong></div>
        </div>

        <form v-else class="form" @submit.prevent="saveProfile">
          <label><span>Nom</span><input v-model="profileDraft.name" /></label>
          <label><span>Email</span><input v-model="profileDraft.email" /></label>
          <label><span>Description</span><textarea v-model="profileDraft.description"></textarea></label>
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
            <input class="input" v-model="memberSearch" placeholder="Rechercher un adhérent" />
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
              <strong>{{ m.full_name }}</strong> — {{ m.email }}
              <div class="m-controls">
                <select v-model="m.role" @change="updateMemberRole(m)">
                  <option value="président">Président</option>
                  <option value="trésorier">Trésorier</option>
                  <option value="secrétaire">Secrétaire</option>
                  <option value="coach">Coach</option>
                  <option value="membre-actif">Membre actif</option>
                  <option value="membre">Membre</option>
                </select>
                <button class="btn tiny outline" @click="remindMember(m)">Relancer</button>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="muted">Aucun adhérent trouvé.</p>
      </section>
    </div>

    <!-- Ligne 2 : Cotisations + Événements -->
    <div class="row row-2">
      <!-- COTISATIONS -->
      <section class="card" :class="{ loading: loading.dues }">
        <div class="section-title">
          <h2>Mes cotisations</h2>
          <button class="btn outline tiny" @click="showCreateDue = !showCreateDue">
            {{ showCreateDue ? 'Fermer' : '+ Créer' }}
          </button>
        </div>

        <form v-if="showCreateDue" class="form inline" @submit.prevent="createDue">
          <input v-model="dueDraft.title" placeholder="Nom de la cotisation" required />
          <input v-model.number="dueDraft.amount" type="number" min="0" step="1" placeholder="Montant (€)" required />
          <input v-model="dueDraft.deadline" type="date" required />
          <button type="submit" class="btn">Enregistrer</button>
        </form>

        <div v-if="dues.length" class="table">
          <div class="t-head">
            <div>Nom</div>
            <div class="right">Montant</div>
            <div class="right w-180">Échéance</div>
            <div class="right w-140">Statut</div>
            <div class="right w-160">Paiement</div>
          </div>
          <div v-for="d in dues" :key="d.id" class="t-row">
            <div>{{ d.title }}</div>
            <div class="right">{{ d.amount }} €</div>
            <div class="right w-180">{{ formatDate(d.deadline) }}</div>
            <div class="right w-140">
              <span :class="['pill', d.status==='paid' ? 'ok' : 'warn']">{{ d.status }}</span>
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

        <form v-if="showCreateEvent" class="form inline" @submit.prevent="createEvent">
          <input v-model="eventDraft.name" placeholder="Nom" required />
          <input v-model="eventDraft.date" type="date" required />
          <textarea v-model="eventDraft.description" rows="2" placeholder="Description"></textarea>
          <button type="submit" class="btn">Enregistrer</button>
        </form>

        <div v-if="events.length" class="event-list">
          <div v-for="e in events" :key="e.id" class="event-item">
            <strong>{{ e.name }}</strong> — {{ e.date_fmt }}
            <p class="muted">{{ e.description }}</p>
          </div>
        </div>
        <p v-else class="muted">Aucun événement à venir.</p>
      </section>
    </div>

    <!-- Ligne 3 : Statistiques + Notifications -->
    <div class="row row-2">
      <section class="card">
        <div class="section-title"><h2>Statistiques</h2></div>
        <div class="stat-grid">
          <StatCard title="Adhérents actifs" :value="stats.membersCount" description="Total membres actifs" />
          <StatCard title="Événements à venir" :value="stats.eventsCount" description="Prévu ce mois-ci" />
          <StatCard title="Taux de paiement" :value="stats.paymentRate" description="Cotisations réglées" format="percent" />
        </div>
      </section>

      <!-- NOTIFICATIONS -->
      <section class="card">
        <div class="section-title">
          <h2>Notifications envoyées</h2>
          <button class="btn outline tiny" @click="showSendNotif = !showSendNotif">
            {{ showSendNotif ? 'Fermer' : '+ Envoyer' }}
          </button>
        </div>

        <form v-if="showSendNotif" class="form inline" @submit.prevent="sendNotification">
          <input v-model="notifDraft.title" placeholder="Titre" required />
          <textarea v-model="notifDraft.message" placeholder="Message" rows="2" required></textarea>
          <div class="form-actions">
            <button type="button" class="btn ghost" @click="showSendNotif=false">Annuler</button>
            <button type="submit" class="btn">Envoyer</button>
          </div>
        </form>

        <div v-if="notifications.length" class="notif-list">
          <div v-for="n in notifications" :key="n.id" class="notif-item">
            <strong>{{ n.title }}</strong>
            <p>{{ n.message }}</p>
            <small class="muted">{{ n.date_fmt }}</small>
          </div>
        </div>
        <p v-else class="muted">Aucune notification récente.</p>
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
      association: { id: null, name: '', email: '', description: '', join_code: '' },
      profileDraft: { name: '', email: '', description: '' },
      editProfile: false,
      user: { id: '', email: '' },
      members: [],
      dues: [],
      events: [],
      notifications: [],
      showCreateDue: false,
      showCreateEvent: false,
      showSendNotif: false,
      dueDraft: { title: '', amount: 0, deadline: '' },
      eventDraft: { name: '', date: '', description: '' },
      notifDraft: { title: '', message: '' },
      stats: { membersCount: 0, eventsCount: 0, paymentRate: 0 },
      loading: { profile: false, members: false, dues: false, events: false, notifications: false },
      memberSearch: '',
      memberFilter: 'all'
    }
  },
  computed: {
    assoInitials() { return this.getInitials(this.association.name) },
    filteredMembers() {
      let list = [...this.members]
      const q = this.memberSearch.toLowerCase()
      if (this.memberSearch) list = list.filter(m => m.full_name.toLowerCase().includes(q))
      if (this.memberFilter !== 'all') list = list.filter(m => m.status === this.memberFilter)
      return list
    }
  },
  async created() { await this.init() },
  methods: {
    async init() {
      const { data: uData } = await supabase.auth.getUser()
      if (uData?.user) {
        this.user.id = uData.user.id
        this.user.email = uData.user.email
      }
      await this.fetchAssociation()
      if (!this.association?.id) return
      await Promise.all([this.fetchMembers(), this.fetchDues(), this.fetchEvents(), this.fetchNotifications()])
      this.computeStats()
    },

    async fetchAssociation() {
      this.loading.profile = true
      const { data } = await supabase.from('associations').select('*').eq('owner_id', this.user.id).single()
      this.association = data || {}
      this.profileDraft = { ...this.association }
      this.loading.profile = false
    },
    async fetchMembers() {
      if (!this.association?.id) return
      const { data } = await supabase
        .from('adherents_associations')
        .select('role, status, profiles:adherent_id(id, full_name, email)')
        .eq('association_id', this.association.id)
      this.members = data?.map(r => ({
        id: r.profiles.id,
        full_name: r.profiles.full_name,
        email: r.profiles.email,
        role: r.role,
        status: r.status
      })) || []
      this.stats.membersCount = this.members.length
    },
    async fetchDues() {
      if (!this.association?.id) return
      const { data } = await supabase
        .from('cotisations')
        .select('*')
        .eq('association_id', this.association.id)
        .order('created_at', { ascending: false })
      this.dues = data.map(d => ({
        ...d,
        rate: d.total_count ? Math.round((d.paid_count / d.total_count) * 100) : 0
      }))
      const paid = this.dues.filter(d => d.status === 'paid').length
      this.stats.paymentRate = this.dues.length ? Math.round((paid / this.dues.length) * 100) : 0
    },
    async fetchEvents() {
      if (!this.association?.id) return
      const { data } = await supabase
        .from('evenements')
        .select('*')
        .eq('association_id', this.association.id)
        .order('date', { ascending: true })
      this.events = data.map(e => ({ ...e, date_fmt: new Date(e.date).toLocaleDateString('fr-FR') }))
      this.stats.eventsCount = this.events.length
    },
    async fetchNotifications() {
      if (!this.association?.id) return
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('association_id', this.association.id)
        .order('created_at', { ascending: false })
        .limit(10)
      this.notifications = data.map(n => ({
        ...n,
        date_fmt: new Date(n.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })
      }))
    },

    computeStats() { /* stats calculées directement dans les fetchers */ },

    // --- COTISATION ---
    async createDue() {
      const payload = {
        association_id: this.association.id,
        title: this.dueDraft.title,
        amount: this.dueDraft.amount,
        deadline: this.dueDraft.deadline,
        status: 'open',
        paid_count: 0,
        total_count: this.members.length
      }
      await supabase.from('cotisations').insert(payload)
      this.showCreateDue = false
      await this.fetchDues()
    },

    // --- ÉVÉNEMENTS ---
    async createEvent() {
      const payload = {
        association_id: this.association.id,
        name: this.eventDraft.name,
        date: this.eventDraft.date,
        description: this.eventDraft.description
      }
      await supabase.from('evenements').insert(payload)
      this.showCreateEvent = false
      await this.fetchEvents()
    },

    // --- NOTIFICATIONS ---
    async sendNotification() {
      const payload = {
        association_id: this.association.id,
        title: this.notifDraft.title,
        message: this.notifDraft.message
      }
      await supabase.from('notifications').insert(payload)
      this.showSendNotif = false
      await this.fetchNotifications()
    },

    // --- OUTILS ---
    getInitials(n) { if (!n) return '?'; const p = n.split(' '); return (p[0][0] + (p[1]?.[0] || '')).toUpperCase() },
    formatDate(d) { return new Date(d).toLocaleDateString('fr-FR') }
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
