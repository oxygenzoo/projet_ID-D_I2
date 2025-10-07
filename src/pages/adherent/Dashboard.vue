<template>
  <div class="page">
    <!-- =================== HEADER =================== -->
    <header class="header">
      <h1>Mon espace adhérent</h1>
      <p>Gérez vos informations, vos associations, vos cotisations et vos événements.</p>
    </header>

    <!-- =================== LIGNE 1 : PROFIL + NOTIFS =================== -->
    <div class="row row-one">
      <!-- Profil -->
      <section class="card section profile">
        <div class="profile-media">
          <div v-if="user.photo" class="profile-photo">
            <img :src="user.photo" alt="Photo de profil" />
          </div>
          <div v-else class="profile-avatar">
            {{ getInitials(user.full_name) }}
          </div>

          <div v-if="editProfile" class="photo-actions">
            <label for="photoUpload" class="btn tiny outline">Changer la photo</label>
            <input id="photoUpload" type="file" accept="image/*" @change="onPhotoSelected" hidden />
          </div>
        </div>

        <div class="profile-info">
          <div class="section-title">
            <h2>Mon profil</h2>
            <button class="btn tiny" @click="toggleEdit">
              {{ editProfile ? 'Enregistrer' : 'Modifier mon profil' }}
            </button>
          </div>

          <!-- Affichage simple -->
          <div v-if="!editProfile" class="profile-read">
            <ul>
              <li><span>Nom</span><strong>{{ user.full_name }}</strong></li>
              <li><span>Email</span><strong>{{ user.email }}</strong></li>
              <li><span>Rôle</span><strong>{{ user.role }}</strong></li>
            </ul>
          </div>

          <!-- Mode édition -->
          <div v-else class="profile-edit">
            <label>
              <span>Nom</span>
              <input v-model="userDraft.full_name" type="text" />
            </label>
            <label>
              <span>Email</span>
              <input v-model="userDraft.email" type="email" />
            </label>
          </div>
        </div>
      </section>

      <!-- Notifications -->
      <section class="card section notifications">
        <div class="section-title">
          <h2>Notifications récentes</h2>
        </div>
        <div class="notif-list">
          <div v-for="n in notifications" :key="n.id" class="notif-item">
            <span class="dot"></span>
            <div class="notif-body">
              <p class="notif-text">{{ n.message }}</p>
              <small class="muted">{{ n.created_at }}</small>
            </div>
          </div>
          <p v-if="!notifications.length" class="muted">Aucune notification pour le moment.</p>
        </div>
      </section>
    </div>

    <!-- =================== LIGNE 2 : ASSOCIATIONS =================== -->
    <section class="card section associations">
      <div class="section-title">
        <h2>Mes associations</h2>
        <div class="inline-actions">
          <input
            v-if="joinOpen"
            v-model="joinCode"
            type="text"
            placeholder="Code d’association"
            class="code-input"
          />
          <button class="btn tiny" @click="joinOpen ? joinAssociation() : (joinOpen = true)">
            {{ joinOpen ? 'Valider' : '+ Rejoindre' }}
          </button>
          <button v-if="joinOpen" class="btn tiny ghost" @click="cancelJoin">Annuler</button>
        </div>
      </div>

      <ul class="asso-list">
        <li v-for="asso in associations" :key="asso.id">
          <div class="asso-main">
            <h3>{{ asso.name }}</h3>
            <p class="muted">{{ asso.description }}</p>
          </div>
          <div class="asso-actions">
            <button class="btn tiny outline" @click="goToAssociation(asso.id)">Voir</button>
          </div>
        </li>
      </ul>

      <p v-if="!associations.length" class="muted">
        Vous n’appartenez à aucune association pour l’instant.
      </p>
    </section>

    <!-- =================== LIGNE 3 : COTISATIONS + ÉVÉNEMENTS =================== -->
    <div class="row row-two">
      <!-- Cotisations -->
      <section class="card section">
        <div class="section-title">
          <h2>Mes cotisations</h2>
          <router-link to="/adherent/cotisations" class="btn tiny outline">Voir toutes</router-link>
        </div>

        <ul class="coti-list">
          <li v-for="c in cotisations" :key="c.id">
            <div class="coti-head">
              <span class="coti-name">{{ c.association }}</span>
              <span class="coti-amount">{{ c.amount }} €</span>
            </div>
            <div class="progress">
              <div
                class="bar"
                :class="c.paid ? 'ok' : 'pending'"
                :style="{ width: c.paid ? '100%' : c.progress + '%' }"
              ></div>
            </div>
            <small class="muted">{{ c.paid ? 'Payée' : 'En attente' }}</small>
          </li>
        </ul>

        <p v-if="!cotisations.length" class="muted">Aucune cotisation pour le moment.</p>
      </section>

      <!-- Événements -->
      <section class="card section">
        <div class="section-title">
          <h2>Prochains événements</h2>
          <router-link to="/adherent/evenements" class="btn tiny outline">Voir tous</router-link>
        </div>

        <div class="event-list">
          <div v-for="e in events" :key="e.id" class="event-item">
            <div class="event-info">
              <h3>{{ e.name }}</h3>
              <div class="event-meta">
                <span class="muted">{{ e.date }}</span>
                <span class="badge">{{ e.association }}</span>
              </div>
            </div>
            <button class="btn tiny outline" @click="toggleRegistration(e)">
              {{ e.registered ? 'Se désinscrire' : 'S’inscrire' }}
            </button>
          </div>
        </div>

        <p v-if="!events.length" class="muted">Aucun événement à venir.</p>
      </section>
    </div>
  </div>
