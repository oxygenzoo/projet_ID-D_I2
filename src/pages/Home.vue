<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <h1>Bienvenue sur <span>Agora CRM</span></h1>
      <p>
        La solution moderne pour les <strong>associations</strong> qui veulent 
        gérer facilement leurs <strong>adhérents</strong>, leurs <strong>cotisations</strong> 
        et leurs <strong>événements</strong>.
      </p>
      <div class="hero-buttons">
        <button class="btn-primary">Découvrir Agora</button>
        <button class="btn-secondary">Se connecter</button>
      </div>
    </section>

    <!-- Fonctionnalités -->
    <section class="features">
      <h2>Ce que vous pouvez faire avec Agora</h2>
      <div class="features-grid">
        <div class="feature-card">
          <h3>Gestion des adhérents</h3>
          <p>Ajoutez, modifiez et suivez vos membres simplement.</p>
        </div>
        <div class="feature-card">
          <h3>Suivi des cotisations</h3>
          <p>Visualisez qui a payé, gérez vos finances en toute clarté.</p>
        </div>
        <div class="feature-card">
          <h3>Organisation d’événements</h3>
          <p>Créez des événements et gérez les inscriptions de vos membres.</p>
        </div>
      </div>
    </section>

    <!-- Pourquoi -->
    <section class="why">
      <h2>Pourquoi choisir Agora ?</h2>
      <p>
        Fini les tableurs compliqués ! Agora centralise tout dans une interface simple, 
        intuitive et accessible depuis n’importe où. 
      </p>
    </section>

    <!-- Nouvelles des associations -->
    <section class="news">
      <!--<h2>Les associations les plus suivies vous donnent des nouvelles</h2>-->
      <h2>Les dernières actualités </h2>

      <!-- État : chargement -->
      <div v-if="loading" class="state">
        <div class="spinner"></div>
        <p>Chargement des actualités...</p>
      </div>

      <!-- État : erreur -->
      <div v-else-if="error" class="state error">
        <p>Erreur : {{ error }}</p>
        <button class="btn" @click="fetchNews">Réessayer</button>
      </div>

      <!-- État : vide -->
      <div v-else-if="!news.length" class="state empty">
        <p>Aucune actualité disponible pour le moment.</p>
      </div>

      <!-- État : succès -->
      <div v-else class="news-grid">
        <div v-for="article in news" :key="article.id" class="news-card">
          <h3>{{ article.title }}</h3>
          <p>{{ article.body }}</p>
          <small class="muted">Publié récemment</small>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { globalActions } from '@/store/useGlobal'

// grandes assos très suivies (ajuste librement)
const ORGS = [
  "UNICEF", "Médecins Sans Frontières", "MSF",
  "WWF", "Croix-Rouge", "IFRC", "Greenpeace",
  "Secours Populaire", "Emmaüs"
]

export default {
  name: "Home",
  setup() {
    const news = ref([])
    const loading = ref(false)
    const error = ref('')

    function stripHtml(html) {
      return (html || '').replace(/<[^>]+>/g, '').trim()
    }

    async function fetchNews() {
      try {
        loading.value = true
        error.value = ''
        globalActions.setLoading(true)

        const apiKey = import.meta.env.VITE_GUARDIAN_API_KEY
        if (!apiKey) throw new Error("API key The Guardian manquante")

        // requête: (org1 OR org2 OR ...)
        const query = ORGS.map(o => `"${o}"`).join(" OR ")
        const url = new URL("https://content.guardianapis.com/search")
        url.searchParams.set("q", query)
        url.searchParams.set("order-by", "newest")
        url.searchParams.set("page-size", "10")
        url.searchParams.set("show-fields", "trailText") // petit résumé HTML
        url.searchParams.set("api-key", apiKey)

        const res = await fetch(url.toString(), { cache: 'no-store' })
        if (!res.ok) {
          if (res.status === 429) throw new Error("Quota Guardian dépassé, réessaie plus tard.")
          throw new Error("Erreur HTTP " + res.status)
        }
        const data = await res.json()

        // adapte aux champs attendus par ton template (id, title, body)
        news.value = (data.response?.results || []).slice(0, 4).map((it, i) => ({
          id: `${it.id}-${i}`,
          title: it.webTitle,
          body: stripHtml(it.fields?.trailText) || "Voir l'article",
          url: it.webUrl
        }))
      } catch (e) {
        error.value = e.message || 'Impossible de charger les actualités.'
      } finally {
        loading.value = false
        globalActions.setLoading(false)
      }
    }

    onMounted(fetchNews)
    return { news, loading, error, fetchNews }
  }
}
</script>


<style>
/* Hero section */
.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: #f9fafb;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #1e3a8a;
}

.hero h1 span {
  color: #2563eb;
}

.hero p {
  font-size: 1.2rem;
  max-width: 700px;
  margin: 0 auto 2rem;
  color: #374151;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-primary, .btn-secondary {
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary {
  background: #2563eb;
  color: white;
}
.btn-primary:hover { background: #1d4ed8; }

.btn-secondary {
  background: white;
  border: 2px solid #2563eb;
  color: #2563eb;
}
.btn-secondary:hover { background: #e0e7ff; }

/* Features */
.features {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
}
.features h2 {
  font-size: 1.8rem;
  margin-bottom: 2rem;
  color: #1e40af;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
.feature-card {
  background: #f9fafb;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  text-align: center;
}
.feature-card h3 {
  margin-bottom: 0.5rem;
  color: #2563eb;
}

/* Why section */
.why {
  text-align: center;
  padding: 3rem 2rem;
  background: #f3f4f6;
}
.why h2 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
  color: #1e40af;
}
.why p {
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
  color: #374151;
}

/* --- Actus Section --- */
.news {
  text-align: center;
  padding: 3rem 2rem;
  background: #fff;
}
.news h2 {
  font-size: 1.8rem;
  margin-bottom: 2rem;
  color: #1e3a8a;
}

.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
.news-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  text-align: left;
}
.news-card h3 {
  color: #2563eb;
  margin: 0 0 0.5rem;
}
.news-card p {
  color: #374151;
  font-size: .95rem;
  margin-bottom: 0.5rem;
}
.muted {
  color: #6b7280;
  font-size: 0.85rem;
}

/* États */
.state {
  text-align: center;
  color: #4b5563;
  padding: 2rem 0;
}
.state.error { color: #dc2626; }
.state.empty { color: #6b7280; }

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}
@keyframes spin { to { transform: rotate(360deg); } }

.btn {
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
}
.btn:hover { background: #1d4ed8; }

/* Footer */
.footer {
  text-align: center;
  padding: 1rem;
  background: #2563eb;
  color: white;
  margin-top: 2rem;
}
</style>