</template>

<script>
import { supabase } from '@/lib/supabase'

export default {
  name: 'DashboardAdherent',
  data() {
    return {
      editProfile: false,
      joinOpen: false,
      joinCode: '',
      user: { id: '', full_name: '', email: '', role: 'Adhérent', photo: '' },
      userDraft: { full_name: '', email: '' },
      associations: [],
      cotisations: [],
      events: [],
      notifications: []
    }
  },
  async created() {
    await this.loadAll()
  },
  methods: {
    // ============================================================
    // =============== CHARGEMENT COMPLET DU DASHBOARD ============
    // ============================================================
    async loadAll() {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError || !userData?.user) return
        const user = userData.user

        // 1️ Profil de base
        this.user.id = user.id
        this.user.email = user.email

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role, photo_url')
          .eq('id', user.id)
          .single()

        if (profile) {
          this.user.full_name = profile.full_name
          this.user.role = profile.role || 'Adhérent'
          this.user.photo = profile.photo_url
        }

        // 2️ Associations liées à cet utilisateur
        const { data: assos } = await supabase
          .from('adherents_associations')
          .select('associations(id, name, description)')
          .eq('adherent_id', user.id)
        this.associations = assos?.map(a => a.associations) || []

        // 3️ Cotisations
        const { data: cotis } = await supabase
          .from('cotisations')
          .select('id, association_name, amount, status, progress')
          .eq('adherent_id', user.id)
          .order('created_at', { ascending: false })
        this.cotisations =
          cotis?.map(c => ({
            id: c.id,
            association: c.association_name,
            amount: c.amount,
            paid: c.status === 'paid',
            progress: c.progress ?? (c.status === 'paid' ? 100 : 40)
          })) || []

        // 4️ Événements (filtrés par les associations de l'utilisateur)
        const { data: evts } = await supabase
          .from('evenements')
          .select('id, name, date, association_name')
          .in('association_name', this.associations.map(a => a.name))
          .order('date', { ascending: true })
        this.events =
          evts?.map(e => ({
            id: e.id,
            name: e.name,
            date: new Date(e.date).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            }),
            association: e.association_name,
            registered: false
          })) || []

        // 5️ Notifications
        const { data: notifs } = await supabase
          .from('notifications')
          .select('id, message, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
        this.notifications =
          notifs?.map(n => ({
            id: n.id,
            message: n.message,
            created_at: new Date(n.created_at).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'long'
            })
          })) || []
      } catch (err) {
        console.error('Erreur Supabase:', err)
      }
    },

    // ============================================================
    // =============== PROFIL : MODIFIER / SAUVER =================
    // ============================================================
    toggleEdit() {
      if (!this.editProfile) {
        this.userDraft = { full_name: this.user.full_name, email: this.user.email }
        this.editProfile = true
      } else this.saveProfile()
    },

    async saveProfile() {
      this.user.full_name = this.userDraft.full_name.trim()
      this.user.email = this.userDraft.email.trim()
      await supabase
        .from('profiles')
        .update({
          full_name: this.user.full_name,
          email: this.user.email,
          photo_url: this.user.photo
        })
        .eq('id', this.user.id)
      this.editProfile = false
    },

    // ============================================================
    // =============== UPLOAD PHOTO DE PROFIL =====================
    // ============================================================
    onPhotoSelected(e) {
      const file = e.target.files?.[0]
      if (!file) return
      const path = `avatars/${this.user.id}-${Date.now()}.jpg`
      supabase.storage.from('avatars').upload(path, file, { upsert: true }).then(async ({ data, error }) => {
        if (!error && data) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
          const publicUrl = urlData.publicUrl
          this.user.photo = publicUrl
          await supabase.from('profiles').update({ photo_url: publicUrl }).eq('id', this.user.id)
        }
      })
    },

    // ============================================================
    // =============== ASSOCIATIONS : REJOINDRE ===================
    // ============================================================
    cancelJoin() {
      this.joinCode = ''
      this.joinOpen = false
    },

    async joinAssociation() {
      if (!this.joinCode.trim()) return
      const { data: asso } = await supabase
        .from('associations')
        .select('id, name, description')
        .eq('join_code', this.joinCode.trim())
        .single()
      if (asso) {
        await supabase.from('adherents_associations').insert({
          adherent_id: this.user.id,
          association_id: asso.id
        })
        this.associations.push(asso)
      }
      this.cancelJoin()
    },

    // ============================================================
    // =============== ÉVÉNEMENTS : INSCRIPTION ===================
    // ============================================================
    toggleRegistration(e) {
      e.registered = !e.registered
      // TODO: connect to table “participants” later
    },

    // ============================================================
    // =============== UTILITAIRE ================================
    // ============================================================
    getInitials(name) {
      if (!name) return '?'
      const parts = name.trim().split(' ')
      const first = parts[0]?.[0]?.toUpperCase() || ''
      const last = parts.length > 1 ? parts[parts.length - 1][0]?.toUpperCase() : ''
      return first + last
    },

    goToAssociation(id) {
      this.$router.push({ path: `/association/${id}` })
    }
  }
}
</script>


<style scoped>
/* ---------- Layout de page ---------- */
.page{
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
.header{ margin-bottom: 1.75rem; }
.header h1{ color:#111; font-size:1.8rem; margin:0 0 .35rem; }
.header p{ color:#555; margin:0; }

/* ---------- Grid ---------- */
.row{
  display:grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.25rem;
  margin-bottom: 1.25rem;
}
.row-one .profile{ grid-column: span 7; }
.row-one .notifications{ grid-column: span 5; }

/* marge entre Associations et la ligne suivante */
.associations{ margin-bottom: 1.5rem; }

.row-two section{
  grid-column: span 6;
}

/* ---------- Cartes ---------- */
.card{
  background:#fff;
  border-radius: 12px;
  padding: 1.1rem;
  box-shadow: 0 8px 18px rgba(0,0,0,.06);
}

/* ---------- Titres & actions ---------- */
.section-title{
  display:flex; align-items:center; justify-content:space-between; gap:.75rem;
  margin-bottom: 1rem;
}
.section h2{ color:#111; font-size:1.2rem; margin:0; }

.inline-actions{ display:flex; align-items:center; gap:.5rem; }
.code-input{
  height:36px; padding:0 .6rem; border:1px solid #d7dbe3; border-radius:8px; outline:none;
}

/* ---------- Profil ---------- */
.profile{
  display:flex; flex-direction:column; align-items:center;
}
.profile-media{
  display:flex; flex-direction:column; align-items:center; justify-content:flex-start; gap:.5rem;
  margin-bottom: .8rem;
}
.profile-media img{
  width: 140px; height: 140px; border-radius: 50%; object-fit: cover; background:#f2f4f7;
  box-shadow: 0 2px 8px rgba(0,0,0,.08);
}

.profile-photo img {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  background: #f2f4f7;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.profile-avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  font-weight: 700;
  font-size: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}


.photo-actions{ display:flex; gap:.5rem; }

.profile-info{ width:100%; display:flex; flex-direction:column; gap:.8rem; }
.profile-read ul{ list-style:none; padding:0; margin:0; }
.profile-read li{ display:flex; align-items:center; justify-content:space-between; padding:.45rem 0; border-bottom:1px solid #f0f2f6; }
.profile-read li span{ color:#6b7280; }
.profile-edit{ display:grid; grid-template-columns:1fr; gap:.6rem; }
.profile-edit input{ height:38px; border:1px solid #d7dbe3; border-radius:8px; padding:0 .6rem; }

/* ---------- Notifications ---------- */
.notif-list{ display:flex; flex-direction:column; gap:.7rem; }
.notif-item{
  display:flex; gap:.6rem; align-items:flex-start; background:#f9fafb; border-radius:10px; padding:.75rem .9rem;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}
.dot{ width:8px; height:8px; border-radius:50%; background:#2563eb; margin-top:.35rem; }
.notif-text{ margin:0 0 .15rem; color:#1f2937; }
.muted{ color:#6b7280; }

/* ---------- Associations ---------- */
.asso-list{ list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:.75rem; }
.asso-list li{
  display:flex; align-items:center; justify-content:space-between; gap:1rem;
  background:#f9fafb; border-radius:10px; padding:.85rem 1rem;
}
.asso-main h3{ margin:0 0 .2rem; color:#111; font-size:1rem; }
.asso-actions{ display:flex; gap:.5rem; }

/* ---------- Cotisations ---------- */
.coti-list{ list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:.8rem; }
.coti-head{ display:flex; justify-content:space-between; align-items:center; }
.coti-name{ font-weight:600; }
.coti-amount{ color:#111; }
.progress{ background:#e5e7eb; height:6px; border-radius:4px; overflow:hidden; margin:.35rem 0; }
.bar{ height:100%; border-radius:4px; }
.bar.ok{ background:#22c55e; }
.bar.pending{ background:#facc15; }

/* ---------- Événements ---------- */
.event-list{ display:flex; flex-direction:column; gap:.8rem; }
.event-item{
  display:flex; align-items:center; justify-content:space-between; gap:1rem;
  background:#f9fafb; border-radius:10px; padding:.85rem 1rem;
}
.event-item h3{ margin:0; font-size:1rem; color:#111; }
.event-meta{ display:flex; gap:.6rem; align-items:center; margin-top:.25rem; }
.badge{ background:#eef2ff; color:#3745a3; border-radius:999px; padding:.1rem .5rem; font-size:.75rem; }

/* ---------- Boutons / liens ---------- */
.btn {
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 10px;
  height: 34px;
  padding: 0 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
}
.btn:hover {
  background: #1e40af;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
}
.btn.tiny {
  height: 30px;
  padding: 0 12px;
  font-size: 0.9rem;
}
.btn.ghost {
  background: transparent;
  color: #2563eb;
  border: 1.5px solid transparent;
}
.btn.ghost:hover {
  background: #f3f6ff;
  border-color: #2563eb;
}
.btn.outline {
  background: #fff;
  color: #1f3c8f;
  border: 1.5px solid #2563eb;
  transition: all 0.2s ease-in-out;
}
.btn.outline:hover {
  background: #2563eb;
  color: #fff;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
}

/* ---------- Liens "Voir toutes / Voir tous" ---------- */
.link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1.5px solid #2563eb;
  color: #1f3c8f;
  border-radius: 8px;
  padding: 6px 16px;
  font-weight: 600;
  text-decoration: none !important;
  transition: all 0.2s ease-in-out;
  height: 34px;
  box-sizing: border-box;
}
.link:hover {
  background: #2563eb;
  color: #fff;
  text-decoration: none !important;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
}



/* ---------- Responsive ---------- */
@media (max-width: 980px){
  .row-one .profile{ grid-column: span 12; }
  .row-one .notifications{ grid-column: span 12; }
  .row-two section{ grid-column: span 12; margin-bottom: 1rem; } /* marge entre les deux blocs */
}
@media (max-width: 720px){
  .page{ padding: 1rem; }
  .profile-media img{ width:120px; height:120px; }
  .row{ grid-template-columns: 1fr; }
}
</style>
